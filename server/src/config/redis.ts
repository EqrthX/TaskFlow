import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379"

const redisClient = createClient({
    url: redisUrl
})

redisClient.on('error', (err) => console.error("Redis Client Error:", err));
redisClient.on('connect', () => console.log("Redis Connected Successfully"));

export const connectRedis = async () => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
    } catch (error) {
        console.error("Could not connect to Redis:", error)
    }
}

export default redisClient;