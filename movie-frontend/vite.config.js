import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/vienna-cinema_online/', // 這裡一定要對應你的 GitHub 儲存庫名稱
})