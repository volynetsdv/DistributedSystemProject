import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

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
        // Використовуємо функцію path.resolve для створення абсолютного шляху, щоб уникнути проблем з контейнерами
        additionalData: `@use "${path.resolve(__dirname, 'src/assets/styles/_variables.scss').replace(/\\/g, '/')}";`, 
      },
    },
  },
})
