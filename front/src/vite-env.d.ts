// ./front/src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // tu môžeš pridať ďalšie env variables ak ich budeš potrebovať
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
