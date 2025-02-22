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
            onClick={() => openModal(item.slug)}
            key={item.slug}
          >
            <div className="text-base group-hover:scale-125 absolute top-0 left-0 w-full h-full z-0 group-hover:z-[9999] group-hover:-translate-y-[50%] rounded transition-all ease-in-out duration-300 group-hover:delay-[400ms]">
              <img
                src={item.poster_url}
                className="aspect-video object-cover rounded group-hover:rounded-b-none w-full"
              ></img>
              <div
                className="bg-[#141414] text-white p-3 text-xs space-y-2 shadow-black/80 shadow rounded-b invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all ease-in-out duration-300 group-hover:delay-[400ms]"
                onClick={() => openModal(item.slug)}
              >
                <h3 className="font-bold">{item.name}</h3>

                <div className="flex space-x-2 items-center text-white/80">
                  <span className="lowercase hidden lg:block">{item.year}</span>
                  <span className="lowercase">{item.time}</span>
                  <span
                    className="px-1 border-[1px] rounded font-bold uppercase"
                    style={{ fontSize: "8px" }}
                  >
                    {item.quality}
                  </span>
                </div>
                <div className="line-clamp-1">
                  {item.category.map(
                    (cat, index) =>
                      index < 3 &&
                      (index != 0 ? (
                        <span key={item.slug + cat.name}> - {cat.name}</span>
                      ) : (
                        <span key={item.slug + cat.name}>{cat.name}</span>
                      ))
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FavouritePage;
