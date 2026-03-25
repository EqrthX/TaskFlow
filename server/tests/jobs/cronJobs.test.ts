// tests/jobs/cronJobs.test.ts
import cron from 'node-cron';
import prisma from '../../src/config/db';
import { sendNotificationEmail } from '../../src/services/emailServices';
import { startCronJobs } from '../../src/jobs/cronJobs';

// Mock dependencies
jest.mock('node-cron', () => ({
  schedule: jest.fn(),
}));
jest.mock('../../src/config/db', () => ({
  task: { findMany: jest.fn() },
}));
jest.mock('../../src/services/emailServices', () => ({
  sendNotificationEmail: jest.fn().mockResolvedValue(true),
}));

describe('Cron Jobs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should schedule the job at 08:00 AM', () => {
    startCronJobs();
    expect(cron.schedule).toHaveBeenCalledWith('0 8 * * *', expect.any(Function), expect.objectContaining({
      timezone: "Asia/Bangkok"
    }));
  });

  it('should send emails for tasks due today', async () => {
      // Mock ข้อมูลงานที่จะครบกำหนดวันนี้
      const mockTasks = [
          { id: 1, title: 'Task 1', isDone: false, user: { email: 'user1@test.com' } },
          { id: 2, title: 'Task 2', isDone: false, user: { email: 'user1@test.com' } },
          { id: 3, title: 'Task 3', isDone: false, user: { email: 'user2@test.com' } },
      ];
      
      (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);

      startCronJobs();
      const jobFunction = (cron.schedule as jest.Mock).mock.calls[0][1];
      await jobFunction();

      expect(sendNotificationEmail).toHaveBeenCalledTimes(2);
      
      expect(sendNotificationEmail).toHaveBeenCalledWith(expect.objectContaining({
          to: 'user1@test.com',
          subject: expect.stringContaining('(2 งาน)'),
      }));
  });
});