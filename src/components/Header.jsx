import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from "react";
import NetflixSearch from "./Search";
import FilterNavbar from "./FilterNavbar";

const Header = ({ filter = false, type_slug = "" }) => {
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
      className={`fixed flex flex-col top-0 left-0 right-0 z-50 transition-all duration-500 ease-linear text-sm lg:text-base`}
    >
      <div
        className={`flex items-center justify-between py-4 px-[3%] transition-all duration-500 ease-linear text-white ${
          filter
            ? "bg-gradient-to-b from-[#080808] to-[#141414]"
            : isScrolled
            ? "bg-gradient-to-b from-[#080808] to-[#141414]"
            : "bg-gradient-to-b from-black/70 to-transparent"
        }`}
        id="header"
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
            <a href="/donate" className="text-white hover:opacity-80">
              Donate
            </a>
          </nav>
        </div>
        <div className="flex group">
          <NetflixSearch />
        </div>
      </div>
      {filter && <FilterNavbar type_slug={type_slug.slice(1)} />}
    </div>
  );
};

export default Header;
