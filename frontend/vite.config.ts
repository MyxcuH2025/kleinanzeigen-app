import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
// import type { Ad } from './services/adService'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false, // Source-Maps deaktivieren für bessere Performance
    rollupOptions: {
      output: {
        sourcemapExcludeSources: true
      }
    }
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
      '/ads': 'http://localhost:8000',
      '/categories': 'http://localhost:8000',
      '/users': 'http://localhost:8000',
      '/favorites': 'http://localhost:8000',
    },
    allowedHosts: [
      "guild-consoles-marks-south.trycloudflare.com"
    ]
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'src': path.resolve(__dirname, 'src'),
    },
  }
})
