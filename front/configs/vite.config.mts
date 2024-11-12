// ./front/configs/vite.config.mts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer'; // Vizualizácia chunky

// Definovanie cesty k priečinku front
const frontDir = path.resolve(__dirname, '..');

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // Pluginy
    plugins: [
      react(),
      command === 'build' && visualizer({ filename: 'dist/stats.html', open: true }),
    ].filter(Boolean),

    // Nastavenie root adresára a verejných súborov
    root: frontDir,
    publicDir: path.resolve(frontDir, 'public'),

    // CSS konfigurácia
    css: {
      postcss: path.resolve(__dirname, './postcss.config.cjs'),
      modules: {
        localsConvention: 'camelCase', // Použitie camelCase pre názvy CSS tried
      },
    },

    // Konfigurácia buildu
    build: {
      outDir: path.resolve(frontDir, 'dist'),
      assetsDir: 'assets',
      sourcemap: mode === 'development',
      chunkSizeWarningLimit: 1000, // Zvýšený limit pre veľkosť chunky
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            lottie: ['lottie-web'],
            utils: ['@/utils'],
            components: ['@/components'],
          },
        },
      },
    },

    // Konfigurácia aliasov pre jednoduchší import
    resolve: {
      alias: {
        '@': path.resolve(frontDir, 'src'),
        '@configs': path.resolve(frontDir, 'configs'),
      },
    },

    // Konfigurácia servera pre vývoj
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

    // Definovanie premenných prostredia
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
