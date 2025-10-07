import { useState } from "react";

const LazyImage = ({ src, alt }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative w-full h-full">
      {!loaded && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse"></div>
      )}
      <img
        data-src={src}
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover transition-opacity duration-500 swiper-lazy ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
      <div className="swiper-lazy-preloader"></div>
    </div>
  );
};

export default LazyImage;
