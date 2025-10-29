import { createContext, useContext, useState } from "react";

const BannerCacheContext = createContext();

export const BannerCacheProvider = ({ children }) => {
  const [cache, setCache] = useState({});
  const [playing, setPlaying] = useState(false);

  const saveBanner = (key, data) => {
    setCache((prev) => ({ ...prev, [key]: data }));
    // Optionally: sessionStorage.setItem("banner-cache", JSON.stringify({ ...cache, [key]: data }))
  };

  const getBanner = (key) => cache[key] || null;

  return (
    <BannerCacheContext.Provider
      value={{ getBanner, saveBanner, playing, setPlaying }}
    >
      {children}
    </BannerCacheContext.Provider>
  );
};

export const useBannerCache = () => useContext(BannerCacheContext);
