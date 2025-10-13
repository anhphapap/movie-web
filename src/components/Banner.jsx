import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LazyImage from "./LazyImage";
import { getTmdbCached } from "../utils/tmdbCache";
import axios from "axios";
import { useMovieModal } from "../context/MovieModalContext";
const Banner = ({ type_slug = "phim-bo", filter = false }) => {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(false);
  const { openModal } = useMovieModal();
  const navigate = useNavigate();
  useEffect(() => {
    let isMounted = true;

    const fetchMovie = async () => {
      try {
        setLoading(true);

        const listType = type_slug === "phim-bo" ? "tv" : "movie";
        const movies = await getTmdbCached(listType, "week");

        if (!movies || movies.length === 0) {
          console.warn("No movies found");
          return;
        }

        const selectedMovie = movies[Math.floor(Math.random() * movies.length)];

        const { data } = await axios.get(
          `${import.meta.env.VITE_API_DETAILS}${selectedMovie.slug}`
        );

        if (isMounted) setMovie(data);
      } catch (err) {
        console.error("Error fetching movie banner:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMovie();

    return () => {
      isMounted = false;
    };
  }, [type_slug]);

  useEffect(() => {
    if (!movie?.poster_url) return;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = `${movie.poster_url}?tr=w-1280,q-70,f-auto`;
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, [movie]);

  if (loading || !movie) {
    return (
      <div
        className={`pt-12 relative w-screen aspect-square sm:aspect-auto overflow-hidden sm:overflow-visible mt-6`}
      >
        <div className="w-full sm:aspect-[16/5.5] aspect-square bg-neutral-700 animate-pulse"></div>
      </div>
    );
  } else {
    return (
      <div
        className={`px-[3%] pt-12 relative w-screen aspect-square sm:aspect-auto overflow-hidden sm:overflow-visible ${
          filter && "mt-12"
        }`}
      >
        <div className="absolute top-0 left-0 w-full aspect-video hidden sm:block">
          <LazyImage
            src={movie.movie.poster_url.split("movies/")[1]}
            alt={movie.movie.name}
            priority
            sizes="100vw"
          />
        </div>
        <div className="absolute top-0 left-0 w-full sm:hidden">
          <LazyImage
            src={movie.movie.thumb_url.split("movies/")[1]}
            alt={movie.movie.name}
            priority
            sizes="100vw"
          />
        </div>
        <div className="absolute top-0 left-0 w-full aspect-square sm:aspect-video bg-gradient-to-t from-[#141414] to-transparent z-0" />
        <div className="flex w-full h-full pb-4 sm:pb-0 sm:h-auto sm:aspect-[16/6] items-end justify-center sm:justify-start">
          <div className="flex flex-col justify-end z-10 space-y-3 w-2/3 xl:w-1/2">
            <div className="flex items-center space-x-1 justify-center sm:justify-start">
              <img
                className="h-[20px] object-cover"
                src="https://images.ctfassets.net/y2ske730sjqp/4aEQ1zAUZF5pLSDtfviWjb/ba04f8d5bd01428f6e3803cc6effaf30/Netflix_N.png"
              ></img>
              <span className="font-bold text-white text-xs tracking-[3px]">
                {movie.movie.type === "series"
                  ? "LOẠT PHIM"
                  : movie.movie.type === "hoathinh"
                  ? "HOẠT HÌNH"
                  : "PHIM"}
              </span>
            </div>
            <h1
              className="uppercase text-2xl sm:text-4xl lg:text-6xl xl:text-7xl font-bold tracking-tighter italic text-red-600 truncate line-clamp-3 sm:line-clamp-2 text-pretty text-center sm:text-left"
              style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.6)" }}
            >
              {movie.movie.origin_name}
            </h1>
            <div className="hidden md:block transition-all ease-linear duration-300">
              <div
                dangerouslySetInnerHTML={{ __html: movie.movie.content }}
                className=" text-white truncate line-clamp-3 text-pretty"
              />
            </div>
            <div className="flex justify-center sm:justify-start items-center space-x-3">
              <div className="relative rounded bg-white hover:bg-white/80 w-1/2 sm:w-auto flex items-center justify-center">
                {movie.episodes[0].server_data[0].link_embed !== "" ? (
                  <button
                    className="py-2 px-3 sm:px-7 lg:px-10 font-semibold flex items-center justify-center space-x-2"
                    onClick={() =>
                      navigate(`/xem-phim/${movie.movie.slug}?svr=${0}&ep=${0}`)
                    }
                  >
                    <FontAwesomeIcon icon="fa-solid fa-play" />
                    <span>Phát</span>
                  </button>
                ) : (
                  <button className="py-2 px-3 sm:px-7 lg:px-10 font-semibold flex items-center justify-center space-x-2">
                    <FontAwesomeIcon icon="fa-solid fa-bell" />
                    <span>Nhắc tôi</span>
                  </button>
                )}
              </div>
              <div className="relative rounded bg-white/30 hover:bg-white/20 w-1/2 sm:w-auto flex items-center justify-center">
                <button
                  className="py-2 px-3 sm:px-7 lg:px-10 text-white font-semibold flex items-center justify-center space-x-2"
                  onClick={() => openModal(movie.movie.slug)}
                >
                  <FontAwesomeIcon icon="fa-solid fa-circle-info" />
                  <span className="line-clamp-1 hidden sm:block">
                    Thông tin khác
                  </span>
                  <span className="line-clamp-1 sm:hidden">Chi tiết</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

Banner.propTypes = {
  openModal: PropTypes.func.isRequired,
};

export default Banner;
