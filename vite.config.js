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
        // ⚠️ KHÔNG tách react / react-dom ra nữa
        manualChunks(id) {
          if (id.includes("node_modules")) {
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
