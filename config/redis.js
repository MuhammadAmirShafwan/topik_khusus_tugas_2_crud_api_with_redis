const redis = require('@redis/client');
require('dotenv').config();

const redisClient = redis.createClient({
    url: process.env.REDIS_URL,
});

async function connectRedis() {
    try {
        await redisClient.connect();
        console.log('Connected to Redis');
    } catch (err) {
        console.error('Failed to connect to Redis:', err);
        process.exit(1);
    }
}

connectRedis();

module.exports = redisClient;
