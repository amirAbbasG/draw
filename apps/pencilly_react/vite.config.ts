import path from "path";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import * as process from "node:process";

export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@excalidraw/excalidraw": path.resolve(
          __dirname,
          "../../packages/excalidraw/dist/dev"
      ),
    },

  },
  preview: {
    strictPort: true,
    allowedHosts: ["dev.pencilly.us", "pencilly.us"],
  },
  server: {
    watch: {
      // Watch the package source files
      ignored: ["!**/node_modules/@excalidraw/**"],
      usePolling: true,
    },
    strictPort: true,
    host: true,
    port: Number(process.env.VITE_PORT || "3000") || 3000,
    fs: {
      strict: false, // allow serving files outside project root if needed
    },
  },
});
