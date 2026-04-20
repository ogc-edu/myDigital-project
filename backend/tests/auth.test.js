import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

jest.mock('../src/config/db.js', () => ({
  define: jest.fn(),
  authenticate: jest.fn(),
}));
jest.mock('../src/models/User.js', () => ({
  create: jest.fn(),
  findOne: jest.fn(),
}));
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Auth Endpoints', () => {  //auth test suite
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {  //register endpoint test suite
    it('register a new user', async () => { //user registration
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashedPassword');
      User.create.mockResolvedValue({
        email: 'test@gmail.com',
        username: 'testUser',
        password: 'hashedPassword'
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@gmail.com',
          username: 'testUser',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'Registration successful');
      expect(User.create).toHaveBeenCalledWith({
        email: 'test@gmail.com',
        username: 'testUser',
        password: 'hashedPassword',
      });
    });
    it('must return 400 if user creation fails', async () => {
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hash');

      User.create.mockResolvedValue(null);

      const res = await request(app).post('/api/auth/register').send({
        email: 'user@gmail.com',
        username: 'user',
        password: 'password'
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Error register');
    });
  });

  describe('POST /api/auth/login', () => {
    it('users should be able to login with legit credentials', async () => {
      const mockUser = {
        email: 'admin@gmail.com',
        password: 'password'
      };
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mockToken');

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token', 'mockToken');
    });

    it('should return 401 for invalid credentials', async () => {
      User.findOne.mockResolvedValue({ password: 'hashedPassword' }); //user found but wrong password
      bcrypt.compare.mockResolvedValue(false);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error', 'Invalid credentials');
    });

      it('should return 404 if user not found', async () => {
      User.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'notfound@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error', 'User not found');
    });
  });
});
