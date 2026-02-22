import { Router } from 'express';
import { Login, Logout, Registination } from '../controllers/userController';

const router = Router();

/**
 * @swagger
 * /api/auth/login:
 * post:
 * summary: เข้าสู่ระบบ
 * tags: [Auth]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * email:
 * type: string
 * example: test@test.com
 * password:
 * type: string
 * example: password123
 * responses:
 * 200:
 * description: Login สำเร็จ คืนค่า Token
 * 400:
 * description: ข้อมูลไม่ถูกต้อง
 */
router.post("/login", Login);

/**
 * @swagger
 * /api/auth/register:
 * post:
 * summary: สมัครสมาชิกใหม่
 * tags: [Auth]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * email:
 * type: string
 * example: newuser@test.com
 * password:
 * type: string
 * example: password123
 * passwordCon:
 * type: string
 * example: password123
 * first_name:
 * type: string
 * example: Nontprawitch
 * last_name:
 * type: string
 * example: Saetang
 * responses:
 * 201:
 * description: สมัครสมาชิกเสร็จสิ้น
 * 400:
 * description: ข้อมูลไม่ครบ หรือ อีเมลซ้ำ
 */
router.post("/register", Registination);

router.post("/logout", Logout)
export default router;