// api/tmdb/trending.js
// ✅ Proxy cache cho TMDB Trending (movie/tv)

const cache = new Map(); // bộ nhớ tạm (Vercel edge instance riêng biệt)
const CACHE_TTL = 1000 * 60 * 30; // 30 phút

export default async function handler(req, res) {
  try {
    const { type = "movie", time = "day" } = req.query;
    const key = `${type}_${time}`;

    // Kiểm tra cache hiện có
    const cached = cache.get(key);
    if (cached && Date.now() - cached.time < CACHE_TTL) {
      return res.status(200).json(cached.data);
    }

    // Fetch TMDB
    const TMDB_KEY = process.env.TMDB_KEY;
    if (!TMDB_KEY) {
      console.error("❌ TMDB_KEY not set in environment");
      return res
        .status(500)
        .json({ error: "TMDB_KEY not configured", results: [] });
    }

    const TMDB_URL = `https://api.themoviedb.org/3/trending/${type}/${time}?language=vi-VN&api_key=${TMDB_KEY}`;
    const response = await fetch(TMDB_URL);

    if (!response.ok) {
      console.error(`❌ TMDB API error: ${response.status}`);
      return res
        .status(500)
        .json({ error: `TMDB API returned ${response.status}`, results: [] });
    }

    const data = await response.json();

    // Validate response
    if (!data.results || !Array.isArray(data.results)) {
      console.error("❌ Invalid TMDB response format");
      return res
        .status(500)
        .json({ error: "Invalid TMDB response", results: [] });
    }

    // Cache lại
    cache.set(key, { time: Date.now(), data });

    // Gửi kèm header cache
    res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate");
    res.status(200).json(data);
  } catch (error) {
    console.error("⚠️ Lỗi TMDB proxy:", error.message);
    res.status(500).json({ error: error.message, results: [] });
  }
}
