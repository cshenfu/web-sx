<!-- components/area-panel/tabs/ProjectReportTab.vue -->
<template>
  <div class="project-report-tab">
    <!-- 子 Tab -->
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
        <colgroup>
          <col class="col-project-id" />
          <col class="col-source-type" />
          <col class="col-file-type" />
          <col class="col-unit" />
          <col class="col-capacity" />
          <col class="col-status" />
          <col class="col-remark" />
          <col class="col-create-time" />
          <col class="col-action" />
        </colgroup>
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
                <!-- <button 
                  class="action-btn warning" 
                  @click="handleClickConfirm(row)"
                >待确认</button> -->
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

      <!-- 空状态 -->
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

    <!-- ★ docx 本地预览弹窗 -->
    <el-dialog
      v-model="docxDialogVisible"
      :title="docxDialogTitle"
      width="80%"
      top="5vh"
      append-to-body
      destroy-on-close
      class="docx-preview-dialog"
    >
      <div v-loading="docxLoading" class="docx-body">
        <div ref="docxContainerRef" class="docx-container" />
      </div>
      <template #footer>
        <el-button @click="docxDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- ★ DOC 本地预览弹窗：浏览器端解析，不依赖 Office Online/后端转换 -->
    <el-dialog
      v-model="docDialogVisible"
      :title="docDialogTitle"
      width="80%"
      top="5vh"
      append-to-body
      destroy-on-close
      class="doc-preview-dialog"
    >
      <div v-loading="docLoading" class="doc-body">
        <div ref="docContainerRef" class="doc-container" />
      </div>
      <template #footer>
        <el-button @click="docDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- ★ pdf 本地预览弹窗 -->
    <el-dialog
      v-model="pdfDialogVisible"
      :title="pdfDialogTitle"
      width="80%"
      top="5vh"
      append-to-body
      destroy-on-close
      class="pdf-preview-dialog"
    >
      <div v-loading="pdfLoading" class="pdf-body">
        <iframe
          v-if="pdfIframeSrc"
          :src="pdfIframeSrc"
          class="pdf-iframe"
          frameborder="0"
        />
      </div>
      <template #footer>
        <el-button @click="pdfDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { pageReport, terminateCalculation } from '@/api/modules/aiProject'
import { getTempUrlSX } from '@/api/modules/upload'
import { renderAsync } from 'docx-preview'
import { createMsDocViewer } from '@file-viewer/doc'

const emit = defineEmits(['row-action', 'open-confirm', 'create'])

const props = defineProps({
  project: { type: Object, required: true },
  initialSubTab: { type: String, default: '' },
  hideSubTabs: { type: Boolean, default: false },
  refreshKey: { type: Number, default: 0 },
})
const fake_data = ref(null)
// ============================================================
// 报告列表
// ============================================================
const tabs = ref([
  { key: 'PROJECT_PROPOSAL', label: '项目建议书', count: 0 },
  { key: 'WIND_RESOURCE_ASSESSMENT', label: '风资源评估报告', count: 0 },
  { key: 'FEASIBILITY_STUDY', label: '可研报告', count: 0 },
  { key: 'PROJECT_INITIATION', label: '请示文件', count: 0 },
  { key: 'COMPETITIVE_ALLOCATION', label: '竞配申请报告', count: 0 },
  { key: 'POST_EVALUATION', label: '后评价报告', count: 0 },
])

const activeSubTab = ref(tabs.value[0].key)
const loading = ref(false)
const list = ref([])
const total = ref(0)
const pageNo = ref(1)
const pageSize = ref(10)

const currentTabLabel = computed(() => {
  const t = tabs.value.find(t => t.key === activeSubTab.value)
  return t?.label || '报告'
})

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

// ============================================================
// ★ 列表轮询（所有状态、所有 tab 都轮询，3 秒一次）
// ============================================================
const POLL_INTERVAL = 3000

let pollTimer = null
let fetchSeq = 0          // 请求序号：丢弃过期响应
let destroyed = false     // 组件是否已卸载

function stopPolling() {
  if (pollTimer) {
    clearTimeout(pollTimer)
    pollTimer = null
  }
}

/**
 * 无条件排下一次轮询。
 * 采用 setTimeout 链：上一次请求返回后才排下一次，不会请求堆积。
 */
function schedulePolling() {
  stopPolling()
  if (destroyed) return
  if (!props.project?.id) return
  if (typeof document !== 'undefined' && document.hidden) return // 页面隐藏时暂停

  pollTimer = setTimeout(() => {
    pollTimer = null
    fetchList(true) // 静默轮询
  }, POLL_INTERVAL)
}

// 页面从后台切回前台：立即刷新一次并恢复轮询
function handleVisibilityChange() {
  if (typeof document === 'undefined') return
  if (document.hidden) {
    stopPolling()
  } else {
    fetchList(true)
  }
}

// ============================================================
// ★ 预览相关
// ============================================================

const docxDialogVisible = ref(false)
const docxDialogTitle = ref('文档预览')
const docxLoading = ref(false)
const docxContainerRef = ref(null)

const docDialogVisible = ref(false)
const docDialogTitle = ref('Word 文档预览')
const docLoading = ref(false)
const docContainerRef = ref(null)
let docViewer = null

function clearDocPreview() {
  if (docViewer) {
    try {
      docViewer.destroy()
    } catch (e) {
      console.warn('[ProjectReportTab] DOC viewer 销毁失败:', e)
    }
    docViewer = null
  }
  if (docContainerRef.value) {
    docContainerRef.value.innerHTML = ''
  }
}

async function openDocPreview(url, title) {
  docDialogTitle.value = title || 'Word 文档预览'
  docDialogVisible.value = true
  docLoading.value = true

  try {
    await nextTick()
    clearDocPreview()

    const resp = await fetch(url, { mode: 'cors' })
    if (!resp.ok) throw new Error(`文件下载失败 (${resp.status})`)
    const buffer = await resp.arrayBuffer()

    const container = docContainerRef.value
    if (!container) throw new Error('DOC 预览容器未就绪')

    docViewer = createMsDocViewer(container)
    await docViewer.load(buffer)
  } catch (e) {
    console.error('[ProjectReportTab] DOC 本地预览失败:', e)
    clearDocPreview()
    ElMessage.warning('该 DOC 文件暂时无法在浏览器中预览，请使用下载方式查看')
  } finally {
    docLoading.value = false
  }
}

function canPreview(row) {
  const hasFile = !!(row.fileName || row.fileUrl)
  if (row.sourceType === 'UPLOAD_PARSE') return hasFile
  if (row.sourceType === 'SYSTEM_GENERATE') {
    const allowedDesc = ['完成', '待解析', '解析中', '待确认']
    const descStr = (row.statusDesc || '') + (row.displayStatusDesc || '')
    const allowedStatus = [
      'CALCULATION_COMPLETED', 'FILE_PARSED', 'COMPLETED',
      'PENDING_CONFIRM', 'PARSING', '9', '7', '8', '4'
    ]
    if (allowedStatus.includes(String(row.status)) || allowedDesc.some(kw => descStr.includes(kw))) {
      return hasFile
    }
    return false
  }
  return false
}

/** 从 getTempUrlSX 返回值里提取 url（兼容多种形态） */
function pickTempUrl(res) {
  if (!res) return ''
  if (typeof res === 'string') return res
  if (typeof res === 'object') {
    if (typeof res.url === 'string') return res.url
    if (typeof res.tempUrl === 'string') return res.tempUrl
    if (res.data) {
      if (typeof res.data === 'string') return res.data
      if (typeof res.data.url === 'string') return res.data.url
      if (typeof res.data.tempUrl === 'string') return res.data.tempUrl
    }
  }
  return ''
}

/** 文件后缀：优先 row.fileSuffix，再回退 fileName 扩展名 */
function getFileExt(row) {
  const raw = String(row.fileSuffix || '').replace(/^\./, '').toLowerCase().trim()
  if (raw) return raw
  const name = String(row.fileName || '').toLowerCase()
  const m = /\.([a-z0-9]+)(?:\?|#|$)/.exec(name)
  return m ? m[1] : ''
}

/**
 * 通过 getTempUrlSX 拿临时地址，失败回退 row.fileUrl
 */
async function resolvePreviewUrl(row) {
  const fileUrl = row.fileUrl
  if (fileUrl) {
    try {
      const res = await getTempUrlSX(fileUrl)
      const url = pickTempUrl(res)
      if (url) return url
    } catch (e) {
      console.warn('[ProjectReportTab] getTempUrlSX 失败:', e)
    }
  }
  return row.fileUrl || ''
}

/** docx-preview 在弹窗里渲染 */
async function openDocxPreview(url, title) {
  docxDialogTitle.value = title || '文档预览'
  docxDialogVisible.value = true
  docxLoading.value = true
  try {
    await nextTick()
    const el = docxContainerRef.value
    if (!el) throw new Error('预览容器未就绪')
    el.innerHTML = ''

    const resp = await fetch(url, { mode: 'cors' })
    if (!resp.ok) throw new Error(`文件下载失败 (${resp.status})`)
    const blob = await resp.blob()

    await renderAsync(blob, el, undefined, {
      className: 'docx-preview',
      inWrapper: true,
      ignoreLastRenderedPageBreak: true,
      experimental: true,
      useBase64URL: true,
      breakPages: true,
    })
  } catch (e) {
    console.error('[ProjectReportTab] docx-preview 渲染失败:', e)
    ElMessage.warning('DOCX 本地预览失败，请使用下载方式查看')
  } finally {
    docxLoading.value = false
  }
}

watch(docDialogVisible, (visible) => {
  if (!visible) clearDocPreview()
})

// ============================================================
// ★ PDF 预览
// ============================================================
const pdfDialogVisible = ref(false)
const pdfDialogTitle = ref('PDF 预览')
const pdfLoading = ref(false)
const pdfIframeSrc = ref('')

/** 关闭时回收 blob，避免内存泄漏 */
watch(pdfDialogVisible, (visible) => {
  if (!visible && pdfIframeSrc.value) {
    URL.revokeObjectURL(pdfIframeSrc.value)
    pdfIframeSrc.value = ''
  }
})

async function openPdfPreview(url, title) {
  pdfDialogTitle.value = title || 'PDF 预览'
  pdfDialogVisible.value = true
  pdfLoading.value = true
  pdfIframeSrc.value = ''
  try {
    await nextTick()

    const resp = await fetch(url, { mode: 'cors' })
    if (!resp.ok) throw new Error(`文件下载失败 (${resp.status})`)
    const rawBlob = await resp.blob()

    // ★ 强制 type=application/pdf，绕开 attachment 导致的下载
    const pdfBlob = new Blob([rawBlob], { type: 'application/pdf' })
    const blobUrl = URL.createObjectURL(pdfBlob)

    if (pdfIframeSrc.value) URL.revokeObjectURL(pdfIframeSrc.value)
    pdfIframeSrc.value = blobUrl
  } catch (e) {
    console.error('[ProjectReportTab] PDF 预览失败:', e)
    ElMessage.warning('本地预览失败，已尝试新窗口打开（如仍下载请下载后查看）')
    // 降级：直接新窗口打开原链接
    window.open(url, '_blank')
  } finally {
    pdfLoading.value = false
  }
}

/** 预览主入口 */
async function handlePreview(row) {
  const fileName = row.fileName || ''
  const ext = getFileExt(row)

  const url = await resolvePreviewUrl(row)
  if (!url) {
    ElMessage.warning('未获取到预览地址')
    return
  }

  // PDF → 弹窗内嵌预览（blob 方式，避免被下载）
  if (ext === 'pdf') {
    openPdfPreview(url, fileName || 'PDF 预览')
    return
  }

  // DOCX → docx-preview 弹窗渲染
  if (ext === 'docx') {
    openDocxPreview(url, fileName || '文档预览')
    return
  }

  // DOC（老格式）→ 浏览器端解析，完全不依赖 Office Online。
  if (ext === 'doc') {
    openDocPreview(url, fileName || 'Word 文档预览')
    return
  }

  // 其他 → 直接打开
  window.open(url, '_blank')
}

// ============================================================
// 列表加载（含轮询调度）
// ============================================================

watch(() => props.initialSubTab, (val) => {
  if (val && tabs.value.some(t => t.key === val)) {
    activeSubTab.value = val
    pageNo.value = 1
    fetchList()
  }
}, { immediate: true })

watch(() => props.refreshKey, async () => {
  pageNo.value = 1
  await fetchAllTabCounts()
  fetchList()
})

/**
 * @param {boolean} silent 静默刷新（轮询用）：不显示 loading、不打断轮询链
 */
async function fetchList(silent = false) {
  if (!props.project?.id || destroyed) return

  // 非静默刷新（切 tab / 切项目 / 分页 / 手动刷新）先停掉旧轮询
  if (!silent) {
    stopPolling()
    loading.value = true
  }

  // 记录滚动位置，轮询替换 list 后恢复，避免表格跳动
  const wrapEl = silent ? document.querySelector('.project-report-tab .table-wrap') : null
  const scrollTop = wrapEl ? wrapEl.scrollTop : 0

  const seq = ++fetchSeq
  try {
    const params = {
      aiProjectId: props.project.id,
      reportType: activeSubTab.value,
      pageNo: pageNo.value,
      pageSize: pageSize.value,
    }
    const res = await pageReport(params)

    // 过期响应（切换 tab / 切换项目 / 重复触发 / 已卸载）直接丢弃
    if (seq !== fetchSeq || destroyed) return

    if (res?.code === 0 || res?.code === 200) {
      list.value = res.data?.list || []
      total.value = Number(res.data?.total) || 0

      const currentTab = tabs.value.find(t => t.key === activeSubTab.value)
      if (currentTab) currentTab.count = total.value
    }
  } catch (err) {
    console.error('获取报告列表失败:', err)
  } finally {
    // 只有最新一次请求才负责收尾 & 调度下一轮
    if (seq === fetchSeq && !destroyed) {
      if (!silent) loading.value = false
      if (wrapEl) wrapEl.scrollTop = scrollTop
      schedulePolling()
    }
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
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange)
  }
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

// ★ 组件卸载：标记销毁 + 清定时器 + 移除监听，避免请求回来又续排
onUnmounted(() => {
  clearDocPreview()
  destroyed = true
  stopPolling()
  if (typeof document !== 'undefined') {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
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
.table-wrap { flex: 1; min-height: 0; overflow: auto; position: relative; background: rgba(255, 255, 255, 0.5); border: 1px solid rgba(255, 255, 255, 0.6); box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05); border-radius: 8px; }
.table-wrap::-webkit-scrollbar { width: 6px; height: 6px; }
.table-wrap::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.2); border-radius: 4px; }
.report-table {
  width: 100%;
  min-width: 1080px;
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 12px;
}

/* 明确列宽，避免 table-layout: fixed 在窄面板中重新压缩“创建时间”列。
   右侧操作列固定 140px，时间列保留完整的日期时间显示空间。 */
.report-table .col-project-id { width: 82px; }
.report-table .col-source-type { width: 92px; }
.report-table .col-file-type { width: 110px; }
.report-table .col-unit { width: 140px; }
.report-table .col-capacity { width: 100px; }
.report-table .col-status { width: 82px; }
.report-table .col-remark { width: 150px; }
.report-table .col-create-time { width: 182px; }
.report-table .col-action { width: 140px; }
.report-table th { position: sticky; top: 0; padding: 8px; color: #1F2937; text-align: center; font-weight: 400; background: rgba(241, 245, 249, 0.6); border-bottom: 1px solid rgba(209, 213, 219, 0.4); border-right: 1px solid rgba(209, 213, 219, 0.4); white-space: nowrap; z-index: 2; }
.report-table td { padding: 8px; color: #374151; text-align: center; border-bottom: 1px solid rgba(209, 213, 219, 0.4); border-right: 1px solid rgba(209, 213, 219, 0.5); white-space: nowrap; background: transparent; }
.report-table th:last-child, .report-table td:last-child { border-right: none; }
.report-table tbody tr:nth-child(even) td { background: rgba(255, 255, 255, 0.15); }
.report-table tbody tr:hover td { background: rgba(255, 255, 255, 0.5) !important; }
.report-table td.ellipsis { max-width: 180px; overflow: hidden; text-overflow: ellipsis; }
.report-table td.font-bold { font-weight: 700; color: #111827; }
.report-table td.text-gray { color: #374151; }
.sticky-col {
  position: sticky !important;
  right: 0 !important;
  width: 140px !important;
  min-width: 140px !important;
  max-width: 140px !important;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.94) !important;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  box-shadow: -8px 0 14px rgba(15, 23, 42, 0.08);
  z-index: 9 !important;
}

/* 操作列是冻结列，必须使用不透明背景，否则横向滚动到最右侧时
   创建时间等相邻列会从冻结层下面透出来。 */
.report-table th.sticky-col {
  background: rgba(241, 245, 249, 0.98) !important;
  z-index: 10 !important;
}
.report-table tbody tr:nth-child(even) td.sticky-col,
.report-table tbody tr:hover td.sticky-col {
  background: rgba(255, 255, 255, 0.96) !important;
}

/* 给时间列留出稳定的显示宽度，并禁止日期被单元格裁剪。 */
.report-table th:nth-child(8),
.report-table td:nth-child(8) {
  width: 182px;
  min-width: 182px;
  max-width: 182px;
}
.report-table td.text-gray {
  overflow: visible;
  text-overflow: clip;
}
.report-table th.sticky-col { background: rgba(241, 245, 249, 0.95) !important; z-index: 10 !important; }
.report-table tbody tr:nth-child(even) td.sticky-col { background: rgba(255, 255, 255, 0.5) !important; }
.report-table tbody tr:hover td.sticky-col { background: rgba(255, 255, 255, 0.5) !important; }
.status-tag { font-weight: 500; font-size: 12px; }
.action-cell { display: flex; align-items: center; justify-content: center; gap: 8px; }
.action-btn { padding: 0; border: none; background: none; font-size: 12px; cursor: pointer; }
.action-btn:hover { text-decoration: underline; }
.action-btn.primary { color: #1D4ED8; }
.action-btn.danger { color: #D81D1D; }
.action-btn.more { color: #333333; font-weight: bold; font-size: 14px; }
.action-btn.warning { color: #EF9600; font-weight: 500; }
.empty-state { padding: 32px 0; color: #9CA3AF; text-align: center; font-size: 12px; }
.empty-tip { margin: 0 0 12px; color: #9CA3AF; font-size: 13px; }
.pagination-wrap { display: flex; justify-content: flex-end; padding-top: 12px; margin-top: 8px; }

/* ★ docx 预览弹窗 */
.docx-preview-dialog :deep(.el-dialog__body) {
  padding: 0;
  background: #f5f6f8;
}
.docx-body {
  height: 75vh;
  overflow: auto;
  padding: 16px;
  box-sizing: border-box;
}
.docx-container {
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin: 0 auto;
  min-height: 300px;
}
.docx-container :deep(.docx-wrapper) {
  background: transparent;
  padding: 0;
}
.docx-container :deep(.docx-wrapper > section.docx) {
  margin-bottom: 16px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
  background: #fff;
}

/* ★ DOC 本地预览 */
.doc-preview-dialog :deep(.el-dialog__body) {
  padding: 0;
  background: #f5f6f8;
}
.doc-body {
  height: 75vh;
  overflow: auto;
  padding: 16px;
  box-sizing: border-box;
  background: #f5f6f8;
}
.doc-container {
  width: min(100%, 900px);
  min-height: 100%;
  margin: 0 auto;
  padding: 28px 36px;
  box-sizing: border-box;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}
.doc-container :deep(.msdoc-root) {
  width: 100%;
  color: #111827;
  background: #fff;
}
.doc-container :deep(.msdoc-root img) {
  max-width: 100%;
  height: auto;
}
.doc-container :deep(.msdoc-root table) {
  max-width: 100%;
}
.doc-container :deep(.msdoc-root a) {
  color: #2563eb;
}
.doc-container :deep(.msdoc-root > *) {
  box-sizing: border-box;
}

/* ★ pdf 预览弹窗 */
.pdf-preview-dialog :deep(.el-dialog__body) {
  padding: 0;
  background: #f5f6f8;
}
.pdf-body {
  height: 75vh;
  overflow: hidden;
  padding: 8px;
  box-sizing: border-box;
}
.pdf-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: #fff;
}
</style>