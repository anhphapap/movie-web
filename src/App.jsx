import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import { useState, useEffect } from "react";
import Header from "./components/Header";
import Banner from "./components/Banner";
import MovieList from "./components/MovieList";
import MovieModal from "./components/MovieModal";
import axios from "axios";

library.add(fas, fab, far);

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  const openModal = async (slug) => {
    const currentMovie = await axios.get(`https://ophim1.com/phim/${slug}`);
    setModalContent(currentMovie.data);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
  };

  return (
    <div className="bg-[#141414] overflow-x-hidden text-xs lg:text-lg 2xl:text-2xl select-none outline-none ">
      <Header />
      <Banner openModal={openModal} />
      <MovieList
        nameList={"Top 10 phim hot nhất tuần"}
        openModal={openModal}
        type={"top"}
      />
      <MovieList nameList={"Mới cập nhập"} openModal={openModal} type={"new"} />
      <MovieList
        nameList={"Phim Hàn Quốc"}
        openModal={openModal}
        type={"list"}
        country={"Hàn Quốc"}
        category={""}
        size={24}
      />
      <MovieList
        nameList={"Phim Kinh Dị"}
        openModal={openModal}
        type={"list"}
        country={""}
        category={"Kinh Dị"}
        size={10}
      />
      <MovieList
        nameList={"Sắp ra mắt"}
        openModal={openModal}
        type={"trailer"}
        country={""}
        category={""}
        size={10}
      />
      <MovieModal
        isOpen={isModalOpen}
        onClose={closeModal}
        modal={modalContent}
      />
    </div>
  );
}

export default App;
