import redis from "../../lib/redis";

// 1x1 transparent PNG
const PIXEL = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64"
);

export default async function handler(req, res) {
  const { user } = req.query;

  if (!user) {
    res.status(400).end("Missing user");
    return;
  }

  // Sanitize username
  const username = user
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 39);

  // --- Parse visitor metadata ---
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] ||
    "unknown";

  // Get country from Vercel's edge header (automatically set when deployed)
  const country = req.headers["x-vercel-ip-country"] || "??";
  const city = req.headers["x-vercel-ip-city"] || "";
  const region = req.headers["x-vercel-ip-country-region"] || "";

  const referrer =
    req.headers["referer"] || req.headers["referrer"] || "direct";
  const ua = req.headers["user-agent"] || "";

  // Skip bot traffic
  const botPatterns =
    /bot|crawl|spider|slurp|mediapartners|googlebot|bingbot|yahoo|baidu|yandex|facebookexternalhit|twitterbot|linkedinbot|whatsapp|curl|wget|python|java|ruby|go-http/i;
  if (botPatterns.test(ua)) {
    res.setHeader("Content-Type", "image/png");
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, private"
    );
    res.send(PIXEL);
    return;
  }

  // Parse referrer to domain only
  let refDomain = "direct";
  try {
    if (referrer && referrer !== "direct") {
      refDomain = new URL(referrer).hostname.replace("www.", "");
    }
  } catch {}

  const visit = {
    ts: Date.now(),
    country,
    city,
    region,
    ref: refDomain,
    ua: ua.slice(0, 120),
  };

  try {
    // Store visit in a Redis sorted set (score = timestamp for range queries)
    // Key pattern: visits:{username}
    const key = `visits:${username}`;
    await redis.zadd(key, { score: visit.ts, member: JSON.stringify(visit) });

    // Keep only last 5000 entries per user (prune oldest)
    await redis.zremrangebyrank(key, 0, -5001);

    // Increment total counter
    await redis.incr(`total:${username}`);
  } catch (err) {
    // Silently fail — never break the image response
    console.error("Redis error:", err.message);
  }

  // Always respond with the transparent pixel
  res.setHeader("Content-Type", "image/png");
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate, private"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.send(PIXEL);
}
