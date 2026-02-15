import { RegisterServices, LoginService } from '../../services/userServices';
import prisma from '../../config/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock Dependencies
jest.mock('../../config/db', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('User Services', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('RegisterServices', () => {
    const mockData = {
      email: 'test@example.com',
      password: 'password123',
      passwordCon: 'password123',
      first_name: 'Test',
      last_name: 'User',
    };

    it('should throw error if email already exists', async () => {
      // Mock ให้หา user เจอ (แปลว่าอีเมลซ้ำ)
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: '1', email: mockData.email });

      await expect(RegisterServices(mockData)).rejects.toThrow('EMAIL_EXISTS');
    });

    it('should throw error if passwords do not match', async () => {
      const badData = { ...mockData, passwordCon: 'wrongpass' };
      // Mock ให้หา user ไม่เจอ
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(RegisterServices(badData)).rejects.toThrow('PASSWORD_NOT_MATCH');
    });

    it('should create new user successfully', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      
      // Mock ค่าที่ Prisma create คืนกลับมา
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'user-123',
        ...mockData,
        password: 'hashed_password',
      });

      const result = await RegisterServices(mockData);

      expect(bcrypt.hash).toHaveBeenCalledWith(mockData.password, 10);
      expect(prisma.user.create).toHaveBeenCalled();
      expect(result).not.toHaveProperty('password'); // เช็คว่าต้องไม่คืน password กลับมา
      expect(result.email).toBe(mockData.email);
    });
  });

  describe('LoginService', () => {
    const loginData = { email: 'test@example.com', password: 'password123' };
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      password: 'hashed_password',
    };

    it('should throw USER_NOT_FOUND if user does not exist', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(LoginService(loginData)).rejects.toThrow('USER_NOT_FOUND');
    });

    it('should throw PASSWORD_INCORRECT if password does not match', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false); // รหัสผิด

      await expect(LoginService(loginData)).rejects.toThrow('PASSWORD_INCORRECT');
    });

    it('should return tokens if login success', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true); // รหัสถูก
      (jwt.sign as jest.Mock)
        .mockReturnValueOnce('access_token') // ครั้งแรกสำหรับ Access
        .mockReturnValueOnce('refresh_token'); // ครั้งสองสำหรับ Refresh

      const result = await LoginService(loginData);

      expect(prisma.user.update).toHaveBeenCalled(); // ต้องมีการอัปเดต Refresh Token ลง DB
      expect(result).toHaveProperty('accessToken', 'access_token');
      expect(result).toHaveProperty('refreshToken', 'refresh_token');
    });
  });
});