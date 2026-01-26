import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist'
  },
  server: {
    port: 3000,
    open: true
  }
})