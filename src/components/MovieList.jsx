import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import { useMovieModal } from "../context/MovieModalContext";
const MovieList = ({
  type_slug = "phim-moi-cap-nhat",
  sort_field = "modified.time",
  country = "",
  category = "",
  year = "",
  search = false,
  keyword = "",
}) => {
  const [movies, setMovies] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [titleHead, setTitleHead] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const { openModal } = useMovieModal();
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
        const movieList = listResponse.data.data.items || [];

        setMovies((prev) => {
          const existingIds = new Set(prev.map((movie) => movie._id));
          const uniqueMovies = movieList.filter(
            (movie) => !existingIds.has(movie._id)
          );
          return [...prev, ...uniqueMovies];
        });

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
    <div className="text-white mt-36 px-[3%]">
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-x-1 gap-y-14 mt-5">
        {movies.map((item) => (
          <div
            className="aspect-video bg-cover rounded-md group cursor-pointer relative"
            onClick={() => openModal(item.slug)}
            key={item._id}
          >
            <div
              className="block lg:hidden relative rounded overflow-hidden"
              onClick={() => openModal(item.slug)}
            >
              <img
                loading="lazy"
                alt={item.name}
                src={import.meta.env.VITE_API_IMAGE + item.thumb_url}
                className="w-full object-cover aspect-[2/3] rounded text-white text-center"
              ></img>
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-white bg-[#e50914] sm:w-1/2 w-2/3 py-[2px] px-1 rounded-t text-xs font-black text-center shadow-black/80 shadow">
                {item.episode_current.toLowerCase().includes("hoàn tất")
                  ? "Hoàn tất"
                  : item.episode_current}
              </span>
              {item.sub_docquyen && (
                <img
                  loading="lazy"
                  src="https://images.ctfassets.net/y2ske730sjqp/4aEQ1zAUZF5pLSDtfviWjb/ba04f8d5bd01428f6e3803cc6effaf30/Netflix_N.png"
                  className="absolute top-2 left-2 w-3"
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
            </div>
            <div className="hidden lg:block text-base group-hover:scale-125 absolute top-0 left-0 w-full h-full z-0 group-hover:z-[9999] group-hover:-translate-y-[50%] rounded transition-all ease-in-out duration-300 group-hover:delay-[400ms]">
              <div className="relative rounded-t overflow-hidden">
                <img
                  loading="lazy"
                  alt={item.name}
                  src={import.meta.env.VITE_API_IMAGE + item.poster_url}
                  className="aspect-video object-cover rounded group-hover:rounded-b-none w-full  transition-all ease-in-out duration-300 text-white text-center"
                />
                {item.sub_docquyen && (
                  <img
                    loading="lazy"
                    src="https://images.ctfassets.net/y2ske730sjqp/4aEQ1zAUZF5pLSDtfviWjb/ba04f8d5bd01428f6e3803cc6effaf30/Netflix_N.png"
                    className="absolute top-2 left-2 w-3"
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
                <div className="bg-gradient-to-t from-[#141414] to-transparent absolute w-full h-[40%] -bottom-[1px] left-0 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all ease-in duration-300 group-hover:delay-[400ms]"></div>
                <div className="flex justify-between absolute bottom-0 left-0 w-full px-3 pb-1 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all ease-in duration-300 group-hover:delay-[400ms]">
                  <Link to={`/watch/${item.slug}/0`}>
                    <button className="text-black bg-white rounded-full h-[30px] aspect-square hover:bg-white/80 transition-all ease-in-out">
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
              <div
                className="bg-[#141414] text-white p-3 text-xs space-y-2 shadow-black/80 shadow rounded-b invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all ease-in-out duration-300 group-hover:delay-[400ms]"
                onClick={() => openModal(item.slug)}
              >
                <h3 className="font-bold">{item.name}</h3>

                <div className="flex space-x-2 items-center text-white/80">
                  <span className="lowercase">{item.year}</span>
                  <span className="hidden lg:block">
                    {item.episode_current.includes("Hoàn tất")
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
                <div className="line-clamp-1">
                  {item.category.map(
                    (cat, index) =>
                      index < 3 &&
                      (index != 0 ? (
                        <span key={item.slug + cat.name}> - {cat.name}</span>
                      ) : (
                        <span key={item.slug + cat.name}>{cat.name}</span>
                      ))
                  )}
                </div>
              </div>
            </div>
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
