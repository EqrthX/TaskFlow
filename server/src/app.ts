import express  from "express";
import 'dotenv/config'
import type {Request, Response} from "express";
import cors from "cors"; 
import morgan from "morgan";
import logger from "./config/logger";
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger'; 
import cookieParser from 'cookie-parser'; // 1. import เข้ามา

import userRoute from "./routes/userRotes";
import taskRoute from "./routes/taskRoutes";

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
app.use(express.json())
app.use(cookieParser()); // 3. เปิดใช้งาน
app.use(
    morgan("combined", {
        stream: {
            write: (message) => logger.info(message.trim())
        }
    })
)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req: Request, res: Response) => {
    res.send("API is running...");
});
app.use("/api/auth",userRoute)
app.use("/api/tasks", taskRoute);
export default app;