<template>
  <aside class="sidebar">
    <!-- 顶部菜单 -->
    <template
      v-for="item in topMenus"
      :key="item.key"
    >
      <div
        class="sidebar-item"
        :class="{ active: activeKey === item.key }"
        @click="navigate(item)"
      >
        <el-icon :size="20">
          <component :is="iconMap[item.icon]" />
        </el-icon>

        <!-- 支持使用 \n 换行 -->
        <span
          v-for="(line, index) in item.label.split('\n')"
          :key="index"
          class="label-line"
        >
          {{ line }}
        </span>
      </div>
    </template>

    <!-- 弹性空白 -->
    <div class="spacer" />

    <!-- 底部固定菜单 -->
    <template
      v-for="item in bottomMenus"
      :key="item.key"
    >
      <div
        class="sidebar-item"
        :class="{ active: activeKey === item.key }"
        @click="navigate(item)"
      >
        <el-icon :size="20">
          <component :is="iconMap[item.icon]" />
        </el-icon>

        <span
          v-for="(line, index) in item.label.split('\n')"
          :key="index"
          class="label-line"
        >
          {{ line }}
        </span>
      </div>
    </template>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { sidebarConfig } from '@/config/sidebar'

import {
  Grid,
  Location,
  Files,
  Document,
  Search,
  TrendCharts,
  Cpu,
  Upload,
  MapLocation,
  Box,
  Connection,
  Cloudy,
  Money,
  Warning,
  Memo,
  UserFilled,
  Collection,
  OfficeBuilding,
  List,
  House,
  Plus,
  Folder,
  Star
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 图标名称与 Element Plus 图标组件的映射
const iconMap = {
  Grid,
  Location,
  Files,
  Document,
  Search,
  TrendCharts,
  Cpu,
  Upload,
  MapLocation,
  Box,
  Connection,
  Cloudy,
  Money,
  Warning,
  Memo,
  UserFilled,
  Collection,
  OfficeBuilding,
  List,
  House,
  Plus,
  Folder,
  Star
}

// 当前使用的侧边栏配置
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

// 当前侧边栏所有菜单
const allMenus = computed(() => {
  const menus = sidebarConfig[sidebarKey.value] || []

  return menus
    .filter((item) => item.type !== 'divider')
    .filter((item) => {
      return item.roles?.includes(currentRole.value)
    })
})

// 普通菜单
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
  width: 56px;
  height: 100%;
  flex-shrink: 0;

  display: flex;
  flex-direction: column;
  align-items: center;

  padding: 8px 0;
  box-sizing: border-box;
  overflow: hidden;

  background: rgba(8, 18, 42, 0.92);
  backdrop-filter: blur(6px);
}

.sidebar-item {
  width: 100%;
  min-height: 54px;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  padding: 10px 4px;
  gap: 3px;

  color: rgba(255, 255, 255, 0.5);
  border-left: 3px solid transparent;

  cursor: pointer;
  user-select: none;
  transition:
    color 0.2s,
    background 0.2s,
    border-color 0.2s;
}

.sidebar-item:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.06);
}

.sidebar-item.active {
  color: #4fc3ff;
  background: rgba(79, 195, 255, 0.12);
  border-left-color: #4fc3ff;
}

.label-line {
  display: block;

  font-size: 11px;
  line-height: 1.2;
  text-align: center;
  white-space: nowrap;
}

.spacer {
  flex: 1;
}
</style>