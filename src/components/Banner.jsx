import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
        className="w-full min-w-min h-screen bg-no-repeat bg-cover bg-center relative"
        style={bg}
      >
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-[#141414] to-transparent z-0" />
        <div className="px-14 grid grid-cols-2 gap-4 h-full">
          <div className="flex flex-col justify-center h-full z-10 space-y-3">
            <h1 className="uppercase text-9xl font-bold italic text-red-600 max-h-[17rem] text-ellipsis overflow-hidden whitespace-">
              {movie.movie.origin_name}
            </h1>
            <div
              dangerouslySetInnerHTML={{ __html: movie.movie.content }}
              className="text-lg text-white text-ellipsis overflow-hidden max-h-28"
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
                <button className="px-7 py-2 font-semibold text-lg flex items-center space-x-2">
                  <FontAwesomeIcon icon="fa-solid fa-play" size="xl" />
                  <span>Phát</span>
                </button>
              </div>
              <div className="relative rounded bg-white/30 hover:bg-white/20">
                <button
                  className="px-7 py-2 text-white font-semibold text-lg flex items-center space-x-2"
                  onClick={() => openModal(movie.movie.slug)}
                >
                  <FontAwesomeIcon icon="fa-solid fa-circle-info" size="xl" />
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
