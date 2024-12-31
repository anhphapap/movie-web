import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import { useState, useEffect } from "react";
import Header from "./components/Header";
import Banner from "./components/Banner";
import MovieList from "./components/MovieList";

library.add(fas, fab, far);

function App() {
  const [movies, setMovies] = useState([]);
  const [bannerMovie, setBannerMovie] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      const options = {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      };
      const url = "https://ophim1.com/danh-sach/phim-moi-cap-nhat?page=1";

      try {
        const response = await fetch(url, options);
        const data = await response.json();
        if (data.items && Array.isArray(data.items)) {
          setMovies(data.items);
        }
      } catch (error) {
        console.error("Lỗi khi fetch movies:", error);
      }
    };

    fetchMovies();
  }, []);

  useEffect(() => {
    if (movies.length > 0) {
      const fetchDetailsMovie = async (slug) => {
        const options = {
          method: "GET",
          headers: {
            accept: "application/json",
          },
        };
        const url = `https://ophim1.com/phim/${slug}`;

        try {
          const response = await fetch(url, options);
          const data = await response.json();
          setBannerMovie(data);
        } catch (error) {
          console.error("Lỗi khi fetch chi tiết phim:", error);
        }
      };

      fetchDetailsMovie(movies[0].slug);
    }
  }, [movies]);

  return (
    <div className="bg-[#141414]">
      <Header />
      <Banner movie={bannerMovie} />
      <MovieList data={movies} />
    </div>
  );
}

export default App;
