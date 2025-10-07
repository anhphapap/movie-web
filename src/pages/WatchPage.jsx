import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import Tooltip from "../components/Tooltip";
import { toast } from "react-toastify";
import { UserAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { LoaderCircle, Captions, Server } from "lucide-react";
import {
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
  arrayRemove,
} from "firebase/firestore";
import VideoPlayer from "../components/VideoPlayer";

const WatchPage = ({ closeList, onClose }) => {
  const { movieSlug, episode } = useParams();
  const [movie, setMovie] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [cinema, setCinema] = useState(false);
  const [autoEpisodes, setAutoEpisodes] = useState(false);
  const [peoples, setPeoples] = useState([]);
  const [server, setServer] = useState(0);
  const { user } = UserAuth();
  const navigate = useNavigate();
  useEffect(() => {
    const checkSaved = async () => {
      if (user?.email && movie?.movie) {
        setLoading(true);
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

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

    const fetchPeoples = async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_DETAILS}${movieSlug}/peoples`
      );
      setPeoples(response.data.data.peoples);
    };

    fetchMovie();
    fetchPeoples();
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
            episode_current: movie.movie.episode_current,
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
            episode_current: movie.movie.episode_current,
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
      <div className="flex items-center gap-4 my-6 pt-2 px-2">
        <button
          className="aspect-square w-8 p-1 rounded-full flex items-center justify-center text-white hover:text-white/80 transition-all ease-linear border border-white/40 hover:border-white"
          onClick={() => navigate(-1)}
        >
          <FontAwesomeIcon icon="fa-solid fa-chevron-left" size="xs" />
        </button>
        <h1 className="text-2xl font-bold">
          Xem phim {movie.movie.name} - Tập{" "}
          {movie.episodes[server].server_data[episode].name}
        </h1>
      </div>
      <div className="rounded sm:rounded-xl overflow-hidden">
        <div className="relative w-full bg-black aspect-video">
          <div className="absolute top-0 left-0 w-full aspect-video">
            <VideoPlayer
              src={movie.episodes[server].server_data[episode].link_m3u8}
              poster={movie.movie.poster_url}
              title={movie.movie.name}
              episode={episode}
              episodeName={movie.episodes[server].server_data[episode].name}
              episodes={movie.episodes[server].server_data}
              movieSlug={movie.movie.slug}
              content={movie.movie.content}
            />
          </div>
        </div>
        <div className="bg-black px-4 py-2 sm:py-3 space-x-2">
          <button
            className={`relative group px-3 py-2 rounded-md transition-all ease-linear hover:bg-white/10 ${
              saved ? " text-white" : "text-white/80  hover:text-white"
            }`}
            onClick={handleSaveMovie}
          >
            <FontAwesomeIcon
              icon={`fa-${saved ? "solid" : "regular"} fa-heart`}
              className={`${saved && "text-red-500"}`}
            />
            <span> Yêu thích</span>
            <Tooltip content={saved ? "Bỏ thích" : "Yêu thích"} />
          </button>
          <button
            className={`relative group px-3 py-2 rounded-md transition-all ease-linear hover:bg-white/10 ${
              autoEpisodes ? " text-white" : "text-white/80  hover:text-white"
            }`}
            onClick={() => setAutoEpisodes(!autoEpisodes)}
          >
            <FontAwesomeIcon
              icon={`fa-solid fa-${autoEpisodes ? "toggle-on" : "toggle-off"}`}
              className={`${autoEpisodes && "text-red-500"}`}
            />
            <span> Chuyển tập</span>
            <Tooltip content={"Tự động chuyển tập"} />
          </button>
          <button
            className={`relative group px-3 py-2 rounded-md transition-all ease-linear hover:bg-white/10 ${
              cinema
                ? " text-white"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            }`}
            onClick={() => setCinema(!cinema)}
          >
            <FontAwesomeIcon
              icon={`fa-solid fa-${cinema ? "toggle-on" : "toggle-off"}`}
              className={`${cinema && "text-red-500"}`}
            />
            <span> Rạp phim</span>
            <Tooltip content={"Chế độ rạp phim"} />
          </button>
        </div>
      </div>

      <div className="flex mt-4">
        <div className="flex flex-col space-y-5 w-full pr-4">
          <div className="items-start justify-between gap-3 hidden lg:flex">
            <div className="w-[15%] rounded-md overflow-hidden">
              <img
                src={movie.movie.thumb_url}
                alt={movie.movie.name}
                className="w-full object-cover"
              />
            </div>
            <div className="w-[50%] p-2 space-y-2 ">
              <h1 className="font-bold text-xl lg:text-2xl">
                {movie.movie.name}
              </h1>
              <span className="text-white/70 text-base">
                {movie.movie.origin_name}
              </span>
              <div className="flex items-center flex-wrap gap-2">
                {movie.movie.tmdb.vote_count > 0 && (
                  <div className="flex items-center space-x-2 border-[1px] border-yellow-500 rounded-md py-1 px-2 text-sm">
                    <span className="text-yellow-500 font-medium">IMDb</span>
                    <span className="font-semibold">
                      {movie.movie.tmdb.vote_average.toFixed(1)}
                    </span>
                  </div>
                )}
                <span className="bg-white text-black font-medium rounded-md py-1 px-2 text-sm">
                  {movie.movie.episode_current}
                </span>
                <span className="border-[1px] rounded-md py-1 px-2 text-sm">
                  {movie.movie.year}
                </span>
                <span className="border-[1px] rounded-md py-1 px-2 text-sm">
                  {movie.movie.time}
                </span>
              </div>
              <div className="flex items-center space-x-2 flex-wrap">
                {movie.movie.category.map((category, index) => (
                  <span
                    key={index}
                    className=" rounded-md py-1 px-2 text-xs bg-white/10"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
              {movie.movie.type == "series" &&
                (movie.movie.status == "ongoing" ? (
                  <div className="flex items-center space-x-1 bg-orange-500/20 rounded-full px-2 py-1 w-fit ">
                    <LoaderCircle
                      className="text-orange-500 animate-spin"
                      size={14}
                    />
                    <span className="text-sm pr-1 text-orange-500">
                      {"Đã chiếu: "}
                      {movie.movie.episode_current.split(" ")[1]} /{" "}
                      {movie.movie.episode_total}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2 bg-green-500/20 rounded-full py-1 px-2 w-fit">
                    <FontAwesomeIcon
                      icon="fa-solid fa-circle-check"
                      size="xs"
                      className="text-green-500"
                    />
                    <span className="text-sm text-green-500 pr-1">
                      {"Đã hoàn thành: "}
                      {movie.movie.episode_total.split(" ")[0]} /{" "}
                      {movie.movie.episode_total}
                    </span>
                  </div>
                ))}
            </div>
            <div
              className="w-[35%] text-white/70 text-pretty text-sm line-clamp-6 mt-2"
              dangerouslySetInnerHTML={{ __html: movie.movie.content }}
            />
          </div>
          <div>
            {movie.movie.type != "single" &&
              movie.episodes[server].server_data[server].link_embed != "" && (
                <div className="flex flex-col space-y-5 lg:border-t-[0.5px] border-white/10 lg:pt-4">
                  <div className="flex gap-4 items-center">
                    <span className="text-xl font-bold border-r-[0.5px] border-white/50 pr-4 flex items-center gap-1">
                      <Server size={16} strokeWidth={3} />
                      Server
                    </span>
                    {movie.episodes.map((item, index) => (
                      <div
                        key={index}
                        className={`${
                          server == index
                            ? "text-white border-[1px] border-white"
                            : "text-white/70"
                        } cursor-pointer px-2 py-1 rounded-lg hover:text-white transition-all ease-linear flex items-center gap-2 text-base`}
                        onClick={() => setServer(index)}
                      >
                        <Captions size={16} />
                        <span>{item.server_name.split(" #")[0]}</span>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-4 gap-4 xl:grid-cols-6 2xl:grid-cols-8">
                    {movie.episodes[server].server_data.map((item, index) => (
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
                          className={`py-2 transition-all ease-linear  gap-2 flex items-center justify-center ${
                            index == episode
                              ? "text-black bg-white"
                              : "text-white/70 group-hover:text-white"
                          } text-center w-full`}
                        >
                          <FontAwesomeIcon
                            icon="fa-solid fa-play"
                            className="text-xs"
                          />
                          <span className="text-base"> Tập {item.name}</span>
                        </button>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
        {peoples.length > 0 && (
          <div className="flex-col space-y-5 w-[35%] p-2 hidden md:flex border-l-[0.5px] border-white/10 pl-4">
            <div className="flex justify-between pl-2">
              <span className="font-bold text-2xl">Diễn viên</span>
            </div>
            <div className="grid grid-cols-2 gap-6 xl:grid-cols-3">
              {peoples.slice(0, 6).map(
                (people, index) =>
                  people.profile_path && (
                    <div
                      key={index}
                      className="flex flex-col space-y-2 rounded-md overflow-hidden items-center"
                    >
                      <img
                        src={
                          "https://image.tmdb.org/t/p/w185" +
                          people.profile_path
                        }
                        alt={people.name}
                        className="w-[80px] aspect-square object-cover rounded-full"
                      />
                      <span className="text-sm font-semibold">
                        {people.name}
                      </span>
                      <span className="text-sm">{people.character}</span>
                    </div>
                  )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchPage;
