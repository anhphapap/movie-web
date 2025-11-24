import { useState, useMemo, useEffect } from "react";
import { buildImage } from "../utils/image";

const LazyImage = ({
  src: srcProps,
  alt,
  quality = 70,
  aspect = "cover",
  className = "",
  mode = "text",
  priority = false,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 80vw, (max-width: 1440px) 60vw, 50vw",
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [src, setSrc] = useState(srcProps);

  useEffect(() => {
    if (srcProps?.startsWith("https://image.tmdb.org/t/p/")) {
      setSrc(srcProps);
    } else if (srcProps?.startsWith("http")) {
      setSrc(srcProps.split("movies/")[1]);
    } else {
      setSrc(srcProps);
    }
  }, [srcProps]);

  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

  const isTMDB = src?.includes("image.tmdb.org/t/p/");
  const tmdbSizes = ["w185", "w342", "w500", "w780", "w1280"];

  const srcSet = useMemo(() => {
    if (isTMDB) {
      const path = src.split("/t/p/")[1];
      return tmdbSizes
        .map(
          (size) =>
            `https://image.tmdb.org/t/p/${size}/${path} ${size.replace(
              "w",
              ""
            )}w`
        )
        .join(", ");
    } else {
      const widths = [64, 128, 160, 240, 320, 480, 640, 960, 1280, 1920];
      return widths
        .map(
          (w) =>
            `${buildImage(src, {
              w: Math.round(w * pixelRatio),
              q: quality,
              f: "auto",
            })} ${w}w`
        )
        .join(", ");
    }
  }, [src, quality, pixelRatio, isTMDB]);

  const fullImage = useMemo(() => {
    if (isTMDB) {
      const path = src.split("/t/p/")[1];
      return `https://image.tmdb.org/t/p/w500${path}`;
    }
    return buildImage(src, { w: 800, q: quality, f: "auto" });
  }, [src, quality, isTMDB]);

  const blurImage = useMemo(() => {
    if (isTMDB) {
      const path = src.split("/t/p/")[1];
      return `https://image.tmdb.org/t/p/w92/${path}`;
    }
    return buildImage(src, { w: 100, q: 20, f: "auto", blur: 20 });
  }, [src, isTMDB]);

  return (
    <div className="relative w-full h-full overflow-hidden flex sm:block items-center justify-center">
      {error ? (
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black via-zinc-900 to-zinc-800 flex items-center justify-center p-2 transition-all duration-500 ease-out
    ${
      !priority
        ? loaded
          ? "opacity-0"
          : "opacity-100"
        : loaded
        ? "opacity-0"
        : "opacity-100"
    }`}
        >
          <h3 className="text-white font-semibold text-sm line-clamp-3 text-center uppercase text-pretty">
            {alt}
          </h3>
        </div>
      ) : (
        <>
          {mode === "text" && (
            <div
              className={`absolute inset-0 bg-gradient-to-t from-black via-zinc-900 to-zinc-800 flex items-center justify-center p-2 transition-all duration-500 ease-out
    ${
      !priority
        ? loaded
          ? "opacity-0"
          : "opacity-100"
        : loaded
        ? "opacity-0"
        : "opacity-100"
    }`}
            >
              <h3 className="text-white font-semibold text-sm line-clamp-3 text-center uppercase text-pretty">
                {alt}
              </h3>
            </div>
          )}
          {priority && (
            <link
              rel="preload"
              as="image"
              href={fullImage}
              imageSrcSet={srcSet}
            />
          )}
          {mode === "blur" && (
            <img
              src={blurImage}
              alt={`${alt} blurred`}
              onError={() => setError(true)}
              className={`absolute top-0 left-0 w-full h-full object-${aspect} 
     blur-lg
    transition-all duration-500 ease-out
    ${
      !priority
        ? loaded
          ? "opacity-0 scale-100"
          : "opacity-100 "
        : loaded
        ? "opacity-0"
        : "opacity-100"
    }`}
            />
          )}
          <img
            src={fullImage}
            srcSet={srcSet}
            sizes={sizes}
            alt={alt}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            className={`w-full h-full object-${aspect} 
    transition-all duration-500 ease-out
    ${
      !priority
        ? loaded
          ? "opacity-100 scale-100"
          : "opacity-0 scale-[.98]"
        : loaded
        ? "opacity-100"
        : "opacity-0"
    } 
    ${className}`}
          />
        </>
      )}
    </div>
  );
};

export default LazyImage;
