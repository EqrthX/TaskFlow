import rateLimit from "express-rate-limit";

export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 70,
    message: {
        message: "คุณส่งคำขอมากเกินไป กรุณารอซักครู่แล้วลองใหม่ (Too many request)"
    },
    standardHeaders: true,
    legacyHeaders: false
})

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // เวลา 15 นาที
  max: 10, // 🌟 1 IP ลองล็อกอินผิด/ยิง API ได้แค่ 5 ครั้ง!
  message: {
    message: 'คุณพยายามเข้าสู่ระบบบ่อยเกินไป กรุณารอ 15 นาทีแล้วลองใหม่'
  },
  standardHeaders: true,
  legacyHeaders: false,
});