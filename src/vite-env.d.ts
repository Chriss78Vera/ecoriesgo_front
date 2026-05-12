/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly BACK_ECORIESGO?: string;
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
