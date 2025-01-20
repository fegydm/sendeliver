// File: front/vite.config.ts
// Last change: Simplified configuration and added proper error handling for proxy

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
   plugins: [react()],

   root: path.resolve(__dirname),
   base: '/',
   publicDir: "public",

   build: {
       outDir: "dist",
       emptyOutDir: true,
       minify: "esbuild",
       sourcemap: true,  // Dobré mať zapnuté pre debugging
   },

   server: {
       port: 3000,
       strictPort: true,
       proxy: {
           "/api": {
               target: "http://localhost:5000",
               changeOrigin: true,
               secure: false,
               ws: true,
               configure: (proxy, _options) => {
                   proxy.on('error', (err, _req, res) => {
                       console.log('proxy error', err);
                       res.writeHead(500, {
                           'Content-Type': 'text/plain',
                       });
                       res.end('Something went wrong. And we are reporting a custom error message.');
                   });
                   proxy.on('proxyReq', (proxyReq, req, _res) => {
                       console.log('Sending Request to the Target:', req.method, req.url);
                   });
                   proxy.on('proxyRes', (proxyRes, req, _res) => {
                       console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
                   });
               },
           },
       },
   },

   resolve: {
       alias: {
           "@": path.resolve(__dirname, "src"),
       },
   },

   optimizeDeps: {
       include: ["react", "react-dom"],
   },
});