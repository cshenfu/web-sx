import { defineConfig, mergeConfig } from 'vite'
import baseConfig from './vite.config.js'

export default defineConfig((cfg) =>
  mergeConfig(
    typeof baseConfig === 'function' ? baseConfig(cfg) : baseConfig,
    {
      base: '/',
      build: {
        outDir: 'dist',       // ✅ 固定 dist，和 Dockerfile 对齐
        emptyOutDir: true,    // 防止残留文件
      },
    }
  )
)