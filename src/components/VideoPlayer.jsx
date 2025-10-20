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
} from "lucide-react";
import { formatTime } from "../utils/data";
import { useNavigate } from "react-router-dom";
import Tooltip from "./Tooltip";
import LazyImage from "./LazyImage";

const VideoPlayer = ({
  src,
  poster,
  title = "Tiêu đề phim",
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
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  const lastTapTime = useRef(0);
  const lastTapX = useRef(0);
  const lastTapY = useRef(0);
  const singleTapTimer = useRef(null);
  const navigate = useNavigate();

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
    setHasPlayedOnce(false);

    if (Hls.isSupported()) {
      const hls = new Hls({
        startLevel: -1, // auto
      });
      hls.loadSource(src);
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
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;

      const handleCanPlay = () => {
        setVideoReady(true);
      };

      video.addEventListener("canplay", handleCanPlay);
    }

    setShowEpisodes(parseInt(episode));

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [src]);

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

    video.addEventListener("waiting", handleBuffering);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("progress", handleProgress);

    return () => {
      video.removeEventListener("waiting", handleBuffering);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("progress", handleProgress);
    };
  }, []);

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
    }
  };

  const handleTimeUpdate = () => {
    setProgress(videoRef.current.currentTime);
    setDuration(videoRef.current.duration);
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

      // Horizontal swipe = Seek
      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0) {
          handleSeek10s(10);
          showCenterOverlay("forward");
        } else {
          handleSeek10s(-10);
          showCenterOverlay("backward");
        }
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
        poster={import.meta.env.VITE_API_IMAGE + poster}
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
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/60 to-transparent z-10">
          <button
            onClick={handleInitialPlay}
            className="group bg-red-600 hover:bg-red-700 rounded-full p-6 lg:p-8 transition-all duration-300 hover:scale-110 shadow-2xl active:scale-95"
            aria-label="Phát video"
          >
            <Play size={isMobile ? 48 : 64} className="text-white fill-white" />
          </button>
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
      {showOverlay && (
        <div className="absolute inset-0 bg-black/60 flex flex-col justify-center px-[10%] transition-opacity duration-500">
          <div className="text-white max-w-2xl pt-12 lg:pt-0">
            <p className="text-xs lg:text-base mb-2 text-white/70">Đang xem</p>
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
          <div className="flex items-center justify-between w-full gap-2 mb-1 lg:mb-3">
            <div
              data-progress-bar
              className="relative h-1 bg-white/20 cursor-pointer w-full transition-all duration-200 group/progress rounded-full py-1 -my-1"
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
                className="absolute top-0 left-0 h-full bg-white/20 rounded-full transition-all duration-200"
                style={{ width: `${buffered}%` }}
              />

              {/* Progress */}
              <div
                className={`absolute top-0 left-0 h-full bg-red-600 rounded-full ${
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
              {hoverTime && (
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
            <span className="text-xs lg:text-sm whitespace-nowrap ml-2 text-white/90">
              {formatTime(duration - progress)}
            </span>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between px-2 lg:px-3">
            <div className="flex items-center space-x-1 lg:space-x-4 flex-wrap">
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
                className="hover:scale-110 transition-all ease-linear duration-100 group/tooltip relative p-1.5 lg:p-0"
                aria-label={playing ? "Dừng" : "Phát"}
              >
                {playing ? (
                  <Pause size={isMobile ? 22 : 24} />
                ) : (
                  <Play size={isMobile ? 22 : 24} />
                )}
                <Tooltip
                  content={playing ? "Dừng (Space)" : "Phát (Space)"}
                  size="sm"
                />
              </button>

              {/* Backward */}
              <button
                onClick={() => {
                  handleSeek10s(-10);
                  showCenterOverlay("backward");
                }}
                className="hover:scale-110 transition-all ease-linear duration-100 group/tooltip relative p-1.5 lg:p-0"
                aria-label="Quay lại 10 giây"
              >
                <RotateCcw size={isMobile ? 20 : 24} />
                <Tooltip content={"10s trước (←)"} size="sm" />
              </button>

              {/* Forward */}
              <button
                onClick={() => {
                  handleSeek10s(10);
                  showCenterOverlay("forward");
                }}
                className="hover:scale-110 transition-all ease-linear duration-100 group/tooltip relative p-1.5 lg:p-0"
                aria-label="Tiến 10 giây"
              >
                <RotateCw size={isMobile ? 20 : 24} />
                <Tooltip content={"10s sau (→)"} size="sm" />
              </button>

              {/* Volume - Disabled (use edge swipe instead) */}
              {false && (
                <div className="flex items-center relative group">
                  <button
                    onClick={handleMute}
                    className="hover:scale-125 transition-all ease-linear duration-100 p-1 lg:p-0"
                    aria-label={muted ? "Bật tiếng" : "Tắt tiếng"}
                  >
                    {muted ? (
                      <VolumeX size={isMobile ? 18 : 24} />
                    ) : volume < 0.3 ? (
                      <Volume size={isMobile ? 18 : 24} />
                    ) : volume < 0.7 ? (
                      <Volume1 size={isMobile ? 18 : 24} />
                    ) : (
                      <Volume2 size={isMobile ? 18 : 24} />
                    )}
                  </button>
                  <div className="cursor-pointer -rotate-90 absolute bottom-[56px] left-1/2 z-10 -translate-x-1/2 bg-black/80 backdrop-blur flex justify-center items-center p-1 group-hover:visible group-hover:opacity-100 opacity-0 invisible">
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
              {title} - {"Tập " + episodeName}
            </span>

            <div className="flex items-center space-x-1 lg:space-x-4">
              {/* Episodes */}
              {episodes.length > 0 && (
                <div className="group/episodes hidden lg:block">
                  <button
                    className="mt-1.5 group-hover/episodes:scale-125 transition-all ease-linear duration-100 p-1 lg:p-0"
                    aria-label="Danh sách tập"
                  >
                    <ListVideo size={24} />
                  </button>
                  <div
                    className="absolute -bottom-24 right-0 bg-[#262626]/95 backdrop-blur h-[400px] w-2/5 text-white rounded-md text-sm
                  opacity-0 invisible group-hover/episodes:opacity-100 group-hover/episodes:visible 
                  transition-all duration-200 z-[9999] -translate-y-1/2 border border-white/10"
                  >
                    <div className="py-3 px-5 border-b border-white/10">
                      <span className="text-white font-semibold text-lg">
                        Danh sách tập
                      </span>
                    </div>
                    <div className="flex flex-col overflow-y-auto h-full bg-[#262626]">
                      {episodes.map((ep, index) => (
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
                            onClick={() => setShowEpisodes(index)}
                          >
                            <span className="text-zinc-300 text-xs">
                              {index + 1}
                            </span>
                            <span className="ml-4 flex-1 text-white font-medium text-xs">
                              {"Tập " + ep.name}
                            </span>
                          </div>

                          {showEpisodes === index && (
                            <div className={`flex group-hover:flex p-2 gap-2`}>
                              <div className="relative w-12 h-8">
                                <LazyImage
                                  src={poster}
                                  alt={ep.name}
                                  sizes="5vw"
                                />
                                {showEpisodes !== parseInt(episode) && (
                                  <div
                                    className="absolute bottom-0 right-0 w-full h-full flex items-center justify-center rounded-sm cursor-pointer hover:scale-105 transition-all ease-linear duration-100"
                                    onClick={() =>
                                      navigate(
                                        `/xem-phim/${movieSlug}?svr=${svr}&ep=${index}`
                                      )
                                    }
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
              )}

              {/* Next episode */}
              {episodes.length > 0 && (
                <button
                  className="hover:scale-110 transition-all ease-linear duration-100 group/tooltip relative p-1.5 lg:p-0"
                  onClick={() =>
                    navigate(
                      `/xem-phim/${movieSlug}?svr=${svr}&ep=${
                        parseInt(episode) + 1
                      }`
                    )
                  }
                  aria-label="Xem tập tiếp theo"
                >
                  <SkipForward size={isMobile ? 20 : 24} />
                  <Tooltip
                    content={"Tập " + (parseInt(episode) + 2) + " (N)"}
                    size="sm"
                  />
                </button>
              )}

              {/* Playback speed */}
              <div className="relative group">
                <div className="relative group/speed">
                  <button
                    onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                    className="hover:scale-110 transition-all ease-linear duration-100 lg:mt-1.5 p-1.5 lg:p-0 group-hover/speed:scale-110 group/tooltip relative"
                    aria-label="Tốc độ phát"
                  >
                    <Gauge size={isMobile ? 20 : 24} />
                  </button>
                  <div
                    className={`absolute bottom-10 right-1/2 bg-black/90 backdrop-blur text-white rounded-md p-1 text-xs lg:text-sm
                  transition-all duration-200 translate-x-1/2 border border-white/10 ${
                    showSpeedMenu
                      ? "opacity-100 visible"
                      : "opacity-0 invisible lg:group-hover/speed:opacity-100 lg:group-hover/speed:visible"
                  }`}
                  >
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                      <div
                        key={rate}
                        onClick={() => {
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
                    onClick={() =>
                      setShowQualityMenuState(!showQualityMenuState)
                    }
                    className="hover:scale-125 transition-all ease-linear duration-100 p-1 pt-2 group-hover/quality:scale-125 group/tooltip relative"
                    aria-label="Chất lượng"
                  >
                    <SlidersHorizontal size={24} />
                    <Tooltip content={`${currentQuality}`} size="sm" />
                  </button>
                  <div
                    className={`absolute bottom-10 right-1/2 bg-black/90 backdrop-blur text-white rounded-md p-1 text-sm
                  transition-all duration-200 translate-x-1/2 border border-white/10 min-w-max ${
                    showQualityMenuState
                      ? "opacity-100 visible"
                      : "opacity-0 invisible lg:group-hover/quality:opacity-100 lg:group-hover/quality:visible"
                  }`}
                  >
                    {qualities.map((q) => (
                      <div
                        key={q.name}
                        onClick={() => {
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
                  onClick={togglePiP}
                  className="hover:scale-125 transition-all ease-linear duration-100 group/tooltip relative p-1 lg:p-0 hidden lg:block"
                  aria-label="Picture in Picture"
                >
                  <PictureInPicture size={24} />
                  <Tooltip content={"PiP (P)"} size="sm" />
                </button>
              )}

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="hover:scale-110 transition-all ease-linear duration-100 group/tooltip relative p-1.5 lg:p-0"
                aria-label={fullscreen ? "Thu nhỏ" : "Phóng to"}
              >
                {fullscreen ? (
                  <Minimize size={isMobile ? 20 : 24} />
                ) : (
                  <Maximize size={isMobile ? 20 : 24} />
                )}
                <Tooltip
                  content={fullscreen ? "Thu nhỏ (F)" : "Phóng to (F)"}
                  size="sm"
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
