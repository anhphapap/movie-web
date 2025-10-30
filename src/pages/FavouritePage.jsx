import React, { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { UserAuth } from "../context/AuthContext";
import { useMovieModal } from "../context/MovieModalContext";
import { useHoverPreview } from "../context/HoverPreviewContext";
import LazyImage from "../components/LazyImage";
import { useTop } from "../context/TopContext";
import Top10Badge from "../assets/images/Top10Badge.svg";
import { useFavorites } from "../context/FavouritesProvider";
import logo_n from "../assets/images/N_logo.png";
import SEO from "../components/SEO";
function FavouritePage() {
  const { favoritesPage, loadFavoritesPage, hasMore, loadingPage } =
    useFavorites();
  const movieModal = useMovieModal();
  const openModal = movieModal?.openModal || (() => {});
  const { topSet } = useTop();
  const { user } = UserAuth();
  const { onEnter, onLeave } = useHoverPreview();
  const { ref, inView } = useInView({ threshold: 0.2 }); // 👀 trigger khi gần cuối
  const seoData = {
    titleHead: "Danh sách phim yêu thích",
    descriptionHead:
      "Tổng hợp các bộ phim bạn đã lưu yêu thích tại Needflex. Truy cập nhanh để xem lại hoặc tiếp tục xem những bộ phim bạn quan tâm.",
    og_url: "yeu-thich",
    og_type: "website",
    og_image: ["/assets/images/N_logo.png"],
    seoSchema: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Yêu Thích",
      description:
        "Danh sách phim yêu thích được người dùng lưu trên Needflex.",
      url: "https://needflex.site/yeu-thich",
    },
  };

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
      <SEO seoData={seoData} />
      <h1 className="text-xl md:text-2xl">
        {favoritesPage?.length === 0
          ? "Danh sách của bạn hiện đang trống!"
          : "Danh sách của tôi"}
      </h1>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 md:gap-x-[.4vw] gap-x-[.8vw] md:gap-y-[4vw] gap-y-[8vw] mt-5">
        {favoritesPage?.map((item, index) => (
          <div
            className="group relative cursor-pointer h-full"
            key={item.slug || item.id || index}
            onMouseEnter={(e) => handleEnter(item, e, index)}
            onMouseLeave={onLeave}
            onClick={() => openModal(item.slug, item.tmdb?.id, item.tmdb?.type)}
          >
            {/* Thumbnail chính */}
            <div className="hidden md:block relative w-full aspect-video rounded-[.2vw] overflow-hidden">
              <LazyImage
                src={item.poster_url}
                alt={item.name}
                sizes="(max-width: 1024px) 24vw,(max-width: 1536px) 19vw,16vw"
                quality={65}
                className="object-cover w-full h-full"
              />
              {item.sub_docquyen && (
                <img
                  loading="lazy"
                  src={logo_n}
                  alt="Needflex"
                  className="absolute top-2 left-2 w-3"
                />
              )}
            </div>

            {/* Mobile thumbnail */}
            <div className="block md:hidden relative overflow-hidden rounded-[.4vw]">
              <LazyImage
                src={item.thumb_url}
                alt={item.name}
                sizes="(max-width: 500px) 16vw, (max-width: 800px) 23vw, (max-width: 1024px) 18vw"
                quality={65}
                className="w-full object-cover aspect-[2/3]"
              />
              {item.sub_docquyen && (
                <img
                  loading="lazy"
                  src={logo_n}
                  alt="Needflex"
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
                  className="w-10 sm:w-12 md:w-10 aspect-auto"
                />
              </div>
            )}
            {new Date().getTime() - new Date(item.modified?.time).getTime() <
              1000 * 60 * 60 * 24 * 3 && (
              <>
                {item.episode_current.toLowerCase().includes("hoàn tất") ||
                item.episode_current.toLowerCase().includes("full") ? (
                  <span className="text-nowrap absolute bottom-0 left-1/2 -translate-x-1/2 text-white w-auto bg-[#e50914] py-[2px] px-2 rounded-t text-xs font-semibold text-center shadow-black/80 shadow">
                    Mới thêm
                  </span>
                ) : item.episode_current.toLowerCase().includes("trailer") ? (
                  <span className="text-nowrap absolute bottom-0 left-1/2 -translate-x-1/2 text-black w-auto bg-white py-[2px] px-2 rounded-t text-xs font-semibold text-center shadow-black/80 shadow">
                    Sắp ra mắt
                  </span>
                ) : (
                  <div className="text-nowrap absolute bottom-0 left-1/2 -translate-x-1/2 flex xl:flex-row flex-col rounded-t overflow-hidden w-auto">
                    <span className="text-nowrap text-white bg-[#e50914] xl:py-[2px] py-[1px] px-2 text-xs font-semibold text-center shadow-black/80 shadow">
                      Tập mới
                    </span>
                    <span className="text-nowrap text-black bg-white xl:py-[2px] py-[1px] px-2 text-xs font-semibold text-center shadow-black/80 shadow">
                      Xem ngay
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        ))}

        {/* Skeleton loading */}
        {loadingPage && hasMore && (
          <>
            {[...Array(6)].map((_, index) => (
              <div
                key={index + 198}
                className="w-full aspect-[2/3] md:aspect-video cursor-pointer relative animate-pulse"
              >
                <div className="w-full h-full bg-gray-600 rounded-[.4vw] md:rounded-[.2vw]"></div>
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
