import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { odsDrivePortfolioPlugin } from './server/viteDriveApiPlugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), odsDrivePortfolioPlugin(__dirname)],
  server: {
    port: 3000,
    open: false,
    watch: {
      ignored: ['**/public/uploads/**', '**/server/data/**'],
    },
  },
  preview: {
    host: '0.0.0.0',
    port: Number(process.env.PORT) || 3000,
    allowedHosts: true,
  },
});
