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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userServices = __importStar(require("../../src/services/userServices"));
const db_1 = __importDefault(require("../../src/config/db"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
jest.mock('../../src/config/db', () => ({
    user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
}));
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
describe('User Services', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });
    describe('RegisterServices', () => {
        it('should throw error if email already exists', async () => {
            const existingUser = { id: 1, email: 'existing@example.com' };
            db_1.default.user.findUnique.mockResolvedValueOnce(existingUser);
            const newUser = {
                email: 'existing@example.com',
                password: 'password123',
                passwordCon: 'password123',
                first_name: 'John',
                last_name: 'Doe',
            };
            await expect(userServices.RegisterServices(newUser)).rejects.toThrow('EMAIL_EXISTS');
        });
        it('should throw error if passwords do not match', async () => {
            db_1.default.user.findUnique.mockResolvedValueOnce(null);
            const newUser = {
                email: 'new@example.com',
                password: 'password123',
                passwordCon: 'password456',
                first_name: 'John',
                last_name: 'Doe',
            };
            await expect(userServices.RegisterServices(newUser)).rejects.toThrow('PASSWORD_NOT_MATCH');
        });
        it('should successfully register a new user', async () => {
            db_1.default.user.findUnique.mockResolvedValueOnce(null);
            bcrypt_1.default.hash.mockResolvedValueOnce('hashedPassword123');
            db_1.default.user.create.mockResolvedValueOnce({
                id: '1',
                email: 'newuser@example.com',
                password: 'hashedPassword123',
                first_name: 'John',
                last_name: 'Doe',
            });
            const newUser = {
                email: 'newuser@example.com',
                password: 'password123',
                passwordCon: 'password123',
                first_name: 'John',
                last_name: 'Doe',
            };
            const result = await userServices.RegisterServices(newUser);
            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('email', 'newuser@example.com');
            expect(result).not.toHaveProperty('password');
        });
    });
    describe('LoginService', () => {
        it('should throw error if user not found', async () => {
            db_1.default.user.findUnique.mockResolvedValueOnce(null);
            const loginData = {
                email: 'nonexistent@example.com',
                password: 'password123',
            };
            await expect(userServices.LoginService(loginData)).rejects.toThrow('USER_NOT_FOUND');
        });
        it('should throw error if password is incorrect', async () => {
            db_1.default.user.findUnique.mockResolvedValueOnce({
                id: '1',
                email: 'user@example.com',
                password: 'hashedPassword123',
            });
            bcrypt_1.default.compare.mockResolvedValueOnce(false);
            const loginData = {
                email: 'user@example.com',
                password: 'wrongpassword',
            };
            await expect(userServices.LoginService(loginData)).rejects.toThrow('PASSWORD_INCORRECT');
        });
        it('should successfully login and return tokens', async () => {
            const user = {
                id: '1',
                email: 'user@example.com',
                password: 'hashedPassword123',
                refreshToken: null,
            };
            db_1.default.user.findUnique.mockResolvedValueOnce(user);
            bcrypt_1.default.compare.mockResolvedValueOnce(true);
            jsonwebtoken_1.default.sign
                .mockReturnValueOnce('accessToken123')
                .mockReturnValueOnce('refreshToken123');
            db_1.default.user.update.mockResolvedValueOnce(user);
            const loginData = {
                email: 'user@example.com',
                password: 'password123',
            };
            const result = await userServices.LoginService(loginData);
            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('accessToken', 'accessToken123');
            expect(result).toHaveProperty('refreshToken', 'refreshToken123');
            expect(result.user).not.toHaveProperty('password');
        });
    });
    describe('refreshTokenService', () => {
        it('should throw error for invalid token', async () => {
            jsonwebtoken_1.default.verify.mockImplementationOnce(() => {
                throw new Error('Invalid token');
            });
            await expect(userServices.refreshTokenService('invalidToken')).rejects.toThrow('INVALID_REFRESH_TOKEN');
        });
        it('should throw error if refresh token does not match', async () => {
            jsonwebtoken_1.default.verify.mockReturnValueOnce({ userId: '1' });
            db_1.default.user.findUnique.mockResolvedValueOnce({
                id: '1',
                refreshToken: 'differentToken',
            });
            await expect(userServices.refreshTokenService('storedToken')).rejects.toThrow('INVALID_REFRESH_TOKEN');
        });
        it('should successfully refresh token', async () => {
            const userData = { userId: '1' };
            jsonwebtoken_1.default.verify.mockReturnValueOnce(userData);
            db_1.default.user.findUnique.mockResolvedValueOnce({
                id: '1',
                email: 'user@example.com',
                refreshToken: 'validToken',
            });
            jsonwebtoken_1.default.sign.mockReturnValueOnce('newAccessToken123');
            const result = await userServices.refreshTokenService('validToken');
            expect(result).toHaveProperty('accessToken', 'newAccessToken123');
        });
    });
});
