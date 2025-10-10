// src/utils/image.js
const IK_BASE = import.meta.env.VITE_IMAGEKIT_ENDPOINT;

/**
 * Tạo URL ảnh từ ImageKit với các tham số tối ưu (f-auto, q, w, h...)
 * - Tự động loại bỏ ký tự thừa
 * - Tự thêm fallback ảnh nếu đường dẫn lỗi
 * - Hỗ trợ blur preview (tuỳ chọn)
 */
export function buildImage(path = "", opts = {}) {
  if (!path) {
    // fallback khi không có ảnh
    return `${IK_BASE}/default/fallback.jpg?tr=w-400,q-60,f-auto`;
  }

  // đảm bảo path bắt đầu bằng /
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  const {
    w, // width
    h, // height
    q = 70, // quality mặc định
    f = "auto", // định dạng tự động (webp/avif nếu có)
    blur = 0, // làm mờ cho preview
    crop, // crop mode (optional)
  } = opts;

  const params = [];

  if (w) params.push(`w-${w}`);
  if (h) params.push(`h-${h}`);
  if (q) params.push(`q-${q}`);
  if (f) params.push(`f-${f}`);
  if (blur > 0) params.push(`bl-${blur}`);
  if (crop) params.push(`c-${crop}`);

  // build query transform string
  const tr = params.length ? `?tr=${params.join(",")}` : "";

  return `${IK_BASE}${cleanPath}${tr}`;
}
