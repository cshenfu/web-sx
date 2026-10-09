<template>
    <div class="list-page">
  
      <!-- 页头：标题 + 右侧按钮 -->
      <div class="page-header">
        <h2 class="page-title">{{ title }}</h2>
        <slot name="header-actions" />
      </div>
  
      <!-- 搜索栏 -->
      <SearchBar
        v-if="searchFields.length"
        :fields="searchFields"
        @search="onSearch"
        @reset="onReset"
      />
  
      <!-- 表格 -->
      <DataTable
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :total="total"
        :height="tableHeight"
        :draggable="draggable"
        :pagination="pagination"
        @page-change="onPageChange"
      >
        <!-- 透传所有自定义插槽 -->
        <template v-for="(_, name) in $slots" #[name]="slotProps">
          <slot :name="name" v-bind="slotProps || {}" />
        </template>
      </DataTable>
    </div>
  </template>
  
  <script setup>
  import SearchBar from './SearchBar.vue'
  import DataTable from './DataTable.vue'
  
  defineProps({
    title:        { type: String,  default: '' },
    searchFields: { type: Array,   default: () => [] },
    columns:      { type: Array,   required: true },
    tableData:    { type: Array,   default: () => [] },
    loading:      { type: Boolean, default: false },
    total:        { type: Number,  default: 0 },
    tableHeight:  { type: String,  default: 'calc(100vh - 200px)' },
    draggable:    { type: Boolean, default: false },  // 规制中枢简单表不需要
    pagination:   { type: Boolean, default: true },
  })
  
  const emit = defineEmits(['search', 'reset', 'page-change'])
  const onSearch     = (v) => emit('search', v)
  const onReset      = (v) => emit('reset', v)
  const onPageChange = (v) => emit('page-change', v)
  </script>
  
  <style scoped>
  .list-page {
    padding: 20px 24px;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #fff;
  }
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }
  
  .page-title {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a2e;
    margin: 0;
  }
  </style>