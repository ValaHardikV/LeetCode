import redis from "redis";
import "dotenv/config";


const redisClient = redis.createClient({
    username: process.env.RADIS_USER_NAME,
    password: process.env.RADIS_PASSWORD,
    socket: {
        host: process.env.RADIS_CONNECT_KEY,
        port: process.env.RADIS_PORT
    }
});

redisClient.on('error', (err) => {
    console.log('Redis Client Error', err);
});



export default redisClient;