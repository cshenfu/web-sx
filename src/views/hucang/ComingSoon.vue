<template>
    <div class="coming-soon">
      <el-icon :size="48">
        <Tools />
      </el-icon>
      <h2>{{ title }}</h2>
      <p>功能开发中，敬请期待</p>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'
  import { Tools } from '@element-plus/icons-vue'
  
  const route = useRoute()
  
  const title = computed(() => route.meta.title || '功能')
  </script>
  
  <style scoped>
  .coming-soon {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
  
    color: rgba(255, 255, 255, 0.6);
  }
  
  .coming-soon h2 {
    font-size: 18px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.85);
    margin: 0;
  }
  
  .coming-soon p {
    font-size: 13px;
    margin: 0;
  }
  </style>