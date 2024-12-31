import React from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Modal from "react-modal";
import { fetchDetailsMovie } from "../App";

const customStyles = {
  content: {
    position: "absolute",
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#141414",
    boxShadow: "2px solid black",
    color: "white",
    padding: 0,
  },
};

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

const MovieList = ({ data }) => {
  const [modalIsOpen, setIsOpen] = React.useState(false);
  var currentModal = [];
  function openModal() {
    setIsOpen(true);
  }
  function closeModal() {
    setIsOpen(false);
  }
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
      <div className="pl-14">
        <h2 className="text-white text-2xl font-bold mb-3">Mới cập nhập</h2>
        <Carousel responsive={responsive}>
          {data.map((item) => (
            <div
              className="aspect-video bg-cover rounded-md mr-2 cursor-pointer"
              style={{
                backgroundImage: `url(https://img.ophim.live/uploads/movies/${item.poster_url})`,
              }}
              onClick={openModal}
            />
          ))}
        </Carousel>
        {/* <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          style={customStyles}
        >
          <div className="flex flex-col">
            <div
              className="aspect-video bg-cover w-[800px] relative"
              style={{
                backgroundImage: `url(https://img.ophim.live/uploads/movies/ngoi-truong-xac-song-poster.jpg)`,
              }}
              onClick={openModal}
            >
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-[#141414] to-transparent z-0" />
              <button className="aspect-square w-7 rounded-full bg-black absolute right-3 top-3">
                <FontAwesomeIcon icon="fa-solid fa-xmark" />
              </button>
              <div className="flex space-x-2 absolute left-6 bottom-6">
                <button className="px-7 py-2 font-semibold text-lg flex items-center space-x-2 text-black bg-white rounded-md">
                  <FontAwesomeIcon icon="fa-solid fa-play" size="xl" />
                  <span>Phát</span>
                </button>
                <button className="aspect-square w-11 rounded-full bg-transparent border-2">
                  <FontAwesomeIcon icon="fa-solid fa-plus" />
                </button>
                <button className="aspect-square w-11 rounded-full bg-transparent border-2">
                  <FontAwesomeIcon icon="fa-regular fa-heart" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-start space-x-2">
              <span className="uppercase px-1 border-[1px]">
                {currentModal.movie.type}
              </span>
              <span className="lowercase">{currentModal.movie.time}</span>
              <span className="px-1 border-[1px] text-xs rounded font-bold">
                {currentModal.movie.quality}
              </span>
            </div>
          </div>
        </Modal> */}
      </div>
    );
  }
};

MovieList.propTypes = {
  data: PropTypes.array,
};

export default MovieList;
