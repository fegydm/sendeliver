import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],

    root: __dirname,
    publicDir: path.resolve(__dirname, "public"),

    css: {
      postcss: path.resolve(__dirname, "postcss.config.cjs"),
      modules: {
        localsConvention: "camelCase",
        generateScopedName:
          mode === "development" ? "[name]__[local]" : "[hash:base64:5]",
      },
      devSourcemap: true,
    },

    build: {
      outDir: "dist",
      assetsDir: "assets",
      sourcemap: true,
      minify: mode === "production" ? "esbuild" : false,
      target: "esnext",
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom"],
            lottie: ["lottie-web"],
          },
        },
      },
    },

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
      extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
    },

    server: {
      port: 3000,
      strictPort: true,
      host: true,
      open: true,
      proxy: {
        "/api": {
          target: "http://localhost:5000",
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
    },
  };
});
