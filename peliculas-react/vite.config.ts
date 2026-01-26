import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'




export default defineConfig({
  plugins: [react(),
     tailwindcss(),
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://localhost:7189',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
});