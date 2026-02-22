"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware_1 = require("../../src/middlewares/authMiddleware");
jest.mock('jsonwebtoken');
describe('Auth Middleware', () => {
    let mockReq;
    let mockRes;
    let mockNext;
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
            (0, authMiddleware_1.authenticateToken)(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'Unauthorized: ไม่พบ Token ใน Cookie',
            });
            expect(mockNext).not.toHaveBeenCalled();
        });
        it('should return 403 if token is invalid', () => {
            mockReq.cookies = { accessToken: 'invalidToken' };
            jsonwebtoken_1.default.verify.mockImplementationOnce((token, secret, callback) => {
                callback(new Error('Invalid token'), null);
            });
            (0, authMiddleware_1.authenticateToken)(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'Forbidden: Token ไม่ถูกต้องหรือหมดอายุ',
            });
            expect(mockNext).not.toHaveBeenCalled();
        });
        it('should attach user data to request and call next if token is valid', () => {
            mockReq.cookies = { accessToken: 'validToken' };
            const userData = { userId: '1', email: 'test@example.com' };
            jsonwebtoken_1.default.verify.mockImplementationOnce((token, secret, callback) => {
                callback(null, userData);
            });
            (0, authMiddleware_1.authenticateToken)(mockReq, mockRes, mockNext);
            expect(mockReq.user).toEqual(userData);
            expect(mockNext).toHaveBeenCalled();
            expect(mockRes.status).not.toHaveBeenCalled();
        });
        it('should handle expired token', () => {
            mockReq.cookies = { accessToken: 'expiredToken' };
            jsonwebtoken_1.default.verify.mockImplementationOnce((token, secret, callback) => {
                callback(new Error('Token expired'), null);
            });
            (0, authMiddleware_1.authenticateToken)(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'Forbidden: Token ไม่ถูกต้องหรือหมดอายุ',
            });
        });
        it('should verify token with correct secret key', () => {
            mockReq.cookies = { accessToken: 'validToken' };
            jsonwebtoken_1.default.verify.mockImplementationOnce((token, secret, callback) => {
                callback(null, { userId: '1', email: 'test@example.com' });
            });
            (0, authMiddleware_1.authenticateToken)(mockReq, mockRes, mockNext);
            expect(jsonwebtoken_1.default.verify).toHaveBeenCalledWith('validToken', expect.any(String), expect.any(Function));
        });
    });
});
