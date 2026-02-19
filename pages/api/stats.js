import redis from "../../lib/redis";

const WINDOW_MS = {
  "1h": 3_600_000,
  "1d": 86_400_000,
  "7d": 604_800_000,
  "30d": 2_592_000_000,
  "1y": 31_536_000_000,
};

export default async function handler(req, res) {
  // CORS — allow requests from any origin (dashboard can be on same or different domain)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  if (req.method !== "GET") {
    res.status(405).end("Method not allowed");
    return;
  }

  const { user, window: win = "1d" } = req.query;

  if (!user) {
    res.status(400).json({ error: "Missing user" });
    return;
  }

  const username = user
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 39);
  const windowMs = WINDOW_MS[win] || WINDOW_MS["1d"];
  const cutoff = Date.now() - windowMs;
  const key = `visits:${username}`;

  try {
    // Fetch visits within the time window (sorted set range by score)
    const raw = await redis.zrangebyscore(key, cutoff, "+inf", {
      withScores: false,
    });

    const visits = raw
      .map((r) => {
        try {
          return typeof r === "string" ? JSON.parse(r) : r;
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    // --- Aggregations ---
    const total = visits.length;

    // Country breakdown
    const countryCounts = {};
    visits.forEach((v) => {
      const c = v.country || "??";
      countryCounts[c] = (countryCounts[c] || 0) + 1;
    });
    const topCountries = Object.entries(countryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([country, count]) => ({ country, count }));

    // Referrer breakdown
    const refCounts = {};
    visits.forEach((v) => {
      const r = v.ref || "direct";
      refCounts[r] = (refCounts[r] || 0) + 1;
    });
    const topReferrers = Object.entries(refCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([ref, count]) => ({ ref, count }));

    // Chart slots
    const SLOTS = { "1h": 12, "1d": 24, "7d": 7, "30d": 30, "1y": 12 };
    const slots = SLOTS[win] || 24;
    const slotMs = windowMs / slots;
    const now = Date.now();

    const chart = Array.from({ length: slots }, (_, i) => {
      const from = now - (slots - i) * slotMs;
      const to = from + slotMs;
      return visits.filter((v) => v.ts >= from && v.ts < to).length;
    });

    // Recent visits for the log (last 100)
    const log = visits
      .slice(-100)
      .reverse()
      .map((v) => ({
        ts: v.ts,
        country: v.country || "??",
        city: v.city || "",
        ref: v.ref || "direct",
      }));

    // All-time total from counter
    const allTimeTotal = await redis.get(`total:${username}`);

    res.status(200).json({
      username,
      window: win,
      total,
      allTime: Number(allTimeTotal) || total,
      chart,
      topCountries,
      topReferrers,
      log,
      generatedAt: Date.now(),
    });
  } catch (err) {
    console.error("Stats error:", err.message);
    res
      .status(500)
      .json({ error: "Failed to fetch stats", detail: err.message });
  }
}
