import { defineConfig, splitVendorChunkPlugin } from "vite";
import react from "@vitejs/plugin-react";

// Vite build config tối ưu cho React (SPA, Vercel)
export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin(), // fallback auto split nếu Rollup không tách được
  ],
  build: {
    chunkSizeWarningLimit: 800, // tránh spam warning
    sourcemap: false,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // bỏ console.log khỏi bundle
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          // ✅ Tách các thư viện lớn, nhưng vẫn giữ React + ReactDOM chung 1 chunk
          if (id.includes("node_modules")) {
            if (id.match(/react|react-dom/)) return "vendor-react";
            if (id.includes("@fortawesome")) return "vendor-fontawesome";
            if (id.includes("firebase")) return "vendor-firebase";
            if (id.includes("swiper")) return "vendor-swiper";
            return "vendor";
          }
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@fortawesome/react-fontawesome",
    ],
  },
  server: {
    port: 5173,
    open: true,
  },
});
