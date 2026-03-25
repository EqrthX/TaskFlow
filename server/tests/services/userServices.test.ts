import * as userServices from '../../src/services/userServices';
import prisma from '../../src/config/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({ id: 1, email: 'existing@example.com' });

      await expect(userServices.RegisterServices({
        email: 'existing@example.com',
        password: 'password123',
        passwordCon: 'password123',
        first_name: 'John',
        last_name: 'Doe',
      })).rejects.toThrow('EMAIL_EXISTS');
    });

    it('should throw error if passwords do not match', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(userServices.RegisterServices({
        email: 'new@example.com',
        password: 'password123',
        passwordCon: 'password456',
        first_name: 'John',
        last_name: 'Doe',
      })).rejects.toThrow('PASSWORD_NOT_MATCH');
    });

    it('should successfully register a new user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashedPassword123');
      (prisma.user.create as jest.Mock).mockResolvedValueOnce({
        id: '1',
        email: 'newuser@example.com',
        password: 'hashedPassword123',
        first_name: 'John',
        last_name: 'Doe',
      });

      const result = await userServices.RegisterServices({
        email: 'newuser@example.com',
        password: 'password123',
        passwordCon: 'password123',
        first_name: 'John',
        last_name: 'Doe',
      });

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email', 'newuser@example.com');
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('LoginService', () => {
    it('should throw error if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(userServices.LoginService({
        email: 'nonexistent@example.com',
        password: 'password123',
      })).rejects.toThrow('ไม่พบผู้ใช้งาน');
    });

    it('should throw error if password is incorrect', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '1',
        email: 'user@example.com',
        password: 'hashedPassword123',
        roles: [{ role: { name: 'MEMBER' } }],
      });
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      await expect(userServices.LoginService({
        email: 'user@example.com',
        password: 'wrongpassword',
      })).rejects.toThrow('รหัสผ่านไม่ถูกต้อง');
    });

    it('should successfully login and return tokens', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '1',
        email: 'user@example.com',
        password: 'hashedPassword123',
        refreshToken: null,
        roles: [{ role: { name: 'MEMBER' } }],  // ← fix: เพิ่ม roles
      });
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      (jwt.sign as jest.Mock)
        .mockReturnValueOnce('accessToken123')
        .mockReturnValueOnce('refreshToken123');
      (prisma.user.update as jest.Mock).mockResolvedValueOnce({});

      const result = await userServices.LoginService({
        email: 'user@example.com',
        password: 'password123',
      });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken', 'accessToken123');
      expect(result).toHaveProperty('refreshToken', 'refreshToken123');
      expect(result.user).not.toHaveProperty('password');
    });
  });

  describe('refreshTokenService', () => {
    it('should throw error for invalid token', async () => {
      (jwt.verify as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });

      await expect(userServices.refreshTokenService('invalidToken')).rejects.toThrow('INVALID_REFRESH_TOKEN');
    });

    it('should throw error if refresh token does not match', async () => {
      (jwt.verify as jest.Mock).mockReturnValueOnce({ userId: '1' });
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '1',
        refreshToken: 'differentToken',
      });

      await expect(userServices.refreshTokenService('storedToken')).rejects.toThrow('INVALID_REFRESH_TOKEN');
    });

    it('should successfully refresh token', async () => {
      (jwt.verify as jest.Mock).mockReturnValueOnce({ userId: '1' });
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '1',
        email: 'user@example.com',
        refreshToken: 'validToken',
      });
      (jwt.sign as jest.Mock).mockReturnValueOnce('newAccessToken123');

      const result = await userServices.refreshTokenService('validToken');

      expect(result).toHaveProperty('accessToken', 'newAccessToken123');
    });
  });
});