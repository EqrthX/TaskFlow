import multer from 'multer';

// 🌟 ต้อง Mock Multer เพื่อดึงเอา config ออกมาเทสต์
jest.mock('multer', () => {
    const multerMock = jest.fn((config) => config); // คืนค่า config กลับมาตรงๆ
    (multerMock as any).memoryStorage = jest.fn(() => 'mock-memory-storage');
    return multerMock;
});

import { upload } from '../../src/middlewares/uploadMiddleware';

describe('Upload Middleware', () => {
    let fileFilter: any;

    beforeAll(() => {
        // ดึงฟังก์ชัน fileFilter จากตัวแปร upload มาเทสต์
        fileFilter = (upload as any).fileFilter;
    });

    it('ควรใช้ MemoryStorage', () => {
        expect((upload as any).storage).toBe('mock-memory-storage');
    });

    it('ควรตั้งค่าขนาดไฟล์สูงสุดไว้ที่ 5MB', () => {
        expect((upload as any).limits.fileSize).toBe(5 * 1024 * 1024);
    });

    it('ควรอนุญาตให้ผ่านได้ (true) ถ้าเป็นไฟล์รูปภาพ (image/png)', () => {
        const mockFile = { mimetype: 'image/png' };
        const mockCb = jest.fn();

        fileFilter(null, mockFile, mockCb);

        expect(mockCb).toHaveBeenCalledWith(null, true);
    });

    it('ควรคืนค่า Error ถ้าไม่ใช่ไฟล์รูปภาพ (เช่น application/pdf)', () => {
        const mockFile = { mimetype: 'application/pdf' };
        const mockCb = jest.fn();

        fileFilter(null, mockFile, mockCb);

        expect(mockCb).toHaveBeenCalledWith(new Error('รองรับเฉพาะไฟล์รูปภาพเท่านั้น!'));
    });
});