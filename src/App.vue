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
  @font-face {
  font-family: 'Alimama FangYuanTi VF';
    /* 指向你刚才放的字体路径 */
    src: url('@/assets/font/AlimamaFangYuanTiVF-Thin.woff2') format('woff2');
    /* 可变字体（VF）支持字重范围，这样你写 600 或 700 都能生效 */
    font-weight: 100 900; 
    font-style: normal;
    /* 优化体验：字体加载期间先用系统字体展示，防止文字消失 */
    font-display: swap; 
  }
</style>