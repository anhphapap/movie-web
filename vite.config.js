import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],

    // ⚙️ Cấu hình build tối ưu
    build: {
      target: "es2017", // hiện đại, giảm polyfill
      minify: "esbuild", // build nhanh và nhẹ hơn Terser
      cssCodeSplit: true, // tách CSS từng chunk
      sourcemap: false,
      chunkSizeWarningLimit: 800, // không cảnh báo sớm quá
      assetsInlineLimit: 0,
      rollupOptions: {
        output: {
          // 🔥 Tách các vendor lớn thành chunk riêng (cache lâu dài)
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

    // ⚙️ Tối ưu server dev
    server: {
      host: true,
      port: 5173,
      open: false,
    },

    // ⚙️ Preload + module optimization
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-router-dom",
        "axios",
        "firebase/app",
        "firebase/auth",
        "firebase/firestore",
        "swiper/react",
        "swiper/modules",
      ],
    },

    // ⚙️ Biến môi trường
    define: {
      "process.env": env,
    },
  };
});
