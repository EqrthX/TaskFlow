import app from "./app";
import logger from "./config/logger";
import {connectRedis} from "../src/config/redis";

const PORT = process.env.PORT || 3231;
try {
    await connectRedis();

    app.listen(PORT, () => {
        logger.info(`Server is running at http://localhost:${PORT}`);
    })
    
} catch (error) {
    logger.error("Error Running Server:",error)
    console.error("Error Running Server:", error);
}