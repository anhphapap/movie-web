import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { UserAuth } from "../context/AuthContext";
import { db } from "../firebase";
import {
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
  arrayRemove,
} from "firebase/firestore";
import { toast } from "react-toastify";
import Tooltip from "./Tooltip";
import { getYoutubeId } from "../utils/data";
import YouTube from "react-youtube";
import LazyImage from "./LazyImage";
import Top10Icon from "../assets/images/Top10Icon.svg";
import { useTop } from "../context/TopContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Captions, Server } from "lucide-react";
import SEO from "./SEO";
import { useFavorites } from "../context/FavouritesProvider";
import Recommend from "./Recommend";
const customStyles = {
  content: {
    position: "absolute",
    left: "50%",
    bottom: "auto",
    transform: "translate(-50%)",
    backgroundColor: "#141414",
    boxShadow: "2px solid black",
    color: "white",
    padding: 0,
    overflow: "visible",
    border: "none",
  },
};

export default function MovieModal({ onClose, slug, tmdb_id, tmdb_type }) {
  const [loading, setLoading] = useState(false);
  const [player, setPlayer] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [fadeOutImage, setFadeOutImage] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [modal, setModal] = useState(null);
  const [isVideoPaused, setIsVideoPaused] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [server, setServer] = useState(0);
  const { favorites, toggleFavorite, loadingFav } = useFavorites();
  const isFavourite = favorites.some((m) => m.slug === slug);
  const navigate = useNavigate();
  const { topSet } = useTop();
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
            console.log("Modal: Tab không visible, dừng video");
            if (player.getPlayerState() === window.YT.PlayerState.PLAYING) {
              player.pauseVideo();
              setIsVideoPaused(true);
            }
          } else {
            // Tab visible - tiếp tục phát video nếu đang pause
            console.log("Modal: Tab visible, kiểm tra tiếp tục phát video");
            if (player.getPlayerState() === window.YT.PlayerState.PAUSED) {
              console.log("Modal: Tiếp tục phát video sau khi quay lại tab");
              player.playVideo();
              setIsVideoPaused(false);
            }
          }
        } catch (error) {
          console.warn("Modal: Error in visibility change:", error);
        }
      }
    };

    // Lắng nghe sự kiện visibility change
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [player, isVideoPaused]);

  // Window Focus API - dừng video khi mất focus khỏi cửa sổ trình duyệt
  useEffect(() => {
    const handleWindowFocus = () => {
      console.log("Modal: Cửa sổ có focus");
      setIsPageVisible(true);

      if (player && player.getPlayerState) {
        try {
          // Cửa sổ có focus - tiếp tục phát video nếu đang pause
          if (player.getPlayerState() === window.YT.PlayerState.PAUSED) {
            console.log("Modal: Tiếp tục phát video sau khi cửa sổ có focus");
            player.playVideo();
            setIsVideoPaused(false);
          }
        } catch (error) {
          console.warn("Modal: Error in window focus:", error);
        }
      }
    };

    const handleWindowBlur = () => {
      console.log("Modal: Cửa sổ mất focus");
      setIsPageVisible(false);

      if (player && player.getPlayerState) {
        try {
          // Cửa sổ mất focus - dừng video nếu đang phát
          if (player.getPlayerState() === window.YT.PlayerState.PLAYING) {
            console.log("Modal: Dừng video do mất focus cửa sổ");
            player.pauseVideo();
            setIsVideoPaused(true);
          }
        } catch (error) {
          console.warn("Modal: Error in window blur:", error);
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
  }, [player]);
  const { user } = UserAuth();
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

  const handleClose = () => {
    if (intervalId) clearInterval(intervalId);
    setShowTrailer(false);
    setPlayer(null);
    setFadeOutImage(false);
    setIsVideoPaused(false);
    setIsPageVisible(true);
    onClose();
  };

  const getImages = async (api_path) => {
    try {
      const res = await axios.get(api_path);
      const logo =
        res.data?.logos?.find(
          (l) => l.iso_3166_1 === "US" && l.iso_639_1 === "en"
        ) || res.data?.logos?.[0];
      const backdrop = res.data?.backdrops?.find(
        (b) =>
          b.aspect_ratio >= 1.77 &&
          b.iso_639_1 === null &&
          b.iso_3166_1 === null &&
          b.height > 1000
      );
      return {
        backdrop: backdrop ? backdrop.file_path : null,
        logo: logo ? logo.file_path : null,
      };
    } catch (error) {
      return {
        backdrop: null,
        logo: null,
      };
    }
  };

  useEffect(() => {
    if (!slug) return;

    // Reset state khi slug thay đổi
    setPlayer(null);
    setShowTrailer(false);
    setFadeOutImage(false);
    setIsVideoPaused(false);
    setIsPageVisible(true);
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }

    const fetchMovie = async () => {
      if (
        !tmdb_id ||
        !tmdb_type ||
        tmdb_id === "null" ||
        tmdb_type === "null" ||
        tmdb_id === null ||
        tmdb_type === null
      ) {
        const res = await axios.get(
          `${import.meta.env.VITE_API_DETAILS}${slug}`
        );
        setModal(res.data.data);
        return;
      }
      const [data, image] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_DETAILS}${slug}`),
        getImages(
          `https://api.themoviedb.org/3/${tmdb_type}/${tmdb_id}/images?api_key=${
            import.meta.env.VITE_TMDB_KEY
          }`
        ),
      ]);
      setModal({ ...data.data.data, tmdb_image: image });
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
    return () => clearTimeout(t);
  }, [slug, user]);

  const handleSaveMovie = () => {
    toggleFavorite({
      slug: modal.item.slug,
      poster_url: modal.item.poster_url,
      thumb_url: modal.item.thumb_url,
      name: modal.item.name,
      year: modal.item.year,
      episode_current: modal.item.episode_current,
      quality: modal.item.quality,
      category: modal.item.category,
      tmdb: modal.item.tmdb,
      modified: modal.item.modified,
    });
  };

  const handleToggleMute = () => {
    if (!player) return;
    if (isMuted) player.unMute();
    else player.mute();
    setIsMuted((prev) => !prev);
  };

  if (loading || !modal?.item)
    return (
      <Modal
        isOpen={!!slug}
        onRequestClose={onClose}
        style={customStyles}
        ariaHideApp={false}
        className="relative w-[94%] xl:w-[70%] 2xl:w-[50%] text-xs lg:text-lg outline-none "
      >
        <button
          className="aspect-square w-7 rounded-full bg-[#141414] absolute right-3 top-3 z-10 flex items-center justify-center"
          onClick={onClose}
        >
          <FontAwesomeIcon icon="fa-solid fa-xmark" />
        </button>
        <div className="h-screen flex items-center justify-center">
          <FontAwesomeIcon
            icon="fa-solid fa-spinner"
            size="2xl"
            className="animate-spin text-white"
          />
        </div>
      </Modal>
    );
  const youtubeId = getYoutubeId(modal.item.trailer_url);

  return (
    <Modal
      isOpen={!!slug}
      onRequestClose={onClose}
      style={customStyles}
      ariaHideApp={false}
      className="w-full lg:w-[94%] xl:w-[70%] 2xl:w-[50%] text-xs lg:text-lg outline-none !top-0 lg:!top-[4%] min-h-screen lg:min-h-0"
    >
      {modal?.seoOnPage && (
        <SEO seoData={modal.seoOnPage} baseUrl={window.location.origin} />
      )}
      <div className="flex flex-col w-full lg:rounded-lg">
        <div className="aspect-video bg-cover bg-center w-full relative lg:rounded-t-lg lg:overflow-hidden">
          <div
            className={`absolute top-0 left-0 w-full h-full object-cover z-10 transition-opacity duration-1000 ease-in-out ${
              fadeOutImage ? "opacity-0" : "opacity-100"
            }`}
          >
            <LazyImage
              src={
                modal?.tmdb_image?.backdrop
                  ? "https://image.tmdb.org/t/p/" + modal?.tmdb_image?.backdrop
                  : modal.item.poster_url
              }
              alt={modal.item.name}
              sizes="(max-width: 1280px) 100vw,(max-width: 1535px) 70vw, 50vw"
              priority={true}
            />
          </div>

          {youtubeId && (
            <div
              className={`absolute top-0 left-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                showTrailer ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <YouTube
                videoId={youtubeId}
                opts={playerOptions}
                className="aspect-video object-cover pointer-events-none absolute w-full h-full top-0 left-0 z-0 rounded-t-lg"
                onReady={(e) => {
                  const ytPlayer = e.target;
                  const iframe = ytPlayer.getIframe();
                  iframe.style.pointerEvents = "none";
                  setPlayer(ytPlayer);
                  ytPlayer.playVideo();
                  if (isMuted) ytPlayer.mute();

                  // Set trạng thái video đang phát
                  setIsVideoPaused(false);

                  const id = setInterval(() => {
                    const duration = ytPlayer.getDuration();
                    const current = ytPlayer.getCurrentTime();

                    if (current > 0.1) setFadeOutImage(true);

                    if (duration - current <= 6) {
                      clearInterval(id);
                      ytPlayer.stopVideo();

                      setFadeOutImage(false);
                      setTimeout(() => setShowTrailer(false), 800);
                    }
                  }, 500);

                  setIntervalId(id);
                  ytPlayer._checkTime = id;
                }}
                onStateChange={(e) => {
                  if (e.data === window.YT.PlayerState.ENDED) {
                    if (player?._checkTime) clearInterval(player._checkTime);

                    setFadeOutImage(false);
                    setTimeout(() => setShowTrailer(false), 800);
                  }

                  if (e.data === window.YT.PlayerState.PAUSED) {
                    if (player?._checkTime) clearInterval(player._checkTime);
                  }
                }}
              />
            </div>
          )}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-[#141414] to-transparent z-10" />
          <button
            className="bg-[#141414] absolute top-[3%] right-[5%] md:right-4  md:top-4 h-7 sm:h-10 aspect-square rounded-full flex items-center justify-center z-20"
            onClick={onClose}
          >
            <FontAwesomeIcon icon="fa-solid fa-xmark" className="text-lg" />
          </button>
          <div className="flex flex-col space-x-2 space-y-3 justify-between absolute left-[5%] right-[5%] bottom-[5%] z-20">
            <div className="flex flex-col justify-end space-y-3 w-1/2 sm:px-0">
              <div className="sm:flex hidden items-center space-x-1 justify-start">
                <img
                  className="h-[15px] sm:h-[20px] object-cover"
                  src="https://images.ctfassets.net/y2ske730sjqp/4aEQ1zAUZF5pLSDtfviWjb/ba04f8d5bd01428f6e3803cc6effaf30/Netflix_N.png"
                ></img>
                <span className="font-bold text-white text-xs tracking-[3px]">
                  {modal.item.type === "series"
                    ? "LOẠT PHIM"
                    : modal.item.type === "hoathinh"
                    ? "HOẠT HÌNH"
                    : "PHIM"}
                </span>
              </div>
              <div
                className={`w-full max-h-[40%] items-start object-cover transition-all ease-linear duration-[1000ms] ${
                  fadeOutImage
                    ? "delay-[3000ms] scale-75 -translate-x-[12.5%]"
                    : "delay-0 scale-100 translate-x-0"
                }`}
              >
                {modal?.tmdb_image?.logo && (
                  <LazyImage
                    src={"https://image.tmdb.org/t/p/" + modal.tmdb_image.logo}
                    alt={modal.item.name}
                    sizes="(max-width: 640px) 30vw, (max-width: 1400px) 40vw, 50vw"
                    priority
                  />
                )}
              </div>
            </div>
            <div className="flex space-x-2 justify-between w-full !ml-0">
              <div className="flex space-x-2">
                <div className="relative rounded bg-white hover:bg-white/80 flex flex-nowrap items-center justify-center transition-all ease-linear">
                  {(modal.item.episodes[0].server_data[0].link_embed != "" && (
                    <div
                      onClick={() =>
                        navigate(
                          `/xem-phim/${modal.item.slug}?svr=${0}&ep=${0}`
                        )
                      }
                      key={modal.item._id + 0}
                    >
                      <button className="px-4 sm:px-7 lg:px-10 font-semibold text-black flex items-center space-x-2">
                        <FontAwesomeIcon icon="fa-solid fa-play" />
                        <span>Phát</span>
                      </button>
                    </div>
                  )) || (
                    <button className="px-4 sm:px-7 lg:px-10 font-semibold text-black text-nowrap flex flex-nowrap items-center space-x-2">
                      <FontAwesomeIcon icon="fa-solid fa-bell" />
                      <span>Nhắc tôi</span>
                    </button>
                  )}
                </div>
                <button
                  className={`group/tooltip relative p-1 sm:p-2 lg:p-3 h-full aspect-square rounded-full bg-transparent border-2 flex items-center justify-center ${
                    isFavourite ? "border-red-500" : "border-white/40"
                  } hover:border-white hover:bg-white/10 transition-all ease-linear`}
                  onClick={handleSaveMovie}
                >
                  <Tooltip content={isFavourite ? "Bỏ thích" : "Yêu thích"} />
                  <FontAwesomeIcon
                    icon={
                      loadingFav
                        ? "fa-solid fa-spinner"
                        : `fa-${isFavourite ? "solid" : "regular"} fa-heart`
                    }
                    className={`sm:text-lg ${
                      isFavourite ? "text-red-500" : "text-white"
                    } ${loadingFav ? "animate-spin" : ""}`}
                  />
                </button>
              </div>
              {showTrailer && youtubeId && fadeOutImage && (
                <button
                  onClick={handleToggleMute}
                  className="text-white border-2 cursor-pointer border-white/40 bg-black/10 p-1 sm:p-2 lg:p-3 aspect-square rounded-full flex items-center justify-center hover:border-white transition-all ease-linear"
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
            </div>
          </div>
        </div>
        <div className="flex flex-col p-[5%] space-y-4">
          <div className="flex items-start space-y-3 sm:space-y-0 sm:space-x-[3%] flex-col sm:flex-row">
            <div className="flex flex-col space-y-4 w-full sm:w-[70%]">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between text-white/70">
                  <div className="flex space-x-2 items-center">
                    <span className="lowercase">{modal.item.year}</span>
                    {modal.item.time !== "? phút/tập" && (
                      <span className="lowercase">{modal.item.time}</span>
                    )}
                    <span className="px-1 bg-[#e50914] text-xs rounded font-black text-white">
                      {modal.item.quality}
                    </span>
                  </div>
                  {parseInt(modal.item.view) > 0 && (
                    <div className="flex items-center space-x-1">
                      <span className="lowercase">{modal.item.view}</span>
                      <FontAwesomeIcon icon="fa-regular fa-eye" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm flex-wrap">
                  <span className="bg-white text-black font-semibold border-[1px] rounded-md py-1 px-2">
                    {modal.item.episode_current}
                  </span>
                  {modal.item.imdb?.vote_count > 0 && (
                    <a
                      className="flex items-center space-x-2 border-[1px] border-yellow-500 rounded-md py-1 px-2 bg-yellow-500/10 hover:bg-yellow-500/20 transition-all ease-linear"
                      href={`https://www.imdb.com/title/${modal.item.imdb.id}`}
                      target="_blank"
                    >
                      <span className="text-yellow-500 font-medium">IMDb</span>
                      <span className="font-semibold">
                        {modal.item.imdb.vote_average.toFixed(1)}
                      </span>
                    </a>
                  )}
                  {modal.item.tmdb?.vote_count > 0 && (
                    <a
                      className="flex items-center space-x-2 border-[1px] border-[#01b4e4] rounded-md py-1 px-2 bg-[#01b4e4]/10 hover:bg-[#01b4e4]/20 transition-all ease-linear"
                      href={`https://www.themoviedb.org/${
                        modal.item.type == "single" ? "movie" : "tv"
                      }/${modal.item.tmdb.id}`}
                      target="_blank"
                    >
                      <span className="text-[#01b4e4] font-medium">TMDB</span>
                      <span className="font-semibold">
                        {modal.item.tmdb.vote_average.toFixed(1)}
                      </span>
                    </a>
                  )}
                </div>
                {topSet && topSet.has(modal.item.slug) && (
                  <div className="flex items-center gap-2 mt-2">
                    <img
                      src={Top10Icon}
                      alt="Top 10"
                      className="w-7 sm:w-9 aspect-auto"
                    />
                    <span className="text-white text-base sm:text-xl font-bold">
                      #
                      {modal.item.type === "single" ||
                      modal.item.episode_total === "1"
                        ? [...topSet].findIndex(
                            (slug) => slug === modal.item.slug
                          ) +
                          1 +
                          " Phim lẻ "
                        : [...topSet].findIndex(
                            (slug) => slug === modal.item.slug
                          ) -
                          9 +
                          " Phim bộ "}
                      hôm nay
                    </span>
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold">
                  {modal.item.name}
                </h1>
                <span className="font-light opacity-70">
                  <i>({modal.item.origin_name})</i>
                </span>
              </div>
              <div
                dangerouslySetInnerHTML={{
                  __html: modal.item.content,
                }}
                className="text-white text-pretty"
              />
            </div>
            <div className="flex flex-col space-y-3 w-full sm:w-[30%]">
              {modal.item.actor[0] != "" && (
                <div>
                  <span className="opacity-50">Diễn viên: </span>
                  {modal.item.actor.map((actor, index) => (
                    <span key={index}>
                      {actor}
                      {index !== modal.item.actor.length - 1 && <span>, </span>}
                    </span>
                  ))}
                </div>
              )}
              <div>
                <span className="opacity-50">Quốc gia: </span>
                {modal.item.country.map((country, index) => (
                  <span key={index}>
                    {country.name}
                    {index !== modal.item.country.length - 1 && <span>, </span>}
                  </span>
                ))}
              </div>
              <div>
                <span className="opacity-50">Thể loại: </span>
                {modal.item.category.map((category, index) => (
                  <span key={index}>
                    {category.name}
                    {index !== modal.item.category.length - 1 && (
                      <span>, </span>
                    )}
                  </span>
                ))}
              </div>
              <div>
                <span className="opacity-50">Ngày cập nhật: </span>
                <span>
                  {new Date(modal.item.modified.time).toLocaleDateString(
                    "vi-VN"
                  )}
                </span>
              </div>
            </div>
          </div>
          <div>
            {modal.item.type != "single" &&
              modal.item.episodes[server].server_data[server].link_embed !=
                "" && (
                <div className="flex flex-col space-y-5 border-t-[0.5px] border-white/10 pt-4">
                  <div className="flex gap-4 items-center">
                    <span className="text-base lg:text-xl font-bold border-r-[0.5px] border-white/50 pr-4 flex items-center gap-1">
                      <Server size={16} strokeWidth={3} />
                      Server
                    </span>
                    {modal.item.episodes.map((item, index) => (
                      <div
                        key={index}
                        className={`${
                          server == index
                            ? " text-black bg-white border-[1px] border-white"
                            : "text-white/70 hover:text-white hover:bg-white/10 border-[1px] border-white/70"
                        } cursor-pointer px-2 py-1 rounded-md transition-all ease-linear flex items-center gap-2 text-xs lg:text-base `}
                        onClick={() => setServer(index)}
                      >
                        <Captions size={16} />
                        <span>{item.server_name.split(" #")[0]}</span>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 md:grid-cols-5 lg:grid-cols-6">
                    {modal.item.episodes[server].server_data.map(
                      (item, index) => (
                        <div
                          onClick={() =>
                            navigate(
                              `/xem-phim/${modal.item.slug}?svr=${server}&ep=${index}`
                            )
                          }
                          className={`relative rounded bg-[#242424] group hover:bg-opacity-70 cursor-pointer 
                      `}
                          key={modal.item._id + index}
                        >
                          <button className="py-2 transition-all ease-linear text-xs gap-2 flex items-center justify-center text-white/70 group-hover:text-white text-center w-full rounded">
                            <FontAwesomeIcon
                              icon="fa-solid fa-play"
                              className="text-xs"
                            />
                            <span className="text-xs lg:text-base">
                              {" "}
                              Tập {item.name}
                            </span>
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
          </div>
          <Recommend
            type={modal.breadCrumb[0].slug.split("/danh-sach")[1]}
            country={modal.item.country[0].slug}
            category={modal.item.category[0].slug}
            slug={modal.item.slug}
          />
        </div>
      </div>
    </Modal>
  );
}
