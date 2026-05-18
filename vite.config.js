import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api-redcap': {
        target: 'https://redcap.araucaniasur.cl',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-redcap/, '/api/'),
      },
    },
  },
})
