import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { toast } from "react-toastify";
import { UserAuth } from "../context/AuthContext";
import {
  LoaderCircle,
  Captions,
  Server,
  TvMinimalPlay,
  Info,
  Heart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import logo_n from "../assets/images/N_logo.png";
import LazyImage from "../components/LazyImage";
import SEO from "../components/SEO";
import { useFavorites } from "../context/FavouritesProvider";
import { useTop } from "../context/TopContext";
import Top10Icon from "../assets/images/Top10Icon.svg";
import { useWatching } from "../context/WatchingContext";
import { formatSecondsToMinutes } from "../utils/data";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import Recommend from "../components/Recommend";
const WatchPage = () => {
  const { movieSlug } = useParams();

  // Đọc resume data từ localStorage
  const [resumeData, setResumeData] = useState(null);
  const [episodesRange, setEpisodesRange] = useState(0);
  const [movie, setMovie] = useState([]);
  const [loading, setLoading] = useState(false);
  const { favoriteSlugs, toggleFavorite, loadingFav } = useFavorites();
  const [isFavourite, setIsFavourite] = useState(false);
  const [peoples, setPeoples] = useState([]);
  const [server, setServer] = useState(0);
  const { user } = UserAuth();
  const navigate = useNavigate();
  const shouldAutoPlayRef = useRef(false);
  const { topSet } = useTop();
  const [watchingMovie, setWatchingMovie] = useState(null);
  const { getWatchingMovie, watchingSlugs, loadingWatching } = useWatching();

  // Swiper navigation refs
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const [swiperHeight, setSwiperHeight] = useState(0);
  const [canSlidePrev, setCanSlidePrev] = useState(false);
  const [canSlideNext, setCanSlideNext] = useState(true);
  useEffect(() => {
    // Đợi cho đến khi watching data đã load xong
    if (loadingWatching) return;
    setWatchingMovie(getWatchingMovie(movieSlug) || null);
  }, [watchingSlugs, movieSlug, loadingWatching, getWatchingMovie]);

  useEffect(() => {
    if (favoriteSlugs.includes(movieSlug)) {
      setIsFavourite(true);
    } else {
      setIsFavourite(false);
    }
  }, [favoriteSlugs, movieSlug]);

  const handlePlayMovie = async (movie) => {
    // Lưu thông tin resume vào localStorage
    const resumeData = {
      slug: movie.slug,
      currentTime: movie.currentTime || 0,
      duration: movie.duration || 0,
      progress: movie.progress || 0,
      timestamp: Date.now(),
    };

    localStorage.setItem("resumeVideo", JSON.stringify(resumeData));

    // Trên mobile, request fullscreen NGAY trước khi navigate
    if (window.innerWidth < 1024) {
      try {
        const docEl = document.documentElement;

        // Request fullscreen trên document
        if (docEl.requestFullscreen) {
          await docEl.requestFullscreen();
        } else if (docEl.webkitRequestFullscreen) {
          await docEl.webkitRequestFullscreen();
        } else if (docEl.mozRequestFullScreen) {
          await docEl.mozRequestFullScreen();
        } else if (docEl.msRequestFullscreen) {
          await docEl.msRequestFullscreen();
        }

        console.log("Fullscreen requested before navigation");

        // Lock orientation
        if (screen.orientation && screen.orientation.lock) {
          try {
            await screen.orientation.lock("landscape");
          } catch (err) {
            console.log("Orientation lock failed:", err);
          }
        }
      } catch (err) {
        console.log("Fullscreen before navigate failed:", err);
      }
    }

    // Navigate với delay nhỏ để fullscreen hoàn tất
    setTimeout(() => {
      navigate(`/xem-phim/${movie.slug}?svr=${movie.svr}&ep=${movie.episode}`);
    }, 100);
  };

  useEffect(() => {
    const fetchMovie = async () => {
      setLoading(true);
      try {
        const [movieRes, peoplesRes] = await Promise.allSettled([
          axios.get(`${import.meta.env.VITE_API_DETAILS}${movieSlug}`),
          axios.get(`${import.meta.env.VITE_API_DETAILS}${movieSlug}/peoples`),
        ]);

        if (movieRes.status === "fulfilled") {
          setMovie(movieRes.value.data.data || []);
        } else {
          setMovie([]);
        }

        if (peoplesRes.status === "fulfilled") {
          setPeoples(peoplesRes.value.data.data.peoples || []);
        } else {
          setPeoples([]);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [movieSlug]);

  // Clear resume data sau khi video đã seek xong
  useEffect(() => {
    if (resumeData) {
      // Clear sau 3 giây để đảm bảo video đã seek và play xong
      const timer = setTimeout(() => {
        setResumeData(null);
        localStorage.removeItem("resumeVideo");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [resumeData]);

  // Validate and reset server if invalid
  useEffect(() => {
    if (
      movie?.item?.episodes &&
      server &&
      (!movie.item.episodes[server] || !movie.item.episodes[server].server_data)
    ) {
      // Server không hợp lệ, reset về 0
      setServer(0);
    }
  }, [movie, server]);

  const handleSaveMovie = () => {
    toggleFavorite({
      slug: movie.item.slug,
      poster_url: movie.item.poster_url,
      thumb_url: movie.item.thumb_url,
      name: movie.item.name,
      year: movie.item.year,
      episode_current: movie.item.episode_current,
      quality: movie.item.quality,
      category: movie.item.category,
      tmdb: movie.item.tmdb,
      modified: movie.item.modified,
      addedAt: new Date().toISOString(),
    });
  };

  if (loading || !movie?.item)
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <FontAwesomeIcon
          icon="fa-solid fa-spinner"
          size="2xl"
          className="animate-spin text-white"
        />
      </div>
    );

  const watchPageSEO = movie?.seoOnPage;

  return (
    <div className="min-h-screen flex flex-col">
      {watchPageSEO && (
        <SEO seoData={watchPageSEO} baseUrl={window.location.origin} />
      )}
      <div className="px-[3%] relative w-screen aspect-square sm:aspect-video lg:aspect-[16/6] overflow-visible">
        <div
          className={`sm:block hidden absolute top-0 left-0 w-full aspect-video lg:aspect-[16/6] transition-opacity duration-1000 ease-in-out`}
        >
          <LazyImage
            src={movie.item.poster_url}
            alt={movie.item.name}
            sizes="100vw"
            className="object-top"
            priority
          />
        </div>
        <div
          className={`sm:hidden block absolute z-0 top-0 left-0 w-full aspect-[2/3] transition-opacity duration-1000 ease-in-out`}
        >
          <LazyImage
            src={movie.item.thumb_url}
            alt={movie.item.name}
            sizes="100vw"
            className="object-top"
            priority
          />
        </div>
        <div className="absolute top-0 left-0 w-full aspect-[2/3] sm:aspect-video lg:aspect-[16/6] bg-gradient-to-t from-[#141414] to-transparent z-0" />
        <div className="flex flex-col w-full h-full aspect-square sm:aspect-[16/3] items-center sm:items-start justify-center sm:justify-end gap-2">
          <div className="h-full flex flex-col justify-end z-10 space-y-1 w-full sm:w-2/3 xl:w-1/2 px-[3%] sm:px-0">
            <div className="flex items-center space-x-1 sm:justify-start justify-center">
              <img
                className="h-[15px] sm:h-[20px] object-cover"
                src={logo_n}
                alt="Needflex"
              ></img>
              <span className="font-bold text-white text-xs tracking-[3px]">
                {movie.item.type === "series"
                  ? "LOẠT PHIM"
                  : movie.item.type === "hoathinh"
                  ? "HOẠT HÌNH"
                  : "PHIM"}
              </span>
            </div>
            <div
              className={`w-full max-h-[43.75%] sm:h-auto sm:max-h-[40%] object-cover transition-all ease-linear duration-[1000ms] `}
            >
              <h1
                className="uppercase text-4xl md:text-6xl xl:text-7xl font-bold tracking-tighter text-white truncate line-clamp-3 sm:line-clamp-2 text-pretty text-center sm:text-left"
                style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.6)" }}
              >
                {movie.item.origin_name}
              </h1>
            </div>
          </div>
          <div className="flex items-end sm:w-1/2 lg:w-full w-[80%] sm:px-0">
            <div className="flex flex-col gap-1 w-full items-end lg:items-start">
              {watchingMovie !== null && (
                <div className="relative flex flex-col gap-1 w-full lg:w-1/2">
                  <span className="text-white/80 text-xs sm:text-sm whitespace-nowrap text-nowrap font-medium">
                    Tập {watchingMovie.episodeName}
                  </span>
                  <div className="flex items-center gap-2 w-full">
                    <div className="h-[3px] bg-[#5b5b5b] w-full">
                      <div
                        className="h-full bg-[#d80f16] transition-all duration-300"
                        style={{ width: `${watchingMovie.progress || 0}%` }}
                      />
                    </div>
                    <span className="text-white/80 text-xs sm:text-sm whitespace-nowrap text-nowrap font-medium">
                      {formatSecondsToMinutes(watchingMovie.currentTime || 0)}/
                      {formatSecondsToMinutes(watchingMovie.duration || 0)}ph
                    </span>
                  </div>
                </div>
              )}
              <div className="flex sm:space-x-3 space-x-2 w-full lg:w-auto">
                <div className="px-4 sm:px-7 lg:px-10 relative w-1/2 lg:w-fit rounded-md bg-white hover:bg-white/80 flex flex-nowrap items-center justify-center transition-all ease-linear cursor-pointer">
                  {(movie.item.episodes[0].server_data[0].link_embed != "" &&
                    (watchingMovie === null ? (
                      <div
                        onClick={() =>
                          navigate(
                            `/xem-phim/${movie.item.slug}?svr=${0}&ep=${0}`
                          )
                        }
                        className="cursor-pointer"
                        key={movie.item._id + 0}
                      >
                        <button className="px-2 font-medium text-black flex items-center space-x-2">
                          <FontAwesomeIcon icon="fa-solid fa-play" />
                          <span>Phát</span>
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => handlePlayMovie(watchingMovie)}
                        key={movie.item._id + 0}
                        className="cursor-pointer"
                      >
                        <button className="px-2 font-medium text-black flex items-center space-x-2">
                          <FontAwesomeIcon icon="fa-solid fa-play" />
                          <span className="text-nowrap">Xem tiếp</span>
                        </button>
                      </div>
                    ))) || (
                    <button
                      className="px-3 sm:px-7 lg:px-10 font-medium text-black text-nowrap flex flex-nowrap items-center space-x-2"
                      onClick={() => {
                        toast.warning("Tính năng đang được phát triển.");
                      }}
                    >
                      <FontAwesomeIcon icon="fa-solid fa-bell" />
                      <span>Nhắc tôi</span>
                    </button>
                  )}
                </div>
                <div
                  className={`relative rounded-md  backdrop-blur-sm w-1/2 lg:w-auto flex items-center justify-center ${
                    isFavourite
                      ? "bg-red-500/30 hover:bg-red-500/20"
                      : "bg-white/30 hover:bg-white/20"
                  }`}
                >
                  <button
                    className="py-2 px-3 sm:px-7 lg:px-10 text-white font-medium flex items-center justify-center space-x-2"
                    onClick={handleSaveMovie}
                  >
                    <FontAwesomeIcon
                      icon={
                        loadingFav
                          ? "fa-solid fa-spinner"
                          : `fa-${isFavourite ? "solid" : "regular"} fa-heart`
                      }
                      className={`sm:text-lg sm:w-5 sm:h-5 h-3 w-3 ${
                        isFavourite ? "text-red-500" : "text-white"
                      } ${loadingFav ? "animate-spin" : ""}`}
                    />
                    <span
                      className={`text-nowrap ${
                        isFavourite ? "text-red-500" : "text-white"
                      }`}
                    >
                      {isFavourite ? "Đã thích" : "Yêu thích"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex mt-4 p-[3%] text-white z-10">
        <div className="flex flex-col space-y-5 w-full">
          <div className="items-start justify-between gap-3 flex flex-col md:flex-row">
            <div className="w-full xl:w-1/3 md:w-[50%] space-y-2 text-xs lg:text-sm">
              {topSet && topSet.has(movie.item.slug) && (
                <div className="flex items-center gap-2">
                  <img
                    src={Top10Icon}
                    alt="Top 10"
                    className="w-7 aspect-auto"
                  />
                  <span className="text-white text-base sm:text-xl font-bold">
                    #
                    {movie.item.type === "single" ||
                    movie.item.episode_total === "1"
                      ? [...topSet].findIndex(
                          (slug) => slug === movie.item.slug
                        ) +
                        1 +
                        " Phim lẻ "
                      : [...topSet].findIndex(
                          (slug) => slug === movie.item.slug
                        ) -
                        9 +
                        " Phim bộ "}
                    hôm nay
                  </span>
                </div>
              )}
              <div className="flex items-center flex-wrap gap-2">
                {movie.item.imdb?.vote_count > 0 && (
                  <a
                    className="flex items-center space-x-2 border-[1px] border-yellow-500 rounded-md py-1 px-2 bg-yellow-500/10 hover:bg-yellow-500/20 transition-all ease-linear backdrop-blur-sm sm:backdrop-blur-none"
                    href={`https://www.imdb.com/title/${movie.item.imdb.id}`}
                    target="_blank"
                  >
                    <span className="text-yellow-500 font-medium">IMDb</span>
                    <span className="font-medium">
                      {movie.item.imdb?.vote_average.toFixed(1)}
                    </span>
                  </a>
                )}
                {movie.item.tmdb?.vote_count > 0 && (
                  <a
                    className="flex items-center space-x-2 border-[1px] border-[#01b4e4] rounded-md py-1 px-2 bg-[#01b4e4]/10 hover:bg-[#01b4e4]/20 transition-all ease-linear backdrop-blur-sm sm:backdrop-blur-none"
                    href={`https://www.themoviedb.org/${
                      movie.item.type == "single" ? "movie" : "tv"
                    }/${movie.item.tmdb.id}`}
                    target="_blank"
                  >
                    <span className="text-[#01b4e4] font-medium">TMDB</span>
                    <span className="font-medium">
                      {movie.item.tmdb?.vote_average.toFixed(1)}
                    </span>
                  </a>
                )}
                <span className="bg-white text-black font-medium rounded-md py-1 px-2">
                  {movie.item.episode_current}
                </span>
                <span className="border-[1px] rounded-md py-1 px-2 backdrop-blur-sm sm:backdrop-blur-none bg-white/10 sm:bg-transparent">
                  {movie.item.year}
                </span>
                {movie.item.time !== "? phút/tập" && (
                  <span className="border-[1px] rounded-md py-1 px-2 backdrop-blur-sm sm:backdrop-blur-none bg-white/10 sm:bg-transparent">
                    {movie.item.time}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {movie.item.category.map((category, index) => (
                  <span
                    key={index}
                    className=" rounded-md py-1 px-2 text-xs bg-white/10 backdrop-blur-sm sm:backdrop-blur-none"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
              {movie.item.type == "series" &&
                (movie.item.status == "ongoing" ? (
                  <div className="flex items-center space-x-1 bg-orange-500/20 rounded-full px-2 py-1 w-fit backdrop-blur-sm sm:backdrop-blur-none">
                    <LoaderCircle
                      className="text-orange-500 animate-spin"
                      size={14}
                    />
                    <span className="text-sm pr-1 text-orange-500">
                      {"Đã chiếu: "}
                      {movie.item.episode_current.split(" ")[1]} /{" "}
                      {movie.item.episode_total}
                    </span>
                  </div>
                ) : movie.item.status == "trailer" ? (
                  <div className="flex items-center justify-center space-x-2 bg-red-500/20 rounded-full py-1 px-2 w-fit backdrop-blur-sm sm:backdrop-blur-none">
                    <FontAwesomeIcon
                      icon="fa-solid fa-clapperboard"
                      size="xs"
                      className="text-red-500"
                    />
                    <span className="text-sm text-red-500 pr-1">
                      Sắp ra mắt
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2 bg-green-500/20 rounded-full py-1 px-2 w-fit backdrop-blur-sm sm:backdrop-blur-none">
                    <FontAwesomeIcon
                      icon="fa-solid fa-circle-check"
                      size="xs"
                      className="text-green-500"
                    />
                    <span className="text-sm text-green-500 pr-1">
                      {"Đã hoàn thành: "}
                      {movie.item.episode_total.split(" ")[0]} /{" "}
                      {movie.item.episode_total}
                    </span>
                  </div>
                ))}
            </div>
            <div className="w-full xl:w-2/3 md:w-[50%] mt-2">
              <div
                className="text-pretty text-sm lg:text-base"
                dangerouslySetInnerHTML={{ __html: movie.item.content }}
              />
            </div>
          </div>
          <div>
            {/* Danh sách server và episodes */}
            {movie.item.episodes &&
              movie.item.episodes[server] &&
              movie.item.episodes[server].server_data &&
              movie.item.episodes[server].server_data.length > 0 &&
              movie.item.episodes[server].server_data[0].link_m3u8 !== "" && (
                <div className="flex flex-col space-y-5 lg:border-t-[0.5px] border-white/10 lg:pt-4">
                  <span className="font-bold text-xl lg:text-2xl">
                    Danh sách tập
                  </span>
                  <div className="flex gap-4 items-center">
                    <span className="text-lg font-bold border-r-[0.5px] border-white/50 pr-4 flex items-center gap-1">
                      <Server size={16} strokeWidth={3} />
                      Server
                    </span>
                    {movie.item.episodes.map((item, index) => (
                      <div
                        key={index}
                        className={`${
                          server == index
                            ? " text-white bg-[#d80f16]"
                            : "bg-white/10 hover:bg-white/20 hover:text-white hover:border-white text-white/70"
                        } cursor-pointer px-2 py-1 rounded-md transition-all ease-linear flex items-center gap-2 text-base `}
                        onClick={() => setServer(index)}
                      >
                        <Captions size={16} />
                        <span>{item.server_name.split(" #")[0]}</span>
                      </div>
                    ))}
                  </div>
                  {movie.item.episodes[server].server_data.length > 100 && (
                    <div className="flex gap-3 flex-wrap ">
                      {Array.from({
                        length: Math.ceil(
                          movie.item.episodes[server].server_data.length / 100
                        ),
                      }).map((item, index) => (
                        <button
                          className={`text-xs rounded-md py-1.5 px-3 ${
                            episodesRange == index * 100
                              ? "bg-white text-black border-white"
                              : "bg-white/[15%] hover:bg-white/10 hover:text-white hover:border-white text-white/70"
                          } transition-all ease-linear`}
                          key={index}
                          onClick={() => setEpisodesRange(index * 100)}
                        >
                          Tập{" "}
                          {
                            movie.item.episodes[server].server_data[index * 100]
                              .name
                          }{" "}
                          -{" "}
                          {movie.item.episodes[server].server_data?.[
                            index * 100 + 99
                          ]?.name ||
                            movie.item.episodes[server].server_data[
                              movie.item.episodes[server].server_data.length - 1
                            ].name}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 xl:grid-cols-8 2xl:grid-cols-10">
                    {movie.item.episodes[server].server_data
                      .slice(episodesRange, episodesRange + 100)
                      .map((item, index) => (
                        <div
                          onClick={() =>
                            navigate(
                              `/xem-phim/${movie.item.slug}?svr=${server}&ep=${
                                episodesRange + index
                              }`
                            )
                          }
                          className={`relative rounded-md bg-[#242424] grouphover:bg-opacity-70`}
                          key={movie.item._id + episodesRange + index}
                        >
                          <button
                            className={`py-2 transition-all ease-linear  sm:gap-2 gap-1 flex items-center justify-center text-nowrap text-white/70 group-hover:text-white text-center w-full rounded-md`}
                          >
                            <FontAwesomeIcon
                              icon="fa-solid fa-play"
                              className="text-xs"
                            />
                            <span className="sm:text-base text-sm">
                              {" "}
                              Tập {item.name}
                            </span>
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}
          </div>
          {peoples.length > 0 && (
            <div className="flex-col space-y-5">
              <div className="flex justify-between">
                <span className="font-bold text-xl lg:text-2xl">Diễn viên</span>
              </div>
              <div className="flex relative group/carousel">
                <Swiper
                  modules={[Navigation]}
                  spaceBetween={10}
                  slidesPerView={3}
                  slidesPerGroup={3}
                  speed={500}
                  navigation={{
                    prevEl: prevRef.current,
                    nextEl: nextRef.current,
                  }}
                  onInit={(swiper) => {
                    swiper.params.navigation.prevEl = prevRef.current;
                    swiper.params.navigation.nextEl = nextRef.current;
                    swiper.navigation.init();
                    swiper.navigation.update();
                    setSwiperHeight(swiper.el.clientHeight);
                    setCanSlidePrev(!swiper.isBeginning);
                    setCanSlideNext(!swiper.isEnd);
                  }}
                  onSlideChange={(swiper) => {
                    setCanSlidePrev(!swiper.isBeginning);
                    setCanSlideNext(!swiper.isEnd);
                  }}
                  onResize={(swiper) => {
                    setSwiperHeight(swiper.el.clientHeight);
                  }}
                  breakpoints={{
                    640: {
                      slidesPerView: 4,
                      slidesPerGroup: 4,
                    },
                    768: {
                      slidesPerView: 5,
                      slidesPerGroup: 5,
                    },
                    1024: {
                      slidesPerView: 6,
                      slidesPerGroup: 6,
                    },
                    1280: {
                      slidesPerView: 8,
                      slidesPerGroup: 8,
                    },
                  }}
                  className="w-full cursor-pointer"
                >
                  {peoples.map(
                    (people, index) =>
                      people.profile_path && (
                        <SwiperSlide key={index}>
                          <div className="flex flex-col space-y-2 rounded-md overflow-hidden items-stretch justify-around">
                            <div className="w-full h-full p-3">
                              <LazyImage
                                src={
                                  "https://image.tmdb.org/t/p" +
                                  people.profile_path
                                }
                                alt={people.name}
                                sizes="(max-width: 640px) 20vw,(max-width: 768px) 14vw, (max-width: 1024px) 13vw,10vw"
                                className="!w-full !h-auto rounded-full aspect-square"
                              />
                            </div>
                            <span className="text-sm font-semibold text-center text-pretty">
                              {people.name}
                            </span>
                            <span className="text-sm text-center text-pretty">
                              {people.character}
                            </span>
                          </div>
                        </SwiperSlide>
                      )
                  )}
                </Swiper>
                <button
                  ref={prevRef}
                  style={{ height: swiperHeight + 1 || "100%" }}
                  className={`group/left absolute -left-[3.3%] -bottom-[0.5px] z-20 bg-black/50 group-hover/carousel:bg-black/80 text-transparent group-hover/carousel:text-white w-[3%] flex items-center justify-center rounded-e-sm transition-all ease-in-out duration-100 cursor-pointer ${
                    canSlidePrev ? "visible" : "invisible"
                  }`}
                  disabled={!canSlidePrev}
                >
                  <ChevronLeft
                    className="sm:size-8 size-6 group-hover/left:scale-[1.35] transition-all ease-in-out duration-200"
                    strokeWidth={2}
                  />
                </button>
                <button
                  ref={nextRef}
                  style={{ height: swiperHeight + 1 || "100%" }}
                  className={`group/right absolute -right-[3.3%] -bottom-[0.5px] z-20 bg-black/50 group-hover/carousel:bg-black/80 text-transparent group-hover/carousel:text-white w-[3%] flex items-center justify-center rounded-s-sm transition-all ease-in-out duration-100 cursor-pointer ${
                    canSlideNext ? "visible" : "invisible"
                  }`}
                  disabled={!canSlideNext}
                >
                  <ChevronRight
                    className="sm:size-8 size-6 group-hover/right:scale-[1.35] transition-all ease-in-out duration-200"
                    strokeWidth={2}
                  />
                </button>
              </div>
            </div>
          )}
          <Recommend
            type={movie.breadCrumb[0].slug.split("/danh-sach")[1]}
            country={movie.item.country[0].slug}
            category={movie.item.category[0].slug}
            slug={movie.item.slug}
          />
          <div className="flex flex-col gap-2" id={"more-info"}>
            <h3 className="text-xl lg:text-2xl">
              Giới thiệu về <b>{movie.item.origin_name}</b>
            </h3>
            {movie.item.director[0] !== "" && (
              <div className="leading-3 text-justify text-sm text-white/80">
                <span className="opacity-50 text-sm">Đạo diễn: </span>
                {movie.item.director.map((director, index) => (
                  <span key={index} className="text-sm text-white">
                    {director}
                    {index !== movie.item.director.length - 1 && (
                      <span>, </span>
                    )}
                  </span>
                ))}
              </div>
            )}
            {movie.item.actor.length > 0 && movie.item.actor[0] !== "" && (
              <div className="leading-3 text-justify text-sm text-white/80">
                <span className="opacity-50 text-sm">Diễn viên: </span>
                {movie.item.actor.map((actor, index) => (
                  <span key={index} className="text-sm text-white">
                    {actor}
                    {index !== movie.item.actor.length - 1 && <span>, </span>}
                  </span>
                ))}
              </div>
            )}
            <div className="leading-3 text-justify text-sm text-white/80">
              <span className="opacity-50 text-sm">Thể loại: </span>
              {movie.item.category.map((category, index) => (
                <span key={index} className="text-sm text-white">
                  {category.name}
                  {index !== movie.item.category.length - 1 && <span>, </span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchPage;
