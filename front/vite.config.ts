// File: front/vite.config.ts
// Last change: Added rollup-plugin-visualizer for bundle analysis (temporarily disabled)

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
    // Plugins configuration
    plugins: [
        react(), // React plugin for Vite
        // Temporarily disable rollup-plugin-visualizer
        // visualizer({
        //     filename: "bundle-analysis.html", // Path to the analysis report
        //     open: true, // Automatically open the report in the browser after build
        //     gzipSize: true, // Include gzip size in the report
        //     brotliSize: true, // Include brotli size in the report
        // }),
    ],

    // Root directory configuration
    root: path.resolve(__dirname), // Root directory of the project
    base: '/', // Base path for assets (ensures proper paths in production)
    publicDir: "public", // Directory for static files (relative to root)

    // Build configuration
    build: {
        outDir: "dist", // Output directory for build files
        emptyOutDir: true, // Clear output directory before building
        cssCodeSplit: false, // Disable CSS splitting (useful for smaller projects)
        target: "esnext", // Target modern browsers with ES modules
        minify: "esbuild", // Use esbuild for faster minification
        sourcemap: false, // Disable source maps in production
        assetsDir: 'assets', // Subdirectory for assets in the output
        rollupOptions: {
            // Rollup-specific configuration
            input: {
                main: path.resolve(__dirname, "index.html"), // Main HTML entry point
            },
            output: {
                assetFileNames: "assets/[name].[ext]", // Maintain original asset file names
            },
        },
    },

    // Development server configuration
    server: {
        port: 3000, // Port for the development server
        strictPort: true, // Fail if the port is not available
        open: true, // Automatically open the browser when the server starts
        proxy: {
            // Proxy configuration for API requests
            "/api": {
                target: "http://localhost:5000", // API server target
                changeOrigin: true, // Adjust origin for proxy requests
                configure: (proxy) => {
                    // Handle proxy errors
                    proxy.on("error", (err, req, res) => {
                        console.error(`Proxy error: ${err.message}`);
                        res.writeHead(500, {
                            "Content-Type": "text/plain",
                        });
                        res.end("Proxy server error.");
                    });
                },
            },
        },
        fs: {
            strict: false, // Allow accessing files outside of the root directory
            allow: [
                path.resolve(__dirname, "src"), // Allow access to src directory
                path.resolve(__dirname, "public"), // Allow access to public directory
            ],
        },
    },

    // Module resolution configuration
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"), // Alias for the src directory
        },
    },

    // Dependency optimization
    optimizeDeps: {
        include: ["react", "react-dom"], // Pre-bundle React dependencies for faster development
    },
});

// Logging for debugging
console.log("Vite config loaded for:", __dirname);
console.log("Public dir path:", path.resolve(__dirname, "public"));