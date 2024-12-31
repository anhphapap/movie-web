import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Header = () => {
  return (
    <div className="py-5 px-14 bg-gradient-to-b from-black/80 to-black/0 flex items-center justify-between fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center space-x-4">
        <img src="./public/logo.png" className="h-[30px] mr-6"></img>
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
            src="./public/zenitsu-agatsuma-5k-3840x2160-16938.jpg"
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
