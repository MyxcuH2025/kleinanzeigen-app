import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
// import type { Ad } from './services/adService'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false, // Source-Maps aktivieren für besseres Debugging
    rollupOptions: {
      output: {
        sourcemapExcludeSources: true,
        // OPTIMIERT: Manual Chunks für besseres Code-Splitting
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'mui-vendor': ['@mui/material', '@mui/icons-material', '@mui/system', '@emotion/react', '@emotion/styled'],
          
          // Feature chunks
          'admin': [
            './src/components/AdminDashboard_Optimized.tsx',
            './src/pages/AdminVerificationPage.tsx'
          ],
          'chat': [
            './src/pages/ChatPage.tsx'
          ],
          'dashboard': [
            './src/pages/DashboardPage.tsx',
            './src/pages/DashboardPage_Optimized.tsx'
          ],
          'listings': [
            './src/components/ListingDetailNextLevel.tsx',
            './src/components/CreateListing_Optimized.tsx',
            './src/components/EditListing.tsx',
            './src/pages/ListingsPage.tsx'
          ],
          'forms': [
            './src/components/LoginForm.tsx',
            './src/components/RegisterForm.tsx',
            './src/components/PasswordResetRequest.tsx'
          ]
        }
      }
    },
    // OPTIMIERT: Chunk-Größe-Warnungen erhöhen
    chunkSizeWarningLimit: 1000
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
