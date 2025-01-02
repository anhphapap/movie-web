import React from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const responsive = {
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 6,
    slidesToSlide: 6,
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 4,
    slidesToSlide: 4,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 2,
    slidesToSlide: 2,
  },
};

const MovieList = ({ data, nameList, openModal, closeModal }) => {
  if (!data[0]?.name) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <FontAwesomeIcon
          icon="fa-solid fa-spinner"
          size="2xl"
          className="animate-spin text-white"
        />
      </div>
    );
  } else {
    return (
      <div className="pl-14 my-8">
        <h2 className="text-white text-2xl font-bold mb-3">{nameList}</h2>
        <Carousel responsive={responsive}>
          {data.map((item) => (
            <div
              key={item.slug}
              className="aspect-video bg-cover rounded-md mr-2 cursor-pointer"
              style={{
                backgroundImage: `url(https://img.ophim.live/uploads/movies/${item.poster_url})`,
              }}
              onClick={() => openModal(item.slug)}
            />
          ))}
        </Carousel>
      </div>
    );
  }
};

MovieList.propTypes = {
  data: PropTypes.array,
};

export default MovieList;
