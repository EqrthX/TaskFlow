"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const taskController = __importStar(require("../../src/controllers/taskController"));
const taskServices = __importStar(require("../../src/services/taskServices"));
const db_1 = __importDefault(require("../../src/config/db"));
jest.mock('../../src/config/db', () => ({
    task: {
        findMany: jest.fn(),
    },
}));
jest.mock('../../src/services/taskServices');
jest.mock('../../src/config/logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
}));
describe('Task Controller', () => {
    let mockReq;
    let mockRes;
    beforeEach(() => {
        mockReq = {
            body: {},
            params: {},
            user: { userId: '1', email: 'test@example.com' },
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        jest.clearAllMocks();
    });
    describe('AddTasks', () => {
        it('should return 400 if required fields are missing', async () => {
            mockReq.body = {
                title: 'Test Task',
                // missing date and description
            };
            await taskController.AddTasks(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'กรุณาส่งข้อมูล title และ date ให้ครบ',
            });
        });
        it('should successfully add a new task', async () => {
            mockReq.body = {
                title: 'Test Task',
                description: 'Test Description',
                date: '2024-03-01',
            };
            const newTask = {
                id: 1,
                title: 'Test Task',
                description: 'Test Description',
                date: new Date('2024-03-01'),
                userId: '1',
                isDone: false,
            };
            taskServices.AddTaskServices.mockResolvedValueOnce(newTask);
            await taskController.AddTasks(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'เพิ่มงานสำเร็จ',
                data: newTask,
            });
        });
        it('should handle service errors', async () => {
            mockReq.body = {
                title: 'Test Task',
                description: 'Test Description',
                date: '2024-03-01',
            };
            taskServices.AddTaskServices.mockRejectedValueOnce(new Error('Database error'));
            await taskController.AddTasks(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(500);
        });
    });
    describe('showTasks', () => {
        it('should return all tasks for the user', async () => {
            const tasks = [
                {
                    id: 1,
                    title: 'Task 1',
                    description: 'Desc 1',
                    date: new Date('2024-03-01'),
                    userId: '1',
                    isDone: false,
                },
                {
                    id: 2,
                    title: 'Task 2',
                    description: 'Desc 2',
                    date: new Date('2024-03-02'),
                    userId: '1',
                    isDone: true,
                },
            ];
            db_1.default.task.findMany.mockResolvedValueOnce(tasks);
            await taskController.showTasks(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ tasks });
            expect(db_1.default.task.findMany).toHaveBeenCalledWith({
                where: { userId: '1' },
                orderBy: { date: 'asc' },
            });
        });
        it('should return empty array if no tasks exist', async () => {
            db_1.default.task.findMany.mockResolvedValueOnce([]);
            await taskController.showTasks(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ tasks: [] });
        });
        it('should handle database errors', async () => {
            db_1.default.task.findMany.mockRejectedValueOnce(new Error('Database error'));
            await taskController.showTasks(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(500);
        });
    });
    describe('UpdateStatusTask', () => {
        it('should successfully update task status', async () => {
            mockReq.params = { id: '1' };
            mockReq.body = { isDone: true };
            const updatedTask = {
                id: 1,
                title: 'Test Task',
                isDone: true,
            };
            taskServices.UpdateTaskStatusServices.mockResolvedValueOnce(updatedTask);
            await taskController.UpdateStatusTask(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'อัพเดตสถานะงานเสร็จสิ้น',
                data: updatedTask,
            });
            expect(taskServices.UpdateTaskStatusServices).toHaveBeenCalledWith(1, true, '1');
        });
        it('should handle service errors', async () => {
            mockReq.params = { id: '1' };
            mockReq.body = { isDone: true };
            taskServices.UpdateTaskStatusServices.mockRejectedValueOnce(new Error('Task not found'));
            await taskController.UpdateStatusTask(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
        });
    });
    describe('UpdateTask', () => {
        it('should successfully update task details', async () => {
            mockReq.params = { id: '1' };
            mockReq.body = {
                title: 'Updated Task',
                description: 'Updated Description',
            };
            const updatedTask = {
                id: 1,
                title: 'Updated Task',
                description: 'Updated Description',
            };
            taskServices.UpdateTaskServices.mockResolvedValueOnce(updatedTask);
            await taskController.UpdateTask(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'อัพเดตข้อมูลเสร็จสิ้น',
                newUpdateTask: updatedTask,
            });
            expect(taskServices.UpdateTaskServices).toHaveBeenCalledWith(1, 'Updated Task', 'Updated Description', '1');
        });
        it('should handle service errors', async () => {
            mockReq.params = { id: '1' };
            mockReq.body = {
                title: 'Updated Task',
                description: 'Updated Description',
            };
            taskServices.UpdateTaskServices.mockRejectedValueOnce(new Error('Unauthorized'));
            await taskController.UpdateTask(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'เกิดข้อผิดพลาดในการอัพเดท',
            });
        });
    });
});
