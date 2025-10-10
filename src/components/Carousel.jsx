import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { useRef, useState, useEffect } from "react";
import axios from "axios";
import HoverPreview from "./HoverPreview";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useHoverDelay from "../context/DelayContext";
import { tops } from "../utils/data";
import { useInView } from "react-intersection-observer";
import LazyImage from "./LazyImage";
import { getTmdbCached } from "../utils/tmdbCache";

export default function Carousel({
  nameList,
  typeList = "list",
  openModal,
  openList,
  type_slug = "phim-moi-cap-nhat",
  sort_field = "modified.time",
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
  const [currentSlidesPerView, setCurrentSlidesPerView] = useState(
    typeList === "top" ? 5 : 6
  ); // Default values
  const { hovered, onEnter, onLeave } = useHoverDelay();
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0,
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

  useEffect(() => {
    if (!inView) return;
    const fetchMovies = async () => {
      setLoading(true);
      if (typeList === "top") {
        let mounted = true;
        (async () => {
          const data = await getTmdbCached(
            type_slug === "phim-bo" ? "tv" : "movie",
            "week"
          );
          if (mounted) {
            setMovies(data);
            setLoading(false);
          }
        })();
        return () => {
          mounted = false;
        };
      }
      var page = 1;
      var totalPage = 1;
      var movieList = [];

      try {
        while (movieList.length < size && page <= totalPage) {
          var listResponse = await axios.get(
            `${
              import.meta.env.VITE_API_LIST
            }${type_slug}?sort_field=${sort_field}&category=${category}&country=${country}&year=${year}&page=${page}&limit=${size}`
          );
          var currentList = listResponse.data.data.items || [];
          totalPage = parseInt(
            listResponse.data.data.params.pagination.totalItems /
              listResponse.data.data.params.pagination.totalItemsPerPage
          );
          movieList = movieList.concat(currentList);
          page++;
        }
        setMovies(movieList.slice(0, size));
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
      setLoading(false);
    };

    fetchMovies();
  }, [type_slug, inView]);

  const handleEnter = (item, e, index) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const parentRect = containerRef.current.getBoundingClientRect();
    onEnter({
      item,
      rect: {
        top: rect.top - parentRect.top,
        left: rect.left - parentRect.left,
        width: rect.width,
        height: rect.height,
      },
      index,
    });
  };

  if (loading) {
    return (
      <div className="px-[3%] relative animate-pulse my-10">
        <h2 className="text-white/80 font-bold mb-3">{nameList}</h2>
        <div className="h-[150px] bg-neutral-900 animate-pulse rounded-xl" />
      </div>
    );
  }
  if (typeList === "top") {
    return (
      <div
        className="my-10 relative"
        ref={(node) => {
          containerRef.current = node;
          ref(node);
        }}
      >
        <div className="px-[3%] flex justify-between items-center w-full mb-3">
          <h2 className="text-white/80 font-bold">{nameList}</h2>
          <div
            ref={paginationRef}
            className="ml-auto flex justify-center gap-[1px]"
          />
        </div>

        <Swiper
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
          slidesPerView={currentSlidesPerView}
          slidesPerGroup={currentSlidesPerView}
          slidesPerGroupAuto={true}
          onResize={(swiper) => {
            setSwiperHeight(swiper.el.clientHeight);
            setFirstVisible(swiper.activeIndex);
            setLastVisible(
              swiper.activeIndex + swiper.params.slidesPerView - 1
            );
            setCurrentSlidesPerView(swiper.params.slidesPerView);
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
            setCurrentSlidesPerView(swiper.params.slidesPerView);
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
            1024: { slidesPerView: 5 },
            800: { slidesPerView: 4 },
            500: { slidesPerView: 3 },
            0: { slidesPerView: 2 },
          }}
          className="w-[94%] mx-[3%]"
          ref={swiperRef}
        >
          {movies.map((item, index) => (
            <SwiperSlide
              key={item._id}
              data-index={index}
              className="!overflow-visible"
            >
              <div
                className="group relative cursor-pointer h-full flex items-end lg:items-center"
                onMouseEnter={(e) => handleEnter(item, e, index)}
                onMouseLeave={onLeave}
                onClick={() => openModal(item.slug)}
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: tops[index],
                  }}
                  className="w-[30%] lg:w-[50%] aspect-[2/3] flex items-end lg:items-center"
                />
                <div className="relative w-[70%] lg:w-[50%] rounded lg:rounded-sm overflow-hidden">
                  <div className="object-cover w-full aspect-[2/3] object-center rounded lg:rounded-sm">
                    <LazyImage
                      src={`${item.thumb_url}`}
                      alt={item.name}
                      sizes="(max-width: 500px) 31vw, (max-width: 800px) 21vw, (max-width: 1024px) 16vw, 10vw"
                    />
                  </div>
                  {item.sub_docquyen && (
                    <img
                      loading="lazy"
                      src="https://images.ctfassets.net/y2ske730sjqp/4aEQ1zAUZF5pLSDtfviWjb/ba04f8d5bd01428f6e3803cc6effaf30/Netflix_N.png"
                      className="absolute top-[6px] left-[6px] w-3"
                    ></img>
                  )}
                  <span className="block lg:hidden absolute bottom-0 left-1/2 -translate-x-1/2 text-white bg-[#e50914] sm:w-1/2 w-2/3 py-[2px] px-1 rounded-t text-xs font-black text-center shadow-black/80 shadow">
                    {item.episode_current.toLowerCase().includes("hoàn tất")
                      ? "Hoàn tất"
                      : item.episode_current}
                  </span>
                  <div>
                    <div
                      className={`absolute ${
                        item.quality.length > 2
                          ? "-top-[10px] -right-[3px] w-8"
                          : "-top-[6px] -right-[6px] w-7"
                      } aspect-square bg-[#e50914] rotate-6 shadow-black/80 shadow`}
                    ></div>
                    <span className="absolute -top-0 -right-0 bg-[#e50914] rounded-se text-xs font-black text-white pt-[3px] pb-[1px] px-1 uppercase ">
                      {item.quality}
                    </span>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <button
          ref={prevRef}
          style={{ height: swiperHeight + 1 || "100%" }}
          className={`absolute -left-[5.5px] -bottom-[0.5px] z-20 bg-black/50 pl-[2.75px] hover:bg-black/80 text-transparent hover:text-white w-[3%] flex items-center justify-center rounded-e transition-all ease-linear duration-100 cursor-pointer ${
            canSlidePrev ? "visible" : "invisible"
          }`}
          disabled={!canSlidePrev}
        >
          ‹
        </button>
        <button
          ref={nextRef}
          style={{ height: swiperHeight + 1 || "100%" }}
          className={`absolute -right-[5.5px] -bottom-[0.5px] z-20 bg-black/50 pr-[2.75px] hover:bg-black/80 text-transparent hover:text-white w-[3%] flex items-center justify-center rounded-s transition-all ease-linear duration-100 cursor-pointer ${
            canSlideNext ? "visible" : "invisible"
          }`}
          disabled={!canSlideNext}
        >
          ›
        </button>
        <HoverPreview
          hovered={hovered}
          firstVisible={firstVisible}
          lastVisible={lastVisible}
          onLeave={onLeave}
          onEnter={onEnter}
          openModal={openModal}
          typeList="top"
        />
      </div>
    );
  }
  return (
    <div
      className="my-10 relative"
      ref={(node) => {
        containerRef.current = node;
        ref(node);
      }}
    >
      <div className="px-[3%] flex justify-between items-center w-full mb-3">
        <div
          className="group cursor-pointer text-white/80 font-bold flex justify-between items-center lg:inline-block gap-2"
          onClick={() =>
            openList({
              type_slug,
              country,
              category,
              year,
              sort_field,
              nameList,
            })
          }
        >
          <span className="group-hover:text-white transition-all ease-in-out duration-500">
            {nameList}
          </span>
          <span className="lg:opacity-0 text-xs group-hover:opacity-70 group-hover:pl-2 transition-all ease-in-out duration-500">
            Xem tất cả{" "}
            <FontAwesomeIcon icon="fa-solid fa-angles-right" size="xs" />
          </span>
        </div>
        <div
          ref={paginationRef}
          className="ml-auto flex justify-center gap-[1px]"
        />
      </div>

      <Swiper
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
        slidesPerView={currentSlidesPerView}
        slidesPerGroup={currentSlidesPerView}
        slidesPerGroupAuto={true}
        onResize={(swiper) => {
          setSwiperHeight(swiper.el.clientHeight);
          setFirstVisible(swiper.activeIndex);
          setLastVisible(swiper.activeIndex + swiper.params.slidesPerView - 1);
          setCurrentSlidesPerView(swiper.params.slidesPerView);
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
          setCurrentSlidesPerView(swiper.params.slidesPerView);
        }}
        onSlideChange={(swiper) => {
          setFirstVisible(swiper.activeIndex);
          setLastVisible(swiper.activeIndex + swiper.params.slidesPerView - 1);
          setCanSlidePrev(!swiper.isBeginning);
          setCanSlideNext(!swiper.isEnd);
        }}
        breakpoints={{
          // 1400: { slidesPerView: 6 },
          1024: { slidesPerView: 6 },
          800: { slidesPerView: 5 },
          500: { slidesPerView: 4 },
          0: { slidesPerView: 3 },
        }}
        className="w-[94%] mx-[3%]"
        ref={swiperRef}
      >
        {movies.map((item, index) => (
          <SwiperSlide
            key={item._id}
            data-index={index}
            className="!overflow-visible"
          >
            <div
              className="group relative cursor-pointer h-full"
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
                  />
                </div>
                <div>
                  <div
                    className={`absolute ${
                      item.quality.length > 2
                        ? "-top-[10px] -right-[3px] w-8"
                        : "-top-[6px] -right-[6px] w-7"
                    } aspect-square bg-[#e50914] rotate-6 shadow-black/80 shadow`}
                  ></div>
                  <span className="absolute -top-0 -right-0 bg-[#e50914] rounded-se text-xs font-black text-white pt-[3px] pb-[1px] px-1 uppercase">
                    {item.quality}
                  </span>
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
                    sizes="(max-width: 500px) 32vw, (max-width: 800px) 23vw, (max-width: 1024px) 18vw"
                  />
                </div>
                {item.sub_docquyen && (
                  <img
                    loading="lazy"
                    src="https://images.ctfassets.net/y2ske730sjqp/4aEQ1zAUZF5pLSDtfviWjb/ba04f8d5bd01428f6e3803cc6effaf30/Netflix_N.png"
                    className="absolute top-2 left-2 w-3"
                  />
                )}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-white bg-[#e50914] sm:w-1/2 w-2/3 py-[2px] px-1 rounded-t text-xs font-black text-center shadow-black/80 shadow">
                  {item.episode_current.toLowerCase().includes("hoàn tất")
                    ? "Hoàn tất"
                    : item.episode_current}
                </span>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <button
        ref={prevRef}
        style={{ height: swiperHeight + 1 || "100%" }}
        className={`absolute -left-[5.5px] -bottom-[0.5px] z-20 bg-black/50 pl-[2.75px] hover:bg-black/80 text-transparent hover:text-white w-[3%] flex items-center justify-center rounded-e transition-all ease-linear duration-100 cursor-pointer ${
          canSlidePrev ? "visible" : "invisible"
        }`}
        disabled={!canSlidePrev}
      >
        ‹
      </button>
      <button
        ref={nextRef}
        style={{ height: swiperHeight + 1 || "100%" }}
        className={`absolute -right-[5.5px] -bottom-[0.5px] z-20 bg-black/50 pr-[2.75px] hover:bg-black/80 text-transparent hover:text-white w-[3%] flex items-center justify-center rounded-s transition-all ease-linear duration-100 cursor-pointer ${
          canSlideNext ? "visible" : "invisible"
        }`}
        disabled={!canSlideNext}
      >
        ›
      </button>
      <HoverPreview
        hovered={hovered}
        firstVisible={firstVisible}
        lastVisible={lastVisible}
        onLeave={onLeave}
        onEnter={onEnter}
        openModal={openModal}
      />
    </div>
  );
}
