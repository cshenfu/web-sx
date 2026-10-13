import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { fileURLToPath, URL } from 'node:url'

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

    // ⚠️⚠️⚠️ 老方式能生效的关键，必须有 ⚠️⚠️⚠️
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