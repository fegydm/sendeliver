import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import type { UserConfig } from "vite";

export default defineConfig(
  ({ mode }): UserConfig => ({
    plugins: [react()],
    root: path.resolve(__dirname),
    publicDir: path.resolve(__dirname, "public"),
    build: {
      cssCodeSplit: false, //
      outDir: path.resolve(__dirname, "dist"),
      emptyOutDir: true,
      target: "esnext",
      minify: mode === "production" ? "esbuild" : false,
    },
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
    },
    css: {
      modules: {
        generateScopedName:
          mode === "production" ? "[hash:base64:8]" : "[name]__[local]",
      },
      devSourcemap: true,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  })
);
