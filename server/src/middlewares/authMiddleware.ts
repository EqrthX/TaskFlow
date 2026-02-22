import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// ขยาย Interface Request ให้มี user ติดไปด้วย
export interface AuthRequest extends Request {
    user?: any;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    // 1. ❌ ลบการหาจาก Header ทิ้งไปเลย
    // 2. ✅ เปลี่ยนมาล้วงหา Token จากกล่อง Cookie แทน (ชื่อต้องตรงกับที่ตั้งไว้ตอน Login)
    const token = req.cookies?.accessToken;

    if (!token) {
        return res.status(401).json({ error: "Unauthorized: ไม่พบ Token ใน Cookie" });
    }

    // 3. ✅ เช็ค Secret Key ให้ตรงกับตอนสร้างใน LoginService
    const secretKey = process.env.JWT_SECRET || "my-secret-key-change-it-later";

    jwt.verify(token, secretKey, (err: any, user: any) => {
        if (err) {
            return res.status(403).json({ error: "Forbidden: Token ไม่ถูกต้องหรือหมดอายุ" });
        }
        
        req.user = user; // แปะข้อมูล User ไว้ให้ Controller ใช้ต่อ
        next(); // ผ่าน! ไปทำงานต่อได้
    });
};