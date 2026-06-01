import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
 server: {
    // This tells Vite to trust the ngrok connection
    allowedHosts: ['tantalizing-roundly-babara.ngrok-free.dev'], 
    hmr: {
      host: 'localhost',
      protocol: 'ws', // Force standard websocket instead of secure wss
      port: 5173,
    },
  },
})
