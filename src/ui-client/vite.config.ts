import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // Проксі для API запитів до бекенду
      '/api': {
        target: 'http://localhost:80', // Адреса вашого бекенду
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: '../Gateway.Yarp/wwwroot', // Вказуємо вихідну папку для збілдженого фронтенду
    emptyOutDir: true, // Очищаємо папку перед білдом
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Автоматично імпортуємо змінні у всі SCSS файли
        // Через path.resolve виникла проблема з Docker, тому спробуємо інакше
        additionalData: `@use "${fileURLToPath(new URL('./src/assets/styles/_variables.scss', import.meta.url))}" as *;\n`, 
      },
    },
  },
})
