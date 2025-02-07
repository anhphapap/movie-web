import React, { Children, useEffect, useState } from "react";
import Banner from "../components/Banner";
import { useLocation } from "react-router-dom";
import MovieCarousel from "../components/MovieCarousel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { homeContent, seriesContent, singleContent } from "../utils/data";

const MainLayout = ({ type_slug, openModal, filter = false, openList }) => {
  const [listInfo, setListInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const locate = useLocation();
  useEffect(() => {
    setLoading(true);
    if (locate.pathname === "/") setListInfo(homeContent);
    if (locate.pathname === "/phim-bo") setListInfo(seriesContent);
    if (locate.pathname === "/phim-le") setListInfo(singleContent);

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
        <div key={`${index}-${item.type_slug}`}>
          {item.typeList === "top" ? (
            <MovieCarousel
              nameList={item.nameList}
              typeList={item.typeList}
              type_slug={item.type_slug}
              sort_field={item.sort_field}
              year={item.year}
              size={item.size}
              openModal={openModal}
              openList={openList}
            />
          ) : (
            <MovieCarousel
              nameList={item.nameList}
              typeList={item.typeList}
              sort_field={item?.sort_field}
              year={item?.year}
              type_slug={item.type_slug}
              country={item.country}
              category={item.category}
              openList={openList}
              openModal={openModal}
            />
          )}
        </div>
      ))}
    </>
  );
};

export default MainLayout;
