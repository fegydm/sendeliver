// front/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import type { UserConfig } from "vite";

export default defineConfig(
  ({ mode }): UserConfig => ({
    plugins: [react()],
    root: path.resolve(__dirname), // Set the root explicitly to the project directory
    publicDir: path.resolve(__dirname, "public"), // Define the path for the public directory
    build: {
      outDir: path.resolve(__dirname, "dist"), // Ensure the output is placed in the correct directory
      emptyOutDir: true, // Clear the output directory before each build
      target: "esnext", // Use the latest ES features
      minify: mode === "production" ? "esbuild" : false, // Minify only in production mode
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom"], // Split vendor libraries into a separate chunk
          },
        },
      },
    },
    server: {
      port: 3000, // Set the development server port
      proxy: {
        "/api": {
          target: "http://localhost:5000", // Proxy API requests to the backend server
          changeOrigin: true,
          ws: true, // Enable WebSocket proxying
        },
      },
      hmr: {
        overlay: false, // Disable error overlay in the browser
      },
      watch: {
        usePolling: false, // Disable polling for file changes
        interval: 100, // Set the interval for file change detection
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"), // Use "@" as a shorthand for the source directory
      },
    },
    optimizeDeps: {
      include: ["react", "react-dom"], // Pre-bundle dependencies for faster development
    },
    esbuild: {
      logOverride: { "this-is-undefined-in-esm": "silent" }, // Suppress specific warnings from esbuild
    },
  })
);
