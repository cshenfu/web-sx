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
        <div class="table-area">
          <CommonTable
            :data="pagedTableData"
            :columns="columns"
            :total="filteredData.length"
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :show-page-sizes="true"
            :show-jumper="true"
          >
            <!-- 状态 -->
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

// ================= 筛选 =================
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
  background: linear-gradient(122deg, #eef3fa 0%, #f7f8fc 48%, #eaf2fb 100%);
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
  font-size: 14px;
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

/* 日期范围选择器 */
.filter-date {
  flex: 0 0 250px;
  width: 250px !important;
}

.filter-row :deep(.el-date-editor.filter-date),
.filter-row :deep(.el-date-editor--daterange.el-input__wrapper) {
  flex: 0 0 250px;
  width: 250px !important;
  height: 26px !important;
  min-height: 26px !important;
  padding: 0 8px !important;
  box-sizing: border-box;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 0 0 1px #dfe6ee inset;
}

.filter-row :deep(.el-date-editor.filter-date:hover) {
  box-shadow: 0 0 0 1px #cbd7e5 inset;
}

.filter-row :deep(.el-date-editor.filter-date.is-active),
.filter-row :deep(.el-date-editor.filter-date:focus-within) {
  box-shadow: 0 0 0 1px #1686e9 inset;
}

/* 日期输入文字 */
.filter-row :deep(.el-date-editor .el-range-input) {
  flex: 1 1 0;
  width: 0;
  min-width: 0;
  height: 24px;
  padding: 0;
  line-height: 24px;
  font-size: 14px !important;
  color: #536274;
  background: transparent;
}

.filter-row :deep(.el-date-editor .el-range-input::placeholder) {
  font-size: 12px;
  color: #8190a2;
}

/* 日期分隔符 */
.filter-row :deep(.el-date-editor .el-range-separator) {
  flex: 0 0 16px;
  width: 16px;
  height: 24px;
  padding: 0;
  line-height: 24px;
  font-size: 12px;
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
  font-size: 12px;
  line-height: 24px;
}

/* 部门选择框 */
.filter-select {
  flex: 0 0 140px;
  width: 140px;
}

/* 普通搜索输入框 */
.filter-input {
  flex: 0 0 160px;
  width: 160px;
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
  padding: 0 9px;
  box-sizing: border-box;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 0 0 1px #dfe6ee inset;
  transition: box-shadow 0.15s ease;
}

.filter-row :deep(.el-input__wrapper:hover),
.filter-row :deep(.el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px #cbd7e5 inset;
}

.filter-row :deep(.el-input__wrapper.is-focus),
.filter-row :deep(.el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px #1686e9 inset;
}

/* 输入文字 / 占位文字 */
.filter-row :deep(.el-input__inner),
.filter-row :deep(.el-select__placeholder),
.filter-row :deep(.el-select__selected-item) {
  height: 24px;
  line-height: 24px;
  font-size: 14px;
  color: #536274;
}

.filter-row :deep(.el-input__inner::placeholder) {
  font-size: 12px;
  color: #8190a2;
}

/* 清除、前缀、后缀图标 */
.filter-row :deep(.el-input__suffix-inner),
.filter-row :deep(.el-input__prefix-inner) {
  font-size: 14px;
}

/* 搜索按钮组 */
.filter-buttons {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 7px;
}

/* 重置 / 搜索按钮 */
.btn-reset,
.btn-search {
  height: 26px;
  padding: 0 14px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 400;
}

.btn-reset {
  color: #657487;
  background: #fff;
  border: 1px solid #dfe6ee;
}

.btn-reset:hover {
  color: #167ddd;
  background: #f2f8ff;
  border-color: #b9d4ed;
}

.btn-search {
  color: #fff !important;
  background: #087fe5 !important;
  border-color: #087fe5 !important;
  box-shadow: 0 3px 8px rgba(8, 127, 229, 0.15);
}

.btn-search:hover {
  background: #0874d0 !important;
  border-color: #0874d0 !important;
}

/* ========== 表格区域容器 ========== */
.table-area {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  padding: 10px 14px 14px;
  box-sizing: border-box;
  overflow: hidden;
}

/* ========== 状态标签 ========== */
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
    flex-basis: 150px;
    width: 150px;
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

  .table-area {
    padding: 8px;
  }
}
</style>