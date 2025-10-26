import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate, useLocation } from "react-router-dom";

const Search = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const previousPath = useRef(null);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleChange = (event) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);

    if (searchTimeout) clearTimeout(searchTimeout);

    const newTimeout = setTimeout(() => {
      if (newSearchTerm.trim() === "") {
        if (previousPath.current) {
          navigate(previousPath.current);
          previousPath.current = null;
        }
      } else {
        if (!previousPath.current) {
          previousPath.current = location.pathname + location.search;
        }
        navigate(`/tim-kiem?q=${newSearchTerm}`);
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
      setSearchTerm("");
      navigate(previousPath.current);
    }
  };

  // if (open)
  //   return (
  //     <div className="group border-y-[0.1px] border-white/60 py-2 px-[3%] bg-[#141414] flex items-center justify-between space-x-2 mb-2">
  //       <input
  //         ref={inputRef}
  //         type="text"
  //         className="bg-[#141414] text-white placeholder:text-white/70 outline-none w-full"
  //         placeholder="Tên phim..."
  //         onChange={handleChange}
  //       ></input>
  //       <button
  //         className="flex items-center justify-center focus:outline-none py-1 px-3"
  //         onClick={toggleSearch}
  //       >
  //         <FontAwesomeIcon icon="fa-solid fa-magnifying-glass" color="white" />
  //       </button>
  //     </div>
  //   );

  const handleBlur = () => {
    if (searchTerm === "") {
      closeSearch();
    }
  };

  useEffect(() => {
    if (!location.pathname.includes("/tim-kiem")) {
      setIsSearchOpen(false);
    }
  }, [location.pathname]);

  return (
    <div
      className={`relative flex items-center transition-all duration-300 ease-in-out `}
      onBlur={handleBlur}
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
          className={`border-[1px] border-white px-3 bg-black flex items-center justify-start space-x-2 fixed top-[10px] md:top-auto left-1 md:left-auto right-1 z-40 py-[6px] md:flex-grow md:absolute md:w-64 md:!right-3 md:!py-1`}
        >
          <FontAwesomeIcon icon="fa-solid fa-magnifying-glass" color="white" />
          <input
            ref={inputRef}
            value={searchTerm}
            type="text"
            className="bg-black text-white placeholder:text-gray-400 outline-none flex-grow"
            placeholder="Tên phim..."
            onChange={handleChange}
          ></input>
          {searchTerm !== "" && (
            <button
              className="flex items-center justify-end focus:outline-none"
              onClick={closeSearch}
            >
              <FontAwesomeIcon icon="fa-solid fa-xmark" color="white" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
