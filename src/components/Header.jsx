import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from "react";
import NetflixSearch from "./Search";
import FilterNavbar from "./FilterNavbar";
import { Link, useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";

const Header = ({ filter = false, type_slug = "" }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logOut, loading } = UserAuth();
  const navigate = useNavigate();

  const handleLogOut = async () => {
    try {
      await logOut();
      navigate("/");
    } catch (error) {
      alert(error);
    }
  };

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

  if (loading) return <></>;
  return (
    <div
      className={`fixed flex flex-col top-0 left-0 right-0 z-50 transition-all duration-500 ease-linear text-sm lg:text-base`}
    >
      <div
        className={`flex items-center justify-between py-4 px-[3%] transition-all duration-500 ease-linear text-white ${
          filter
            ? "bg-gradient-to-b from-[#080808] to-[#141414]"
            : isScrolled
            ? "bg-[#141414]"
            : "bg-gradient-to-b from-black/70 to-transparent"
        }`}
        id="header"
      >
        <div className="flex items-center space-x-4 justify-start flex-shrink-0">
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
          {user?.email ? (
            <div
              className="relative flex items-center space-x-2 cursor-pointer group"
              id="dropdownDelayButton"
              data-dropdown-toggle="dropdownDelay"
              data-dropdown-delay="500"
              data-dropdown-trigger="hover"
            >
              <img
                src="https://occ-0-325-395.1.nflxso.net/dnm/api/v6/vN7bi_My87NPKvsBoib006Llxzg/AAAABXYofKdCJceEP7pdxcEZ9wt80GsxEyXIbnG_QM8znksNz3JexvRbDLr0_AcNKr2SJtT-MLr1eCOA-e7xlDHsx4Jmmsi5HL8.png?r=1d4"
                className="aspect-square h-[30px] w-[30px] rounded-sm object-cover inline-block"
              ></img>
              <FontAwesomeIcon
                icon="fa-solid fa-caret-down"
                color="white"
                className="group-hover:rotate-180 ease-linear duration-200"
              />
              <div className="hidden absolute top-[100%] right-0 group-hover:block bg-black/80 w-36 border-t-2">
                <ul className="p-3">
                  <Link to="/account">
                    <li className="hover:underline space-x-3 mb-3">
                      <FontAwesomeIcon icon="fa-solid fa-user" />
                      <span>Tài khoản</span>
                    </li>
                  </Link>
                  <Link to="/donate">
                    <li className="hover:underline space-x-3 mb-3">
                      <FontAwesomeIcon icon="fa-solid fa-heart" />
                      <span>Yêu thích</span>
                    </li>
                  </Link>
                  <Link to="/donate">
                    <li className="hover:underline space-x-3">
                      <FontAwesomeIcon icon="fa-solid fa-circle-dollar-to-slot" />
                      <span>Donate</span>
                    </li>
                  </Link>
                </ul>
                <div
                  className="border-t-[1px] py-2 text-center hover:underline"
                  onClick={handleLogOut}
                >
                  Đăng xuất
                </div>
              </div>
            </div>
          ) : (
            <Link to={"/login"}>
              <button className="bg-[#e50914] px-2 py-1 rounded hover:bg-[#e50914]/80 transition-colors ease-linear">
                Đăng nhập
              </button>
            </Link>
          )}
        </div>
      </div>
      {filter && <FilterNavbar type_slug={type_slug.slice(1)} />}
    </div>
  );
};

export default Header;
