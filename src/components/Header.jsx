import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from "react";
import Search from "./Search";
import FilterNavbar from "./FilterNavbar";
import { Link, useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";
import logo_full from "../assets/images/logo_full_240.png";

const Header = ({ filter = false, type_slug = "" }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logOut, loading } = UserAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [onTab, setOnTab] = useState(-1);
  const [pathname, setPathname] = useState(window.location.pathname);

  const navigation = [
    { name: "Trang chủ", href: "/trang-chu" },
    { name: "Phim bộ", href: "/phim-bo" },
    { name: "Phim lẻ", href: "/phim-le" },
    { name: "Donate", href: "/ung-ho" },
    { name: "Tài khoản", href: "/tai-khoan" },
    { name: "Yêu thích", href: "/yeu-thich" },
    { name: "Đăng ký", href: "/dang-ky" },
    { name: "Đăng nhập", href: "/dang-nhap" },
  ];

  const handleLogOut = async () => {
    try {
      await logOut();
      navigate("/trang-chu");
    } catch (error) {
      alert(error);
    }
  };

  useEffect(() => {
    setPathname(window.location.pathname);
  }, [window.location.pathname]);

  useEffect(() => {
    navigation.forEach((element, index) => {
      if (element.href === pathname) setOnTab(index);
    });
  }, [filter, type_slug, pathname]);

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
        className={`flex items-center justify-start py-2 px-[3%] transition-all duration-500 ease-linear text-white sm:py-3 md:py-4 ${
          filter
            ? "bg-gradient-to-b from-[#080808] to-[#141414]"
            : isScrolled || showMenu
            ? "bg-[#141414]"
            : "bg-gradient-to-b from-black/70 to-transparent"
        }`}
        id="header"
      >
        <div className="flex flex-row md:flex items-center justify-between w-full">
          <div className="md:hidden flex items-center gap-2">
            <div className="flex items-center md:hidden">
              <button
                type="button"
                className="relative inline-flex items-center justify-center text-white p-2 rounded hover:bg-white/10"
                onClick={() => setShowMenu(!showMenu)}
              >
                {showMenu ? (
                  <FontAwesomeIcon icon="fa-solid fa-xmark" color="red" />
                ) : (
                  <FontAwesomeIcon icon="fa-solid fa-bars" />
                )}
              </button>
            </div>
            <div className="md:hidden sm:h-8 h-6 aspect-square flex justify-center">
              <div
                className="cursor-pointer"
                onClick={() => navigate("/trang-chu")}
              >
                <img
                  src="https://images.ctfassets.net/y2ske730sjqp/4aEQ1zAUZF5pLSDtfviWjb/ba04f8d5bd01428f6e3803cc6effaf30/Netflix_N.png"
                  className="object-cover h-full"
                ></img>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center justify-start flex-shink-0">
            <div
              className="w-[20%] mt-1 mr-4 flex-shrink-0 cursor-pointer"
              onClick={() => navigate("/trang-chu")}
            >
              <img src={logo_full} className="object-cover h-full"></img>
            </div>
            <nav className=" space-x-4 flex flex-shrink-0">
              {navigation.slice(0, 4).map((item, index) => (
                <div
                  onClick={() => {
                    navigate(item.href);
                    setOnTab(index);
                  }}
                  className={` ${
                    onTab === index || (item.href === pathname && index === 0)
                      ? "font-bold text-white"
                      : "text-white/80 hover:opacity-70 cursor-pointer"
                  }`}
                  key={item.href}
                >
                  {item.name}
                </div>
              ))}
              {user?.email && (
                <>
                  <div
                    onClick={() => {
                      navigate("/yeu-thich");
                      setOnTab(5);
                    }}
                    className={` ${
                      "/yeu-thich" === pathname && onTab === 5
                        ? "font-bold text-white"
                        : "text-white/80 hover:opacity-70 cursor-pointer"
                    }`}
                  >
                    Yêu thích
                  </div>
                </>
              )}
            </nav>
          </div>
          <div className="flex items-center">
            <Search />
            {/* <div className="hidden md:block">
              <Search />
            </div> */}
            <div className="hidden md:block">
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
                      <li
                        className="hover:underline space-x-3 mb-3 cursor-pointer"
                        onClick={() => navigate("/tai-khoan")}
                      >
                        <FontAwesomeIcon icon="fa-solid fa-user" />
                        <span>Tài khoản</span>
                      </li>
                      <li
                        className="hover:underline space-x-3 mb-3 cursor-pointer"
                        onClick={() => navigate("/yeu-thich")}
                      >
                        <FontAwesomeIcon icon="fa-solid fa-heart" />
                        <span>Yêu thích</span>
                      </li>
                      <li
                        className="hover:underline space-x-3 cursor-pointer"
                        onClick={() => navigate("/ung-ho")}
                      >
                        <FontAwesomeIcon icon="fa-solid fa-circle-dollar-to-slot" />
                        <span>Donate</span>
                      </li>
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
                <button
                  className="bg-[#e50914] px-2 md:py-1 rounded hover:bg-[#e50914]/80 transition-colors ease-linear font-medium py-2"
                  onClick={() => navigate("/dang-nhap")}
                >
                  Đăng nhập
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <div
        className={`bg-[#141414] md:hidden border-y-[1px] border-white ${
          showMenu ? "block" : "hidden"
        }`}
        id="mobile-menu"
      >
        {/* <Search open={true} /> */}
        <div className="space-y-1 py-2 px-[3%]">
          {navigation.slice(0, 4).map((item, index) => (
            <div
              onClick={() => {
                navigate(item.href);
                setOnTab(index);
                setShowMenu(false);
              }}
              className={` hover:bg-white/5 hover:text-white  block rounded-md px-3 py-2 cursor-pointer font-medium ${
                onTab === index || (item.href === pathname && index === 0)
                  ? "bg-white/15 text-white"
                  : "text-white/70"
              }`}
              key={item.href}
            >
              {item.name}
            </div>
          ))}
        </div>
        <div className="border-t-[0.1px] px-[3%] py-2 border-white/60 text-white md:hidden space-y-1">
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
              <div
                onClick={() => navigate("/tai-khoan")}
                className={`text-white/70 hover:bg-white/10 hover:text-white rounded-md px-3 py-2 font-medium flex items-center space-x-2 cursor-pointer ${
                  "/tai-khoan" === pathname && onTab === 4
                    ? "bg-white/15 text-white"
                    : "text-white/70"
                }`}
              >
                <FontAwesomeIcon icon="fa-solid fa-user" />
                <span>Tài khoản</span>
              </div>
              <div
                onClick={() => navigate("/yeu-thich")}
                className={`text-white/70 hover:bg-white/10 hover:text-white rounded-md px-3 py-2 font-medium flex items-center space-x-2 cursor-pointer ${
                  "/yeu-thich" === pathname && onTab === 5
                    ? "bg-white/15 text-white"
                    : "text-white/70"
                }`}
              >
                <FontAwesomeIcon icon="fa-solid fa-heart" />
                <span>Yêu thích</span>
              </div>
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
              <div
                onClick={() => navigate("/dang-ky")}
                className={`text-white/70 hover:bg-white/10 hover:text-white rounded-md px-3 py-2 font-medium flex items-center space-x-2 cursor-pointer ${
                  "/dang-ky" === pathname && onTab === 6
                    ? "bg-white/15 text-white"
                    : "text-white/70"
                }`}
              >
                Đăng ký
              </div>
              <div
                onClick={() => navigate("/dang-nhap")}
                className={`text-white/70 hover:bg-white/10 hover:text-white rounded-md px-3 py-2 font-medium flex items-center space-x-2 cursor-pointer ${
                  "/dang-nhap" === pathname && onTab === 7
                    ? "bg-white/15 text-white"
                    : "text-white/70"
                }`}
              >
                Đăng nhập
              </div>
            </>
          )}
        </div>
      </div>

      {filter && (
        <FilterNavbar type_slug={type_slug.slice(1)} open={showMenu} />
      )}
    </div>
  );
};

export default Header;
