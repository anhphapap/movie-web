import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import { useState, useEffect } from "react";
import Header from "./components/Header";
import Banner from "./components/Banner";
import MovieList from "./components/MovieList";
import MovieModal from "./components/MovieModal";

library.add(fas, fab, far);

var banner = {};
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  const openModal = (slug) => {
    var currentMovie = fetchDetailsMovie(slug);
    currentMovie.then((res) => {
      currentMovie = res;
      setModalContent(currentMovie);
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
  };

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
          if (i == 1) {
            banner = data.items[0].slug;
            banner = fetchDetailsMovie(banner);
            banner.then((res) => {
              banner = res;
            });
          }
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

  return (
    <div className="bg-[#141414] overflow-x-hidden text-xs lg:text-lg 2xl:text-2xl select-none outline-none ">
      <Header />
      <Banner movie={banner} openModal={openModal} />
      <MovieList
        data={movies.slice(49, 59)}
        nameList={"Top 10 lượt xem"}
        openModal={openModal}
        type={"top"}
      />
      <MovieList
        data={movies.slice(0, 24)}
        nameList={"Mới cập nhập"}
        openModal={openModal}
      />
      <MovieList
        data={movies.slice(25, 48)}
        nameList={"Mới cập nhập"}
        openModal={openModal}
      />
      <MovieModal
        isOpen={isModalOpen}
        onClose={closeModal}
        modal={modalContent}
      />
    </div>
  );
}

export default App;
