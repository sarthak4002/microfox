import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '961e-122-173-29-229.ngrok-free.app',
    ],
  },
  // For server-side proxy handling OAuth redirects (if needed)
  // proxy: {
  //   '/api': {
  //     target: 'http://localhost:8000',
  //     changeOrigin: true,
  //   },
  // },
});
