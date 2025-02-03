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
import MovieModal from "./components/MovieModal";
import MainLayout from "./layouts/MainLayout";
import SearchPage from "./pages/SearchPage";
import axios from "axios";
import Header from "./components/Header";
import WatchPage from "./pages/WatchPage";
import Footer from "./components/Footer";
import FilterPage from "./pages/FilterPage";
import DonatePage from "./pages/DonatePage";
import ListModal from "./components/ListModal";
import { AuthContextProvider } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";

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
  const [isListOpen, setIsListOpen] = useState(false);
  const [listContent, setListContent] = useState(null);
  const [nameList, setNameList] = useState("");

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

  const openList = async ({ type_slug, country, category, nameList }) => {
    const currentList = await axios.get(
      `${
        import.meta.env.VITE_API_LIST
      } ${type_slug}?sort_field=modified.time&category=${category}&country=${country}&year=&page=1`
    );
    setNameList(nameList);
    setListContent(currentList.data.data.items);
    setIsListOpen(true);
  };

  const closeList = () => {
    setIsListOpen(false);
    setListContent(null);
  };

  return (
    <AuthContextProvider>
      <div className="bg-[#141414] overflow-x-hidden text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl select-none outline-none min-h-screen flex flex-col justify-between">
        <Router>
          <MovieModal
            isOpen={isModalOpen}
            onClose={closeModal}
            modal={modalContent}
          />
          <ListModal
            isOpen={isListOpen}
            onClose={closeList}
            movies={listContent}
            openModal={openModal}
            nameList={nameList}
          />
          <AppLayout>
            <Routes>
              <Route
                path="/"
                element={
                  <MainLayout openList={openList} openModal={openModal} />
                }
              />
              <Route
                path="/phim-bo"
                element={
                  <MainLayout
                    type_slug={"phim-bo"}
                    openModal={openModal}
                    openList={openList}
                    filter={true}
                  />
                }
              />
              <Route
                path="/phim-le"
                element={
                  <MainLayout
                    type_slug={"phim-le"}
                    openModal={openModal}
                    openList={openList}
                    filter={true}
                  />
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
              <Route path="/login" element={<LoginPage></LoginPage>} />
              <Route path="/signup" element={<SignUpPage></SignUpPage>} />
            </Routes>
          </AppLayout>
          <Footer />
        </Router>
      </div>
    </AuthContextProvider>
  );
}

export default App;
