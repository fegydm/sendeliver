// File: vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

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
      },
    },
  ],
  root: path.resolve(__dirname),
  base: '/',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        pure_funcs: ['console.log'],
        drop_console: false,
      },
    },
  },
  server: {
    port: 3001,
    strictPort: true,
    fs: {
      // Allow serving files from front, back, and shared logger
      allow: [
        path.resolve(__dirname),
        path.resolve(__dirname, '../back/src'),
        path.resolve(__dirname, '../shared'),
        path.resolve(__dirname, '../packages/logger/src'),
        path.resolve(__dirname, '../common/dist') // <--- Added: Allow serving files from common/dist
      ],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:10001',
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            console.log('proxy error', err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Something went wrong. And we are reporting a custom error message.');
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
          process.on('SIGINT', () => {
            proxy.close();
          });
        },
      },
      '/api/geo/country_formats': {
        target: 'http://localhost:10000',
        changeOrigin: true,
        secure: false,
        rewrite: (pathStr) => {
          const match = pathStr.match(/\/api\/geo\/country_formats\/(.*)$/);
          return match ? `/api/geo/country_formats?cc=${match[1]}` : pathStr;
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@features': path.resolve(__dirname, 'src/features'),
      '@domains': path.resolve(__dirname, 'src/domains'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@common': path.resolve(__dirname, '../common/dist'), // <--- CRITICAL FIX: Point to common's 'dist'
      'back': path.resolve(__dirname, '../back/src'),
      '@sendeliver/logger': path.resolve(__dirname, '../logger/src')
    },
  },
  assetsInclude: ['**/*.webp'],
});