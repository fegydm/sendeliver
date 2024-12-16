// ./front/src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // you can add more env here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
