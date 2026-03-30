import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 修改這行：這是一個神奇的設定，它會讓你的 public 資料夾裡的所有圖片，
  // 無論在本機還是 GitHub 上，前面都自動加上正確的專案名稱
  base: '/vienna-cinema_online/', 
})