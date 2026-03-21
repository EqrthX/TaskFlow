import { Router } from 'express';
import { Login, Logout, Registination } from '../controllers/userController';
import { authLimiter } from '../middlewares/rateLimitMiddleware.js';

const router = Router();

router.post("/login", authLimiter ,Login);
router.post("/register", authLimiter ,Registination);
router.post("/logout", Logout)
export default router;