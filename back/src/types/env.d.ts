// back/src/types/env.d.ts
interface ImportMetaEnv {
  readonly VITE_AI_API_URL: string;
  readonly VITE_API_URL: string; // Backend API URL
  // Add additional environment variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
