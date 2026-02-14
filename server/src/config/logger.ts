import winston from "winston";
import "winston-daily-rotate-file";

const logFormat = winston.format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level}]: ${message}`;
});

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        logFormat
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                logFormat
            )
        }),
        new winston.transports.DailyRotateFile({
            filename: 'logs/error-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true, // บีบอัดไฟล์เก่าเป็น .zip ประหยัดที่
            maxSize: '20m',      // ถ้าไฟล์ใหญ่เกิน 20MB ให้ตัดไฟล์ใหม่
            maxFiles: '14d',     // เก็บย้อนหลังแค่ 14 วัน
            level: 'error',      // เก็บเฉพาะ Error เท่านั้น
        }),

        // 3. บันทึกทุกอย่างลงไฟล์รวม (หมุนทุกวัน)
        new winston.transports.DailyRotateFile({
            filename: 'logs/application-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
        }),
    ]
})

export default logger