<template>
    <div class="task-panel">
      <div class="task-title">选址计算</div>
      <div class="task-caption">计算区域</div>
  
      <div class="task-region-row">
        <el-cascader
          v-model="selectedRegion"
          :options="regionOptions"
          :props="cascaderProps"
          placeholder="请选择省/市"
          size="small"
          clearable
          :disabled="submitting"
          style="width: 200px"
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
        <el-table-column prop="regionName" label="计算区域" width="90" show-overflow-tooltip />
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
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20, 50]"
          :total="total"
          small
          layout="total, prev, pager, next"
          @current-change="loadTasks"
          @size-change="handleSizeChange"
        />
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed, reactive, ref, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import * as configApi from '@/api/modules/selectConfig'
  
  // ---- 区域级联数据 ----
  const regionOptions = [
    {
      value: '610000',
      label: '陕西省',
      children: [
        { value: '610100', label: '西安市' },
        { value: '610200', label: '铜川市' },
        { value: '610300', label: '宝鸡市' },
        { value: '610400', label: '咸阳市' },
        { value: '610500', label: '渭南市' },
        { value: '610600', label: '延安市' },
        { value: '610700', label: '汉中市' },
        { value: '610800', label: '榆林市' },
        { value: '610900', label: '安康市' },
        { value: '611000', label: '商洛市' },
      ],
    },
  ]
  
  const cascaderProps = {
    checkStrictly: true,
    emitPath: true,
  }
  
  // ---- 区域 code → 名称 ----
  const REGION_NAME_MAP = {
    '610000': '陕西省',
    '610100': '西安市',
    '610200': '铜川市',
    '610300': '宝鸡市',
    '610400': '咸阳市',
    '610500': '渭南市',
    '610600': '延安市',
    '610700': '汉中市',
    '610800': '榆林市',
    '610900': '安康市',
    '611000': '商洛市',
    '610825': '定边县',
    '610826': '绥德县',
    '610831': '子洲县',
    '610902': '汉滨区',
  }
  
  function getRegionName(code) {
    const str = String(code ?? '')
    if (!str) return '-'
    if (REGION_NAME_MAP[str]) return REGION_NAME_MAP[str]
    if (REGION_NAME_MAP[str.slice(0, 6)]) return REGION_NAME_MAP[str.slice(0, 6)]
    if (REGION_NAME_MAP[str.slice(0, 4) + '00']) return REGION_NAME_MAP[str.slice(0, 4) + '00']
    if (REGION_NAME_MAP[str.slice(0, 2) + '0000']) return REGION_NAME_MAP[str.slice(0, 2) + '0000']
    return str
  }
  
  // ---- 状态映射 ----
// 后端枚举：
//   IN_PROGRESS → 计算中（可取消）
//   COMPLETED   → 计算完成
//   FAILED      → 计算失败
//   CANCELED    → 取消计算
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
  
  // 可以点击"开始计算"的条件
  const canStart = computed(
    () => Array.isArray(selectedRegion.value) && selectedRegion.value.length > 0 && !submitting.value
  )
  
  // ---- 加载任务列表 ----
  async function loadTasks() {
    loading.value = true
    try {
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
      total.value = Number(data.total ?? tasks.value.length)
      console.log('[task] 列表加载:', tasks.value)
    } catch (err) {
      console.error('[task] pageListConfig 失败:', err)
      ElMessage.error(err?.message || '计算任务加载失败')
      tasks.value = []
      total.value = 0
    } finally {
      loading.value = false
    }
  }
  
  function handleSizeChange() {
    page.value = 1
    loadTasks()
  }
  
  // ---- 点击"开始计算"才发起接口 ----
  async function handleStartCalculation() {
    if (!canStart.value) {
      ElMessage.warning('请先选择计算区域')
      return
    }
    const code = selectedRegion.value[selectedRegion.value.length - 1]
    console.log('[task] 发起计算 code =', code)
  
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
    console.log(row)
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
  
  .task-status.waiting { color: #e6a23c; }
  .task-status.running { color: #1677ff; }
  .task-status.done    { color: #24b26b; }
  .task-status.failed  { color: #f56c6c; }
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