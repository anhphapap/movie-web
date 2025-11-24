import React, { useEffect, useState, useRef } from "react";
import LazyImage from "./LazyImage";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Play, X } from "lucide-react";
const Episodes = ({
  show,
  onClose,
  episode,
  name,
  episodes,
  svr,
  poster_url,
  slug,
}) => {
  const [showServer, setShowServer] = useState(parseInt(svr));
  const [showEpisode, setShowEpisode] = useState(parseInt(episode));
  const [showEpisodes, setShowEpisodes] = useState(
    Math.floor(parseInt(episode) / 100)
  );
  // Mặc định luôn ở tab 3
  const [tab, setTab] = useState(3);
  const [episodesRange, setEpisodesRange] = useState(
    Math.floor(parseInt(episode) / 100)
  );
  const [hoveredEpisode, setHoveredEpisode] = useState(parseInt(episode));
  const navigate = useNavigate();
  const episodesContainerRef = useRef(null);

  // Scroll đến tập hiện tại khi mở menu
  useEffect(() => {
    if (tab === 3 && episodesContainerRef.current) {
      const currentEpisodeIndex = parseInt(episode) - showEpisodes * 100;
      const episodeElement =
        episodesContainerRef.current.children[currentEpisodeIndex];
      if (episodeElement) {
        episodeElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [tab, episode, showEpisodes]);

  const handleTab = (newTab) => {
    setTab(newTab);
  };

  const handleBack = () => {
    if (tab === 3) {
      // Nếu đang ở tab 3, back về tab 2 (nếu >100 tập) hoặc tab 1 (nếu ≤100 tập)
      if (episodes[showServer].server_data.length > 100) {
        setTab(2);
      } else {
        setTab(1);
      }
    } else if (tab === 2) {
      // Nếu đang ở tab 2, back về tab 1
      setTab(1);
    }
  };
  return (
    <div
      className={`lg:absolute fixed lg:-bottom-[126px] bottom-0 right-0 bg-[#262626] backdrop-blur lg:h-[500px] h-screen lg:w-[600px] w-full text-white rounded-sm text-sm
                  lg:opacity-0 lg:group-hover/episodes:opacity-100 lg:group-hover/episodes:visible 
                   ${show ? "visible opacity-100" : "invisible opacity-0"}
                  lg:transition-all lg:duration-200 z-[9999] lg:-translate-y-1/2`}
      onMouseLeave={() => {
        setHoveredEpisode(parseInt(episode));
        setTab(3);
      }}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="py-3 px-5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {tab > 1 && (
            <button onClick={handleBack}>
              <ArrowLeft size={20} strokeWidth={3} />
            </button>
          )}
          <span className="text-white font-semibold lg:text-2xl text-lg text-truncate ">
            {name}
            {tab !== 1 &&
              " - " + episodes[showServer].server_name.split(" #")[0]}
          </span>
        </div>
        <button onClick={onClose} className="lg:hidden block">
          <X size={20} strokeWidth={3} />
        </button>
      </div>
      <div
        ref={episodesContainerRef}
        className="flex flex-col overflow-y-auto h-full bg-[#262626] pb-20"
      >
        {tab === 3 && (
          <>
            {episodes[showServer].server_data
              .slice(showEpisodes, showEpisodes + 100)
              .map((ep, index) => (
                <div
                  key={index}
                  className={`transition ${
                    hoveredEpisode === showEpisodes * 100 + index
                      ? "bg-black/50"
                      : "hover:bg-[#363636]"
                  }`}
                >
                  <div
                    className="flex items-center justify-between py-3 px-5 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setHoveredEpisode(showEpisodes * 100 + index);
                    }}
                  >
                    <span className="text-zinc-300 text-sm">
                      {showEpisodes * 100 + index + 1}
                    </span>
                    <span className="ml-4 flex-1 text-white font-medium text-sm">
                      {"Tập " +
                        episodes[showServer].server_data[
                          showEpisodes * 100 + index
                        ].name}
                    </span>
                  </div>

                  {hoveredEpisode === showEpisodes * 100 + index && (
                    <div
                      className={`flex group-hover:flex p-2 gap-2 group/Episodes`}
                    >
                      <div className={`relative w-60 ml-3`}>
                        <LazyImage
                          src={poster_url}
                          alt={
                            episodes[showServer].server_data[
                              showEpisodes * 100 + index
                            ].name
                          }
                          sizes="10vw"
                        />
                        {(hoveredEpisode !== parseInt(episode) ||
                          showServer !== parseInt(svr)) && (
                          <div
                            className="absolute bottom-0 right-0 w-full h-full flex items-center justify-center rounded-sm cursor-pointer opacity-70 group-hover/Episodes:opacity-100  transition-all ease-linear duration-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(
                                `/xem-phim/${slug}?svr=${showServer}&ep=${
                                  showEpisodes * 100 + index
                                }`
                              );
                              onClose();
                            }}
                          >
                            <button
                              className="group relative bg-white/10 backdrop-blur-md border-4 border-white/80 rounded-full p-3 sm:p-4 transition-all duration-300 hover:scale-110 hover:bg-white/20 hover:border-white shadow-sm active:scale-95 hover:shadow-white/50"
                              aria-label="Phát video"
                            >
                              <Play
                                size={24}
                                className="text-white fill-white drop-shadow-2xl"
                                strokeWidth={2}
                              />
                              <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse"></div>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </>
        )}
        {tab === 2 && (
          <>
            {Array.from({
              length: Math.ceil(episodes[showServer].server_data.length / 100),
            }).map((item, index) => (
              <div key={index} className={`transition hover:bg-[#363636]`}>
                <div
                  className="flex items-center justify-between gap-2 py-3 px-5 cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEpisodes(index);
                    setTab(3);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Check
                      size={20}
                      strokeWidth={3}
                      className={`${
                        Math.floor(parseInt(episode) / 100) === index &&
                        parseInt(svr) === showServer
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    />
                    <span className="text-white font-medium text-sm">
                      Tập {episodes[showServer].server_data[index * 100].name} -{" "}
                      {episodes[showServer].server_data?.[index * 100 + 99]
                        ?.name ||
                        episodes[showServer].server_data[
                          episodes[showServer].server_data.length - 1
                        ].name}
                    </span>
                  </div>
                  <ArrowRight
                    size={20}
                    strokeWidth={3}
                    className="group-hover:translate-x-1 opacity-0 group-hover:opacity-100 transition-all ease-linear duration-100"
                  />
                </div>
              </div>
            ))}
          </>
        )}
        {tab === 1 && (
          <>
            {episodes.map((ep, index) => (
              <div key={index} className={`transition hover:bg-[#363636]`}>
                <div
                  className="flex items-center justify-between gap-2 py-3 px-5 cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowServer(index);
                    setShowEpisodes(Math.floor(parseInt(episode) / 100));
                    if (episodes[index].server_data.length > 100) {
                      setTab(2);
                    } else {
                      setTab(3);
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Check
                      size={20}
                      strokeWidth={3}
                      className={`${
                        parseInt(svr) === index ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    <span className="text-white font-medium text-sm">
                      {episodes[index].server_name.split(" #")[0]}
                    </span>
                  </div>
                  <ArrowRight
                    size={20}
                    strokeWidth={3}
                    className="group-hover:translate-x-1 opacity-0 group-hover:opacity-100 transition-all ease-linear duration-100"
                  />
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default Episodes;
