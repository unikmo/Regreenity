import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: ['pilot-simulator/index.html'],
    },
  },
})
