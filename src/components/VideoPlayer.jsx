import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ChevronRight,
  SkipForward,
  Volume,
  Volume1,
  RotateCw,
  RotateCcw,
  Gauge,
  ListVideo,
} from "lucide-react";
import { formatTime } from "../utils/data";
import { useNavigate } from "react-router-dom";
import Tooltip from "./Tooltip";

const VideoPlayer = ({
  src,
  poster,
  title = "Movie title",
  episode,
  svr,
  episodeName,
  episodes = [],
  movieSlug,
  content,
}) => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const inactivityTimer = useRef(null);
  const navigate = useNavigate();
  // state
  const [playing, setPlaying] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hoverTime, setHoverTime] = useState(null);
  const [hoverPos, setHoverPos] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showEpisodes, setShowEpisodes] = useState(0);
  const [centerOverlay, setCenterOverlay] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);

  // setup HLS
  useEffect(() => {
    const video = videoRef.current;
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      hlsRef.current = hls;
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    }
    setShowEpisodes(parseInt(episode));
  }, [src]);

  useEffect(() => {
    const handleUserActivity = () => {
      const video = videoRef.current;
      if (!video || !video.paused) return;

      setShowOverlay(false);
      clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(() => setShowOverlay(true), 10000);
    };

    window.addEventListener("mousemove", handleUserActivity);
    window.addEventListener("keydown", handleUserActivity);
    window.addEventListener("touchstart", handleUserActivity);

    handleUserActivity();

    return () => {
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
      window.removeEventListener("touchstart", handleUserActivity);
      clearTimeout(inactivityTimer.current);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePause = () => {
      inactivityTimer.current = setTimeout(() => setShowOverlay(true), 10000);
    };

    const handlePlay = () => {
      clearTimeout(inactivityTimer.current);
      setShowOverlay(false);
    };

    video.addEventListener("pause", handlePause);
    video.addEventListener("play", handlePlay);

    return () => {
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("play", handlePlay);
    };
  }, []);

  const showCenterOverlay = (icon) => {
    setCenterOverlay(icon);
    setTimeout(() => setCenterOverlay(null), 800); // ẩn sau 0.8s
  };

  // update progress
  const handleTimeUpdate = () => {
    setProgress(videoRef.current.currentTime);
    setDuration(videoRef.current.duration);
  };

  // seek
  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = percent * duration;
  };

  const handleSeek10s = (sec) => {
    videoRef.current.currentTime = Math.min(
      Math.max(videoRef.current.currentTime + sec, 0),
      duration
    );
  };

  const changePlaybackRate = (rate) => {
    const newRate = Math.min(Math.max(rate, 0.25), 2);
    videoRef.current.playbackRate = newRate;
    setPlaybackRate(newRate);
  };

  // hover preview
  const handleHover = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    setHoverTime(percent * duration);
    setHoverPos(e.clientX - rect.left);
  };

  // volume
  const handleVolume = (e) => {
    const v = parseFloat(e.target.value);
    videoRef.current.volume = v;
    setVolume(v);
    setMuted(v === 0);
  };

  // mute
  const handleMute = () => {
    if (videoRef.current.muted) {
      videoRef.current.volume = 0.5;
      setVolume(0.5);
      showCenterOverlay("unmute");
    } else {
      videoRef.current.volume = 0;
      setVolume(0);
      showCenterOverlay("mute");
    }
    videoRef.current.muted = videoRef.current.volume === 0;
    setMuted(videoRef.current.volume === 0);
  };

  // fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  // auto hide controls sau 3s không di chuột
  useEffect(() => {
    let timeout;
    const resetTimer = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };
    containerRef.current.addEventListener("mousemove", resetTimer);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      switch (e.key.toLowerCase()) {
        case " ": // space: play/pause
          e.preventDefault();
          if (playing) {
            videoRef.current.pause();
            showCenterOverlay("pause");
          } else {
            videoRef.current.play();
            showCenterOverlay("play");
          }
          setPlaying(!playing);
          break;
        case "arrowright":
          handleSeek10s(10);
          showCenterOverlay("forward");
          break;
        case "arrowleft":
          handleSeek10s(-10);
          showCenterOverlay("backward");
          break;
        case "f":
          toggleFullscreen();
          break;
        case "m":
          handleMute();
          break;
        case "[":
          changePlaybackRate(playbackRate - 0.25);
          break;
        case "]":
          changePlaybackRate(playbackRate + 0.25);
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [playing, playbackRate]);

  return (
    <div
      ref={containerRef}
      className="relative bg-black w-full aspect-video mx-auto"
    >
      {/* Video */}
      <video
        ref={videoRef}
        poster={poster}
        className="w-full h-full object-cover bg-black"
        onTimeUpdate={handleTimeUpdate}
        onClick={() => {
          if (playing) {
            videoRef.current.pause();
            showCenterOverlay("pause");
          } else {
            videoRef.current.play();
            showCenterOverlay("play");
          }
          setPlaying(!playing);
        }}
        preload="auto"
        playsInline
        autoPlay
      />
      {centerOverlay && (
        <div
          className={`absolute inset-0 flex items-center ${
            centerOverlay === "forward"
              ? "justify-end px-[20%]"
              : centerOverlay === "backward"
              ? "justify-start px-[20%]"
              : "justify-center"
          }`}
        >
          <div className="animate-fadeInOut bg-black/40 rounded-full p-2 lg:p-6 opacity-50 duration-200 text-[24px] lg:!text-[64px] text-white">
            {centerOverlay === "play" && <Play />}
            {centerOverlay === "pause" && <Pause />}
            {centerOverlay === "forward" && <RotateCw />}
            {centerOverlay === "backward" && <RotateCcw />}
            {centerOverlay === "mute" && <VolumeX />}
            {centerOverlay === "unmute" && <Volume2 />}
          </div>
        </div>
      )}

      {showOverlay && (
        <div className="absolute inset-0 bg-black/60 flex flex-col justify-center px-[10%] transition-opacity duration-500">
          <div className="text-white max-w-2xl pt-12 lg:pt-0">
            <p className="text-xs lg:text-base mb-2 text-white/70">
              Bạn đang xem
            </p>
            <h1 className="text-2xl lg:text-5xl font-bold mb-1">{title}</h1>
            <p className="text-sm lg:text-xl font-semibold mb-3">
              Loạt phim truyền hình ngắn
            </p>
            <p className="text-xl lg:text-3xl font-semibold mb-3">{`Tập ${episodeName}`}</p>
            <p
              className="text-xs lg:text-base opacity-90 mb-6 text-pretty line-clamp-3 invisible lg:visible text-white/70"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
          <p className="absolute bottom-[10%] right-[10%] text-white/70 text-xs lg:text-base">
            Đã tạm ngừng
          </p>
        </div>
      )}

      {/* Controls */}
      <div
        className={`absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent p-2 lg:p-4 text-white 
          transition-all duration-500 ease-in-out
          ${
            showControls
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
      >
        <div className="flex items-center justify-between w-full gap-2 mb-1 lg:mb-3">
          <div
            className={"relative h-1 bg-white/30 cursor-pointer w-full"}
            onClick={handleSeek}
            onMouseMove={handleHover}
            onMouseLeave={() => setHoverTime(null)}
          >
            <div
              className="absolute top-0 left-0 h-full bg-red-600"
              style={{ width: `${(progress / duration) * 100}%` }}
            >
              <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 h-4 w-4 bg-red-600 rounded-full self-end"></div>
            </div>

            {/* Hover preview */}
            {hoverTime && (
              <div
                className="absolute -top-7 flex flex-col items-center -translate-x-1/2"
                style={{ left: hoverPos }}
              >
                <div className="h-6 bg-black/50 flex items-center justify-center text-xs px-2 rounded-md">
                  {formatTime(hoverTime)}
                </div>
              </div>
            )}
          </div>
          <span className="text-sm">{formatTime(duration - progress)}</span>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between px-3">
          <div className="flex items-center space-x-2 lg:space-x-4">
            {/* Play */}
            <button
              onClick={() => {
                if (playing) {
                  videoRef.current.pause();
                  showCenterOverlay("pause");
                } else {
                  videoRef.current.play();
                  showCenterOverlay("play");
                }
                setPlaying(!playing);
              }}
              className="hover:scale-125 transition-all ease-linear duration-100 group relative"
            >
              {playing ? <Pause size={24} /> : <Play size={24} />}
              <Tooltip content={playing ? "Dừng" : "Phát"} size="sm" />
            </button>
            <button
              onClick={() => {
                handleSeek10s(-10);
                showCenterOverlay("backward");
              }}
              className="hover:scale-125 transition-all ease-linear duration-100 group relative"
            >
              <RotateCcw size={24} />
              <Tooltip content={"10s trước"} size="sm" />
            </button>
            <button
              onClick={() => {
                handleSeek10s(10);
                showCenterOverlay("forward");
              }}
              className="hover:scale-125 transition-all ease-linear duration-100 group relative"
            >
              <RotateCw size={24} />
              <Tooltip content={"10s sau"} size="sm" />
            </button>

            <div className="flex items-center relative group">
              <button
                onClick={() => {
                  handleMute();
                  setMuted(!muted);
                }}
                className="hover:scale-125 transition-all ease-linear duration-100"
              >
                {muted ? (
                  <VolumeX size={24} />
                ) : volume < 0.3 ? (
                  <Volume size={24} />
                ) : volume < 0.7 ? (
                  <Volume1 size={24} />
                ) : (
                  <Volume2 size={24} />
                )}
              </button>
              <div className="cursor-pointer -rotate-90 absolute bottom-[66px] left-1/2 z-10 -translate-x-1/2 bg-black/80 flex justify-center items-center p-1 group-hover:visible group-hover:opacity-100 opacity-0 invisible">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volume}
                  onChange={handleVolume}
                  className="w-24 cursor-pointer"
                  style={{ accentColor: "red", backgroundColor: "white" }}
                />
              </div>
            </div>

            {/* Title */}
          </div>
          <span className="hidden lg:block ml-4 text-base font-semibold">
            {title} - {"Tập " + episodeName}
          </span>

          <div className="flex items-center space-x-2 lg:space-x-4">
            {episodes.length > 0 && (
              <div className="group hidden lg:block">
                <button
                  className="mt-1.5 group-hover:scale-125 transition-all ease-linear duration-100"
                  onMouseLeave={() => setShowEpisodes(parseInt(episode))}
                  onMouseEnter={() => setShowEpisodes(parseInt(episode))}
                >
                  <ListVideo size={24} />
                </button>
                <div
                  className="absolute -bottom-24 right-0 bg-[#262626] h-[400px] w-2/5 text-white rounded-md text-sm
                  opacity-0 invisible group-hover:opacity-100 group-hover:visible 
                  transition-all duration-200 z-[9999] -translate-y-1/2"
                >
                  <div className="py-3 px-5">
                    <span className="text-white font-semibold text-lg  ">
                      Danh sách tập
                    </span>
                  </div>
                  <div className="flex flex-col overflow-y-auto h-full bg-[#262626]">
                    {episodes.map((ep, index) => (
                      <div
                        key={index}
                        className={`  transition ${
                          showEpisodes === index
                            ? "border-[3px] border-white bg-black/80"
                            : "hover:bg-[#363636]"
                        }`}
                      >
                        <div
                          className="flex items-center justify-between py-3 px-5 cursor-pointer "
                          onClick={() => setShowEpisodes(index)}
                        >
                          <span className="text-zinc-300">{index + 1}</span>
                          <span className="ml-4 flex-1 text-white font-medium">
                            {"Tập " + ep.name}
                          </span>
                        </div>

                        {showEpisodes === index && (
                          <div className={`flex group-hover:flex p-3 gap-3`}>
                            <div className="relative ">
                              <img
                                src={poster}
                                alt={ep.name}
                                className="w-40 aspect-video object-cover rounded-md"
                              />
                              {showEpisodes !== parseInt(episode) && (
                                <div
                                  className="absolute bottom-0 right-0 w-full h-full flex items-center justify-center rounded-md cursor-pointer hover:scale-110 transition-all ease-linear duration-100"
                                  onClick={() =>
                                    navigate(
                                      `/watch/${movieSlug}?svr=${svr}&ep=${index}`
                                    )
                                  }
                                >
                                  <Play
                                    size={48}
                                    className="text-white bg-black/50 rounded-full p-2"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {episodes.length > 0 && (
              <button
                className="hover:scale-125 transition-all ease-linear duration-100 group relative"
                onClick={() =>
                  navigate(`/watch/${movieSlug}/${parseInt(episode) + 1}`)
                }
              >
                <SkipForward size={24} />
                <Tooltip
                  content={"Xem tập " + (parseInt(episode) + 2)}
                  size="sm"
                />
              </button>
            )}
            <div className="relative group">
              <button className="hover:scale-125 transition-all ease-linear duration-100 lg:mt-1.5 mt-1 ">
                <Gauge size={24} />
              </button>
              <div
                className="absolute bottom-10 right-1/2 bg-black/80 text-white rounded-md p-1 text-sm
                  opacity-0 invisible group-hover:opacity-100 group-hover:visible 
                  transition-all duration-200 translate-x-1/2"
              >
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                  <div
                    key={rate}
                    onClick={() => changePlaybackRate(rate)}
                    className={`px-3 py-1 cursor-pointer hover:bg-white/20 text-center rounded 
                    ${
                      playbackRate === rate ? "text-red-500 font-semibold" : ""
                    }`}
                  >
                    {rate}x
                  </div>
                ))}
              </div>
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="hover:scale-125 transition-all ease-linear duration-100 group relative"
            >
              {fullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
              <Tooltip
                content={fullscreen ? "Thu nhỏ" : "Phóng to"}
                size="sm"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
