import { authroizeRole } from '../../src/middlewares/roleMiddleware';
import { Request, Response, NextFunction } from 'express';

describe('Role Middleware', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let nextFunction: NextFunction;

    beforeEach(() => {
        // เคลียร์ค่าก่อนเริ่มเทสต์แต่ละข้อ
        mockReq = {};
        mockRes = {
            status: jest.fn().mockReturnThis(), // ให้ status() ต่อ chain กับ json() ได้
            json: jest.fn()
        };
        nextFunction = jest.fn();
    });

    it('ควรคืนค่า 401 ถ้าไม่มีข้อมูลผู้ใช้ (ไม่มี Token)', () => {
        const middleware = authroizeRole(['ADMIN']);
        middleware(mockReq as Request, mockRes as Response, nextFunction);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ message: "ไม่พบข้อมพูลสิทธิ์ผู้ใช้งาน" });
        expect(nextFunction).not.toHaveBeenCalled();
    });

    it('ควรคืนค่า 403 ถ้า Role ของผู้ใช้ไม่ตรงกับที่อนุญาต', () => {
        // จำลองผู้ใช้ที่มี Role แค่ MEMBER
        mockReq.user = { roles: ['MEMBER'] } as any;

        const middleware = authroizeRole(['ADMIN']);
        middleware(mockReq as Request, mockRes as Response, nextFunction);

        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({ 
            message: "Forbidden: เฉพาะกลุ่ม ADMIN เท่านั้นที่เข้าได้" 
        });
        expect(nextFunction).not.toHaveBeenCalled();
    });

    it('ควรเรียก next() และให้ผ่านไปได้ ถ้า Role ตรงกับที่อนุญาต', () => {
        // จำลองผู้ใช้ที่มี Role ADMIN
        mockReq.user = { roles: ['ADMIN', 'MEMBER'] } as any;

        const middleware = authroizeRole(['ADMIN']);
        middleware(mockReq as Request, mockRes as Response, nextFunction);

        expect(nextFunction).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
    });
});