import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server:{
    port: 3000,
    oprn: true,
    cors:true
  },
  define:{
__API_BASE_URL__: JSON.stringify('http://localhost:4000/api/v1')
  }
})
