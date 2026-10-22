<template>
  <aside v-if="hasSidebar" class="sidebar">
    <!-- 顶部菜单 -->
    <template v-for="item in topMenus" :key="item.key">
      <div
        class="sidebar-item"
        :class="{ active: isActive(item), 'has-children': hasChildren(item) }"
        @click="navigate(item)"
        @mouseenter="onItemEnter(item, $event)"
        @mouseleave="scheduleHide"
      >
        <SvgIcon :name="item.icon" class="item-icon" :size="20" />
        <span class="label-text">{{ item.label }}</span>
      </div>
    </template>

    <!-- 弹性空白 -->
    <div class="spacer" />

    <!-- 底部固定菜单 -->
    <template v-for="item in bottomMenus" :key="item.key">
      <div
        class="sidebar-item"
        :class="{ active: isActive(item), 'has-children': hasChildren(item) }"
        @click="navigate(item)"
        @mouseenter="onItemEnter(item, $event)"
        @mouseleave="scheduleHide"
      >
        <SvgIcon :name="item.icon" class="item-icon" :size="20" />
        <span class="label-text">{{ item.label }}</span>
      </div>
    </template>
  </aside>

  <!-- 二级菜单浮层：Teleport 到 body，不受 sidebar overflow 裁剪 -->
  <Teleport to="body">
    <transition name="submenu-fade">
      <div
        v-if="submenu.visible"
        class="sidebar-submenu"
        :style="{ top: submenu.top + 'px', left: submenu.left + 'px' }"
        @mouseenter="cancelHide"
        @mouseleave="scheduleHide"
      >
        <div
          v-for="child in submenu.children"
          :key="child.key"
          class="submenu-item"
          :class="{ active: activeKey === child.key }"
          @click="navigate(child)"
        >
          {{ child.label }}
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { sidebarConfig } from '@/config/sidebar'
import SvgIcon from '@/components/icons/SvgIcon.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 当前侧边栏配置 key
const sidebarKey = computed(() => route.meta.sidebar || '')

// 当前激活的菜单 key
const activeKey = computed(() => route.meta.key || '')

// 当前用户角色
const currentRole = computed(() => userStore.role)

// 当前侧边栏所有菜单（过滤分割线 + 无权限项）
const allMenus = computed(() => {
  const menus = sidebarConfig[sidebarKey.value] || []
  return menus
    .filter((item) => item.type !== 'divider')
    .filter((item) => !item.roles || item.roles.includes(currentRole.value))
})

// 普通菜单
const topMenus = computed(() => allMenus.value.filter((item) => !item.fixed))

// 底部固定菜单
const bottomMenus = computed(() => allMenus.value.filter((item) => item.fixed))

// 当前是否有侧边栏（sidebarKey 为空 = 该页面不需要侧边栏）
const hasSidebar = computed(() => !!sidebarKey.value)
// 是否含子菜单
function hasChildren(item) {
  return Array.isArray(item.children) && item.children.length > 0
}

// 是否激活：自身 key 命中，或任意子项 key 命中（父项高亮）
function isActive(item) {
  if (activeKey.value === item.key) return true
  if (hasChildren(item)) {
    return item.children.some((child) => child.key === activeKey.value)
  }
  return false
}

// ───────── 二级菜单浮层状态 ─────────
const submenu = ref({
  visible: false,
  top: 0,
  left: 0,
  children: []
})
let hideTimer = null

function onItemEnter(item, event) {
  if (!hasChildren(item)) {
    // 无子菜单的项：立即隐藏浮层（鼠标从有子项的 item 直接滑到别处）
    scheduleHide()
    return
  }
  clearTimeout(hideTimer)

  const rect = event.currentTarget.getBoundingClientRect()
  // 防止浮层超出视口底部（粗略估算浮层高度：子项数 × 36 + padding）
  const estimatedHeight = item.children.length * 36 + 8
  const maxTop = window.innerHeight - estimatedHeight - 8
  const top = Math.max(8, Math.min(rect.top, maxTop))

  submenu.value = {
    visible: true,
    top,
    left: rect.right + 6,
    children: item.children
  }
}

function scheduleHide() {
  clearTimeout(hideTimer)
  // 延迟 150ms，让鼠标能从 item 平滑移动到浮层上
  hideTimer = setTimeout(() => {
    submenu.value.visible = false
  }, 150)
}

function cancelHide() {
  clearTimeout(hideTimer)
}

// 菜单跳转
function navigate(item) {
  if (!item.path) return
  router.push(item.path)
  submenu.value.visible = false
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
  height: 60px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6px 4px;
  margin-bottom: 6px;
  gap: 4px;

  color: #64748b;
  cursor: pointer;
  user-select: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  position: relative;
}

.sidebar-item:hover {
  background: #f8fafc;
  color: #2563eb;
}

/* 选中状态（含父项高亮） */
.sidebar-item.active {
  color: #2563eb;
  background: #f1f5f9;
  border-radius: 8px;
  font-weight: 600;
}

/* 有子菜单的项：右上角小圆点提示 */
.sidebar-item.has-children::after {
  content: '';
  position: absolute;
  top: 8px;
  right: 8px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.4;
}

.sidebar-item.has-children.active::after,
.sidebar-item.has-children:hover::after {
  opacity: 0.9;
}

/* 图标容器 */
.item-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 文字：单行 12px */
.label-text {
  font-size: 12px;
  line-height: 1;
  white-space: nowrap;
  text-align: center;
}

.spacer {
  flex: 1;
}

/* ───────── 二级菜单浮层 ───────── */
.sidebar-submenu {
  position: fixed;
  z-index: 2000;
  min-width: 132px;
  padding: 4px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.12);
  box-sizing: border-box;
}

.submenu-item {
  padding: 8px 12px;
  font-size: 13px;
  line-height: 1.2;
  color: #475569;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s, color 0.15s;
}

.submenu-item:hover {
  background: #f1f5f9;
  color: #2563eb;
}

.submenu-item.active {
  background: #eff6ff;
  color: #2563eb;
  font-weight: 600;
}

/* 浮层淡入淡出 */
.submenu-fade-enter-active,
.submenu-fade-leave-active {
  transition: opacity 0.15s ease;
}

.submenu-fade-enter-from,
.submenu-fade-leave-to {
  opacity: 0;
}
</style>