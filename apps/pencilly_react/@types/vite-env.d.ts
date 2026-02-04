/// <reference types="vite/client" />

interface ViteTypeOptions {
    // By adding this line, you can make the type of ImportMetaEnv strict
    // to disallow unknown keys.
    // strictImportMetaEnv: unknown
}

interface ImportMetaEnv {
    readonly VITE_GOOGLE_CLIENT_ID: string
    readonly VITE_APPLE_CLIENT_ID: string
    readonly VITE_API_URL: string
    readonly VITE_SITE_URL: string
    readonly VITE_PORT: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}


