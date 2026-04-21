import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Image from '../src/models/Image.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cloudinary from '../src/config/cloudinary.js';

// Unified Minimal Mocking
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

describe('Core API Tests', () => {
  const mockUser = { id: 'uuid-123', username: 'testuser', email: 'test@example.com', password: 'hashedPassword' };
  const mockToken = 'mock-jwt-token';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('Authentication', () => {
    test('POST /api/auth/register - Success', async () => {
      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashedPassword');
      User.create.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', username: 'testuser', password: 'password123' });

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('Registration successful');
    });

    test('POST /api/auth/login - Success', async () => {
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue(mockToken);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(res.statusCode).toBe(200);
      expect(res.headers['set-cookie'][0]).toContain('myDigitalToken');
    });
  });

  describe('Images', () => {
    test('POST /api/images/upload - Success', async () => {
      jwt.verify.mockReturnValue({ id: mockUser.id, username: mockUser.username });
      Image.create.mockResolvedValue({ id: 'img-123' });

      const res = await request(app)
        .post('/api/images/upload')
        .set('Authorization', `Bearer ${mockToken}`)
        .attach('image', Buffer.from('fake-data'), 'test.png');

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('Image uploaded successfully');
    });

    test('GET /api/images/getAll - Success', async () => {
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
    });
  });
});
