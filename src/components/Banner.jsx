import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useState, useEffect } from "react";

const Banner = ({ openModal }) => {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMovie = async () => {
      setLoading(true);
      try {
        const listResponse = await axios.get(
          `https://ophim1.com/danh-sach/phim-moi-cap-nhat?page=1`
        );
        const movieList = listResponse.data.items || [];

        const detailResponse = await axios.get(
          `https://ophim1.com/phim/${movieList[0].slug}`
        );
        setMovie(detailResponse.data);
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
      setLoading(false);
    };

    fetchMovie();
  }, []);

  if (loading || !movie) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <FontAwesomeIcon
          icon="fa-solid fa-spinner"
          size="2xl"
          className="animate-spin text-white"
        />
      </div>
    );
  } else {
    return (
      <div className="p-[3%] relative w-screen">
        <img
          src={movie.movie.poster_url}
          className="absolute top-0 left-0 w-full aspect-video bg-no-repeat bg-cover bg-top"
        ></img>
        <div className="absolute top-0 left-0 w-full aspect-video bg-gradient-to-t from-[#141414] to-transparent z-0" />
        <div className="flex w-full aspect-[16/6]">
          <div className="flex flex-col justify-end h-full z-10 space-y-3 w-2/3 xl:w-1/2">
            <h1 className="uppercase text-5xl lg:text-8xl 2xl:text-9xl font-bold italic text-red-600 truncate text-wrap line-clamp-2">
              {movie.movie.origin_name}
            </h1>
            <div
              dangerouslySetInnerHTML={{ __html: movie.movie.content }}
              className=" text-white truncate line-clamp-4 text-pretty"
            />
            <div className="flex items-start space-x-3">
              <div className="relative rounded bg-white hover:bg-white/80">
                {(movie.episodes[0].server_data[0].link_embed != "" && (
                  <a
                    href={movie.episodes[0].server_data[0].link_embed}
                    className="absolute top-0 left-0 w-full h-full"
                    target="_blank"
                  ></a>
                )) ||
                  (movie.movie.trailer_url != "" && (
                    <a
                      href={movie.movie.trailer_url}
                      className="absolute top-0 left-0 w-full h-full"
                      target="_blank"
                    ></a>
                  )) || (
                    <a
                      href="#"
                      className="absolute top-0 left-0 w-full h-full"
                    ></a>
                  )}
                <button className="py-2 lg:py-5 px-3 sm:px-7 lg:px-10 font-semibold flex items-center justify-center space-x-2">
                  <FontAwesomeIcon icon="fa-solid fa-play" />
                  <span>Phát</span>
                </button>
              </div>
              <div className="relative rounded bg-white/30 hover:bg-white/20">
                <button
                  className="py-2 lg:py-5 px-3 sm:px-7 lg:px-10 text-white font-semibold flex items-center justify-center space-x-2"
                  onClick={() => openModal(movie.movie.slug)}
                >
                  <FontAwesomeIcon icon="fa-solid fa-circle-info" />
                  <span>Thông tin khác</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

Banner.propTypes = {
  openModal: PropTypes.func.isRequired,
};

export default Banner;
