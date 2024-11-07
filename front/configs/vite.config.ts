// ./front/configs/vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import { visualizer } from 'rollup-plugin-visualizer';

const frontDir = path.resolve(__dirname, '..');

export default defineConfig(({ command, mode }) => {
  // Načítanie environment variables
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react(),
      svgr(),
      tsconfigPaths(),
      command === 'build' && visualizer(),
    ].filter(Boolean),
    root: frontDir,
    publicDir: path.resolve(frontDir, 'public'),
    css: {
      postcss: path.resolve(__dirname, './postcss.config.cjs'),
    },
    build: {
      outDir: path.resolve(frontDir, 'dist'),
      assetsDir: 'assets',
      sourcemap: false,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            // Ďalšie chunky podľa potreby
          }
        }
      }
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
      },
      proxy: {
        '/ws': {
          target: 'ws://localhost:5000',
          ws: true,
          changeOrigin: true
        },
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    define: {
      // Zabezpečíme, že všetky environment variables sú dostupné v aplikácii
      'process.env.NODE_ENV': JSON.stringify(mode),
      'import.meta.env.VITE_WS_URL': JSON.stringify(
        mode === 'production'
          ? `wss://${process.env.VITE_HOST || 'sendeliver.onrender.com'}`
          : 'ws://localhost:5000'
      ),
      'import.meta.env.PROD': mode === 'production',
      'import.meta.env.DEV': mode === 'development',
      VITE_PROD_ONLY: command === 'build'
    }
  };
});