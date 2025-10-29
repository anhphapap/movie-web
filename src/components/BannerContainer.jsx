import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Banner from "./Banner";

// Giữ banner cố định, đổi type_slug theo route
export default function BannerContainer() {
  const location = useLocation();
  const [bannerType, setBannerType] = useState(null);
  const [filter, setFilter] = useState(false);

  useEffect(() => {
    if (location.pathname.startsWith("/phim-bo")) {
      setBannerType("phim-bo");
      setFilter(true);
    } else if (location.pathname.startsWith("/phim-le")) {
      setBannerType("phim-le");
      setFilter(true);
    } else if (location.pathname.startsWith("/trang-chu")) {
      setBannerType("phim-bo");
      setFilter(false);
    } else {
      setBannerType(null);
    }
  }, [location.pathname]);

  if (!bannerType) return null;

  return <Banner key={bannerType} type_slug={bannerType} filter={filter} />;
}
