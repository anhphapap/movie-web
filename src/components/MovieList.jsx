import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const MovieList = ({
  openModal,
  type_slug = "danh-sach/phim-moi-cap-nhat",
  sort_field = "modified.time",
  country = "",
  category = "",
  year = "",
  size = 24,
  type = "",
  search = false,
  keyword = "",
}) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      var page = 1;
      var movieList = [];
      var api = null;
      if (!search)
        api = `${
          import.meta.env.VITE_API_LIST
        }${type_slug}?sort_field=${sort_field}&category=${category}&country=${country}&year=${year}&type=${type}`;
      else {
        const encodedQuery = keyword.trim().replace(/ /g, "+");
        api = `${
          import.meta.env.VITE_API_SEARCH
        }keyword=${encodedQuery}&sort_field=view`;
      }
      try {
        while (movieList.length < size) {
          var listResponse = await axios.get(`${api}&page=${page}`);
          var currentList = listResponse.data.data.items || [];
          movieList = movieList.concat(currentList);
          if (
            page >=
            listResponse.data.data.params.pagination.totalItems /
              listResponse.data.data.params.pagination.totalItemsPerPage
          )
            break;
          page++;
        }
        setMovies(movieList.slice(0, size));
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
      setLoading(false);
    };
    fetchMovies();
  }, [keyword, type_slug]);
  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <FontAwesomeIcon
          icon="fa-solid fa-spinner"
          size="2xl"
          className="animate-spin text-white"
        />
      </div>
    );
  }
  return (
    <div className="text-white text-3xl mt-[8%] px-[3%]">
      {(search && movies.length == 0 && (
        <h1>Không tìm thấy bộ phim nào !</h1>
      )) || (
        <h1>
          <span className="opacity-50">Kết quả tìm kiếm: </span>
          {keyword}
        </h1>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 mt-5">
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
              <div className=" font-bold text-center">{item.name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MovieList;
