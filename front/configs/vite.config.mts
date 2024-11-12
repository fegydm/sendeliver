// ./front/configs/vite.config.mts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer'; // Vizualizácia chunky

<<<<<<< HEAD
// Definovanie cesty k priečinku front
const frontDir = path.resolve(__dirname, '..');

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // Pluginy
=======
// Convert ES module URL to file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontDir = path.resolve(__dirname, "..");

export default defineConfig(({ command, mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), "");

  return {
    // Plugins configuration
>>>>>>> 5430219 (up css)
    plugins: [
      react(),
      command === 'build' && visualizer({ filename: 'dist/stats.html', open: true }),
    ].filter(Boolean),

<<<<<<< HEAD
    // Nastavenie root adresára a verejných súborov
    root: frontDir,
    publicDir: path.resolve(frontDir, 'public'),

    // CSS konfigurácia
=======
    // Root directory configuration
    root: frontDir,
    publicDir: path.resolve(frontDir, "public"),

    // CSS configuration
>>>>>>> 5430219 (up css)
    css: {
      postcss: path.resolve(__dirname, './postcss.config.cjs'),
      modules: {
        localsConvention: 'camelCase', // Použitie camelCase pre názvy CSS tried
      },
    },

<<<<<<< HEAD
    // Konfigurácia buildu
=======
    // Build configuration
>>>>>>> 5430219 (up css)
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

<<<<<<< HEAD
    // Konfigurácia aliasov pre jednoduchší import
=======
    // Path resolution configuration
>>>>>>> 5430219 (up css)
    resolve: {
      alias: {
        '@': path.resolve(frontDir, 'src'),
        '@configs': path.resolve(frontDir, 'configs'),
      },
    },

<<<<<<< HEAD
    // Konfigurácia servera pre vývoj
=======
    // Development server configuration
>>>>>>> 5430219 (up css)
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

<<<<<<< HEAD
    // Definovanie premenných prostredia
=======
    // Environment variable definitions
>>>>>>> 5430219 (up css)
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
