<template>
  <!-- 唯一根节点 -->
  <div class="wind-power-search-bar">
    <div class="filter-row">
      <!-- MW类别 -->
      <select-search
        class="search-item-box"
        placeholder="MW类别"
        v-model:selectValue="searchKey.deviceCapacity"
        :options="deviceCapacityData"
        @updateSearch="handleSearch"
      ></select-search>

      <!-- 风机类型 -->
      <select-search
        class="search-item-box"
        placeholder="风机类型"
        v-model:selectValue="searchKey.deviceType"
        :options="[
          { label: '直驱', value: 1 },
          { label: '双馈', value: 2 },
          { label: '中速永磁', value: 3 },
          { label: '半直驱', value: 4 },
        ]"
        @updateSearch="handleSearch"
      ></select-search>

      <!-- 风机型号 -->
      <a-input
        v-model:value="searchKey.deviceModel"
        placeholder="风机型号"
        class="filter-input"
        allowClear
        @pressEnter="handleSearch"
      >
        <template #suffix>
          <iconpark-icon name="sousuo" size="12"></iconpark-icon>
        </template>
      </a-input>

      <!-- 设备编号 -->
      <a-input
        allowClear
        v-model:value="searchKey.deviceCode"
        placeholder="设备编号"
        class="filter-input"
        @pressEnter="handleSearch"
      >
        <template #suffix>
          <iconpark-icon name="sousuo" size="12"></iconpark-icon>
        </template>
      </a-input>

      <!-- 操作按钮区（紧跟在筛选项后面） -->
      <div class="filter-buttons">
        <a-button class="btn-reset" @click="resetSearch">重置</a-button>
        <a-button type="primary" class="btn-search" @click="handleSearch">搜索</a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import SelectSearch from '@/components/selectSearch/SelectSearch.vue';
import { reactive } from 'vue';

const emit = defineEmits(['handleSearch', 'resetSearch']);

const deviceCapacityData = [
  { label: '5MW以下', value: '0' },
  { label: '5', value: '5' },
  { label: '6', value: '6' },
  { label: '7', value: '7' },
  { label: '8', value: '8' },
  { label: '9', value: '9' },
  { label: '10及以上', value: '10' },
];

const searchKey = reactive({
  deviceCapacity: null,
  deviceType: null,
  deviceModel: '',
  deviceCode: '',
});

// 搜索
const handleSearch = () => {
  emit('handleSearch', searchKey);
};

// 重置
const resetSearch = () => {
  for (const key in searchKey) {
    if (Object.hasOwnProperty.call(searchKey, key)) {
      searchKey[key] = null;
    }
  }
  emit('resetSearch', searchKey);
};

defineExpose({
  searchKey,
});
</script>

<style lang="scss" scoped>
.wind-power-search-bar {
  background: #FFFFFF;
}

/* ========== 筛选行 ========== */
.filter-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
}

.filter-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 下拉框样式重置：白底、10px 圆角、36px 高 */
.filter-row :deep(.ant-select-selector) {
  height: 36px !important;
  border: 1px solid #E2E9F0 !important;
  border-radius: 10px !important;
  background: #FFFFFF !important;
  box-shadow: none !important;
  font-size: 13px;
}
.filter-row :deep(.ant-select-selection-item),
.filter-row :deep(.ant-select-selection-placeholder) {
  line-height: 34px !important;
  color: #667383;
}

/* 输入框样式统一 */
.filter-row .filter-input {
  width: 200px; /* 统一宽度 */
  height: 36px;
  border: 1px solid #E2E9F0;
  border-radius: 10px;
  background: #FFFFFF;
  box-shadow: none;
  font-size: 13px;
}
.filter-row .filter-input :deep(input) {
  font-size: 13px;
}

/* 按钮样式统一：36px 高、8px 圆角 */
.filter-row .btn-reset,
.filter-row .btn-search {
  height: 36px;
  padding: 0 16px;
  border-radius: 8px;
  font-size: 13px;
}

.filter-row .btn-reset {
  color: #667383;
  background: #FFFFFF;
  border: 1px solid #E2E9F0;
}

.filter-row .btn-search {
  background: #0278E7 !important;
  border-color: #0278E7 !important;
  color: #FFFFFF !important;

  &:hover {
    background: #0267C7 !important;
    border-color: #0267C7 !important;
  }
}
</style>