import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  build: {
    outDir: "dist",
    minify: "esbuild",
    sourcemap: false,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // Split FontAwesome thành nhiều chunk nhỏ hơn
            if (id.includes("@fortawesome/free-solid-svg-icons"))
              return "vendor-fa-solid";
            if (id.includes("@fortawesome/free-regular-svg-icons"))
              return "vendor-fa-regular";
            if (id.includes("@fortawesome/free-brands-svg-icons"))
              return "vendor-fa-brands";
            if (id.includes("@fortawesome")) return "vendor-fontawesome";
            if (id.includes("firebase")) return "vendor-firebase";
            if (id.includes("swiper")) return "vendor-swiper";
            if (id.includes("react-dom")) return "vendor-react-dom";
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
