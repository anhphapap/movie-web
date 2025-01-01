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
    top: "10%",
    left: "50%",
    // right: "auto",
    bottom: "auto",
    // marginRight: "-50%",
    transform: "translate(-50%)",
    backgroundColor: "#141414",
    boxShadow: "2px solid black",
    color: "white",
    padding: 0,
    width: "100%",
    overflow: "visible",
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
  const [modal, setModal] = React.useState({});
  var currentMovie = [];

  function openModal(slug) {
    document.body.classList.add("modal-open");
    setIsOpen(true);
    currentMovie = fetchDetailsMovie(slug);
    currentMovie.then((res) => {
      currentMovie = res;
      setModal(currentMovie);
    });
  }
  function closeModal() {
    document.body.classList.remove("modal-open");
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
              onClick={() => openModal(item.slug)}
            />
          ))}
        </Carousel>
        {modal?.movie && (
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            style={customStyles}
            ariaHideApp={false}
          >
            <div className="flex flex-col w-full rounded-lg">
              <div
                className="aspect-video bg-cover w-full relative rounded-t-lg"
                style={{
                  backgroundImage: `url(${modal.movie.poster_url})`,
                }}
              >
                <div className="absolute top-3 left-0 w-full h-full bg-gradient-to-t from-[#141414] to-transparent z-0" />
                <button
                  className="aspect-square w-7 rounded-full bg-black absolute right-3 top-3 z-10"
                  onClick={closeModal}
                >
                  <FontAwesomeIcon icon="fa-solid fa-xmark" />
                </button>
                <div className="flex space-x-2 absolute left-10 bottom-10">
                  <div className="relative rounded bg-white hover:bg-white/80">
                    <a
                      href={modal.episodes[0].server_data[0].link_embed}
                      className="absolute top-0 left-0 w-full h-full"
                      target="_blank"
                    ></a>
                    <button className="px-7 py-2 font-semibold text-lg text-black flex items-center space-x-2">
                      <FontAwesomeIcon icon="fa-solid fa-play" size="xl" />
                      <span>Phát</span>
                    </button>
                  </div>
                  <button className="aspect-square w-11 rounded-full bg-transparent border-2">
                    <FontAwesomeIcon icon="fa-solid fa-plus" />
                  </button>
                  <button className="aspect-square w-11 rounded-full bg-transparent border-2">
                    <FontAwesomeIcon icon="fa-regular fa-heart" />
                  </button>
                </div>
              </div>
              <div className="flex flex-col p-10 space-y-10">
                <div className="flex items-start space-x-5">
                  <div className="flex flex-col space-y-6 w-3/4">
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-center justify-start space-x-2 opacity-70">
                        <span className="lowercase">{modal.movie.year}</span>
                        <span className="lowercase">{modal.movie.time}</span>
                        <span className="px-1 border-[1px] text-xs rounded font-bold">
                          {modal.movie.quality}
                        </span>
                      </div>
                      <div>
                        <span className="px-2 py-1 border-[1px] rounded-sm">
                          {modal.movie.episode_current}
                        </span>
                      </div>
                    </div>
                    <h1 className="text-4xl font-bold">{modal.movie.name}</h1>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: modal.movie.content,
                      }}
                      className="text-lg text-white text-ellipsis overflow-hidden max-h-28"
                    />
                  </div>
                  <div className="flex flex-col space-y-3 text-base">
                    {modal.movie.director[0] != "" && (
                      <div>
                        <span className="opacity-50">Diễn viên: </span>
                        {modal.movie.director.map((director, index) => (
                          <span>
                            {director}
                            {index !== modal.movie.director.length - 1 && (
                              <span>, </span>
                            )}
                          </span>
                        ))}
                      </div>
                    )}
                    <div>
                      <span className="opacity-50">Quốc gia: </span>
                      {modal.movie.country.map((country, index) => (
                        <span>
                          {country.name}
                          {index !== modal.movie.country.length - 1 && (
                            <span>, </span>
                          )}
                        </span>
                      ))}
                    </div>
                    <div>
                      <span className="opacity-50">Thể loại: </span>
                      {modal.movie.category.map((category, index) => (
                        <span>
                          {category.name}
                          {index !== modal.movie.category.length - 1 && (
                            <span>, </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                {modal.movie.type != "single" && (
                  <div className="flex flex-col space-y-5">
                    <div className="flex justify-between">
                      <span className="text-2xl font-bold">Tập</span>
                      <span className="px-3 py-1 font-semibold uppercase border-[1px] opacity-70 rounded bg-[#242424]">
                        {modal.movie.lang}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-4 lg:grid-cols-6 xl:grid-cols-8">
                      {modal.episodes[0].server_data.map((item) => (
                        <div className="relative rounded bg-[#242424] hover:bg-opacity-70">
                          <a
                            href={item.link_embed}
                            className="absolute top-0 left-0 w-full h-full"
                            target="_blank"
                          ></a>
                          <button className="py-2 font-semibold text-lg text-center w-full">
                            {item.name}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Modal>
        )}
      </div>
    );
  }
};

MovieList.propTypes = {
  data: PropTypes.array,
};

export default MovieList;
