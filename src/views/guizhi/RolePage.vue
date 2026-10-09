<!-- views/guizhi/RolePage.vue -->
<template>
    <ListPage
      title="角色管理"
      :search-fields="searchFields"
      :columns="columns"
      :table-data="list"
      :loading="loading"
      :total="total"
      :draggable="false"
      @search="handleSearch"
      @page-change="handlePageChange"
    >
      <!-- 右上角按钮 -->
      <template #header-actions>
        <el-button type="primary" size="small" @click="showAdd = true">添加角色</el-button>
      </template>
  
      <!-- 操作列 -->
      <template #action="{ row }">
        <el-button link type="primary" size="small" @click="edit(row)">编辑</el-button>
        <el-button link type="danger"  size="small" @click="del(row)">删除</el-button>
      </template>
    </ListPage>
  </template>
  
  <script setup>
  import ListPage from '@/components/common/ListPage.vue'
  import { ref } from 'vue'
  
  const loading = ref(false)
  const total   = ref(5)
  const showAdd = ref(false)
  
  const searchFields = [
    { key: 'dateRange', type: 'daterange', startPlaceholder: '开始时间', endPlaceholder: '结束时间' },
    { key: 'name',      type: 'input',     placeholder: '角色名称', width: '150px' }
  ]
  
  const columns = [
    { prop: 'id',        label: '角色ID',   minWidth: 130 },
    { prop: 'name',      label: '角色名称', minWidth: 150 },
    { prop: 'desc',      label: '角色描述', minWidth: 300 },
    { prop: 'createdAt', label: '创建时间', minWidth: 160 },
  ]
  
  const list = ref([
    { id: 'JS08767899', name: '管理员',   desc: '角色描述角色描述...', createdAt: '2025-11-18 09:00' },
    { id: 'JS08767899', name: '项目经理', desc: '角色描述角色描述...', createdAt: '2025-11-18 09:00' },
    { id: 'JS08767899', name: '数据管理', desc: '角色描述角色描述...', createdAt: '2025-11-18 09:00' },
    { id: 'JS08767899', name: '部门主管', desc: '角色描述角色描述...', createdAt: '2025-11-18 09:00' },
  ])
  
  function handleSearch(filters) { /* 调接口 */ }
  function handlePageChange({ page, size }) { /* 分页 */ }
  function edit(row) {}
  function del(row) {}
  </script>