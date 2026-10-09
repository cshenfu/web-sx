<template>
  <!-- 路由出口：Login 直接渲染，MainLayout 通过路由嵌套处理 -->
  <RouterView />
</template>

<script setup>
// App.vue 不再直接挂 AppHeader，
// AppHeader 在 MainLayout 里统一管理
</script>

<style>
/* 全局重置 */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body, #app {
  width: 100%;
  height: 100%;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background: #f0f2f5;
}
</style>