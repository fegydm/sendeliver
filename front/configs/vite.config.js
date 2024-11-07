"use strict";
// front/configs/vite.config.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vite_1 = require("vite");
const plugin_react_1 = __importDefault(require("@vitejs/plugin-react"));
const path_1 = __importDefault(require("path"));
const vite_plugin_svgr_1 = __importDefault(require("vite-plugin-svgr"));
const vite_tsconfig_paths_1 = __importDefault(require("vite-tsconfig-paths"));
const rollup_plugin_visualizer_1 = require("rollup-plugin-visualizer");
const frontDir = path_1.default.resolve(__dirname, '..');
exports.default = (0, vite_1.defineConfig)(({ command }) => ({
    plugins: [
        (0, plugin_react_1.default)(),
        (0, vite_plugin_svgr_1.default)(),
        (0, vite_tsconfig_paths_1.default)(),
        (0, rollup_plugin_visualizer_1.visualizer)()
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
            '@': path_1.default.resolve(frontDir, './src')
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
}));
