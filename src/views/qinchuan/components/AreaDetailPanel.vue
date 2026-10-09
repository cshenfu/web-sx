<template>
    <div class="area-detail-panel">
      <div class="panel-header">
        <div class="panel-header-title">{{ areaName }}</div>
        <el-button type="primary" size="small" @click="$emit('start-approval', area)">
          {{ actionLabel }}
        </el-button>
      </div>
  
      <el-tabs v-model="activeTab" class="panel-tabs">
        <el-tab-pane
          v-for="tab in tabs"
          :key="tab.key"
          :label="tab.label"
          :name="tab.key"
        >
          <component :is="tab.component" :area="area" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </template>
  
  <script setup>
  import { ref, watch, computed } from 'vue'
  
  const props = defineProps({
    area: { type: Object, default: () => ({}) },
    tabs: { type: Array, required: true }, // [{ key, label, component }]
    actionLabel: { type: String, default: '开始立项' }
  })
  
  defineEmits(['start-approval'])
  
  const areaName = computed(() => props.area?.name || '未命名区域')
  const activeTab = ref(props.tabs[0]?.key)
  
  // 切换到另一个区域时，tab 重置回第一个
  watch(
    () => props.area?.guid,
    () => {
      activeTab.value = props.tabs[0]?.key
    }
  )
  </script>
  
  <style scoped>
  .area-detail-panel {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    height: 100%;
    color: #d9f5ff;
    background:
      linear-gradient(180deg, rgba(7, 44, 78, 0.96), rgba(3, 22, 48, 0.97)),
      rgba(3, 22, 48, 0.95);
    border: 1px solid rgba(90, 201, 255, 0.7);
    border-radius: 6px;
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.35);
  }
  
  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 14px 16px;
    border-bottom: 1px solid rgba(118, 213, 255, 0.3);
  }
  
  .panel-header-title {
    overflow: hidden;
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .panel-tabs {
    flex: 1;
    min-height: 0;
    padding: 0 16px 14px;
  }
  
  .panel-tabs :deep(.el-tabs__header) {
    margin-bottom: 8px;
  }
  
  .panel-tabs :deep(.el-tabs__nav-wrap::after) {
    background-color: rgba(118, 213, 255, 0.2);
  }
  
  .panel-tabs :deep(.el-tabs__item) {
    color: #9bdfff;
  }
  
  .panel-tabs :deep(.el-tabs__item.is-active) {
    color: #5bd6ff;
  }
  
  .panel-tabs :deep(.el-tabs__content) {
    height: calc(100% - 42px);
    overflow-y: auto;
  }
  </style>