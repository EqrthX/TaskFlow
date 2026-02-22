import { Request, Response } from 'express';
import * as userController from '../../src/controllers/userController';
import * as userServices from '../../src/services/userServices';
import { isValidEmail } from '../../src/utils/regEx';

jest.mock('../../src/services/userServices');
jest.mock('../../src/config/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));
jest.mock('../../src/utils/regEx');

describe('User Controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

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

      await userController.Registination(
        mockReq as Request,
        mockRes as Response
      );

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

      await userController.Registination(
        mockReq as Request,
        mockRes as Response
      );

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

      (userServices.RegisterServices as jest.Mock).mockRejectedValueOnce(
        new Error('EMAIL_EXISTS')
      );

      await userController.Registination(
        mockReq as Request,
        mockRes as Response
      );

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

      (userServices.RegisterServices as jest.Mock).mockResolvedValueOnce(newUser);

      await userController.Registination(
        mockReq as Request,
        mockRes as Response
      );

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

      await userController.Login(mockReq as Request, mockRes as Response);

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

      (isValidEmail as jest.Mock).mockReturnValueOnce(false);

      await userController.Login(mockReq as Request, mockRes as Response);

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

      (isValidEmail as jest.Mock).mockReturnValueOnce(true);
      (userServices.LoginService as jest.Mock).mockResolvedValueOnce({
        user: { id: '1', email: 'user@example.com' },
        accessToken: 'accessToken123',
        refreshToken: 'refreshToken123',
      });

      await userController.Login(mockReq as Request, mockRes as Response);

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
      await userController.Logout(mockReq as Request, mockRes as Response);

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

      await userController.RefreshToken(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'ไม่พบ Refresh Token',
      });
    });

    it('should successfully refresh token', async () => {
      mockReq.cookies = { refreshToken: 'validRefreshToken' };

      (userServices.refreshTokenService as jest.Mock).mockResolvedValueOnce({
        accessToken: 'newAccessToken123',
      });

      await userController.RefreshToken(mockReq as Request, mockRes as Response);

      expect(mockRes.cookie).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'ต่ออายุ Token สำเร็จ',
      });
    });

    it('should return 403 on refresh token service error', async () => {
      mockReq.cookies = { refreshToken: 'invalidToken' };

      (userServices.refreshTokenService as jest.Mock).mockRejectedValueOnce(
        new Error('INVALID_REFRESH_TOKEN')
      );

      await userController.RefreshToken(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
  });
});
