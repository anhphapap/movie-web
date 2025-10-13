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
  Navigate,
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
import { MovieModalProvider } from "./context/MovieModalContext";
import { HoverPreviewProvider } from "./context/HoverPreviewContext";
import HoverPreview from "./components/HoverPreview";

// const MovieModal = lazy(() => import("./components/MovieModal"));
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
  const [isListOpen, setIsListOpen] = useState(false);
  const [listAPI, setListAPI] = useState("");
  const [nameList, setNameList] = useState("");

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
            <MovieModalProvider
              allowedPaths={[
                "/trang-chu",
                "/phim-bo",
                "/phim-le",
                "/tim-kiem",
                "/duyet-tim",
                "/yeu-thich",
              ]}
            >
              <HoverPreviewProvider>
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
                  {/* Modals
              <MovieModal
                isOpen={isModalOpen}
                onClose={closeModal}
                modal={modalContent}
              /> */}
                  <ListModal
                    isOpen={isListOpen}
                    onClose={closeList}
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
                        path="/trang-chu"
                        element={<MainLayout openList={openList} />}
                      />
                      <Route
                        path="/"
                        element={<Navigate to="/trang-chu" replace />}
                      />
                      <Route
                        path="/phim-bo"
                        element={
                          <MainLayout
                            type_slug="phim-bo"
                            openList={openList}
                            filter
                          />
                        }
                      />
                      <Route
                        path="/phim-le"
                        element={
                          <MainLayout
                            type_slug="phim-le"
                            openList={openList}
                            filter
                          />
                        }
                      />
                      <Route path="/tim-kiem" element={<SearchPage />} />
                      <Route
                        path="/xem-phim/:movieSlug"
                        element={<WatchPage closeList={closeList} />}
                      />
                      <Route
                        path="/duyet-tim/:typeSlug"
                        element={<FilterPage />}
                      />
                      <Route path="/ung-ho" element={<DonatePage />} />
                      <Route
                        path="/dang-nhap"
                        element={
                          <ProtectedRoute diff>
                            <LoginPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/dang-ky"
                        element={
                          <ProtectedRoute diff>
                            <SignUpPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/tai-khoan"
                        element={
                          <ProtectedRoute>
                            <AccountPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/yeu-thich"
                        element={
                          <ProtectedRoute>
                            <FavouritePage />
                          </ProtectedRoute>
                        }
                      />
                    </Routes>
                  </AppLayout>

                  <Footer />
                </Suspense>
                <HoverPreview />
              </HoverPreviewProvider>
            </MovieModalProvider>
          </Router>
        </div>
      </TopProvider>
    </AuthContextProvider>
  );
}

export default App;
