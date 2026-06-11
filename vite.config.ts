import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig(({ command }) => {
  const isDev = command === 'serve'
  const isProd = command === 'build'

  return {
    base: isProd ? './' : '/',
    plugins: [react()],
    server: {
      proxy: isDev ? {
        '/api': 'http://localhost:8080',
      } : undefined,
    },
    build: {
      outDir: 'dist',
      sourcemap: !isProd,
    },
    define: {
      __API_URL__: isProd ? JSON.stringify('/api') : JSON.stringify('http://localhost:8080'),
    },
  }
})