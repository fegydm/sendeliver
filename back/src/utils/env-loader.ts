// File: back/src/utils/env-loader.ts
// Last change: Replace dotenv with custom environment loader

import { readFileSync } from 'fs';
import { resolve } from 'path';

export function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), '.env');
    const envFile = readFileSync(envPath, 'utf8');
    
    envFile.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '');
          process.env[key.trim()] = value;
        }
      }
    });
    
    console.log('[ENV] Environment variables loaded from .env');
  } catch (error) {
    console.log('[ENV] No .env file found, using system environment');
  }
}