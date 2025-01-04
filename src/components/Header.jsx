import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from "react";
import NetflixSearch from "./Search";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className={`py-4 px-[3%] flex items-center justify-between fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-linear text-sm lg:text-base ${
        isScrolled
          ? "bg-[#080808] text-white"
          : "bg-gradient-to-b from-black/70 to-transparent text-white"
      }`}
    >
      <div className="flex items-center space-x-4 justify-start flex-shrink-1">
        <a href="/" className="mr-[2.5%] w-[20%] mt-1">
          <img
            src="https://fontmeme.com/permalink/250104/46a7ee5646a1ff7768a3c2dadc2dba3e.png"
            className="object-cover h-full"
          ></img>
        </a>
        <nav className="flex space-x-4">
          <a href="/" className="text-white hover:opacity-80">
            Trang chủ
          </a>
          <a href="/phim-bo" className="text-white hover:opacity-80">
            Phim bộ
          </a>
          <a href="/phim-le" className="text-white hover:opacity-80">
            Phim lẻ
          </a>
        </nav>
      </div>
      <div className="flex group">
        <NetflixSearch />
      </div>
    </div>
  );
};

export default Header;
