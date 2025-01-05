import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";

const WatchPage = () => {
  const { movieSlug, episode } = useParams();
  const [movie, setMovie] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMovie = async () => {
      setLoading(true);
      try {
        var Response = await axios.get(
          `${import.meta.env.VITE_API_DETAILS}${movieSlug}`
        );
        var currentMovie = Response.data || [];
        setMovie(currentMovie);
      } catch (error) {
        console.error("Error fetching movie:", error);
      }
      setLoading(false);
    };

    fetchMovie();
  }, [movieSlug, episode]);

  if (loading || !movie?.movie)
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <FontAwesomeIcon
          icon="fa-solid fa-spinner"
          size="2xl"
          className="animate-spin text-white"
        />
      </div>
    );
  return (
    <div className="min-h-screen text-white relative">
      <div className="relative w-full h-screen bg-black">
        <iframe
          src={movie.episodes[0].server_data[episode].link_embed}
          title={`${movie.movie.name} - Tập ${movie.episodes[0].server_data[episode].name}`}
          className="absolute top-0 left-0 w-full h-full"
          allowFullScreen
        />
      </div>

      <div className="flex flex-col px-[3%] space-y-4 mt-4">
        <div>
          <h1 className="font-bold text-2xl lg:text-4xl">{`${movie.movie.name} - Tập ${movie.episodes[0].server_data[episode].name}`}</h1>
        </div>
        {movie.movie.type != "single" &&
          movie.episodes[0].server_data[0].link_embed != "" && (
            <div className="flex flex-col space-y-5">
              <div className="flex justify-between">
                <span className="font-bold">Tập</span>
                <span className="px-3 py-1 font-semibold uppercase border-[1px] opacity-70 rounded bg-[#242424]">
                  {movie.movie.lang}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-4 xl:grid-cols-6 2xl:grid-cols-8">
                {movie.episodes[0].server_data.map((item, index) => (
                  <Link
                    to={`/watch/${movie.movie.slug}/${index}`}
                    className={`relative rounded bg-[#242424] ${
                      index == episode
                        ? "bg-opacity-70 border-white border-[1px]"
                        : "hover:bg-opacity-70"
                    }`}
                    key={movie.movie._id + index}
                  >
                    <button className="py-2 font-semibold text-center w-full ">
                      {item.name}
                    </button>
                  </Link>
                ))}
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default WatchPage;
