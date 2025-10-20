export async function fetchTrending(type = "movie", timeWindow = "day") {
  try {
    const tmdbRes = await fetch(
      `/api/tmdb/trending?type=${type}&time=${timeWindow}`,
      { cache: "force-cache" }
    );
    const { results = [] } = await tmdbRes.json();

    // Giới hạn sớm (tránh gọi quá nhiều)
    const topItems = results.slice(0, 20);

    // Dùng Promise.allSettled để chạy song song & không chết chuỗi
    const mapped = await Promise.allSettled(
      topItems.map(async (item) => {
        const phimRes = await fetch(
          import.meta.env.VITE_API_SEARCH + "keyword=" + item.id
        );

        if (!phimRes.ok) return null;
        const data = await phimRes.json();

        const total = data?.data?.params?.pagination?.totalItems || 0;
        if (total === 0) return null;

        const phimItem = data.data.items[0];
        if (String(phimItem.tmdb.id) !== String(item.id)) return null;

        return phimItem;
      })
    );

    // Lọc những kết quả hợp lệ & đủ 10 phim
    const validMovies = mapped
      .map((r) => (r.status === "fulfilled" ? r.value : null))
      .filter(Boolean)
      .slice(0, 10);

    return validMovies;
  } catch (err) {
    console.error("⚠️ Lỗi khi fetch TMDB:", err);
    return [];
  }
}
