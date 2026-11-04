import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Builder_EvilTokkii/',
  server: {
    proxy: {
      '/twitch-eventsub-ws': {
        target: 'https://18.164.13.71',
        changeOrigin: true,
        ws: true,
        headers: {
          Host: 'eventsub.wss.twitch.tv'
        },
        rewrite: (path) => path.replace(/^\/twitch-eventsub-ws/, '/ws'),
        secure: false
      },
      '/Builder_EvilTokkii/twitch-eventsub-ws': {
        target: 'https://18.164.13.71',
        changeOrigin: true,
        ws: true,
        headers: {
          Host: 'eventsub.wss.twitch.tv'
        },
        rewrite: (path) => path.replace(/^\/Builder_EvilTokkii\/twitch-eventsub-ws/, '/ws'),
        secure: false
      }
    }
  }
})
