const Redis = require('ioredis');
require('dotenv').config();

// Redis Configuration (Optimized for WSL2 and Scaling)
const redisOptions = {
    host: process.env.REDIS_HOST || "localhost", // Use localhost for WSL2 or local Windows Redis
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null, // Critical for BullMQ
};

const redisConnection = new Redis(redisOptions);

redisConnection.on("connect", () => {
    console.log(`✅ Redis CONNECT event: Connected to ${redisOptions.host}`);
});

redisConnection.on("ready", () => {
    console.log("🔥 Redis READY (usable)");
});

redisConnection.on("error", (err) => {
    console.error("❌ Redis ERROR:", err.message);
});

module.exports = {
    redisConnection,
    redisOptions
};
