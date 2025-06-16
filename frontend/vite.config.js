import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // ✅ IMPORTANT for correct asset paths on Netlify
  server: {
    proxy: {
      '/api': 'http://localhost:5000', // Still works for local dev
    },
  },
});
