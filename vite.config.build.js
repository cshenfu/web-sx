import { defineConfig, mergeConfig } from 'vite'
import baseConfig from './vite.config.js'

const env = process.env.NODE_ENV || 'production'

export default defineConfig((cfg) =>
  mergeConfig(
    typeof baseConfig === 'function' ? baseConfig(cfg) : baseConfig,
    {
      base: '/',                                  // 打包用绝对路径
      build: {
        outDir: `dist-${env}`,                    // dist-test / dist-production
      },
    }
  )
)