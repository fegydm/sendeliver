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
        "@back": path.resolve(__dirname, "../back/src"),
        "@front": path.resolve(__dirname, "./src"),
        "@components": path.resolve(__dirname, "./src/components"),
        "@navbars": path.resolve(__dirname, "./src/components/navbars"),
        "@modals": path.resolve(__dirname, "./src/components/modals"),
        "@constants": path.resolve(__dirname, "./src/constants"),
        "@types": path.resolve(__dirname, "./src/types"),
        "@hooks": path.resolve(__dirname, "./src/hooks"),
        "@utils": path.resolve(__dirname, "./src/utils"),
        "@assets": path.resolve(__dirname, "./src/assets"),
        "@layouts": path.resolve(__dirname, "./src/layouts"),
        "@styles": path.resolve(__dirname, "./src/styles"),
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
