import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    allowedHosts: [
      '043b614bd36a.ngrok-free.app' // ✅ ใส่ ngrok URL ที่ใช้
    ],
    host: true, // หรือใส่เป็น '0.0.0.0'
    port: 80,
    // proxy: {
    //   '/api': 'http://10.0.10.109:5000', // ✅ ต้องตรงกับ backend
    // },
  },
})