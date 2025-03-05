import React from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { tops } from "../utils/data";

const CustomRightArrow = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      id="btn-carousel"
      className="absolute -right-[3.5%] top-0 h-[100.1%] w-[3.6%] bg-black bg-opacity-0 p-3 rounded-s hover:bg-opacity-60  text-transparent hover:text-white transition-all ease-linear duration-100"
    >
      <FontAwesomeIcon icon="fa-solid fa-chevron-right" />
    </button>
  );
};

const CustomLeftArrow = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="absolute -left-[3.5%] top-0 h-[100.1%] w-[3.1%] bg-black bg-opacity-0 p-3 rounded-e hover:bg-opacity-60  text-transparent hover:text-white transition-all ease-linear duration-100"
    >
      <FontAwesomeIcon icon="fa-solid fa-chevron-left" />
    </button>
  );
};

const CustomDot = ({ onClick, active }) => {
  return (
    <button
      onClick={onClick}
      className={`w-[7px] sm:w-[14px] h-[0.8px] sm:h-[2px] mx-[0.8px] transition-all ${
        active ? "bg-white/90" : "bg-white/40"
      }`}
    ></button>
  );
};

const responsive = {
  xxxl: {
    breakpoint: { max: 3000, min: 1400 },
    items: 6,
    slidesToSlide: 6,
  },
  xxl: {
    breakpoint: { max: 1400, min: 1100 },
    items: 5,
    slidesToSlide: 5,
  },
  xl: {
    breakpoint: { max: 1100, min: 800 },
    items: 4,
    slidesToSlide: 4,
  },
  lg: {
    breakpoint: { max: 800, min: 500 },
    items: 3,
    slidesToSlide: 3,
  },
  md: {
    breakpoint: { max: 500, min: 0 },
    items: 2,
    slidesToSlide: 2,
  },
};

const MovieCarousel = ({
  nameList,
  typeList = "list",
  openModal,
  openList,
  type_slug = "phim-moi-cap-nhat",
  sort_field = "modified.time",
  country = "",
  category = "",
  year = "",
  size = 24,
}) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

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
            }${type_slug}?sort_field=${sort_field}&category=${category}&country=${country}&year=${year}&page=${page}`
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

  if (loading) {
    const range = Array.from({ length: 10 }, (_, index) => index);
    if (typeList === "top") {
      return (
        <div className="my-10 relative animate-pulse">
          <h2 className="text-white font-bold mb-3 mx-[3%] rounded">
            {nameList}
          </h2>
          <Carousel
            responsive={responsive}
            centerMode={true}
            customRightArrow={<CustomRightArrow />}
            customLeftArrow={<CustomLeftArrow />}
            customDot={<CustomDot />}
            showDots={true}
            renderDotsOutside={true}
            dotListClass="absolute top-5 !right-[4%] !left-auto"
            className="px-[3%]"
          >
            {range.map((index) => (
              <div
                className="flex cursor-pointer group h-[150px] lg:h-[200px]"
                key={index}
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: tops[index],
                  }}
                  className="flex-grow"
                />
                <div className="aspect-[2/3] h-full relative outline-none border-none">
                  <div className="object-cover h-full w-full object-center bg-[#595959]"></div>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      );
    }
    return (
      <div className="my-10 relative animate-pulse">
        <h2 className="font-bold mb-3 mx-[3%] rounded text-white">
          {nameList}
        </h2>
        <Carousel
          responsive={responsive}
          centerMode={true}
          customRightArrow={<CustomRightArrow />}
          customLeftArrow={<CustomLeftArrow />}
          customDot={<CustomDot />}
          showDots={true}
          renderDotsOutside={true}
          dotListClass="absolute top-5 !right-[4%] !left-auto "
          className="px-[3%]"
        >
          {range.map((index) => (
            <div
              className="aspect-video bg-cover rounded-md group cursor-pointer mr-[3%] bg-[#595959]"
              key={index}
            ></div>
          ))}
        </Carousel>
      </div>
    );
  } else {
    if (typeList === "top") {
      return (
        <div className="my-10 relative bg-transparent">
          <h2 className="text-white/80 font-bold mb-3 px-[3%]">{nameList}</h2>
          <Carousel
            responsive={responsive}
            customRightArrow={<CustomRightArrow />}
            customLeftArrow={<CustomLeftArrow />}
            customDot={<CustomDot />}
            showDots={true}
            renderDotsOutside={true}
            dotListClass="absolute top-0 !right-[4%] !left-auto overflow-visible z-0 h-1"
            className="absolute w-[94%] h-full z-10 mx-[3%] pr-1"
            itemClass="group hover:z-[9999] z-0 pr-2"
          >
            {movies.map((item, index) => (
              <div
                className="flex cursor-pointer group h-full"
                onClick={() => openModal(item.slug)}
                key={item._id}
              >
                <div className="flex items-center w-full">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: tops[index],
                    }}
                    className="w-[50%] h-auto"
                  />
                  <div className="relative w-[50%]">
                    <img
                      src={`${import.meta.env.VITE_API_IMAGE}${item.thumb_url}`}
                      className="object-cover h-full w-full object-center rounded-sm"
                    ></img>
                  </div>
                </div>
                <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 text-base group-hover:scale-125 absolute top-0 left-0 w-full h-full group-hover:-translate-y-[20%] rounded transition-all ease-in-out duration-300 group-hover:delay-[400ms]">
                  <img
                    src={import.meta.env.VITE_API_IMAGE + item.poster_url}
                    className="aspect-video object-cover rounded group-hover:rounded-b-none w-full"
                  />
                  <div
                    className="bg-[#141414] text-white p-3 text-xs space-y-2 shadow-black/80 shadow rounded-b"
                    onClick={() => openModal(item.slug)}
                  >
                    <h3 className="font-bold truncate">{item.name}</h3>

                    <div className="flex space-x-2 items-center text-white/80">
                      <span className="lowercase">{item.year}</span>
                      <span className="lowercase hidden lg:block">
                        {item.time}
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
                            <span key={item.slug + cat.name}>
                              {" "}
                              - {cat.name}
                            </span>
                          ) : (
                            <span key={item.slug + cat.name}>{cat.name}</span>
                          ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      );
    }
    return (
      <div className="my-10 relative">
        <div
          className="group cursor-pointer text-white/80 font-bold px-[3%] mb-3 inline-block"
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
          <span className="opacity-0 text-xs group-hover:opacity-70 group-hover:pl-2 transition-all ease-in-out duration-500">
            Xem tất cả{" "}
            <FontAwesomeIcon icon="fa-solid fa-angles-right" size="xs" />
          </span>
        </div>
        <Carousel
          responsive={responsive}
          customRightArrow={<CustomRightArrow />}
          customLeftArrow={<CustomLeftArrow />}
          customDot={<CustomDot />}
          showDots={true}
          renderDotsOutside={true}
          dotListClass="absolute top-0 !right-[4%] !left-auto overflow-visible z-0 h-1"
          className="absolute w-[94%] h-full z-10 mx-[3%] pr-1"
          itemClass="group hover:z-[9999] z-0 pl-2"
        >
          {movies.map((item, index) => (
            <div
              className="aspect-video bg-cover bg-center rounded cursor-pointer h-full"
              onClick={() => openModal(item.slug)}
              key={item._id}
            >
              <div className="text-base group-hover:scale-110 sm:group-hover:scale-125 absolute top-0 left-0 w-full h-full group-hover:-translate-y-[60%] lg:group-hover:-translate-y-[50%] rounded transition-all ease-in-out duration-300 group-hover:delay-[400ms]">
                <img
                  src={import.meta.env.VITE_API_IMAGE + item.poster_url}
                  className="aspect-video object-cover rounded group-hover:rounded-b-none h-full"
                />
                <div
                  className="bg-[#141414] text-white p-3 text-xs space-y-2 shadow-black/80 -z-10 shadow rounded-b invisible group-hover:visible opacity-0 group-hover:opacity-100 mr-2 transition-all ease-in-out duration-300 group-hover:delay-[400ms]"
                  onClick={() => openModal(item.slug)}
                >
                  <h3 className="font-bold truncate">{item.name}</h3>

                  <div className="flex space-x-2 items-center text-white/80">
                    <span className="lowercase">{item.year}</span>
                    <span className="lowercase hidden lg:block">
                      {item.time}
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
        </Carousel>
      </div>
    );
  }
};

MovieCarousel.propTypes = {
  data: PropTypes.array,
};

export default MovieCarousel;
