<template>
  <transition name="verify-slide">
    <aside v-if="visible" class="verify-panel">
      <div class="verify-header">
        <span class="verify-title">核查信息</span>
        <div class="verify-actions">
          <el-button size="small" @click="handleCancel">取消</el-button>
          <el-button size="small" type="primary" @click="handleSave">保存</el-button>
        </div>
      </div>

      <div class="verify-tip">
        说明：设置为不可用的点位保存后系统会自动生成避让区域（范围以风机为中心点外扩25m的矩形范围），
        后续如需调整该避让范围，可到【湖仓汇源-避让区域-查找该项目区域的范围数据】编辑或删除
      </div>

      <div class="verify-tabs">
        <button
          v-for="tab in TABS"
          :key="tab.key"
          class="verify-tab"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="verify-table-wrap">
        <el-table
          v-if="activeTab === 'wind'"
          :data="windList"
          :row-class-name="getRowClass"
          border
          size="small"
          class="verify-table"
          height="100%"
        >
          <el-table-column label="风机编号" width="110" align="center">
            <template #default="{ row }">{{ row.code }}</template>
          </el-table-column>
          <el-table-column label="X" width="150" align="center">
            <template #default="{ row }">{{ row.x }}</template>
          </el-table-column>
          <el-table-column label="Y" width="150" align="center">
            <template #default="{ row }">{{ row.y }}</template>
          </el-table-column>
          <el-table-column label="可用状态" width="110" align="center">
            <template #default="{ row }">
              <el-checkbox v-model="row.isUnavailable">不可用</el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="备注" min-width="160">
            <template #default="{ row }">
              <el-input
                v-model="row.remark"
                size="small"
                class="remark-input"
                placeholder=""
              />
            </template>
          </el-table-column>
        </el-table>

        <el-table
          v-else
          :data="boosterList"
          :row-class-name="getRowClass"
          border
          size="small"
          class="verify-table"
          height="100%"
        >
          <el-table-column label="升压站编号" width="110" align="center">
            <template #default="{ row }">{{ row.code }}</template>
          </el-table-column>
          <el-table-column label="X" width="150" align="center">
            <template #default="{ row }">{{ row.x }}</template>
          </el-table-column>
          <el-table-column label="Y" width="150" align="center">
            <template #default="{ row }">{{ row.y }}</template>
          </el-table-column>
          <el-table-column label="可用状态" width="110" align="center">
            <template #default="{ row }">
              <el-checkbox v-model="row.isUnavailable">不可用</el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="备注" min-width="160">
            <template #default="{ row }">
              <el-input
                v-model="row.remark"
                size="small"
                class="remark-input"
                placeholder=""
              />
            </template>
          </el-table-column>
        </el-table>
      </div>
    </aside>
  </transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import * as configApi from '@/api/modules/selectConfig'

const props = defineProps({
  visible: { type: Boolean, default: false },
  project: { type: Object, default: null },
})

const emit = defineEmits(['close', 'saved'])

const TABS = [
  { key: 'wind', label: '风机信息' },
  { key: 'booster', label: '升压站' },
]

const activeTab = ref('wind')
const windList = ref([])
const boosterList = ref([])
const saving = ref(false)

function toBool(v) {
  return v === 1 || v === true || v === '1'
}

/** 兼容两种来源：前端字段 isUnavailable / 后端字段 isAvailable(0=不可用) */
function isUnavailableOf(p) {
  if (p.isUnavailable !== undefined && p.isUnavailable !== null && p.isUnavailable !== '') {
    return toBool(p.isUnavailable)
  }
  if (p.isAvailable !== undefined && p.isAvailable !== null && p.isAvailable !== '') {
    return Number(p.isAvailable) === 0
  }
  return false
}

/** 统一取经纬度：x/y 优先，回退 longitude/latitude，再回退 lng/lat */
function pickXY(point) {
  const rawX = point.x ?? point.longitude ?? point.lng
  const rawY = point.y ?? point.latitude ?? point.lat
  const isNum = (v) => v !== null && v !== undefined && v !== '' && !Number.isNaN(Number(v))
  const lng = isNum(rawX) ? Number(rawX) : null
  const lat = isNum(rawY) ? Number(rawY) : null
  return {
    lng,
    lat,
    x: lng == null ? '-' : lng.toFixed(6),
    y: lat == null ? '-' : lat.toFixed(6),
  }
}

function buildWindList(project) {
  const points = project?.windTurbinePoints || []
  let normalSeq = 200
  let reserveSeq = 0
  return points.map((p) => {
    const isReserve = Number(p.isReserve) === 1
    let code = p.code || p.name || p.turbineCode
    if (!code) {
      if (isReserve) {
        reserveSeq++
        code = `备${String(reserveSeq).padStart(2, '0')}`
      } else {
        normalSeq++
        code = `X${normalSeq}`
      }
    }
    const { lng, lat, x, y } = pickXY(p)
    return {
      code, x, y,
      lng, lat,
      isReserve: isReserve ? 1 : 0,
      isUnavailable: isUnavailableOf(p),
      remark: p.remark || '',
    }
  })
}

function buildBoosterList(project) {
  const points = project?.boosterStationLocations || []
  let seq = 0
  return points.map((p) => {
    let code = p.code || p.name
    if (!code) {
      seq++
      code = `SYZ${String(seq).padStart(2, '0')}`
    }
    const { lng, lat, x, y } = pickXY(p)
    return {
      code, x, y,
      lng, lat,
      isBest: Number(p.isBest) === 1 ? 1 : 0,
      isUnavailable: isUnavailableOf(p),
      remark: p.remark || '',
    }
  })
}

function loadFromProject(project) {
  windList.value = buildWindList(project)
  boosterList.value = buildBoosterList(project)
  activeTab.value = 'wind'
}

watch(
  () => [props.visible, props.project],
  ([visible, project]) => {
    if (visible && project) loadFromProject(project)
  },
  { immediate: true }
)

function getRowClass({ row }) {
  return row.isUnavailable ? 'row-active' : ''
}

async function handleSave() {
  if (saving.value) return
  if (!props.project?.id) {
    ElMessage.error('缺少项目信息，无法保存')
    return
  }

  // 坐标兜底校验
  const missing = windList.value.some(r => r.lng == null || r.lat == null)
    || boosterList.value.some(r => r.lng == null || r.lat == null)
  if (missing) {
    ElMessage.warning('存在坐标缺失的点位，请检查数据后再保存')
    return
  }

  // 按接口 DTO 精确构造，避免把 x/y/code 等前端字段带进去
  const windTurbinePoints = windList.value.map((r) => ({
    longitude: r.lng,
    latitude: r.lat,
    isReserve: r.isReserve ? 1 : 0,
    isAvailable: r.isUnavailable ? 0 : 1, // ★ 反向映射
    remark: r.remark || '',
  }))
  const boosterStationLocations = boosterList.value.map((r) => ({
    lng: r.lng,
    lat: r.lat,
    isBest: r.isBest ? 1 : 0,             // ★ 别丢
    isAvailable: r.isUnavailable ? 0 : 1, // ★ 反向映射
    remark: r.remark || '',
  }))

  // 全量更新：保留项目其余字段，只覆盖两个数组（id 走 path）
  const { id: _id, ...rest } = props.project
  const payload = { ...rest, windTurbinePoints, boosterStationLocations }

  saving.value = true
  try {
    const res = await configApi.upDataLayer(props.project.id, payload)
    if (res?.code === 200) {
      ElMessage.success('保存成功')
      emit('saved', payload)
    } else {
      ElMessage.error(res?.msg || '保存失败')
    }
  } catch (err) {
    ElMessage.error(err?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

function handleCancel() {
  if (saving.value) return
  emit('close')
}
</script>

<style scoped>
.verify-panel {
  position: fixed;
  top: 65px;
  right: 0;
  bottom: 0;
  width: 640px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  background: #fff;
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.08);
}

.verify-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 52px;
  padding: 0 16px;
  border-bottom: 1px solid #ebeef5;
  flex-shrink: 0;
}

.verify-title {
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}

.verify-actions {
  display: flex;
  gap: 8px;
}

/* 顶部说明 */
.verify-tip {
  padding: 10px 16px;
  color: #909399;
  font-size: 12px;
  line-height: 1.7;
  background: #fafbfc;
  border-bottom: 1px solid #ebeef5;
  flex-shrink: 0;
}

/* Tab */
.verify-tabs {
  display: flex;
  gap: 4px;
  padding: 0 16px;
  border-bottom: 1px solid #ebeef5;
  flex-shrink: 0;
}

.verify-tab {
  padding: 10px 16px 9px;
  color: #606266;
  font-size: 13px;
  background: transparent;
  border: 0;
  border-bottom: 2px solid transparent;
  cursor: pointer;
}

.verify-tab:hover {
  color: #1677ff;
}

.verify-tab.active {
  color: #1677ff;
  border-bottom-color: #1677ff;
  font-weight: 500;
}

/* 表格容器 */
.verify-table-wrap {
  flex: 1;
  min-height: 0;
  padding: 12px 16px 16px;
  overflow: hidden;
}

.verify-table {
  height: 100%;
}

.verify-table :deep(td),
.verify-table :deep(th) {
  color: #c0c4cc;
}

.verify-table :deep(.row-active td) {
  color: #303133;
}

/* 备注输入：无边框 + 透明背景 */
.verify-table :deep(.remark-input .el-input__wrapper) {
  padding: 0 2px;
  background: transparent;
  box-shadow: none;
}

.verify-table :deep(.remark-input .el-input__wrapper:hover),
.verify-table :deep(.remark-input .el-input__wrapper.is-focus) {
  box-shadow: inset 0 -1px 0 #1677ff;
}

.verify-table :deep(.remark-input .el-input__inner) {
  color: inherit;
}

/* 过渡动画 */
.verify-slide-enter-active,
.verify-slide-leave-active {
  transition: transform 0.25s ease;
}

.verify-slide-enter-from,
.verify-slide-leave-to {
  transform: translateX(100%);
}
</style>