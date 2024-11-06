// front/config/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    svgr()
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src'),
      '@components': resolve(__dirname, '../src/components'),
      '@hooks': resolve(__dirname, '../src/hooks'),
      '@lib': resolve(__dirname, '../src/lib'),
      '@services': resolve(__dirname, '../src/services'),
      '@stores': resolve(__dirname, '../src/stores'),
      '@utils': resolve(__dirname, '../src/utils'),
      '@views': resolve(__dirname, '../src/views'),
      '@assets': resolve(__dirname, '../src/assets'),
      '@providers': resolve(__dirname, '../src/providers'),
      '@types': resolve(__dirname, '../src/types')
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/ws': {
        target: process.env.VITE_WS_URL || 'ws://localhost:5000',
        ws: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            'react',
            'react-dom',
            'react-router-dom'
          ]
        }
      }
    }
  }
});