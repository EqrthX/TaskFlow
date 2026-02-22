import * as taskServices from '../../src/services/taskServices';
import prisma from '../../src/config/db';

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

      (prisma.task.create as jest.Mock).mockResolvedValueOnce(mockTask);

      const result = await taskServices.AddTaskServices(taskData);

      expect(result).toEqual(mockTask);
      expect(prisma.task.create).toHaveBeenCalledWith({
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

      (prisma.task.create as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

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

      (prisma.task.update as jest.Mock).mockResolvedValueOnce(mockTask);

      const result = await taskServices.UpdateTaskStatusServices(taskId, isDone, userId);

      expect(result).toEqual(mockTask);
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: taskId, userId },
        data: { isDone },
      });
    });

    it('should throw error if task not found', async () => {
      (prisma.task.update as jest.Mock).mockRejectedValueOnce(new Error('Task not found'));

      await expect(taskServices.UpdateTaskStatusServices(999, true, '1')).rejects.toThrow(
        'Task not found'
      );
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

      (prisma.task.update as jest.Mock).mockResolvedValueOnce(mockTask);

      const result = await taskServices.UpdateTaskServices(taskId, title, description, userId);

      expect(result).toEqual(mockTask);
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: taskId, userId },
        data: { title, description },
      });
    });

    it('should throw error if update fails', async () => {
      (prisma.task.update as jest.Mock).mockRejectedValueOnce(
        new Error('Unauthorized to update this task')
      );

      await expect(
        taskServices.UpdateTaskServices(1, 'New Title', 'New Desc', '999')
      ).rejects.toThrow('Unauthorized to update this task');
    });
  });

  describe('DeleteTaskServices', () => {
    it('should delete a task by ID and user ID', async () => {
      const taskId = 1;
      const userId = '1';

      (prisma.task.delete as jest.Mock).mockResolvedValueOnce({ id: taskId });

      const result = await taskServices.DeleteTaskServices(taskId, userId);

      expect(result).toEqual({ id: taskId });
      expect(prisma.task.delete).toHaveBeenCalledWith({
        where: { id: taskId, userId },
      });
    });

    it('should throw error if task not found', async () => {
      (prisma.task.delete as jest.Mock).mockRejectedValueOnce(new Error('Task not found'));

      await expect(taskServices.DeleteTaskServices(999, '1')).rejects.toThrow('Task not found');
    });
  });
});
