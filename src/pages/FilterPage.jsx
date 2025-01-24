import { useParams, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import MovieList from "../components/MovieList";

const FilterPage = ({ openModal }) => {
  const { typeSlug } = useParams();
  const [searchParams] = useSearchParams();

  const [country, setCountry] = useState(searchParams.get("country") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [year, setYear] = useState(searchParams.get("year") || "");
  const [sortField, setSortField] = useState(
    searchParams.get("sort_field") || ""
  );

  useEffect(() => {
    setCountry(searchParams.get("country") || "");
    setCategory(searchParams.get("category") || "");
    setYear(searchParams.get("year") || "");
    setSortField(searchParams.get("sort_field") || "");
  }, [searchParams]);

  return (
    <MovieList
      type_slug={typeSlug}
      country={country}
      year={year}
      category={category}
      sort_field={sortField}
      openModal={openModal}
    />
  );
};

export default FilterPage;
