import React, { useEffect, useRef, useState, useCallback } from "react";
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
  Zap,
  Download,
  Share2,
  MoreVertical,
  HelpCircle,
  X,
  PictureInPicture,
  SlidersHorizontal,
  Sun,
  Clock,
} from "lucide-react";
import { formatTime } from "../utils/data";
import { useNavigate } from "react-router-dom";
import Tooltip from "./Tooltip";
import LazyImage from "./LazyImage";
import { useWatching } from "../context/WatchingContext";

const VideoPlayer = ({
  episode,
  svr,
  movie,
  resumeData = null,
  autoEpisodes = true,
  onVideoEnd,
  onNavigateToNextEpisode,
  shouldAutoPlay = false,
}) => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const inactivityTimer = useRef(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  const lastTapTime = useRef(0);
  const lastTapX = useRef(0);
  const lastTapY = useRef(0);
  const singleTapTimer = useRef(null);
  const navigate = useNavigate();
  const { toggleWatching, updateWatchingProgress, isInWatching } =
    useWatching();

  // State
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hoverTime, setHoverTime] = useState(null);
  const [hoverPos, setHoverPos] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showEpisodes, setShowEpisodes] = useState(0);
  const [centerOverlay, setCenterOverlay] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [currentQuality, setCurrentQuality] = useState("auto");
  const [qualities, setQualities] = useState([]);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [pipSupported, setPipSupported] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [brightness, setBrightness] = useState(100); // 0-100%
  const [showSwipeControl, setShowSwipeControl] = useState(null);
  const [swipeValue, setSwipeValue] = useState(0);
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [previewTime, setPreviewTime] = useState(null);
  const [isHoveringProgress, setIsHoveringProgress] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showQualityMenuState, setShowQualityMenuState] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Check PiP support
  useEffect(() => {
    setPipSupported(document.pictureInPictureEnabled);
  }, []);

  // Setup HLS
  useEffect(() => {
    const video = videoRef.current;

    // Reset states khi src thay đổi
    setVideoReady(false);
    setPlaying(false);
    setShowControls(false);
    // Không reset hasPlayedOnce nếu đang auto play
    if (!shouldAutoPlay) {
      setHasPlayedOnce(false);
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        startLevel: -1, // auto
      });
      hls.loadSource(movie?.episodes[svr]?.server_data[episode]?.link_m3u8);
      hls.attachMedia(video);
      hlsRef.current = hls;

      // Get available qualities
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        const levels = hls.levels.map((level) => ({
          height: level.height,
          bitrate: level.bitrate,
          name: level.height ? `${level.height}p` : "Auto",
        }));
        setQualities([{ name: "Auto", height: 0 }, ...levels]);
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        const level = hls.levels[data.level];
        setCurrentQuality(level.height ? `${level.height}p` : "auto");
      });

      // Video sẵn sàng
      hls.on(Hls.Events.MANIFEST_LOADED, () => {
        setVideoReady(true);

        // Autoplay bình thường
        if (shouldAutoPlay) {
          setTimeout(() => {
            video.play();
            setPlaying(true);
            setShowControls(true);
            setHasPlayedOnce(true);
          }, 100);
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = movie?.episodes[svr]?.server_data[episode]?.link_m3u8;

      const handleCanPlay = () => {
        setVideoReady(true);

        // Autoplay bình thường
        if (shouldAutoPlay) {
          setTimeout(() => {
            video.play();
            setPlaying(true);
            setShowControls(true);
            setHasPlayedOnce(true);
          }, 100);
        }
      };

      video.addEventListener("canplay", handleCanPlay);
    }

    setShowEpisodes(parseInt(episode));

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [movie, svr, episode, shouldAutoPlay]);

  // Xử lý resume data riêng biệt
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !resumeData || !videoReady) return;

    // Chỉ seek nếu video đã sẵn sàng và có resume data
    if (resumeData.currentTime > 0) {
      setTimeout(() => {
        video.currentTime = resumeData.currentTime;
        setProgress(resumeData.currentTime);
        if (!playing) {
          video.play();
          setPlaying(true);
          setShowControls(true);
          setHasPlayedOnce(true);
        }
      }, 500);
    }
  }, [resumeData, videoReady, playing]);

  // Monitor buffering
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleBuffering = () => {
      if (video.readyState < 2) {
        setIsBuffering(true);
      }
    };

    const handleCanPlay = () => {
      setIsBuffering(false);
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        setBuffered(
          (video.buffered.end(video.buffered.length - 1) / video.duration) * 100
        );
      }
    };

    const handleEnded = () => {
      if (onVideoEnd) {
        onVideoEnd();
      }
    };

    video.addEventListener("waiting", handleBuffering);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("progress", handleProgress);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("waiting", handleBuffering);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("progress", handleProgress);
      video.removeEventListener("ended", handleEnded);
    };
  }, [onVideoEnd]);

  // Pause overlay management - Professional implementation
  const resetPauseOverlayTimer = useCallback(() => {
    clearTimeout(inactivityTimer.current);
    setShowOverlay(false);

    // Chỉ start timer nếu video đang pause
    const video = videoRef.current;
    if (video && video.paused) {
      inactivityTimer.current = setTimeout(() => {
        // Double-check trước khi hiện
        if (videoRef.current && videoRef.current.paused) {
          setShowOverlay(true);
        }
      }, 20000); // 20 seconds
    }
  }, []);

  // Video pause/play events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePause = () => {
      // Bắt đầu đếm khi video pause
      resetPauseOverlayTimer();
    };

    const handlePlay = () => {
      // Clear ngay khi video play
      clearTimeout(inactivityTimer.current);
      setShowOverlay(false);
    };

    video.addEventListener("pause", handlePause);
    video.addEventListener("play", handlePlay);

    return () => {
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("play", handlePlay);
      clearTimeout(inactivityTimer.current);
    };
  }, [resetPauseOverlayTimer]);

  // User interactions - clear overlay
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleInteraction = () => {
      // Clear overlay và reset timer
      resetPauseOverlayTimer();
    };

    container.addEventListener("touchstart", handleInteraction, {
      passive: true,
    });
    container.addEventListener("touchmove", handleInteraction, {
      passive: true,
    });
    container.addEventListener("mousemove", handleInteraction);
    window.addEventListener("keydown", handleInteraction);

    return () => {
      container.removeEventListener("touchstart", handleInteraction);
      container.removeEventListener("touchmove", handleInteraction);
      container.removeEventListener("mousemove", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, [resetPauseOverlayTimer]);

  const showCenterOverlay = (icon) => {
    setCenterOverlay(icon);
    setTimeout(() => setCenterOverlay(null), 800);
  };

  const handleInitialPlay = () => {
    const video = videoRef.current;
    if (video) {
      video.play();
      setPlaying(true);
      setShowControls(true);
      setHasPlayedOnce(true);

      // Lưu phim vào danh sách đang xem
      const movieData = {
        slug: movie.slug,
        poster_url: movie.poster_url,
        thumb_url: movie.thumb_url,
        name: movie.name,
        tmdb: movie.tmdb,
        modified: movie.modified,
        episode_current: movie.episode_current,
        episode: episode,
        svr: svr,
        episodeName: movie.episodes[svr].server_data[episode].name,
        currentTime: 0,
        duration: video.duration || 0,
        progress: 0,
        lastWatched: new Date().toISOString(),
      };

      // Chỉ thêm nếu chưa có trong danh sách, tránh toggle gây xóa
      if (!isInWatching(movie.slug)) {
        toggleWatching(movieData);
      }
    }
  };

  const handleTimeUpdate = () => {
    const currentTime = videoRef.current.currentTime;
    const videoDuration = videoRef.current.duration;

    setProgress(currentTime);
    setDuration(videoDuration);

    // Lưu tiến độ xem phim mỗi 5 giây
    if (
      videoDuration > 0 &&
      currentTime > 0 &&
      Math.floor(currentTime) % 5 === 0
    ) {
      updateWatchingProgress(
        movie.slug,
        currentTime,
        videoDuration,
        episode,
        svr,
        movie.episodes[svr].server_data[episode].name
      );
    }
  };

  const handleSeek = (e) => {
    // Chỉ seek khi click, không phải drag
    if (isDraggingProgress) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
    if (!clientX) return;

    const percent = Math.max(
      0,
      Math.min(1, (clientX - rect.left) / rect.width)
    );
    videoRef.current.currentTime = percent * duration;
  };

  const handleProgressDragStart = (e) => {
    e.preventDefault();
    setIsDraggingProgress(true);
    setIsHoveringProgress(true);

    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
    if (!clientX) return;

    const percent = Math.max(
      0,
      Math.min(1, (clientX - rect.left) / rect.width)
    );
    setPreviewTime(percent * duration);
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

  const changeQuality = (quality) => {
    if (hlsRef.current) {
      if (quality === "auto") {
        hlsRef.current.currentLevel = -1;
        setCurrentQuality("auto");
      } else {
        const level = hlsRef.current.levels.findIndex(
          (l) => l.height === quality
        );
        if (level !== -1) {
          hlsRef.current.currentLevel = level;
        }
      }
    }
    setShowQualityMenu(false);
  };

  const handleHover = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
    if (!clientX) return;

    const percent = Math.max(
      0,
      Math.min(1, (clientX - rect.left) / rect.width)
    );
    setHoverTime(percent * duration);
    setHoverPos(clientX - rect.left);
  };

  const handleVolume = (e) => {
    const v = parseFloat(e.target.value);
    videoRef.current.volume = v;
    setVolume(v);
    setMuted(v === 0);
  };

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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setFullscreen(true);
      // Lock landscape orientation khi fullscreen
      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock("landscape").catch(() => {});
      }
    } else {
      document.exitFullscreen();
      setFullscreen(false);
      // Unlock orientation khi thoát fullscreen
      if (screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
      }
    }
  };

  const togglePiP = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (error) {
      console.error("PiP error:", error);
    }
  };

  // Handle video click - desktop only, mobile uses double tap
  const handleVideoClick = () => {
    // Only allow click play/pause on desktop
    if (isMobile) return;

    if (playing) {
      videoRef.current.pause();
      showCenterOverlay("pause");
    } else {
      videoRef.current.play();
      showCenterOverlay("play");
    }
    setPlaying(!playing);
  };

  // Touch gestures - Clean implementation
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartX.current - touchEndX;
    const diffY = touchStartY.current - touchEndY;
    const touchDuration = Date.now() - touchStartTime.current;
    const videoWidth = containerRef.current?.offsetWidth || 1;
    const videoHeight = containerRef.current?.offsetHeight || 1;

    // Bỏ qua nếu tap vào control bar
    const tapY = touchStartY.current;
    if (tapY > videoHeight * 0.85) return;

    // 1. SWIPE GESTURES (priority cao nhất)
    const isSwipe = Math.abs(diffX) > 50 || Math.abs(diffY) > 50;

    if (isSwipe) {
      // Vertical swipe on left edge = Volume
      if (
        touchStartX.current < videoWidth * 0.2 &&
        Math.abs(diffY) > Math.abs(diffX)
      ) {
        const volumeChange = (-diffY / videoHeight) * 0.5;
        const newVolume = Math.max(0, Math.min(1, volume - volumeChange));
        videoRef.current.volume = newVolume;
        setVolume(newVolume);
        setMuted(newVolume === 0);
        setShowSwipeControl({ type: "volume", value: newVolume });
        setTimeout(() => setShowSwipeControl(null), 500);
        return;
      }

      // Vertical swipe on right edge = Brightness
      if (
        touchStartX.current > videoWidth * 0.8 &&
        Math.abs(diffY) > Math.abs(diffX)
      ) {
        const brightnessChange = (-diffY / videoHeight) * 100; // 0-100% range
        const newBrightness = Math.max(
          20,
          Math.min(200, brightness - brightnessChange)
        );
        setBrightness(newBrightness);
        setShowSwipeControl({ type: "brightness", value: newBrightness });
        setTimeout(() => setShowSwipeControl(null), 500);
        return;
      }
    }

    // 2. TAP GESTURES
    const isTap =
      Math.abs(diffX) < 20 && Math.abs(diffY) < 20 && touchDuration < 300;

    if (isTap) {
      const tapX = touchStartX.current;
      const now = Date.now();
      const timeSinceLastTap = now - lastTapTime.current;
      const distFromLastTap = Math.sqrt(
        Math.pow(tapX - lastTapX.current, 2) +
          Math.pow(tapY - lastTapY.current, 2)
      );

      // Double tap detection (trong 300ms và cùng vị trí)
      const isDoubleTap = timeSinceLastTap < 300 && distFromLastTap < 50;

      if (isDoubleTap) {
        // Cancel single tap timer
        clearTimeout(singleTapTimer.current);

        // Double tap: seek
        const isLeftHalf = tapX < videoWidth / 2;
        if (isLeftHalf) {
          handleSeek10s(-10);
          showCenterOverlay("backward");
        } else {
          handleSeek10s(10);
          showCenterOverlay("forward");
        }

        lastTapTime.current = 0; // Reset để tránh triple tap
      } else {
        // Single tap: delay 300ms để check double tap
        lastTapTime.current = now;
        lastTapX.current = tapX;
        lastTapY.current = tapY;

        singleTapTimer.current = setTimeout(() => {
          // Single tap confirmed
          if (showControls) {
            // Control đang hiện → toggle pause/play
            if (playing) {
              videoRef.current.pause();
              showCenterOverlay("pause");
            } else {
              videoRef.current.play();
              showCenterOverlay("play");
            }
            setPlaying(!playing);
          } else {
            // Control chưa hiện → hiện control
            setShowControls(true);
          }
        }, 300);
      }
    }
  };

  // Progress bar drag listeners
  useEffect(() => {
    if (!isDraggingProgress) return;

    const handleGlobalMove = (e) => {
      const progressBar = document.querySelector("[data-progress-bar]");
      if (!progressBar) return;

      const rect = progressBar.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
      if (!clientX) return;

      const percent = Math.max(
        0,
        Math.min(1, (clientX - rect.left) / rect.width)
      );

      // Chỉ update preview, KHÔNG seek video
      setPreviewTime(percent * duration);
      setHoverTime(percent * duration);
      setHoverPos(clientX - rect.left);
    };

    const handleGlobalEnd = (e) => {
      // Seek video khi thả - mới update currentTime
      const video = videoRef.current;

      if (video && previewTime !== null) {
        video.currentTime = previewTime;
      }

      setIsDraggingProgress(false);
      setPreviewTime(null);
      setHoverTime(null);
      setIsHoveringProgress(false);
    };

    window.addEventListener("mousemove", handleGlobalMove);
    window.addEventListener("mouseup", handleGlobalEnd);
    window.addEventListener("touchmove", handleGlobalMove);
    window.addEventListener("touchend", handleGlobalEnd);

    return () => {
      window.removeEventListener("mousemove", handleGlobalMove);
      window.removeEventListener("mouseup", handleGlobalEnd);
      window.removeEventListener("touchmove", handleGlobalMove);
      window.removeEventListener("touchend", handleGlobalEnd);
    };
  }, [isDraggingProgress, duration, previewTime]);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".group/speed") && showSpeedMenu) {
        setShowSpeedMenu(false);
      }
      if (!e.target.closest(".group/quality") && showQualityMenuState) {
        setShowQualityMenuState(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showSpeedMenu, showQualityMenuState]);

  // Auto hide controls
  useEffect(() => {
    let timeout;
    const resetTimer = () => {
      setShowControls(true);
      clearTimeout(timeout);
      // Không ẩn nếu đang tương tác với progress bar
      if (!isDraggingProgress && !isHoveringProgress) {
        timeout = setTimeout(() => setShowControls(false), 3000);
      }
    };
    containerRef.current?.addEventListener("mousemove", resetTimer);
    return () => clearTimeout(timeout);
  }, [isDraggingProgress, isHoveringProgress]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      // Không xử lý nếu focus vào input
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
        return;

      switch (e.key.toLowerCase()) {
        case " ":
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
          e.preventDefault();
          handleSeek10s(10);
          showCenterOverlay("forward");
          break;
        case "arrowleft":
          e.preventDefault();
          handleSeek10s(-10);
          showCenterOverlay("backward");
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "m":
          e.preventDefault();
          handleMute();
          break;
        case "[":
          e.preventDefault();
          changePlaybackRate(playbackRate - 0.25);
          break;
        case "]":
          e.preventDefault();
          changePlaybackRate(playbackRate + 0.25);
          break;
        case "p":
          e.preventDefault();
          if (pipSupported) togglePiP();
          break;
        case "?":
          e.preventDefault();
          setShowShortcuts(!showShortcuts);
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [playing, playbackRate, pipSupported, showShortcuts]);

  return (
    <div
      ref={containerRef}
      className="relative bg-black w-full aspect-video mx-auto overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Video */}
      <video
        ref={videoRef}
        poster={import.meta.env.VITE_API_IMAGE + movie?.poster_url}
        className={`w-full h-full bg-black transition-all duration-300 ${
          fullscreen ? "object-contain" : "object-cover"
        }`}
        style={{ filter: `brightness(${brightness}%)` }}
        onTimeUpdate={handleTimeUpdate}
        onClick={isMobile ? undefined : handleVideoClick}
        preload="auto"
        playsInline
      />

      {/* Initial play button - CHỈ hiện lần đầu vào, chưa play bao giờ */}
      {videoReady && !hasPlayedOnce && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={handleInitialPlay}
              className="group bg-black/40 border-2 border-white rounded-full p-3 sm:p-6 transition-all duration-300 hover:scale-110 shadow-2xl active:scale-95"
              aria-label="Phát video"
            >
              <Play
                size={isMobile ? 32 : 64}
                className="text-white fill-white"
              />
            </button>
          </div>
        </div>
      )}

      {/* Buffering indicator */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            <p className="text-white text-sm">Đang tải...</p>
          </div>
        </div>
      )}

      {/* Swipe control indicator */}
      {showSwipeControl && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[9998]">
          <div className="bg-black/80 backdrop-blur-lg rounded-2xl px-8 py-6 min-w-[200px] shadow-2xl border border-white/10">
            <div className="flex flex-col items-center gap-4">
              {/* Icon & Label */}
              <div className="flex items-center gap-3">
                {showSwipeControl.type === "volume" ? (
                  <>
                    <Volume2 size={28} className="text-white" />
                    <span className="text-white font-semibold text-lg">
                      Âm lượng
                    </span>
                  </>
                ) : (
                  <>
                    <Sun size={28} className="text-white" />
                    <span className="text-white font-semibold text-lg">
                      Độ sáng
                    </span>
                  </>
                )}
              </div>

              {/* Progress bar */}
              <div className="w-full">
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-150 ${
                      showSwipeControl.type === "volume"
                        ? "bg-gradient-to-r from-red-500 to-red-600"
                        : "bg-gradient-to-r from-yellow-400 to-yellow-500"
                    }`}
                    style={{
                      width: `${
                        showSwipeControl.type === "volume"
                          ? showSwipeControl.value * 100
                          : ((showSwipeControl.value - 20) / 180) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Value display */}
              <div className="text-center">
                <span className="text-white text-3xl font-bold tabular-nums">
                  {showSwipeControl.type === "volume"
                    ? Math.round(showSwipeControl.value * 100)
                    : Math.round(showSwipeControl.value)}
                </span>
                <span className="text-white/70 text-xl ml-1">%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Center overlay */}
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

      {/* Pause overlay */}
      {showOverlay && hasPlayedOnce && (
        <div className="absolute inset-0 bg-black/60 flex flex-col justify-center px-[10%] transition-opacity duration-500">
          <div className="text-white max-w-2xl pt-12 lg:pt-0">
            <p className="text-xs lg:text-base mb-2 text-white/70">Đang xem</p>
            <h1 className="text-2xl lg:text-5xl font-bold mb-1">
              {movie.name}
            </h1>
            <p className="text-sm lg:text-xl font-semibold mb-3">
              Loạt phim truyền hình ngắn
            </p>
            <p className="text-xl lg:text-3xl font-semibold mb-3">{`Tập ${movie.episodes[svr].server_data[episode].name}`}</p>
            <p
              className="text-xs lg:text-base opacity-90 mb-6 text-pretty line-clamp-3 invisible lg:visible text-white/70"
              dangerouslySetInnerHTML={{ __html: movie.content }}
            />
          </div>
          <p className="absolute bottom-[10%] right-[10%] text-white/70 text-xs lg:text-base">
            Đã tạm ngừng
          </p>
        </div>
      )}

      {/* Keyboard shortcuts helper */}
      {showShortcuts && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[9999]">
          <div className="bg-black/95 text-white p-6 rounded-lg max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Phím tắt</h3>
              <button
                onClick={() => setShowShortcuts(false)}
                className="hover:bg-white/20 p-1 rounded"
              >
                <X size={24} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <kbd className="bg-white/20 px-2 py-1 rounded">Space</kbd>
                <p className="text-white/70">Phát/Dừng</p>
              </div>
              <div>
                <kbd className="bg-white/20 px-2 py-1 rounded">→</kbd>
                <p className="text-white/70">+10 giây</p>
              </div>
              <div>
                <kbd className="bg-white/20 px-2 py-1 rounded">←</kbd>
                <p className="text-white/70">-10 giây</p>
              </div>
              <div>
                <kbd className="bg-white/20 px-2 py-1 rounded">M</kbd>
                <p className="text-white/70">Tắt tiếng</p>
              </div>
              <div>
                <kbd className="bg-white/20 px-2 py-1 rounded">F</kbd>
                <p className="text-white/70">Toàn màn hình</p>
              </div>
              <div>
                <kbd className="bg-white/20 px-2 py-1 rounded">[</kbd>
                <p className="text-white/70">Giảm tốc độ</p>
              </div>
              <div>
                <kbd className="bg-white/20 px-2 py-1 rounded">]</kbd>
                <p className="text-white/70">Tăng tốc độ</p>
              </div>
              <div>
                <kbd className="bg-white/20 px-2 py-1 rounded">P</kbd>
                <p className="text-white/70">PiP Mode</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls - chỉ hiện khi video ready VÀ đã play lần đầu */}
      {videoReady && hasPlayedOnce && (
        <div
          className={`absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent p-2 lg:p-4 text-white 
            transition-all duration-500 ease-in-out
            ${
              showControls
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            }`}
        >
          {/* Progress bar */}
          <div className="flex flex-col items-center justify-between w-full gap-3 mb-1 lg:mb-3">
            <div className="flex items-center gap-2 justify-between w-full px-1">
              <span className="text-xs lg:text-sm whitespace-nowrap text-white/90">
                {formatTime(progress)}
              </span>
              <span className="text-xs lg:text-sm whitespace-nowrap text-white/90">
                {formatTime(duration)}
              </span>
            </div>
            <div
              data-progress-bar
              className="relative h-1 bg-white/20 cursor-pointer w-full transition-all duration-200 group/progress py-1 -my-1"
              onClick={handleSeek}
              onMouseDown={handleProgressDragStart}
              onTouchStart={handleProgressDragStart}
              onMouseMove={handleHover}
              onTouchMove={handleHover}
              onMouseEnter={() => setIsHoveringProgress(true)}
              onMouseLeave={() => {
                if (!isDraggingProgress) {
                  setHoverTime(null);
                  setIsHoveringProgress(false);
                }
              }}
            >
              {/* Buffered */}
              <div
                className="absolute top-0 left-0 h-full bg-white/20 transition-all duration-200"
                style={{ width: `${buffered}%` }}
              />

              {/* Progress */}
              <div
                className={`absolute top-0 left-0 h-full bg-red-600 ${
                  isDraggingProgress
                    ? "h-1 transition-none"
                    : "group-hover/progress:h-2 transition-all duration-200"
                }`}
                style={{
                  width: `${
                    ((isDraggingProgress && previewTime !== null
                      ? previewTime
                      : progress) /
                      duration) *
                    100
                  }%`,
                }}
              >
                {/* Thumb */}
                <div
                  className={`absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full shadow-lg transform ${
                    isDraggingProgress
                      ? "scale-125 h-3 w-3 transition-none"
                      : "scale-0 group-hover/progress:scale-100 h-3 w-3 transition-all duration-200"
                  }`}
                />
              </div>

              {/* Hover preview */}
              {hoverTime !== null && (
                <div
                  className="absolute -top-12 flex flex-col items-center -translate-x-1/2 pointer-events-none z-10"
                  style={{ left: hoverPos }}
                >
                  <div className="bg-black/90 backdrop-blur flex items-center justify-center text-xs px-2 py-1.5 rounded shadow-xl border border-white/10">
                    {formatTime(hoverTime)}
                  </div>
                  <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-black/90 -mt-px" />
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between px-2 lg:px-3">
            <div className="flex items-center space-x-1 lg:space-x-4 flex-wrap">
              {/* Play */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (playing) {
                    videoRef.current.pause();
                    showCenterOverlay("pause");
                  } else {
                    videoRef.current.play();
                    showCenterOverlay("play");
                  }
                  setPlaying(!playing);
                }}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                }}
                className="hover:scale-125 transition-all ease-linear duration-100 group/tooltip relative p-2"
                aria-label={playing ? "Dừng" : "Phát"}
              >
                {playing ? (
                  <Pause size={isMobile ? 32 : 36} />
                ) : (
                  <Play size={isMobile ? 32 : 36} />
                )}
                <Tooltip
                  content={playing ? "Dừng (Space)" : "Phát (Space)"}
                  size="sm"
                  className="bottom-[100%]"
                  color="dark"
                />
              </button>

              {/* Backward */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSeek10s(-10);
                  showCenterOverlay("backward");
                }}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                }}
                className="hover:scale-125 transition-all ease-linear duration-100 group/tooltip relative p-2"
                aria-label="Quay lại 10 giây"
              >
                <RotateCcw size={isMobile ? 30 : 34} />
                <Tooltip
                  content={"10s trước (←)"}
                  size="sm"
                  className="bottom-[100%]"
                  color="dark"
                />
              </button>

              {/* Forward */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSeek10s(10);
                  showCenterOverlay("forward");
                }}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                }}
                className="hover:scale-125 transition-all ease-linear duration-100 group/tooltip relative p-2"
                aria-label="Tiến 10 giây"
              >
                <RotateCw size={isMobile ? 30 : 34} />
                <Tooltip
                  content={"10s sau (→)"}
                  size="sm"
                  className="bottom-[100%]"
                  color="dark"
                />
              </button>

              {/* Volume - Desktop only (mobile uses edge swipe) */}
              {!isMobile && (
                <div className="flex items-center relative group group/tooltip">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMute();
                    }}
                    onTouchEnd={(e) => {
                      e.stopPropagation();
                    }}
                    className="hover:scale-125 transition-all ease-linear duration-100 p-2"
                    aria-label={muted ? "Bật tiếng" : "Tắt tiếng"}
                  >
                    {muted ? (
                      <VolumeX size={34} />
                    ) : volume < 0.3 ? (
                      <Volume size={34} />
                    ) : volume < 0.7 ? (
                      <Volume1 size={34} />
                    ) : (
                      <Volume2 size={34} />
                    )}
                  </button>
                  <div className="cursor-pointer -rotate-90 absolute top-[-70px] left-1/2 z-10 -translate-x-1/2 bg-black/80 backdrop-blur flex justify-center items-center p-2 rounded-md group-hover:visible group-hover:opacity-100 opacity-0 invisible transition-all duration-200">
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={volume}
                      onChange={handleVolume}
                      className="w-24 cursor-pointer"
                      style={{ accentColor: "red", backgroundColor: "white" }}
                      aria-label="Âm lượng"
                    />
                  </div>
                </div>
              )}

              {/* Title - chỉ desktop */}
            </div>
            <span className="hidden lg:block ml-4 text-xs lg:text-base font-semibold truncate">
              {movie.name} -{" "}
              {"Tập " + movie.episodes[svr].server_data[episode].name}
            </span>

            <div className="flex items-center space-x-1 lg:space-x-4">
              {/* Episodes */}
              {/* {movie.episodes[svr].server_data.length > 0 && (
                <div className="group/episodes hidden lg:block">
                  <button
                    className="group-hover/episodes:scale-125 transition-all ease-linear duration-100 p-2"
                    aria-label="Danh sách tập"
                  >
                    <ListVideo size={34} />
                  </button>
                  <div
                    className="absolute -bottom-20 right-0 bg-[#262626]/95 backdrop-blur h-[400px] w-1/3 text-white rounded-md text-sm
                  opacity-0 invisible group-hover/episodes:opacity-100 group-hover/episodes:visible 
                  transition-all duration-200 z-[9999] -translate-y-1/2 border border-white/10"
                  >
                    <div className="py-3 px-5 border-b border-white/10">
                      <span className="text-white font-semibold text-lg">
                        Danh sách tập
                      </span>
                    </div>
                    <div className="flex flex-col overflow-y-auto h-full bg-[#262626]">
                      {movie.episodes[svr].server_data.map((ep, index) => (
                        <div
                          key={index}
                          className={`transition ${
                            showEpisodes === index
                              ? "border-l-[3px] border-red-600 bg-black/50"
                              : "hover:bg-[#363636]"
                          }`}
                        >
                          <div
                            className="flex items-center justify-between py-3 px-5 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowEpisodes(index);
                            }}
                          >
                            <span className="text-zinc-300 text-xs">
                              {index + 1}
                            </span>
                            <span className="ml-4 flex-1 text-white font-medium text-xs">
                              {"Tập " +
                                movie.episodes[svr].server_data[index].name}
                            </span>
                          </div>

                          {showEpisodes === index && (
                            <div className={`flex group-hover:flex p-2 gap-2`}>
                              <div className="relative w-36">
                                <LazyImage
                                  src={movie.poster_url}
                                  alt={
                                    movie.episodes[svr].server_data[index].name
                                  }
                                  sizes="5vw"
                                />
                                {showEpisodes !== parseInt(episode) && (
                                  <div
                                    className="absolute bottom-0 right-0 w-full h-full flex items-center justify-center rounded-sm cursor-pointer hover:scale-105 transition-all ease-linear duration-100"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(
                                        `/xem-phim/${movie.slug}?svr=${svr}&ep=${index}`
                                      );
                                    }}
                                  >
                                    <Play
                                      size={20}
                                      className="text-white bg-black/70 rounded-full p-1"
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
              )} */}

              {/* Next episode */}
              {movie.episodes[svr].server_data.length > 0 &&
                parseInt(episode) <
                  movie.episodes[svr].server_data.length - 1 && (
                  <div className="relative group/episodes">
                    <button
                      className="hover:scale-125 transition-all ease-linear duration-100 group/tooltip relative p-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onNavigateToNextEpisode) {
                          onNavigateToNextEpisode();
                        } else {
                          navigate(
                            `/xem-phim/${movie.slug}?svr=${svr}&ep=${
                              parseInt(episode) + 1
                            }`
                          );
                        }
                      }}
                      onTouchEnd={(e) => {
                        e.stopPropagation();
                      }}
                      aria-label="Xem tập tiếp theo"
                    >
                      <SkipForward size={isMobile ? 30 : 34} />
                    </button>
                    <div
                      className="hidden lg:block absolute -translate-x-1/2 -translate-y-[100%] top-0 left-1/2 bg-[#262626]/95 backdrop-blur text-white text-sm
                  opacity-0 invisible group-hover/episodes:opacity-100 group-hover/episodes:visible 
                  transition-all duration-200 z-[9999] rounded-sm overflow-hidden"
                    >
                      <div className="py-3 px-5 text-center">
                        <span className="text-white font-semibold text-lg">
                          Tập tiếp theo
                        </span>
                        <span className="text-white font-semibold text-lg">
                          {" - Tập " +
                            movie.episodes[svr].server_data[
                              parseInt(episode) + 1
                            ].name}
                        </span>
                      </div>
                      <div className="flex flex-col h-full bg-black">
                        <div className="group/nextEpisode relative h-36 aspect-video flex items-center justify-center p-3 cursor-pointer">
                          <LazyImage
                            src={movie.poster_url}
                            alt={
                              movie.episodes[svr].server_data[
                                parseInt(episode) + 1
                              ].name
                            }
                            sizes="10vw"
                          />
                          <div
                            className="absolute bottom-0 right-0 w-full h-full flex items-center justify-center rounded-sm cursor-pointer opacity-50 group-hover/nextEpisode:opacity-100 group-hover/nextEpisode:scale-105 transition-all ease-linear duration-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onNavigateToNextEpisode) {
                                onNavigateToNextEpisode();
                              } else {
                                navigate(
                                  `/xem-phim/${movie.slug}?svr=${svr}&ep=${
                                    parseInt(episode) + 1
                                  }`
                                );
                              }
                            }}
                          >
                            <Play
                              size={40}
                              className="text-white bg-black/50 backdrop-blur-sm rounded-full p-2"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              {/* Playback speed */}
              <div className="relative group">
                <div className="relative group/speed">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSpeedMenu(!showSpeedMenu);
                    }}
                    onTouchEnd={(e) => {
                      e.stopPropagation();
                    }}
                    className="hover:scale-125 transition-all ease-linear duration-100 p-2 group/tooltip relative"
                    aria-label="Tốc độ phát"
                  >
                    <Gauge size={isMobile ? 30 : 34} />
                  </button>
                  <div
                    className={`absolute bottom-12 right-1/2 bg-black/90 backdrop-blur text-white rounded-md p-1 text-xs lg:text-sm
                  transition-all duration-200 translate-x-1/2 border border-white/10 ${
                    showSpeedMenu
                      ? "opacity-100 visible"
                      : "opacity-0 invisible lg:group-hover/speed:opacity-100 lg:group-hover/speed:visible"
                  }`}
                  >
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                      <div
                        key={rate}
                        onClick={(e) => {
                          e.stopPropagation();
                          changePlaybackRate(rate);
                          setShowSpeedMenu(false);
                        }}
                        className={`px-3 py-1 cursor-pointer hover:bg-white/20 text-center rounded transition
                    ${
                      playbackRate === rate
                        ? "text-red-500 font-semibold bg-white/10"
                        : ""
                    }`}
                      >
                        {rate}x
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quality selector */}
              <div className="relative group hidden lg:block">
                <div className="relative group/quality hidden lg:block">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowQualityMenuState(!showQualityMenuState);
                    }}
                    onTouchEnd={(e) => {
                      e.stopPropagation();
                    }}
                    className="hover:scale-125 transition-all ease-linear duration-100 p-2 group/tooltip relative"
                    aria-label="Chất lượng"
                  >
                    <SlidersHorizontal size={34} />
                  </button>
                  <div
                    className={`absolute bottom-12 right-1/2 bg-black/90 backdrop-blur text-white rounded-md p-1 text-sm
                  transition-all duration-200 translate-x-1/2 border border-white/10 min-w-max ${
                    showQualityMenuState
                      ? "opacity-100 visible"
                      : "opacity-0 invisible lg:group-hover/quality:opacity-100 lg:group-hover/quality:visible"
                  }`}
                  >
                    {qualities.map((q) => (
                      <div
                        key={q.name}
                        onClick={(e) => {
                          e.stopPropagation();
                          changeQuality(q.height === 0 ? "auto" : q.height);
                          setShowQualityMenuState(false);
                        }}
                        className={`px-3 py-1 cursor-pointer hover:bg-white/20 text-center rounded transition
                    ${
                      currentQuality ===
                      (q.height === 0 ? "auto" : `${q.height}p`)
                        ? "text-red-500 font-semibold bg-white/10"
                        : ""
                    }`}
                      >
                        {q.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Picture in Picture */}
              {pipSupported && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePiP();
                  }}
                  onTouchEnd={(e) => {
                    e.stopPropagation();
                  }}
                  className="hover:scale-125 transition-all ease-linear duration-100 group/tooltip relative p-2 hidden lg:block"
                  aria-label="Picture in Picture"
                >
                  <PictureInPicture size={34} />
                  <Tooltip
                    content={"PiP (P)"}
                    size="sm"
                    className="bottom-[100%]"
                    color="dark"
                  />
                </button>
              )}

              {/* Fullscreen */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFullscreen();
                }}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                }}
                className="hover:scale-125 transition-all ease-linear duration-100 group/tooltip relative p-2"
                aria-label={fullscreen ? "Thu nhỏ" : "Phóng to"}
              >
                {fullscreen ? (
                  <Minimize size={isMobile ? 30 : 34} />
                ) : (
                  <Maximize size={isMobile ? 30 : 34} />
                )}
                <Tooltip
                  content={fullscreen ? "Thu nhỏ (F)" : "Phóng to (F)"}
                  size="sm"
                  className="bottom-[100%]"
                  color="dark"
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
