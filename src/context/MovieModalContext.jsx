import { createContext, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MovieModal from "../components/MovieModal";

const MovieModalContext = createContext();

export const MovieModalProvider = ({ children, allowedPaths = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [movieSlug, setMovieSlug] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const slug = params.get("movie");
    setMovieSlug(slug);
    setIsModalOpen(!!slug);
  }, [location.search]);

  const openModal = (slug) => {
    const params = new URLSearchParams(location.search);
    params.set("movie", slug);
    navigate(`${location.pathname}?${params.toString()}`, { replace: false });
  };

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
    <MovieModalContext.Provider value={{ openModal, closeModal, isModalOpen }}>
      {children}
      {canOpen && movieSlug && (
        <MovieModal slug={movieSlug} onClose={closeModal} />
      )}
    </MovieModalContext.Provider>
  );
};

export const useMovieModal = () => useContext(MovieModalContext);
