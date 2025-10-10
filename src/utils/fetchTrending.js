export async function fetchTrending(type = "movie", timeWindow = "week") {
  const TMDB_API_KEY = import.meta.env.VITE_TMDB_KEY;
  const TMDB_URL = `https://api.themoviedb.org/3/trending/${type}/${timeWindow}?language=vi-VN&api_key=${TMDB_API_KEY}`;

  try {
    const tmdbRes = await fetch(TMDB_URL);
    const { results = [] } = await tmdbRes.json();

    const validMovies = [];

    for (const item of results) {
      const phimRes = await fetch(
        import.meta.env.VITE_API_SEARCH + "keyword=" + item.id
      );
      if (!phimRes.ok) continue;

      const data = await phimRes.json();
      if (data?.data?.params?.pagination?.totalItems > 0) {
        const phimItem = data.data.items[0];
        if (String(phimItem.tmdb.id) === String(item.id)) {
          validMovies.push(phimItem);
        }
      }

      if (validMovies.length >= 10) break;
    }

    return validMovies;
  } catch (err) {
    console.error("Lỗi khi fetch phim:", err);
    return [];
  }
}
