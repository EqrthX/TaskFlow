import prisma from "../config/db";
import bcrypt from "bcrypt";
import { LoginRequest, RegisterRequest } from "../types/userTypes";
import jwt from 'jsonwebtoken';

export const RegisterServices = async (data: RegisterRequest) => {
    const existingUser = await prisma.user.findUnique({
        where: {email: data.email}
    })

    if(existingUser) {
        throw new Error("EMAIL_EXISTS");
    }
    
    if(data.password !== data.passwordCon) {
        throw new Error("PASSWORD_NOT_MATCH");
    }

    const hashPassword = await bcrypt.hash(data.password, 10);

    const now: Date = new Date();

    const newUser = await prisma.user.create({
        data: {
            email: data.email,
            password: hashPassword,
            first_name: data.first_name,
            last_name: data.last_name,
        }
    });

    const {password, ...userWithOutPassword} = newUser;
    return userWithOutPassword;
}

export const LoginService = async (data: LoginRequest) => {
    const findUser = await prisma.user.findUnique({
        where: {email: data.email}
    })

    if(!findUser) {
        throw new Error("USER_NOT_FOUND")
    }

    const comparePassword = await bcrypt.compare(data.password, findUser.password);

    if(!comparePassword) {
        throw new Error("PASSWORD_INCORRECT")
    }

    const accessToken = jwt.sign(
        {userId: findUser.id, email: findUser.email},
        process.env.JWT_SECRET || "my-secret-key-change-it-later",
        {expiresIn: "1d"}
    )

    const refreshToken = jwt.sign(
        {userId: findUser.id},
        process.env.JWT_REFRESH_SECRET || "refresh-secret",
        { expiresIn: "7d" }
    )

    await prisma.user.update({
        where: {id: findUser.id},
        data: {refreshToken: refreshToken}
    })

    const {password, ...userWithoutPassword} = findUser;

    return {
        user: {...userWithoutPassword},
        accessToken,
        refreshToken
    }
}

export const refreshTokenService = async(tokenFromClient: string) => {
    let decoded: any;

    try {
        decoded = jwt.verify(tokenFromClient, process.env.JWT_REFRESH_SECRET || 'refresh-secret')
    } catch (error) {
        throw new Error("INVALID_REFRESH_TOKEN");
    }

    const user = await prisma.user.findUnique({
        where: {id: decoded.userId}
    });

    if (!user || user.refreshToken !== tokenFromClient) {
        throw new Error("INVALID_REFRESH_TOKEN");
    }

    const newAccessToken = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || "JWT_SECRET",
        { expiresIn: "1d" }
    )

    return { accessToken: newAccessToken }
}