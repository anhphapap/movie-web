import React from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useState, useEffect } from "react";
import { tops } from "../utils/data";

const CustomRightArrow = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="absolute right-0 top-0 h-full w-[5%] bg-black bg-opacity-30 p-3 rounded-s-md hover:bg-opacity-60 z-10 text-transparent hover:text-white transition-all ease-linear duration-100"
    >
      <FontAwesomeIcon icon="fa-solid fa-chevron-right" />
    </button>
  );
};

const CustomLeftArrow = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="absolute left-0 top-0 h-full w-[5%] bg-black bg-opacity-30 p-3 rounded-e-md hover:bg-opacity-60 z-10 text-transparent hover:text-white transition-all ease-linear duration-100"
    >
      <FontAwesomeIcon icon="fa-solid fa-chevron-left" />
    </button>
  );
};

const CustomDot = ({ onClick, active }) => {
  return (
    <button
      onClick={onClick}
      className={`w-[7px] sm:w-[14px] h-[1px] sm:h-[2px] mx-[0.5px] rounded-full transition-all ${
        active ? "bg-white" : "bg-gray-500"
      }`}
    ></button>
  );
};

const responsive = {
  xxl: {
    breakpoint: { max: 3000, min: 1536 },
    items: 5,
    slidesToSlide: 5,
  },
  xl: {
    breakpoint: { max: 1536, min: 1280 },
    items: 4,
    slidesToSlide: 4,
  },
  lg: {
    breakpoint: { max: 1280, min: 768 },
    items: 3,
    slidesToSlide: 3,
  },
  md: {
    breakpoint: { max: 768, min: 0 },
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
        <div className="my-8 relative animate-pulse">
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
      <div className="my-8 relative animate-pulse">
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
        <div className="my-8 relative bg-transparent">
          <h2 className="text-white font-bold mb-3 px-[3%]">{nameList}</h2>
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
            {movies.map((item, index) => (
              <div
                className="flex cursor-pointer group h-[85px] sm:h-[120px] md:h-[150px] lg:h-[200px] mr-2"
                onClick={() => openModal(item.slug)}
                key={item._id}
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: tops[index],
                  }}
                  className="h-full"
                />
                <div className="aspect-[2/3] h-full relative">
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center p-2 text-white">
                    <div className=" font-bold text-center truncate line-clamp-4 text-pretty">
                      {item.name}
                    </div>
                  </div>
                  <img
                    src={`${import.meta.env.VITE_API_IMAGE}${item.thumb_url}`}
                    className="object-cover h-full w-full object-center"
                  ></img>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      );
    }
    return (
      <div className="my-8 relative">
        <div
          className="group cursor-pointer text-white font-bold px-[3%] mb-3 inline-block"
          onClick={() => openList({ type_slug, country, category, nameList })}
        >
          <span className="pr-2 group-hover:opacity-70 transition-all ease-in-out duration-300">
            {nameList}
          </span>
          <span className="opacity-0 text-xs group-hover:opacity-70 transition-all ease-in-out duration-300">
            Xem tất cả{" "}
            <FontAwesomeIcon icon="fa-solid fa-angles-right" size="xs" />
          </span>
        </div>
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
          {movies.map((item, index) => (
            <div
              className="aspect-video bg-cover rounded-md group cursor-pointer mr-[3%] relative"
              style={{
                backgroundImage: `url(${import.meta.env.VITE_API_IMAGE}${
                  item.poster_url
                })`,
              }}
              onClick={() => openModal(item.slug)}
              key={item._id}
            >
              <div className="absolute top-0 left-0 w-full rounded-md h-full bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 text-white">
                <div className=" font-bold text-center truncate line-clamp-2 text-pretty">
                  {item.name}
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
