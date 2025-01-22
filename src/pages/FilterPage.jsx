import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import MovieList from "../components/MovieList";
import MainLayout from "../layouts/MainLayout";

const FilterPage = ({ openModal }) => {
  const { movieSlug, episode } = useParams();
  const [movie, setMovie] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setKeyword(query);
  }, [query]);

  return <MovieList search={true} keyword={keyword} openModal={openModal} />;
};

export default FilterPage;
