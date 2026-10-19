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
            <th class="sticky-col" style="width: 130px; min-width: 130px;">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in list" :key="row.id">
            <td>{{ row.id }}</td>
            <td>{{ row.sourceTypeDesc || '-' }}</td>
            <td>{{ row.reportTypeDesc || '-' }}</td>
            <td class="ellipsis" :title="row.declaringUnit">{{ row.declaringUnit || '-' }}</td>
            <td>{{ row.currentCapacityMw ?? '-' }}</td>
            <td>
              <!-- 使用行内样式强制上色 -->
              <span 
                class="status-tag" 
                :style="{ color: getStatusColor(row.status, row.statusDesc) }"
              >
                {{ row.statusDesc || '-' }}
              </span>
            </td>
            <td class="ellipsis" :title="row.remark">{{ row.remark || '--' }}</td>
            <td>{{ row.createTime || '-' }}</td>
            <!-- 内容固定列 -->
            <td class="sticky-col" style="width: 130px; min-width: 130px;">
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
                
                <button class="action-btn more" @click="$emit('row-action', row)">···</button>
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

// 直接返回色值，无视一切 CSS 污染
function getStatusColor(status, desc) {
  const s = status || ''
  const d = desc || ''
  
  if (d.includes('完成') || d.includes('成功') || s === 'COMPLETED') return '#67c23a'
  if (d.includes('计算') || d.includes('解析') || d.includes('生成') || s === 'GENERATING' || s === 'PARSING') return '#1677ff'
  if (d.includes('排队') || d.includes('等待') || d.includes('待') || s === 'PENDING' || s === 'QUEUING') return '#e6a23c'
  if (d.includes('失败') || s === 'FAILED') return '#f56c6c'
  if (d.includes('终止') || s === 'TERMINATED') return '#909399'
  
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
.project-report-tab {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px 20px;
  overflow: hidden;
  background: transparent;
}

/* ============ 子 Tab ============ */
.sub-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}

.sub-tab {
  padding: 6px 16px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.8);
  color: #606266;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.sub-tab:hover { color: #1677ff; border-color: #a9cfff; }

.sub-tab.active {
  color: #1677ff;
  border-color: #1677ff;
  background: rgba(255, 255, 255, 1);
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(22, 119, 255, 0.15);
}

.count { margin-left: 2px; font-size: 12px; opacity: 0.8; }

/* ============ 表格 ============ */
.table-wrap {
  flex: 1;
  min-height: 0;
  overflow: auto;
  position: relative;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
}

/* 强制固定表格布局 */
.report-table {
  width: 100%;
  min-width: 900px;
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 13px;
}

.report-table th {
  position: sticky;
  top: 0;
  padding: 10px 8px;
  color: #909399;
  text-align: center;
  font-weight: 500;
  background: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
  white-space: nowrap;
  z-index: 2;
}

.report-table td {
  padding: 10px 8px;
  color: #303133;
  text-align: center;
  border-bottom: 1px solid #ebeef5;
  white-space: nowrap;
  background: transparent; 
}

.report-table td.ellipsis { max-width: 180px; overflow: hidden; text-overflow: ellipsis; }

/* ⭐ 右侧固定列 */
.sticky-col {
  position: sticky !important;
  right: 0 !important;
  background: rgba(255, 255, 255, 0.95) !important;
  box-shadow: -4px 0 8px rgba(0, 0, 0, 0.05);
  z-index: 9 !important;
}

.report-table th.sticky-col {
  background: #f5f7fa !important;
  z-index: 10 !important;
}

/* 操作按钮 */
.action-cell { display: flex; align-items: center; justify-content: center; gap: 8px; }
.action-btn { padding: 0; border: none; background: none; font-size: 13px; cursor: pointer; }
.action-btn:hover { text-decoration: underline; }
.action-btn.primary { color: #1677ff; }
.action-btn.danger { color: #f56c6c; }
.action-btn.more { color: #909399; font-weight: bold; }

.empty-state { padding: 32px 0; color: #a8abb2; text-align: center; }
.pagination-wrap { display: flex; justify-content: flex-end; padding-top: 12px; border-top: 1px solid #ebeef5; margin-top: 8px; }
</style>