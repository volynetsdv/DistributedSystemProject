import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../Gateway.Yarp/wwwroot', // Вказуємо вихідну папку для зібраного фронтенду
    emptyOutDir: true, // Очищаємо папку перед збіркою
  },
})
