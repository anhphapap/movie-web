import React from "react";
import PropTypes from "prop-types";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const customStyles = {
  content: {
    position: "absolute",
    top: "5%",
    left: "50%",
    bottom: "auto",
    transform: "translate(-50%)",
    backgroundColor: "#141414",
    boxShadow: "2px solid black",
    color: "white",
    padding: 0,
    overflow: "visible",
    border: "none",
  },
};

const MovieModal = ({ isOpen, onClose, modal }) => {
  if (!modal?.movie) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStyles}
      ariaHideApp={false}
      className="w-[80%] xl:w-[70%] 2xl:w-[50%] text-xs lg:text-lg outline-none "
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
            className="aspect-square w-7 rounded-full bg-black absolute right-3 top-3 z-10 flex items-center justify-center"
            onClick={onClose}
          >
            <FontAwesomeIcon icon="fa-solid fa-xmark" />
          </button>
          <div className="flex space-x-2 absolute left-[5%] bottom-[5%]">
            <div className="relative rounded bg-white hover:bg-white/80 flex items-center justify-center">
              {(modal.episodes[0].server_data[0].link_embed != "" && (
                <a
                  href={modal.episodes[0].server_data[0].link_embed}
                  className="absolute top-0 left-0 w-full h-full"
                  target="_blank"
                ></a>
              )) ||
                (modal.movie.trailer_url != "" && (
                  <a
                    href={modal.movie.trailer_url}
                    className="absolute top-0 left-0 w-full h-full"
                    target="_blank"
                  ></a>
                )) || (
                  <a
                    href="#"
                    className="absolute top-0 left-0 w-full h-full"
                  ></a>
                )}
              <button className="px-4 sm:px-7 lg:px-10 font-semibold text-black flex items-center space-x-2">
                <FontAwesomeIcon icon="fa-solid fa-play" />
                <span>Phát</span>
              </button>
            </div>
            <button className="p-2 sm:p-3 lg:p-5 h-full rounded-full bg-transparent border-2 flex items-center justify-center">
              <FontAwesomeIcon icon="fa-solid fa-plus" />
            </button>
            <button className="p-2 sm:p-3 lg:p-5 h-full rounded-full bg-transparent border-2 flex items-center justify-center">
              <FontAwesomeIcon icon="fa-regular fa-heart" />
            </button>
          </div>
        </div>
        <div className="flex flex-col p-[5%] space-y-10">
          <div className="flex items-start space-x-[3%]">
            <div className="flex flex-col space-y-4 w-[70%]">
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
              <h1 className="text-3xl lg:text-4xl font-bold">
                {modal.movie.name}
              </h1>
              <div
                dangerouslySetInnerHTML={{
                  __html: modal.movie.content,
                }}
                className="text-white text-pretty"
              />
            </div>
            <div className="flex flex-col space-y-3 w-[30%]">
              {modal.movie.actor[0] != "" && (
                <div>
                  <span className="opacity-50">Diễn viên: </span>
                  {modal.movie.actor.map((actor, index) => (
                    <span key={index}>
                      {actor}
                      {index !== modal.movie.actor.length - 1 && (
                        <span>, </span>
                      )}
                    </span>
                  ))}
                </div>
              )}
              <div>
                <span className="opacity-50">Quốc gia: </span>
                {modal.movie.country.map((country, index) => (
                  <span key={index}>
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
                  <span key={index}>
                    {category.name}
                    {index !== modal.movie.category.length - 1 && (
                      <span>, </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {modal.movie.type != "single" &&
            modal.episodes[0].server_data[0].link_embed != "" && (
              <div className="flex flex-col space-y-5">
                <div className="flex justify-between">
                  <span className="text-2xl font-bold">Tập</span>
                  <span className="px-3 py-1 font-semibold uppercase border-[1px] opacity-70 rounded bg-[#242424]">
                    {modal.movie.lang}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-4 xl:grid-cols-6 2xl:grid-cols-8">
                  {modal.episodes[0].server_data.map((item, index) => (
                    <div
                      className="relative rounded bg-[#242424] hover:bg-opacity-70"
                      key={index}
                    >
                      <a
                        href={item.link_embed}
                        className="absolute top-0 left-0 w-full h-full"
                        target="_blank"
                      ></a>
                      <button className="py-2 font-semibold text-center w-full">
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
  );
};

MovieModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  modal: PropTypes.object,
};

export default MovieModal;
