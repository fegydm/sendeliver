// front/configs/vite.config.ts

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'
import { visualizer } from 'rollup-plugin-visualizer'

const frontDir = path.resolve(__dirname, '..')

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    svgr(),
    tsconfigPaths(),
    visualizer()
  ],
  root: frontDir,
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(frontDir, './src')
    }
  },
  server: {
    port: 3000,
    open: true
  },
  // Pridáme template premenné
  define: {
    VITE_PROD_ONLY: command === 'build'
  }
}))