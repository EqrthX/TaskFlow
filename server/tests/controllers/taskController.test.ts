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
jest.mock('../../src/services/azureStorage', () => ({
    uploadImageToAzure: jest.fn()
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
        include: {attachments: true},
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
        message: 'Unauthorized',
      });
    });
  });

  describe('DeleteTask', () => {
    it('should successfully delete a task', async () => {
      mockReq.params = { id: '1' };

      const deletedTask = {
        id: 1,
        title: 'Test Task',
        userId: '1',
      };

      (taskServices.DeleteTaskServices as jest.Mock).mockResolvedValueOnce(deletedTask);

      await taskController.DeleteTask(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'ลบงานเสร็จสิ้น',
        data: deletedTask,
      });
      expect(taskServices.DeleteTaskServices).toHaveBeenCalledWith(1, '1');
    });

    it('should handle task not found error', async () => {
      mockReq.params = { id: '999' };

      (taskServices.DeleteTaskServices as jest.Mock).mockRejectedValueOnce(
        new Error('Task not found')
      );

      await taskController.DeleteTask(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Task not found',
      });
    });

    it('should handle unauthorized deletion', async () => {
      mockReq.params = { id: '1' };

      (taskServices.DeleteTaskServices as jest.Mock).mockRejectedValueOnce(
        new Error('Unauthorized to delete this task')
      );

      await taskController.DeleteTask(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Unauthorized to delete this task',
      });
    });
  });

  describe('AddTasks with file uploads', () => {
    it('should add task with multiple file attachments', async () => {
      const mockFiles: Express.Multer.File[] = [
        {
          fieldname: 'files',
          originalname: 'document.pdf',
          encoding: '7bit',
          mimetype: 'application/pdf',
          size: 12345,
          destination: '/uploads',
          filename: 'doc1.pdf',
          path: '/uploads/doc1.pdf',
          buffer: Buffer.from(''),
          stream: null as any,
        },
        {
          fieldname: 'files',
          originalname: 'image.png',
          encoding: '7bit',
          mimetype: 'image/png',
          size: 54321,
          destination: '/uploads',
          filename: 'img1.png',
          path: '/uploads/img1.png',
          buffer: Buffer.from(''),
          stream: null as any,
        },
      ];

      mockReq.body = {
        title: 'Task with attachments',
        description: 'Task with multiple files',
        date: '2024-03-15',
      };
      mockReq.files = mockFiles;

      const newTask = {
        id: 1,
        title: 'Task with attachments',
        description: 'Task with multiple files',
        date: new Date('2024-03-15'),
        userId: '1',
        isDone: false,
        attachments: [
          { url: 'https://azure.blob.com/doc1.pdf', fileName: 'document.pdf' },
          { url: 'https://azure.blob.com/img1.png', fileName: 'image.png' },
        ],
      };

      (taskServices.AddTaskServices as jest.Mock).mockResolvedValueOnce(newTask);

      await taskController.AddTasks(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'เพิ่มงานสำเร็จ',
        data: newTask,
      });
    });

    it('should add task without file attachments', async () => {
      mockReq.body = {
        title: 'Simple Task',
        description: 'Task without files',
        date: '2024-03-20',
      };
      mockReq.files = [];

      const newTask = {
        id: 2,
        title: 'Simple Task',
        description: 'Task without files',
        date: new Date('2024-03-20'),
        userId: '1',
        isDone: false,
        attachments: [],
      };

      (taskServices.AddTaskServices as jest.Mock).mockResolvedValueOnce(newTask);

      await taskController.AddTasks(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'เพิ่มงานสำเร็จ',
        data: newTask,
      });
    });
  });
});
