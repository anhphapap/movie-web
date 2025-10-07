// src/utils/image.js
const IK_BASE = import.meta.env.VITE_IMAGEKIT_ENDPOINT;

export function buildImage(path = "", opts = {}) {
  const p = path.startsWith("/") ? path : `/${path}`;
  const { w, h, q = 75, format = "auto" } = opts;
  const params = [];
  if (w) params.push(`w-${w}`);
  if (h) params.push(`h-${h}`);
  if (q) params.push(`q-${q}`);
  if (format) params.push(`f-${format}`);
  const tr = params.length ? `?tr=${params.join(",")}` : "";
  return `${IK_BASE}${p}${tr}`;
}
