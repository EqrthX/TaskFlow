import { authenticateToken } from '../../middlewares/authMiddleware';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let sendStatus: jest.Mock;

  beforeEach(() => {
    sendStatus = jest.fn();
    res = { sendStatus } as unknown as Response;
    next = jest.fn();
    req = { headers: {} };
  });

  it('should return 401 if no token provided', () => {
    authenticateToken(req as Request, res as Response, next);
    expect(sendStatus).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 if token is invalid', () => {
    req.headers = { authorization: 'Bearer invalid_token' };
    (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
      callback(new Error('Invalid token'), null);
    });

    authenticateToken(req as Request, res as Response, next);
    expect(sendStatus).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next() and attach user if token is valid', () => {
    req.headers = { authorization: 'Bearer valid_token' };
    const mockUser = { userId: 1, email: 'test@test.com' };

    (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
      callback(null, mockUser);
    });

    authenticateToken(req as Request, res as Response, next);
    
    expect(next).toHaveBeenCalled();
    // @ts-ignore
    expect(req.user).toEqual(mockUser);
  });
});