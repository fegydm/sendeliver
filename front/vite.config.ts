// File: front/vite.config.ts
// Last change: Fixed 403 error for all src files by adjusting fs settings and base path

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Vite configuration ensuring proper handling of assets and source files
export default defineConfig({
    plugins: [react()],

    root: path.resolve(__dirname), 
    publicDir: "public", // Ensure public assets are correctly served

    build: {
        cssCodeSplit: false,
        outDir: path.resolve(__dirname, "dist"), 
        emptyOutDir: true, 
        target: "esnext", 
        minify: "esbuild", 
        sourcemap: true
    },

    server: {
        port: 3000,
        strictPort: true,
        open: true,
        proxy: {
            "/api": {
                target: "http://localhost:5000",
                changeOrigin: true,
            },
        },
        fs: {
            // Allowing full access to the src folder to avoid 403 errors
            allow: [path.resolve(__dirname, "src"), path.resolve(__dirname, "public")],
        },
    },

    css: {
        modules: {
            generateScopedName: "[name]__[local]__[hash:base64:5]",
        },
        devSourcemap: false // Disabled inline CSS sourcemaps for cleaner development
    },

    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"), 
        },
    },

    optimizeDeps: {
        include: ["react", "react-dom"],
    },

    define: {
        __DEV__: true, 
    },

    base: "/", // Ensure paths are correctly resolved from the root
});
