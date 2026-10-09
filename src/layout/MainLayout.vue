<template>
    <div class="main-layout">
      <!-- 全局顶部导航 -->
      <AppHeader />
  
      <!-- 内容区：侧边栏 + 页面 -->
      <div class="layout-body">
        <!-- 只有 meta.sidebar 存在时才渲染侧边栏 -->
        <Sidebar v-if="hasSidebar" />
  
        <div class="page-content" :class="{ 'no-sidebar': !hasSidebar }">
          <!-- 路由切换动画 -->
          <RouterView v-slot="{ Component, route }">
            <Transition name="fade" mode="out-in">
              <component :is="Component" :key="route.fullPath" />
            </Transition>
          </RouterView>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'
  import AppHeader from '@/components/AppHeader.vue'
  import Sidebar from '@/components/Sidebar.vue'
  
  const route = useRoute()
  
  // 当前路由是否需要侧边栏
  const hasSidebar = computed(() => !!route.meta.sidebar)
  </script>
  
  <style scoped>
  .main-layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }
  
  /* 顶部 Header 高度占位：AppHeader 自身 fixed，这里留出空间 */
  .layout-body {
    display: flex;
    flex: 1;
    overflow: hidden;
    margin-top: 56px; /* 与 AppHeader 高度保持一致 */
  }
  
  /* 内容主区域 */
  .page-content {
    flex: 1;
    overflow: hidden;
    position: relative;
    border-radius: 12px 0 0 0;
  }
  
  /* 有侧边栏时不需要额外处理，flex 自动撑开 */
  /* 无侧边栏时宽度占满 */
  .page-content.no-sidebar {
    width: 100%;
  }
  
  /* 页面切换淡入淡出 */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.15s ease;
  }
  
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  </style>