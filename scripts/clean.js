// .back/scripts/clean.js
import { existsSync, rmSync } from 'fs';
import { join } from 'path';

const paths = [
  'back/dist',
  'front/dist',
  'packages/logger/dist',
  'common/dist', // <-- Pridané
  'node_modules',
  'back/node_modules',
  'front/node_modules',
  'packages/logger/node_modules',
  'common/node_modules', // <-- Pridané
  'back/package-lock.json',
  'front/package-lock.json',
  'packages/logger/package-lock.json',
  'common/package-lock.json', // <-- Pridané
  'package-lock.json'
];

paths.forEach(path => {
  const fullPath = join(process.cwd(), path);
  if (existsSync(fullPath)) {
    rmSync(fullPath, { recursive: true, force: true });
    console.log(`Cleaned: ${path}`);
  }
});