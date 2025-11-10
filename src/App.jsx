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
import { ListModalProvider } from "./context/ListModalContext";
import SplashScreen from "./pages/SplashScreen";
import { FavoritesProvider } from "./context/FavouritesProvider";
import { CinemaProvider, useCinema } from "./context/CinemaContext";
import { WatchingProvider } from "./context/WatchingContext";
import { SEOManagerProvider } from "./context/SEOManagerContext";
import SEOGlobal from "./components/SEOGlobal";
import { BannerCacheProvider } from "./context/BannerCacheContext";
import BannerContainer from "./components/BannerContainer";

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
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const FullWatchPage = lazy(() => import("./pages/FullWatchPage"));
library.add(fas, fab, far);

const AppLayout = ({ children }) => {
  const location = useLocation();
  const pathname = location.pathname;
  const pathsWithFilter = ["/phim-bo", "/phim-le"];
  const { cinema } = useCinema();

  return (
    <div>
      {!cinema && (
        <>
          <Header
            filter={
              pathsWithFilter.includes(pathname) ||
              pathname.startsWith("/duyet-tim")
            }
            type_slug={pathname}
          />
          <BannerContainer />
        </>
      )}
      {children}
    </div>
  );
};

const FooterWrapper = () => {
  const { cinema } = useCinema();
  return !cinema ? <Footer /> : null;
};

function App() {
  const [ready, setReady] = useState(false);
  const [firstLaunch, setFirstLaunch] = useState(
    !sessionStorage.getItem("hasVisited")
  );

  useEffect(() => {
    const preloadApp = async () => {
      try {
        await Promise.all([
          warmTmdbCache(),
          import("./layouts/MainLayout"),
          new Promise((res) => setTimeout(res, 800)),
        ]);
      } catch (err) {
        console.warn("Preload error:", err);
      } finally {
        setReady(true);
        sessionStorage.setItem("hasVisited", "true");
      }
    };
    preloadApp();
  }, []);

  const contextClass = {
    success: "bg-white/10 backdrop-blur",
    error: "bg-white/10 backdrop-blur",
    info: "bg-white/10 backdrop-blur",
    warning: "bg-white/10 backdrop-blur",
    default: "bg-white/10 backdrop-blur",
    dark: "bg-white/10 backdrop-blur",
  };

  return (
    <>
      {firstLaunch && <SplashScreen onFinish={() => setReady(true)} />}
      <div
        className={`transition-opacity duration-100 ${
          ready ? "opacity-100" : "opacity-0"
        }`}
      >
        <AuthContextProvider>
          <FavoritesProvider>
            <TopProvider>
              <CinemaProvider>
                <WatchingProvider>
                  <div className="bg-[#141414] overflow-hidden text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl select-none outline-none min-h-screen flex flex-col justify-between">
                    <Router>
                      <SEOManagerProvider>
                        <SEOGlobal />
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
                            <ListModalProvider
                              allowedPaths={[
                                "/trang-chu",
                                "/phim-bo",
                                "/phim-le",
                              ]}
                            >
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
                                <BannerCacheProvider>
                                  <AppLayout>
                                    <ScrollToTop />
                                    <Routes>
                                      <Route
                                        path="/trang-chu"
                                        element={<MainLayout />}
                                      />
                                      <Route
                                        path="/"
                                        element={
                                          <Navigate to="/trang-chu" replace />
                                        }
                                      />
                                      <Route
                                        path="/phim-bo"
                                        element={
                                          <MainLayout
                                            type_slug="phim-bo"
                                            filter
                                          />
                                        }
                                      />
                                      <Route
                                        path="/phim-le"
                                        element={
                                          <MainLayout
                                            type_slug="phim-le"
                                            filter
                                          />
                                        }
                                      />
                                      <Route
                                        path="/tim-kiem"
                                        element={<SearchPage />}
                                      />
                                      <Route
                                        path="/phim/:movieSlug"
                                        element={<WatchPage />}
                                      />
                                      <Route
                                        path="/xem-phim/:movieSlug"
                                        element={<FullWatchPage />}
                                      />
                                      <Route
                                        path="/duyet-tim/:typeSlug"
                                        element={<FilterPage />}
                                      />
                                      <Route
                                        path="/duyet-tim"
                                        element={
                                          <Navigate
                                            to="/duyet-tim/phim-bo"
                                            replace
                                          />
                                        }
                                      />
                                      <Route
                                        path="/ung-ho"
                                        element={<DonatePage />}
                                      />
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
                                      <Route
                                        path="*"
                                        element={<NotFoundPage />}
                                      />
                                    </Routes>
                                  </AppLayout>
                                </BannerCacheProvider>
                                <FooterWrapper />
                              </Suspense>
                              <HoverPreview />
                            </ListModalProvider>
                          </HoverPreviewProvider>
                        </MovieModalProvider>
                      </SEOManagerProvider>
                    </Router>
                  </div>
                </WatchingProvider>
              </CinemaProvider>
            </TopProvider>
          </FavoritesProvider>
        </AuthContextProvider>
      </div>
    </>
  );
}

export default App;
