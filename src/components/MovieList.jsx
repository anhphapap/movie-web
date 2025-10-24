import React from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMovieModal } from "../context/MovieModalContext";
import LazyImage from "./LazyImage";
import { useHoverPreview } from "../context/HoverPreviewContext";
import { useTop } from "../context/TopContext";
import Top10Badge from "../assets/images/Top10Badge.svg";
import SEO from "./SEO";
const MovieList = ({
  type_slug = "phim-moi-cap-nhat",
  sort_field = "_id",
  country = "",
  category = "",
  year = "",
  search = false,
  keyword = "",
}) => {
  const [movies, setMovies] = useState([]);
  const [seoOnPage, setSeoOnPage] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [titleHead, setTitleHead] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const { openModal } = useMovieModal();
  const { onEnter, onLeave } = useHoverPreview();
  const { topSet } = useTop();
  const fetchMovies = async () => {
    setLoading(true);
    var api = null;

    if (!search) {
      api = `${
        import.meta.env.VITE_API_LIST
      }${type_slug}?sort_field=${sort_field}&category=${category}&country=${country}&year=${year}`;
    } else {
      const encodedQuery = keyword.trim().replace(/ /g, "+");
      api = `${import.meta.env.VITE_API_SEARCH}keyword=${encodedQuery}`;
    }

    try {
      const listResponse = await axios.get(`${api}&page=${page}`);
      const totalPages = Math.ceil(
        listResponse.data.data.params.pagination.totalItems /
          listResponse.data.data.params.pagination.totalItemsPerPage
      );

      if (page > totalPages) {
        setHasMore(false);
      } else {
        setMovies([...movies, ...listResponse.data.data.items]);
        if (!seoOnPage) setSeoOnPage(listResponse.data.data.seoOnPage);

        if (!titleHead) {
          const yearNow = new Date().getFullYear();

          setTitleHead(
            listResponse.data.data.seoOnPage.titleHead
              .replace(/Ophim.Tv/g, "Needflex")
              .replace(/2022/g, yearNow.toString())
          );
        }
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
    }

    setLoading(false);
  };

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

  useEffect(() => {
    const handleResize = () => getColumns();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100
      ) {
        if (hasMore) setPage((prev) => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore]);

  useEffect(() => {
    fetchMovies();
  }, [page]);

  useEffect(() => {
    setMovies([]);
    setPage(1);
    setTitleHead(null);
    setHasMore(true);
    fetchMovies();
  }, [keyword, type_slug, country, category, year, sort_field]);

  if (!movies) return <></>;

  return (
    <div className="text-white mt-[20vh] px-[3%]">
      {seoOnPage && (
        <SEO seoData={seoOnPage} baseUrl={window.location.origin} />
      )}
      {(!loading && movies.length == 0 && (
        <h1>Không tìm thấy bộ phim nào !</h1>
      )) || (
        <h1 className="text-xl md:text-2xl 2xl:text-4xl">
          {(search && (
            <>
              <span className="opacity-50">Kết quả tìm kiếm của: </span>
              <span>{keyword}</span>
            </>
          )) || <span className="opacity-50 ">{titleHead} </span>}
        </h1>
      )}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 sm:gap-x-2 gap-x-1 sm:gap-y-[7vh] gap-y-[5vh] mt-5">
        {movies?.map((item, index) => (
          <div
            className="group relative cursor-pointer h-full"
            key={item._id}
            onMouseEnter={(e) => handleEnter(item, e, index)}
            onMouseLeave={onLeave}
            onClick={() => openModal(item.slug, item.tmdb.id, item.tmdb.type)}
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
              onClick={() => openModal(item.slug, item.tmdb.id, item.tmdb.type)}
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
};

export default MovieList;
