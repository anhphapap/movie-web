import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import MovieList from "../components/MovieList";
import { useNavigate } from "react-router-dom";
const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");
  const [keyword, setKeyword] = useState(query);
  const navigate = useNavigate();

  useEffect(() => {
    setKeyword(query);
  }, [query]);

  if (!keyword || keyword.trim() === "") {
    navigate("/trang-chu");
  }

  return <MovieList search={true} keyword={keyword} />;
};

export default SearchPage;
