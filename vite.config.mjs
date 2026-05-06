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
        target: 'https://192.168.1.124:7137',
        changeOrigin: true,
        secure: false
      },
      '/hubs': {
        target: 'https://192.168.1.124:7137',
        changeOrigin: true,
        secure: false,
        ws: true // Enable WebSocket proxying
      }
    }
  }
});
