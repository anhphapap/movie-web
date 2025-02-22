import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import Tooltip from "../components/Tooltip";
import { toast } from "react-toastify";
import { UserAuth } from "../context/AuthContext";
import { db } from "../firebase";
import {
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
  arrayRemove,
} from "firebase/firestore";

const WatchPage = () => {
  const { movieSlug, episode } = useParams();
  const [movie, setMovie] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [cinema, setCinema] = useState(false);
  const [autoEpisodes, setAutoEpisodes] = useState(false);
  const { user } = UserAuth();

  useEffect(() => {
    const checkSaved = async () => {
      if (user?.email && movie?.movie) {
        setLoading(true);
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        console.log(userSnap.data().savedMovies);
        if (
          userSnap.exists() &&
          userSnap.data().savedMovies.some((m) => m.slug === movie?.movie?.slug)
        ) {
          setSaved(true);
        } else {
          setSaved(false);
        }
        setLoading(false);
      }
    };
    checkSaved();
  }, [user, movieSlug, movie]);

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
        toast.error("Có lỗi xảy ra vui lòng thử lại sau.");
        console.error("Error fetching movie:", error);
      }
      setLoading(false);
    };

    fetchMovie();
  }, [movieSlug]);

  const handleSaveMovie = async () => {
    if (!user?.email) {
      toast.warning("Vui lòng đăng nhập để sử dụng chức năng này.");
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);

      if (saved) {
        await updateDoc(userRef, {
          savedMovies: arrayRemove({
            slug: movie.movie.slug,
            poster_url: movie.movie.poster_url,
            name: movie.movie.name,
            year: movie.movie.year,
            time: movie.movie.time,
            quality: movie.movie.quality,
            category: movie.movie.category,
          }),
        });
        toast.success("Đã xóa khỏi danh sách yêu thích.");
      } else {
        await updateDoc(userRef, {
          savedMovies: arrayUnion({
            slug: movie.movie.slug,
            poster_url: movie.movie.poster_url,
            name: movie.movie.name,
            year: movie.movie.year,
            time: movie.movie.time,
            quality: movie.movie.quality,
            category: movie.movie.category,
          }),
        });
        toast.success("Đã thêm vào danh sách yêu thích.");
      }

      setSaved(!saved);
    } catch (error) {
      console.log(error);
      toast.error("Có lỗi xảy ra vui lòng thử lại sau.");
    }
  };

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
    <div className="min-h-screen text-white relative px-[3%] mt-16">
      <div className="rounded sm:rounded-xl overflow-hidden">
        <div className="relative w-full bg-black aspect-video group">
          <iframe
            src={movie.episodes[0].server_data[episode].link_embed}
            title={`${movie.movie.name} - Tập ${movie.episodes[0].server_data[episode].name}`}
            className="absolute top-0 left-0 w-full aspect-video"
            allowFullScreen
          />
          <div className="opacity-0 flex group-hover:opacity-100 bg-gradient-to-b from-black/60 to-transparent items-center justify-between absolute top-0 left-0 h-[10%] px-[1%] pt-[2%] lg:pt-[1%] w-full transition-all ease-linear">
            <div className="border-l-[3px] sm:border-l-4 border-[#e50914] px-[1%]">
              <p>{movie.movie.name}</p>
              <span className="text-white/70">
                Tập {movie.episodes[0].server_data[episode].name}
              </span>
            </div>
            <div className="px-[1%] cursor-pointer text-white/80 hover:text-white transition-all ease-linear">
              <FontAwesomeIcon icon="fa-solid fa-list" />
              <span> Danh sách tập</span>
            </div>
          </div>
        </div>
        <div className="bg-[#181818] px-4 py-2 sm:py-3 space-x-2">
          <button
            className={`relative group px-3 py-2 rounded-md transition-all ease-linear ${
              saved
                ? "bg-white/20 text-white"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            }`}
            onClick={handleSaveMovie}
          >
            <FontAwesomeIcon
              icon={`fa-${saved ? "solid" : "regular"} fa-heart`}
            />
            <span> Yêu thích</span>
            <Tooltip content={saved ? "Bỏ thích" : "Yêu thích"} />
          </button>
          <button
            className={`relative group px-3 py-2 rounded-md transition-all ease-linear ${
              autoEpisodes
                ? "bg-white/20 text-white"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            }`}
            onClick={() => setAutoEpisodes(!autoEpisodes)}
          >
            <FontAwesomeIcon
              icon={`fa-solid fa-${autoEpisodes ? "toggle-on" : "toggle-off"}`}
            />
            <span> Chuyển tập</span>
            <Tooltip content={"Tự động chuyển tập"} />
          </button>
          <button
            className={`relative group px-3 py-2 rounded-md transition-all ease-linear ${
              cinema
                ? "bg-white/20 text-white"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            }`}
            onClick={() => setCinema(!cinema)}
          >
            <FontAwesomeIcon
              icon={`fa-solid fa-${cinema ? "toggle-on" : "toggle-off"}`}
            />
            <span> Rạp phim</span>
            <Tooltip content={"Chế độ rạp phim"} />
          </button>
        </div>
      </div>

      <div className="flex flex-col space-y-4 mt-4">
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
                    className={`relative rounded bg-[#242424] group ${
                      index == episode
                        ? "bg-white/15 border-white border-[1px]"
                        : "hover:bg-opacity-70"
                    }`}
                    key={movie.movie._id + index}
                  >
                    <button
                      className={`py-2 transition-all ease-linear group-hover:text-white ${
                        index == episode
                          ? "font-semibold text-white"
                          : "text-white/70"
                      } text-center w-full`}
                    >
                      <FontAwesomeIcon icon="fa-solid fa-play" />
                      <span> Tập {item.name}</span>
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
