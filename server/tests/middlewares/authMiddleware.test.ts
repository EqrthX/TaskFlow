import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken, AuthRequest } from '../../src/middlewares/authMiddleware';

jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      cookies: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('authenticateToken', () => {
    it('should return 401 if no token is provided', () => {
      mockReq.cookies = {};

      authenticateToken(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Unauthorized: ไม่พบ Token ใน Cookie',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 if token is invalid', () => {
      mockReq.cookies = { accessToken: 'invalidToken' };

      (jwt.verify as jest.Mock).mockImplementationOnce((token, secret, callback) => {
        callback(new Error('Invalid token'), null);
      });

      authenticateToken(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Forbidden: Token ไม่ถูกต้องหรือหมดอายุ',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should attach user data to request and call next if token is valid', () => {
      mockReq.cookies = { accessToken: 'validToken' };

      const userData = { userId: '1', email: 'test@example.com' };

      (jwt.verify as jest.Mock).mockImplementationOnce((token, secret, callback) => {
        callback(null, userData);
      });

      authenticateToken(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockReq.user).toEqual(userData);
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should handle expired token', () => {
      mockReq.cookies = { accessToken: 'expiredToken' };

      (jwt.verify as jest.Mock).mockImplementationOnce((token, secret, callback) => {
        callback(new Error('Token expired'), null);
      });

      authenticateToken(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Forbidden: Token ไม่ถูกต้องหรือหมดอายุ',
      });
    });

    it('should verify token with correct secret key', () => {
      mockReq.cookies = { accessToken: 'validToken' };

      (jwt.verify as jest.Mock).mockImplementationOnce((token, secret, callback) => {
        callback(null, { userId: '1', email: 'test@example.com' });
      });

      authenticateToken(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith(
        'validToken',
        expect.any(String),
        expect.any(Function)
      );
    });
  });
});
