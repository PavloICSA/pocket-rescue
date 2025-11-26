import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          export: ['html2canvas', 'jspdf'],
          qr: ['qrcode.react'],
        },
      },
    },
    reportCompressedSize: true,
    chunkSizeWarningLimit: 600,
    // Ensure service worker is copied to dist
    copyPublicDir: true,
  },
  server: {
    port: 3000,
    open: true,
  },
})
