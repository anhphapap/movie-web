import React from "react";
import { useNavigate } from "react-router-dom";
import { Play, Clock, X, RotateCcw } from "lucide-react";
import LazyImage from "./LazyImage";
import { formatTime } from "../utils/data";

const WatchingCard = ({ movie, onRemove, onPlay }) => {
  const navigate = useNavigate();

  const formatLastWatched = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return "Vừa xem";
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} ngày trước`;
    }
  };

  const handlePlay = () => {
    if (onPlay) {
      onPlay(movie);
    } else {
      // Lưu thông tin resume vào localStorage
      const resumeData = {
        slug: movie.slug,
        currentTime: movie.currentTime || 0,
        duration: movie.duration || 0,
        progress: movie.progress || 0,
        timestamp: Date.now(),
      };

      localStorage.setItem("resumeVideo", JSON.stringify(resumeData));
      navigate(`/xem-phim/${movie.slug}?svr=${movie.svr}&ep=${movie.episode}`);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove(movie.slug);
    }
  };

  return (
    <div className="relative group cursor-pointer" onClick={handlePlay}>
      {/* Poster */}
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
        <LazyImage
          src={movie.thumb_url}
          alt={movie.name}
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 12vw"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
          <div
            className="h-full bg-red-500 transition-all duration-300"
            style={{ width: `${movie.progress || 0}%` }}
          />
        </div>

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
            <Play size={24} className="text-white fill-white" />
          </div>
        </div>

        {/* Remove button */}
        <button
          onClick={handleRemove}
          className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-500/80"
        >
          <X size={16} className="text-white" />
        </button>

        {/* Episode badge */}
        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-md font-semibold">
          Tập {movie.episodeName}
        </div>
      </div>

      {/* Movie info */}
      <div className="mt-2 space-y-1">
        <h3 className="text-white font-semibold text-sm line-clamp-2 group-hover:text-red-400 transition-colors">
          {movie.name}
        </h3>

        <div className="flex items-center justify-between text-xs text-white/70">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {formatLastWatched(movie.lastWatched)}
          </span>
          <span>
            {formatTime(movie.currentTime || 0)} /{" "}
            {formatTime(movie.duration || 0)}
          </span>
        </div>

        {/* Progress percentage */}
        <div className="text-xs text-white/60">
          {Math.round(movie.progress || 0)}% hoàn thành
        </div>
      </div>
    </div>
  );
};

export default WatchingCard;
