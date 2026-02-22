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
  });

  describe('RegisterServices', () => {
    it('should throw error if email already exists', async () => {
      const existingUser = { id: 1, email: 'existing@example.com' };
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(existingUser);

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
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

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
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashedPassword123');
      (prisma.user.create as jest.Mock).mockResolvedValueOnce({
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
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      await expect(userServices.LoginService(loginData)).rejects.toThrow('USER_NOT_FOUND');
    });

    it('should throw error if password is incorrect', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '1',
        email: 'user@example.com',
        password: 'hashedPassword123',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

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

      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(user);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      (jwt.sign as jest.Mock)
        .mockReturnValueOnce('accessToken123')
        .mockReturnValueOnce('refreshToken123');
      (prisma.user.update as jest.Mock).mockResolvedValueOnce(user);

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
      (jwt.verify as jest.Mock).mockImplementationOnce((token, secret, callback) => {
        callback(new Error('Invalid token'), null);
      });

      await expect(userServices.refreshTokenService('invalidToken')).rejects.toThrow('INVALID_REFRESH_TOKEN');
    });

    it('should throw error if refresh token does not match', async () => {
      (jwt.verify as jest.Mock).mockImplementationOnce((token, secret, callback) => {
        callback(null, { userId: '1' });
      });

      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '1',
        refreshToken: 'differentToken',
      });

      await expect(userServices.refreshTokenService('storedToken')).rejects.toThrow('INVALID_REFRESH_TOKEN');
    });

    it('should successfully refresh token', async () => {
      (jwt.verify as jest.Mock).mockImplementationOnce((token, secret, callback) => {
        callback(null, { userId: '1' });
      });

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
