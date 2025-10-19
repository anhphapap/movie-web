/**
 * SEO Helper Utilities
 * Collection of functions to help with SEO optimization
 */

/**
 * Strip HTML tags from string
 * @param {string} html - HTML string to clean
 * @returns {string} - Plain text without HTML tags
 */
export const stripHtml = (html) => {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length (default: 160)
 * @returns {string} - Truncated text with ellipsis if needed
 */
export const truncateText = (text, maxLength = 160) => {
  if (!text) return "";
  const cleanText = stripHtml(text);
  if (cleanText.length <= maxLength) return cleanText;
  return cleanText.substring(0, maxLength - 3) + "...";
};

/**
 * Create SEO-friendly slug from text
 * @param {string} text - Text to slugify
 * @returns {string} - SEO-friendly slug
 */
export const slugify = (text) => {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD") // Normalize Vietnamese characters
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .replace(/[^\w\s-]/g, "") // Remove non-word chars
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start
    .replace(/-+$/, ""); // Trim - from end
};

/**
 * Generate meta description from movie data
 * @param {object} movie - Movie object
 * @returns {string} - SEO-optimized description
 */
export const generateMovieDescription = (movie) => {
  if (!movie) return "";

  const parts = [];

  // Add movie name
  if (movie.name) parts.push(movie.name);
  if (movie.origin_name) parts.push(`(${movie.origin_name})`);

  // Add year and quality
  if (movie.year) parts.push(`- ${movie.year}`);
  if (movie.quality) parts.push(`[${movie.quality}]`);
  if (movie.episode_current) parts.push(`[${movie.episode_current}]`);

  // Add description
  if (movie.content) {
    const description = stripHtml(movie.content);
    parts.push(`- ${description}`);
  }

  const fullText = parts.join(" ");
  return truncateText(fullText, 160);
};

/**
 * Generate page title with brand
 * @param {string} title - Page title
 * @param {string} brand - Brand name (default: "Needflex")
 * @returns {string} - Complete page title
 */
export const generatePageTitle = (title, brand = "Needflex") => {
  if (!title) return brand;
  return `${title} | ${brand}`;
};

/**
 * Get absolute image URL
 * @param {string} imagePath - Image path (relative or absolute)
 * @param {string} baseUrl - Base URL for images
 * @returns {string} - Absolute image URL
 */
export const getAbsoluteImageUrl = (
  imagePath,
  baseUrl = import.meta.env.VITE_IMAGE_URL || "https://img.ophim.live/uploads/"
) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  return `${baseUrl}${imagePath}`;
};

/**
 * Create SEO data object for movies
 * @param {object} movie - Movie object
 * @param {string} baseUrl - Site base URL
 * @returns {object} - SEO data object
 */
export const createMovieSEO = (movie, baseUrl = window.location.origin) => {
  if (!movie) return null;

  const title = generatePageTitle(
    `${movie.name} - ${movie.origin_name} [${movie.quality}-Vietsub]`
  );
  const description = generateMovieDescription(movie);
  const imageUrl = getAbsoluteImageUrl(movie.thumb_url || movie.poster_url);

  return {
    titleHead: title,
    descriptionHead: description,
    og_type: "video.movie",
    og_url: `phim/${movie.slug}`,
    og_image: [imageUrl],
    updated_time: movie.modified?.time || Date.now(),
    seoSchema: {
      "@context": "https://schema.org",
      "@type": "Movie",
      name: movie.name,
      alternateName: movie.origin_name,
      image: imageUrl,
      datePublished: movie.year ? `${movie.year}-01-01` : undefined,
      dateCreated: movie.created?.time || undefined,
      dateModified: movie.modified?.time || undefined,
      url: `${baseUrl}/phim/${movie.slug}`,
      description: description,
      director:
        movie.director && movie.director[0] ? movie.director[0] : undefined,
      actor: movie.actor
        ? movie.actor.map((actor) => ({
            "@type": "Person",
            name: actor,
          }))
        : undefined,
      genre: movie.category ? movie.category.map((cat) => cat.name) : undefined,
      contentRating: movie.quality || undefined,
      aggregateRating:
        movie.tmdb?.vote_average && movie.tmdb?.vote_count
          ? {
              "@type": "AggregateRating",
              ratingValue: movie.tmdb.vote_average,
              ratingCount: movie.tmdb.vote_count,
              bestRating: 10,
              worstRating: 0,
            }
          : undefined,
    },
  };
};

/**
 * Create SEO data for category/genre pages
 * @param {string} categoryName - Category name
 * @param {string} categorySlug - Category slug
 * @returns {object} - SEO data object
 */
export const createCategorySEO = (categoryName, categorySlug) => {
  return {
    titleHead: generatePageTitle(`Phim ${categoryName}`),
    descriptionHead: `Xem phim ${categoryName} chất lượng cao, phim ${categoryName} mới nhất 2025 HD Vietsub miễn phí. Tổng hợp những bộ phim ${categoryName} hay nhất.`,
    og_type: "website",
    og_url: `the-loai/${categorySlug}`,
    og_image: ["/assets/images/logo_full_940.png"],
    seoSchema: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `Phim ${categoryName}`,
      description: `Tổng hợp phim ${categoryName} hay nhất`,
      url: `${window.location.origin}/the-loai/${categorySlug}`,
    },
  };
};

/**
 * Create breadcrumb schema
 * @param {array} items - Array of breadcrumb items [{name, url}]
 * @returns {object} - Breadcrumb schema
 */
export const createBreadcrumbSchema = (items) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
};

/**
 * Extract keywords from text
 * @param {string} text - Text to extract keywords from
 * @param {number} maxKeywords - Maximum number of keywords (default: 10)
 * @returns {string} - Comma-separated keywords
 */
export const extractKeywords = (text, maxKeywords = 10) => {
  if (!text) return "";

  const cleanText = stripHtml(text).toLowerCase();

  // Remove common Vietnamese stop words
  const stopWords = [
    "của",
    "và",
    "có",
    "trong",
    "để",
    "một",
    "được",
    "người",
    "không",
    "này",
    "các",
    "với",
    "cho",
    "khi",
    "từ",
    "về",
    "là",
  ];

  const words = cleanText
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stopWords.includes(word));

  // Count word frequency
  const wordCount = {};
  words.forEach((word) => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  // Sort by frequency and get top keywords
  const keywords = Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);

  return keywords.join(", ");
};

/**
 * Validate SEO data
 * @param {object} seoData - SEO data to validate
 * @returns {object} - Validation result {isValid, errors}
 */
export const validateSEO = (seoData) => {
  const errors = [];

  if (!seoData) {
    errors.push("SEO data is missing");
    return { isValid: false, errors };
  }

  // Check title
  if (!seoData.titleHead) {
    errors.push("Title is missing");
  } else if (seoData.titleHead.length > 60) {
    errors.push("Title is too long (max 60 characters)");
  } else if (seoData.titleHead.length < 30) {
    errors.push("Title is too short (min 30 characters)");
  }

  // Check description
  if (!seoData.descriptionHead) {
    errors.push("Description is missing");
  } else if (seoData.descriptionHead.length > 160) {
    errors.push("Description is too long (max 160 characters)");
  } else if (seoData.descriptionHead.length < 120) {
    errors.push("Description is too short (min 120 characters)");
  }

  // Check image
  if (!seoData.og_image || !seoData.og_image[0]) {
    errors.push("OG image is missing");
  }

  // Check URL
  if (!seoData.og_url) {
    errors.push("OG URL is missing");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export default {
  stripHtml,
  truncateText,
  slugify,
  generateMovieDescription,
  generatePageTitle,
  getAbsoluteImageUrl,
  createMovieSEO,
  createCategorySEO,
  createBreadcrumbSchema,
  extractKeywords,
  validateSEO,
};
