import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    build: {
      rollupOptions: {
        // Two separate windows, each with their own HTML entry point
        input: {
          overlay: resolve(__dirname, 'src/renderer/overlay.html'),
          panel:   resolve(__dirname, 'src/renderer/panel.html'),
        }
      }
    },
    plugins: [react(), tailwindcss()]
  }
})
