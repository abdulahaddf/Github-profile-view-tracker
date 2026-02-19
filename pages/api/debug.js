import redis from "../../lib/redis";

export default async function handler(req, res) {
  const { user } = req.query;

  if (!user) {
    return res.status(400).json({ error: "Missing user parameter" });
  }

  const username = user
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 39);

  const key = `visits:${username}`;

  try {
    // Get all visits (no time filter)
    const visits = await redis.zrange(key, 0, -1);
    const total = await redis.get(`total:${username}`);

    console.log(`[DEBUG] Username: ${username}`);
    console.log(`[DEBUG] Key: ${key}`);
    console.log(`[DEBUG] Total visits in Redis: ${visits.length}`);
    console.log(`[DEBUG] Counter value: ${total}`);
    console.log(`[DEBUG] First visit sample:`, visits[0] ? JSON.parse(visits[0]) : null);

    return res.status(200).json({
      username,
      key,
      visitCount: visits.length,
      counter: total || 0,
      firstVisit: visits[0] ? JSON.parse(visits[0]) : null,
      redisConnected: true,
    });
  } catch (err) {
    console.error("[ERROR] Redis connection failed:", err);
    return res.status(500).json({
      error: "Failed to connect to Redis",
      message: err.message,
      redisConnected: false,
    });
  }
}
