import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite build config tối ưu cho React (SPA, Vercel)
export default defineConfig({
  plugins: [react()],
  build: {
    minify: "esbuild", // nhanh và ổn định
    sourcemap: false,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // ⚠️ Check react-router TRƯỚC react để tránh conflict
            if (id.includes("react-router")) return "vendor-router";
            // React core - PHẢI được tách riêng, check nhiều patterns
            if (id.includes("react-dom")) return "vendor-react";
            if (id.match(/[\\/]react[\\/]/)) return "vendor-react";
            if (id.includes("scheduler")) return "vendor-react";
            // Các libraries khác
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
