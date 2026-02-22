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
const taskServices = __importStar(require("../../src/services/taskServices"));
const db_1 = __importDefault(require("../../src/config/db"));
jest.mock('../../src/config/db', () => ({
    task: {
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
}));
describe('Task Services', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('AddTaskServices', () => {
        it('should create a new task with provided data', async () => {
            const taskData = {
                title: 'Test Task',
                description: 'Test Description',
                date: new Date('2024-03-01'),
                userId: '1',
            };
            const mockTask = {
                id: 1,
                ...taskData,
                isDone: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            db_1.default.task.create.mockResolvedValueOnce(mockTask);
            const result = await taskServices.AddTaskServices(taskData);
            expect(result).toEqual(mockTask);
            expect(db_1.default.task.create).toHaveBeenCalledWith({
                data: {
                    title: taskData.title,
                    description: taskData.description,
                    date: taskData.date,
                    userId: taskData.userId,
                },
            });
        });
        it('should throw error if create fails', async () => {
            const taskData = {
                title: 'Test Task',
                description: 'Test Description',
                date: new Date('2024-03-01'),
                userId: '1',
            };
            db_1.default.task.create.mockRejectedValueOnce(new Error('Database error'));
            await expect(taskServices.AddTaskServices(taskData)).rejects.toThrow('Database error');
        });
    });
    describe('UpdateTaskStatusServices', () => {
        it('should update task status', async () => {
            const taskId = 1;
            const isDone = true;
            const userId = '1';
            const mockTask = {
                id: taskId,
                title: 'Test Task',
                description: 'Test Description',
                isDone: true,
                userId,
            };
            db_1.default.task.update.mockResolvedValueOnce(mockTask);
            const result = await taskServices.UpdateTaskStatusServices(taskId, isDone, userId);
            expect(result).toEqual(mockTask);
            expect(db_1.default.task.update).toHaveBeenCalledWith({
                where: { id: taskId, userId },
                data: { isDone },
            });
        });
        it('should throw error if task not found', async () => {
            db_1.default.task.update.mockRejectedValueOnce(new Error('Task not found'));
            await expect(taskServices.UpdateTaskStatusServices(999, true, '1')).rejects.toThrow('Task not found');
        });
    });
    describe('UpdateTaskServices', () => {
        it('should update task title and description', async () => {
            const taskId = 1;
            const title = 'Updated Task';
            const description = 'Updated Description';
            const userId = '1';
            const mockTask = {
                id: taskId,
                title,
                description,
                userId,
                isDone: false,
            };
            db_1.default.task.update.mockResolvedValueOnce(mockTask);
            const result = await taskServices.UpdateTaskServices(taskId, title, description, userId);
            expect(result).toEqual(mockTask);
            expect(db_1.default.task.update).toHaveBeenCalledWith({
                where: { id: taskId, userId },
                data: { title, description },
            });
        });
        it('should throw error if update fails', async () => {
            db_1.default.task.update.mockRejectedValueOnce(new Error('Unauthorized to update this task'));
            await expect(taskServices.UpdateTaskServices(1, 'New Title', 'New Desc', '999')).rejects.toThrow('Unauthorized to update this task');
        });
    });
    describe('DeleteTaskServices', () => {
        it('should delete a task by ID and user ID', async () => {
            const taskId = 1;
            const userId = '1';
            db_1.default.task.delete.mockResolvedValueOnce({ id: taskId });
            const result = await taskServices.DeleteTaskServices(taskId, userId);
            expect(result).toEqual({ id: taskId });
            expect(db_1.default.task.delete).toHaveBeenCalledWith({
                where: { id: taskId, userId },
            });
        });
        it('should throw error if task not found', async () => {
            db_1.default.task.delete.mockRejectedValueOnce(new Error('Task not found'));
            await expect(taskServices.DeleteTaskServices(999, '1')).rejects.toThrow('Task not found');
        });
    });
});
