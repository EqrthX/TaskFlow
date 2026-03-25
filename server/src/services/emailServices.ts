import nodemailer from 'nodemailer';
import logger from '../config/logger'; // ถ้ามี logger ก็ใช้ได้เลย หรือใช้ console.log แทน
import dotenv from "dotenv";
dotenv.config();
// ตั้งค่าตัวส่งอีเมล (Transporter)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendNotificationEmail = async ({ to, subject, html }: EmailOptions) => {
  try {
    const info = await transporter.sendMail({
      from: `"TaskFlow Noti" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    
    logger.info(`Email sent successfully to ${to} (Message ID: ${info.messageId})`);
    return true;
  } catch (error) {
    logger.error('Error sending email:', error);
    return false;
  }
};