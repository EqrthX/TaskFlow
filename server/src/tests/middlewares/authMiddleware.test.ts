import { authenticateToken } from '../../middlewares/authMiddleware';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn().mockReturnThis();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    next = jest.fn();
    req = { cookies: {} };
    res = { 
      status: statusMock,
      json: jsonMock
    } as unknown as Response;
    jest.clearAllMocks();
  });

  it('should return 401 if no token provided', () => {
    authenticateToken(req as any, res as Response, next);
    expect(statusMock).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 if token is invalid', () => {
    req.cookies = { accessToken: 'invalid_token' };
    (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
      callback(new Error('Invalid token'), null);
    });

    authenticateToken(req as any, res as Response, next);
    expect(statusMock).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next() and attach user if token is valid', () => {
    req.cookies = { accessToken: 'valid_token' };
    const mockUser = { userId: '1', email: 'test@test.com' };

    (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
      callback(null, mockUser);
    });

    authenticateToken(req as any, res as Response, next);
    
    expect(next).toHaveBeenCalled();
    expect((req as any).user).toEqual(mockUser);
    expect(statusMock).not.toHaveBeenCalled();
  });
});