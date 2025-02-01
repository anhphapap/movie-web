import { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate, useLocation } from "react-router-dom";

const NetflixSearch = () => {
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
        navigate(`/search?q=${searchTerm}`);
      }
    }, 300);

    setSearchTimeout(newTimeout);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  };

  const closeSearch = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsSearchOpen(false);
    }
  };

  return (
    <div
      className={`relative flex items-center transition-all duration-300 ease-in-out ${
        isSearchOpen ? "w-64" : "w-10"
      }`}
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
        <div className="absolute left-0 w-64 z-40 border-[1px] border-white px-3 py-1 bg-black flex items-center justify-start space-x-2">
          <FontAwesomeIcon icon="fa-solid fa-magnifying-glass" color="white" />
          <input
            ref={inputRef}
            type="text"
            className="bg-black text-white placeholder:text-gray-400 outline-none"
            placeholder="Tên phim..."
            onChange={handleChange}
          ></input>
        </div>
      )}
    </div>
  );
};

export default NetflixSearch;
