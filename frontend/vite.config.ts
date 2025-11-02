// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['sockjs-client', '@stomp/stompjs']
  }
})
