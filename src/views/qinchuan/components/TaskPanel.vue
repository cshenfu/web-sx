<template>
  <div class="task-panel">
    <div class="task-title">选址计算</div>
    <div class="task-caption">计算区域</div>

    <div class="task-region-row">
      <el-cascader
        v-model="selectedRegion"
        :options="regionOptions"
        :props="cascaderProps"
        placeholder="请选择省/市/区县"
        size="small"
        clearable
        filterable
        :disabled="submitting"
        style="width: 280px"
      />
      <el-button
        type="primary"
        size="small"
        :loading="submitting"
        :disabled="!canStart"
        @click="handleStartCalculation"
      >
        开始计算
      </el-button>
    </div>

    <p class="task-tip">
      说明：计算完成后会更新当前选址区域的数据。
    </p>

    <div class="task-subtitle">计算任务</div>
    <el-table
      v-loading="loading"
      :data="tasks"
      size="small"
      class="task-table"
    >
      <el-table-column prop="taskNo" label="任务编号" width="160" show-overflow-tooltip />
      <el-table-column prop="regionName" label="计算区域" width="120" show-overflow-tooltip />
      <el-table-column label="计算状态" width="90">
        <template #default="{ row }">
          <span :class="['task-status', row.statusClass]">
            {{ row.statusLabel }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="startTimeText" label="发起时间" min-width="140" />
      <el-table-column label="操作" width="80">
        <template #default="{ row }">
          <el-button
            v-if="row.canCancel"
            link
            type="primary"
            size="small"
            @click="handleCancelTask(row)"
          >
            取消计算
          </el-button>
          <el-tooltip
            v-else-if="row.failureReason"
            :content="row.failureReason"
            placement="top"
          >
            <span class="task-fail-tip">失败原因</span>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <div v-if="total > 0" class="task-pagination">
      <!-- ★ 核心修改：去掉 v-model，改为单向绑定和显式事件 -->
      <el-pagination
        :current-page="page"
        :page-size="pageSize"
        :page-sizes="[5, 10, 20, 50]"
        :total="total"
        small
        layout="total, prev, pager, next"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, shallowRef } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { regionData } from 'element-china-area-data'
import * as configApi from '@/api/modules/selectConfig'

// ---- 陕西省过滤 ----
const regionOptions = shallowRef(
  regionData.filter((p) => String(p.value) === '61')
)

// ---- 自建 code → 名称 映射 ----
const REGION_NAME_MAP = (() => {
  const map = {}
  const walk = (nodes) => {
    nodes.forEach((n) => {
      map[String(n.value)] = n.label
      if (Array.isArray(n.children)) walk(n.children)
    })
  }
  walk(regionData)
  return map
})()

function getRegionName(code) {
  const str = String(code ?? '')
  if (!str) return '-'
  if (REGION_NAME_MAP[str]) return REGION_NAME_MAP[str]
  if (REGION_NAME_MAP[str.slice(0, 4)]) return REGION_NAME_MAP[str.slice(0, 4)]
  if (REGION_NAME_MAP[str.slice(0, 2)]) return REGION_NAME_MAP[str.slice(0, 2)]
  return str
}

// ---- cascader 配置 ----
const cascaderProps = {
  value: 'value',
  label: 'label',
  children: 'children',
  checkStrictly: false,
  emitPath: true,
}

// ---- 状态映射 ----
function resolveStatus(rawStatus) {
  const s = String(rawStatus ?? '').toUpperCase()
  switch (s) {
    case 'IN_PROGRESS':
      return { label: '计算中', className: 'running', canCancel: true }
    case 'COMPLETED':
      return { label: '计算完成', className: 'done', canCancel: false }
    case 'FAILED':
      return { label: '计算失败', className: 'failed', canCancel: false }
    case 'CANCELED':
    case 'CANCELLED':
      return { label: '取消计算', className: 'canceled', canCancel: false }
    default:
      return { label: rawStatus || '-', className: '', canCancel: false }
  }
}

function formatTime(ts) {
  if (ts === null || ts === undefined || ts === '') return '-'
  const d = new Date(Number(ts))
  if (Number.isNaN(d.getTime())) return '-'
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

// ---- 状态 ----
const selectedRegion = ref([])
const tasks = ref([])
const loading = ref(false)
const submitting = ref(false)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

const canStart = computed(
  () =>
    Array.isArray(selectedRegion.value) &&
    selectedRegion.value.length > 0 &&
    !submitting.value
)

// ---- 加载任务列表 ----
async function loadTasks() {
  loading.value = true
  try {
    // 打印当前请求参数
    console.log(`🔥 触发了请求，当前页码: ${page.value}, 每页条数: ${pageSize.value}`)
    
    const res = await configApi.pageListConfig({
      pageNo: page.value,
      pageSize: pageSize.value,
    })
    const data = res?.data ?? {}
    const list = Array.isArray(data.list) ? data.list : []

    tasks.value = list.map((t) => {
      const failureReason = t.failureReason || ''
      const status = resolveStatus(t.calculationStatus, failureReason)
      return {
        id: t.id,
        taskNo: t.taskId || t.id || '-',
        regionCode: t.calculationAreaCode,
        regionName: getRegionName(t.calculationAreaCode),
        statusLabel: status.label,
        statusClass: status.className,
        canCancel: status.canCancel,
        failureReason,
        startTimeText: formatTime(t.startTime),
      }
    })
    // 更新总条数，驱动分页组件
    total.value = Number(data.total ?? tasks.value.length)
    console.log('🔥 后端返回的总条数 total:', total.value)
  } catch (err) {
    console.error('[task] pageListConfig 失败:', err)
    ElMessage.error(err?.message || '计算任务加载失败')
    tasks.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// ---- 分页事件处理 ----
function handlePageChange(newPage) {
  console.log('🔥 用户点击了翻页，目标页码:', newPage)
  page.value = newPage
  loadTasks()
}

function handleSizeChange(newSize) {
  console.log('🔥 用户改变了每页条数:', newSize)
  pageSize.value = newSize
  page.value = 1 // 改变条数时重置到第一页
  loadTasks()
}

// ---- 点击"开始计算" ----
async function handleStartCalculation() {
  if (!canStart.value) {
    ElMessage.warning('请先选择计算区域')
    return
  }

  const code = selectedRegion.value[selectedRegion.value.length - 1]
  const regionName = getRegionName(code)
  console.log('[task] 发起计算 code =', code, 'name =', regionName)

  try {
    submitting.value = true
    const res = await configApi.calculationTask(code)
    if (res?.code === 200) {
      ElMessage.success('选址计算任务已发起')
      selectedRegion.value = []
      page.value = 1
      await loadTasks()
    } else {
      ElMessage.error(res?.msg || '发起计算失败')
    }
  } catch (err) {
    console.error('[task] calculationTask 失败:', err)
    ElMessage.error(err?.message || '发起计算失败')
  } finally {
    submitting.value = false
  }
}

// ---- 取消任务 ----
async function handleCancelTask(row) {
  try {
    await ElMessageBox.confirm(
      `确认取消任务「${row.taskNo}」吗？`,
      '提示',
      { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' }
    )
  } catch {
    return
  }

  try {
    const res = await configApi.cancelTask(row.taskNo)
    if (res?.code === 200) {
      ElMessage.success('已取消')
      await loadTasks()
    } else {
      ElMessage.error(res?.msg || '取消失败')
    }
  } catch (err) {
    console.error('[task] cancelTask 失败:', err)
    ElMessage.error(err?.message || '取消失败')
  }
}

defineExpose({ loadTasks })

onMounted(() => {
  loadTasks()
})
</script>

<style scoped>
.task-panel {
  padding: 8px 0 20px 28px;
}

.task-title {
  margin-bottom: 24px;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}

.task-caption,
.task-subtitle {
  margin: 12px 0 8px;
  color: #303133;
  font-size: 12px;
  font-weight: 600;
}

.task-region-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.task-tip {
  color: #a0a5ad;
  font-size: 11px;
  line-height: 1.6;
}

.task-table {
  width: 100%;
  margin-top: 12px;
}

.task-status.waiting  { color: #e6a23c; }
.task-status.running  { color: #1677ff; }
.task-status.done     { color: #24b26b; }
.task-status.failed   { color: #f56c6c; }
.task-status.canceled { color: #909399; }

.task-fail-tip {
  color: #f56c6c;
  font-size: 12px;
  cursor: help;
  text-decoration: underline dotted;
}

.task-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}
</style>