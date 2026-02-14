import express  from "express";
import 'dotenv/config'
import type {Request, Response} from "express";
import cors from "cors"; 
import morgan from "morgan";
import logger from "./config/logger";

import userRoute from "./routes/userRotes";

const app = express();

app.use(cors())
app.use(express.json())

app.use(
    morgan("combined", {
        stream: {
            write: (message) => logger.info(message.trim())
        }
    })
)

app.get("/", (req: Request, res: Response) => {
    res.send("API is running...");
});
app.use("/api/auth",userRoute)

export default app;