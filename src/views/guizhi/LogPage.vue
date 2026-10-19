<template>
  <div class="page-container">
    <!-- 顶部标题 -->
    <div class="page-header">
      <h2 class="page-title">日志管理</h2>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <div class="filter-item">
        <span class="label">创建时间</span>
        <el-date-picker
          v-model="searchForm.dateRange"
          type="daterange"
          range-separator="~"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          value-format="YYYY-MM-DD"
          style="width: 260px;"
        />
      </div>
      
      <div class="filter-item">
        <el-select v-model="searchForm.dept" placeholder="组织/部门" clearable style="width: 160px;">
          <el-option label="企业名称" value="企业名称" />
          <el-option label="技术部" value="技术部" />
        </el-select>
      </div>

      <div class="filter-item">
        <el-input v-model="searchForm.logName" placeholder="日志名称" clearable style="width: 160px;" />
      </div>

      <div class="filter-item">
        <el-input v-model="searchForm.account" placeholder="用户账号" clearable style="width: 160px;" />
      </div>

      <div class="filter-item">
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <!-- 表格展示区 -->
    <div class="table-container">
      <el-table :data="tableData" style="width: 100%" header-cell-class-name="table-header">
        <el-table-column prop="time" label="时间" min-width="160" />
        <el-table-column prop="logType" label="日志类型" min-width="120" />
        <el-table-column prop="account" label="用户账号" min-width="150" />
        <el-table-column prop="dept" label="所属组织/部门" min-width="150" />
        <el-table-column prop="logName" label="日志名称" min-width="180" />
        <el-table-column prop="status" label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag 
              :type="row.status === '成功' ? 'success' : 'danger'" 
              effect="plain"
              size="small"
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
      />
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

// 表格假数据（基于截图创建）
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
  ElMessage.success('触发搜索（模拟）')
  // 实际接入时在这里调用接口，带上 searchForm 参数
}

const handleReset = () => {
  searchForm.dateRange = []
  searchForm.dept = ''
  searchForm.logName = ''
  searchForm.account = ''
  handleSearch()
}
</script>

<style scoped>
.page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 24px;
  background-color: #fff;
  box-sizing: border-box;
}

/* 顶部 Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

/* 搜索栏 */
.search-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
}
.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.search-bar .label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

/* 表格区 */
.table-container {
  flex: 1;
  overflow: hidden;
}
:deep(.table-header) {
  background-color: #f8fafc !important;
  color: #333;
  font-weight: 500;
}

/* 分页 */
.pagination-wrap {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>