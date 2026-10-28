<!-- components/area-panel/tabs/ProjectReportTab.vue -->
<template>
  <div class="project-report-tab">
    <!-- 子 Tab 保持原样 -->
    <div class="sub-tabs" v-if="!hideSubTabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        class="sub-tab"
        :class="{ active: activeSubTab === tab.key }"
        @click="handleTabChange(tab.key)"
      >
        {{ tab.label }}
        <span class="count">({{ tab.count }})</span>
      </button>
    </div>

    <div class="table-wrap" v-loading="loading">
      <table class="report-table">
        <thead>
          <tr>
            <th>文件ID</th>
            <th>计算类型</th>
            <th>文件类型</th>
            <th>请示单位</th>
            <th>装机容量/MW</th>
            <th>状态</th>
            <th>备注</th>
            <th>创建时间</th>
            <th class="sticky-col" style="width: 140px; min-width: 140px;">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in list" :key="row.id">
            <td class="font-bold">{{ row.id }}</td>
            <td>{{ row.sourceTypeDesc || '-' }}</td>
            <td>{{ row.reportTypeDesc || '-' }}</td>
            <td class="ellipsis" :title="row.declaringUnit">{{ row.declaringUnit || '-' }}</td>
            <td>{{ row.currentCapacityMw ?? '-' }}</td>
            <td>
              <span class="status-tag" :style="{ color: getStatusColor(row.status, row.statusDesc) }">
                {{ row.displayStatusDesc || row.statusDesc || '-' }}
              </span>
            </td>
            <td class="ellipsis" :title="row.remark">{{ row.remark || '--' }}</td>
            <td class="text-gray">{{ formatDateTime(row.createTime) }}</td>
            
            <td class="sticky-col" style="width: 140px; min-width: 140px;">
              <div class="action-cell">
                <!-- ★ 新增：待确认按钮 -->
                <button 
                  v-if="row.displayStatus === 'PENDING_CONFIRM'" 
                  class="action-btn warning" 
                  @click="handleOpenConfirm(row)"
                >待确认</button>

                <button 
                  v-if="row.fileUrl" 
                  class="action-btn primary" 
                  @click="handlePreview(row)"
                >预览</button>
                
                <button 
                  v-if="row.status === 'GENERATING'" 
                  class="action-btn danger" 
                  @click="handleTerminate(row)"
                >终止计算</button>
                
                <button 
                  v-if="row.hasMoreActions" 
                  class="action-btn more" 
                  title="更多"
                  @click="$emit('row-action', row)"
                >···</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-if="!list.length && !loading" class="empty-state">暂无数据~</div>
    </div>

    <div class="pagination-wrap" v-if="total > 0">
      <el-pagination
        v-model:current-page="pageNo"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        small
        background
        @current-change="fetchList"
        @size-change="handleSizeChange"
      />
    </div>

    <!-- ★ 新增：数据确认弹窗/面板 -->
    <el-dialog
      v-model="confirmDialogVisible"
      title="数据解析确认"
      width="600px"
      :close-on-click-modal="false"
      class="confirm-dialog"
    >
      <div v-loading="paramsLoading" class="confirm-content">
        <template v-if="confirmData">
          <p class="confirm-tip">请核对系统解析出的以下数据，确认无误后点击下方"确认"按钮。</p>
          
          <!-- 临时展示：如果你希望后续换成标准的表单，只需在这里替换掉下面这段 v-for -->
          <div class="data-preview">
            <div class="data-row" v-for="(val, key) in filterDisplayData(confirmData)" :key="key">
              <span class="data-label">{{ key }}</span>
              <span class="data-value">{{ val ?? '-' }}</span>
            </div>
          </div>
        </template>
        <div v-else class="empty-tip">暂无解析数据</div>
      </div>

      <template #footer>
        <el-button @click="confirmDialogVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          :loading="confirming" 
          :disabled="paramsLoading || !confirmData"
          @click="handleMakeSure"
        >
          确认无误
        </el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
// ★ 引入需要的接口
import { 
  pageReport, 
  terminateCalculation, 
  getParamsData, // 假设接口名叫这个，请根据实际导出调整
  userMakeSure   // 假设接口名叫这个，请根据实际导出调整
} from '@/api/modules/aiProject'

const props = defineProps({
  project: { type: Object, required: true },
  initialSubTab: { type: String, default: '' }, 
  hideSubTabs: { type: Boolean, default: false } 
})
const emit = defineEmits(['row-action'])

const tabs = ref([
  { key: 'PROJECT_PROPOSAL', label: '项目建议书', count: 0 },
  { key: 'FEASIBILITY_STUDY', label: '可研报告', count: 0 },
  { key: 'COMPETITIVE_ALLOCATION', label: '竞配申报报告', count: 0 },
  { key: 'PROJECT_INITIATION', label: '请示文件', count: 0 },
  { key: 'POST_EVALUATION', label: '后评价报告', count: 0 },
])

const activeSubTab = ref(tabs.value[0].key)
const loading = ref(false)
const list = ref([])
const total = ref(0)
const pageNo = ref(1)
const pageSize = ref(10)

// ★ 新增：确认弹窗相关状态
const confirmDialogVisible = ref(false)
const paramsLoading = ref(false)
const confirming = ref(false)
const confirmData = ref(null)
const currentRowId = ref(null)

// 监听外部传入的初始子 Tab
watch(() => props.initialSubTab, (val) => {
  if (val && tabs.value.some(t => t.key === val)) {
    activeSubTab.value = val
    pageNo.value = 1
    fetchList()
  }
}, { immediate: true })

async function fetchList() {
  if (!props.project?.id) return
  loading.value = true
  try {
    const params = {
      aiProjectId: props.project.id,
      reportType: activeSubTab.value,
      pageNo: pageNo.value,
      pageSize: pageSize.value,
    }
    const res = await pageReport(params)
    if (res?.code === 0 || res?.code === 200) {
      list.value = res.data?.list || []
      total.value = Number(res.data?.total) || 0
      
      const currentTab = tabs.value.find(t => t.key === activeSubTab.value)
      if (currentTab) currentTab.count = total.value
    }
  } catch (err) {
    console.error('获取报告列表失败:', err)
  } finally {
    loading.value = false
  }
}

async function fetchAllTabCounts() {
  if (!props.project?.id) return
  try {
    const promises = tabs.value.map(tab => 
      pageReport({ aiProjectId: props.project.id, reportType: tab.key, pageNo: 1, pageSize: 1 })
    )
    const results = await Promise.all(promises)
    results.forEach((res, index) => {
      if (res?.code === 0 || res?.code === 200) {
        tabs.value[index].count = Number(res.data?.total) || 0
      }
    })
  } catch (err) {
    console.error('获取数量失败:', err)
  }
}

function handleTabChange(key) {
  if (activeSubTab.value === key) return
  activeSubTab.value = key
  pageNo.value = 1
  fetchList()
}

function handleSizeChange() {
  pageNo.value = 1
  fetchList()
}

function handlePreview(row) {
  if (!row.fileUrl) return ElMessage.warning('无预览地址')
  window.open(row.fileUrl, '_blank')
}

function handleTerminate(row) {
  ElMessageBox.confirm('确定要终止该任务的计算吗？', '提示', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  }).then(async () => {
    try {
      loading.value = true
      const res = await terminateCalculation(row.id)
      if (res?.code === 0 || res?.code === 200) {
        ElMessage.success('终止成功')
        fetchList()
      } else {
        ElMessage.error(res?.msg || '终止失败')
      }
    } catch (err) {
      ElMessage.error('终止计算失败')
    } finally {
      loading.value = false
    }
  }).catch(() => {})
}

// ★ 新增：打开待确认弹窗并请求数据
async function handleOpenConfirm(row) {
  currentRowId.value = row.id
  confirmDialogVisible.value = true
  paramsLoading.value = true
  confirmData.value = null

  try {
    // 替换为你实际定义的接口名，假设返回格式为 res.data
    const res = await getParamsData(row.id)
    if (res?.code === 0 || res?.code === 200) {
      confirmData.value = res.data || {}
    } else {
      ElMessage.error(res?.msg || '获取解析数据失败')
    }
  } catch (err) {
    console.error('获取解析数据失败:', err)
    ElMessage.error('获取解析数据异常')
  } finally {
    paramsLoading.value = false
  }
}

// ★ 新增：提交确认
async function handleMakeSure() {
  if (!currentRowId.value) return
  confirming.value = true
  try {
    // 替换为你实际定义的接口名
    const res = await userMakeSure(currentRowId.value)
    if (res?.code === 0 || res?.code === 200) {
      ElMessage.success('确认成功')
      confirmDialogVisible.value = false
      fetchList() // 刷新当前列表
      fetchAllTabCounts() // 刷新各 Tab 数量
    } else {
      ElMessage.error(res?.msg || '确认失败')
    }
  } catch (err) {
    console.error('确认失败:', err)
    ElMessage.error('确认请求异常')
  } finally {
    confirming.value = false
  }
}

// ★ 新增：过滤要展示的数据（比如你不需要展示 createTime 时间戳）
function filterDisplayData(data) {
  if (!data) return {}
  // 暂时全量展示，后续你可以根据实际字段删减，如：
  // const { createTime, id, ...rest } = data
  // return rest
  return data
}

function formatDateTime(val) {
  if (!val) return '-'
  if (typeof val === 'number' || /^\d+$/.test(String(val))) {
    const d = new Date(Number(val))
    if (!isNaN(d.getTime())) {
      const pad = (n) => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
    }
  }
  if (typeof val === 'string') {
    return val.replace('T', ' ').substring(0, 19)
  }
  return val
}

function getStatusColor(status, desc) {
  const s = status || ''
  const d = desc || ''
  if (d.includes('完成') || d.includes('成功') || s === 'COMPLETED') return '#00AE0F'
  if (d.includes('计算') || d.includes('解析') || d.includes('生成') || s === 'GENERATING' || s === 'PARSING') return '#2664EB'
  if (d.includes('排队') || d.includes('等待') || d.includes('待') || s === 'PENDING' || s === 'QUEUING' || s === 'PENDING_CONFIRM') return '#EF9600'
  if (d.includes('失败') || s === 'FAILED') return '#D81D1D'
  if (d.includes('终止') || s === 'TERMINATED') return '#8D8D8D'
  return '#303133'
}

onMounted(async () => {
  await fetchAllTabCounts()
  fetchList()
})

watch(() => props.project?.id, async (newId) => {
  if (newId) {
    pageNo.value = 1
    await fetchAllTabCounts()
    fetchList()
  }
})
</script>

<style scoped>
/* 保持你原来的样式不变 */
.project-report-tab { display: flex; flex-direction: column; height: 100%; padding: 16px 24px; overflow: hidden; background: transparent; }
.sub-tabs { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
.sub-tab { display: inline-flex; align-items: center; justify-content: center; height: 32px; padding: 0 12px; border-radius: 4px; font-family: 'PingFang SC', sans-serif; font-size: 14px; cursor: pointer; transition: all 0.2s; background: rgba(255, 255, 255, 0.6); border: 1px solid rgba(255, 255, 255, 0.4); color: #000000; }
.sub-tab:hover { background: rgba(255, 255, 255, 0.8); }
.sub-tab .count { margin-left: 4px; color: #6E8ADC; font-size: 12px; }
.sub-tab.active { background: rgba(255, 255, 255, 0.8); border: 1px solid #1D4ED8; box-shadow: 0px 2px 4px rgba(29, 78, 216, 0.3); color: #1D4ED8; font-weight: 600; }
.sub-tab.active .count { color: #1D4ED8; }
.table-wrap { flex: 1; min-height: 0; overflow: auto; position: relative; background: rgba(255, 255, 255, 0.3); border: 1px solid rgba(255, 255, 255, 0.6); box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05); border-radius: 8px; }
.table-wrap::-webkit-scrollbar { width: 6px; height: 6px; }
.table-wrap::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.2); border-radius: 4px; }
.report-table { width: 100%; min-width: 1050px; table-layout: fixed; border-collapse: separate; border-spacing: 0; font-size: 12px; }
.report-table th { position: sticky; top: 0; padding: 8px; color: #1F2937; text-align: center; font-weight: 400; background: rgba(241, 245, 249, 0.6); border-bottom: 1px solid rgba(209, 213, 219, 0.4); border-right: 1px solid rgba(209, 213, 219, 0.4); white-space: nowrap; z-index: 2; }
.report-table td { padding: 8px; color: #374151; text-align: center; border-bottom: 1px solid rgba(209, 213, 219, 0.4); border-right: 1px solid rgba(209, 213, 219, 0.5); white-space: nowrap; background: transparent; }
.report-table th:last-child, .report-table td:last-child { border-right: none; }
.report-table tbody tr:nth-child(even) td { background: rgba(255, 255, 255, 0.15); }
.report-table tbody tr:hover td { background: rgba(255, 255, 255, 0.5) !important; }
.report-table td.ellipsis { max-width: 180px; overflow: hidden; text-overflow: ellipsis; }
.report-table td.font-bold { font-weight: 700; color: #111827; }
.report-table td.text-gray { color: #374151; }
.sticky-col { position: sticky !important; right: 0 !important; background: rgba(255, 255, 255, 0.85) !important; backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); box-shadow: -6px 0 10px rgba(0, 0, 0, 0.05); z-index: 9 !important; }
.report-table th.sticky-col { background: rgba(241, 245, 249, 0.95) !important; z-index: 10 !important; }
.report-table tbody tr:nth-child(even) td.sticky-col { background: rgba(255, 255, 255, 0.9) !important; }
.report-table tbody tr:hover td.sticky-col { background: rgba(255, 255, 255, 0.95) !important; }
.status-tag { font-weight: 500; font-size: 12px; }
.action-cell { display: flex; align-items: center; justify-content: center; gap: 8px; }
.action-btn { padding: 0; border: none; background: none; font-size: 12px; cursor: pointer; }
.action-btn:hover { text-decoration: underline; }
.action-btn.primary { color: #1D4ED8; }
.action-btn.danger { color: #D81D1D; }
.action-btn.more { color: #333333; font-weight: bold; font-size: 14px; }
/* ★ 新增：警告/待确认按钮样式 */
.action-btn.warning { color: #EF9600; font-weight: 500; }
.empty-state { padding: 32px 0; color: #9CA3AF; text-align: center; font-size: 12px; }
.pagination-wrap { display: flex; justify-content: flex-end; padding-top: 12px; margin-top: 8px; }

/* ★ 新增：确认弹窗内部样式 */
.confirm-content { min-height: 100px; }
.confirm-tip { margin-top: 0; margin-bottom: 16px; color: #606266; font-size: 13px; }
.data-preview {
  background: #f8f9fa;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 12px;
  max-height: 400px;
  overflow-y: auto;
}
.data-row {
  display: flex;
  margin-bottom: 8px;
  font-size: 13px;
}
.data-row:last-child { margin-bottom: 0; }
.data-label { flex: 0 0 120px; color: #909399; text-align: right; padding-right: 12px; }
.data-value { flex: 1; color: #303133; word-break: break-all; }
.empty-tip { text-align: center; color: #909399; padding: 20px 0; font-size: 13px; }
</style>