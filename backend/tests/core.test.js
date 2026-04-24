import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Image from '../src/models/Image.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cloudinary from '../src/config/cloudinary.js';

// module path first param, whole file intercepted with fake version
// module hoisting
jest.mock('../src/config/db.js', () => ({
  define: jest.fn(),
  authenticate: jest.fn(),
  query: jest.fn(),
  sync: jest.fn(),
}));

jest.mock('../src/models/User.js', () => ({
  create: jest.fn(),
  findOne: jest.fn(),
}));

jest.mock('../src/models/Image.js', () => ({
  create: jest.fn(),
  findAll: jest.fn(),
}));

jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../src/config/cloudinary.js', () => {
  const { PassThrough } = require('stream');
  return {
    uploader: {
      upload_stream: jest.fn((options, callback) => {
        const stream = new PassThrough();
        stream.on('finish', () => {
          callback(null, {
            public_id: 'test_public_id',
            secure_url: 'http://cloudinary.com/image.jpg',
            format: 'png',
            width: 100,
            height: 100,
          });
        });
        return stream;
      }),
    },
    url: jest.fn((id) => `http://cloudinary.com/${id}`),
  };
});

describe('Core APIs Tests', () => {
  const mockUser = { id: 'uuid-123', username: 'testuser', email: 'test@example.com', password: 'hashedPassword' };
  const mockToken = 'mock-jwt-token';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('Authentication - Registration, Login', () => {
    test('POST /api/auth/register - Registration Success', async () => {
      User.findOne.mockResolvedValue(null);   //no duplicate user found, hash password success, creation success
      bcrypt.hash.mockResolvedValue('hashedPassword');
      User.create.mockResolvedValue(mockUser);

      const res = request(app)
        .post('/api/auth/register')   //check if route is hit
        .send({ email: 'test@example.com', username: 'testuser', password: 'password123' });

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('Registration successful');
    });

    test('POST /api/auth/login - Login Success', async () => {
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mockToken');

      const res = request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' })

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Login successful');
      expect(res.headers['set-cookie'][0]).toContain('myDigitalToken');
    });

    test('POST /api/auth/login - Login Failed', async () => {
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'fakePassword' });

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Invalid credentials');
      expect(jwt.sign).not.toHaveBeenCalled();    //jwt sign should not be called, res return after failed compare
    });
  });

  describe('Images', () => {
    test('POST /api/images/upload - User upload image success', async () => {
      jwt.verify.mockReturnValue({ id: mockUser.id, username: mockUser.username }); //encode
      Image.create.mockResolvedValue({ id: 'img-UUID' });
      const file = Buffer.from('fake-image');
      const res = await request(app)
        .post('/api/images/upload')
        .set('Cookie', [`myDigitalToken=${mockToken}`])
        .attach('image', file, 'test.png'); //.send to sent body req for words
      //store in Buffer instead of disk storage,
      //supertest sends req content type to multipart/form-data for .attach
      //.field('description', 'my-profile-pic') example of field
      //no need .field because no text data is sent, form only sends file

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('Image uploaded successfully');
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    test('POST /api/images/upload - User upload empty image', async () => {
      jwt.verify.mockReturnValue({ id: mockUser.id, username: mockUser.username });

      //.attach is not used for mock no file attached
      const res = await request(app)
        .post('/api/images/upload')
        .set('Cookie', [`myDigitalToken=${mockToken}`])

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('No file uploaded');
    })

    test('POST /api/images/upload - User upload invalid image type', async () => {
      jwt.verify.mockReturnValue({ id: mockUser.id, username: mockUser.username });

      const res = await request(app)
        .post('/api/images/upload')
        .set('Cookie', [`myDigitalToken=${mockToken}`])
        .attach('image', Buffer.from('text content'), {
          filename: 'malicious.txt',
          contentType: 'text/plain'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Invalid file type');
      expect(res.body.message).toBe('Only JPEG, PNG, and ZIP files are allowed');
    })

    test('POST /api/images/upload - User upload zip file', async () => {
      jwt.verify.mockReturnValue({ id: mockUser.id, username: mockUser.username });
      Image.create.mockResolvedValue({ id: 'img-UUID' });
      const validZipBuffer = Buffer.from(   //or zip.js will actually unzip
        "UEsFBgAAAAAAAAAAAAAAAAAAAAAAAA==",
        "base64"
      );

      const res = await request(app)
        .post('/api/images/upload')
        .set('Cookie', [`myDigitalToken=${mockToken}`])
        .attach('image', validZipBuffer, {
          filename: 'test.zip',
          contentType: 'application/zip'
        })

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('ZIP processed successfully');
    })

    test('POST /api/images/upload - User upload invalid/currupted zip file', async () => {
      jwt.verify.mockReturnValue({ id: mockUser.id, username: mockUser.username });

      const res = await request(app)
        .post('/api/images/upload')
        .set('Cookie', [`myDigitalToken=${mockToken}`])
        .attach('image', Buffer.from('not zip file content'), {   //buffer is wrong, means zip file corrupted
          filename: 'fake.zip',
          contentType: 'application/zip'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Invalid ZIP file');
      expect(res.body.message).toBe('The uploaded zip file is corrupt or invalid.');
    })

    test('GET /api/images/getAll -  User get all image at useEffect()', async () => {
      jwt.verify.mockReturnValue({ id: mockUser.id });
      Image.findAll.mockResolvedValue([
        { id: '1', public_id: 'p1', image_width: 200, image_length: 200 }
      ]);

      const res = await request(app)
        .get('/api/images/getAll')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.images).toHaveLength(1);
      expect(res.body.images[0]).toHaveProperty('thumb32');
      expect(res.body.images[0]).toHaveProperty('thumb64');
      expect(res.body.images[0]).toHaveProperty('original_url');
    });
  });
});
