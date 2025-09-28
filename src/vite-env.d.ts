/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID: string
  readonly VITE_GOOGLE_CLIENT_SECRET: string
  readonly VITE_GOOGLE_REDIRECT_URI: string
  readonly VITE_ENOKI_PUBLIC_KEY: string
  readonly VITE_ENOKI_PRIVATE_KEY: string
  readonly VITE_PACKAGE_ID: string
  readonly VITE_SEAL_API_KEY: string
  readonly VITE_SEAL_API_URL: string
  readonly VITE_WALRUS_API_KEY: string
  readonly VITE_WALRUS_API_URL: string
  readonly VITE_SUI_NETWORK: string
  readonly VITE_SUI_RPC_URL: string
  readonly VITE_QUIZ_MODULE: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_DESCRIPTION: string
  readonly VITE_APP_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
