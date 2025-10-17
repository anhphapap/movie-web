import { createContext, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MovieModal from "../components/MovieModal";

const MovieModalContext = createContext();

export const MovieModalProvider = ({ children, allowedPaths = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [movieSlug, setMovieSlug] = useState(null);
  const [tmdbId, setTmdbId] = useState(null);
  const [tmdbType, setTmdbType] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const slug = params.get("movie");
    setMovieSlug(slug);
    setTmdbId(params.get("tmdb_id"));
    setTmdbType(params.get("tmdb_type"));
    setIsModalOpen(!!slug);
  }, [location.search]);

  const openModal = (slug, tmdb_id, tmdb_type) => {
    const params = new URLSearchParams(location.search);
    params.set("movie", slug);
    params.set("tmdb_id", tmdb_id);
    params.set("tmdb_type", tmdb_type);
    navigate(`${location.pathname}?${params.toString()}`, { replace: false });
  };

  const closeModal = () => {
    const params = new URLSearchParams(location.search);
    params.delete("movie");
    params.delete("tmdb_id");
    params.delete("tmdb_type");
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
      {canOpen && movieSlug && tmdbId && tmdbType && (
        <MovieModal
          slug={movieSlug}
          tmdb_id={tmdbId}
          tmdb_type={tmdbType}
          onClose={closeModal}
        />
      )}
    </MovieModalContext.Provider>
  );
};

export const useMovieModal = () => useContext(MovieModalContext);
