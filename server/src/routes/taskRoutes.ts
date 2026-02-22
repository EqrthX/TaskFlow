import {Router} from 'express'
import { AddTasks, DeleteTask, showTasks, UpdateStatusTask, UpdateTask } from '../controllers/taskController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.get("/show-tasks", authenticateToken, showTasks)
router.post("/add-tasks", authenticateToken, AddTasks)
router.patch("/update-task/:id", authenticateToken, UpdateStatusTask)
router.patch("/update-task-content/:id", authenticateToken, UpdateTask)
router.delete("/delete-task/:id", authenticateToken, DeleteTask)
export default router;