import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: [
        'index.html',
        'crew-recognition/index.html',
        'service-recovery/index.html',
        'passenger-experience/index.html',
        'social-commerce/index.html',
        'cruise-dashboard/index.html',
        'integration/index.html',
        'pilot/index.html',
        'imprint/index.html',
        'privacy/index.html',
        'terms/index.html',
        'cookies/index.html',
      ],
    },
  },
})
