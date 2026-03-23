import multer from 'multer';

// 🌟 Best Practice: ใช้ MemoryStorage 
// คือการเก็บไฟล์ที่ส่งมาไว้ใน RAM ชั่วคราว แล้วโยนขึ้น Azure เลย (ไม่ต้องเซฟลง Harddisk เซิร์ฟเวอร์ให้รก)
const storage = multer.memoryStorage();

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // จำกัดขนาดไฟล์รูปละไม่เกิน 5MB (กันคนโยนไฟล์ยักษ์มาใส่)
  },
  fileFilter: (req, file, cb) => {
    // เช็คว่าต้องเป็นไฟล์รูปภาพเท่านั้น
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('รองรับเฉพาะไฟล์รูปภาพเท่านั้น!'));
    }
  }
});