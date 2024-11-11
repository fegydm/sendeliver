// ./front/configs/vite.config.mts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import { visualizer } from 'rollup-plugin-visualizer';

const frontDir = path.resolve(__dirname, '..');

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), svgr(), tsconfigPaths(), command === 'build' && visualizer()].filter(
      Boolean
    ),
    root: frontDir,
    publicDir: path.resolve(frontDir, 'public'),
    css: {
      postcss: path.resolve(__dirname, './postcss.config.cjs'),
      modules: {
        localsConvention: 'camelCase',
      },
    },
    build: {
      outDir: path.resolve(frontDir, 'dist'),
      assetsDir: 'assets',
      sourcemap: mode === 'development',
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            lottie: ['lottie-web'],
            lucide: ['lucide-react'],
            utils: ['@/utils'],
            components: ['@/components'],
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(frontDir, 'src'),
        '@configs': path.resolve(frontDir, 'configs'),
      },
    },
    server: {
      port: 3000,
      strictPort: true,
      host: true,
      open: true,
      watch: {
        usePolling: true,
      },
      hmr: {
        overlay: true,
      },
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
      'import.meta.env.VITE_AI_API_URL': JSON.stringify(
        mode === 'production'
          ? 'https://sendeliver.com/api/ai/chat'
          : 'http://localhost:5000/api/ai/chat'
      ),
      'import.meta.env.PROD': mode === 'production',
      'import.meta.env.DEV': mode === 'development',
    },
  };
});
