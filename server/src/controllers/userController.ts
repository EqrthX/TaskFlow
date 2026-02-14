import { Request, Response } from "express";
import { LoginRequest, RegisterRequest } from "../types/userTypes"
import { RegisterServices } from "../services/userServices";
import logger from "../config/logger";

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

    } catch (error) {
        res.status(500).json({ error: "Somthing went wrong to Login" })
    }
}