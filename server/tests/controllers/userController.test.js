"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const userController = __importStar(require("../../src/controllers/userController"));
const userServices = __importStar(require("../../src/services/userServices"));
const regEx_1 = require("../../src/utils/regEx");
jest.mock('../../src/services/userServices');
jest.mock('../../src/config/logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
}));
jest.mock('../../src/utils/regEx');
describe('User Controller', () => {
    let mockReq;
    let mockRes;
    beforeEach(() => {
        mockReq = {
            body: {},
            cookies: {},
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            cookie: jest.fn().mockReturnThis(),
            clearCookie: jest.fn().mockReturnThis(),
        };
        jest.clearAllMocks();
    });
    describe('Registination', () => {
        it('should return 400 if required fields are missing', async () => {
            mockReq.body = {
                email: 'test@example.com',
                password: 'password123',
                passwordCon: 'password123',
                // missing first_name and last_name
            };
            await userController.Registination(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'กรุณากรอกข้อมูลให้ครบถ้วน',
            });
        });
        it('should return 400 if password is less than 6 characters', async () => {
            mockReq.body = {
                email: 'test@example.com',
                password: 'pass',
                passwordCon: 'pass',
                first_name: 'John',
                last_name: 'Doe',
            };
            await userController.Registination(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'รหัสผ่านน้อยกว่า 6 ตัวอักษร',
            });
        });
        it('should return 400 if email already exists', async () => {
            mockReq.body = {
                email: 'existing@example.com',
                password: 'password123',
                passwordCon: 'password123',
                first_name: 'John',
                last_name: 'Doe',
            };
            userServices.RegisterServices.mockRejectedValueOnce(new Error('EMAIL_EXISTS'));
            await userController.Registination(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'อีเมลนี้ถูกใช้งานแล้ว',
            });
        });
        it('should successfully register a new user', async () => {
            mockReq.body = {
                email: 'newuser@example.com',
                password: 'password123',
                passwordCon: 'password123',
                first_name: 'John',
                last_name: 'Doe',
            };
            const newUser = {
                id: '1',
                email: 'newuser@example.com',
                first_name: 'John',
                last_name: 'Doe',
            };
            userServices.RegisterServices.mockResolvedValueOnce(newUser);
            await userController.Registination(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'สมัครสมาชิกเสร็จสิ้น',
                data: newUser,
            });
        });
    });
    describe('Login', () => {
        it('should return 400 if email or password is missing', async () => {
            mockReq.body = { email: 'test@example.com' };
            await userController.Login(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'กรุณากรอกข้อมูลให้ครบถ้วน',
            });
        });
        it('should return 400 if email format is invalid', async () => {
            mockReq.body = {
                email: 'invalidemail',
                password: 'password123',
            };
            regEx_1.isValidEmail.mockReturnValueOnce(false);
            await userController.Login(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'รูปแบบอีเมลไม่ถูกต้อง',
            });
        });
        it('should successfully login and set cookies', async () => {
            mockReq.body = {
                email: 'user@example.com',
                password: 'password123',
            };
            regEx_1.isValidEmail.mockReturnValueOnce(true);
            userServices.LoginService.mockResolvedValueOnce({
                user: { id: '1', email: 'user@example.com' },
                accessToken: 'accessToken123',
                refreshToken: 'refreshToken123',
            });
            await userController.Login(mockReq, mockRes);
            expect(mockRes.cookie).toHaveBeenCalledTimes(2);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'เข้าสู่ระบบสำเร็จ',
                user: { id: '1', email: 'user@example.com' },
            });
        });
    });
    describe('Logout', () => {
        it('should clear cookies and return success', async () => {
            await userController.Logout(mockReq, mockRes);
            expect(mockRes.clearCookie).toHaveBeenCalledTimes(2);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Logout successfully',
            });
        });
    });
    describe('RefreshToken', () => {
        it('should return 401 if refresh token is not provided', async () => {
            mockReq.cookies = {};
            await userController.RefreshToken(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'ไม่พบ Refresh Token',
            });
        });
        it('should successfully refresh token', async () => {
            mockReq.cookies = { refreshToken: 'validRefreshToken' };
            userServices.refreshTokenService.mockResolvedValueOnce({
                accessToken: 'newAccessToken123',
            });
            await userController.RefreshToken(mockReq, mockRes);
            expect(mockRes.cookie).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'ต่ออายุ Token สำเร็จ',
            });
        });
        it('should return 403 on refresh token service error', async () => {
            mockReq.cookies = { refreshToken: 'invalidToken' };
            userServices.refreshTokenService.mockRejectedValueOnce(new Error('INVALID_REFRESH_TOKEN'));
            await userController.RefreshToken(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(403);
        });
    });
});
