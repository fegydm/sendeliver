// File: front/vite.config.ts
// Last change: Added static file handling and improved public dir config

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
    plugins: [react()],

    root: path.resolve(__dirname),
    base: '/', // Ensure proper base path for assets
    publicDir: path.resolve(__dirname, "public"), // Use absolute path

    build: {
        cssCodeSplit: false,
        outDir: path.resolve(__dirname, "dist"),
        emptyOutDir: true,
        target: "esnext",
        minify: "esbuild",
        sourcemap: false,
        assetsDir: 'assets', // Define assets directory in build
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, 'index.html'),
            },
            output: {
                assetFileNames: 'assets/[name].[ext]' // Keep original file names
            }
        }
    },

    server: {
        port: 3000,
        strictPort: true,
        open: true,
        proxy: {
            "/api": {
                target: "http://localhost:5000",
                changeOrigin: true,
                configure: (proxy) => {
                    proxy.on("error", (err, req, res) => {
                        console.error(`Proxy error: ${err.message}`);
                        res.writeHead(500, {
                            "Content-Type": "text/plain",
                        });
                        res.end("Proxy server error.");
                    });
                },
            }
        },
        fs: {
            strict: false, // Allow accessing files outside of root
            allow: [
                path.resolve(__dirname), // Allow access to entire project
                path.resolve(__dirname, "src"),
                path.resolve(__dirname, "public"),
            ],
        },
    },

    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
        },
    },

    optimizeDeps: {
        include: ["react", "react-dom"],
    },
});

console.log("Vite config loaded for:", __dirname);
console.log("Public dir path:", path.resolve(__dirname, "public"));