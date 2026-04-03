const Redis = require('ioredis');

const redisOptions = {
    host: "172.27.106.238",
    port: 6379,
};

console.log("Connecting to Redis at:", redisOptions.host);
const redis = new Redis(redisOptions);

redis.on("connect", () => {
    console.log("✅ Successfully connected to Redis!");
    process.exit(0);
});

redis.on("error", (err) => {
    console.error("❌ Connection failed:", err.message);
    process.exit(1);
});

setTimeout(() => {
    console.error("❌ Connection timed out after 5 seconds");
    process.exit(1);
}, 5000);
