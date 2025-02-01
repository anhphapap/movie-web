import React from "react";
import PropTypes from "prop-types";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const customStyles = {
  content: {
    position: "absolute",
    top: "4%",
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

function ListModal({ isOpen, onClose, movies, openModal, nameList }) {
  if (!movies) return null;
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStyles}
      ariaHideApp={false}
      className="w-[94%] xl:w-[70%] 2xl:w-[50%] text-xs lg:text-lg outline-none "
    >
      <div className="flex flex-col items-center p-[3%]">
        <h1 className="font-extrabold text-5xl my-12">{nameList}</h1>
        <div className="w-full">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-x-3 gap-y-14 mt-5">
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
          </div>
        </div>
        <button
          className="aspect-square w-7 rounded-full absolute right-3 top-3 z-10 flex items-center justify-center"
          onClick={onClose}
        >
          <FontAwesomeIcon icon="fa-solid fa-xmark" />
        </button>
      </div>
    </Modal>
  );
}

ListModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  modal: PropTypes.object,
};

export default ListModal;
