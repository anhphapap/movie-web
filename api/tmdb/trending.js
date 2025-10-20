// api/tmdb/trending.js
// ✅ Proxy cache cho TMDB Trending (movie/tv)

const cache = new Map(); // bộ nhớ tạm (Vercel edge instance riêng biệt)
const CACHE_TTL = 1000 * 60 * 30; // 10 phút

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
    const TMDB_URL = `https://api.themoviedb.org/3/trending/${type}/${time}?language=vi-VN&api_key=${TMDB_KEY}`;
    const response = await fetch(TMDB_URL);
    const data = await response.json();

    // Cache lại
    cache.set(key, { time: Date.now(), data });

    // Gửi kèm header cache
    res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate");
    res.status(200).json(data);
  } catch (error) {
    console.error("⚠️ Lỗi TMDB proxy:", error);
    res.status(500).json({ error: "TMDB proxy failed" });
  }
}
