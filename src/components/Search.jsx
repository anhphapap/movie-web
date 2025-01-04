import { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";

const NetflixSearch = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const handleSearch = (searchTerm) => {
    if (searchTerm.trim()) {
      navigate(`/search?q=${searchTerm}`);
    }
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
            onChange={(e) => handleSearch(e.target.value)}
          ></input>
        </div>
      )}
    </div>
  );
};

export default NetflixSearch;
