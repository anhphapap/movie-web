import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const MovieList = ({
  openModal,
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
            style={{
              backgroundImage: `url(${import.meta.env.VITE_API_IMAGE}${
                item.poster_url
              })`,
            }}
            onClick={() => openModal(item.slug)}
            key={item._id}
          >
            <div className="absolute top-0 left-0 w-full rounded-md h-full bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 text-white">
              <div className="font-bold text-center truncate line-clamp-2 text-pretty">
                {item.name}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <>
            {[...Array(7)].map((_, index) => (
              <div
                key={index + 198}
                className="aspect-video cursor-pointer relative animate-pulse"
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
