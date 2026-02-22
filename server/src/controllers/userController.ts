import { Request, Response } from "express";
import { LoginRequest, RegisterRequest } from "../types/userTypes"
import { LoginService, refreshTokenService, RegisterServices } from "../services/userServices";
import logger from "../config/logger";
import {isValidEmail} from  '../utils/regEx';

export const Registination = async (req: Request<{}, {}, RegisterRequest>, res: Response) => {
    logger.info(`Start Controller Registination ${new Date().toDateString()}`);
    const { email, password, passwordCon, first_name, last_name } = req.body;
    logger.info(`Request Data to register ${req.body}`);
    try {
        if (!email || !password || !passwordCon || !first_name || !last_name) {
            return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" });
        }

        if (password.length < 5 || passwordCon.length < 5) {
            return res.status(400).json({ error: "รหัสผ่านน้อยกว่า 6 ตัวอักษร" });
        }

        const newUser = await RegisterServices({
            email,
            password,
            passwordCon,
            first_name,
            last_name
        });
        logger.info(`End Controller Registination ${new Date().toDateString()}`)
        return res.status(201).json({
            message: "สมัครสมาชิกเสร็จสิ้น",
            data: newUser
        })
    } catch (error: any) {
        if (error.message === "EMAIL_EXISTS") {
            logger.error(`Error Controller Registination Email:${error.message} ${new Date().toDateString()}`)
            return res.status(400).json({ error: "อีเมลนี้ถูกใช้งานแล้ว" });
        }

        if (error.message === "PASSWORD_NOT_MATCH") {
            logger.error(`Error Controller Registination Password:${error.message} ${new Date().toDateString()}`)
            return res.status(400).json({ error: "รหัสผ่านไม่ตรงกัน" });
        }
        res.status(500).json({ 
            error: "Something went wrong to Registination", 
            detail: error.message 
        })
    }
}

export const Login = async (req: Request<{}, {}, LoginRequest>, res: Response) => {
    logger.info(`Start Controller Login ${new Date().toDateString()}`)
    const { email, password } = req.body;

    try {
        if(!email || !password) {
            return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" });
        }

        if(!isValidEmail(email)) {
            return res.status(400).json({error: "รูปแบบอีเมลไม่ถูกต้อง"})
        }

        const result = await LoginService({
            email,
            password
        })

        res.cookie("accessToken", result.accessToken, {
            httpOnly: true, // ป้องกัน XSS (ให้ JS ฝั่งหน้าเว็บอ่านไม่ได้)
            secure: false, // ใช้ true ถ้าเป็น https
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000 // หมดอายุ 1 วัน (ให้ตรงกับ expiresIn)
        });

        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000 // หมดอายุ 7 วัน
        });

        return res.status(200).json({
            message: "เข้าสู่ระบบสำเร็จ",
            user: result.user
        })
    } catch (error) {
        res.status(500).json({ error: "Somthing went wrong to Login" })
    }
}

export const Logout = async (req: Request, res: Response) => {
    try {
        // 1. สั่งลบ Cookie ทั้ง accessToken และ refreshToken
        // ต้องระบุชื่อให้ตรงกับตอนที่เราสร้าง (accessToken, refreshToken)
        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });

        // 2. ตอบกลับไปว่า Logout สำเร็จ
        return res.status(200).json({ message: "Logout successfully" });
    } catch (error) {
        return res.status(500).json({ error: "Logout failed" });
    }
};

export const RefreshToken = async (req: Request, res: Response) => {
    try {
        // 1. ดึง Refresh Token จาก Cookie ที่เบราว์เซอร์ส่งมาให้
        const tokenFromClient = req.cookies.refreshToken;

        if (!tokenFromClient) {
            return res.status(401).json({ error: "ไม่พบ Refresh Token" });
        }

        // 2. ส่งไปให้ Service ตรวจสอบและออก Access Token ใบใหม่
        const result = await refreshTokenService(tokenFromClient);

        // 3. ยัด Access Token ใบใหม่ลง Cookie ทับใบเก่า
        res.cookie("accessToken", result.accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(200).json({ message: "ต่ออายุ Token สำเร็จ" });

    } catch (error: any) {
        return res.status(403).json({ error: error.message });
    }
};