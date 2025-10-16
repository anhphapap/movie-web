import React, { Children, useEffect, useState } from "react";
import Banner from "../components/Banner";
import { useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { homeContent, seriesContent, singleContent } from "../utils/data";
import Carousel from "../components/Carousel";

const MainLayout = ({ type_slug, filter = false }) => {
  const [listInfo, setListInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const locate = useLocation();

  useEffect(() => {
    // Reset state khi location thay đổi
    setListInfo(null);
    setLoading(true);

    if (locate.pathname === "/trang-chu") setListInfo(homeContent);
    if (locate.pathname === "/phim-bo") setListInfo(seriesContent);
    if (locate.pathname === "/phim-le") setListInfo(singleContent);

    setLoading(false);
  }, [locate.pathname, type_slug]);

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
      <Banner type_slug={type_slug} filter={filter} />
      {listInfo.map((item, index) => (
        <div key={`${index}-${item.type_slug}`}>
          {item.typeList === "top" ? (
            <Carousel
              nameList={item.nameList}
              typeList={item.typeList}
              type_slug={item.type_slug}
              sort_field={item.sort_field}
              year={item.year}
              size={item.size}
            />
          ) : (
            <Carousel
              nameList={item.nameList}
              typeList={item.typeList}
              sort_field={item?.sort_field}
              year={item?.year}
              type_slug={item.type_slug}
              country={item.country}
              category={item.category}
            />
          )}
        </div>
      ))}
    </>
  );
};

export default MainLayout;
