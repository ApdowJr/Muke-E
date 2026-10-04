import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // The hosted preview terminates the HTTP connection before Vite's
      // WebSocket upgrade can complete. Disable HMR at the Vite config level
      // so the client is never injected into the preview HTML.
      hmr: false,
      watch: null,
    },
  };
});
