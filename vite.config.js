import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { fileURLToPath, URL } from 'node:url'
// 👇 1. 引入 polyfill 插件
import { nodePolyfills } from 'vite-plugin-node-polyfills'

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
      sourcemap: !isProd,
    },
  }
})