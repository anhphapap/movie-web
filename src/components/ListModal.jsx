import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import Tooltip from "./Tooltip";
import { Link } from "react-router-dom";

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

function ListModal({ isOpen, onClose, openModal, nameList, api }) {
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAPI = async () => {
      if (api && isOpen && page <= totalPage) {
        setLoading(true);
        const currentList = await axios.get(api + "&page=" + page);
        setMovies((prev) => [...prev, ...currentList.data.data.items]);
        if (page == 1)
          setTotalPage(
            Math.ceil(
              currentList.data.data.params.pagination.totalItems /
                currentList.data.data.params.pagination.totalItemsPerPage
            )
          );
        setLoading(false);
      }
    };
    fetchAPI();
  }, [api, nameList, page, isOpen]);

  useEffect(() => {
    setMovies([]);
    setPage(1);
    setTotalPage(1);
  }, [isOpen]);

  if (movies.length === 0) return null;
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStyles}
      ariaHideApp={false}
      className="w-[95%] lg:w-[80%] text-xs lg:text-lg outline-none "
    >
      <div className="flex flex-col items-center p-[3%]">
        <h1 className="font-extrabold text-2xl sm:text-3xl md:text-5xl mb-10 sm:mb-20 mt-8 sm:mt-12 text-center">
          {nameList}
        </h1>
        <div className="w-full">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-3 gap-y-14 mt-5">
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
                  {item.sub_docquyen && (
                    <img
                      loading="lazy"
                      src="https://images.ctfassets.net/y2ske730sjqp/4aEQ1zAUZF5pLSDtfviWjb/ba04f8d5bd01428f6e3803cc6effaf30/Netflix_N.png"
                      className="absolute top-2 left-2 w-3"
                    ></img>
                  )}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-white bg-[#e50914] sm:w-1/2 w-2/3 py-[2px] px-1 rounded-t text-xs font-black text-center shadow-black/80 shadow">
                    {item.episode_current.toLowerCase().includes("hoàn tất")
                      ? "Hoàn tất"
                      : item.episode_current}
                  </span>
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
                      className="aspect-video object-cover rounded group-hover:rounded-b-none w-full text-white text-center"
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
            {loading && (
              <>
                {[...Array(6)].map((_, index) => (
                  <div
                    key={index + 99}
                    className="w-full aspect-[2/3] lg:aspect-video cursor-pointer relative animate-pulse"
                  >
                    <div className="w-full h-full bg-gray-600 rounded-md"></div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
        <div className="relative border-b-[1.6px] border-white/20 w-full my-10">
          {page < totalPage && (
            <button
              onClick={() => setPage(page + 1)}
              className="absolute group bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 aspect-square px-[10px] py-[1px] rounded-full bg-[#141414] border-white/60 border-[1.4px] text-white hover:border-white transition-all ease-linear"
            >
              <FontAwesomeIcon icon="fa-solid fa-chevron-down" size="xs" />
              <Tooltip content={"Xem thêm"} />
            </button>
          )}
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
