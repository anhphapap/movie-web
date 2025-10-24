import axios from "axios";
import fs from "fs";
import { create } from "xmlbuilder2";

const BASE_URL = "https://movie-web-lake-eta.vercel.app";
const API_BASE = "https://ophim1.com"; // bạn có thể đổi domain mirror nếu cần

// === Helper tạo XML nhanh ===
function writeXML(filename, rootName, nodes, nodeName = "url") {
  const root = create({ version: "1.0", encoding: "UTF-8" }).ele(rootName, {
    xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9",
  });
  nodes.forEach((item) => {
    const node = root.ele(nodeName);
    for (const key in item) node.ele(key).txt(item[key]).up();
  });
  const xml = root.end({ prettyPrint: true });
  fs.writeFileSync(`public/${filename}`, xml);
  console.log(`✅ ${filename} (${nodes.length} items)`);
}

// === Crawl danh sách phim mới nhất ===
async function fetchMovies(limitPages = 10) {
  const urls = [];
  for (let page = 1; page <= limitPages; page++) {
    try {
      const res = await axios.get(
        `${API_BASE}/danh-sach/phim-moi-cap-nhat?page=${page}`
      );
      const movies = res.data.items || [];
      if (!movies.length) break;
      movies.forEach((m) =>
        urls.push({
          loc: `${BASE_URL}/trang-chu?movie=${m.slug}&tmdb_id=${
            m.tmdb.id || "null"
          }&tmdb_type=${m.tmdb.type || "null"}`,
          lastmod: new Date().toISOString(),
        })
      );
    } catch (e) {
      console.warn("⚠️ Lỗi khi fetch page:", page);
      break;
    }
  }
  return urls;
}

// === Crawl thể loại / quốc gia / bộ sưu tập ===
async function fetchSimpleList(endpoint, type) {
  try {
    const res = await axios.get(`${API_BASE}/the-loai`);
    return res.data.items.map((c) => ({
      loc: `${BASE_URL}/${type}/${c.slug}`,
      lastmod: new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

// === Main ===
async function generate() {
  console.log("🚀 Đang tạo toàn bộ sitemap...");

  // 1️⃣ Phim
  const movieUrls = await fetchMovies(20); // 20 trang đầu
  const chunkSize = 100;
  const movieChunks = [];
  for (let i = 0; i < movieUrls.length; i += chunkSize)
    movieChunks.push(movieUrls.slice(i, i + chunkSize));

  movieChunks.forEach((chunk, i) =>
    writeXML(`sitemap-movie-${i + 1}.xml`, "urlset", chunk)
  );

  // 2️⃣ Thể loại / Quốc gia
  // const genres = await fetchSimpleList("the-loai", "the-loai");
  // const countries = await fetchSimpleList("quoc-gia", "quoc-gia");

  // writeXML("sitemap-genre.xml", "urlset", genres);
  // writeXML("sitemap-country.xml", "urlset", countries);

  // 3️⃣ Trang tĩnh
  const staticPages = [
    "",
    "/trang-chu",
    "/phim-bo",
    "/phim-le",
    "/ung-ho",
    "/duyet-tim/phim-le",
    "/duyet-tim/phim-bo",
  ];
  const pageNodes = staticPages.map((path) => ({
    loc: `${BASE_URL}${path}`,
    lastmod: new Date().toISOString(),
  }));
  writeXML("sitemap-page.xml", "urlset", pageNodes);

  // 4️⃣ Sitemap index (tổng hợp)
  const indexNodes = [];

  // add static sitemaps
  ["sitemap-page.xml"].forEach((f) =>
    indexNodes.push({
      loc: `${BASE_URL}/${f}`,
      lastmod: new Date().toISOString(),
    })
  );

  // add movie sitemaps
  movieChunks.forEach((_, i) =>
    indexNodes.push({
      loc: `${BASE_URL}/sitemap-movie-${i + 1}.xml`,
      lastmod: new Date().toISOString(),
    })
  );

  writeXML("sitemap.xml", "sitemapindex", indexNodes, "sitemap");

  console.log("🎉 Tạo xong toàn bộ sitemap Needflex!");
}

generate();
