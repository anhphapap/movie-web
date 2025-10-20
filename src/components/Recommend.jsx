import React, { useState, useEffect } from "react";
import LazyImage from "./LazyImage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Tooltip from "./Tooltip";
import axios from "axios";
import { useFavorites } from "../context/FavouritesProvider";
import { useNavigate } from "react-router-dom";
import { useInView } from "react-intersection-observer";
export default function Recommend({
  type = "phim-moi-cap-nhat",
  sort_field = "_id",
  country = "",
  category = "",
  totalPage = 3,
  slug = "",
}) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { favorites, toggleFavorite, loadingFav } = useFavorites();
  const isFavourite = (slug) => favorites.some((m) => m.slug === slug);
  const navigate = useNavigate();
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const handleToggleFavorite = (e, movie) => {
    e.stopPropagation();
    toggleFavorite({
      slug: movie.slug,
      poster_url: movie.poster_url,
      thumb_url: movie.thumb_url,
      name: movie.name,
      year: movie.year,
      episode_current: movie.episode_current,
      quality: movie.quality,
      category: movie.category,
      tmdb: movie.tmdb,
      modified: movie.modified,
    });
  };

  const fetchMovies = async () => {
    try {
      console.log("here");
      if (!hasMore) return;
      setLoading(true);
      const api = `${
        import.meta.env.VITE_API_LIST
      }${type}?sort_field=${sort_field}&category=${category}&country=${country}&page=${page}&limit=6`;
      const res = await axios.get(api);
      const items = res.data.data.items || [];
      setMovies((prev) => [...prev, ...items]);
      setHasMore(page < totalPage);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!inView) return;
    fetchMovies();
  }, [inView]);

  useEffect(() => {
    setMovies([]);
    setPage(1);
    setHasMore(true);
  }, [type, sort_field, country, category]);

  useEffect(() => {
    if (inView && hasMore) fetchMovies();
  }, [page]);
  return (
    <div className="text-white pt-4 border-t-[1px] border-white/20" ref={ref}>
      <h2 className="text-base lg:text-xl font-bold">Nội dung tương tự</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
        {movies?.length > 0 &&
          movies
            .filter((m) => slug && m.slug !== slug)
            .map((movie) => (
              <div
                key={movie._id + "recommend"}
                className="flex flex-col bg-[#2f2f2f] rounded overflow-hidden group cursor-pointer"
                onClick={() =>
                  navigate(`/xem-phim/${movie.slug}?svr=${0}&ep=${0}`)
                }
              >
                <div className="relative w-full aspect-video">
                  <LazyImage
                    src={movie.poster_url}
                    alt={movie.name}
                    sizes="(max-width: 640px) 35vw,(max-width: 1280px) 20vw, (max-width: 1540px) 18vw,14vw"
                    quality={65}
                  />
                  <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b to-transparent from-[#141414]/50"></div>
                  <span className="absolute top-1 right-2 text-white text-sm">
                    {movie.episode_current.toLowerCase().includes("hoàn tất")
                      ? "Hoàn tất"
                      : movie.episode_current}
                  </span>
                  <div className="absolute bottom-0 left-0 w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all ease-in duration-100">
                    <div className="h-12 w-12 flex items-center justify-center bg-black/40 rounded-full border-[1px] border-white">
                      <FontAwesomeIcon
                        icon="fa-solid fa-play"
                        size="2x"
                        className="text-white translate-x-[2px]"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2 items-center justify-between text-white/80 text-sm p-2 sm:p-4">
                  <div className="flex gap-x-2 gap-y-1  items-center flex-wrap">
                    <span className="text-xs leading-[14px] px-1 py-0 border-[0.5px] rounded uppercase flex items-center justify-center">
                      {movie.quality}
                    </span>
                    <span className="lowercase">{movie.year}</span>
                    {movie.imdb?.vote_count > 0 ? (
                      <a
                        className="flex items-center space-x-1 text-xs border-[1px] border-yellow-500 rounded-md leading-[14px] px-1 py-[2px] bg-yellow-500/10 hover:bg-yellow-500/20 transition-all ease-linear"
                        href={`https://www.imdb.com/title/${movie.imdb.id}`}
                        target="_blank"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-yellow-500">IMDb</span>
                        <span className="font-bold">
                          {movie.imdb.vote_average.toFixed(1)}
                        </span>
                      </a>
                    ) : (
                      movie.tmdb?.vote_count > 0 && (
                        <a
                          className="flex items-center space-x-1 text-xs border-[1px] border-[#01b4e4] rounded-md leading-[14px] px-1 py-[2px] bg-[#01b4e4]/10 hover:bg-[#01b4e4]/20 transition-all ease-linear"
                          href={`https://www.themoviedb.org/${
                            movie.type == "single" ? "movie" : "tv"
                          }/${movie.tmdb.id}`}
                          target="_blank"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="text-[#01b4e4]">TMDB</span>
                          <span className="font-bold">
                            {movie.tmdb.vote_average.toFixed(1)}
                          </span>
                        </a>
                      )
                    )}
                  </div>
                  <div
                    className={`relative group/tooltip aspect-square text-white border-2 cursor-pointer bg-black/10 rounded-full h-[40px] w-[40px] flex items-center justify-center hover:border-white ${
                      isFavourite(movie.slug)
                        ? "border-red-500"
                        : "border-white/40"
                    }`}
                    onClick={(e) => handleToggleFavorite(e, movie)}
                  >
                    <FontAwesomeIcon
                      icon={
                        loadingFav
                          ? "fa-solid fa-spinner"
                          : `fa-${
                              isFavourite(movie.slug) ? "solid" : "regular"
                            } fa-heart`
                      }
                      size="sm"
                      className={`${
                        isFavourite(movie.slug) ? "text-red-500" : "text-white"
                      } ${loadingFav ? "animate-spin" : ""}`}
                    />
                    <Tooltip
                      content={
                        isFavourite(movie.slug) ? "Bỏ thích" : "Yêu thích"
                      }
                      size="sm"
                    />
                  </div>
                </div>
                <h2 className="text-white text-base font-bold truncate p-2 sm:p-4 !pt-0">
                  {movie.name}
                </h2>
              </div>
            ))}
        {loading &&
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="w-full h-full bg-gray-700 rounded aspect-video"></div>
            </div>
          ))}
      </div>
      {hasMore && (
        <div className="relative border-b-[1.6px] border-white/20 w-full">
          <button
            onClick={() => setPage(page + 1)}
            className="absolute group/tooltip bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 aspect-square px-[10px] py-[1px] rounded-full bg-[#141414]/50 border-white/60 border-[1.4px] text-white hover:border-white transition-all ease-linear"
          >
            <FontAwesomeIcon icon="fa-solid fa-chevron-down" size="xs" />
            <Tooltip content={"Xem thêm"} />
          </button>
        </div>
      )}
    </div>
  );
}
