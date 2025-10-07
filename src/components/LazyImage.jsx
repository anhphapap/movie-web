import { useState } from "react";
import { buildImage } from "../utils/image";

const LazyImage = ({
  src,
  alt,
  widths = [320, 640, 960, 1280],
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px",
  className = "",
}) => {
  const [loaded, setLoaded] = useState(false);

  const srcSet = widths
    .map((w) => `${buildImage(src, { w, q: 75 })} ${w}w`)
    .join(", ");

  const fallback = buildImage(src, { w: widths[widths.length - 1], q: 75 });

  return (
    <div className="relative w-full h-full">
      {!loaded && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse"></div>
      )}
      <img
        src={fallback}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 swiper-lazy ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
      <div className="swiper-lazy-preloader"></div>
    </div>
  );
};

export default LazyImage;
