import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import Tooltip from "../components/Tooltip";
import { toast } from "react-toastify";
import { UserAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { LoaderCircle, Captions, Server, TvMinimalPlay } from "lucide-react";
import {
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
  arrayRemove,
} from "firebase/firestore";
import VideoPlayer from "../components/VideoPlayer";
import LazyImage from "../components/LazyImage";
import SEO from "../components/SEO";
import { useCinema } from "../context/CinemaContext";

const WatchPage = () => {
  const { movieSlug } = useParams();
  const queryParams = new URLSearchParams(window.location.search);
  const ep = queryParams.get("ep") || 0;
  const svr = queryParams.get("svr") || 0;

  // Đọc resume data từ localStorage
  const [resumeData, setResumeData] = useState(null);
  const [episodesRange, setEpisodesRange] = useState(0);
  const [movie, setMovie] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const { cinema, setCinema } = useCinema();
  const [autoEpisodes, setAutoEpisodes] = useState(true); // Mặc định bật
  const [peoples, setPeoples] = useState([]);
  const [server, setServer] = useState(svr);
  const { user } = UserAuth();
  const navigate = useNavigate();
  const shouldAutoPlayRef = useRef(false);
  useEffect(() => {
    const checkSaved = async () => {
      if (user?.email && movie?.movie) {
        setLoading(true);
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (
          userSnap.exists() &&
          userSnap.data().savedMovies.some((m) => m.slug === movie?.movie?.slug)
        ) {
          setSaved(true);
        } else {
          setSaved(false);
        }
        setLoading(false);
      }
    };
    checkSaved();
  }, [user, movieSlug, movie]);

  // Load resume data từ localStorage
  useEffect(() => {
    const savedResumeData = localStorage.getItem("resumeVideo");
    if (savedResumeData) {
      try {
        const parsed = JSON.parse(savedResumeData);
        // Chỉ sử dụng nếu cùng movie và trong vòng 24h
        const isRecent = Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000;
        if (parsed.slug === movieSlug && isRecent) {
          setResumeData(parsed);
        }
        // Clear sau khi sử dụng
        localStorage.removeItem("resumeVideo");
      } catch (error) {
        console.error("Error parsing resume data:", error);
        localStorage.removeItem("resumeVideo");
      }
    }
  }, [movieSlug]);

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

  // Cleanup cinema mode when leaving page
  useEffect(() => {
    return () => {
      setCinema(false);
    };
  }, []);

  // Reset autoplay flag after navigation
  useEffect(() => {
    setEpisodesRange(parseInt(ep / 100) * 100);
    if (shouldAutoPlayRef.current) {
      // Reset after a short delay to ensure video has loaded
      setTimeout(() => {
        shouldAutoPlayRef.current = false;
      }, 1000);
    }
  }, [ep]);

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

  const handleSaveMovie = async () => {
    if (!user?.email) {
      toast.warning("Vui lòng đăng nhập để sử dụng chức năng này.");
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);

      if (saved) {
        await updateDoc(userRef, {
          savedMovies: arrayRemove({
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
          }),
        });
        toast.success("Đã xóa khỏi danh sách yêu thích.");
      } else {
        await updateDoc(userRef, {
          savedMovies: arrayUnion({
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
          }),
        });
        toast.success("Đã thêm vào danh sách yêu thích.");
      }

      setSaved(!saved);
    } catch (error) {
      console.log(error);
      toast.error("Có lỗi xảy ra vui lòng thử lại sau.");
    }
  };

  const handleNavigateToNextEpisode = () => {
    shouldAutoPlayRef.current = true;
    navigate(`/xem-phim/${movie.item.slug}?svr=${svr}&ep=${parseInt(ep) + 1}`);
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

  // Kiểm tra phim chỉ có trailer hoặc chưa có episodes
  if (
    !movie.item.episodes ||
    movie.item.episodes.length === 0 ||
    movie.item.episodes[0].server_data[0].link_m3u8 === ""
  ) {
    return (
      <div className="min-h-screen text-white px-[3%] mt-16">
        <div className="flex items-center gap-4 my-6 pt-2 px-2">
          <button
            className="aspect-square w-8 p-1 rounded-full flex items-center justify-center text-white hover:text-white/80 transition-all ease-linear border border-white/40 hover:border-white"
            onClick={() => navigate("/trang-chu")}
          >
            <FontAwesomeIcon icon="fa-solid fa-chevron-left" size="xs" />
          </button>
          <h1 className="sm:text-2xl text-xl font-bold">{movie.item.name}</h1>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
          <div className="w-24 sm:w-32 sm:h-32 h-24 rounded-full bg-red-500/20 flex items-center justify-center">
            <FontAwesomeIcon
              icon="fa-solid fa-film"
              size="3x"
              className="text-red-500"
            />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold">Phim chưa có sẵn</h2>
            <p className="text-white/70 max-w-md text-lg">
              {movie.item.status === "trailer"
                ? "Phim này hiện chỉ có trailer. Vui lòng quay lại sau khi phim được phát hành."
                : "Phim này chưa có tập nào để xem. Vui lòng quay lại sau."}
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() =>
                navigate(
                  `/trang-chu?movie=${movie.item.slug}&tmdb_id=${movie.item.tmdb.id}&tmdb_type=${movie.item.tmdb.type}`
                )
              }
              className="sm:px-8 px-3 sm:py-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Chi tiết phim
            </button>
            <button
              onClick={() => navigate("/trang-chu")}
              className="sm:px-8 px-3 sm:py-3 py-2 bg-white/10 hover:bg-white/20 border-2 border-white/20 rounded-lg font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Quay về Trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Kiểm tra server và episode có tồn tại không
  if (
    !movie.item.episodes[svr] ||
    !movie.item.episodes[svr].server_data ||
    !movie.item.episodes[svr].server_data[ep]
  ) {
    return (
      <div className="min-h-screen text-white px-[3%] mt-16">
        <div className="flex items-center gap-4 my-6 pt-2 px-2">
          <button
            className="aspect-square w-8 p-1 rounded-full flex items-center justify-center text-white hover:text-white/80 transition-all ease-linear border border-white/40 hover:border-white"
            onClick={() => navigate("/trang-chu")}
          >
            <FontAwesomeIcon icon="fa-solid fa-chevron-left" size="xs" />
          </button>
          <h1 className="text-2xl font-bold">{movie.item.name}</h1>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 px-[3%]">
          <div className="sm:w-32 sm:h-32 w-24 h-24 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <FontAwesomeIcon
              icon="fa-solid fa-exclamation-triangle"
              size="3x"
              className="text-yellow-500"
            />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold">Tập phim không tồn tại</h2>
            <p className="text-white/70 max-w-md text-lg">
              Tập phim bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() =>
                navigate(`/xem-phim/${movie.item.slug}?svr=0&ep=0`)
              }
              className="sm:px-8 px-3 sm:py-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Xem tập đầu tiên
            </button>
            <button
              onClick={() => navigate("/trang-chu")}
              className="sm:px-8 px-3 sm:py-3 py-2 bg-white/10 hover:bg-white/20 border-2 border-white/20 rounded-lg font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Quay về Trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Custom SEO cho trang xem phim với thông tin tập
  const watchPageSEO = movie?.seoOnPage
    ? {
        ...movie.seoOnPage,
        titleHead: `Xem phim ${movie.item.name} - Tập ${movie.item.episodes[svr].server_data[ep].name}`,
        descriptionHead: `Xem phim ${movie.item.name} tập ${
          movie.item.episodes[svr].server_data[ep].name
        } ${movie.item.quality} Vietsub. ${
          movie.seoOnPage.descriptionHead ||
          movie.item.content?.replace(/<[^>]*>/g, "").substring(0, 100) ||
          ""
        }`,
      }
    : null;

  return (
    <div
      className={`min-h-screen text-white relative ${
        cinema
          ? "fixed inset-0 z-[9999] flex items-center justify-center bg-black"
          : "px-[3%] mt-16"
      }`}
    >
      {watchPageSEO && (
        <SEO seoData={watchPageSEO} baseUrl={window.location.origin} />
      )}

      {!cinema && (
        <div className="flex items-center gap-4 my-6 pt-2 px-2">
          <button
            className="aspect-square w-8 p-1 rounded-full flex items-center justify-center text-white hover:text-white/80 transition-all ease-linear border border-white/40 hover:border-white"
            onClick={() => navigate("/trang-chu")}
          >
            <FontAwesomeIcon icon="fa-solid fa-chevron-left" size="xs" />
          </button>
          <h1 className="text-2xl font-bold">
            Xem phim {movie.item.name} - Tập{" "}
            {movie.item.episodes[svr].server_data[ep].name}
          </h1>
        </div>
      )}
      <div
        className={`${
          cinema ? "w-full max-w-screen-2xl mx-auto relative z-10" : ""
        } rounded sm:rounded-xl overflow-hidden`}
      >
        <div className="relative w-full bg-black aspect-video">
          <div className="absolute top-0 left-0 w-full aspect-video">
            <VideoPlayer
              movie={movie.item}
              episode={ep}
              svr={svr}
              resumeData={resumeData}
              autoEpisodes={autoEpisodes}
              onVideoEnd={() => {
                if (
                  autoEpisodes &&
                  parseInt(ep) < movie.item.episodes[svr].server_data.length - 1
                ) {
                  shouldAutoPlayRef.current = true;
                  navigate(
                    `/xem-phim/${movie.item.slug}?svr=${svr}&ep=${
                      parseInt(ep) + 1
                    }`
                  );
                }
              }}
              onNavigateToNextEpisode={handleNavigateToNextEpisode}
              shouldAutoPlay={shouldAutoPlayRef.current}
            />
          </div>
        </div>
        <div className="bg-black px-2 sm:px-4 py-2 sm:py-3 flex flex-wrap gap-2 sm:gap-3">
          {/* Nút Yêu thích */}
          <button
            className={`relative group/tooltip p-2 sm:px-5 sm:py-3 flex items-center justify-center rounded-lg transition-all duration-300 ease-out border-2 ${
              saved
                ? "bg-gradient-to-r from-red-600/20 to-pink-600/20 border-red-500/50 text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/40 hover:border-red-500"
                : "bg-white/5 border-white/20 text-white/70 hover:bg-white/10 hover:border-white/40 hover:text-white"
            } hover:scale-105 active:scale-95`}
            onClick={handleSaveMovie}
          >
            <FontAwesomeIcon
              icon={`fa-${saved ? "solid" : "regular"} fa-heart`}
              className={`${
                saved
                  ? "text-red-500 animate-pulse"
                  : "text-white/70 group-hover/tooltip:text-white"
              } sm:text-xl text-base transition-all duration-300`}
            />
            <span className="ml-2 text-base font-medium hidden sm:block">
              Yêu thích
            </span>
          </button>

          {/* Nút Chuyển tập */}
          <button
            className={`relative group/tooltip p-2 sm:px-5 sm:py-3 flex items-center justify-center rounded-lg transition-all duration-300 ease-out border-2 ${
              autoEpisodes
                ? "bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-500/50 text-white shadow-lg shadow-green-500/20 hover:shadow-green-500/40 hover:border-green-500"
                : "bg-white/5 border-white/20 text-white/70 hover:bg-white/10 hover:border-white/40 hover:text-white"
            } hover:scale-105 active:scale-95`}
            onClick={() => setAutoEpisodes(!autoEpisodes)}
          >
            <FontAwesomeIcon
              icon={`fa-solid fa-${autoEpisodes ? "toggle-on" : "toggle-off"}`}
              className={`${
                autoEpisodes
                  ? "text-green-500"
                  : "text-gray-400 group-hover/tooltip:text-white"
              } sm:text-xl text-base transition-all duration-300`}
            />
            <span className="ml-2 text-base font-medium hidden sm:block">
              Chuyển tập
            </span>
          </button>

          {/* Nút Rạp phim */}
          <button
            className={`relative group/tooltip p-2 sm:px-5 sm:py-3 flex items-center justify-center rounded-lg transition-all duration-300 ease-out border-2 ${
              cinema
                ? "bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-500/50 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:border-purple-500"
                : "bg-white/5 border-white/20 text-white/70 hover:bg-white/10 hover:border-white/40 hover:text-white"
            } hover:scale-105 active:scale-95`}
            onClick={() => setCinema(!cinema)}
          >
            <FontAwesomeIcon
              icon="fa-solid fa-tv"
              className={`${
                cinema
                  ? "text-purple-500"
                  : "text-gray-400 group-hover/tooltip:text-white"
              } sm:text-xl text-base transition-all duration-300`}
            />
            <span className="ml-2 text-base font-medium hidden sm:block">
              Rạp phim
            </span>
          </button>
        </div>
      </div>

      {!cinema && (
        <div className="flex mt-4">
          <div className="flex flex-col space-y-5 w-full md:pr-4">
            <div className="items-start justify-between gap-3 hidden lg:flex">
              <div className="w-[15%] rounded-md overflow-hidden">
                <LazyImage
                  src={movie.item.thumb_url}
                  alt={movie.item.name}
                  sizes="14vw"
                />
              </div>
              <div className="w-[50%] p-2 space-y-2 ">
                <h1 className="font-bold text-xl lg:text-2xl">
                  {movie.item.name}
                </h1>
                <span className="text-white/70 text-base">
                  {movie.item.origin_name}
                </span>
                <div className="flex items-center flex-wrap gap-2">
                  {movie.item.imdb?.vote_count > 0 && (
                    <a
                      className="flex items-center space-x-2 border-[1px] border-yellow-500 rounded-md py-1 px-2 text-sm bg-yellow-500/10 hover:bg-yellow-500/20 transition-all ease-linear"
                      href={`https://www.imdb.com/title/${movie.item.imdb.id}`}
                      target="_blank"
                    >
                      <span className="text-yellow-500 font-medium">IMDb</span>
                      <span className="font-semibold">
                        {movie.item.imdb?.vote_average.toFixed(1)}
                      </span>
                    </a>
                  )}
                  {movie.item.tmdb?.vote_count > 0 && (
                    <a
                      className="flex items-center space-x-2 border-[1px] border-[#01b4e4] rounded-md py-1 px-2 text-sm bg-[#01b4e4]/10 hover:bg-[#01b4e4]/20 transition-all ease-linear"
                      href={`https://www.themoviedb.org/${
                        movie.item.type == "single" ? "movie" : "tv"
                      }/${movie.item.tmdb.id}`}
                      target="_blank"
                    >
                      <span className="text-[#01b4e4] font-medium">TMDB</span>
                      <span className="font-semibold">
                        {movie.item.tmdb?.vote_average.toFixed(1)}
                      </span>
                    </a>
                  )}
                  <span className="bg-white text-black font-medium rounded-md py-1 px-2 text-sm">
                    {movie.item.episode_current}
                  </span>
                  <span className="border-[1px] rounded-md py-1 px-2 text-sm">
                    {movie.item.year}
                  </span>
                  {movie.item.time !== "? phút/tập" && (
                    <span className="border-[1px] rounded-md py-1 px-2 text-sm">
                      {movie.item.time}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2 flex-wrap">
                  {movie.item.category.map((category, index) => (
                    <span
                      key={index}
                      className=" rounded-md py-1 px-2 text-xs bg-white/10"
                    >
                      {category.name}
                    </span>
                  ))}
                </div>
                {movie.item.type == "series" &&
                  (movie.item.status == "ongoing" ? (
                    <div className="flex items-center space-x-1 bg-orange-500/20 rounded-full px-2 py-1 w-fit ">
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
                    <div className="flex items-center justify-center space-x-2 bg-red-500/20 rounded-full py-1 px-2 w-fit">
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
                    <div className="flex items-center justify-center space-x-2 bg-green-500/20 rounded-full py-1 px-2 w-fit">
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
              <div className="w-[35%] mt-2">
                <div
                  className=" text-white/70 text-pretty text-sm line-clamp-6 "
                  dangerouslySetInnerHTML={{ __html: movie.item.content }}
                />
                <span
                  className="text-sm text-green-400 cursor-pointer block mt-4"
                  onClick={() =>
                    navigate(
                      `/trang-chu?movie=${movie.item.slug}&tmdb_id=${movie.item.tmdb.id}&tmdb_type=${movie.item.tmdb.type}`
                    )
                  }
                >
                  Thông tin chi tiết
                  <FontAwesomeIcon
                    icon="fa-solid fa-chevron-right"
                    size="sm"
                    className="ml-2 text-green-400"
                  />
                </span>
              </div>
            </div>
            <div>
              {/* Danh sách server và episodes */}
              {movie.item.episodes &&
                movie.item.episodes[server] &&
                movie.item.episodes[server].server_data &&
                movie.item.episodes[server].server_data.length > 0 && (
                  <div className="flex flex-col space-y-5 lg:border-t-[0.5px] border-white/10 lg:pt-4">
                    <div className="flex gap-4 items-center">
                      <span className="text-xl font-bold border-r-[0.5px] border-white/50 pr-4 flex items-center gap-1">
                        <Server size={16} strokeWidth={3} />
                        Server
                      </span>
                      {movie.item.episodes.map((item, index) => (
                        <div
                          key={index}
                          className={`${
                            server == index
                              ? " text-black bg-white border-[1px] border-white"
                              : "text-white/70 hover:text-white hover:bg-white/10 border-[1px] border-white/70"
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
                            className={`text-xs rounded py-1.5 px-3 ${
                              episodesRange == index * 100
                                ? "bg-white text-black border-white"
                                : "bg-white/[15%] hover:bg-white/10 hover:text-white hover:border-white text-white/70"
                            } transition-all ease-linear`}
                            key={index}
                            onClick={() => setEpisodesRange(index * 100)}
                          >
                            Tập{" "}
                            {
                              movie.item.episodes[server].server_data[
                                index * 100
                              ].name
                            }{" "}
                            -{" "}
                            {movie.item.episodes[server].server_data?.[
                              index * 100 + 99
                            ]?.name ||
                              movie.item.episodes[server].server_data[
                                movie.item.episodes[server].server_data.length -
                                  1
                              ].name}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 xl:grid-cols-6 2xl:grid-cols-8">
                      {movie.item.episodes[server].server_data
                        .slice(episodesRange, episodesRange + 100)
                        .map((item, index) => (
                          <div
                            onClick={() =>
                              navigate(
                                `/xem-phim/${
                                  movie.item.slug
                                }?svr=${server}&ep=${episodesRange + index}`
                              )
                            }
                            className={`relative rounded bg-[#242424] group ${
                              episodesRange + index == ep && svr == server
                                ? "bg-white/15 "
                                : "hover:bg-opacity-70"
                            }`}
                            key={movie.item._id + episodesRange + index}
                          >
                            <button
                              className={`py-2 transition-all ease-linear  sm:gap-2 gap-1 flex items-center justify-center text-nowrap ${
                                episodesRange + index == ep && svr == server
                                  ? "text-black bg-white"
                                  : "text-white/70 group-hover:text-white"
                              } text-center w-full rounded`}
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
          </div>
          {peoples.length > 0 && (
            <div className="flex-col space-y-5 w-[35%] p-2 hidden md:flex border-l-[0.5px] border-white/10 pl-4">
              <div className="flex justify-between pl-2">
                <span className="font-bold text-2xl">Diễn viên</span>
              </div>
              <div className="grid grid-cols-2 gap-6 xl:grid-cols-3">
                {peoples.slice(0, 6).map(
                  (people, index) =>
                    people.profile_path && (
                      <div
                        key={index}
                        className="flex flex-col space-y-2 rounded-md overflow-hidden items-stretch justify-around"
                      >
                        <LazyImage
                          src={
                            "https://image.tmdb.org/t/p" + people.profile_path
                          }
                          alt={people.name}
                          sizes="8vw"
                          className="!w-full !h-auto rounded-full aspect-square"
                        />
                        <span className="text-sm font-semibold text-center text-pretty">
                          {people.name}
                        </span>
                        <span className="text-sm text-center text-pretty">
                          {people.character}
                        </span>
                      </div>
                    )
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WatchPage;
