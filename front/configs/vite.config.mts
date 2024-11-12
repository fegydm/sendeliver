// ./front/configs/vite.config.mts
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";
import { visualizer } from "rollup-plugin-visualizer";

// Convert ES module URL to file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontDir = path.resolve(__dirname, "..");

export default defineConfig(({ command, mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), "");

  return {
    // Plugins configuration
    plugins: [
      react(),
      svgr(),
      tsconfigPaths(),
      command === "build" && visualizer(),
    ].filter(Boolean),

    // Root directory configuration
    root: frontDir,
    publicDir: path.resolve(frontDir, "public"),

    // CSS configuration
    css: {
      postcss: path.resolve(__dirname, "./postcss.config.cjs"),
    },

    // Build configuration
    build: {
      outDir: path.resolve(frontDir, "dist"),
      assetsDir: "assets",
      sourcemap: mode === "development",
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom"],
            lottie: ["lottie-web"],
            lucide: ["lucide-react"],
            utils: ["@/utils"],
            components: ["@/components"],
          },
        },
      },
    },

    // Path resolution configuration
    resolve: {
      alias: {
        "@": path.resolve(frontDir, "src"),
        "@configs": path.resolve(frontDir, "configs"),
      },
    },

    // Development server configuration
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
        "/api": {
          target: "http://localhost:5000",
          changeOrigin: true,
          secure: false,
        },
      },
    },

    // Environment variable definitions
    define: {
      "process.env.NODE_ENV": JSON.stringify(mode),
      "import.meta.env.VITE_AI_API_URL": JSON.stringify(
        mode === "production"
          ? "https://sendeliver.com/api/ai/chat"
          : "http://localhost:5000/api/ai/chat"
      ),
      "import.meta.env.PROD": mode === "production",
      "import.meta.env.DEV": mode === "development",
    },
  };
});
