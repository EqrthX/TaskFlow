import { Response } from "express";
import logger from "../config/logger";
import { AuthRequest } from "../middlewares/authMiddleware";
import { AddTaskServices, DeleteTaskServices, UpdateTaskServices, UpdateTaskStatusServices } from "../services/taskServices";
import prisma from "../config/db";
import { uploadImageToAzure } from "../services/azureStorage";
import redisClient from "../config/redis";

export const AddTasks = async (req: AuthRequest, res: Response) => {
    logger.info(`Start Controller Registination ${new Date().toDateString()}`);
    const { title, description, date } = req.body;
    try {
        const userId = req.user.userId;
        const files = req.files as Express.Multer.File[];
        const attachmentData: { url: string; fileName: string }[] = [];

        if (files && files.length > 0) {
            for (const file of files) {
                const imageUrl = await uploadImageToAzure(file);
                attachmentData.push({ url: imageUrl, fileName: file.originalname });
            }
        }
        if (!title || !date || !description) {
            return res.status(400).json({ error: "กรุณาส่งข้อมูล title และ date ให้ครบ" })
        }

        const newTask = await AddTaskServices({
            title,
            description,
            date: new Date(date),
            userId,
            attachments: attachmentData
        });
        const cacheKey = `tasks:${userId}`;
        if (redisClient.isReady) {
            await redisClient.del(cacheKey);
            console.log("🗑️ ล้างแคช Redis เรียบร้อย");
        }
        return res.status(201).json({
            message: "เพิ่มงานสำเร็จ",
            data: newTask
        })
    } catch (error: unknown) {

        if (error instanceof Error) {
            if (error.message === "TASKS_NOTFOUND") {
                logger.error(`Error Controller AddTasks Email:${error.message} ${new Date().toDateString()}`)
                return res.status(400).json({ error: "ไม่มีข้อมูลงานที่กรอกเข้ามา" });
            }

            logger.error(`AddTasks Failed: ${error.message}`);
            res.status(500).json({
                error: "Something went wrong to AddTasks",
                detail: error.message
            })
        }
    }
}

export const showTasks = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.userId;
        const cacheKey = `tasks:${userId}`;

        if (redisClient.isReady) {
            const cachedTasks = await redisClient.get(cacheKey);
            if (cachedTasks) {
                console.log("⚡ ดึงข้อมูลจาก Redis Cache");
                return res.status(200).json({
                    tasks:JSON.parse(cachedTasks)
                });
            }
        }

        const result = await prisma.task.findMany({
            where: {
                userId: req.user.userId
            },
            include: {
                attachments: true
            },
            orderBy: {
                date: 'asc'
            }
        })

        if (redisClient.isReady) {
            await redisClient.set(cacheKey, JSON.stringify(result), {
                EX: 3600
            });
        }

        return res.status(200).json({
            tasks: result
        })
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({
                error: "Something went wrong to AddTasks",
                detail: error.message
            })
        }
    }
}

export const UpdateStatusTask = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const { isDone } = req.body;

        const userId = req.user.userId;

        const updateTask = await UpdateTaskStatusServices(Number(id), isDone, userId);

        const cacheKey = `tasks:${userId}`;
        if (redisClient.isReady) {
            await redisClient.del(cacheKey);
            console.log("🗑️ ล้างแคช Redis เรียบร้อย");
        }

        return res.status(200).json({
            message: "อัพเดตสถานะงานเสร็จสิ้น",
            data: updateTask
        })
    } catch (error: unknown) {
        if (error instanceof Error) return res.status(400).json({ error: error.message });
    }
}

export const UpdateTask = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.userId;

        const { id } = req.params;

        const { title, description } = req.body;

        const newUpdateTask = await UpdateTaskServices(Number(id), title, description, userId);

        const cacheKey = `tasks:${userId}`;
        if (redisClient.isReady) {
            await redisClient.del(cacheKey);
            console.log("🗑️ ล้างแคช Redis เรียบร้อย");
        }
        
        return res.status(200).json({
            message: "อัพเดตข้อมูลเสร็จสิ้น",
            newUpdateTask
        })
    } catch (error: unknown) {
        let errorMessage = "เกิดข้อผิดพลาดในการอัพเดท";

        if (error instanceof Error) {
            errorMessage = error.message
        }

        return res.status(400).json({
            message: errorMessage
        })
    }
}

export const DeleteTask = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const userId = req.user.userId;

        const deleteTask = await DeleteTaskServices(Number(id), userId);

        return res.status(200).json({
            message: "ลบงานเสร็จสิ้น",
            data: deleteTask
        })

    } catch (error: unknown) {
        if (error instanceof Error)
            return res.status(400).json({
                message: error.message
            })
    }
}

