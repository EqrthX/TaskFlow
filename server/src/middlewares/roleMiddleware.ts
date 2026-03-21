import { Request, Response, NextFunction } from "express";

export const authroizeRole = (allowedRoles: string[]) => {

    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;

        if (!user || !user.roles) {
            return res.status(401).json({ message: "ไม่พบข้อมพูลสิทธิ์ผู้ใช้งาน" });
        }

        const hasRole = user.roles.some((role: string) => allowedRoles.includes(role));

        if (!hasRole) {
            return res.status(403).json({
                message: `Forbidden: เฉพาะกลุ่ม ${allowedRoles.join(', ')} เท่านั้นที่เข้าได้`
            });
        }

        next();
    }
}