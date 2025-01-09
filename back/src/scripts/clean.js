// .back/scripts/clean.js
import { existsSync, rmSync } from 'fs';
import { join } from 'path';

const paths = [
  'back/dist',
  'front/dist',
  'node_modules',
  'back/node_modules',
  'front/node_modules',
  'back/package-lock.json',
  'front/package-lock.json',
  'package-lock.json'
];

paths.forEach(path => {
  const fullPath = join(process.cwd(), path);
  if (existsSync(fullPath)) {
    rmSync(fullPath, { recursive: true, force: true });
    console.log(`Cleaned: ${path}`);
  }
});