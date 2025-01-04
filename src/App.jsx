import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import MovieCarousel from "./components/MovieCarousel";
import MovieModal from "./components/MovieModal";
import MainLayout from "./layouts/MainLayout";
import MovieList from "./components/MovieList";
import SearchPage from "./pages/SearchPage";
import axios from "axios";
import Header from "./components/Header";

library.add(fas, fab, far);

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  const openModal = async (slug) => {
    const currentMovie = await axios.get(
      `${import.meta.env.VITE_API_DETAILS}${slug}`
    );
    setModalContent(currentMovie.data);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
  };

  return (
    <div className="bg-[#141414] overflow-x-hidden text-xs lg:text-lg 2xl:text-2xl select-none outline-none min-h-screen">
      <Router>
        <>
          <Header />
          <Routes>
            <Route
              path="/"
              element={
                <MainLayout openModal={openModal}>
                  <MovieCarousel
                    nameList={"Top 10 phim bộ"}
                    openModal={openModal}
                    typeList={"top"}
                    type_slug={"danh-sach/phim-bo"}
                    sort_field={"view"}
                    year={"2024,2025"}
                    size={10}
                  />
                  <MovieCarousel
                    nameList={"Mới trên Needflex"}
                    openModal={openModal}
                    typeList={"list"}
                  />
                  <MovieCarousel
                    nameList={"Phim Hàn Quốc"}
                    openModal={openModal}
                    typeList={"list"}
                    country={"han-quoc"}
                  />
                  <MovieCarousel
                    nameList={"Top 10 phim lẻ"}
                    openModal={openModal}
                    typeList={"top"}
                    type_slug={"danh-sach/phim-le"}
                    sort_field={"view"}
                    year={"2024,2025"}
                    size={10}
                  />
                  <MovieCarousel
                    nameList={"Phim Kinh Dị"}
                    openModal={openModal}
                    typeList={"list"}
                    category={"kinh-di"}
                  />
                  <MovieCarousel
                    nameList={"Sắp ra mắt"}
                    openModal={openModal}
                    typeList={"list"}
                    type_slug={"danh-sach/phim-sap-chieu"}
                  />
                </MainLayout>
              }
            />
            <Route
              path="/phim-bo"
              element={
                <MainLayout
                  type={"series"}
                  type_slug={"/danh-sach/phim-bo"}
                  openModal={openModal}
                >
                  <MovieCarousel
                    nameList={"Top 10 phim bộ"}
                    openModal={openModal}
                    typeList={"top"}
                    type_slug={"danh-sach/phim-bo"}
                    sort_field={"view"}
                    year={"2024,2025"}
                    size={10}
                  />
                  <MovieCarousel
                    nameList={"Mới trên Needflex"}
                    openModal={openModal}
                    type_slug={"danh-sach/phim-bo"}
                    typeList={"list"}
                  />
                  <MovieCarousel
                    nameList={"Phim Hàn Quốc"}
                    openModal={openModal}
                    typeList={"list"}
                    type_slug={"danh-sach/phim-bo"}
                    country={"han-quoc"}
                  />
                  <MovieCarousel
                    nameList={"Phim Hành Động"}
                    openModal={openModal}
                    typeList={"list"}
                    type_slug={"danh-sach/phim-bo"}
                    category={"hanh-dong"}
                  />
                  <MovieCarousel
                    nameList={"Sắp ra mắt"}
                    openModal={openModal}
                    typeList={"list"}
                    type_slug={"danh-sach/phim-sap-chieu"}
                    type={"series"}
                  />
                </MainLayout>
              }
            />
            <Route
              path="/phim-le"
              element={
                <MainLayout
                  type={"single"}
                  type_slug={"/danh-sach/phim-le"}
                  openModal={openModal}
                >
                  <MovieCarousel
                    nameList={"Top 10 phim lẻ"}
                    openModal={openModal}
                    typeList={"top"}
                    type_slug={"danh-sach/phim-le"}
                    sort_field={"view"}
                    year={"2024,2025"}
                    size={10}
                  />
                  <MovieCarousel
                    nameList={"Mới trên Needflex"}
                    openModal={openModal}
                    type_slug={"danh-sach/phim-le"}
                    typeList={"list"}
                  />
                  <MovieCarousel
                    nameList={"Phim Hàn Quốc"}
                    openModal={openModal}
                    typeList={"list"}
                    type_slug={"danh-sach/phim-le"}
                    country={"han-quoc"}
                  />
                  <MovieCarousel
                    nameList={"Phim Hành Động"}
                    openModal={openModal}
                    typeList={"list"}
                    type_slug={"danh-sach/phim-le"}
                    category={"hanh-dong"}
                  />
                  <MovieCarousel
                    nameList={"Sắp ra mắt"}
                    openModal={openModal}
                    typeList={"list"}
                    type_slug={"danh-sach/phim-sap-chieu"}
                    type={"single"}
                  />
                </MainLayout>
              }
            />
            <Route
              path="/search"
              element={<SearchPage openModal={openModal}></SearchPage>}
            />
          </Routes>
        </>
      </Router>
      <MovieModal
        isOpen={isModalOpen}
        onClose={closeModal}
        modal={modalContent}
      />
    </div>
  );
}

export default App;
