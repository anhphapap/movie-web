import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  build: {
    outDir: "dist",
    minify: "esbuild",
    sourcemap: false,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1200, // nới nhẹ cảnh báo chunk
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("@fortawesome")) return "vendor-fontawesome";
            if (id.includes("firebase")) return "vendor-firebase";
            if (id.includes("swiper")) return "vendor-swiper";
            if (id.includes("react")) return "vendor-react";
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
