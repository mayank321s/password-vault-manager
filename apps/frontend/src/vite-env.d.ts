/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_ENV: string
  readonly VITE_SESSION_TIMEOUT: string
  readonly VITE_AUTO_LOCK_TIMEOUT: string
  readonly VITE_ENABLE_SEED_PHRASE_RECOVERY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
