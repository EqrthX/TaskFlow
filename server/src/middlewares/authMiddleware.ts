import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
    user?: any;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.cookies?.accessToken;

    if (!token) {
        return res.status(401).json({ error: "Unauthorized: ไม่พบ Token ใน Cookie" });
    }

    const secretKey = process.env.JWT_SECRET || "my-secret-key-change-it-later";

    jwt.verify(token, secretKey, (err: any, user: any) => {
        if (err) {
            return res.status(403).json({ error: "Forbidden: Token ไม่ถูกต้องหรือหมดอายุ" });
        }
        
        req.user = user; 
        next(); 
    });
};