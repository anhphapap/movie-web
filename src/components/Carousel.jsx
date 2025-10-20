import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { useRef, useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useHoverPreview } from "../context/HoverPreviewContext";
import { tops } from "../utils/data";
import { useInView } from "react-intersection-observer";
import LazyImage from "./LazyImage";
import { getTmdbCached } from "../utils/tmdbCache";
import { useTop } from "../context/TopContext";
import Top10Badge from "../assets/images/Top10Badge.svg";
import { useMovieModal } from "../context/MovieModalContext";
import { useListModal } from "../context/ListModalContext";
export default function Carousel({
  nameList,
  typeList = "list",
  type_slug = "phim-moi-cap-nhat",
  sort_field = "_id",
  country = "",
  category = "",
  year = new Date().getFullYear(),
  size = 16,
}) {
  const [movies, setMovies] = useState([]);
  const [firstVisible, setFirstVisible] = useState(0);
  const [lastVisible, setLastVisible] = useState(0);
  const swiperRef = useRef(null);
  const containerRef = useRef(null);
  const paginationRef = useRef(null);
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const [swiperHeight, setSwiperHeight] = useState(0);
  const [canSlidePrev, setCanSlidePrev] = useState(false);
  const [canSlideNext, setCanSlideNext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isAppending, setIsAppending] = useState(false);
  const { onEnter, onLeave } = useHoverPreview();
  const { topSet } = useTop();
  const { openModal } = useMovieModal();
  const { openList } = useListModal();
  const fetchedRef = useRef(false);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  useEffect(() => {
    if (!swiperRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setSwiperHeight(entry.contentRect.height);
      }
    });

    observer.observe(swiperRef.current);

    return () => observer.disconnect();
  }, []);

  const fetchMoviesChunk = async (pageNum) => {
    if (isAppending || !hasMore || typeList === "top") return;
    if (pageNum === 1) setLoading(true);
    setIsAppending(true);

    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_API_LIST
        }${type_slug}?sort_field=${sort_field}&category=${category}&country=${country}&year=${year}&page=${pageNum}&limit=8`
      );
      const items = res.data.data.items || [];

      setMovies((prev) => [...prev, ...items]);

      if (pageNum >= 3) setHasMore(false);
      // else {
      //   const skeletons = Array.from({ length: 4 }, (_, i) => ({
      //     _id: `skeleton-${pageNum}-${i}`,
      //     skeleton: true,
      //   }));
      //   setMovies((prev) => [...prev, ...skeletons]);
      // }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAppending(false);
      setLoading(false);
    }
  };

  const updateNavState = (swiper) => {
    setCanSlidePrev(!swiper.isBeginning);
    setCanSlideNext(!swiper.isEnd);
  };

  const fetchMovies = async () => {
    setLoading(true);
    if (typeList === "top") {
      let mounted = true;
      (async () => {
        const data = await getTmdbCached(
          type_slug === "phim-bo" ? "tv" : "movie",
          "day"
        );
        if (mounted) {
          setMovies(data);
          setLoading(false);
        }
      })();
      return () => {
        mounted = false;
      };
    } else {
      fetchMoviesChunk(1);
    }
  };

  useEffect(() => {
    if (!inView || fetchedRef.current) return;
    fetchedRef.current = true;
    fetchMovies();
  }, [type_slug, inView]);

  useEffect(() => {
    if (page > 1) fetchMoviesChunk(page);
  }, [page]);

  const handleEnter = (item, e, index) => {
    const rect = e.currentTarget.getBoundingClientRect();

    onEnter({
      item,
      rect: {
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      },
      index,
      firstVisible,
      lastVisible,
      typeList,
    });
  };

  if (loading) {
    return (
      <div className="px-[3%] relative animate-pulse my-10">
        <h2 className="font-bold mb-3 rounded h-5 bg-neutral-900 w-fit text-transparent">
          {" "}
          {nameList}
        </h2>
        <div className="lg:h-[150px] sm:h-[200px] h-[150px] bg-neutral-900 animate-pulse rounded-xl" />
      </div>
    );
  }
  if (typeList === "top") {
    return (
      <div
        className="my-10 lg:my-14 relative w-[94%] mx-[3%]"
        ref={(node) => {
          containerRef.current = node;
          ref(node);
        }}
      >
        <div className="flex justify-between items-center w-full mb-3">
          <h2 className="text-white font-bold">{nameList}</h2>
          <div
            ref={paginationRef}
            className="ml-auto hidden lg:flex justify-center gap-[1px]"
          />
        </div>

        <Swiper
          key={`top-${type_slug}`}
          modules={[Pagination, Navigation]}
          pagination={{
            el: paginationRef.current,
            clickable: true,
          }}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          spaceBetween={6}
          onResize={(swiper) => {
            setSwiperHeight(swiper.el.clientHeight);
            setFirstVisible(swiper.activeIndex);
            setLastVisible(
              swiper.activeIndex + swiper.params.slidesPerView - 1
            );
          }}
          onInit={(swiper) => {
            swiper.params.pagination.el = paginationRef.current;
            swiper.pagination.init();
            swiper.pagination.render();
            swiper.pagination.update();
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
            swiper.navigation.init();
            swiper.navigation.update();
            setLastVisible(swiper.params.slidesPerView - 1);
            setSwiperHeight(swiper.el.clientHeight);
            setCanSlidePrev(!swiper.isBeginning);
            setCanSlideNext(!swiper.isEnd);
          }}
          onSlideChange={(swiper) => {
            setFirstVisible(swiper.activeIndex);
            setLastVisible(
              swiper.activeIndex + swiper.params.slidesPerView - 1
            );
            setCanSlidePrev(!swiper.isBeginning);
            setCanSlideNext(!swiper.isEnd);
          }}
          breakpoints={{
            1024: { slidesPerView: 5, slidesPerGroup: 5 },
            800: { slidesPerView: 4, slidesPerGroup: 4 },
            500: { slidesPerView: 3, slidesPerGroup: 3 },
            0: { slidesPerView: 2, slidesPerGroup: 2 },
          }}
          className="w-full"
          ref={swiperRef}
        >
          {movies.map((item, index) => (
            <SwiperSlide
              key={`${type_slug}-${item._id}-${index}`}
              data-index={index}
              className="!overflow-visible"
            >
              <div
                className="group relative cursor-pointer h-full flex items-end lg:items-center"
                onMouseEnter={(e) => handleEnter(item, e, index)}
                onMouseLeave={onLeave}
                onClick={() =>
                  openModal(item.slug, item.tmdb?.id, item.tmdb?.type)
                }
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: tops[index],
                  }}
                  className="w-[30%] lg:w-[50%] aspect-[2/3] flex items-end lg:items-center"
                />
                <div className="relative w-[70%] lg:w-[50%] rounded lg:rounded-[3px] overflow-hidden">
                  <div className="object-cover w-full aspect-[2/3] object-center rounded lg:rounded-[3px]">
                    <LazyImage
                      src={`${item.thumb_url}`}
                      alt={item.name}
                      sizes="(max-width: 500px) 15vw, (max-width: 800px) 21vw, (max-width: 1024px) 16vw, 10vw"
                      quality={65}
                    />
                  </div>
                  {item.sub_docquyen && (
                    <img
                      loading="lazy"
                      src="https://images.ctfassets.net/y2ske730sjqp/4aEQ1zAUZF5pLSDtfviWjb/ba04f8d5bd01428f6e3803cc6effaf30/Netflix_N.png"
                      className="absolute top-[6px] left-[6px] w-3"
                    ></img>
                  )}
                  {new Date().getTime() -
                    new Date(item.modified?.time).getTime() <
                    1000 * 60 * 60 * 24 * 3 && (
                    <>
                      {item.episode_current
                        .toLowerCase()
                        .includes("hoàn tất") ||
                      item.episode_current.toLowerCase().includes("full") ? (
                        <span className="text-nowrap absolute bottom-0 left-1/2 -translate-x-1/2 text-white w-auto bg-[#e50914] py-[2px] px-2 rounded-t text-xs font-semibold text-center shadow-black/80 shadow">
                          Mới thêm
                        </span>
                      ) : item.episode_current
                          .toLowerCase()
                          .includes("trailer") ? (
                        <span className="text-nowrap absolute bottom-0 left-1/2 -translate-x-1/2 text-black w-auto bg-white py-[2px] px-2 rounded-t text-xs font-semibold text-center shadow-black/80 shadow">
                          Sắp ra mắt
                        </span>
                      ) : (
                        <div className="text-nowrap absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col rounded-t overflow-hidden w-auto">
                          <span className="text-nowrap text-white bg-[#e50914] xl:py-[2px] py-[1px] px-2 text-xs font-semibold text-center shadow-black/80 shadow">
                            Tập mới
                          </span>
                          <span className="text-nowrap text-black bg-white py-[2px] px-2 text-xs font-semibold text-center shadow-black/80 shadow">
                            Xem ngay
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <button
          ref={prevRef}
          style={{ height: swiperHeight + 1 || "100%" }}
          className={`absolute -left-[3.19%] -bottom-[0.5px] z-20 bg-black/50 pl-[2.75px] hover:bg-black/80 text-transparent hover:text-white w-[3%] flex items-center justify-center rounded-e transition-all ease-linear duration-100 cursor-pointer ${
            canSlidePrev ? "visible" : "invisible"
          }`}
          disabled={!canSlidePrev}
        >
          ‹
        </button>
        <button
          ref={nextRef}
          style={{ height: swiperHeight + 1 || "100%" }}
          className={`absolute -right-[3.19%] -bottom-[0.5px] z-20 bg-black/50 pr-[2.75px] hover:bg-black/80 text-transparent hover:text-white w-[3%] flex items-center justify-center rounded-s transition-all ease-linear duration-100 cursor-pointer ${
            canSlideNext ? "visible" : "invisible"
          }`}
          disabled={!canSlideNext}
        >
          ›
        </button>
      </div>
    );
  }
  return (
    <div
      className="my-10 lg:my-14 relative w-[94%] mx-[3%]"
      ref={(node) => {
        containerRef.current = node;
        ref(node);
      }}
    >
      <div className="flex justify-between items-center w-full mb-3">
        <div
          className="group cursor-pointer font-bold flex justify-between items-center lg:inline-block gap-2 w-full lg:w-auto"
          onClick={() =>
            openList({
              params: `${type_slug}?category=${category}&country=${country}&year=${year}`,
              nameList,
            })
          }
        >
          <span className="text-white transition-all ease-in-out duration-500">
            {nameList}
          </span>
          <span className="lg:opacity-0 text-xs group-hover:opacity-100 group-hover:pl-2 transition-all ease-in-out duration-500 text-white/80 group-hover:text-white">
            Xem tất cả{" "}
            <FontAwesomeIcon icon="fa-solid fa-angles-right" size="xs" />
          </span>
        </div>
        <div
          ref={paginationRef}
          className="ml-auto hidden lg:flex justify-center gap-[1px]"
        />
      </div>

      <Swiper
        modules={[Pagination, Navigation]}
        key={`${type_slug}-${category}-${country}-${year}`}
        pagination={{
          el: paginationRef.current,
          clickable: true,
        }}
        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
        spaceBetween={5}
        onResize={(swiper) => {
          setSwiperHeight(swiper.el.clientHeight);
          updateNavState(swiper);
        }}
        onInit={(swiper) => {
          swiper.params.navigation.prevEl = prevRef.current;
          swiper.params.navigation.nextEl = nextRef.current;
          swiper.navigation.init();
          swiper.navigation.update();
          swiper.params.pagination.el = paginationRef.current;
          swiper.pagination.init();
          swiper.pagination.render();
          swiper.pagination.update();
          setLastVisible(swiper.params.slidesPerView - 1);
          setSwiperHeight(swiper.el.clientHeight);
          setCanSlidePrev(!swiper.isBeginning);
          setCanSlideNext(!swiper.isEnd);
        }}
        onSlideChange={(swiper) => {
          const endIndex = swiper.activeIndex + swiper.params.slidesPerView - 1;
          setFirstVisible(swiper.activeIndex);
          setLastVisible(endIndex);
          updateNavState(swiper);

          if (
            hasMore &&
            !isAppending &&
            endIndex >= movies.length - swiper.params.slidesPerView * 1.5
          ) {
            setPage((prev) => prev + 1);
            // fetchMoviesChunk(nextPage).then(() => {
            //   swiper.update();
            //   setTimeout(() => updateNavState(swiper), 50);
            // });
          }
        }}
        onUpdate={(swiper) => updateNavState(swiper)}
        breakpoints={{
          1024: { slidesPerView: 6, slidesPerGroup: 6 },
          800: { slidesPerView: 5, slidesPerGroup: 5 },
          500: { slidesPerView: 4, slidesPerGroup: 4 },
          0: { slidesPerView: 3, slidesPerGroup: 3 },
        }}
        className="w-full"
        ref={swiperRef}
      >
        <>
          {movies.map((item, index) => (
            <SwiperSlide
              key={`${type_slug}-${item._id}-${index}`}
              data-index={index}
              className="!overflow-visible"
            >
              <div
                className="group relative cursor-pointer h-full"
                onMouseEnter={(e) => handleEnter(item, e, index)}
                onMouseLeave={onLeave}
                onClick={() =>
                  openModal(item.slug, item.tmdb?.id, item.tmdb?.type)
                }
              >
                <div className="hidden lg:block relative w-full aspect-video rounded-[3px] overflow-hidden">
                  <div className="object-cover w-full h-full rounded-[3px]">
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
                  className="block lg:hidden relative overflow-hidden rounded-[3px]"
                  onClick={() =>
                    openModal(item.slug, item.tmdb?.id, item.tmdb?.type)
                  }
                >
                  <div className="w-full object-cover aspect-[2/3] rounded-[3px]">
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
                {new Date().getTime() -
                  new Date(item.modified?.time).getTime() <
                  1000 * 60 * 60 * 24 * 3 && (
                  <>
                    {item.episode_current.toLowerCase().includes("hoàn tất") ||
                    item.episode_current.toLowerCase().includes("full") ? (
                      <span className="text-nowrap absolute bottom-0 left-1/2 -translate-x-1/2 text-white w-auto bg-[#e50914] py-[2px] px-2 rounded-t text-xs font-semibold text-center shadow-black/80 shadow">
                        Mới thêm
                      </span>
                    ) : item.episode_current
                        .toLowerCase()
                        .includes("trailer") ? (
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
            </SwiperSlide>
          ))}
          {hasMore &&
            Array.from({ length: 4 }, (_, index) => (
              <SwiperSlide
                key={`${type_slug}-${index}-skeleton`}
                data-index={movies.length + index}
                className="!overflow-visible"
              >
                <div className="bg-neutral-600 animate-pulse w-full aspect-[2/3] lg:aspect-video rounded-lg" />
              </SwiperSlide>
            ))}
        </>
      </Swiper>
      <button
        ref={prevRef}
        style={{ height: swiperHeight + 1 || "100%" }}
        className={`absolute -left-[3.19%] -bottom-[0.5px] z-20 bg-black/50 pl-[2.75px] hover:bg-black/80 text-transparent hover:text-white w-[3%] flex items-center justify-center rounded-e-sm transition-all ease-linear duration-100 cursor-pointer ${
          canSlidePrev ? "visible" : "invisible"
        }`}
        disabled={!canSlidePrev}
      >
        ‹
      </button>
      <button
        ref={nextRef}
        style={{ height: swiperHeight + 1 || "100%" }}
        className={`absolute -right-[3.19%] -bottom-[0.5px] z-20 bg-black/50 pr-[2.75px] hover:bg-black/80 text-transparent hover:text-white w-[3%] flex items-center justify-center rounded-s-sm transition-all ease-linear duration-100 cursor-pointer ${
          canSlideNext ? "visible" : "invisible"
        }`}
        disabled={!canSlideNext}
      >
        ›
      </button>
    </div>
  );
}
