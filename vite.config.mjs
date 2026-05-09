import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://10.0.22.187:7137',
        changeOrigin: true,
        secure: false
      },
      '/hubs': {
        target: 'http://10.0.22.187:7137',
        changeOrigin: true,
        secure: false,
        ws: true // Enable WebSocket proxying
      },
      '/uploads': {
        target: 'http://10.0.22.187:7137',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
