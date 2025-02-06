import React, { useEffect, useState } from "react";
import { UserAuth } from "../context/AuthContext";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function FavouritePage({ openModal }) {
  const [movies, setMovies] = useState(null);
  const { user } = UserAuth();

  useEffect(() => {
    onSnapshot(doc(db, "users", user.uid), (doc) => {
      setMovies(doc.data().savedMovies);
    });
  }, [user?.email]);

  if (!movies)
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
    <div className="text-white px-[3%] mt-24 h-screen">
      <h1 className="text-xl md:text-2xl 2xl:text-4xl font-bold">
        {movies.length == 0
          ? " Danh sách của bạn hiện đang trống !"
          : "Danh sách của tôi"}
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-x-1 gap-y-14 mt-20">
        {movies.map((item) => (
          <div
            className="aspect-video bg-cover rounded-md group cursor-pointer relative"
            style={{
              backgroundImage: `url(${item.poster_url})`,
            }}
            onClick={() => openModal(item.slug)}
            key={item.slug}
          >
            <div className="absolute top-0 left-0 w-full rounded-md h-full bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 text-white">
              <div className="font-bold text-center truncate line-clamp-2 text-pretty">
                {item.name}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FavouritePage;
