<template>
  <!-- 唯一根节点 -->
  <div class="log-root">
    <div class="log-page-bg">
      <!-- 背景光晕层 -->
      <div class="bg-glow-top-left"></div>
      <div class="bg-glow-bottom-right"></div>
      <div class="bg-glow-top-right"></div>

      <!-- 顶部 Header -->
      <div class="page-header">
        <span class="page-title">日志管理</span>
      </div>

      <!-- 主卡片 -->
      <div class="main-card">
        <!-- 搜索栏 -->
        <div class="filter-bar">
          <div class="filter-row">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="~"
              start-placeholder="创建时间开始"
              end-placeholder="创建时间结束"
              value-format="YYYY-MM-DD"
              class="filter-date"
            />
            
            <el-select v-model="searchForm.dept" placeholder="组织/部门" clearable class="filter-select">
              <el-option label="企业名称" value="企业名称" />
              <el-option label="技术部" value="技术部" />
            </el-select>

            <el-input 
              v-model="searchForm.logName" 
              placeholder="日志名称" 
              clearable 
              class="filter-input"
              @keyup.enter="handleSearch"
            />

            <el-input 
              v-model="searchForm.account" 
              placeholder="用户账号" 
              clearable 
              class="filter-input"
              @keyup.enter="handleSearch"
            />

            <div class="filter-buttons">
              <el-button class="btn-reset" @click="handleReset">重置</el-button>
              <el-button type="primary" class="btn-search" @click="handleSearch">搜索</el-button>
            </div>
          </div>
        </div>

        <!-- 表格展示区 -->
        <div class="table-wrapper">
          <el-table 
            :data="tableData" 
            style="width: 100%; height: 100%" 
            header-cell-class-name="table-header"
          >
            <el-table-column prop="time" label="时间" min-width="160" />
            <el-table-column prop="logType" label="日志类型" min-width="120" />
            <el-table-column prop="account" label="用户账号" min-width="150" />
            <el-table-column prop="dept" label="所属组织/部门" min-width="150" />
            <el-table-column prop="logName" label="日志名称" min-width="180" />
            <el-table-column prop="status" label="状态" min-width="100">
              <template #default="{ row }">
                <el-tag 
                  :type="row.status === '成功' ? 'success' : 'danger'" 
                  effect="light"
                  class="status-tag"
                >
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="content" label="操作内容" min-width="250" show-overflow-tooltip />
          </el-table>
        </div>

        <!-- 分页 -->
        <div class="pagination-wrap">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            :page-sizes="[10, 20, 50, 100]"
            background
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(30)

// 搜索表单
const searchForm = reactive({
  dateRange: [],
  dept: '',
  logName: '',
  account: ''
})

// 表格假数据
const tableData = ref([
  {
    id: 1,
    time: '2024-09-01 09:00:00',
    logType: '登录/注销',
    account: 'zhangsan001',
    dept: '企业名称',
    logName: '登录',
    status: '成功',
    content: ''
  },
  {
    id: 2,
    time: '2024-09-01 09:00:00',
    logType: '项目相关',
    account: 'zhangsan001',
    dept: '企业名称',
    logName: '创建项目',
    status: '失败',
    content: ''
  },
  {
    id: 3,
    time: '2024-09-01 09:00:00',
    logType: '项目相关',
    account: 'zhangsan001',
    dept: '企业名称',
    logName: '项目结果推送手机号',
    status: '成功',
    content: ''
  }
])

// 搜索与重置
const handleSearch = () => {
  ElMessage.success('触发搜索')
}

const handleReset = () => {
  searchForm.dateRange = []
  searchForm.dept = ''
  searchForm.logName = ''
  searchForm.account = ''
  handleSearch()
}
</script>

<style scoped lang="scss">
.log-root {
  width: 100%;
  height: 100%;
}

/* ========== 外层容器与背景 ========== */
.log-page-bg {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(122.01deg, #E6EEF8 0%, #D2E0F4 100%), #FFFFFF;
  overflow: hidden;
}

.bg-glow-top-left {
  position: absolute;
  left: -1.61%;
  top: -18.52%;
  width: 350px;
  height: 350px;
  background: linear-gradient(135deg, #FFCCD5 0%, #FECFEF 100%);
  opacity: 0.49;
  filter: blur(129.5px);
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
}
.bg-glow-bottom-right {
  position: absolute;
  right: 4.64%;
  bottom: -18.13%;
  width: 450px;
  height: 450px;
  background: linear-gradient(120deg, #A1C4FD 0%, #C2E9FB 100%);
  opacity: 0.7;
  filter: blur(123px);
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
}
.bg-glow-top-right {
  position: absolute;
  right: 19.01%;
  top: -37.04%;
  width: 300px;
  height: 300px;
  background: linear-gradient(120deg, #A1C4FD 0%, #C2E9FB 100%);
  opacity: 0.7;
  filter: blur(123px);
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
}

/* ========== 顶部 Header ========== */
.page-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  height: 67px;
  padding: 15px 20px;
  box-sizing: border-box;
  flex-shrink: 0;
  border-bottom: 1px solid #E2E9F0;
}
.page-title {
  font-family: 'PingFang SC';
  font-weight: 500;
  font-size: 16px;
  color: #0B1C2C;
}

/* ========== 主卡片 ========== */
.main-card {
  position: relative;
  z-index: 2;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  margin: 16px 12px 30px;
  background: #FFFFFF;
  border: 1px solid #DFE5EC;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(11, 28, 44, 0.04);
  overflow: hidden;
}

/* ========== 搜索栏 ========== */
.filter-bar {
  flex-shrink: 0;
  background: #FFFFFF;
}
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

/* 强制覆盖 Element Plus 控件样式 */
.filter-row :deep(.el-input__wrapper) {
  height: 36px;
  box-shadow: 0 0 0 1px #E2E9F0 inset;
  border-radius: 10px;
  background-color: #FFFFFF;
  padding: 1px 11px;
}
.filter-row :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #0278E7 inset;
}
.filter-row :deep(.el-range-editor.el-input__wrapper) {
  width: 260px;
}
.filter-row :deep(.el-range-input) {
  font-size: 13px;
}
.filter-row :deep(.el-range-separator) {
  color: #667383;
}

.filter-date {
  width: 260px;
}
.filter-select {
  width: 160px;
}
.filter-input {
  width: 160px;
}

/* 按钮统一 */
.btn-reset,
.btn-search {
  height: 36px;
  padding: 0 16px;
  border-radius: 8px;
  font-size: 13px;
}
.btn-reset {
  color: #667383;
  background: #FFFFFF;
  border: 1px solid #E2E9F0;
  &:hover { color: #0278E7; border-color: #0278E7; background: #F0F7FF;}
}
.btn-search {
  background: #0278E7 !important;
  border-color: #0278E7 !important;
  color: #FFFFFF !important;
  &:hover {
    background: #0267C7 !important;
    border-color: #0267C7 !important;
  }
}

/* ========== 表格区域 ========== */
.table-wrapper {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 0 20px;
  box-sizing: border-box;
  overflow: hidden;
}

:deep(.el-table) {
  --el-table-border-color: #E2E9F0;
  --el-table-header-bg-color: #F8FAFC;
  --el-table-row-hover-bg-color: #F4F8FC;
  width: 100% !important;
  flex: 1;
}
:deep(.el-table th.el-table__cell) {
  background-color: #F8FAFC !important;
  color: #0B1C2C;
  font-weight: 500;
}
:deep(.el-table__inner-wrapper::before) {
  display: none;
}

/* 状态标签统一胶囊化 */
:deep(.status-tag) {
  border-radius: 12px;
  padding: 0 10px;
  font-weight: 500;
  border: none;
}
:deep(.status-tag.el-tag--success) {
  background-color: #E8F7EE;
  color: #00A63E;
  box-shadow: inset 0 0 0 1px #B7E4C7;
}
:deep(.status-tag.el-tag--danger) {
  background-color: #FEECEC;
  color: #D9363E;
  box-shadow: inset 0 0 0 1px #FFC9C9;
}

/* ========== 分页 ========== */
.pagination-wrap {
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  padding: 16px 20px;
}
</style>