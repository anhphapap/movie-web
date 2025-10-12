import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import { warmTmdbCache, getTmdbCached } from "../utils/tmdbCache";

const TopContext = createContext(null);

export const TopProvider = ({ children }) => {
  const [topSet, setTopSet] = useState(new Set());
  const [topMovies, setTopMovies] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        await warmTmdbCache();

        const movieData = await getTmdbCached("movie", "week");
        const tvData = await getTmdbCached("tv", "week");

        const combined = [...movieData, ...tvData];
        setTopMovies(combined);

        const slugSet = new Set(combined.map((m) => m.slug));
        setTopSet(slugSet);

        localStorage.setItem("top10", JSON.stringify(combined.slice(0, 10)));
      } catch (err) {
        console.error("⚠️ Lỗi load top trending:", err);
      }
    })();
  }, []);

  const value = useMemo(() => ({ topSet, topMovies }), [topSet, topMovies]);

  return <TopContext.Provider value={value}>{children}</TopContext.Provider>;
};

export const useTop = () => useContext(TopContext);
