import { fetchTrending } from "./fetchTrending";

const TTL = 1000 * 60 * 30;

export async function warmTmdbCache() {
  await Promise.all([
    getTmdbCached("movie", "day"),
    getTmdbCached("tv", "day"),
  ]);
}

export async function getTmdbCached(type = "movie", timeWindow = "day") {
  const key = `tmdb_${type}_${timeWindow}`;
  const cached = sessionStorage.getItem(key);
  const cachedTime = sessionStorage.getItem(`${key}_time`);

  if (cached && cachedTime && Date.now() - cachedTime < TTL) {
    return JSON.parse(cached);
  }

  const fresh = await fetchTrending(type, timeWindow);
  sessionStorage.setItem(key, JSON.stringify(fresh));
  sessionStorage.setItem(`${key}_time`, Date.now());
  return fresh;
}
