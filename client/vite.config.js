import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // ── Local Development: proxy API & uploads to Express server ──────────
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },

  // ── Production Build Settings ──────────────────────────────────────────
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Chunk warnings above 700 kB
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // Split vendor chunks for faster caching
        manualChunks: {
          react: ['react', 'react-dom'],
          router: ['react-router-dom'],
          icons: ['lucide-react'],
        },
      },
    },
  },
});
