import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import Tooltip from "./Tooltip";

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
      className="w-[94%] xl:w-[70%] 2xl:w-[50%] text-xs lg:text-lg outline-none "
    >
      <div className="flex flex-col items-center p-[3%]">
        <h1 className="font-extrabold text-2xl sm:text-3xl md:text-5xl mb-20 mt-12 text-center">
          {nameList}
        </h1>
        <div className="w-full">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-x-3 gap-y-14 mt-5">
            {movies.map((item) => (
              <div
                className="aspect-video bg-cover rounded-md group cursor-pointer relative"
                onClick={() => openModal(item.slug)}
                key={item._id}
              >
                <div className="text-base group-hover:scale-125 absolute top-0 left-0 w-full h-full group-hover:z-[99999] group-hover:-translate-y-[50%] rounded transition-all ease-in-out duration-300">
                  <img
                    src={import.meta.env.VITE_API_IMAGE + item.poster_url}
                    className="aspect-video object-cover rounded group-hover:rounded-b-none w-full"
                  ></img>
                  <div
                    className="bg-[#141414] text-white p-3 text-xs space-y-2 shadow-black/80 shadow rounded-b invisible group-hover:visible opacity-0 group-hover:opacity-100"
                    onClick={() => openModal(item.slug)}
                  >
                    <h3 className="font-bold">{item.name}</h3>

                    <div className="flex space-x-2 items-center text-white/80">
                      <span className="lowercase">{item.year}</span>
                      <span className="lowercase">{item.time}</span>
                      <span
                        className="px-1 border-[1px] rounded font-bold uppercase"
                        style={{ fontSize: "8px" }}
                      >
                        {item.quality}
                      </span>
                    </div>
                    <div>
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
                    className="aspect-video cursor-pointer relative animate-pulse"
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
