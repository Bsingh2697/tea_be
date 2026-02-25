import { createClient } from "redis";
import config from "@config/env";

const redisClient = createClient({ url: config.redis.url });

redisClient.on("error", (err) => console.error("Redis error: ", err));

redisClient.connect();

export default redisClient;
