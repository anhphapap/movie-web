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
        <link rel="preload" as="image" href={fullImage} imageSrcSet={srcSet} />
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
