import app from "./app";
import logger from "./config/logger";

const PORT = process.env.PORT || 3231;

app.listen(PORT, () => {
    logger.info(`Server is running at http://localhost:${PORT}`);
})