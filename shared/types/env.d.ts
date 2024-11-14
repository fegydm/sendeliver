// shared/types/env.d.ts
interface ImportMetaEnv {
    readonly VITE_AI_API_URL: string
    // pridajte ďalšie env premenné
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }