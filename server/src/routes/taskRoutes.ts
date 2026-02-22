import {Router} from 'express'
import { AddTasks, showTasks } from '../controllers/taskController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.get("/show-tasks", authenticateToken, showTasks)
router.post("/add-tasks", authenticateToken, AddTasks)

export default router;