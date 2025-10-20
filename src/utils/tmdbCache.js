import { fetchTrending } from "./fetchTrending";

const TTL = 1000 * 60 * 30; // 30 phút

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

  // Chỉ dùng cache nếu còn hạn VÀ dữ liệu không rỗng
  if (cached && cachedTime && Date.now() - cachedTime < TTL) {
    try {
      const parsedCache = JSON.parse(cached);
      // Kiểm tra cache có dữ liệu hợp lệ không
      if (Array.isArray(parsedCache) && parsedCache.length > 0) {
        console.log(`📦 Using cached data for ${type}`);
        return parsedCache;
      } else {
        console.log(`⚠️ Cache data invalid for ${type}, fetching fresh`);
        sessionStorage.removeItem(key);
        sessionStorage.removeItem(`${key}_time`);
      }
    } catch (err) {
      console.error(`❌ Cache parse error for ${type}:`, err);
      sessionStorage.removeItem(key);
      sessionStorage.removeItem(`${key}_time`);
    }
  }

  // Fetch fresh data
  const fresh = await fetchTrending(type, timeWindow);

  // Chỉ cache nếu có dữ liệu hợp lệ
  if (Array.isArray(fresh) && fresh.length > 0) {
    sessionStorage.setItem(key, JSON.stringify(fresh));
    sessionStorage.setItem(`${key}_time`, Date.now());
    console.log(`💾 Cached ${fresh.length} items for ${type}`);
  } else {
    console.warn(`⚠️ No valid data to cache for ${type}`);
  }

  return fresh;
}
