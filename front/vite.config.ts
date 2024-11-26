import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import type { UserConfig } from "vite";

export default defineConfig(
  ({ mode }): UserConfig => ({
    plugins: [react()],
    root: path.resolve(__dirname), // Nastav root explicitne na projektovú zložku
    publicDir: path.resolve(__dirname, "public"), // Definuj cestu explicitne
    build: {
      outDir: path.resolve(__dirname, "dist"), // Uisti sa, že výstup je v správnej ceste
      emptyOutDir: true,
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
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    optimizeDeps: {
      include: ["react", "react-dom"],
    },
    esbuild: {
      logOverride: { "this-is-undefined-in-esm": "silent" },
    },
  })
);
