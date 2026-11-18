import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { fileURLToPath, URL } from 'node:url'
// 👇 1. 引入 polyfill 插件
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { bundleAnalysisPlugin } from './build-analysis-plugin.js'

// ✅ cross-env 注入的 Node 环境变量
const env = process.env.NODE_ENV || 'development'
const isProd = env === 'production'

export default defineConfig(({ mode }) => {
  // 加载 .env.[mode]，Node 端可用
  loadEnv(mode, process.cwd(), '')

  return {
    base: './',

    plugins: [
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
      // 👇 2. 注入 Node.js Polyfill
      nodePolyfills({
        // 针对 @aws-sdk 需要的模块进行 polyfill
        include: ['util', 'stream', 'crypto', 'buffer', 'process'],
        globals: {
          Buffer: true, // 修复部分 aws-sdk 需要的 Buffer
          global: true,
          process: true,
        },
      }),
      // 仅在 npm run build:analyze 时生成模块体积报告
      ...(process.env.ANALYZE === 'true' ? [bundleAnalysisPlugin()] : []),
    ],

    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },

    server: {
      port: 3201,
      host: true,
      proxy: {
        '/api': {
          target: 'https://testmapi.wh-ge.com',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api/, ''),
        },
      },
    },

    define: {
      'process.env.NODE_ENV': JSON.stringify(env),
      'process.env.VITE_APP_ENV': JSON.stringify(env),
      'process.env': JSON.stringify({ NODE_ENV: env }),
    },

    build: {
      chunkSizeWarningLimit: 3000,
      // 默认关闭 Source Map，减少测试/生产构建的生成耗时；需要排查线上代码时可设置 BUILD_SOURCEMAP=true
      sourcemap: process.env.BUILD_SOURCEMAP === 'true',
      // 使用 Vite 默认的 esbuild 压缩器，并关闭 gzip 体积统计，减少构建结束阶段的额外耗时
      minify: 'esbuild',
      cssMinify: 'esbuild',
      reportCompressedSize: false,
    },
  }
})