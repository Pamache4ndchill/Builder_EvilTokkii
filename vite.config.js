import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Builder_EvilTokkii/',
  server: {
    proxy: {
      '/twitch-eventsub-ws': {
        target: 'https://eventsub.wss.twitch.tv',
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/twitch-eventsub-ws/, '/ws'),
        secure: true
      },
      '/Builder_EvilTokkii/twitch-eventsub-ws': {
        target: 'https://eventsub.wss.twitch.tv',
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/Builder_EvilTokkii\/twitch-eventsub-ws/, '/ws'),
        secure: true
      }
    }
  }
})
