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
} from "lucide-react";
import { formatTime } from "../utils/data";
import { useNavigate } from "react-router-dom";

const VideoPlayer = ({
  src,
  poster,
  title = "Movie title",
  episode,
  episodeName,
  episodes = [],
  movieSlug,
}) => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
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
  }, [src]);

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
    } else {
      videoRef.current.volume = 0;
      setVolume(0);
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
          if (playing) videoRef.current.pause();
          else videoRef.current.play();
          setPlaying(!playing);
          break;
        case "arrowright":
          handleSeek10s(10);
          break;
        case "arrowleft":
          handleSeek10s(-10);
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
          if (playing) videoRef.current.pause();
          else videoRef.current.play();
          setPlaying(!playing);
        }}
        preload="auto"
        playsInline
        autoPlay
      />

      {/* Controls */}
      {showControls && (
        <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
          <div className="flex items-center justify-between w-full gap-2 mb-3">
            <div
              className="relative h-1 bg-white/30 cursor-pointer w-full"
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Play */}
              <button
                onClick={() => {
                  if (playing) videoRef.current.pause();
                  else videoRef.current.play();
                  setPlaying(!playing);
                }}
                className="hover:scale-125 transition-all ease-linear duration-100"
              >
                {playing ? <Pause size={24} /> : <Play size={24} />}
              </button>
              <button
                onClick={() => handleSeek10s(-10)}
                className="hover:scale-125 transition-all ease-linear duration-100"
              >
                <RotateCcw size={24} />
              </button>
              <button
                onClick={() => handleSeek10s(10)}
                className="hover:scale-125 transition-all ease-linear duration-100"
              >
                <RotateCw size={24} />
              </button>

              <div className="flex items-center relative group">
                <button
                  onClick={handleMute}
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
            <span className="ml-4 text-base font-semibold">
              {title} - {episodeName}
            </span>

            <div className="flex items-center space-x-4">
              <div className="relative group">
                <button className="hover:scale-125 transition-all ease-linear duration-100 mt-1.5">
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
              {/* Next episode */}
              {episodes.length > 0 && (
                <button
                  className="hover:scale-125 transition-all ease-linear duration-100"
                  onClick={() =>
                    navigate(`/watch/${movieSlug}/${parseInt(episode) + 1}`)
                  }
                >
                  <SkipForward size={24} />
                </button>
              )}

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="hover:scale-125 transition-all ease-linear duration-100"
              >
                {fullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
