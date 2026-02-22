import { Response } from 'express';
import * as taskController from '../../src/controllers/taskController';
import * as taskServices from '../../src/services/taskServices';
import { AuthRequest } from '../../src/middlewares/authMiddleware';
import prisma from '../../src/config/db';

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
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;

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

      await taskController.AddTasks(mockReq as AuthRequest, mockRes as Response);

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

      (taskServices.AddTaskServices as jest.Mock).mockResolvedValueOnce(newTask);

      await taskController.AddTasks(mockReq as AuthRequest, mockRes as Response);

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

      (taskServices.AddTaskServices as jest.Mock).mockRejectedValueOnce(
        new Error('Database error')
      );

      await taskController.AddTasks(mockReq as AuthRequest, mockRes as Response);

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

      (prisma.task.findMany as jest.Mock).mockResolvedValueOnce(tasks);

      await taskController.showTasks(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ tasks });
      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: { userId: '1' },
        orderBy: { date: 'asc' },
      });
    });

    it('should return empty array if no tasks exist', async () => {
      (prisma.task.findMany as jest.Mock).mockResolvedValueOnce([]);

      await taskController.showTasks(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ tasks: [] });
    });

    it('should handle database errors', async () => {
      (prisma.task.findMany as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      await taskController.showTasks(mockReq as AuthRequest, mockRes as Response);

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

      (taskServices.UpdateTaskStatusServices as jest.Mock).mockResolvedValueOnce(updatedTask);

      await taskController.UpdateStatusTask(mockReq as AuthRequest, mockRes as Response);

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

      (taskServices.UpdateTaskStatusServices as jest.Mock).mockRejectedValueOnce(
        new Error('Task not found')
      );

      await taskController.UpdateStatusTask(mockReq as AuthRequest, mockRes as Response);

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

      (taskServices.UpdateTaskServices as jest.Mock).mockResolvedValueOnce(updatedTask);

      await taskController.UpdateTask(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'อัพเดตข้อมูลเสร็จสิ้น',
        newUpdateTask: updatedTask,
      });
      expect(taskServices.UpdateTaskServices).toHaveBeenCalledWith(
        1,
        'Updated Task',
        'Updated Description',
        '1'
      );
    });

    it('should handle service errors', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = {
        title: 'Updated Task',
        description: 'Updated Description',
      };

      (taskServices.UpdateTaskServices as jest.Mock).mockRejectedValueOnce(
        new Error('Unauthorized')
      );

      await taskController.UpdateTask(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'เกิดข้อผิดพลาดในการอัพเดท',
      });
    });
  });
});
