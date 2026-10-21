<template>
  <section class="task-panel" aria-label="选址计算">
    <header class="task-title">
      <span class="panel-title-icon" aria-hidden="true"><el-icon><Grid /></el-icon></span>
      <h2>选址计算</h2>
    </header>

    <div class="task-region-row">
      <span class="task-caption">计算区域</span>
      <el-cascader
        v-model="selectedRegion"
        :options="regionOptions"
        :props="cascaderProps"
        placeholder="请选择省/市/区县"
        size="small"
        clearable
        filterable
        :disabled="submitting"
        class="region-select"
      />
      <el-button type="primary" size="small" :loading="submitting" :disabled="!canStart" @click="handleStartCalculation">
        发起计算
      </el-button>
    </div>

    <p class="task-tip">说明：计算完成后会更新当前选址区域的数据。</p>
    <div class="task-subtitle">计算任务</div>

    <div class="task-table-wrap">
      <el-table v-loading="loading" :data="tasks" row-key="id" size="small" border stripe class="task-table" :max-height="460">
        <el-table-column prop="taskNo" label="任务编号" width="100" show-overflow-tooltip />
        <el-table-column prop="regionName" label="计算区域" width="84" show-overflow-tooltip />
        <el-table-column label="计算状态" width="86" align="center">
          <template #default="{ row }">
            <span :class="['task-status', row.statusClass]">{{ row.statusLabel }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="elapsedText" label="已耗时" width="72" show-overflow-tooltip />
        <el-table-column prop="remainingText" label="预计剩余时间" width="88" show-overflow-tooltip />
        <el-table-column prop="estimatedTotalText" label="预计总耗时" width="86" show-overflow-tooltip />
        <el-table-column prop="startTimeText" label="发起时间" min-width="142" show-overflow-tooltip />
        <el-table-column prop="initiatorText" label="发起人" width="76" show-overflow-tooltip />
        <el-table-column label="操作" width="78" align="center">
          <template #default="{ row }">
            <el-button v-if="row.canCancel" link type="danger" size="small" @click="handleCancelTask(row)">取消计算</el-button>
            <el-tooltip v-else-if="row.failureReason" :content="row.failureReason" placement="top">
              <span class="task-fail-tip">失败原因</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <template #empty><span class="empty-text">暂无计算任务</span></template>
      </el-table>
    </div>

    <div v-if="total > 0" class="task-pagination">
      <el-pagination
        :current-page="page"
        :page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        :total="total"
        small
        layout="total, prev, pager, next, sizes"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, shallowRef } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Grid } from '@element-plus/icons-vue'
import { regionData } from 'element-china-area-data'
import * as configApi from '@/api/modules/selectConfig'

const regionOptions = shallowRef(regionData.filter((province) => String(province.value) === '61'))

const REGION_NAME_MAP = (() => {
  const map = {}
  const walk = (nodes) => {
    nodes.forEach((node) => {
      map[String(node.value)] = node.label
      if (Array.isArray(node.children)) walk(node.children)
    })
  }
  walk(regionData)
  return map
})()

function getRegionName(code) {
  const value = String(code ?? '')
  if (!value) return '-'
  if (REGION_NAME_MAP[value]) return REGION_NAME_MAP[value]
  if (REGION_NAME_MAP[value.slice(0, 4)]) return REGION_NAME_MAP[value.slice(0, 4)]
  if (REGION_NAME_MAP[value.slice(0, 2)]) return REGION_NAME_MAP[value.slice(0, 2)]
  return value
}

const cascaderProps = {
  value: 'value',
  label: 'label',
  children: 'children',
  checkStrictly: false,
  emitPath: true,
}

function resolveStatus(rawStatus) {
  const status = String(rawStatus ?? '').toUpperCase()
  if (['WAITING', 'PENDING', 'QUEUED', 'QUEUE'].includes(status)) {
    return { label: '排队中', className: 'waiting', canCancel: true }
  }
  if (['IN_PROGRESS', 'RUNNING', 'CALCULATING'].includes(status)) {
    return { label: '计算中', className: 'running', canCancel: true }
  }
  if (['COMPLETED', 'SUCCESS', 'DONE'].includes(status)) {
    return { label: '已完成', className: 'done', canCancel: false }
  }
  if (['FAILED', 'ERROR'].includes(status)) {
    return { label: '计算失败', className: 'failed', canCancel: false }
  }
  if (['CANCELED', 'CANCELLED'].includes(status)) {
    return { label: '已取消', className: 'canceled', canCancel: false }
  }
  const original = String(rawStatus ?? '-')
  if (original.includes('排队')) return { label: original, className: 'waiting', canCancel: true }
  if (original.includes('计算中')) return { label: original, className: 'running', canCancel: true }
  if (original.includes('完成')) return { label: original, className: 'done', canCancel: false }
  if (original.includes('失败')) return { label: original, className: 'failed', canCancel: false }
  return { label: original, className: '', canCancel: false }
}

function firstText(source, keys) {
  for (const key of keys) {
    const value = source?.[key]
    if (value !== null && value !== undefined && value !== '') {
      if (typeof value === 'object') continue
      return String(value)
    }
  }
  return '-'
}

function formatTime(value) {
  if (value === null || value === undefined || value === '') return '-'
  if (typeof value === 'string') {
    const text = value.trim()
    if (!text) return '-'
    if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.replace('T', ' ').slice(0, 19)
  }
  const numeric = Number(value)
  const date = new Date(Number.isFinite(numeric) && numeric > 0 ? numeric : value)
  if (Number.isNaN(date.getTime())) return String(value)
  const pad = (number) => String(number).padStart(2, '0')
  return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) + ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds())
}

function isTrue(value) {
  return value === true || value === 1 || value === '1' || String(value).toLowerCase() === 'true'
}

const selectedRegion = ref([])
const tasks = ref([])
const loading = ref(false)
const submitting = ref(false)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

const canStart = computed(() => Array.isArray(selectedRegion.value) && selectedRegion.value.length > 0 && !submitting.value)

function mapTask(task) {
  const status = resolveStatus(task.calculationStatus ?? task.status)
  const taskNo = task.taskId || task.id || '-'
  const canCancel = task.canCancel === undefined && task.allowCancel === undefined
    ? status.canCancel
    : isTrue(task.canCancel ?? task.allowCancel)

  // 如果接口字段名不同，只需调整下面这四组候选字段名；未返回的字段会显示为“-”。
  return {
    id: task.id ?? task.taskId ?? taskNo,
    taskNo,
    regionCode: task.calculationAreaCode,
    regionName: getRegionName(task.calculationAreaCode ?? task.regionCode ?? task.regionName),
    statusLabel: status.label,
    statusClass: status.className,
    canCancel,
    failureReason: task.failureReason || '',
    elapsedText: firstText(task, ['elapsedTimeText', 'elapsedText', 'usedTimeText', 'runTimeText', 'durationText', 'elapsedTime', 'usedTime', 'runTime', 'duration']),
    remainingText: firstText(task, ['remainingTimeText', 'estimatedRemainingTimeText', 'remainTimeText', 'remainingText', 'remainingTime', 'estimatedRemainingTime', 'remainTime']),
    estimatedTotalText: firstText(task, ['estimatedTotalTimeText', 'totalEstimatedTimeText', 'totalDurationText', 'expectedDurationText', 'estimatedTimeText', 'estimateTimeText', 'totalEstimatedTime', 'estimatedTotalTime', 'expectedDuration', 'estimatedTime']),
    startTimeText: formatTime(task.startTime ?? task.createTime ?? task.createdAt),
    initiatorText: firstText(task, ['initiatorName', 'createByName', 'createdByName', 'creatorName', 'userName', 'operatorName', 'applicantName', 'createUserName', 'initiatedBy']),
  }
}

async function loadTasks() {
  loading.value = true
  try {
    const res = await configApi.pageListConfig({ pageNo: page.value, pageSize: pageSize.value })
    const data = res?.data ?? {}
    const list = Array.isArray(data.list) ? data.list : []
    tasks.value = list.map(mapTask)
    total.value = Number(data.total ?? tasks.value.length)
  } catch (err) {
    console.error('[task] pageListConfig 失败:', err)
    ElMessage.error(err?.message || '计算任务加载失败')
    tasks.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function handlePageChange(newPage) {
  page.value = newPage
  loadTasks()
}

function handleSizeChange(newSize) {
  pageSize.value = newSize
  page.value = 1
  loadTasks()
}

async function handleStartCalculation() {
  if (!canStart.value) {
    ElMessage.warning('请先选择计算区域')
    return
  }
  const code = selectedRegion.value[selectedRegion.value.length - 1]
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

async function handleCancelTask(row) {
  try {
    await ElMessageBox.confirm('确认取消任务「' + row.taskNo + '」吗？', '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    })
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
onMounted(() => loadTasks())
</script>

<style scoped>
.task-panel {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  padding: 14px 14px 10px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(219, 228, 239, 0.82);
  border-radius: 9px;
  box-shadow: 0 1px 4px rgba(20, 47, 78, 0.05);
}
.task-title { display: flex; flex: 0 0 auto; align-items: center; gap: 8px; margin-bottom: 13px; }
.task-title h2 { margin: 0; color: #273443; font-size: 13px; font-weight: 600; }
.panel-title-icon { display: inline-flex; align-items: center; justify-content: center; width: 19px; height: 19px; color: #3987ec; background: #edf5ff; border-radius: 5px; }
.task-region-row { display: flex; flex: 0 0 auto; align-items: center; gap: 8px; min-width: 0; }
.task-caption { flex: 0 0 76px; color: #7e8997; font-size: 11px; }
.region-select { flex: 0 1 280px; min-width: 120px; }
.task-tip { flex: 0 0 auto; margin: 5px 0 11px 84px; color: #a0aab6; font-size: 10px; line-height: 1.5; }
.task-subtitle { flex: 0 0 auto; margin: 0 0 7px; color: #697686; font-size: 11px; font-weight: 500; }
.task-table-wrap { flex: 0 1 auto; min-width: 0; min-height: 0; overflow: auto; }
.task-table { width: 100%; min-width: 780px; font-size: 10px; }
:deep(.task-table .el-table__header-wrapper th) { height: 30px; padding: 3px 0; color: #667383; font-size: 10px; font-weight: 500; background: #f6f8fb; }
:deep(.task-table .el-table__body tr) { height: 29px; }
:deep(.task-table .el-table__body td) { padding: 3px 0; color: #384555; font-size: 10px; }
:deep(.task-table .cell) { padding-right: 5px; padding-left: 5px; line-height: 1.4; }
:deep(.task-table .el-table__inner-wrapper::before) { height: 0; }
.task-status { display: inline-block; max-width: 100%; padding: 2px 7px; overflow: hidden; color: #637487; font-size: 10px; line-height: 1.3; text-overflow: ellipsis; white-space: nowrap; background: #f0f2f5; border-radius: 10px; }
.task-status.waiting { color: #a76b06; background: #fff3d8; }
.task-status.running { color: #1677ff; background: #e3f2ff; }
.task-status.done { color: #43846b; background: #eaf6ef; }
.task-status.failed { color: #d94d4d; background: #fff0f0; }
.task-status.canceled { color: #747d88; background: #f0f2f5; }
.task-fail-tip { color: #e36b6b; font-size: 10px; cursor: help; text-decoration: underline dotted; }
.empty-text { color: #9aa5b1; font-size: 11px; }
.task-pagination { display: flex; flex: 0 0 auto; justify-content: flex-end; min-width: 0; padding-top: 9px; }
:deep(.task-pagination .el-pagination) { gap: 2px; }
@media (max-width: 760px) {
  .task-panel { min-height: 540px; }
  .task-region-row { flex-wrap: wrap; }
  .task-caption { flex-basis: 68px; }
  .region-select { flex: 1 1 180px; }
  .task-tip { margin-left: 76px; }
  .task-pagination { overflow-x: auto; }
}
</style>