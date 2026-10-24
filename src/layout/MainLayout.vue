<template>
  <div class="main-layout" :class="{ 'is-fullscreen': isFullScreen }">
    <!-- 全屏时隐藏全局头部 -->
    <AppHeader v-show="!isFullScreen" />

    <div class="layout-body">
      <!-- 全屏时隐藏侧边栏 -->
      <Sidebar v-if="!isFullScreen && hasSidebar" />

      <div class="page-content" :class="{ 'no-sidebar': !hasSidebar || isFullScreen }">
        <RouterView v-slot="{ Component, route }">
          <!-- <Transition name="fade" mode="out-in"> -->
            <component :is="Component" :key="route.fullPath" />
          <!-- </Transition> -->
        </RouterView>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import Sidebar from '@/components/Sidebar.vue'

const route = useRoute()
const hasSidebar = computed(() => !!route.meta.sidebar)

const isFullScreen = ref(!!document.fullscreenElement)

const handleFullscreenChange = () => {
  isFullScreen.value = !!document.fullscreenElement
}

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
})
</script>
<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

/* 全屏模式下，布局撑满 */
.main-layout.is-fullscreen .layout-body {
  margin-top: 0 !important;
}

.layout-body {
  display: flex;
  flex: 1;
  overflow: hidden;
  margin-top: 65px; 
  transition: margin-top 0.3s ease;
  background-color: #fff; /* 保证下层是白色，圆角透出的底色就是白的 */
}

.page-content {
  flex: 1;
  overflow: hidden;
  position: relative;
  /* 左上角 16px 圆角 */
  border-radius: 16px 0 0 0; 
  background-color: transparent; 
}

/* 全屏时去掉左上角圆角 */
.is-fullscreen .page-content {
  border-radius: 0;
}

.page-content.no-sidebar {
  width: 100%;
  border-radius: 0;
  /* ★ 核心修改：去掉了 height: 100vh，交给 flex: 1 自动撑满 */
}

.no-sidebar .dashboard-page {
  height: 100%;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>