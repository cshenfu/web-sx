<template>
    <div class="main-info-tab">
      <div v-for="field in fields" :key="field.label" class="info-row">
        <span class="info-label">{{ field.label }}</span>
        <span class="info-value">{{ field.value }}</span>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  
  const props = defineProps({
    area: { type: Object, default: () => ({}) }
  })
  
  // UI 还没设计，先用名称/ID 等基础字段占位，后续按实际数据结构调整
  const fields = computed(() => [
    { label: '区域名称', value: props.area?.name || '-' },
    { label: '区域 UID', value: props.area?.guid || '-' },
    { label: '项目编号', value: props.area?.projectNo || '-' },
    { label: '所属区域', value: props.area?.region || '-' },
    { label: '装机容量', value: props.area?.capacity ? `${props.area.capacity} MW` : '-' },
    { label: '当前阶段', value: props.area?.stage || '-' }
  ])
  </script>
  
  <style scoped>
  .main-info-tab {
    padding-top: 8px;
  }
  
  .info-row {
    display: flex;
    padding: 8px 0;
    border-bottom: 1px dashed rgba(118, 213, 255, 0.2);
    font-size: 13px;
  }
  
  .info-label {
    width: 84px;
    flex-shrink: 0;
    color: #9bdfff;
  }
  
  .info-value {
    overflow-wrap: anywhere;
    color: #eaf8ff;
  }
  </style>