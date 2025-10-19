import { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate, useLocation } from "react-router-dom";

const Search = ({ open = false, full = false }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const previousPath = useRef(null);
  const [searchTimeout, setSearchTimeout] = useState(null);

  const handleChange = (event) => {
    const searchTerm = event.target.value;

    if (searchTimeout) clearTimeout(searchTimeout);

    const newTimeout = setTimeout(() => {
      if (searchTerm.trim() === "") {
        if (previousPath.current) {
          navigate(previousPath.current);
          previousPath.current = null;
        }
      } else {
        if (!previousPath.current) {
          previousPath.current = location.pathname + location.search;
        }
        navigate(`/tim-kiem?q=${searchTerm}`);
      }
    }, 600);

    setSearchTimeout(newTimeout);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  };

  const closeSearch = (e) => {
    if (!e?.currentTarget?.contains(e?.relatedTarget)) {
      setIsSearchOpen(false);
    }
  };

  if (open)
    return (
      <div className="group border-y-[0.1px] border-white/60 py-2 px-[3%] bg-[#141414] flex items-center justify-between space-x-2 mb-2">
        <input
          ref={inputRef}
          type="text"
          className="bg-[#141414] text-white placeholder:text-white/70 outline-none w-full"
          placeholder="Tên phim..."
          onChange={handleChange}
        ></input>
        <button
          className="flex items-center justify-center focus:outline-none py-1 px-3"
          onClick={toggleSearch}
        >
          <FontAwesomeIcon icon="fa-solid fa-magnifying-glass" color="white" />
        </button>
      </div>
    );

  return (
    <div
      className={`relative flex items-center transition-all duration-300 ease-in-out `}
      onBlur={closeSearch}
    >
      {!isSearchOpen && (
        <button
          className="flex items-center justify-center focus:outline-none py-1 px-3"
          onClick={toggleSearch}
        >
          <FontAwesomeIcon icon="fa-solid fa-magnifying-glass" color="white" />
        </button>
      )}

      {isSearchOpen && (
        <div
          className={`border-[1px] border-white px-3 bg-black flex items-center justify-start space-x-2 ${
            full
              ? "fixed top-[10px] left-1 right-1 z-40 py-[6px]"
              : "flex-grow absolute z-40 w-64 right-3 py-1"
          }`}
        >
          <FontAwesomeIcon icon="fa-solid fa-magnifying-glass" color="white" />
          <input
            ref={inputRef}
            type="text"
            className="bg-black text-white placeholder:text-gray-400 outline-none flex-grow"
            placeholder="Tên phim..."
            onChange={handleChange}
          ></input>
          <button
            className="flex md:hidden items-center justify-end focus:outline-none"
            onClick={closeSearch}
          >
            <FontAwesomeIcon icon="fa-solid fa-xmark" color="white" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Search;
