import { Registination, Login } from '../../controllers/userController';
import * as UserServices from '../../services/userServices';
import { Request, Response } from 'express';

// Mock Services และ Logger
jest.mock('../../services/userServices');
jest.mock('../../config/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe('User Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let json: jest.Mock;
  let status: jest.Mock;

  beforeEach(() => {
    // Reset req, res ก่อนเริ่มเทสใหม่ทุกครั้ง
    json = jest.fn();
    status = jest.fn().mockReturnValue({ json }); // ทำให้ res.status().json() chain ต่อกันได้
    res = { status, json } as unknown as Response;
    req = { body: {} };
    jest.clearAllMocks();
  });

  describe('Registination', () => {
    it('should return 400 if fields are missing', async () => {
        req.body = { email: 'test@test.com' }; // ข้อมูลไม่ครบ
        await Registination(req as Request, res as Response);
        expect(status).toHaveBeenCalledWith(400);
        expect(json).toHaveBeenCalledWith(expect.objectContaining({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" }));
    });

    it('should return 400 if password is too short', async () => {
        req.body = { 
            email: 'test@test.com', password: '123', passwordCon: '123', 
            first_name: 'A', last_name: 'B' 
        };
        await Registination(req as Request, res as Response);
        expect(status).toHaveBeenCalledWith(400);
        expect(json).toHaveBeenCalledWith(expect.objectContaining({ error: "รหัสผ่านน้อยกว่า 6 ตัวอักษร" }));
    });

    it('should return 201 when registration is successful', async () => {
        req.body = { 
            email: 'test@test.com', password: 'password123', passwordCon: 'password123', 
            first_name: 'Dev', last_name: 'Ops' 
        };
        
        // Mock ให้ Service ทำงานสำเร็จ
        (UserServices.RegisterServices as jest.Mock).mockResolvedValue({ id: 1, email: 'test@test.com' });

        await Registination(req as Request, res as Response);
        expect(status).toHaveBeenCalledWith(201);
        expect(json).toHaveBeenCalledWith(expect.objectContaining({ message: "สมัครสมาชิกเสร็จสิ้น" }));
    });

    it('should handle EMAIL_EXISTS error', async () => {
        req.body = { 
            email: 'test@test.com', password: 'password123', passwordCon: 'password123', 
            first_name: 'Dev', last_name: 'Ops' 
        };
        // Mock ให้ Service โยน Error ออกมา
        (UserServices.RegisterServices as jest.Mock).mockRejectedValue(new Error("EMAIL_EXISTS"));

        await Registination(req as Request, res as Response);
        expect(status).toHaveBeenCalledWith(400);
        expect(json).toHaveBeenCalledWith(expect.objectContaining({ error: "อีเมลนี้ถูกใช้งานแล้ว" }));
    });
  });
});