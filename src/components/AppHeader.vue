<template>
  <header class="app-header">
    <!-- 左侧：Logo 和 AI 平台名称 -->
    <div class="header-left">
      <!-- 替换为你指定的路径 -->
      <img src="../../assets/img/logo.png" alt="Logo" class="logo" />
      <div class="platform-title">新能源项目前期工作AI平台</div>
    </div>

    <!-- 中间：导航（绝对居中） -->
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

    <!-- 右侧：用户信息 -->
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
  { name: 'qinchuan', label: '秦川智筹', to: '/overview', module: 'qinchuan' },
  { name: 'yanping', label: '研评智坊', to: '/yanping', module: 'yanping' },
  { name: 'hucang', label: '湖仓汇源', to: '/hucang/geology', module: 'hucang' },
  { name: 'guizhi', label: '规制中枢', to: '/guizhi/role', module: 'guizhi' },
]

function isActive(item) {
  return route.meta.module === item.module
}

async function handleUserCommand(command) {
  if (command !== 'logout') return
  try {
    await logout()
  } catch (error) {
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
  height: 65px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  box-sizing: border-box;
  background: #fff;
  /* 去掉所有边框和阴影，实现视觉上的融为一体 */
  border: none;
  box-shadow: none;
}

/* 【核心修改 1】 左侧占据 flex: 1 空间，左对齐 */
.header-left {
  flex: 1; 
  min-width: 380px; /* 防止缩小的时候内容挤压 */
  display: flex;
  align-items: center;
  gap: 16px;
  justify-content: flex-start;
}

.logo {
  width: 160px; /* 按照你的要求设置为 160px */
  height: auto;
  max-height: 48px; /* 限制一下最大高度，防止撑破 65px 的 header */
  object-fit: contain;
}

.platform-title {
  color: #1a3f6f;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

/* 【核心修改 2】 中间导航取消 flex 分配，自适应宽度 */
.module-nav {
  flex: 0 1 auto; 
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

/* 【核心修改 3】 右侧同样占据 flex: 1 空间，右对齐，确保中间完美居中 */
.header-right {
  flex: 1; 
  min-width: 150px;
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