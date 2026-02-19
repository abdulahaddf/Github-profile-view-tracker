import { Redis } from "@upstash/redis";

// Singleton Redis client using Upstash env vars
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default redis;
