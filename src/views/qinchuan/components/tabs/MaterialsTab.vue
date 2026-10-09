<template>
    <div class="materials-tab">
      <el-empty description="材料内容待设计" :image-size="64" />
      <!-- TODO: 材料上传/列表/预览 UI，等你确认设计后补充 -->
    </div>
  </template>
  
  <script setup>
  defineProps({
    area: { type: Object, default: () => ({}) }
  })
  </script>
  
  <style scoped>
  .materials-tab {
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