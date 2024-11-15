// ./front/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import type { UserConfig } from "vite";

export default defineConfig(
  ({ mode }): UserConfig => ({
    plugins: [react()],
    root: ".",
    publicDir: "public", // upravené, lebo už sme vo front priečinku
    build: {
      outDir: "dist", // upravené, lebo už sme vo front priečinku
      emptyOutDir: true,
      // Build optimization
      target: "esnext",
      minify: mode === "production" ? "esbuild" : false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom"],
          },
        },
      },
    },
    // Dev server optimization
    server: {
      port: 3000,
      proxy: {
        "/api": {
          target: "http://localhost:5000",
          changeOrigin: true,
          ws: true,
        },
      },
      hmr: {
        overlay: false,
      },
      watch: {
        usePolling: false,
        interval: 100,
      },
    },
    // Resolve optimization
    resolve: {
      alias: {
        "@back": path.resolve(__dirname, "../back/src"),
        "@shared": path.resolve(__dirname, "../shared"),
        "@front": path.resolve(__dirname, "./src"),
      },
    },
    // Dependencies optimization
    optimizeDeps: {
      include: ["react", "react-dom"],
      exclude: ["@shared"],
    },
    esbuild: {
      logOverride: { "this-is-undefined-in-esm": "silent" },
    },
  })
);
