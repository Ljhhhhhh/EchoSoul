import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    publicDir: resolve('resources'), // 配置公共资源目录
    resolve: {
      alias: {
        '@types': resolve('src/types'),
        '@resources': resolve('resources') // 添加资源目录别名
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    publicDir: resolve('resources') // 为预加载脚本也配置公共资源目录
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@': resolve('src/renderer/src'),
        '@types': resolve('src/types')
      }
    },
    plugins: [react()]
  }
})
