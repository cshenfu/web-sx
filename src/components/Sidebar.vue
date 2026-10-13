<template>
  <aside class="sidebar">
    <!-- 顶部菜单 -->
    <template v-for="item in topMenus" :key="item.key">
      <div
        class="sidebar-item"
        :class="{ active: activeKey === item.key }"
        @click="navigate(item)"
      >
        <!-- 使用统一封装的 SvgIcon 组件 -->
        <SvgIcon :name="item.icon" class="item-icon" :size="20" />
        <span class="label-text">{{ item.label }}</span>
      </div>
    </template>

    <!-- 弹性空白：把底部固定菜单推到最下方 -->
    <div class="spacer" />

    <!-- 底部固定菜单 -->
    <template v-for="item in bottomMenus" :key="item.key">
      <div
        class="sidebar-item"
        :class="{ active: activeKey === item.key }"
        @click="navigate(item)"
      >
        <SvgIcon :name="item.icon" class="item-icon" :size="20" />
        <span class="label-text">{{ item.label }}</span>
      </div>
    </template>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { sidebarConfig } from '@/config/sidebar'
// 引入统一封装的图标组件
import SvgIcon from '@/components/icons/SvgIcon.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 当前使用的侧边栏配置 key
const sidebarKey = computed(() => {
  return route.meta.sidebar || ''
})

// 当前激活的菜单 key
const activeKey = computed(() => {
  return route.meta.key || ''
})

// 当前用户角色
const currentRole = computed(() => {
  return userStore.role
})

// 当前侧边栏所有菜单（过滤掉分割线和无权限的项）
const allMenus = computed(() => {
  const menus = sidebarConfig[sidebarKey.value] || []
  return menus
    .filter((item) => item.type !== 'divider')
    .filter((item) => {
      return item.roles?.includes(currentRole.value)
    })
})

// 普通菜单（非固定）
const topMenus = computed(() => {
  return allMenus.value.filter((item) => !item.fixed)
})

// 固定在底部的菜单
const bottomMenus = computed(() => {
  return allMenus.value.filter((item) => item.fixed)
})

// 菜单跳转
function navigate(item) {
  router.push(item.path)
}
</script>

<style scoped>
.sidebar {
  width: 97px;
  height: 100%;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 6px;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
  background: #fff;
  border: none;
}

.sidebar::-webkit-scrollbar {
  display: none;
}

.sidebar-item {
  width: 100%;
  height: 60px; /* 图标+文字纵向排列需要更高的高度 */
  box-sizing: border-box;
  display: flex;
  flex-direction: column; /* 【核心】纵向：图标在上，文字在下 */
  align-items: center;
  justify-content: center;
  padding: 6px 4px;
  margin-bottom: 6px;
  gap: 4px; /* 图标和文字之间的间距 */
  
  color: #64748b;
  cursor: pointer;
  user-select: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  border-left: none;
}

.sidebar-item:hover {
  background: #f8fafc;
  color: #2563eb;
}

/* 选中状态 */
.sidebar-item.active {
  color: #2563eb;
  background: #f1f5f9;
  border-radius: 8px;
  font-weight: 600;
}

/* 图标容器 */
.item-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 文字样式：单行显示，12px */
.label-text {
  font-size: 12px;
  line-height: 1;
  white-space: nowrap; /* 强制单行 */
  text-align: center;
}

.spacer {
  flex: 1;
}
</style>