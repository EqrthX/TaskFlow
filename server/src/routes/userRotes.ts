import {Router} from 'express'
import { Login, Registination } from '../controllers/userController';
const router = Router();

router.post("/login", Login);
router.post("/register", Registination);

export default router;