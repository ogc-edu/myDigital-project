import { verifyToken } from '../src/middleware/verifyToken.js';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

describe('Token Middleware verification', () => {
  let req, res, next;  //used in middleware tests

  beforeEach(() => {    //reset value everytime before each test
    req = {
      headers: {}  //empty headers
    };
    res = {
      status: jest.fn().mockReturnThis(), //return res.status(401).json()
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should return error 401 unauthorized if no headers are present', () => {
    verifyToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);   //expect called res.status() with 401 auauthorized
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
  });

  it('should return error 401 if token is missing in auth header', () => {
    req.headers['authorization'] = 'Bearer';
    verifyToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should call next() if token is valid', () => {
    const mockPayload = { id: '123', username: 'testuser' };
    req.headers['authorization'] = 'Bearer validtoken';
    jwt.verify.mockReturnValue(mockPayload);

    verifyToken(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('validtoken', process.env.JWT_SECRET);
    expect(req.user).toEqual(mockPayload);
    expect(next).toHaveBeenCalled();
  });

  it('should return 403 if token is invalid', () => {
    req.headers['authorization'] = 'Bearer invalidtoken';
    jwt.verify.mockImplementation(() => {   //mock jwt verification failed for fake token
      throw new Error('Invalid token');
    });

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid Token' });
  });
});
