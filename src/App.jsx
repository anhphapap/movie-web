import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import MovieCarousel from "./components/MovieCarousel";
import MovieModal from "./components/MovieModal";
import MainLayout from "./layouts/MainLayout";
import SearchPage from "./pages/SearchPage";
import axios from "axios";
import Header from "./components/Header";
import WatchPage from "./pages/WatchPage";
import Footer from "./components/Footer";
import FilterPage from "./pages/FilterPage";
import DonatePage from "./pages/DonatePage";

library.add(fas, fab, far);

const AppLayout = ({ children }) => {
  const location = useLocation();

  const pathsWithFilter = ["/phim-bo", "/phim-le"];

  return (
    <div>
      <Header
        filter={
          pathsWithFilter.includes(useLocation().pathname) ||
          useLocation().pathname.startsWith("/filter")
        }
        type_slug={useLocation().pathname}
      />
      {children}
    </div>
  );
};

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
    <div className="bg-[#141414] overflow-x-hidden text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl select-none outline-none min-h-screen flex flex-col justify-between">
      <Router>
        <MovieModal
          isOpen={isModalOpen}
          onClose={closeModal}
          modal={modalContent}
        />
        <AppLayout>
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
                    year={2025}
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
                    year={2025}
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
                  filter={true}
                >
                  <MovieCarousel
                    nameList={"Top 10 phim bộ"}
                    openModal={openModal}
                    typeList={"top"}
                    type_slug={"danh-sach/phim-bo"}
                    sort_field={"view"}
                    year={2025}
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
                  filter={true}
                >
                  <MovieCarousel
                    nameList={"Top 10 phim lẻ"}
                    openModal={openModal}
                    typeList={"top"}
                    type_slug={"danh-sach/phim-le"}
                    sort_field={"view"}
                    year={2025}
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
            <Route
              path="/watch/:movieSlug/:episode"
              element={<WatchPage onClose={closeModal} />}
            />
            <Route
              path="/filter/:typeSlug"
              element={<FilterPage openModal={openModal} />}
            />
            <Route path="/donate" element={<DonatePage></DonatePage>} />
          </Routes>
        </AppLayout>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
