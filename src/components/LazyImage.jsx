// import { useState } from "react";
// import { buildImage } from "../utils/image";

// const LazyImage = ({
//   src,
//   alt,
//   widths = [64, 128, 160, 240, 320, 480, 640, 960, 1280, 1920, 3200],
//   sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px",
//   className = "",
// }) => {
//   const [loaded, setLoaded] = useState(false);

//   const pixelRatio = Math.min(window.devicePixelRatio || 1.5, 2);
//   const srcSet = widths
//     .map(
//       (w) =>
//         `${buildImage(src, { w: Math.round(w * pixelRatio), q: 80 })} ${w}w`
//     )
//     .join(", ");

//   const fallback = buildImage(src, { w: widths[widths.length - 1], q: 75 });

//   return (
//     <div className="relative w-full h-full">
//       {!loaded && (
//         <div className="absolute inset-0 bg-[#262626] animate-pulse"></div>
//       )}
//       <img
//         src={fallback}
//         srcSet={srcSet}
//         sizes={sizes}
//         alt={alt}
//         loading="lazy"
//         decoding="async"
//         onLoad={() => setLoaded(true)}
//         className={`w-full h-full object-cover transition-opacity duration-300 swiper-lazy ${
//           loaded ? "opacity-100" : "opacity-0"
//         }`}
//       />
//       <div className="swiper-lazy-preloader"></div>
//     </div>
//   );
// };

// export default LazyImage;
import { useState, useMemo } from "react";
import { buildImage } from "../utils/image";

/**
 * LazyImage — ảnh responsive, preload và có hiệu ứng blur-up
 * - Tự chọn kích thước ảnh cho từng viewport (mobile, tablet, desktop)
 * - Có ảnh blur preview trước khi ảnh nét load xong
 * - Tự động tối ưu format (f=auto), chất lượng (q), và preload (priority)
 */
const LazyImage = ({
  src,
  alt,
  quality = 70,
  aspect = "cover", // 'cover' | 'contain'
  className = "",
  priority = false, // preload cho ảnh quan trọng (banner)
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 80vw, (max-width: 1440px) 60vw, 50vw",
}) => {
  const [loaded, setLoaded] = useState(false);

  // Giới hạn pixel ratio để tránh tải ảnh quá lớn
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

  // Kích thước responsive
  const widths = [64, 128, 160, 240, 320, 480, 640, 960, 1280, 1920];

  const srcSet = useMemo(
    () =>
      widths
        .map(
          (w) =>
            `${buildImage(src, {
              w: Math.round(w * pixelRatio),
              q: quality,
              f: "auto",
            })} ${w}w`
        )
        .join(", "),
    [src, quality, pixelRatio]
  );

  // Ảnh nét (full quality)
  const fullImage = buildImage(src, {
    w: 800,
    q: quality,
    f: "auto",
  });

  // Ảnh mờ blur-up (rất nhẹ, tải nhanh)
  const blurImage = buildImage(src, {
    w: 100,
    q: 20,
    f: "auto",
    blur: 20,
  });

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* preload cho ảnh LCP */}
      {priority && (
        <link rel="preload" as="image" href={fullImage} imagesrcset={srcSet} />
      )}

      {/* Ảnh mờ (hiện trước khi ảnh thật load xong) */}
      <img
        src={blurImage}
        alt={`${alt} blurred`}
        className={`absolute top-0 left-0 w-full h-full object-${aspect} scale-105 blur-lg brightness-90 transition-opacity duration-700 ${
          loaded ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* Ảnh chính */}
      <img
        src={fullImage}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-${aspect} transition-opacity duration-700 ${
          loaded ? "opacity-100" : "opacity-0"
        } ${className}`}
      />
    </div>
  );
};

export default LazyImage;
