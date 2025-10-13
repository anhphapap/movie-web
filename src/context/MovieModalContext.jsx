import { createContext, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MovieModal from "../components/MovieModal";

const MovieModalContext = createContext();

export const MovieModalProvider = ({ children, allowedPaths = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [movieSlug, setMovieSlug] = useState(null);

  // 🔍 Lấy param "movie" từ URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const slug = params.get("movie");
    setMovieSlug(slug);
  }, [location.search]);

  // 🚪 Mở modal (thêm query param)
  const openModal = (slug) => {
    const params = new URLSearchParams(location.search);
    params.set("movie", slug);
    navigate(`${location.pathname}?${params.toString()}`, { replace: false });
  };

  // ❌ Đóng modal (xóa param)
  const closeModal = () => {
    const params = new URLSearchParams(location.search);
    params.delete("movie");
    navigate(`${location.pathname}?${params.toString()}`, { replace: false });
  };
  const normalize = (path) => path.replace(/\/+$/, "");
  const canOpen =
    allowedPaths.length === 0 ||
    allowedPaths.some((p) => {
      const allowed = normalize(p);
      const current = normalize(location.pathname);

      if (allowed === "/") return current === "/";

      return current.startsWith(allowed);
    });

  return (
    <MovieModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      {canOpen && movieSlug && (
        <MovieModal slug={movieSlug} onClose={closeModal} />
      )}
    </MovieModalContext.Provider>
  );
};

export const useMovieModal = () => useContext(MovieModalContext);
