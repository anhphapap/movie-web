import React, { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { UserAuth } from "../context/AuthContext";
import { useMovieModal } from "../context/MovieModalContext";
import { useHoverPreview } from "../context/HoverPreviewContext";
import LazyImage from "../components/LazyImage";
import { useTop } from "../context/TopContext";
import Top10Badge from "../assets/images/Top10Badge.svg";
import { useFavorites } from "../context/FavouritesProvider";

function FavouritePage() {
  const { favoritesPage, loadFavoritesPage, hasMore, loadingPage } =
    useFavorites();
  const { openModal } = useMovieModal();
  const { topSet } = useTop();
  const { user } = UserAuth();
  const { onEnter, onLeave } = useHoverPreview();
  const { ref, inView } = useInView({ threshold: 0.2 }); // 👀 trigger khi gần cuối

  // 🔹 Load danh sách lần đầu
  useEffect(() => {
    if (user) loadFavoritesPage();
  }, [user]);

  // 🔹 Khi cuộn gần cuối → tự load thêm
  useEffect(() => {
    if (inView && hasMore && !loadingPage) {
      loadFavoritesPage();
    }
  }, [inView]);

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
    <div className="text-white px-[3%] mt-24 min-h-screen pb-20">
      <h1 className="text-xl md:text-2xl 2xl:text-4xl font-bold">
        {favoritesPage?.length === 0
          ? "Danh sách của bạn hiện đang trống!"
          : "Danh sách của tôi"}
      </h1>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-1 gap-y-14 mt-5">
        {favoritesPage?.map((item, index) => (
          <div
            className="group relative cursor-pointer h-full"
            key={item.slug || item.id || index}
            onMouseEnter={(e) => handleEnter(item, e, index)}
            onMouseLeave={onLeave}
            onClick={() => openModal(item.slug, item.tmdb?.id, item.tmdb?.type)}
          >
            {/* Thumbnail chính */}
            <div className="hidden lg:block relative w-full aspect-video rounded overflow-hidden">
              <LazyImage
                src={item.poster_url}
                alt={item.name}
                sizes="16vw"
                quality={65}
                className="object-cover w-full h-full rounded"
              />
              {item.sub_docquyen && (
                <img
                  loading="lazy"
                  src="https://images.ctfassets.net/y2ske730sjqp/4aEQ1zAUZF5pLSDtfviWjb/ba04f8d5bd01428f6e3803cc6effaf30/Netflix_N.png"
                  className="absolute top-2 left-2 w-3"
                />
              )}
            </div>

            {/* Mobile thumbnail */}
            <div className="block lg:hidden relative overflow-hidden rounded">
              <LazyImage
                src={item.thumb_url}
                alt={item.name}
                sizes="(max-width: 500px) 16vw, (max-width: 800px) 23vw, (max-width: 1024px) 18vw"
                quality={65}
                className="w-full object-cover aspect-[2/3] rounded"
              />
              {item.sub_docquyen && (
                <img
                  loading="lazy"
                  src="https://images.ctfassets.net/y2ske730sjqp/4aEQ1zAUZF5pLSDtfviWjb/ba04f8d5bd01428f6e3803cc6effaf30/Netflix_N.png"
                  className="absolute top-2 left-2 w-3"
                />
              )}
            </div>

            {/* Top 10 badge */}
            {topSet?.has(item.slug) && (
              <div className="absolute top-0 right-[2px]">
                <img
                  src={Top10Badge}
                  alt="Top 10"
                  className="w-10 sm:w-12 lg:w-10 aspect-auto"
                />
              </div>
            )}
          </div>
        ))}

        {/* Skeleton loading */}
        {loadingPage && hasMore && (
          <>
            {[...Array(6)].map((_, index) => (
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

      {/* 👇 Vị trí quan sát để trigger load thêm */}
      {hasMore && favoritesPage.length > 0 && (
        <div ref={ref} className="h-10 mt-10" />
      )}
    </div>
  );
}

export default FavouritePage;
