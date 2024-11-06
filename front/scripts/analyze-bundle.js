import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { build } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

async function analyzeBuild() {
  try {
    await build({
      root: resolve(__dirname, '..'),
      plugins: [
        visualizer({
          filename: 'stats.html',
          open: true,
          gzipSize: true,
          brotliSize: true
        })
      ],
      build: {
        reportCompressedSize: true
      }
    });
  } catch (error) {
    console.error('Build analysis failed:', error);
    process.exit(1);
  }
}

analyzeBuild();