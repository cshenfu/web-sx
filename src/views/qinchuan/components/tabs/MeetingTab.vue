<template>
    <div class="meeting-tab">
      <el-empty description="内容待设计" :image-size="64" />
      <!-- TODO: 上会/审查流程相关 UI，等你确认设计后补充 -->
    </div>
  </template>
  
  <script setup>
  defineProps({
    area: { type: Object, default: () => ({}) }
  })
  </script>
  
  <style scoped>
  .meeting-tab {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 200px;
  }
  
  :deep(.el-empty__description p) {
    color: #9bdfff;
  }
  </style>