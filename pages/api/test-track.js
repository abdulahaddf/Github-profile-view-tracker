export default async function handler(req, res) {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: "Missing username" });
  }

  // Simulate a badge load by fetching the track endpoint
  const trackUrl = `${req.headers["x-forwarded-proto"] || "http"}://${
    req.headers.host
  }/api/track?user=${encodeURIComponent(username)}`;

  try {
    const response = await fetch(trackUrl);
    const data = await response.arrayBuffer();

    return res.status(200).json({
      success: true,
      message: `Simulated badge load for user: ${username}`,
      trackUrl,
      pixelSize: data.byteLength,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Failed to load pixel",
      message: err.message,
    });
  }
}
