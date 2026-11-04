<template>
  <div class="log-root">
    <!-- 统一背景 -->
    <div class="admin-page-bg">
      <!-- 背景光晕层 -->
      <div class="bg-glow bg-glow-top-left"></div>
      <div class="bg-glow bg-glow-bottom-right"></div>
      <div class="bg-glow bg-glow-top-right"></div>

      <!-- 顶部 Header -->
      <div class="admin-page-header">
        <span class="page-title">日志管理</span>
      </div>

      <!-- 主卡片 -->
      <div class="admin-main-card">
        <!-- 搜索栏 -->
        <div class="admin-filter-bar">
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

            <el-select
              v-model="searchForm.dept"
              placeholder="组织/部门"
              clearable
              class="filter-select"
            >
              <el-option label="企业名称" value="企业名称" />
              <el-option label="技术部" value="技术部" />
              <el-option label="财务部" value="财务部" />
              <el-option label="运营部" value="运营部" />
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

        <!-- 表格 + 分页 -->
        <div class="admin-table-area">
          <CommonTable
            :data="pagedTableData"
            :columns="columns"
            :total="filteredData.length"
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :show-page-sizes="true"
            :show-jumper="true"
          >
            <!-- 状态列 -->
            <template #status="{ row }">
              <el-tag
                :type="row.status === '成功' ? 'success' : 'danger'"
                effect="light"
                class="status-tag"
              >
                {{ row.status }}
              </el-tag>
            </template>
          </CommonTable>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import CommonTable from './components/CommonTable.vue'

// ================= 分页 =================
const currentPage = ref(1)
const pageSize = ref(10)

// ================= 搜索表单 =================
const searchForm = reactive({
  dateRange: [],
  dept: '',
  logName: '',
  account: ''
})

// ================= 生成假数据（30 条，便于演示分页） =================
const logTypes = ['登录/注销', '项目相关', '数据操作', '系统设置', '权限管理']
const accounts = ['zhangsan001', 'lisi002', 'wangwu003', 'zhaoliu004', 'sunqi005']
const depts = ['企业名称', '技术部', '财务部', '运营部']
const logNames = ['登录', '注销', '创建项目', '项目结果推送手机号', '导出数据', '修改配置', '新增角色', '删除用户']
const statuses = ['成功', '失败']

const generateLogs = (n) => {
  const list = []
  for (let i = 0; i < n; i++) {
    const day = String((i % 28) + 1).padStart(2, '0')
    const hour = String(8 + (i % 10)).padStart(2, '0')
    const minute = String((i * 7) % 60).padStart(2, '0')
    list.push({
      id: i + 1,
      time: `2024-09-${day} ${hour}:${minute}:00`,
      logType: logTypes[i % logTypes.length],
      account: accounts[i % accounts.length],
      dept: depts[i % depts.length],
      logName: logNames[i % logNames.length],
      status: statuses[i % statuses.length],
      content: ''
    })
  }
  return list
}

const tableData = ref(generateLogs(30))

// ================= 表格列配置 =================
const columns = [
  { prop: 'time',    label: '时间',          minWidth: 160 },
  { prop: 'logType', label: '日志类型',      minWidth: 120 },
  { prop: 'account', label: '用户账号',      minWidth: 150 },
  { prop: 'dept',    label: '所属组织/部门', minWidth: 150 },
  { prop: 'logName', label: '日志名称',      minWidth: 180 },
  { prop: 'status',  label: '状态',          minWidth: 100, slot: 'status' },
  { prop: 'content', label: '操作内容',      minWidth: 250, showOverflowTooltip: true }
]

// ================= 筛选逻辑 =================
const filteredData = computed(() => {
  const [start, end] = searchForm.dateRange || []
  const logName = (searchForm.logName || '').trim().toLowerCase()
  const account = (searchForm.account || '').trim().toLowerCase()

  return tableData.value.filter((row) => {
    if (searchForm.dept && row.dept !== searchForm.dept) return false
    if (logName && !row.logName.toLowerCase().includes(logName)) return false
    if (account && !row.account.toLowerCase().includes(account)) return false

    if (start || end) {
      const rowDate = row.time.slice(0, 10)
      if (start && rowDate < start) return false
      if (end && rowDate > end) return false
    }

    return true
  })
})

// ================= 分页切片 =================
const pagedTableData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredData.value.slice(start, start + pageSize.value)
})

// ================= 搜索 / 重置 =================
const handleSearch = () => {
  currentPage.value = 1
  ElMessage.success(`搜索完成，共 ${filteredData.value.length} 条`)
}

const handleReset = () => {
  searchForm.dateRange = []
  searchForm.dept = ''
  searchForm.logName = ''
  searchForm.account = ''
  currentPage.value = 1
}
</script>

<style scoped lang="scss">
/* 引入公共样式 */
@import './components/css/admin-common.scss';

.log-root {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* ================= 核心修改：去掉大卡片白边与搜索栏底色 ================= */
.admin-main-card {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  margin: 10px 16px 14px !important;
}

.admin-filter-bar {
  background: transparent !important;
  border-bottom: none !important;
  padding: 0 !important;
  
  .filter-row {
    padding: 0 !important;
    margin-bottom: 10px !important;
  }
}

/* 让表格区域贴边，去掉左侧多余的 padding 偏差 */
.admin-table-area {
  padding: 0 0 10px !important;
}


/* ========== 搜索栏控件宽度控制 ========== */
.filter-row {
  .filter-date {
    width: 260px !important;
    max-width: 260px !important;
    flex: none !important;
  }
  .filter-select {
    width: 140px !important;
    max-width: 140px !important;
    flex: none !important;
  }
  .filter-input {
    width: 160px !important;
    max-width: 160px !important;
    flex: none !important;
  }
}

/* ========== 状态标签定制 ========== */
.status-tag {
  height: 22px;
  padding: 0 9px;
  border: 1px solid transparent;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
  line-height: 20px;
}

:deep(.status-tag.el-tag--success) {
  color: #16834a;
  background: #edf8f1;
  border-color: #d3efdd;
}

:deep(.status-tag.el-tag--danger) {
  color: #d14343;
  background: #fff1f0;
  border-color: #ffddda;
}

/* 响应式调整 */
@media (max-width: 1100px) {
  .filter-row {
    .filter-date { width: 230px !important; max-width: 230px !important; flex: none !important; }
    .filter-select { width: 130px !important; max-width: 130px !important; flex: none !important; }
    .filter-input { width: 150px !important; max-width: 150px !important; flex: none !important; }
  }
}
@media (max-width: 768px) {
  .filter-row {
    flex-wrap: wrap;
    .filter-date { width: 100% !important; max-width: 100% !important; flex: 1 1 100% !important; }
    .filter-select, .filter-input { flex: 1 1 130px !important; width: auto !important; max-width: none !important; }
  }
}
</style>