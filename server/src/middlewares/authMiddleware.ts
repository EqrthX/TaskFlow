import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// ขยาย Interface Request ให้มี user ติดไปด้วย
export interface AuthRequest extends Request {
    user?: any;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    // รับ Header: "Authorization: Bearer <token>"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401); // ไม่มี Token -> 401 Unauthorized

    jwt.verify(token, process.env.JWT_ACCESS_SECRET || "access-secret", (err: any, user: any) => {
        if (err) return res.sendStatus(403); // Token ผิด/หมดอายุ -> 403 Forbidden
        
        req.user = user; // แปะข้อมูล User ไว้ให้ Controller ใช้ต่อ
        next(); // ผ่าน! ไปทำงานต่อได้
    });
};