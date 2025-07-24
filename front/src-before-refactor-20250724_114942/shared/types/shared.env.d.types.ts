// File: src/shared/types/shared.env.d.types.ts

declare global {
  interface ImportMetaEnv {
    readonly VITE_AI_API_URL: string;      // AI service base URL
    readonly VITE_API_URL: string;         // Backend API URL
    // Add additional VITE_ vars here…
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;           // expose env under import.meta.env
  }
}

export {};  // ensure this file is treated as a module
