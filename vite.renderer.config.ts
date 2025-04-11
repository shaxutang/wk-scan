import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          antd: ['antd'],
          lodash: ['lodash'],
          pinyin: ['pinyin'],
          react: ['react'],
          reactDom: ['react-dom'],
          reactRouterDom: ['react-router'],
        },
      },
    },
  },
})
