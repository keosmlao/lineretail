import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),],
  server: {
    allowedHosts: [
      'a67c587bd0b4.ngrok-free.app' // ✅ ใส่ ngrok URL ที่คุณใช้
    ],
    host: true, // หรือใส่เป็น '0.0.0.0'
    port: 80,
     proxy: {
      '/api': 'http://localhost:5000', // ✅ ต้องตรงกับ backend
    },
  }
})
