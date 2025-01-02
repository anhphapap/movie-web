import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from "react";

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
      <div className="flex items-center space-x-4">
        <img
          src="./public/logo.png"
          className="w-[10%] mr-[2.5%] object-cover"
        ></img>
        <nav className="flex items-center space-x-4">
          <a href="#" className="text-white hover:opacity-80">
            Trang chủ
          </a>
          <a href="#" className="text-white hover:opacity-80">
            Phim bộ
          </a>
          <a href="#" className="text-white hover:opacity-80">
            Phim lẻ
          </a>
        </nav>
      </div>
      <div className="flex items-center space-x-4">
        <FontAwesomeIcon icon="fa-solid fa-magnifying-glass" color="white" />
        <FontAwesomeIcon icon="fa-regular fa-bell" color="white" />
        <div className="flex items-center space-x-2">
          <img
            src="https://occ-0-325-395.1.nflxso.net/dnm/api/v6/vN7bi_My87NPKvsBoib006Llxzg/AAAABXYofKdCJceEP7pdxcEZ9wt80GsxEyXIbnG_QM8znksNz3JexvRbDLr0_AcNKr2SJtT-MLr1eCOA-e7xlDHsx4Jmmsi5HL8.png?r=1d4"
            className="aspect-square h-[30px] rounded-sm object-cover inline-block"
          ></img>
          <FontAwesomeIcon
            icon="fa-solid fa-caret-down"
            color="white"
            className="hover:rotate-180 ease-linear duration-300"
          />
        </div>
      </div>
    </div>
  );
};

export default Header;
