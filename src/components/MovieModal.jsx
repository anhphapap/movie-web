import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
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

const customStyles = {
  content: {
    position: "absolute",
    top: "4%",
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

const MovieModal = ({ isOpen, onClose, modal }) => {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [player, setPlayer] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const { user } = UserAuth();
  const [playerOptions, setPlayerOptions] = useState({
    height: "100%",
    width: "100%",
    playerVars: {
      autoplay: 1,
      mute: 0,
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

  useEffect(() => {
    const checkSaved = async () => {
      if (user?.email) {
        setLoading(true);
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (
          userSnap.exists() &&
          userSnap
            .data()
            .savedMovies.some((movie) => movie.slug === modal?.movie.slug)
        ) {
          setSaved(true);
        } else {
          setSaved(false);
        }
        setLoading(false);
      }
    };
    checkSaved();
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
  }, [modal, user]);

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
            slug: modal.movie.slug,
            poster_url: modal.movie.poster_url,
            name: modal.movie.name,
            year: modal.movie.year,
            episode_current: modal.movie.episode_current,
            quality: modal.movie.quality,
            category: modal.movie.category,
          }),
        });
        toast.success("Đã xóa khỏi danh sách yêu thích.");
      } else {
        await updateDoc(userRef, {
          savedMovies: arrayUnion({
            slug: modal.movie.slug,
            poster_url: modal.movie.poster_url,
            name: modal.movie.name,
            year: modal.movie.year,
            episode_current: modal.movie.episode_current,
            quality: modal.movie.quality,
            category: modal.movie.category,
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

  const handleToggleMute = () => {
    if (!player) return;
    if (isMuted) player.unMute();
    else player.mute();
    setIsMuted((prev) => !prev);
  };

  if (!modal?.movie) return null;
  const youtubeId = getYoutubeId(modal.movie.trailer_url);
  if (loading)
    return (
      <Modal
        isOpen={isOpen}
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

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStyles}
      ariaHideApp={false}
      className="w-[94%] xl:w-[70%] 2xl:w-[50%] text-xs lg:text-lg outline-none "
    >
      <div className="flex flex-col w-full rounded-lg">
        <div className="aspect-video bg-cover bg-center w-full relative rounded-t-lg overflow-hidden">
          {showTrailer && youtubeId ? (
            <YouTube
              videoId={youtubeId}
              opts={playerOptions}
              className="aspect-video object-cover pointer-events-none absolute w-[101%] h-[101%] -translate-x-[0.5%] -translate-y-[0.5%] top-0 left-0 rounded-t-lg"
              onReady={(e) => {
                const ytPlayer = e.target;
                const iframe = ytPlayer.getIframe();
                iframe.style.pointerEvents = "none";
                setPlayer(ytPlayer);
                ytPlayer.playVideo();
                if (isMuted) ytPlayer.mute();

                const checkTime = setInterval(() => {
                  const duration = ytPlayer.getDuration();
                  const current = ytPlayer.getCurrentTime();

                  if (duration - current <= 6) {
                    clearInterval(checkTime);
                    ytPlayer.stopVideo();
                    setShowTrailer(false);
                  }
                }, 500);

                ytPlayer._checkTime = checkTime;
              }}
              onStateChange={(e) => {
                if (e.data === 0) {
                  setShowTrailer(false);
                } else if (e.data === 2 && player?._checkTime) {
                  clearInterval(player._checkTime);
                }
              }}
            />
          ) : (
            <img
              src={modal.movie.poster_url}
              className="object-cover w-full absolute top-0 left-0 rounded-t-lg aspect-video outline-none"
              alt={modal.movie.name}
            />
          )}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-[#141414] to-transparent z-0" />
          <button
            className="aspect-square w-7 rounded-full bg-[#141414] absolute right-3 top-3 z-10 flex items-center justify-center"
            onClick={onClose}
          >
            <FontAwesomeIcon icon="fa-solid fa-xmark" />
          </button>
          <div className="flex space-x-2 justify-between items-center absolute left-[5%] right-[5%] bottom-[5%]">
            <div className="flex space-x-2">
              <div className="relative rounded bg-white hover:bg-white/80 flex items-center justify-center transition-all ease-linear">
                {(modal.episodes[0].server_data[0].link_embed != "" && (
                  <Link
                    to={`/watch/${modal.movie.slug}/${0}`}
                    key={modal.movie._id + 0}
                    onClick={onClose}
                  >
                    <button className="px-4 sm:px-7 lg:px-10 font-semibold text-black flex items-center space-x-2">
                      <FontAwesomeIcon icon="fa-solid fa-play" />
                      <span>Phát</span>
                    </button>
                  </Link>
                )) || (
                  <button className="px-4 sm:px-7 lg:px-10 font-semibold text-black flex items-center space-x-2">
                    <FontAwesomeIcon icon="fa-solid fa-bell" />
                    <span>Nhắc tôi</span>
                  </button>
                )}
              </div>
              <button
                className={`group relative p-1 sm:p-2 lg:p-3 h-full aspect-square rounded-full bg-transparent border-2 flex items-center justify-center ${
                  saved ? "border-white" : "border-white/40"
                } hover:border-white hover:bg-white/10 transition-all ease-linear`}
                onClick={handleSaveMovie}
              >
                <Tooltip content={saved ? "Bỏ thích" : "Yêu thích"} />
                <FontAwesomeIcon
                  icon={`fa-${saved ? "solid" : "regular"} fa-heart`}
                  className="sm:text-lg"
                />
              </button>
            </div>
            {showTrailer && youtubeId && (
              <button
                onClick={handleToggleMute}
                className="text-white border-2 cursor-pointer border-white/40 bg-black/10 p-1 sm:p-2 lg:p-3 aspect-square h-full rounded-full flex items-center justify-center hover:border-white transition-all ease-linear"
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={
                      isMuted
                        ? "fa-solid fa-volume-xmark"
                        : "fa-solid fa-volume-high"
                    }
                    className="w-full h-full text[12px] sm:text-[18px]"
                  />
                </div>
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-col p-[5%] space-y-10">
          <div className="flex items-start space-x-[3%]">
            <div className="flex flex-col space-y-4 w-[70%]">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between text-white/70">
                  <div className="flex space-x-2 items-center">
                    <span className="lowercase">{modal.movie.year}</span>
                    <span className="lowercase">{modal.movie.time}</span>
                    <span className="px-1 bg-[#e50914] text-xs rounded font-black text-white">
                      {modal.movie.quality}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="lowercase">{modal.movie.view}</span>
                    <FontAwesomeIcon icon="fa-regular fa-eye" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="px-2 py-1 border-[1px] rounded-sm">
                      {modal.movie.episode_current}
                    </span>
                  </div>
                </div>
                {modal.movie.tmdb.vote_count > 0 && (
                  <div className="flex items-center space-x-2">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/6/69/IMDB_Logo_2016.svg"
                      className="h-4 lg:h-6"
                    ></img>
                    <span>{modal.movie.tmdb.vote_average.toFixed(1)}</span>
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold">
                  {modal.movie.name}
                </h1>
                <span className="font-light opacity-70">
                  <i>({modal.movie.origin_name})</i>
                </span>
              </div>
              <div
                dangerouslySetInnerHTML={{
                  __html: modal.movie.content,
                }}
                className="text-white text-pretty"
              />
            </div>
            <div className="flex flex-col space-y-3 w-[30%]">
              {modal.movie.actor[0] != "" && (
                <div>
                  <span className="opacity-50">Diễn viên: </span>
                  {modal.movie.actor.map((actor, index) => (
                    <span key={index}>
                      {actor}
                      {index !== modal.movie.actor.length - 1 && (
                        <span>, </span>
                      )}
                    </span>
                  ))}
                </div>
              )}
              <div>
                <span className="opacity-50">Quốc gia: </span>
                {modal.movie.country.map((country, index) => (
                  <span key={index}>
                    {country.name}
                    {index !== modal.movie.country.length - 1 && (
                      <span>, </span>
                    )}
                  </span>
                ))}
              </div>
              <div>
                <span className="opacity-50">Thể loại: </span>
                {modal.movie.category.map((category, index) => (
                  <span key={index}>
                    {category.name}
                    {index !== modal.movie.category.length - 1 && (
                      <span>, </span>
                    )}
                  </span>
                ))}
              </div>
              <div>
                <span className="opacity-50">Ngày cập nhật: </span>
                <span>
                  {new Date(modal.movie.modified.time).toLocaleDateString(
                    "vi-VN"
                  )}
                </span>
              </div>
            </div>
          </div>
          {modal.movie.type != "single" &&
            modal.episodes[0].server_data[0].link_embed != "" && (
              <div className="flex flex-col space-y-5">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">Tập</span>
                  <span className="px-3 py-1 font-semibold uppercase border-[1px] opacity-70 rounded bg-[#242424]">
                    {modal.movie.lang}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-4 xl:grid-cols-6 2xl:grid-cols-8">
                  {modal.episodes[0].server_data.map((item, index) => (
                    <Link
                      to={`/watch/${modal.movie.slug}/${index}`}
                      className="relative rounded bg-[#242424] hover:bg-opacity-70"
                      key={modal.movie._id + index}
                      onClick={onClose}
                    >
                      <button className="py-2 font-semibold text-center w-full">
                        {item.name}
                      </button>
                    </Link>
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>
    </Modal>
  );
};

MovieModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  modal: PropTypes.object,
};

export default MovieModal;
