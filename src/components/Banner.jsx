import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import LazyImage from "./LazyImage";
import { getTmdbCached } from "../utils/tmdbCache";
import axios from "axios";
import { useMovieModal } from "../context/MovieModalContext";
import { getYoutubeId } from "../utils/data";
import YouTube from "react-youtube";

const Banner = ({ type_slug = "phim-bo", filter = false }) => {
  const [movie, setMovie] = useState(null);
  const [player, setPlayer] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [fadeOutImage, setFadeOutImage] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isVideoPaused, setIsVideoPaused] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const bannerRef = useRef(null);
  const { openModal, isModalOpen } = useMovieModal();
  const navigate = useNavigate();
  useEffect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [intervalId]);

  // Page Visibility API - dừng video khi chuyển tab hoặc mất focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      setIsPageVisible(isVisible);

      if (player && player.getPlayerState) {
        try {
          if (!isVisible) {
            // Tab không visible - dừng video nếu đang phát
            console.log("Tab không visible, dừng video");
            if (player.getPlayerState() === window.YT.PlayerState.PLAYING) {
              player.pauseVideo();
              setIsVideoPaused(true);
            }
          } else {
            // Tab visible - tiếp tục phát video nếu đang pause và không có modal
            console.log("Tab visible, kiểm tra tiếp tục phát video");
            if (
              player.getPlayerState() === window.YT.PlayerState.PAUSED &&
              !isModalOpen
            ) {
              // Kiểm tra xem banner có trong viewport không
              const rect = bannerRef.current?.getBoundingClientRect();
              const isInViewport =
                rect && rect.top < window.innerHeight && rect.bottom > 0;

              if (isInViewport) {
                console.log("Tiếp tục phát video sau khi quay lại tab");
                player.playVideo();
                setIsVideoPaused(false);
              }
            }
          }
        } catch (error) {
          console.warn("Error in visibility change:", error);
        }
      }
    };

    // Lắng nghe sự kiện visibility change
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [player, isModalOpen, isVideoPaused]);

  // Window Focus API - dừng video khi mất focus khỏi cửa sổ trình duyệt
  useEffect(() => {
    const handleWindowFocus = () => {
      console.log("Cửa sổ có focus");
      setIsPageVisible(true);

      if (player && player.getPlayerState) {
        try {
          // Cửa sổ có focus - tiếp tục phát video nếu đang pause và không có modal
          if (
            player.getPlayerState() === window.YT.PlayerState.PAUSED &&
            !isModalOpen
          ) {
            // Kiểm tra xem banner có trong viewport không
            const rect = bannerRef.current?.getBoundingClientRect();
            const isInViewport =
              rect && rect.top < window.innerHeight && rect.bottom > 0;

            if (isInViewport) {
              console.log("Tiếp tục phát video sau khi cửa sổ có focus");
              player.playVideo();
              setIsVideoPaused(false);
            }
          }
        } catch (error) {
          console.warn("Error in window focus:", error);
        }
      }
    };

    const handleWindowBlur = () => {
      console.log("Cửa sổ mất focus");
      setIsPageVisible(false);

      if (player && player.getPlayerState) {
        try {
          // Cửa sổ mất focus - dừng video nếu đang phát
          if (player.getPlayerState() === window.YT.PlayerState.PLAYING) {
            console.log("Dừng video do mất focus cửa sổ");
            player.pauseVideo();
            setIsVideoPaused(true);
          }
        } catch (error) {
          console.warn("Error in window blur:", error);
        }
      }
    };

    // Lắng nghe sự kiện focus và blur của cửa sổ
    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [player, isModalOpen]);

  // Intersection Observer để dừng video khi scroll ra khỏi viewport
  useEffect(() => {
    if (!bannerRef.current || !player) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        try {
          if (entry.isIntersecting) {
            // Video vào viewport - tiếp tục phát nếu chưa bị pause bởi modal
            console.log(
              "Video vào viewport, isModalOpen:",
              isModalOpen,
              "isVideoPaused:",
              isVideoPaused
            );
            if (!isModalOpen && isVideoPaused && player.getPlayerState) {
              const state = player.getPlayerState();
              if (state === window.YT.PlayerState.PAUSED) {
                console.log("Tiếp tục phát video");
                player.playVideo();
                setIsVideoPaused(false);
              }
            }
          } else {
            // Video ra khỏi viewport - dừng video
            console.log("Video ra khỏi viewport");
            if (
              player.getPlayerState &&
              player.getPlayerState() === window.YT.PlayerState.PLAYING
            ) {
              console.log("Dừng video do scroll");
              player.pauseVideo();
              setIsVideoPaused(true);
            }
          }
        } catch (error) {
          console.warn("Error in intersection observer:", error);
        }
      },
      {
        threshold: 0.2,
        rootMargin: "0px",
      }
    );

    observer.observe(bannerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [player, isModalOpen, isVideoPaused]);

  // Dừng video khi mở modal
  useEffect(() => {
    if (!player || !player.getPlayerState) return;

    try {
      if (isModalOpen) {
        // Modal mở - dừng video
        console.log("Modal mở, dừng video");
        if (player.getPlayerState() === window.YT.PlayerState.PLAYING) {
          player.pauseVideo();
          setIsVideoPaused(true);
          console.log("Video đã dừng do modal");
        }
      } else if (isVideoPaused) {
        // Modal đóng và video đang bị pause - tiếp tục phát nếu trong viewport
        console.log("Modal đóng, kiểm tra tiếp tục phát video");
        const rect = bannerRef.current?.getBoundingClientRect();
        const isInViewport =
          rect && rect.top < window.innerHeight && rect.bottom > 0;

        if (
          isInViewport &&
          player.getPlayerState() === window.YT.PlayerState.PAUSED
        ) {
          console.log("Tiếp tục phát video sau khi đóng modal");
          player.playVideo();
          setIsVideoPaused(false);
        }
      }
    } catch (error) {
      console.warn("Error in modal video control:", error);
    }
  }, [isModalOpen, player, isVideoPaused]);

  const getLogo = async (api_path) => {
    const res = await axios.get(api_path);
    const logo = res.data?.logos?.find((l) => l.aspect_ratio >= 2);
    return logo ? logo.file_path : null;
  };

  const [playerOptions, setPlayerOptions] = useState({
    height: "100%",
    width: "100%",
    playerVars: {
      autoplay: 1,
      mute: 1,
      controls: 0,
      modestbranding: 1,
      rel: 0,
      iv_load_policy: 3,
      showinfo: 0,
      fs: 0,
      disablekb: 1,
      playsinline: 1,
    },
  });

  const handleToggleMute = () => {
    if (!player) return;
    if (isMuted) player.unMute();
    else player.mute();
    setIsMuted((prev) => !prev);
  };

  useEffect(() => {
    setMovie(null);
    setPlayer(null);
    setIsMuted(true);
    setShowTrailer(false);
    setFadeOutImage(false);
    setLoading(false);
    setIsVideoPaused(false);
    setIsPageVisible(true);
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }

    // Reset về trạng thái ban đầu
    setTimeout(() => {
      setShowTrailer(true);
    }, 300);
  }, [type_slug]);

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

        const [data, image] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_DETAILS}${selectedMovie.slug}`),
          getLogo(
            `https://api.themoviedb.org/3/${selectedMovie.tmdb.type}/${
              selectedMovie.tmdb.id
            }/images?api_key=${
              import.meta.env.VITE_TMDB_KEY
            }&include_image_language=en-US&language=en-US`
          ),
        ]);

        if (isMounted) setMovie({ ...data.data, tmdb_image: image });
      } catch (err) {
        console.error("Error fetching movie banner:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMovie();

    if (!isMuted) {
      setPlayerOptions({
        ...playerOptions,
        playerVars: { ...playerOptions.playerVars, mute: 0 },
      });
    } else {
      setPlayerOptions({
        ...playerOptions,
        playerVars: { ...playerOptions.playerVars, mute: 1 },
      });
    }
    const t = setTimeout(() => setShowTrailer(true), 300);

    return () => {
      isMounted = false;
      clearTimeout(t);

      // Cleanup player an toàn
      if (player) {
        try {
          if (player.destroy && typeof player.destroy === "function") {
            player.destroy();
          }
        } catch (error) {
          console.warn("Error destroying player:", error);
        }
      }

      // Cleanup interval
      if (intervalId) {
        clearInterval(intervalId);
      }

      setPlayer(null);
      setIntervalId(null);
      setIsMuted(true);
      setShowTrailer(false);
      setFadeOutImage(false);
      setLoading(false);
      setMovie(null);
      setIsVideoPaused(false);
      setIsPageVisible(true);
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
        <div className="w-full sm:aspect-[16/5.5] aspect-square bg-neutral-900 animate-pulse"></div>
      </div>
    );
  }
  const youtubeId = getYoutubeId(movie.movie.trailer_url);
  return (
    <div
      ref={bannerRef}
      className={`px-[3%] sm:mb-0 -mb-6 xs:-mb-12 pt-12 relative w-screen aspect-video sm:aspect-auto overflow-visible ${
        filter && "mt-12"
      }`}
    >
      {youtubeId && showTrailer && (
        <div
          className={`absolute top-0 left-0 w-full aspect-video transition-opacity duration-700 ease-in-out ${
            fadeOutImage ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <YouTube
            videoId={youtubeId}
            opts={playerOptions}
            className="aspect-video object-cover pointer-events-none absolute w-full h-full top-0 left-0 z-0 rounded-t-lg"
            onReady={(e) => {
              try {
                const ytPlayer = e.target;
                const iframe = ytPlayer.getIframe();

                // Kiểm tra an toàn trước khi truy cập iframe
                if (!iframe || !iframe.src) {
                  console.warn("YouTube iframe not ready");
                  return;
                }

                iframe.style.pointerEvents = "none";
                setPlayer(ytPlayer);

                // Phát video ngay khi ready
                ytPlayer.playVideo();
                if (isMuted) ytPlayer.mute();

                // Set trạng thái video đang phát
                setIsVideoPaused(false);

                const id = setInterval(() => {
                  try {
                    // Kiểm tra player vẫn tồn tại
                    if (
                      !ytPlayer ||
                      !ytPlayer.getDuration ||
                      !ytPlayer.getCurrentTime
                    ) {
                      clearInterval(id);
                      return;
                    }

                    const duration = ytPlayer.getDuration();
                    const current = ytPlayer.getCurrentTime();

                    if (current > 2) setFadeOutImage(true);

                    if (duration - current <= 6) {
                      clearInterval(id);
                      setIntervalId(null);
                      ytPlayer.stopVideo();

                      setFadeOutImage(false);
                      setTimeout(() => setShowTrailer(false), 800);
                    }
                  } catch (error) {
                    console.warn("Error in video interval:", error);
                    clearInterval(id);
                    setIntervalId(null);
                  }
                }, 500);

                setIntervalId(id);
                ytPlayer._checkTime = id;
              } catch (error) {
                console.error("Error in onReady:", error);
              }
            }}
            onStateChange={(e) => {
              try {
                if (e.data === window.YT.PlayerState.ENDED) {
                  if (intervalId) {
                    clearInterval(intervalId);
                    setIntervalId(null);
                  }

                  setFadeOutImage(false);
                  setTimeout(() => setShowTrailer(false), 800);
                }

                if (e.data === window.YT.PlayerState.PAUSED) {
                  if (intervalId) {
                    clearInterval(intervalId);
                    setIntervalId(null);
                  }
                }
              } catch (error) {
                console.warn("Error in onStateChange:", error);
              }
            }}
          />
        </div>
      )}
      <div
        className={`block absolute top-0 left-0 z-0 w-full aspect-video transition-opacity duration-1000 ease-in-out ${
          fadeOutImage ? "opacity-0" : "opacity-100"
        }`}
      >
        <LazyImage
          src={movie.movie.poster_url.split("movies/")[1]}
          alt={movie.movie.name}
          priority
          sizes="100vw"
        />
      </div>

      {/* <div className="absolute top-0 left-0 w-full sm:hidden">
        <LazyImage
          src={movie.movie.thumb_url.split("movies/")[1]}
          alt={movie.movie.name}
          priority
          sizes="100vw"
        />
      </div> */}
      <div className="absolute top-0 left-0 w-full aspect-video bg-gradient-to-t from-[#141414] to-transparent z-0" />
      <div className="flex flex-col w-full h-full pb-4 sm:pb-0 sm:h-auto sm:aspect-[16/6] items-start justify-center sm:justify-end gap-4">
        <div className="flex flex-col justify-end z-10 space-y-3 w-2/3 xl:w-1/2 px-[3%] sm:px-0">
          <div className="flex items-center space-x-1 justify-start">
            <img
              className="h-[15px] sm:h-[20px] object-cover"
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
          <div
            className={`w-2/3 md:w-1/2 lg:w-2/3 items-start object-cover transition-all ease-linear delay-[3000ms] duration-[1000ms] ${
              fadeOutImage
                ? "scale-75 -translate-x-[12.5%]"
                : "scale-100 translate-x-0"
            }`}
          >
            {movie?.tmdb_image ? (
              <LazyImage
                src={"https://image.tmdb.org/t/p/" + movie.tmdb_image}
                alt={movie.movie.name}
                sizes="(max-width: 640px) 30vw, (max-width: 1400px) 40vw, 50vw"
                priority
              />
            ) : (
              <h1
                className="uppercase text-2xl sm:text-4xl lg:text-6xl xl:text-7xl font-bold tracking-tighter italic text-red-600 truncate line-clamp-3 sm:line-clamp-2 text-pretty text-center sm:text-left"
                style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.6)" }}
              >
                {movie.movie.origin_name}
              </h1>
            )}
          </div>
          <div
            className={`hidden md:block transition-all ease-linear delay-[1000ms] duration-[2000ms] overflow-hidden ${
              fadeOutImage ? "max-h-0 opacity-0 " : "max-h-full opacity-100"
            }`}
          >
            <div
              dangerouslySetInnerHTML={{ __html: movie.movie.content }}
              className=" text-white truncate line-clamp-3 text-pretty"
            />
          </div>
        </div>
        <div className="flex justify-between items-center w-full px-[3%] sm:px-0">
          <div className="flex sm:space-x-3 space-x-1 w-full sm:w-auto">
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
          <div className="absolute right-[3%] sm:right-0 bottom-[40%] -translate-x-1/2 sm:-translate-x-0 sm:bottom-0 flex items-center justify-center z-10 sm:space-x-3">
            {showTrailer && youtubeId && fadeOutImage && (
              <button
                onClick={handleToggleMute}
                className="text-white border-2 cursor-pointer border-white/40 bg-black/10 p-1 sm:p-2 lg:p-3 aspect-square h-full rounded-full flex items-center justify-center hover:border-white transition-all ease-linear"
              >
                <div className="sm:w-5 sm:h-5 h-3 w-3 flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={
                      isMuted
                        ? "fa-solid fa-volume-xmark"
                        : "fa-solid fa-volume-high"
                    }
                    className="text-xs sm:text-lg"
                    size="xs"
                  />
                </div>
              </button>
            )}
            <div className="sm:flex hidden text-white justify-center h-4 sm:h-8 lg:h-10 items-center pr-10 lg:pr-14 pl-2 bg-[#515151]/60 border-l-4 border-[#e50914]">
              <span className="font-semibold">{movie.movie.quality}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Banner.propTypes = {
  openModal: PropTypes.func.isRequired,
};

export default Banner;
