<template>
  <div class="log-root">
    <!-- 💡 用 v-show 控制列表页的显隐 -->
    <div class="admin-page-bg" v-show="!showReportPreview">
      <!-- 背景光晕层 -->
      <div class="bg-glow bg-glow-top-left"></div>
      <div class="bg-glow bg-glow-bottom-right"></div>
      <div class="bg-glow bg-glow-top-right"></div>

      <!-- 顶部 Header -->
      <div class="admin-page-header">
        <span class="page-title">{{ isDraft ? '智能评审草稿' : '智能评审项目' }}</span>
        <el-button type="primary" class="btn-add" @click="handleAddProject">添加项目</el-button>
      </div>

      <!-- 主卡片 -->
      <div class="admin-main-card">
        <!-- 搜索栏 -->
        <div class="admin-filter-bar">
          <div class="filter-row">
            <!-- 所属区域 -->
            <el-select v-model="searchForm.region" placeholder="所属区域" clearable class="filter-select">
              <el-option label="陕西省延安市延长区" value="延长区" />
              <el-option label="陕西省西安市" value="西安市" />
            </el-select>
            <!-- 项目类型 -->
            <el-select v-model="searchForm.projectType" placeholder="项目类型" clearable class="filter-select">
              <el-option label="风电" value="wind" />
              <el-option label="光伏" value="solar" />
            </el-select>
            <!-- 全部状态 -->
            <el-select v-model="searchForm.status" placeholder="全部状态" clearable class="filter-select">
              <el-option label="计划中" value="planning" />
              <el-option label="排队中" value="queueing" />
              <el-option label="已完成" value="completed" />
            </el-select>
            <!-- 创建时间 -->
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="~"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="YYYY-MM-DD"
              class="filter-date"
            />
            <!-- 项目编号 -->
            <el-input
              v-model="searchForm.projectCode"
              placeholder="项目编号"
              clearable
              class="filter-input"
              @keyup.enter="handleSearch"
            />
            <!-- 项目名称 -->
            <el-input
              v-model="searchForm.projectName"
              placeholder="项目名称"
              clearable
              class="filter-input"
              @keyup.enter="handleSearch"
            />
            <!-- 按钮组 -->
            <div class="filter-buttons">
              <el-button type="primary" class="btn-search" @click="handleSearch">搜索</el-button>
              <el-button class="btn-reset" @click="handleReset">重置</el-button>
            </div>
          </div>
        </div>

        <!-- 表格 + 分页 -->
        <div class="admin-table-area" v-loading="loading">
          <CommonTable
            :data="tableData"
            :columns="columns"
            :total="total"
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :show-page-sizes="true"
            :show-jumper="true"
            :action-width="120"
            @row-click="handleRowClick"
          >
            <!-- 项目名称列 -->
            <template #projectName="{ row }">
              <div class="project-name-cell">
                <span>{{ row.projectName }}</span>
                <span v-if="row.projectType === 'wind'" class="type-tag tag-wind">风电</span>
                <span v-if="row.projectType === 'solar'" class="type-tag tag-solar">光伏</span>
              </div>
            </template>

            <!-- 状态列 -->
            <template #status="{ row }">
              <span :class="['status-text', row.status]">{{ row.statusText }}</span>
            </template>

            <!-- 操作列 -->
            <template #actions="{ row }">
              <div @click.stop>
                <template v-if="row.status === 'completed'">
                  <el-button link type="primary" class="action-btn" @click="handleView(row)">查看</el-button>
                </template>
                <template v-else>
                  <el-button link type="primary" class="action-btn" @click="handleCancel(row)">取消</el-button>
                </template>
                <el-button link type="danger" class="action-btn btn-delete" @click="handleDelete(row)">删除</el-button>
              </div>
            </template>
          </CommonTable>
        </div>
      </div>
    </div>

    <!-- 💡 全屏预览组件（嵌在当前 Layout 内部） -->
    <ReviewReportPreview
      v-if="showReportPreview"
      :visible="showReportPreview"
      :project-row="currentSelectedRow"
      @close="showReportPreview = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import CommonTable from '@/views/guizhi/components/CommonTable.vue'
import ReviewReportPreview from './components/ReviewReportPreview.vue'
// 💡 引入智能评审分页接口
import { getZNPSPage } from '@/api/modules/report'

const router = useRouter()
const route = useRoute()

// 判断当前是草稿页还是项目页
const isDraft = computed(() => route.name === 'ReviewDraft')

// ================= 分页 =================
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

// ================= 搜索表单 =================
const searchForm = reactive({
  region: '',
  projectType: '',
  status: '',
  dateRange: [],
  projectCode: '',
  projectName: ''
})

// ================= 表格列配置 =================
const columns = [
  { prop: 'projectCode',     label: '项目编号',     minWidth: 120 },
  { prop: 'projectName',     label: '项目名称',     minWidth: 300, slot: 'projectName' },
  { prop: 'region',          label: '项目区域',     minWidth: 180 },
  { prop: 'totalCapacity',   label: '总规划容量',   minWidth: 100 },
  { prop: 'currentCapacity', label: '本期规划容量', minWidth: 110 },
  { prop: 'status',          label: '状态',         minWidth: 100, slot: 'status' },
  { prop: 'company',         label: '所属',         minWidth: 120 },
  { prop: 'creator',         label: '创建人',       minWidth: 100 },
  { prop: 'approver',        label: '审批',         minWidth: 80 },
  { prop: 'createTime',      label: '创建时间',     minWidth: 160 }
]

// ================= 工具函数 =================
/** 时间戳格式化 YYYY-MM-DD HH:mm:ss */
const formatTimestamp = (ts) => {
  if (!ts) return ''
  const d = new Date(ts)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

/** 后端状态 -> 前端状态映射（请根据实际枚举调整） */
const mapStatus = (reportProjectStatus) => {
  const map = {
    '1': { status: 'planning', statusText: '计划中' },
    '2': { status: 'queueing', statusText: '排队中' },
    '3': { status: 'queueing', statusText: '排队中' },
    '4': { status: 'completed', statusText: '已完成' }
  }
  return map[reportProjectStatus] || { status: 'planning', statusText: '计划中' }
}

/** 后端项目类型 -> 前端项目类型（1 风电 / 2 光伏，请根据实际枚举调整） */
const mapProjectType = (reportItemType) => {
  return reportItemType === 1 ? 'wind' : 'solar'
}

// ================= 获取列表数据 =================
const fetchTableData = async () => {
  loading.value = true
  try {
    const params = {
      pageNo: currentPage.value,
      pageSize: pageSize.value,
      projectCode: searchForm.projectCode || '',
      projectName: searchForm.projectName || ''
    }

    // 如果后端支持以下筛选条件，可按实际参数名传入（当前接口示例只给了上面四个）
    if (searchForm.region) params.region = searchForm.region
    if (searchForm.projectType) {
      params.reportItemType = searchForm.projectType === 'wind' ? 1 : 2
    }
    if (searchForm.status) {
      const statusMap = { planning: '1', queueing: '2', completed: '4' }
      params.reportProjectStatus = statusMap[searchForm.status]
    }
    if (searchForm.dateRange?.length) {
      params.startTime = searchForm.dateRange[0]
      params.endTime = searchForm.dateRange[1]
    }

    const res = await getZNPSPage(params)
    const list = res?.data?.list || []
    total.value = res?.data?.total || 0

    tableData.value = list.map((item) => {
      const statusInfo = mapStatus(item.reportProjectStatus)
      return {
        ...item, // 保留原始字段，供预览组件使用（reviewProjectId 等）
        projectCode: item.reportProjectCode,
        projectName: item.reportProjectName,
        projectType: mapProjectType(item.reportItemType),
        region: [item.provinceName, item.cityName, item.districtName].filter(Boolean).join('') || '',
        totalCapacity: item.totalProjectCapacity,
        currentCapacity: item.currentProjectCapacity,
        status: statusInfo.status,
        statusText: statusInfo.statusText,
        company: '', // 接口未返回，按需补充
        creator: '', // 接口未返回，按需补充
        approver: '', // 接口未返回，按需补充
        createTime: formatTimestamp(item.createTime)
      }
    })
  } catch (error) {
    console.error('获取智能评审列表失败', error)
    ElMessage.error('获取列表失败')
    tableData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const tableData = ref([])

onMounted(() => {
  fetchTableData()
})

// ================= 分页变化时重新请求 =================
watch([currentPage, pageSize], () => {
  fetchTableData()
})

// ================= 💡 行点击预览逻辑 =================
const showReportPreview = ref(false)
const currentSelectedRow = ref({})

const handleRowClick = (row) => {
  currentSelectedRow.value = row
  showReportPreview.value = true
}

// ================= 交互操作 =================
const handleAddProject = () => {
  router.push('/yanping/review/create')
}

const handleSearch = () => {
  // 如果当前不是第一页，修改 currentPage 会触发 watch 自动请求
  if (currentPage.value === 1) {
    fetchTableData()
  } else {
    currentPage.value = 1
  }
}

const handleReset = () => {
  searchForm.region = ''
  searchForm.projectType = ''
  searchForm.status = ''
  searchForm.dateRange = []
  searchForm.projectCode = ''
  searchForm.projectName = ''

  if (currentPage.value === 1) {
    fetchTableData()
  } else {
    currentPage.value = 1
  }
}

const handleView = (row) => {
  handleRowClick(row)
}

const handleCancel = (row) => {
  ElMessageBox.confirm('确定要取消该项目吗？', '提示', { type: 'warning' }).then(() => {
    ElMessage.success('已取消')
    fetchTableData()
  }).catch(() => {})
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该项目吗？', '提示', { type: 'warning' }).then(() => {
    ElMessage.success('删除成功')
    fetchTableData()
  }).catch(() => {})
}
</script>

<style scoped lang="scss">
/* 原样式保持不变 */
@import '@/views/guizhi/components/css/admin-common.scss';

.log-root {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* ================= 顶部 Header 布局调整 ================= */
.admin-page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px 10px !important;

  .page-title {
    font-size: 16px !important;
    font-weight: bold !important;
    color: #333;
  }
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

/* 让表格区域贴边 */
.admin-table-area {
  padding: 0 0 10px !important;
}

/* ========== 搜索栏控件强制宽度控制（解决日期选择器拉伸问题） ========== */
.filter-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;

  :deep(.el-date-editor.filter-date) {
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
  .filter-buttons {
    display: flex;
    gap: 8px;
  }
}

/* ========== 表格内自定义样式 ========== */
.project-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;

  .type-tag {
    display: inline-flex;
    align-items: center;
    padding: 0 6px;
    height: 20px;
    border-radius: 4px;
    font-size: 12px;
    line-height: 1;
  }
  .tag-wind {
    color: #1677ff;
    background-color: #e6f4ff;
  }
  .tag-solar {
    color: #fa8c16;
    background-color: #fff7e6;
  }
}

/* 状态纯文字颜色 */
.status-text {
  font-size: 14px;
  font-weight: 500;
}
.status-text.planning {
  color: #1677ff;
}
.status-text.queueing {
  color: #faad14;
}
.status-text.completed {
  color: #52c41a;
}

/* 操作列按钮样式微调 */
.action-btn {
  padding: 0;
  margin-right: 12px;
  font-size: 13px;
}
.action-btn:last-child {
  margin-right: 0;
}
.btn-delete {
  color: #ff4d4f;
}
</style>