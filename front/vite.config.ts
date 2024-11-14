import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import type { UserConfig } from "vite";

export default defineConfig(({ mode }): UserConfig => ({
  plugins: [react()],
  root: '.',
  publicDir: './front/public',
  build: {
    outDir: './front/dist',
    emptimport { defineConfig } from "vite";
    import react from "@vitejs/plugin-react";
    import path from "path";
    import type { UserConfig } from "vite";
    
    export default defineConfig(({ mode }): UserConfig => ({
      plugins: [react()],
      root: '.',
      publicDir: './front/public',
      build: {
        outDir: './front/dist',
        emptyOutDir: true,
        // Optimalizácia buildu
        target: 'esnext',
        minify: mode === 'production' ? 'esbuild' : false,
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ['react', 'react-dom'],
            },
          },
        },
      },
      // Optimalizácia dev servera
      server: {
        port: 3000,
        proxy: {
          "/api": {
            target: "http://localhost:5000",
            changeOrigin: true,
            ws: true
          }
        },
        hmr: {
          overlay: false
        },
        watch: {
          usePolling: false,
          interval: 100
        }
      },
      // Optimalizácia resolve
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "./front/src"),
          "@shared": path.resolve(__dirname, "./shared")
        }
      },
      // Optimalizácia cache
      optimizeDeps: {
        include: ['react', 'react-dom'],
        exclude: ['@shared']
      },
      esbuild: {
        logOverride: { 'this-is-undefined-in-esm': 'silent' }
      }
    }));yOutDir: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./front/src"),
      "@shared": path.resolve(__dirname, "./shared")
    }
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        ws: true
      }
    }
  }
}));