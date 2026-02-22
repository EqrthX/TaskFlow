import { Request, Response } from "express";
import logger from "../config/logger";
import { AuthRequest } from "../middlewares/authMiddleware";
import { AddTaskServices, DeleteTaskServices, UpdateTaskServices, UpdateTaskStatusServices } from "../services/taskServices";
import prisma from "../config/db";


export const AddTasks = async (req: AuthRequest, res: Response) => {
    logger.info(`Start Controller Registination ${new Date().toDateString()}`);
    const {title, description, date} = req.body;
    try {
        const userId = req.user.userId;
        
        if(!title || !date || !description) {
            return res.status(400).json({error: "กรุณาส่งข้อมูล title และ date ให้ครบ"})
        }

        const newTask = await AddTaskServices({
            title, 
            description, 
            date: new Date(date), 
            userId
        });

        return res.status(201).json({
            message: "เพิ่มงานสำเร็จ",
            data: newTask
        })
    } catch (error: any) {
        if (error.message === "TASKS_NOTFOUND") {
            logger.error(`Error Controller AddTasks Email:${error.message} ${new Date().toDateString()}`)
            return res.status(400).json({ error: "ไม่มีข้อมูลงานที่กรอกเข้ามา" });
        }
        res.status(500).json({
            error: "Something went wrong to AddTasks",
            detail: error.message
        })
    }
}

export const showTasks = async (req: AuthRequest, res: Response) => {
    try {
        const result = await prisma.task.findMany({
            where:{
                userId: req.user.userId
            },
            orderBy: {
                date: 'asc'
            }
        })
        return res.status(200).json({
            tasks: result
        })
    } catch (error: any) {
        res.status(500).json({
            error: "Something went wrong to AddTasks",
            detail: error.message
        })
    }
}

export const UpdateStatusTask = async (req: AuthRequest, res: Response) => {
    try {
        const {id} = req.params;

        const {isDone} = req.body;

        const userId = req.user.userId;

        const updateTask = await UpdateTaskStatusServices(Number(id), isDone, userId);

        return res.status(200).json({
            message: "อัพเดตสถานะงานเสร็จสิ้น",
            data: updateTask
        })
    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}

export const UpdateTask = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.userId;

        const {id} = req.params;

        const {title, description} = req.body;

        const newUpdateTask = await UpdateTaskServices(Number(id), title, description, userId);

        return res.status(200).json({
            message:"อัพเดตข้อมูลเสร็จสิ้น",
            newUpdateTask
        })
    } catch (error) {
        return res.status(400).json({
            message:"เกิดข้อผิดพลาดในการอัพเดท"
        })
    }
}

export const DeleteTask = async (req: AuthRequest, res:Response) => {
    try {
        const {id} = req.params;

        const userId = req.user.userId;

        const deleteTask = await DeleteTaskServices(Number(id), userId);

        return res.status(200).json({
            message:"ลบงานเสร็จสิ้น",
            data: deleteTask
        })
        
    } catch (error: any) {
        return res.status(400).json({
            message: error.message
        })
    }
}

