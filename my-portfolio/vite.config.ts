import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { configDefaults } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    exclude: [...configDefaults.exclude, '**/node_modules/**'],
  },
  
  define: {
    'process.env': process.env
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "../styles/variables.scss";`
      }
    }
  }
})
