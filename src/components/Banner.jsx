import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MovieList from "./MovieList";

const Banner = ({ movie, openModal }) => {
  if (!movie?.movie?.name) {
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
    const bg = {
      backgroundImage: `url(${movie.movie.poster_url})`,
    };
    return (
      <div
        className="p-[3%] w-full aspect-video xl:aspect-[8/3] bg-no-repeat bg-cover bg-center relative"
        style={bg}
      >
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-[#141414] to-transparent z-0" />
        <div className="flex h-full">
          <div className="flex flex-col justify-end h-full z-10 space-y-3 w-2/3 xl:w-1/2">
            <h1 className="uppercase text-5xl lg:text-8xl 2xl:text-9xl font-bold italic text-red-600 truncate text-wrap line-clamp-2">
              {movie.movie.origin_name}
            </h1>
            <div
              dangerouslySetInnerHTML={{ __html: movie.movie.content }}
              className=" text-white truncate text-wrap line-clamp-4"
            />
            <div className="flex items-start space-x-3">
              <div className="relative rounded bg-white hover:bg-white/80">
                {(movie.episodes[0].server_data[0].link_embed != "" && (
                  <a
                    href={movie.episodes[0].server_data[0].link_embed}
                    className="absolute top-0 left-0 w-full h-full"
                    target="_blank"
                  ></a>
                )) || (
                  <a
                    href={movie.movie.trailer_url}
                    className="absolute top-0 left-0 w-full h-full"
                    target="_blank"
                  ></a>
                )}
                <button className="px-7 py-2 font-semibold flex items-center justify-center space-x-2">
                  <FontAwesomeIcon icon="fa-solid fa-play" />
                  <span>Phát</span>
                </button>
              </div>
              <div className="relative rounded bg-white/30 hover:bg-white/20">
                <button
                  className="px-7 py-2 text-white font-semibold flex items-center justify-center space-x-2"
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
  movie: PropTypes.object,
};

export default Banner;
