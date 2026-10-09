<template>
  <header class="app-header">
    <div class="header-left">
      <img src="@/assets/logo.png" alt="华电集团" class="logo" />

      <div class="divider" />

      <div class="company-info">
        <span class="company-name">华电陕西能源有限公司</span>
        <span class="company-en">HUADIAN SHAANXI ENERGY CO., LTD.</span>
      </div>
    </div>

    <div class="platform-title">新能源项目前期工作AI平台</div>

    <nav class="module-nav">
      <RouterLink
        v-for="item in navItems"
        :key="item.name"
        :to="item.to"
        class="module-link"
        :class="{ active: isActive(item) }"
      >
        {{ item.label }}
      </RouterLink>
    </nav>

    <div class="header-right">
      <span class="todo">待办(8)</span>

      <el-dropdown trigger="click" @command="handleUserCommand">
        <button class="user-trigger" type="button">
          <span class="username">{{ userName }}</span>
          <el-icon class="arrow"><ArrowDown /></el-icon>
        </button>

        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="logout">退出系统</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import { logout } from '@/api/modules/login'

const route = useRoute()
const router = useRouter()
const userName = ref(sessionStorage.getItem('userName') || '用户名')

const navItems = [
  {
    name: 'qinchuan',
    label: '秦川智筹',
    to: '/overview',
    module: 'qinchuan',
  },
  {
    name: 'yanping',
    label: '研评智坊',
    to: '/yanping',
    module: 'yanping',
  },
  {
    name: 'hucang',
    label: '湖仓汇源',
    to: '/hucang/geology',
    module: 'hucang',
  },
  {
    name: 'guizhi',
    label: '规制中枢',
    to: '/guizhi/role',
    module: 'guizhi',
  },
]

function isActive(item) {
  return route.meta.module === item.module
}

async function handleUserCommand(command) {
  if (command !== 'logout') return

  try {
    await logout()
  } catch (error) {
    // 即使服务端退出接口失败，也清理本地登录态，避免继续使用失效会话。
    console.warn('退出登录接口调用失败：', error)
  } finally {
    sessionStorage.clear()
    localStorage.removeItem('token')
    userName.value = '用户名'
    ElMessage.success('已退出登录')
    router.replace('/login')
  }
}
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  box-sizing: border-box;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.header-left {
  width: 330px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  width: 42px;
  height: 38px;
  object-fit: contain;
}

.divider {
  width: 1px;
  height: 32px;
  background: #d9dfe8;
}

.company-info {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
  white-space: nowrap;
}

.company-name {
  color: #1a3f6f;
  font-size: 13px;
  font-weight: 600;
}

.company-en {
  margin-top: 2px;
  color: #888;
  font-size: 8px;
  letter-spacing: 0.3px;
}

.platform-title {
  flex-shrink: 0;
  margin-right: 42px;
  color: #1a3f6f;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.module-nav {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: stretch;
  justify-content: center;
  gap: 30px;
}

.module-link {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0 5px;
  color: #222;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  transition: color 0.2s ease;
}

.module-link::after {
  content: '';
  position: absolute;
  right: 5px;
  bottom: 0;
  left: 5px;
  height: 3px;
  background: #1677ff;
  border-radius: 3px 3px 0 0;
  transform: scaleX(0);
  transition: transform 0.2s ease;
}

.module-link:hover,
.module-link.active {
  color: #1677ff;
}

.module-link.active::after {
  transform: scaleX(1);
}

.header-right {
  width: 150px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 9px;
  color: #1677ff;
  font-size: 12px;
  white-space: nowrap;
}

.todo {
  padding: 4px 9px;
  color: #374151;
  background: #f3f4f6;
  border-radius: 4px;
}

.user-trigger {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 0;
  border: 0;
  color: #1677ff;
  background: transparent;
  cursor: pointer;
  font: inherit;
}

.username {
  max-width: 90px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.arrow {
  font-size: 12px;
  transition: transform 0.2s ease;
}
</style>