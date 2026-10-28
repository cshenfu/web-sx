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
            <th>项目ID</th>
            <th>来源类型</th>
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
            <td>{{ row.sourceTypeDesc || (row.sourceType === 'SYSTEM_GENERATE' ? '系统生成' : '上传解析') }}</td>
            <td>{{ row.reportTypeDesc || '-' }}</td>
            <td class="ellipsis" :title="row.declaringUnit">{{ row.declaringUnit || '-' }}</td>
            <td>{{ row.currentCapacityMw ?? '-' }}</td>
            <td>
              <span class="status-tag" :style="{ color: getStatusColor(row.status, row.statusDesc, row.sourceType) }">
                {{ getStatusDesc(row) }}
              </span>
            </td>
            <td class="ellipsis" :title="row.remark">{{ row.remark || '--' }}</td>
            <td class="text-gray">{{ formatDateTime(row.createTime) }}</td>
            
            <td class="sticky-col" style="width: 140px; min-width: 140px;">
              <div class="action-cell">
                <button 
                  v-if="showConfirmBtn(row)" 
                  class="action-btn warning" 
                  @click="handleClickConfirm(row)"
                >待确认</button>

                <button 
                  v-if="canPreview(row)" 
                  class="action-btn primary" 
                  @click="handlePreview(row)"
                >预览</button>
                
                <button 
                  v-if="row.status === 'GENERATING' || row.status === 'CALCULATION_IN_PROGRESS' || row.status === '4'" 
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
      
      <!-- ★ 改动 1：空状态加创建按钮 -->
      <div v-if="!list.length && !loading" class="empty-state">
        <p class="empty-tip">暂无{{ currentTabLabel }}</p>
        <el-button type="primary" size="small" @click="handleCreate">
          创建{{ currentTabLabel }}
        </el-button>
      </div>
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
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { pageReport, terminateCalculation } from '@/api/modules/aiProject'

// ★ 改动 2：emit 增加 'create'
const emit = defineEmits(['row-action', 'open-confirm', 'create'])

const props = defineProps({
  project: { type: Object, required: true },
  initialSubTab: { type: String, default: '' }, 
  hideSubTabs: { type: Boolean, default: false } 
})

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

// ★ 改动 3：当前子 Tab 的中文名
const currentTabLabel = computed(() => {
  const t = tabs.value.find(t => t.key === activeSubTab.value)
  return t?.label || '报告'
})

// ★ 改动 4：点击"创建"抛给父级
function handleCreate() {
  emit('create', {
    subTab: activeSubTab.value,
    tabLabel: currentTabLabel.value,
    project: props.project,
  })
}

const SYSTEM_STATUS_MAP = {
  1: '草稿', 2: '初始化', 3: '排队中', 4: '计算中', 5: '异常暂停', 
  6: '计算终止', 7: '计算完成', 8: '文件待解析', 9: '审核完成'
}
const UPLOAD_STATUS_MAP = {
  'PENDING': '待解析', 'PARSING': '解析中', 'SUCCESS': '解析成功', 
  'FAILED': '解析失败', 'NOT_REQUIRED': '无需解析'
}

function showConfirmBtn(row) {
  const isValidTab = ['PROJECT_PROPOSAL', 'FEASIBILITY_STUDY'].includes(activeSubTab.value)
  return isValidTab && row.displayStatus === 'PENDING_CONFIRM'
}

function handleClickConfirm(row) {
  console.log('🟢 1. 点击了待确认按钮，row.id 为:', row.id)
  emit('open-confirm', row.id)
}

function canPreview(row) {
  if (row.sourceType === 'UPLOAD_PARSE') {
    return !!row.fileUrl
  }
  if (row.sourceType === 'SYSTEM_GENERATE') {
    const allowedDesc = ['完成', '待解析', '解析中', '待确认']
    const descStr = (row.statusDesc || '') + (row.displayStatusDesc || '')
    const allowedStatus = [
      'CALCULATION_COMPLETED', 'FILE_PARSED', 'COMPLETED', 
      'PENDING_CONFIRM', 'PARSING', '9', '7', '8', '4'
    ]
    if (allowedStatus.includes(String(row.status)) || allowedDesc.some(kw => descStr.includes(kw))) {
      return true 
    }
    return false
  }
  return false
}

function handlePreview(row) {
  if (row.sourceType === 'SYSTEM_GENERATE') {
    if (!row.fileUrl) {
      ElMessage.warning('该系统生成文件暂无直接预览地址，请等待生成或进入详情查看')
      return
    }
  } else {
    if (!row.fileUrl) return ElMessage.warning('无预览地址')
  }

  let url = row.fileUrl
  const fileName = row.fileName || url || ''
  let ext = 'pdf'
  
  if (fileName.includes('.')) {
    ext = fileName.split('.').pop().toLowerCase()
  }

  if (ext === 'pdf' || row.sourceType === 'SYSTEM_GENERATE') {
    window.open(url, '_blank')
  } else if (['doc', 'docx'].includes(ext)) {
    const officeViewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`
    window.open(officeViewerUrl, '_blank')
  } else {
    window.open(url, '_blank')
  }
}

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

function getStatusDesc(row) {
  if (row.displayStatusDesc) return row.displayStatusDesc
  if (row.statusDesc) return row.statusDesc
  if (row.sourceType === 'SYSTEM_GENERATE') {
    return SYSTEM_STATUS_MAP[row.status] || row.status || '-'
  } else {
    return UPLOAD_STATUS_MAP[row.status] || row.status || '-'
  }
}

function getStatusColor(status, desc, sourceType) {
  const s = String(status || '')
  const d = desc || ''
  if (d.includes('完成') || d.includes('成功') || s === 'COMPLETED' || s === 'SUCCESS' || s === '7' || s === '9') return '#00AE0F'
  if (d.includes('计算') || d.includes('解析') || d.includes('生成') || s === 'GENERATING' || s === 'PARSING' || s === '4') return '#2664EB'
  if (d.includes('排队') || d.includes('等待') || d.includes('待') || s === 'PENDING' || s === 'QUEUING' || s === 'PENDING_CONFIRM' || s === '3' || s === '8') return '#EF9600'
  if (d.includes('失败') || s === 'FAILED') return '#D81D1D'
  if (d.includes('终止') || d.includes('异常') || s === 'TERMINATED' || s === '6' || s === '5') return '#8D8D8D'
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
.action-btn.warning { color: #EF9600; font-weight: 500; }
.empty-state { padding: 32px 0; color: #9CA3AF; text-align: center; font-size: 12px; }
/* ★ 新增 */
.empty-tip { margin: 0 0 12px; color: #9CA3AF; font-size: 13px; }
.pagination-wrap { display: flex; justify-content: flex-end; padding-top: 12px; margin-top: 8px; }
</style>