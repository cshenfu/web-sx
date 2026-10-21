<!-- components/area-panel/tabs/ProjectReportTab.vue -->
<template>
  <div class="project-report-tab">
    <!-- 子 tab -->
    <div class="sub-tabs">
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

    <!-- 表格区域 -->
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
                {{ row.statusDesc || '-' }}
              </span>
            </td>
            <td class="ellipsis" :title="row.remark">{{ row.remark || '--' }}</td>
            <!-- 时间格式化 -->
            <td class="text-gray">{{ formatDateTime(row.createTime) }}</td>
            
            <!-- 内容固定列 -->
            <td class="sticky-col" style="width: 140px; min-width: 140px;">
              <div class="action-cell">
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
                
                <!-- 只有明确有更多操作时才显示三个点 -->
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

    <!-- 分页 -->
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
import { ref, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { pageReport, terminateCalculation } from '@/api/modules/aiProject'

const props = defineProps({
  project: { type: Object, required: true },
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

// 🌟 新增：时间格式化方法
function formatDateTime(val) {
  if (!val) return '-'
  // 纯数字或数字字符串（时间戳）
  if (typeof val === 'number' || /^\d+$/.test(String(val))) {
    const d = new Date(Number(val))
    if (!isNaN(d.getTime())) {
      const pad = (n) => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
    }
  }
  // 字符串形式（如带 T 的 ISO）
  if (typeof val === 'string') {
    return val.replace('T', ' ').substring(0, 19)
  }
  return val
}

// 直接返回色值，无视一切 CSS 污染
function getStatusColor(status, desc) {
  const s = status || ''
  const d = desc || ''
  
  if (d.includes('完成') || d.includes('成功') || s === 'COMPLETED') return '#00AE0F' // 绿色
  if (d.includes('计算') || d.includes('解析') || d.includes('生成') || s === 'GENERATING' || s === 'PARSING') return '#2664EB' // 蓝色
  if (d.includes('排队') || d.includes('等待') || d.includes('待') || s === 'PENDING' || s === 'QUEUING') return '#EF9600' // 橙色
  if (d.includes('失败') || s === 'FAILED') return '#D81D1D' // 红色
  if (d.includes('终止') || s === 'TERMINATED') return '#8D8D8D' // 灰色
  
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
/* ================= 容器 ================= */
.project-report-tab {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px 24px;
  overflow: hidden;
  background: transparent;
}

/* ================= 1. 子 Tab 栏 ================= */
.sub-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.sub-tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 0 12px;
  border-radius: 4px;
  font-family: 'PingFang SC', sans-serif;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: #000000;
}

.sub-tab:hover {
  background: rgba(255, 255, 255, 0.8);
}

.sub-tab .count {
  margin-left: 4px;
  color: #6E8ADC;
  font-size: 12px;
}

.sub-tab.active {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #1D4ED8;
  box-shadow: 0px 2px 4px rgba(29, 78, 216, 0.3);
  color: #1D4ED8;
  font-weight: 600;
}
.sub-tab.active .count {
  color: #1D4ED8;
}

/* ================= 2. 表格外框 ================= */
.table-wrap {
  flex: 1;
  min-height: 0;
  overflow: auto;
  position: relative;
  background: rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
}

.table-wrap::-webkit-scrollbar { width: 6px; height: 6px; }
.table-wrap::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.2); border-radius: 4px; }

/* ================= 3. 表格样式 ================= */
.report-table {
  width: 100%;
  /* 🌟 加大了最小宽度，确保滚动到最右边时空间依然宽裕，不被操作列盖住 */
  min-width: 1050px; 
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 12px;
}

/* 表头 */
.report-table th {
  position: sticky;
  top: 0;
  padding: 8px;
  color: #1F2937;
  text-align: center;
  font-weight: 400;
  background: rgba(241, 245, 249, 0.6);
  border-bottom: 1px solid rgba(209, 213, 219, 0.4);
  border-right: 1px solid rgba(209, 213, 219, 0.4);
  white-space: nowrap;
  z-index: 2;
}

/* 单元格 */
.report-table td {
  padding: 8px;
  color: #374151;
  text-align: center;
  border-bottom: 1px solid rgba(209, 213, 219, 0.4);
  border-right: 1px solid rgba(209, 213, 219, 0.5);
  white-space: nowrap;
  background: transparent; 
}

.report-table th:last-child,
.report-table td:last-child {
  border-right: none;
}

/* 斑马纹 */
.report-table tbody tr:nth-child(even) td {
  background: rgba(255, 255, 255, 0.15);
}

/* 悬浮高亮 */
.report-table tbody tr:hover td {
  background: rgba(255, 255, 255, 0.5) !important;
}

/* 文本样式 */
.report-table td.ellipsis { max-width: 180px; overflow: hidden; text-overflow: ellipsis; }
.report-table td.font-bold { font-weight: 700; color: #111827; }
.report-table td.text-gray { color: #374151; }

/* ⭐ 右侧固定列 */
.sticky-col {
  position: sticky !important;
  right: 0 !important;
  /* 🌟 使用了 backdrop-filter 增加磨砂玻璃质感，防止底下文字穿透，同时加高不透明度 */
  background: rgba(255, 255, 255, 0.85) !important;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  box-shadow: -6px 0 10px rgba(0, 0, 0, 0.05);
  z-index: 9 !important;
}

.report-table th.sticky-col {
  background: rgba(241, 245, 249, 0.95) !important;
  z-index: 10 !important;
}

/* 处理斑马纹和 Hover 时的固定列背景 */
.report-table tbody tr:nth-child(even) td.sticky-col {
  background: rgba(255, 255, 255, 0.9) !important;
}
.report-table tbody tr:hover td.sticky-col {
  background: rgba(255, 255, 255, 0.95) !important;
}

/* 状态颜色 */
.status-tag { font-weight: 500; font-size: 12px; }

/* 操作按钮 */
.action-cell { display: flex; align-items: center; justify-content: center; gap: 8px; }
.action-btn { padding: 0; border: none; background: none; font-size: 12px; cursor: pointer; }
.action-btn:hover { text-decoration: underline; }
.action-btn.primary { color: #1D4ED8; }
.action-btn.danger { color: #D81D1D; }
.action-btn.more { color: #333333; font-weight: bold; font-size: 14px; }

.empty-state { padding: 32px 0; color: #9CA3AF; text-align: center; font-size: 12px; }
.pagination-wrap { display: flex; justify-content: flex-end; padding-top: 12px; margin-top: 8px; }
</style>