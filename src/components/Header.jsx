import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from "react";
import Search from "./Search";
import FilterNavbar from "./FilterNavbar";
import { Link, useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";

const Header = ({ filter = false, type_slug = "" }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logOut, loading } = UserAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [onTab, setOnTab] = useState(0);

  const navigation = [
    { name: "Trang chủ", href: "/" },
    { name: "Phim bộ", href: "/phim-bo" },
    { name: "Phim lẻ", href: "/phim-le" },
    { name: "Donate", href: "/donate" },
    { name: "Tài khoản", href: "/account" },
    { name: "Yêu thích", href: "/favourite" },
    { name: "Đăng ký", href: "/signup" },
    { name: "Đăng nhập", href: "/login" },
  ];

  const handleLogOut = async () => {
    try {
      await logOut();
      navigate("/");
    } catch (error) {
      alert(error);
    }
  };

  useEffect(() => {
    navigation.forEach((element, index) => {
      if (element.href === window.location.pathname) setOnTab(index);
    });
  }, [filter, type_slug]);

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
        className={`flex items-center justify-start py-4 px-[3%] transition-all duration-500 ease-linear text-white ${
          filter
            ? "bg-gradient-to-b from-[#080808] to-[#141414]"
            : isScrolled || showMenu
            ? "bg-[#141414]"
            : "bg-gradient-to-b from-black/70 to-transparent"
        }`}
        id="header"
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="relative inline-flex items-center justify-center rounded-md p-3 text-white aspect-square w-10 border-[1px] hover:bg-white/10"
              onClick={() => setShowMenu(!showMenu)}
            >
              {showMenu ? (
                <FontAwesomeIcon icon="fa-solid fa-xmark" />
              ) : (
                <FontAwesomeIcon icon="fa-solid fa-bars" />
              )}
            </button>
          </div>
          <div className="md:hidden h-8 aspect-square flex justify-center">
            <a href="/">
              <img
                src="https://images.ctfassets.net/y2ske730sjqp/4aEQ1zAUZF5pLSDtfviWjb/ba04f8d5bd01428f6e3803cc6effaf30/Netflix_N.png"
                className="object-cover h-full"
              ></img>
            </a>
          </div>
          <div className="hidden md:flex items-center justify-start flex-shink-0">
            <a href="/" className="w-[20%] mt-1 mr-4 flex-shrink-0">
              <img
                src="https://fontmeme.com/permalink/250104/46a7ee5646a1ff7768a3c2dadc2dba3e.png"
                className="object-cover h-full"
              ></img>
            </a>
            <nav className=" space-x-4 flex flex-shrink-0">
              {navigation.slice(0, 4).map((item, index) => (
                <a
                  href={item.href}
                  className={`text-white hover:opacity-80 ${
                    onTab === index && "font-semibold"
                  }`}
                  onClick={() => setOnTab(index)}
                  key={item.href}
                >
                  {item.name}
                </a>
              ))}
            </nav>
          </div>
          <div className="items-center hidden sm:flex">
            <div className="hidden md:block">
              <Search />
            </div>
            <div className="hidden sm:block">
              {user?.email ? (
                <div className="relative flex flex-shrink-0 items-center space-x-2 cursor-pointer group">
                  <img
                    src={user.photoURL}
                    className="aspect-square h-[30px] w-[30px] rounded-sm object-cover inline-block"
                  ></img>
                  <FontAwesomeIcon
                    icon="fa-solid fa-caret-down"
                    color="white"
                    className="group-hover:rotate-180 ease-linear duration-200"
                  />
                  <div className="hidden absolute top-[100%] right-0 group-hover:block bg-black/80 w-36 border-t-2 z-10">
                    <ul className="p-3">
                      <Link to="/account">
                        <li className="hover:underline space-x-3 mb-3">
                          <FontAwesomeIcon icon="fa-solid fa-user" />
                          <span>Tài khoản</span>
                        </li>
                      </Link>
                      <Link to="/favourite">
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
                  <button className="bg-[#e50914] px-2 md:py-1 rounded hover:bg-[#e50914]/80 transition-colors ease-linear font-medium py-2">
                    Đăng nhập
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      <div
        className={`bg-[#141414] md:hidden ${showMenu ? "block" : "hidden"}`}
        id="mobile-menu"
      >
        <div className="space-y-1 pb-2 px-[3%]">
          <Search open={true} />
          {navigation.slice(0, 4).map((item, index) => (
            <a
              href={item.href}
              className={` hover:bg-white/5 hover:text-white  block rounded-md px-3 py-2 font-medium ${
                onTab === index ? "bg-white/15 text-white" : "text-white/70"
              }`}
              onClick={() => setOnTab(index)}
              key={item.href}
            >
              {item.name}
            </a>
          ))}
        </div>
        <div className="border-t-[0.01px] px-[3%] py-2 text-white sm:hidden space-y-1">
          {user?.email ? (
            <>
              <div className="px-3 py-2 flex space-x-3 items-center">
                <img
                  src={user.photoURL}
                  className="aspect-square h-[40px] rounded-sm object-cover inline-block"
                ></img>
                <div className="flex flex-col">
                  <span className="text-white text-base font-semibold">
                    {user.displayName}
                  </span>
                  <span className="text-white/80 text-xs">{user.email}</span>
                </div>
              </div>
              <a
                href="/account"
                className={`text-white/70 hover:bg-white/10 hover:text-white rounded-md px-3 py-2 font-medium flex items-center space-x-2 ${
                  onTab === 4 ? "bg-white/15 text-white" : "text-white/70"
                }`}
              >
                <FontAwesomeIcon icon="fa-solid fa-user" />
                <span>Tài khoản</span>
              </a>
              <a
                href="/favourite"
                className={`text-white/70 hover:bg-white/10 hover:text-white rounded-md px-3 py-2 font-medium flex items-center space-x-2 ${
                  onTab === 5 ? "bg-white/15 text-white" : "text-white/70"
                }`}
              >
                <FontAwesomeIcon icon="fa-solid fa-heart" />
                <span>Yêu thích</span>
              </a>
              <div
                className="text-white/70 hover:bg-white/10 hover:text-white rounded-md px-3 py-2 font-medium flex items-center space-x-2 cursor-pointer"
                onClick={handleLogOut}
              >
                <FontAwesomeIcon icon="fa-solid fa-right-from-bracket" />
                <span>Đăng xuất</span>
              </div>
            </>
          ) : (
            <>
              <a
                href="/signup"
                className={`text-white/70 hover:bg-white/10 hover:text-white rounded-md px-3 py-2 font-medium flex items-center space-x-2 ${
                  onTab === 6 ? "bg-white/15 text-white" : "text-white/70"
                }`}
              >
                Đăng ký
              </a>
              <a
                href="/login"
                className={`text-white/70 hover:bg-white/10 hover:text-white rounded-md px-3 py-2 font-medium flex items-center space-x-2 ${
                  onTab === 7 ? "bg-white/15 text-white" : "text-white/70"
                }`}
              >
                Đăng nhập
              </a>
            </>
          )}
        </div>
      </div>

      {filter && <FilterNavbar type_slug={type_slug.slice(1)} />}
    </div>
  );
};

export default Header;
