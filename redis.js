import redis from "redis";
import "dotenv/config";

const redisOption = {
  host: "localhost",
  port: process.env.REDIS_PORT,
  db: 0,
};

const redisClient = redis.createClient(redisOption);

redisClient
  .connect()
  .then(() => {
    console.log(`Redis connection established.... => ${"localhost"}:${process.env.REDIS_PORT}`);
  })
  .catch((err) => {
    console.log(`Redis connection error: ${err}`);
  });

redisClient.on("error", (err) => {
  console.log(`Redis client error: ${err}`);
});

export default redisClient;
