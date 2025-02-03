import React, { Children, useEffect, useState } from "react";
import Banner from "../components/Banner";
import { randomList } from "../utils/randomList";
import { useLocation } from "react-router-dom";
import MovieCarousel from "../components/MovieCarousel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const MainLayout = ({ type_slug, openModal, filter = false, openList }) => {
  const [listInfo, setListInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const locate = useLocation();
  useEffect(() => {
    setLoading(true);
    setListInfo(randomList(locate.pathname));
    setLoading(false);
  }, [type_slug]);

  if (loading || !listInfo)
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
    <>
      <Banner openModal={openModal} type_slug={type_slug} filter={filter} />
      {listInfo.map((item, index) => (
        <>
          {item.typeList === "top" ? (
            <MovieCarousel
              typeList={item.typeList}
              type_slug={item.type_slug}
              sort_field={item.sort_field}
              year={item.year}
              size={item.size}
              openModal={openModal}
              openList={openList}
              key={index + type_slug}
            />
          ) : (
            <MovieCarousel
              typeList={item.typeList}
              type_slug={item.type_slug}
              country={item.country}
              category={item.category}
              openList={openList}
              openModal={openModal}
              key={index + item.country + item.category}
            />
          )}
        </>
      ))}
    </>
  );
};

export default MainLayout;
