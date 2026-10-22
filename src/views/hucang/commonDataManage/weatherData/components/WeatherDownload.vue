<template>
  <div class="weather-download-container">
    <!-- 背景光晕层 -->
    <div class="bg-glow-top-left"></div>
    <div class="bg-glow-bottom-right"></div>
    <div class="bg-glow-top-right"></div>

    <!-- 顶部 Header -->
    <div class="page-header">
      <div class="header-left">
        <el-button link @click="$emit('close')" class="back-btn">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <span class="page-title">我的下载</span>
      </div>
    </div>

    <!-- 筛选操作栏 -->
    <div class="filter-bar">
      <div class="filter-content-wrapper">
        <!-- 左侧输入组 -->
        <div class="filter-inputs">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="-"
            start-placeholder="创建时间"
            end-placeholder="结束时间"
            class="custom-date-picker"
          />
          
          <el-input
            v-model="keyword"
            placeholder="编号 / 名称"
            class="custom-search-input"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        
        <!-- 右侧按钮组 -->
        <div class="filter-actions">
          <el-button class="btn-reset" @click="handleReset">重置</el-button>
          <el-button class="btn-search" @click="handleSearch">搜索</el-button>
        </div>
      </div>
    </div>

    <!-- 表格容器 -->
    <div class="table-wrapper">
      <el-table 
        :data="tableData" 
        style="width: 100%" 
        class="custom-table"
        :header-cell-style="{ background: 'rgba(236, 243, 250, 0.6)', color: '#667383', fontWeight: 500, height: '42px', borderColor: '#DFE5EC' }"
        :cell-style="{ height: '50px', color: '#0B1C2C', borderColor: '#DFE5EC', background: '#FFFFFF' }"
      >
        <el-table-column prop="taskId" label="任务编号" min-width="140" />
        
        <el-table-column label="数据类型" width="130">
          <template #default="{ row }">
            <span class="status-tag" :class="row.dataType === 1 ? 'tag-blue' : 'tag-purple'">
              {{ row.dataType === 1 ? 'ERA5数据' : '气象精灵' }}
            </span>
          </template>
        </el-table-column>
        
        <el-table-column prop="lngLat" label="经纬度" width="180" />
        <el-table-column prop="address" label="所属位置" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <span class="status-text" :class="row.statusClass">{{ row.statusName }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === 'success'" link type="primary" class="action-btn" @click="handleDownload(row)">
              下载
            </el-button>
            <span v-else-if="row.status === 'expired'" class="action-btn text-gray">已过期</span>
            <span v-else class="action-btn text-gray">处理中</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 底部悬浮分页 -->
    <div class="pagination-bar">
      <span class="total-text">共 {{ total }} 条</span>
      
      <div class="pagination-controls">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          class="custom-pagination"
        />
        <span class="page-size-text">10 条/页</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ArrowLeft, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

defineEmits(['close'])

const dateRange = ref([])
const keyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(23)

// 模拟数据源（后续请替换为后端接口的真实数据）
const tableData = ref([
  { taskId: 'FD09876456', dataType: 1, lngLat: '113.29965,38.00376', address: '包头市达尔罕茂明安联合旗新水湾二村', createTime: '2025-06-09 09:00:00', status: 'success', statusName: '已完成', statusClass: 'text-green' },
  { taskId: 'FD09876457', dataType: 2, lngLat: '113.29965,38.00376', address: '包头市达尔罕茂明安联合旗新水湾二村', createTime: '2025-06-09 09:12:00', status: 'processing', statusName: '处理中', statusClass: 'text-orange' },
  { taskId: 'FD09876458', dataType: 1, lngLat: '113.29965,38.00376', address: '包头市达尔罕茂明安联合旗新水湾二村', createTime: '2025-06-09 10:00:00', status: 'expired', statusName: '已过期', statusClass: 'text-gray' }
])

const handleReset = () => {
  dateRange.value = []
  keyword.value = ''
}
const handleSearch = () => { ElMessage.info('执行搜索查询') }
const handleDownload = (row) => { ElMessage.success(`开始下载任务: ${row.taskId}`) }
</script>

<style scoped lang="scss">
/* 外层容器：覆盖在地图上 */
.weather-download-container {
  position: absolute;
  inset: 0;
  z-index: 20;
  /* 基础浅蓝渐变底色 */
  background: linear-gradient(122.01deg, #E6EEF8 0%, #D2E0F4 100%), #FFFFFF;
  display: flex;
  flex-direction: column;
  border-radius: 24px 0 0 0;
  overflow: hidden;
}

/* ========== 背景光晕层 ========== */
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
  justify-content: space-between;
  padding: 15px 20px;
  height: 67px;
  box-sizing: border-box;
  border-bottom: 1px solid #E2E9F0;
//   background: #FFFFFF;
}
.header-left { 
  display: flex; 
  align-items: center; 
  gap: 12px; 
}
.back-btn { 
  font-size: 18px; 
  color: #0B1C2C; 
  padding: 0; 
  margin: 0; 
}
.page-title { 
  font-family: 'PingFang SC'; 
  font-weight: 500; 
  font-size: 16px; 
  color: #0B1C2C; 
}

/* ========== 筛选栏 ========== */
.filter-bar {
  position: relative;
  z-index: 2;
  padding: 16px 20px;
  background: transparent;
  display: flex;
  align-items: center;
}

.filter-content-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
}

.filter-inputs {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 强制固定输入框宽度与样式 */
:deep(.custom-date-picker) {
  width: 390px !important; 
  height: 36px !important;
  background: #FFFFFF !important; 
  border: 1px solid #E2E9F0 !important;
  border-radius: 10px !important; 
  box-sizing: border-box;
  flex-shrink: 0;
}

:deep(.custom-search-input) {
  width: 304.67px !important; 
  height: 36px !important;
  background: #FFFFFF !important; 
  border: 1px solid #E2E9F0 !important;
  border-radius: 10px !important; 
  box-sizing: border-box;
  flex-shrink: 0;
}

/* 去掉 Element Plus 默认的内部阴影和背景 */
:deep(.custom-date-picker .el-input__wrapper), 
:deep(.custom-search-input .el-input__wrapper) {
  box-shadow: none !important; 
  background: transparent !important;
  border-radius: 10px !important;
}

:deep(.custom-date-picker .el-range-input), 
:deep(.custom-search-input input) {
  color: #667383 !important; 
  font-size: 13px !important;
}
:deep(.custom-search-input .el-input__prefix) {
  color: #667383;
}

/* 按钮 */
.btn-reset {
  width: 60px !important;
  height: 33.5px !important;
  border: 1px solid #E2E9F0 !important;
  border-radius: 8px !important;
  color: #667383 !important;
  font-size: 13px !important;
  background: #FFFFFF !important;
  margin: 0 !important;
}

.btn-search {
  width: 66px !important;
  height: 33.5px !important;
  background: #0278E7 !important;
  border-radius: 8px !important;
  color: #FFFFFF !important;
  font-size: 13px !important;
  border: none !important;
  margin: 0 !important;
}
.btn-search:hover {
  background: #0267c7 !important;
}

/* ========== 表格容器 ========== */
.table-wrapper {
  position: relative;
  z-index: 2;
  flex: 1; 
  margin: 0 20px 12px; 
  background: #FFFFFF;
  border: 1px solid #DFE5EC; 
  border-radius: 8px; 
  overflow: hidden;
  display: flex; 
  flex-direction: column;
}
.custom-table { 
  flex: 1; 
}
.custom-table :deep(.el-table__inner-wrapper::before) { 
  display: none; 
}
.custom-table :deep(.el-table__row:hover > td) { 
  background: #F8FAFC !important; 
}

/* 胶囊标签 */
.status-tag {
  display: inline-flex; 
  align-items: center; 
  justify-content: center;
  padding: 0 10px; 
  height: 24px; 
  border-radius: 12px;
  font-family: 'PingFang SC'; 
  font-weight: 500; 
  font-size: 12px;
}
.tag-blue { 
  background: #DDF0FF; 
  color: #0050B5; 
  box-shadow: inset 0px 0px 0px 1px #ABD1FF; 
}
.tag-purple { 
  background: #F7EBFF; 
  color: #6D41A9; 
  box-shadow: inset 0px 0px 0px 1px #DBC2FF; 
}

/* 状态文字 */
.status-text { 
  font-size: 12px; 
  font-weight: 400; 
}
.text-green { color: #00A63E; }
.text-orange { color: #F28A00; }
.text-gray { color: #667383; opacity: 0.6; }
.action-btn { font-size: 13px; }

/* ========== 底部悬浮分页 ========== */
.pagination-bar {
  position: relative;
  z-index: 2;
  display: flex; 
  justify-content: space-between; 
  align-items: center;
  padding: 12px 20px; 
  height: 52px; 
  background: #FFFFFF;
  border-top: 1px solid #DFE5EC;
}
.total-text { 
  font-size: 12.5px; 
  color: #667383; 
}
.pagination-controls { 
  display: flex; 
  align-items: center; 
  gap: 12px; 
}
.page-size-text { 
  font-size: 12.5px; 
  color: #667383; 
}

/* 定制分页器 */
:deep(.custom-pagination .el-pagination__total) { 
  display: none; 
}
:deep(.custom-pagination button), 
:deep(.custom-pagination .el-pager li) {
  width: 28px; 
  height: 28px; 
  border-radius: 8px; 
  background: #FFFFFF;
  border: 1px solid #E2E9F0; 
  color: #667383; 
  margin: 0 4px;
  font-size: 12.5px; 
  display: flex; 
  align-items: center; 
  justify-content: center;
}
:deep(.custom-pagination .el-pager li.is-active) {
  background: #0278E7; 
  border-color: #0278E7; 
  color: #FFFFFF;
}
</style>