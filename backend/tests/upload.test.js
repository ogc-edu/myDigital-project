import request from 'supertest';
import app from '../src/app.js';
import Image from '../src/models/Image.js';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';

// Mock dependencies
jest.mock('../src/config/db.js', () => ({
  define: jest.fn(),    //models
  authenticate: jest.fn(),  //sequelize.authenticate to creat db connections
}));

jest.mock('../src/models/Image.js', () => ({
  create: jest.fn(),
  findAll: jest.fn(),
}));

jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload: jest.fn(),
    },
  },
}));

// We need to mock multer because it's used in imgFilter middleware
jest.mock('multer', () => {
  const multer = () => ({
    single: () => (req, res, next) => {
      // Simulate multer's behavior by attaching file info to req if requested in the test
      if (req.headers['simulate-no-file']) {
        return next(); //pass to next middleware with no headers
      }
      req.file = {
        path: 'http://cloudinary.com/image.jpg',
        originalname: 'test.png',
        mimetype: 'image/png',
        size: 1024,
      };
      next();
    },
  });
  return multer;
});

jest.mock('multer-storage-cloudinary', () => ({
  CloudinaryStorage: jest.fn(),
}));

jest.mock('jsonwebtoken');

describe('Image Upload Endpoint', () => {
  const mockToken = 'mocked-jwt-token';
  const mockUser = { id: 'uuid', username: 'testuser' };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  it('should upload an image successfully', async () => {

    jwt.verify.mockReturnValue(mockUser);

    Image.create.mockResolvedValue({
      image_url: 'http://cloudinary.com/image.jpg',
    });

    const res = await request(app)
      .post('/api/images/upload')
      .set('Authorization', `Bearer ${mockToken}`)
      .attach('image', Buffer.from('fake-image-content'), 'test.png');

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'Image uploaded successfully');
    expect(res.body).toHaveProperty('imageLink', 'http://cloudinary.com/image.jpg');
    
    expect(Image.create).toHaveBeenCalledWith(expect.objectContaining({
      image_url: 'http://cloudinary.com/image.jpg',
      user_id: mockUser.id,
      public_id: 'test.png',
      image_type: 'image/png',
      image_size: 1024,
    }));
  });

  it('should return 400 if no file is uploaded', async () => {
    jwt.verify.mockReturnValue(mockUser);

    const res = await request(app)
      .post('/api/images/upload')
      .set('Authorization', `Bearer ${mockToken}`)
      .set('simulate-no-file', 'true');

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error', 'No file uploaded');
  });

  it('should return 500 if database creation fails', async () => {
    jwt.verify.mockReturnValue(mockUser);
    Image.create.mockRejectedValue(new Error('DB Error'));

    const res = await request(app)
      .post('/api/images/upload')
      .set('Authorization', `Bearer ${mockToken}`)
      .attach('image', Buffer.from('fake-image-content'), 'test.png');

    expect(res.statusCode).toEqual(500);
    expect(res.body).toHaveProperty('error', 'Database error');
  });

  it('should return 401 if no token is provided', async () => {
    const res = await request(app)
      .post('/api/images/upload')
      .attach('image', Buffer.from('fake-image-content'), 'test.png');

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('error', 'Unauthorized');
  });
});

describe('User Image', () => {
  const mockToken = 'mocked-jwt-token';
  const mockUser = { id: 'uuid', username: 'testuser' };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  it('Should return all user images', async() => {
    jwt.verify.mockReturnValue(mockUser);
    const mockImages = [
      { id: '1', image_url: 'http://example.com/1.jpg', user_id: mockUser.id },
      { id: '2', image_url: 'http://example.com/2.jpg', user_id: mockUser.id },
    ];
    Image.findAll.mockResolvedValue(mockImages);

    const res = await request(app)
      .get('/api/images/getAll')
      .set('Authorization', `Bearer ${mockToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('images');
    expect(res.body.images).toHaveLength(2);
    expect(Image.findAll).toHaveBeenCalledWith({ where: { user_id: mockUser.id } });
  });

  it('should return 500 if database fetch fails', async () => {
    jwt.verify.mockReturnValue(mockUser);
    Image.findAll.mockRejectedValue(new Error('DB Error'));

    const res = await request(app)
      .get('/api/images/getAll')
      .set('Authorization', `Bearer ${mockToken}`);

    expect(res.statusCode).toEqual(500);
    expect(res.body).toHaveProperty('error', 'Internal Server Error');
  });
});
