import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // <<-- Corregido aquí

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Builder_EvilTokkii/',
})
