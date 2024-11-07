// ./front/configs/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import { visualizer } from 'rollup-plugin-visualizer';

const frontDir = path.resolve(__dirname, '..');

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    svgr(),
    tsconfigPaths(),
    command === 'build' && visualizer(), // Použitie pluginu len pri build príkaze
  ].filter(Boolean), // Odstránenie `undefined` hodnôt
  root: frontDir,
  publicDir: path.resolve(frontDir, 'public'), // Absolútna cesta pre `publicDir`
  css: {
    postcss: path.resolve(__dirname, './postcss.config.cjs'), // Uisti sa, že prípona je správna
  },
  build: {
    outDir: path.resolve(frontDir, 'dist'), // Absolútna cesta pre `outDir`
    assetsDir: 'assets',
    sourcemap: false, // Vypnutie sourcemaps pre rýchlejší produkčný build
    chunkSizeWarningLimit: 1000, // Zvýšenie limitu pre varovanie o veľkosti chunku
  },
  resolve: {
    alias: {
      '@': path.resolve(frontDir, 'src'),
      '@configs': path.resolve(frontDir, 'configs'),
    }
  },
  optimizeDeps: {
    include: ['lottie-web/build/player/lottie_light.min']
  },
  server: {
    port: 3000,
    open: true,
    watch: {
      usePolling: true
    },
    hmr: {
      overlay: true
    }
  },
  define: {
    VITE_PROD_ONLY: command === 'build'
  }
}));
