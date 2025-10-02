import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import useHoverDelay from "../context/DelayContext";
import { motion, AnimatePresence } from "framer-motion";
import { tops } from "../utils/data";
export default function Carousel({
  nameList,
  typeList = "list",
  openModal,
  openList,
  type_slug = "phim-moi-cap-nhat",
  sort_field = "modified.time",
  country = "",
  category = "",
  year = "",
  size = 12,
}) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const { hovered, onEnter, onLeave } = useHoverDelay();
  const [firstVisible, setFirstVisible] = useState(0);
  const [lastVisible, setLastVisible] = useState();
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const swiperRef = useRef(null);
  const paginationRef = useRef(null);
  const [swiperHeight, setSwiperHeight] = useState(0);
  const [canSlidePrev, setCanSlidePrev] = useState(false);
  const [canSlideNext, setCanSlideNext] = useState(false);

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

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
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
  }, [type_slug]);

  if (movies.length < 10) return null;

  if (typeList === "top") {
    return (
      <div className="my-10 relative" ref={containerRef}>
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
          slidesPerView={5}
          slidesPerGroup={5}
          slidesPerGroupAuto={true}
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
                  <img
                    loading="lazy"
                    alt={item.name}
                    src={`${import.meta.env.VITE_API_IMAGE}${item.thumb_url}`}
                    className="object-cover w-full aspect-[2/3] object-center rounded lg:rounded-sm"
                  ></img>
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
              <div className="z-10 hidden lg:block invisible group-hover:visible opacity-0 group-hover:opacity-100 text-base group-hover:scale-125 absolute top-0 left-0 w-full h-full group-hover:-translate-y-[15%] rounded transition-all ease-in-out duration-300 group-hover:delay-[400ms]">
                <div className="relative rounded-t overflow-hidden">
                  <img
                    loading="lazy"
                    alt={item.name}
                    onClick={() => openModal(item.slug)}
                    src={import.meta.env.VITE_API_IMAGE + item.poster_url}
                    className="aspect-video object-cover rounded group-hover:rounded-none w-full text-white text-center"
                  />
                  {item.sub_docquyen && (
                    <img
                      loading="lazy"
                      src="https://images.ctfassets.net/y2ske730sjqp/4aEQ1zAUZF5pLSDtfviWjb/ba04f8d5bd01428f6e3803cc6effaf30/Netflix_N.png"
                      className="absolute top-[6px] left-[6px] w-3"
                    ></img>
                  )}
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

                  <div className="bg-gradient-to-t from-[#141414] to-transparent absolute w-full h-[40%] -bottom-[1px] left-0"></div>
                  <div className="flex justify-between absolute bottom-0 left-0 w-full px-3 pb-1">
                    <Link to={`/watch/${item.slug}/0`}>
                      <button className=" bg-white rounded-full h-[30px] aspect-square hover:bg-white/80 transition-all ease-in-out">
                        <FontAwesomeIcon icon="fa-solid fa-play" size="sm" />
                      </button>
                    </Link>
                    <button
                      className="text-white border-2 border-white/40 hover:border-white bg-black/10 hover:bg-white/10 rounded-full h-[30px] aspect-square transition-all ease-in-out"
                      onClick={() => openModal(item.slug)}
                    >
                      <FontAwesomeIcon icon="fa-solid fa-chevron-down" />
                    </button>
                  </div>
                </div>
                <div className="bg-[#141414] text-white p-3 text-xs space-y-2 shadow-black/80 shadow rounded-b">
                  <div className="space-y-1">
                    <h3 className="font-bold truncate">{item.name}</h3>
                    <div className="flex space-x-2 items-center text-white/80">
                      <span className="lowercase">{item.year}</span>
                      <span className="hidden lg:block">
                        {item.episode_current.toLowerCase().includes("hoàn tất")
                          ? "Hoàn tất"
                          : item.episode_current}
                      </span>
                      <span
                        className="px-1 border-[1px] rounded font-bold uppercase"
                        style={{ fontSize: "8px" }}
                      >
                        {item.quality}
                      </span>
                    </div>
                  </div>
                  <div className="line-clamp-1">
                    {item.category.map(
                      (cat, index) =>
                        index < 3 &&
                        (index != 0 ? (
                          <span key={item.slug + cat.name}>
                            {" "}
                            <FontAwesomeIcon
                              icon="fa-solid fa-circle"
                              size="2xs"
                              className="opacity-50 scale-50"
                            />{" "}
                            {cat.name}
                          </span>
                        ) : (
                          <span key={item.slug + cat.name}>{cat.name}</span>
                        ))
                    )}
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

        {hovered && hovered.rect && (
          <AnimatePresence mode="wait">
            <motion.div
              key={hovered.item._id}
              className="absolute z-50 shadow-xl shadow-black/80 rounded-md hidden lg:block"
              style={{
                top: hovered.rect.top - hovered.rect.height / 2.75,
                left:
                  hovered.index === firstVisible
                    ? hovered.rect.left
                    : hovered.index === lastVisible
                    ? hovered.rect.left - hovered.rect.width / 2
                    : hovered.rect.left - hovered.rect.width / 4,
                width: hovered.rect.width,
              }}
              onMouseEnter={() => onEnter(hovered)}
              onMouseLeave={onLeave}
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{
                opacity: 0,
                scale: 0.8,
                y: 20,
                transition: { duration: 0.01, ease: "easeIn" },
              }}
              transition={{
                opacity: { duration: 0.3, ease: "easeOut" },
                scale: { duration: 0.3, ease: "easeOut" },
                y: { duration: 0.3, ease: "easeOut" },
              }}
            >
              <div className="bg-[#141414] rounded-md origin-top transition duration-300 w-[150%] ">
                <div className="relative w-full aspect-video rounded-t-md overflow-hidden">
                  <img
                    src={
                      import.meta.env.VITE_API_IMAGE + hovered.item.poster_url
                    }
                    className="object-cover w-full h-full"
                    alt={hovered.item.name}
                  />
                  <div className="bg-gradient-to-t from-[#141414] to-transparent absolute w-full h-[40%] -bottom-[2px] left-0"></div>
                </div>

                <div
                  className="px-4 pb-4 pt-1 cursor-pointer flex flex-col gap-2"
                  onClick={() => openModal(hovered.item.slug)}
                >
                  <div className="flex justify-between px-1">
                    <Link to={`/watch/${hovered.item.slug}/0`}>
                      <div className="bg-white rounded-full pl-[2px] h-[40px] w-[40px] flex items-center justify-center hover:bg-white/80">
                        <FontAwesomeIcon icon="fa-solid fa-play" size="sm" />
                      </div>
                    </Link>
                    <div
                      className="text-white border-2 cursor-pointer border-white/40 bg-black/10 rounded-full h-[40px] w-[40px] flex items-center justify-center hover:border-white"
                      onClick={() => openModal(hovered.item.slug)}
                    >
                      <FontAwesomeIcon
                        icon="fa-solid fa-chevron-down"
                        size="sm"
                      />
                    </div>
                  </div>
                  <h3 className="font-bold truncate text-base text-white">
                    {hovered.item.name}
                  </h3>
                  <div className="flex space-x-2 items-center text-white/80 text-sm">
                    <span className="lowercase">{hovered.item.year}</span>
                    <span className="hidden lg:block">
                      {hovered.item.episode_current
                        .toLowerCase()
                        .includes("hoàn tất")
                        ? "Hoàn tất"
                        : hovered.item.episode_current}
                    </span>
                    <span className="px-1 border rounded font-bold uppercase h-[20px] flex items-center justify-center">
                      {hovered.item.quality}
                    </span>
                  </div>
                  <div className="text-white/80 text-sm">
                    {hovered.item.category.slice(0, 3).map((cat, idx) => (
                      <span key={cat.name}>
                        {idx !== 0 && " - "}
                        {cat.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    );
  }

  return (
    <div className="my-10 relative" ref={containerRef}>
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
        slidesPerView={6}
        slidesPerGroup={6}
        slidesPerGroupAuto={true}
        onResize={(swiper) => {
          setSwiperHeight(swiper.el.clientHeight);
          setFirstVisible(swiper.activeIndex);
          setLastVisible(swiper.activeIndex + swiper.params.slidesPerView - 1);
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
          setLastVisible(swiper.activeIndex + swiper.params.slidesPerView - 1);
          setCanSlidePrev(!swiper.isBeginning);
          setCanSlideNext(!swiper.isEnd);
        }}
        breakpoints={{
          1400: { slidesPerView: 6 },
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
              className="group relative cursor-pointer h-full"
              onMouseEnter={(e) => handleEnter(item, e, index)}
              onMouseLeave={onLeave}
              onClick={() => openModal(item.slug)}
            >
              <div className="hidden lg:block relative w-full aspect-video rounded overflow-hidden">
                <img
                  src={import.meta.env.VITE_API_IMAGE + item.poster_url}
                  className="swiper-lazy object-cover w-full h-full rounded"
                  alt={item.name}
                />
                <div className="swiper-lazy-preloader"></div>
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
                <img
                  loading="lazy"
                  alt={item.name}
                  src={import.meta.env.VITE_API_IMAGE + item.thumb_url}
                  className="swiper-lazy w-full object-cover aspect-[2/3] rounded"
                />
                <div className="swiper-lazy-preloader"></div>
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

      {hovered && hovered.rect && (
        <AnimatePresence mode="wait">
          <motion.div
            key={hovered.item._id}
            className="absolute z-50 shadow-xl shadow-black/80 rounded-md hidden lg:block"
            style={{
              top: hovered.rect.top - hovered.rect.height / 1.5,
              left:
                hovered.index === firstVisible
                  ? hovered.rect.left
                  : hovered.index === lastVisible
                  ? hovered.rect.left - hovered.rect.width / 2
                  : hovered.rect.left - hovered.rect.width / 4,
              width: hovered.rect.width,
            }}
            onMouseEnter={() => onEnter(hovered)}
            onMouseLeave={onLeave}
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{
              opacity: 0,
              scale: 0.8,
              y: 20,
              transition: { duration: 0.01, ease: "easeIn" },
            }}
            transition={{
              opacity: { duration: 0.3, ease: "easeOut" },
              scale: { duration: 0.3, ease: "easeOut" },
              y: { duration: 0.3, ease: "easeOut" },
            }}
          >
            <div className="bg-[#141414] rounded-md origin-top transition duration-300 w-[150%] ">
              <div className="relative w-full aspect-video rounded-t-md overflow-hidden">
                <img
                  src={import.meta.env.VITE_API_IMAGE + hovered.item.poster_url}
                  className="object-cover w-full h-full"
                  alt={hovered.item.name}
                />
                <div className="bg-gradient-to-t from-[#141414] to-transparent absolute w-full h-[40%] -bottom-[2px] left-0"></div>
              </div>

              <div
                className="px-4 pb-4 pt-1 cursor-pointer flex flex-col gap-2"
                onClick={() => openModal(hovered.item.slug)}
              >
                <div className="flex justify-between px-1">
                  <Link to={`/watch/${hovered.item.slug}/0`}>
                    <div className="bg-white rounded-full pl-[2px] h-[40px] w-[40px] flex items-center justify-center hover:bg-white/80">
                      <FontAwesomeIcon icon="fa-solid fa-play" size="sm" />
                    </div>
                  </Link>
                  <div
                    className="text-white border-2 cursor-pointer border-white/40 bg-black/10 rounded-full h-[40px] w-[40px] flex items-center justify-center hover:border-white"
                    onClick={() => openModal(hovered.item.slug)}
                  >
                    <FontAwesomeIcon
                      icon="fa-solid fa-chevron-down"
                      size="sm"
                    />
                  </div>
                </div>
                <h3 className="font-bold truncate text-base text-white">
                  {hovered.item.name}
                </h3>
                <div className="flex space-x-2 items-center text-white/80 text-sm">
                  <span className="lowercase">{hovered.item.year}</span>
                  <span className="hidden lg:block">
                    {hovered.item.episode_current
                      .toLowerCase()
                      .includes("hoàn tất")
                      ? "Hoàn tất"
                      : hovered.item.episode_current}
                  </span>
                  <span className="px-1 border rounded font-bold uppercase h-[20px] flex items-center justify-center">
                    {hovered.item.quality}
                  </span>
                </div>
                <div className="text-white/80 text-sm">
                  {hovered.item.category.slice(0, 3).map((cat, idx) => (
                    <span key={cat.name}>
                      {idx !== 0 && " - "}
                      {cat.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
