import React, { useEffect, useState } from "react";
import { UserAuth } from "../context/AuthContext";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useMovieModal } from "../context/MovieModalContext";
import { useHoverPreview } from "../context/HoverPreviewContext";
import LazyImage from "../components/LazyImage";
import { useTop } from "../context/TopContext";
import Top10Badge from "../assets/images/Top10Badge.svg";
function FavouritePage() {
  const [movies, setMovies] = useState(null);
  const { openModal } = useMovieModal();
  const [loading, setLoading] = useState(false);
  const { topSet } = useTop();
  const { user } = UserAuth();
  const { onEnter, onLeave } = useHoverPreview();

  useEffect(() => {
    setLoading(true);
    onSnapshot(doc(db, "users", user.uid), (doc) => {
      setMovies(doc.data().savedMovies);
    });
    setLoading(false);
  }, [user?.email]);

  useEffect(() => {
    const handleResize = () => getColumns();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getColumns = () => {
    if (window.innerWidth >= 1024) return 6;
    if (window.innerWidth >= 768) return 5;
    if (window.innerWidth >= 640) return 4;
    return 3;
  };

  const handleEnter = (item, e, index) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

    const cols = getColumns();
    const colIndex = index % cols;

    const position =
      colIndex === 0 ? "first" : colIndex === cols - 1 ? "last" : "middle";

    onEnter({
      item,
      rect: {
        top: rect.top + scrollTop,
        left: rect.left + scrollLeft,
        width: rect.width,
        height: rect.height,
      },
      index: index,
      firstVisible: position === "first" ? index : -1,
      lastVisible: position === "last" ? index : -1,
    });
  };

  return (
    <div className="text-white px-[3%] mt-24 h-screen">
      <h1 className="text-xl md:text-2xl 2xl:text-4xl font-bold">
        {movies?.length == 0
          ? " Danh sách của bạn hiện đang trống !"
          : "Danh sách của tôi"}
      </h1>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-1 gap-y-14 mt-5">
        {movies?.map((item, index) => (
          <div
            className="group relative cursor-pointer h-full"
            key={item.slug}
            onMouseEnter={(e) => handleEnter(item, e, index)}
            onMouseLeave={onLeave}
            onClick={() => openModal(item.slug)}
          >
            <div className="hidden lg:block relative w-full aspect-video rounded overflow-hidden">
              <div className="object-cover w-full h-full rounded">
                <LazyImage
                  src={item.poster_url}
                  alt={item.name}
                  sizes="16vw"
                  quality={65}
                />
              </div>

              {item.sub_docquyen && (
                <img
                  loading="lazy"
                  src="https://images.ctfassets.net/y2ske730sjqp/4aEQ1zAUZF5pLSDtfviWjb/ba04f8d5bd01428f6e3803cc6effaf30/Netflix_N.png"
                  className="absolute top-2 left-2 w-3"
                />
              )}
            </div>

            <div
              className="block lg:hidden relative overflow-hidden rounded"
              onClick={() => openModal(item.slug)}
            >
              <div className="w-full object-cover aspect-[2/3] rounded">
                <LazyImage
                  src={item.thumb_url}
                  alt={item.name}
                  sizes="(max-width: 500px) 16vw, (max-width: 800px) 23vw, (max-width: 1024px) 18vw"
                  quality={65}
                />
              </div>
              {item.sub_docquyen && (
                <img
                  loading="lazy"
                  src="https://images.ctfassets.net/y2ske730sjqp/4aEQ1zAUZF5pLSDtfviWjb/ba04f8d5bd01428f6e3803cc6effaf30/Netflix_N.png"
                  className="absolute top-2 left-2 w-3"
                />
              )}
            </div>
            {topSet?.has(item.slug) && (
              <div className="absolute top-0 right-[2px]">
                <img
                  src={Top10Badge}
                  alt="Top 10"
                  className="w-10 sm:w-12 lg:w-10 aspect-auto"
                />
              </div>
            )}
            {new Date().getTime() - new Date(item.modified?.time).getTime() <
              1000 * 60 * 60 * 24 * 3 && (
              <>
                {item.episode_current.toLowerCase().includes("hoàn tất") ||
                item.episode_current.toLowerCase().includes("full") ? (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-white w-[80%] sm:w-auto bg-[#e50914] py-[2px] px-2 rounded-t text-xs font-semibold text-center shadow-black/80 shadow">
                    Mới thêm
                  </span>
                ) : item.episode_current.toLowerCase().includes("trailer") ? (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-black w-[80%] sm:w-auto bg-white py-[2px] px-2 rounded-t text-xs font-semibold text-center shadow-black/80 shadow">
                    Sắp ra mắt
                  </span>
                ) : (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex xl:flex-row flex-col rounded-t overflow-hidden w-[80%] sm:w-1/2 xl:w-[70%] 2xl:w-1/2">
                    <span className=" text-white bg-[#e50914] xl:py-[2px] py-[1px] px-1 text-xs font-semibold text-center shadow-black/80 shadow w-full">
                      Tập mới
                    </span>
                    <span className="text-black bg-white xl:py-[2px] py-[1px] px-1 text-xs font-semibold text-center shadow-black/80 shadow w-full">
                      Xem ngay
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
        {loading && (
          <>
            {[...Array(7)].map((_, index) => (
              <div
                key={index + 198}
                className="w-full aspect-[2/3] lg:aspect-video cursor-pointer relative animate-pulse"
              >
                <div className="w-full h-full bg-gray-600 rounded-md"></div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default FavouritePage;
