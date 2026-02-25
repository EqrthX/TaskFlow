import { Router } from 'express';
import { Login, Logout, Registination } from '../controllers/userController';

const router = Router();

router.post("/login", Login);
router.post("/register", Registination);
router.post("/logout", Logout)
export default router;