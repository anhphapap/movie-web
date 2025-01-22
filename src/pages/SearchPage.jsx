import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import MovieList from "../components/MovieList";
import MainLayout from "../layouts/MainLayout";
import Header from "../components/Header";

const SearchPage = ({ openModal }) => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");
  const [keyword, setKeyword] = useState(query);

  useEffect(() => {
    setKeyword(query);
  }, [query]);

  if (!keyword || keyword.trim() === "") {
    return (
      <MainLayout openModal={openModal}>
        <div className="text-center mt-10">
          <h1 className="text-2xl font-bold text-gray-800">
            Please enter a search term.
          </h1>
        </div>
      </MainLayout>
    );
  }

  return <MovieList search={true} keyword={keyword} openModal={openModal} />;
};

export default SearchPage;
