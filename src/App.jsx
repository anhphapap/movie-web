import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import { useState, useEffect, lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import axios from "axios";
import { AuthContextProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import { warmTmdbCache } from "./utils/tmdbCache";
import ScrollToTop from "./components/ScrollToTop";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TopProvider } from "./context/TopContext";

const MovieModal = lazy(() => import("./components/MovieModal"));
const ListModal = lazy(() => import("./components/ListModal"));
const MainLayout = lazy(() => import("./layouts/MainLayout"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const WatchPage = lazy(() => import("./pages/WatchPage"));
const FilterPage = lazy(() => import("./pages/FilterPage"));
const DonatePage = lazy(() => import("./pages/DonatePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignUpPage = lazy(() => import("./pages/SignUpPage"));
const AccountPage = lazy(() => import("./pages/AccountPage"));
const FavouritePage = lazy(() => import("./pages/FavouritePage"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));

library.add(fas, fab, far);

const AppLayout = ({ children }) => {
  const location = useLocation();
  const pathname = location.pathname;
  const pathsWithFilter = ["/phim-bo", "/phim-le"];

  return (
    <div>
      <Header
        filter={
          pathsWithFilter.includes(pathname) || pathname.startsWith("/filter")
        }
        type_slug={pathname}
      />
      {children}
    </div>
  );
};

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [isListOpen, setIsListOpen] = useState(false);
  const [listAPI, setListAPI] = useState("");
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

  const openList = async ({
    type_slug,
    country,
    category,
    year,
    sort_field,
    nameList,
  }) => {
    setListAPI(
      `${
        import.meta.env.VITE_API_LIST
      }${type_slug}?sort_field=${sort_field}&category=${category}&country=${country}&year=${year}`
    );
    setNameList(nameList);
    setIsListOpen(true);
  };

  const closeList = () => setIsListOpen(false);

  const contextClass = {
    success: "bg-white/10 backdrop-blur",
    error: "bg-white/10 backdrop-blur",
    info: "bg-white/10 backdrop-blur",
    warning: "bg-white/10 backdrop-blur",
    default: "bg-white/10 backdrop-blur",
    dark: "bg-white/10 backdrop-blur",
  };

  useEffect(() => {
    warmTmdbCache();
  }, []);

  return (
    <AuthContextProvider>
      <TopProvider>
        <div className="bg-[#141414] overflow-hidden text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl select-none outline-none min-h-screen flex flex-col justify-between">
          <Router>
            <Suspense
              fallback={
                <div className="h-screen flex items-center justify-center text-white text-lg">
                  <FontAwesomeIcon
                    icon="fa-solid fa-spinner"
                    size="2xl"
                    className="animate-spin text-white"
                  />
                </div>
              }
            >
              {/* Modals */}
              <MovieModal
                isOpen={isModalOpen}
                onClose={closeModal}
                modal={modalContent}
              />
              <ListModal
                isOpen={isListOpen}
                onClose={closeList}
                openModal={openModal}
                nameList={nameList}
                api={listAPI}
              />

              {/* Toast */}
              <ToastContainer
                position="bottom-right"
                autoClose={5000}
                hideProgressBar={false}
                closeOnClick
                draggable
                pauseOnHover
                theme="dark"
                className="z-[99999]"
                toastClassName={(context) =>
                  contextClass[context?.type || "default"] +
                  " relative flex p-4 mt-2 w-[350px] min-h-14 rounded-md items-center overflow-hidden cursor-pointer shadow-lg "
                }
              />

              {/* Layout */}
              <AppLayout>
                <ScrollToTop />
                <Routes>
                  <Route
                    path="/"
                    element={
                      <MainLayout
                        openList={openList}
                        openModal={openModal}
                        onClose={closeModal}
                      />
                    }
                  />
                  <Route
                    path="/phim-bo"
                    element={
                      <MainLayout
                        type_slug="phim-bo"
                        openModal={openModal}
                        openList={openList}
                        filter
                        onClose={closeModal}
                      />
                    }
                  />
                  <Route
                    path="/phim-le"
                    element={
                      <MainLayout
                        type_slug="phim-le"
                        openModal={openModal}
                        openList={openList}
                        filter
                        onClose={closeModal}
                      />
                    }
                  />
                  <Route
                    path="/search"
                    element={<SearchPage openModal={openModal} />}
                  />
                  <Route
                    path="/watch/:movieSlug"
                    element={
                      <WatchPage onClose={closeModal} closeList={closeList} />
                    }
                  />
                  <Route
                    path="/filter/:typeSlug"
                    element={<FilterPage openModal={openModal} />}
                  />
                  <Route path="/donate" element={<DonatePage />} />
                  <Route
                    path="/login"
                    element={
                      <ProtectedRoute diff>
                        <LoginPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/signup"
                    element={
                      <ProtectedRoute diff>
                        <SignUpPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account"
                    element={
                      <ProtectedRoute>
                        <AccountPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/favourite"
                    element={
                      <ProtectedRoute>
                        <FavouritePage openModal={openModal} />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </AppLayout>

              <Footer />
            </Suspense>
          </Router>
        </div>
      </TopProvider>
    </AuthContextProvider>
  );
}

export default App;
