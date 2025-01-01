import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import { useState, useEffect } from "react";
import Header from "./components/Header";
import Banner from "./components/Banner";
import MovieList from "./components/MovieList";

library.add(fas, fab, far);

var movie = {};
export const fetchDetailsMovie = async (slug) => {
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
    return { movie: data.movie, episodes: data.episodes };
  } catch (error) {
    console.error("Lỗi khi fetch chi tiết phim:", error);
  }
};

function App() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    const fetchMovies = async () => {
      const options = {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      };
      var movies = [];
      for (var i = 1; i <= 5; i++) {
        var url = `https://ophim1.com/danh-sach/phim-moi-cap-nhat?page=${i}`;
        try {
          var response = await fetch(url, options);
          var data = await response.json();
          if (data.items && Array.isArray(data.items)) {
            data.items.map((item) => {
              movies.push(item);
            });
          }
        } catch (error) {
          console.error("Lỗi khi fetch movies:", error);
        }
      }
      setMovies(movies);
    };
    fetchMovies();
  }, []);

  useEffect(() => {
    if (movies.length > 0) {
      movie = fetchDetailsMovie(movies[0].slug);
      movie.then((res) => {
        movie = res;
      });
    }
  }, [movies]);

  return (
    <div className="bg-[#141414]">
      <Header />
      <Banner movie={movie} />
      <MovieList data={movies.slice(0, 23)} />
    </div>
  );
}

export default App;
