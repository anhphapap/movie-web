import { fetchTrending } from "./fetchTrending";

export async function warmTmdbCache() {
  const cacheKeyMovie = "tmdb_movie_day";
  const cacheKeyTv = "tmdb_tv_day";

  const cachedMovie = sessionStorage.getItem(cacheKeyMovie);
  const cachedTv = sessionStorage.getItem(cacheKeyTv);
  if (cachedMovie && cachedTv) {
    return;
  }

  try {
    const [movieData, tvData] = await Promise.all([
      fetchTrending("movie", "day"),
      fetchTrending("tv", "day"),
    ]);

    sessionStorage.setItem(cacheKeyMovie, JSON.stringify(movieData));
    sessionStorage.setItem(cacheKeyTv, JSON.stringify(tvData));
  } catch (err) {
    console.error("⚠️ Lỗi warm cache TMDB:", err);
  }
}

export async function getTmdbCached(type = "movie", timeWindow = "day") {
  const key = `tmdb_${type}_${timeWindow}`;
  const cached = sessionStorage.getItem(key);
  if (cached) return JSON.parse(cached);

  const fresh = await fetchTrending(type, timeWindow);
  sessionStorage.setItem(key, JSON.stringify(fresh));
  return fresh;
}
