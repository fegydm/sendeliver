import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Handle cleanup on process termination
process.on('SIGINT', () => {
  console.log('\nGracefully shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nGracefully shutting down...');
  process.exit(0);
});

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'cleanup-plugin',
      enforce: 'post',
      closeBundle() {
        // Cleanup tasks when build ends
      }
    }
  ],

  root: path.resolve(__dirname),
  base: '/',
  publicDir: "public",

  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true, // Enable for better debugging capabilities
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove console.logs in production while keeping other console methods
        pure_funcs: ['console.log'],
        drop_console: false,
      },
    },
  },

  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, _options) => {
          // Handle proxy errors with custom message
          proxy.on('error', (err, _req, res) => {
            console.log('proxy error', err);
            res.writeHead(500, {
              'Content-Type': 'text/plain',
            });
            res.end('Something went wrong. And we are reporting a custom error message.');
          });

          // Log outgoing requests
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });

          // Log incoming responses
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });

          // Cleanup proxy on exit
          process.on('SIGINT', () => {
            proxy.close();
          });
        },
      },
      "/api/geo/country_formats": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => {
          // postal code format
          const match = path.match(/\/api\/geo\/country_formats\/(.*)$/);
          return match ? `/api/geo/country_formats?cc=${match[1]}` : path;
        }
      }
    },
  },

  // Path aliases for cleaner imports
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  // Dependencies to pre-bundle
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
});