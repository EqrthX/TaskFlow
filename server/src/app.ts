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
const allowedOrigins = [
    'http://localhost:5173',
    'http://74.225.200.27'
]
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
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