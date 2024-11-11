/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_WS_URL: string;
    readonly PROD: boolean; // Pridanie vlastnosti PROD
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
