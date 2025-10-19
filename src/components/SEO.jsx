import { useEffect } from "react";

const SEO = ({
  seoData,
  baseUrl = window.location.origin,
  siteName = "Needflex",
}) => {
  useEffect(() => {
    if (!seoData) return;

    // Update document title
    if (seoData.titleHead) {
      // Thêm tên website vào title nếu chưa có
      const title = seoData.titleHead.includes(siteName)
        ? seoData.titleHead
        : `${seoData.titleHead} | ${siteName}`;
      document.title = title;
    }

    // Update or create meta tags
    const updateMetaTag = (name, content, property = false) => {
      if (!content) return;

      const attribute = property ? "property" : "name";
      let element = document.querySelector(`meta[${attribute}="${name}"]`);

      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }

      element.setAttribute("content", content);
    };

    // Basic meta tags
    updateMetaTag("description", seoData.descriptionHead);

    // Open Graph tags
    updateMetaTag("og:site_name", siteName, true);
    updateMetaTag("og:type", seoData.og_type, true);
    updateMetaTag("og:title", seoData.titleHead, true);
    updateMetaTag("og:description", seoData.descriptionHead, true);
    updateMetaTag("og:url", `${baseUrl}/${seoData.og_url}`, true);

    if (seoData.og_image && seoData.og_image[0]) {
      const imageUrl = seoData.og_image[0].startsWith("http")
        ? seoData.og_image[0]
        : `${
            import.meta.env.VITE_IMAGE_URL || "https://img.ophim.live/uploads/"
          }${seoData.og_image[0]}`;
      updateMetaTag("og:image", imageUrl, true);
      updateMetaTag("og:image:secure_url", imageUrl, true);
      updateMetaTag("og:image:type", "image/jpeg", true);
      updateMetaTag("og:image:width", "1200", true);
      updateMetaTag("og:image:height", "630", true);
    }

    if (seoData.updated_time) {
      const updatedTime = new Date(seoData.updated_time).toISOString();
      updateMetaTag("og:updated_time", updatedTime, true);
    }

    // Twitter Card tags
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", seoData.titleHead);
    updateMetaTag("twitter:description", seoData.descriptionHead);
    if (seoData.og_image && seoData.og_image[0]) {
      const imageUrl = seoData.og_image[0].startsWith("http")
        ? seoData.og_image[0]
        : `${
            import.meta.env.VITE_IMAGE_URL || "https://img.ophim.live/uploads/"
          }${seoData.og_image[0]}`;
      updateMetaTag("twitter:image", imageUrl);
    }

    // Canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", `${baseUrl}/${seoData.og_url}`);

    // JSON-LD Structured Data
    if (seoData.seoSchema) {
      let scriptTag = document.querySelector(
        'script[type="application/ld+json"]#movie-schema'
      );

      if (!scriptTag) {
        scriptTag = document.createElement("script");
        scriptTag.setAttribute("type", "application/ld+json");
        scriptTag.setAttribute("id", "movie-schema");
        document.head.appendChild(scriptTag);
      }

      // Enhance schema with more details
      const enhancedSchema = {
        ...seoData.seoSchema,
        image:
          seoData.seoSchema.image ||
          (seoData.og_image && seoData.og_image[0]
            ? seoData.og_image[0].startsWith("http")
              ? seoData.og_image[0]
              : `${
                  import.meta.env.VITE_IMAGE_URL ||
                  "https://img.ophim.live/uploads/"
                }${seoData.og_image[0]}`
            : undefined),
        url: seoData.seoSchema.url || `${baseUrl}/${seoData.og_url}`,
        description: seoData.descriptionHead,
      };

      scriptTag.textContent = JSON.stringify(enhancedSchema);
    }

    // Cleanup function to reset title on unmount
    return () => {
      document.title = siteName;
    };
  }, [seoData, baseUrl, siteName]);

  return null;
};

export default SEO;
