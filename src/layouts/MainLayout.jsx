import React, { Children, useEffect, useState } from "react";
import Banner from "../components/Banner";
import { useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { homeContent, seriesContent, singleContent } from "../utils/data";
import Carousel from "../components/Carousel";
import SEO from "../components/SEO";

const MainLayout = ({ type_slug, filter = false }) => {
  const [listInfo, setListInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const locate = useLocation();
  const [prefetchMovies, setPrefetchMovies] = useState({});
  useEffect(() => {
    // Reset state khi location thay đổi
    setListInfo(null);
    setLoading(true);

    if (locate.pathname === "/trang-chu") setListInfo(homeContent);
    if (locate.pathname === "/phim-bo") setListInfo(seriesContent);
    if (locate.pathname === "/phim-le") setListInfo(singleContent);

    setLoading(false);
  }, [locate.pathname, type_slug]);

  useEffect(() => {
    if (!listInfo) return;
    const fetchAll = async () => {
      const cacheKey = `needflex_${locate.pathname}_carousels`;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        setPrefetchMovies(JSON.parse(cached));
        setLoading(false);
        return;
      }

      const results = {};
      try {
        await Promise.all(
          listInfo.data.map(async (item, index) => {
            // top list (TMDB) hoặc watching thì bỏ qua
            if (item.typeList === "top" || item.typeList === "watching") return;

            const url = `${import.meta.env.VITE_API_LIST}${
              item.type_slug
            }?sort_field=${item.sort_field || "_id"}&category=${
              item.category || ""
            }&country=${item.country || ""}&year=${
              item.year || ""
            }&page=1&limit=${item.size || 8}`;

            try {
              const res = await axios.get(url);
              results[index] = res.data.data.items || [];
            } catch (err) {
              console.warn("⚠️ Fetch fail:", item.type_slug);
              results[index] = [];
            }
          })
        );

        sessionStorage.setItem(cacheKey, JSON.stringify(results));
        setPrefetchMovies(results);
      } catch (err) {
        console.error("Prefetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [listInfo, locate.pathname]);

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
      {/* <Banner type_slug={type_slug} filter={filter} /> */}
      <SEO seoData={listInfo.seoData} />
      {listInfo.data.map((item, index) => (
        <div key={`${locate.pathname}-${index}-${item.type_slug}`}>
          <Carousel
            nameList={item.nameList}
            typeList={item.typeList}
            type_slug={item.type_slug}
            sort_field={item.sort_field}
            year={item.year}
            size={item.size}
            country={item.country}
            category={item.category}
            prefetchMovies={prefetchMovies[index] || []}
          />
        </div>
      ))}
    </>
  );
};

export default MainLayout;
