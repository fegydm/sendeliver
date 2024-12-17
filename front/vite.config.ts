// .front/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import type { UserConfig } from "vite";

// Vite configuration file
export default defineConfig(
  ({ mode }): UserConfig => ({
    // Plugins configuration
    plugins: [react()],

    // Define root directory and public assets directory
    root: path.resolve(__dirname),
    publicDir: path.resolve(__dirname, "public"),

    // Build configuration
    build: {
      cssCodeSplit: false, // Prevent splitting of CSS into multiple files
      outDir: path.resolve(__dirname, "dist"), // Output directory for built files
      emptyOutDir: true, // Clean the output directory before building
      target: "esnext", // Modern JS target
      minify: mode === "production" ? "esbuild" : false, // Use esbuild only for production
      sourcemap: mode !== "production", // Generate source maps only in non-production
      rollupOptions: {
        output: {
          manualChunks: undefined, // Prevent manual code splitting
        },
      },
    },

    // Development server configuration
    server: {
      port: 3000, // Default development server port
      proxy: {
        // Proxy API calls to backend server
        "/api": {
          target: "http://localhost:5000", // Local backend server
          changeOrigin: true, // Change origin to match backend
          ws: true, // Enable WebSocket proxy
        },
      },
      hmr: {
        overlay: false, // Disable full-screen error overlay
      },
    },

    // CSS configuration
    css: {
      modules: {
        // Scoped CSS name generation
        generateScopedName:
          mode === "production" ? "[hash:base64:8]" : "[name]__[local]",
      },
      devSourcemap: true, // Enable source maps for CSS
    },

    // Path aliases for cleaner imports
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"), // Short alias for ./src
      },
    },

    // Optimize dependencies
    optimizeDeps: {
      include: ["react", "react-dom"], // Pre-bundle core dependencies
    },

    // Define environment-specific configurations
    define: {
      __DEV__: mode !== "production", // Add global variable for development mode
    },
  })
);
