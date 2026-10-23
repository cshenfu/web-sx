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
/* ========== 页面基础布局 ========== */
.log-root {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  box-sizing: border-box;
}

.log-page-bg {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  box-sizing: border-box;
  overflow: hidden;
  background: linear-gradient(
    122deg,
    #eef3fa 0%,
    #f7f8fc 48%,
    #eaf2fb 100%
  );
}

/* ========== 背景光晕 ========== */
.bg-glow-top-left,
.bg-glow-bottom-right,
.bg-glow-top-right {
  position: absolute;
  pointer-events: none;
  border-radius: 50%;
  filter: blur(100px);
  z-index: 0;
}

.bg-glow-top-left {
  left: -100px;
  top: -130px;
  width: 320px;
  height: 320px;
  background: #ffd9e3;
  opacity: 0.32;
}

.bg-glow-bottom-right {
  right: -70px;
  bottom: -180px;
  width: 400px;
  height: 400px;
  background: #b9d8ff;
  opacity: 0.42;
}

.bg-glow-top-right {
  right: 15%;
  top: -180px;
  width: 280px;
  height: 280px;
  background: #c9e2ff;
  opacity: 0.3;
}

/* ========== 顶部标题栏 ========== */
.page-header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  flex: 0 0 48px;
  height: 48px;
  min-height: 48px;
  padding: 0 16px;
  box-sizing: border-box;
  border-bottom: 1px solid #e1e7ef;
}

.page-title {
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.5;
  color: #152536;
}

/* ========== 主卡片 ========== */
.main-card {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  margin: 10px 16px 14px;
  overflow: hidden;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid #e1e7ef;
  border-radius: 6px;
  box-shadow: 0 3px 12px rgba(34, 57, 86, 0.035);
}

/* ========== 搜索区域 ========== */
.filter-bar {
  position: relative;
  z-index: 1;
  flex: 0 0 auto;
  min-width: 0;
  background: rgba(255, 255, 255, 0.72);
  border-bottom: 1px solid #e8edf3;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 10px 14px;
  box-sizing: border-box;
}

/* 日期范围选择器：固定桌面端尺寸 */
.filter-date {
  display: inline-flex;
  flex: 0 0 250px;
  width: 250px !important;
  height: 26px !important;
  min-height: 26px !important;
  box-sizing: border-box;
}

/* Element Plus 日期选择器外框 */
.filter-row :deep(.el-date-editor.filter-date),
.filter-row :deep(.el-date-editor--daterange.el-input__wrapper) {
  flex: 0 0 250px;
  width: 250px !important;
  height: 26px !important;
  min-height: 26px !important;
  padding: 0 6px !important;
  box-sizing: border-box;
  border-radius: 4px;
  background: #fff;
  box-shadow: 0 0 0 1px #dfe6ee inset;
}

/* 日期选择器悬停、聚焦状态 */
.filter-row :deep(.el-date-editor.filter-date:hover) {
  box-shadow: 0 0 0 1px #b9c9dc inset;
}

.filter-row :deep(.el-date-editor.filter-date.is-active),
.filter-row :deep(.el-date-editor.filter-date:focus-within) {
  box-shadow: 0 0 0 1px #087fe5 inset;
}

/* 开始和结束日期输入区域 */
.filter-row :deep(.el-date-editor .el-range-input) {
  flex: 1 1 0;
  width: 0;
  min-width: 0;
  height: 24px;
  padding: 0;
  line-height: 24px;
  font-size: 10px !important;
  color: #536274;
  background: transparent;
}

/* 日期占位文字 */
.filter-row :deep(.el-date-editor .el-range-input::placeholder) {
  font-size: 10px;
  color: #98a5b5;
}

/* 日期之间的分隔符 */
.filter-row :deep(.el-date-editor .el-range-separator) {
  flex: 0 0 16px;
  width: 16px;
  height: 24px;
  padding: 0;
  line-height: 24px;
  font-size: 10px;
  text-align: center;
  color: #8795a6;
}

/* 日历图标、清除图标 */
.filter-row :deep(.el-date-editor .el-range__icon),
.filter-row :deep(.el-date-editor .el-range__close-icon) {
  flex: 0 0 14px;
  width: 14px;
  height: 24px;
  margin: 0;
  font-size: 11px;
  line-height: 24px;
}

/* 部门选择框 */
.filter-select {
  flex: 0 0 140px;
  width: 140px;
}

/* 普通搜索输入框 */
.filter-input {
  flex: 0 0 150px;
  width: 150px;
}

/* 所有搜索控件统一高度 */
.filter-row :deep(.el-input),
.filter-row :deep(.el-select) {
  --el-input-height: 26px;
}

/* 普通输入框外框 */
.filter-row :deep(.el-input__wrapper),
.filter-row :deep(.el-select__wrapper) {
  min-height: 26px;
  height: 26px;
  padding: 0 8px;
  box-sizing: border-box;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 0 0 1px #dfe6ee inset;
  transition: box-shadow 0.15s ease;
}

.filter-row :deep(.el-input__wrapper:hover),
.filter-row :deep(.el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px #b9c9dc inset;
}

.filter-row :deep(.el-input__wrapper.is-focus),
.filter-row :deep(.el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px #087fe5 inset;
}

/* 输入文字、占位文字 */
.filter-row :deep(.el-input__inner),
.filter-row :deep(.el-select__placeholder),
.filter-row :deep(.el-select__selected-item) {
  height: 24px;
  line-height: 24px;
  font-size: 10px;
  color: #536274;
}

.filter-row :deep(.el-input__inner::placeholder) {
  font-size: 10px;
  color: #98a5b5;
}

/* 清除、前缀、后缀图标 */
.filter-row :deep(.el-input__suffix-inner),
.filter-row :deep(.el-input__prefix-inner) {
  font-size: 11px;
}

/* 搜索按钮组 */
.filter-buttons {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 6px;
}

/* 重置与搜索按钮 */
.btn-reset,
.btn-search {
  height: 26px;
  padding: 0 12px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
}

.btn-reset {
  color: #536274;
  background: #fff;
  border: 1px solid #dfe6ee;
}

.btn-reset:hover {
  color: #087fe5;
  background: #f2f8ff;
  border-color: #9bcaff;
}

.btn-search {
  color: #fff !important;
  background: #087fe5 !important;
  border-color: #087fe5 !important;
}

.btn-search:hover {
  background: #0672cf !important;
  border-color: #0672cf !important;
}

/* ========== 表格区域 ========== */
.table-wrapper {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  padding: 0 14px;
  box-sizing: border-box;
  overflow: hidden;
}

.table-wrapper :deep(.el-table) {
  width: 100% !important;
  height: 100%;
  flex: 1 1 0;
  min-height: 0;
  font-size: 10px;

  --el-table-border-color: #e6ebf1;
  --el-table-header-bg-color: #f5f8fc;
  --el-table-row-hover-bg-color: #f0f6fc;
  --el-table-current-row-bg-color: #f0f6fc;
  --el-table-text-color: #536274;
  --el-table-header-text-color: #46576a;
  --el-fill-color-lighter: #f5f8fc;
}

.table-wrapper :deep(.el-table__inner-wrapper::before) {
  height: 0;
}

.table-wrapper :deep(.el-table th.el-table__cell) {
  height: 28px;
  padding: 0;
  background: #f5f8fc !important;
  border-bottom: 1px solid #e2e9f1;
  font-size: 10px;
  font-weight: 600;
  color: #46576a;
}

.table-wrapper :deep(.el-table td.el-table__cell) {
  height: 40px;
  padding: 0;
  border-bottom: 1px solid #edf1f5;
  font-size: 10px;
  color: #536274;
}

.table-wrapper :deep(.el-table th .cell),
.table-wrapper :deep(.el-table td .cell) {
  padding: 0 10px;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.table-wrapper :deep(.el-table__body tr) {
  transition: background-color 0.12s ease;
}

.table-wrapper :deep(.el-table__body tr:hover > td.el-table__cell) {
  background-color: #f0f6fc !important;
}

.table-wrapper :deep(.el-table__empty-block) {
  min-height: 100px;
}

.table-wrapper :deep(.el-table__empty-text) {
  font-size: 11px;
  color: #98a5b5;
}

/* ========== 状态标签 ========== */
.table-wrapper :deep(.status-tag) {
  height: 21px;
  padding: 0 8px;
  border: 1px solid transparent;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  line-height: 19px;
}

.table-wrapper :deep(.status-tag.el-tag--success) {
  color: #16834a;
  background: #edf8f1;
  border-color: #d3efdd;
}

.table-wrapper :deep(.status-tag.el-tag--danger) {
  color: #d14343;
  background: #fff1f0;
  border-color: #ffddda;
}

/* ========== 分页区域 ========== */
.pagination-wrap {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 0 0 auto;
  justify-content: flex-end;
  align-items: center;
  min-height: 48px;
  padding: 8px 14px;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.94);
  border-top: 1px solid #e8edf3;
}

.pagination-wrap :deep(.el-pagination) {
  font-size: 10px;
  color: #637285;
  --el-pagination-font-size: 10px;
  --el-pagination-button-height: 24px;
  --el-pagination-button-width: 24px;
  --el-pagination-hover-color: #087fe5;
}

.pagination-wrap :deep(.el-pagination__total),
.pagination-wrap :deep(.el-pagination__sizes),
.pagination-wrap :deep(.el-pagination__jump) {
  font-size: 10px;
  color: #637285;
}

.pagination-wrap :deep(.el-pagination .el-input__wrapper) {
  min-height: 24px;
  height: 24px;
  border-radius: 4px;
  box-shadow: 0 0 0 1px #dfe6ee inset;
}

.pagination-wrap :deep(.el-pagination .el-input__inner) {
  height: 22px;
  font-size: 10px;
}

.pagination-wrap :deep(.el-pagination.is-background .el-pager li) {
  min-width: 24px;
  height: 24px;
  margin: 0 2px;
  border-radius: 4px;
  font-size: 10px;
  line-height: 24px;
  background: #f2f5f9;
  color: #536274;
}

.pagination-wrap :deep(.el-pagination.is-background .el-pager li.is-active) {
  color: #fff;
  background: #087fe5;
}

.pagination-wrap :deep(.el-pagination button) {
  min-width: 24px;
  height: 24px;
  border-radius: 4px;
}

/* ========== 中等屏幕适配 ========== */
@media (max-width: 1100px) {
  .filter-date,
  .filter-row :deep(.el-date-editor.filter-date),
  .filter-row :deep(.el-date-editor--daterange.el-input__wrapper) {
    flex-basis: 230px;
    width: 230px !important;
  }

  .filter-select {
    flex-basis: 130px;
    width: 130px;
  }

  .filter-input {
    flex-basis: 140px;
    width: 140px;
  }
}

/* ========== 小屏幕适配 ========== */
@media (max-width: 768px) {
  .page-header {
    flex-basis: 44px;
    height: 44px;
    min-height: 44px;
    padding: 0 12px;
  }

  .main-card {
    margin: 8px;
  }

  .filter-row {
    padding: 10px;
  }

  .filter-date,
  .filter-row :deep(.el-date-editor.filter-date),
  .filter-row :deep(.el-date-editor--daterange.el-input__wrapper) {
    flex: 1 1 100%;
    width: 100% !important;
  }

  .filter-select,
  .filter-input {
    flex: 1 1 130px;
    width: auto;
    min-width: 120px;
  }

  .filter-buttons {
    margin-left: auto;
  }

  .table-wrapper {
    padding: 0 8px;
  }

  .pagination-wrap {
    padding: 8px;
    overflow-x: auto;
  }
}
</style>
