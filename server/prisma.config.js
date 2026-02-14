// ✅ ไม่ต้อง import dotenv ครับ (Prisma โหลดให้อัตโนมัติ)

import 'dotenv/config'

export default {
  datasource: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL, // ค่านี้จะมาเองถ้าไฟล์ .env ถูกต้อง
  },
};