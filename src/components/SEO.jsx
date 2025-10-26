import { useEffect } from "react";

const SEO = ({
  seoData,
  baseUrl = window.location.origin,
  siteName = "Needflex",
  defaultImage = `${window.location.origin}/assets/images/logo_full_940.png`,
}) => {
  useEffect(() => {
    if (!seoData) return;

    // Helper: update or create <meta> tag
    const setMeta = (key, value, isProperty = false) => {
      if (!value) return;
      const attr = isProperty ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", value);
    };

    // Helper: remove old structured data if exists
    const removeOldScript = (id) => {
      const old = document.getElementById(id);
      if (old) old.remove();
    };

    // ✅ Title (auto append site name)
    const titleRaw = seoData.titleHead || "Xem phim online chất lượng cao";
    const title = titleRaw.includes(siteName)
      ? titleRaw
      : `${titleRaw} | ${siteName}`;
    document.title = title;

    // ✅ Description fallback
    const desc =
      seoData.descriptionHead ||
      "Xem phim online chất lượng cao, phim mới nhất 2025, phim HD Vietsub miễn phí.";

    // ✅ URL canonical
    const cleanUrl = seoData.og_url
      ? `${baseUrl.replace(/\/$/, "")}/${seoData.og_url.replace(/^\//, "")}`
      : baseUrl;

    // ✅ Image fallback
    const image = seoData.og_image?.[0]?.startsWith("http")
      ? seoData.og_image[0]
      : `${import.meta.env.VITE_IMAGE_URL || baseUrl}/${
          seoData.og_image?.[0] || defaultImage
        }`;

    // 🧩 --- BASIC META ---
    setMeta("description", desc);
    setMeta(
      "keywords",
      "xem phim, phim vietsub, Needflex, phim online, phim HD, phim 2025"
    );
    setMeta("author", siteName);
    setMeta("robots", "index, follow");
    setMeta("theme-color", "#000000");

    // 🧩 --- OPEN GRAPH ---
    setMeta("og:locale", "vi_VN", true);
    setMeta("og:site_name", siteName, true);
    setMeta("og:type", seoData.og_type || "website", true);
    setMeta("og:title", title, true);
    setMeta("og:description", desc, true);
    setMeta("og:url", cleanUrl, true);
    setMeta("og:image", image, true);
    setMeta("og:image:width", "1200", true);
    setMeta("og:image:height", "630", true);
    setMeta("og:image:alt", siteName, true);

    // 🧩 --- TWITTER ---
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", desc);
    setMeta("twitter:image", image);

    // 🧩 --- CANONICAL ---
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = cleanUrl;

    // 🧩 --- STRUCTURED DATA ---
    removeOldScript("json-ld-schema");
    const schema = {
      "@context": "https://schema.org",
      "@type":
        seoData.og_type === "video.movie"
          ? "Movie"
          : seoData.og_type === "video.tv_show"
          ? "TVSeries"
          : "WebSite",
      name: titleRaw,
      description: desc,
      image: image,
      url: cleanUrl,
      ...(seoData.seoSchema || {}),
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "json-ld-schema";
    script.textContent = JSON.stringify(schema, null, 2);
    document.head.appendChild(script);

    // ✅ CLEANUP
    return () => {
      removeOldScript("json-ld-schema");
    };
  }, [seoData, baseUrl, siteName, defaultImage]);

  return null;
};

export default SEO;
