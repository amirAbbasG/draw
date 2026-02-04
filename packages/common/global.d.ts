/// <reference types="vite/client" />
import "@excalidraw/excalidraw/env";
import "@excalidraw/excalidraw/global";
import "@excalidraw/excalidraw/vite-env";
import "@excalidraw/excalidraw/css";

interface ImportMetaEnv {
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  // Add any other environment variables used by the packages
  readonly VITE_APP_PORT?: string;
  readonly VITE_APP_BACKEND_V2_GET_URL?: string;
  readonly VITE_APP_BACKEND_V2_POST_URL?: string;
  readonly VITE_APP_LIBRARY_URL?: string;
  readonly VITE_APP_LIBRARY_BACKEND?: string;
  readonly VITE_APP_WS_SERVER_URL?: string;
  readonly VITE_APP_PORTAL_URL?: string;
  readonly VITE_APP_AI_BACKEND?: string;
  readonly VITE_APP_FIREBASE_CONFIG?: string;
  readonly FAST_REFRESH?: string;
  readonly PKG_NAME?: string;
  readonly PKG_VERSION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
