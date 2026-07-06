import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // ถ้าใช้ custom domain ของตัวเอง (มีไฟล์ public/CNAME) ให้ base เป็น "/"
  // ถ้าใช้ลิงก์ default ของ GitHub Pages (username.github.io/ชื่อ-repo) ให้เปลี่ยนเป็น "/ชื่อ-repo/"
  base: "/soicex-cookierun-hub/",
})
