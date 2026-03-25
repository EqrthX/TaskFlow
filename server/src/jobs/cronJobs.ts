import cron from 'node-cron';
import prisma  from '../config/db';
import { sendNotificationEmail } from '../services/emailServices';
import logger from '../config/logger';

export const startCronJobs = () => {
  cron.schedule('0 8 * * *', async () => {
    logger.info('⏰ เริ่มต้นรัน Cron Job 08:00 AM: ตรวจสอบงานประจำวัน...');

    try {
      // 1. หาวันที่ของวันนี้ (ตั้งแต่ 00:00:00 ถึง 23:59:59)
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      // 2. ค้นหางานทั้งหมดที่ "ยังไม่เสร็จ" และมี "กำหนดส่งวันนี้"
      const tasksDueToday = await prisma.task.findMany({
        where: {
          isDone: false,
          date: {
            gte: startOfToday,
            lte: endOfToday,
          },
        },
        include: {
          user: true, // ดึงข้อมูล user (อีเมล) มาด้วย
        },
      });

      if (tasksDueToday.length === 0) {
        logger.info('✅ วันนี้ไม่มีงานที่ต้องส่ง');
        return;
      }

      // 3. จัดกลุ่มงานตาม User (เพราะ 1 คนอาจจะมีหลายงาน จะได้ส่งอีเมลเดียวสรุปรวมไปเลย)
      const tasksByUser: Record<string, typeof tasksDueToday> = {};
      
      tasksDueToday.forEach(task => {
        const email = task.user.email;
        if (!tasksByUser[email]) {
          tasksByUser[email] = [];
        }
        tasksByUser[email].push(task);
      });

      // 4. วนลูปส่งอีเมลหาแต่ละคน
      for (const [email, tasks] of Object.entries(tasksByUser)) {
        const taskListHtml = tasks.map(t => `<li><strong>${t.title}</strong> ${t.category ? `(${t.category})` : ''}</li>`).join('');

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #d97706;">🌅 อรุณสวัสดิ์! นี่คืองานของคุณในวันนี้</h2>
            <p>คุณมีงานที่ค้างอยู่และถึงกำหนดส่งในวันนี้ จำนวน ${tasks.length} งาน:</p>
            <ul>
              ${taskListHtml}
            </ul>
            <br/>
            <p>ขอให้ลุยงานวันนี้อย่างราบรื่นนะครับ ✌️</p>
            <hr style="border: 1px solid #eee; margin-top: 20px;"/>
            <p style="font-size: 12px; color: #999;">ส่งจากระบบอัตโนมัติ TaskFlow</p>
          </div>
        `;

        await sendNotificationEmail({
          to: email,
          subject: `[TaskFlow] แจ้งเตือนงานประจำวัน (${tasks.length} งาน)`,
          html: emailHtml,
        });
      }

      logger.info('✅ ส่งอีเมลแจ้งเตือนตอนเช้าสำเร็จทั้งหมด!');

    } catch (error) {
      logger.error('❌ เกิดข้อผิดพลาดในการรัน Cron Job:', error);
    }
  }, {
    // 🌟 สำคัญมาก: ต้องตั้ง Timezone ให้เป็นเวลาไทย ไม่งั้นมันจะไปอิงตามเวลาของ Server บน Azure (มักจะเป็น UTC)
    timezone: "Asia/Bangkok"
  });
};