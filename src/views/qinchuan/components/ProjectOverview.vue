<template>
  <section class="dashboard-panel project-panel">
    <div class="panel-heading" :style="{ backgroundImage: `url(${titleBg})` }">
      <div class="heading-left">
        <img :src="xmgkIcon" class="heading-img" alt="项目概况" />
        <span class="panel-title">项目概况</span>
      </div>
      <div class="panel-location">
        <span>陕西省</span>
        <svg class="location-icon" viewBox="0 0 24 24" fill="currentColor" style="width: 14px !important; height: 14px !important;">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
        </svg>
      </div>
    </div>

    <div class="project-table" v-loading="loading" element-loading-background="rgba(0,0,0,0)">
      <div class="project-header">
        <span>项目阶段</span>
        <span>总容量/MW</span>
        <span>风电/MW</span>
        <span>光伏/MW</span>
      </div>

      <button
        v-for="row in displayRows"
        :key="row.key"
        class="project-row"
        :class="{ 'is-selected': selectedKey === row.key }"
        type="button"
        @click="selectRow(row)"
      >
        <div class="decor-line left" v-if="selectedKey === row.key">
          <span class="dot"></span><span class="line"></span><span class="dot"></span>
        </div>
        <div class="decor-line right" v-if="selectedKey === row.key">
          <span class="dot"></span><span class="line"></span><span class="dot"></span>
        </div>

        <span class="stage-cell">
          <i class="stage-dot" :style="{ backgroundColor: row.color, color: row.color }" />

          <div v-if="row.isDropdown" class="dropdown-trigger" @click.stop="toggleDropdown">
            <span class="stage-name">{{ row.stage }}</span>
            <i class="arrow-icon" :class="{ 'is-open': dropdownOpen }"></i>

            <transition name="fade">
              <div v-if="dropdownOpen" class="glass-dropdown">
                <div
                  v-for="opt in dropdownOptions"
                  :key="opt.key"
                  class="dropdown-item"
                  :class="{ active: selectedDropdownKey === opt.key }"
                  @click.stop="selectOption(opt)"
                >{{ opt.name }}</div>
              </div>
            </transition>
          </div>

          <span v-else class="stage-name">{{ row.stage }}</span>
        </span>

        <div class="capacity-group">
          <span class="bracket bracket-left"></span>
          <div class="capacity-values">
            <span class="val-total">
              {{ formatNumber(row.totalCapacity) }}<small class="val-count">/{{ row.totalCount ?? 0 }}</small>
            </span>
            <span class="val-wind">
              {{ formatNumber(row.wind?.value) }}<small class="val-count">/{{ row.wind?.count ?? 0 }}</small>
            </span>
            <span class="val-solar">
              {{ formatNumber(row.solar?.value) }}<small class="val-count">/{{ row.solar?.count ?? 0 }}</small>
            </span>
          </div>
          <span class="bracket bracket-right"></span>
        </div>
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import titleBg from '@/assets/img/qinchuan/dashbord/title-bg.png'
import xmgkIcon from '@/assets/img/qinchuan/dashbord/xmgk.png'
import * as configApi from '@/api/modules/selectConfig'

const props = defineProps({
  rows: { type: Array, default: () => [] },
  modelValue: { type: [String, Number], default: null },
  regionCode: { type: String, default: '610000' },
  regionType: { type: String, default: 'PROVINCE' },
})
const emit = defineEmits(['select', 'update:modelValue'])

// ===== 5 行固定定义 =====
const ROW_DEFINITIONS = [
  { key: 'PRELIMINARY_SELECTION', name: '初步遴选', baseColor: '#b37feb', isDropdown: false },
  { key: 'PROJECT_RESERVE',       name: '已储备',   baseColor: '#f759ab', isDropdown: false },
  { key: 'AGGREGATION',           name: '推进中',   baseColor: '#ffc069', isDropdown: true  },
  { key: 'PROJECT_CONSTRUCTION',  name: '施工中',   baseColor: '#597ef7', isDropdown: false },
  { key: 'PROJECT_OPERATION',     name: '已投产',   baseColor: '#a0d911', isDropdown: false },
]

const dropdownOptions = [
  { key: 'AGGREGATION',         name: '推进中' },
  { key: 'PROJECT_INITIATION',  name: '立项中' },
  { key: 'FEASIBILITY_REVIEW',  name: '可研中' },
  { key: 'INVESTMENT_DECISION', name: '投决中' },
]

// 需要拉取的阶段 code（不含 AGGREGATION，因为推进中本身无数据）
const FETCH_STAGE_CODES = [
  'PRELIMINARY_SELECTION',
  'PROJECT_RESERVE',
  'PROJECT_INITIATION',
  'FEASIBILITY_REVIEW',
  'INVESTMENT_DECISION',
  'PROJECT_CONSTRUCTION',
  'PROJECT_OPERATION',
]

// ===== 选中态 =====
const selectedKey = ref(props.modelValue ?? null)
watch(() => props.modelValue, (val) => { selectedKey.value = val ?? null })

// ===== 下拉 =====
const dropdownOpen = ref(false)
const selectedDropdownKey = ref('AGGREGATION')

function toggleDropdown() { dropdownOpen.value = !dropdownOpen.value }

// ★ 下拉选中 = 选中该行 + 触发地图刷新
function selectOption(opt) {
  selectedDropdownKey.value = opt.key
  dropdownOpen.value = false

  // 自动选中这一行（如果还没选）
  selectedKey.value = 'AGGREGATION'
  emit('update:modelValue', 'AGGREGATION')

  // 拿到切换后该行的最新数据再 emit
  const row = displayRows.value.find(r => r.key === 'AGGREGATION')
  if (row) emit('select', buildEmitPayload(row))
}

function handleClickOutside(e) {
  if (dropdownOpen.value && !e.target.closest('.dropdown-trigger')) dropdownOpen.value = false
}

// ===== 真实数据 =====
const stageDataMap = ref({})
const loading = ref(false)
const hasLoaded = ref(false)

const EMPTY_DATA = () => ({
  wind:  { value: 0, count: 0 },
  solar: { value: 0, count: 0 },
  totalCapacity: 0,
  totalCount: 0,
})

async function loadStageOverview() {
  loading.value = true
  try {
    const results = await Promise.all(FETCH_STAGE_CODES.map(async (code) => {
      try {
        const res = await configApi.overViewData({
          regionCode: props.regionCode,
          regionType: props.regionType,
          projectStage: code,
        })
        const d = res?.data ?? {}
        return [code, {
          wind:  { value: Number(d.windCapacity)  || 0, count: Number(d.windCount)  || 0 },
          solar: { value: Number(d.solarCapacity) || 0, count: Number(d.solarCount) || 0 },
          totalCapacity: Number(d.totalCapacity) || 0,
          totalCount:    Number(d.totalCount)    || 0,
        }]
      } catch (err) {
        console.warn(`[ProjectOverview] 阶段 ${code} 加载失败:`, err)
        return [code, EMPTY_DATA()]
      }
    }))
    stageDataMap.value = Object.fromEntries(results)
  } finally {
    loading.value = false
    hasLoaded.value = true
  }
}

// ===== 基础行 =====
const baseRows = computed(() => {
  return ROW_DEFINITIONS.map((def) => {
    // ★ AGGREGATION（推进中）不再做子阶段聚合：直接用自己的数据，无数据就是 0
    const data = stageDataMap.value[def.key] || EMPTY_DATA()
    return { ...def, ...data }
  })
})

// 最大容量（用于色阶）：只看当前实际有值的行
const maxCapacity = computed(() => {
  const max = baseRows.value.reduce((m, r) => Math.max(m, Number(r.totalCapacity) || 0), 0)
  return max > 0 ? max : 1
})

// ===== 最终渲染的行 =====
const displayRows = computed(() => {
  return baseRows.value.map((row) => {
    let stageName = row.name
    let rowData = row

    // 下拉行：选中子阶段时用子阶段数据替换
    if (row.isDropdown && selectedDropdownKey.value !== 'AGGREGATION') {
      const subData = stageDataMap.value[selectedDropdownKey.value]
      const opt = dropdownOptions.find(o => o.key === selectedDropdownKey.value)
      if (subData && opt) {
        stageName = opt.name
        rowData = { ...row, ...subData }
      }
    }

    // 颜色：下拉行固定；其它行按容量比例调深浅
    const color = row.isDropdown
      ? row.baseColor
      : colorByCapacity(row.baseColor, (Number(rowData.totalCapacity) || 0) / maxCapacity.value)

    return { ...rowData, stage: stageName, color }
  })
})

// ===== 色相不变，调 s/l =====
function hexToHsl(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '')
  if (!m) return { h: 210, s: 80, l: 55 }
  const int = parseInt(m[1], 16)
  const r = ((int >> 16) & 255) / 255
  const g = ((int >> 8) & 255) / 255
  const b = (int & 255) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0, s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
    else if (max === g) h = ((b - r) / d + 2) / 6
    else h = ((r - g) / d + 4) / 6
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360
  s = Math.max(0, Math.min(100, s)) / 100
  l = Math.max(0, Math.min(100, l)) / 100
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0, g = 0, b = 0
  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  const toHex = (v) => Math.round((v + m) * 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function colorByCapacity(baseHex, ratio) {
  const { h } = hexToHsl(baseHex)
  const r = Math.max(0, Math.min(1, Number(ratio) || 0))
  return hslToHex(h, 45 + 45 * r, 40 + 20 * r)
}

// ===== emit =====
function buildEmitPayload(row) {
  return {
    key: row.key,
    dropdownKey: row.isDropdown ? selectedDropdownKey.value : row.key,
    stage: row.stage,
    color: row.color,
    baseColor: row.baseColor,
    totalCapacity: row.totalCapacity,
    totalCount: row.totalCount,
    wind: row.wind,
    solar: row.solar,
    isDropdown: row.isDropdown,
  }
}

function selectRow(row) {
  if (selectedKey.value === row.key) {
    selectedKey.value = null
    emit('update:modelValue', null)
    emit('select', null)
    return
  }
  selectedKey.value = row.key
  emit('update:modelValue', row.key)
  emit('select', buildEmitPayload(row))
}

function formatNumber(val) {
  if (val === undefined || val === null || isNaN(val)) return '0.00'
  return Number(val).toFixed(2)
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  loadStageOverview()
})
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

defineExpose({ refresh: loadStageOverview, loading })
</script>

<style scoped>
/* ==================== 面板外壳 ==================== */
.dashboard-panel {
  position: relative;
  width: 100%;
  box-sizing: border-box;
  border: 0.93px solid transparent;
  border-image: linear-gradient(162.05deg, rgba(165, 199, 238, 0.0001) 21.01%, #0077FF 51.91%, rgba(165, 199, 238, 0.2) 91.52%) 1;
  border-top: none;
  border-radius: 0px 0px 11px 11px;
  background: linear-gradient(180deg, rgba(16, 98, 222, 0.12) 0%, rgba(57, 126, 233, 0.11) 54.88%, rgba(19, 98, 215, 0.05) 75.82%, rgba(0, 95, 223, 0.03) 100%),
              linear-gradient(180deg, rgba(0, 40, 96, 0) 0%, rgba(0, 42, 95, 0.09) 23.24%, rgba(0, 42, 97, 0.23) 44.61%, rgba(0, 40, 96, 0.27) 100%);
  backdrop-filter: blur(14px);
  box-shadow: inset 0 0 24px rgba(20, 136, 237, 0.1), 0 0 16px rgba(0, 116, 224, 0.13);
  margin-top: 14px;
  container-type: size;
  display: flex;
  flex-direction: column;
}

.panel-heading {
  position: absolute;
  top: -14px; left: 0;
  width: 100%; height: 42px;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 12px;
  box-sizing: border-box;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: center;
}
.heading-left { display: flex; align-items: center; gap: 6px; transform: translateY(-4px); }
.heading-img { height: 26px; width: auto; object-fit: contain; }
.panel-title {
  font-family: 'YouSheBiaoTiHei', sans-serif;
  font-size: 20px; line-height: 17px;
  background: linear-gradient(180deg, #FFFFFF 24.68%, #CAE2FF 69.7%, #8FACD7 86.96%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  transform: matrix(1, 0, -0.16, 0.99, 0, 0);
}
.panel-location {
  display: flex; align-items: center; gap: 4px;
  font-family: 'PingFang SC', sans-serif;
  font-size: 13px; font-weight: 500;
  color: #fff; opacity: 0.9;
  transform: translateY(-4px);
}
.location-icon { color: #00d2ff; flex-shrink: 0; }

/* ==================== 表格布局 ==================== */
.project-table {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  padding: 28px 12px 12px;
  box-sizing: border-box;
  overflow: visible;
}

.project-header, .project-row {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr 1fr;
  align-items: center;
  column-gap: 4px;
}

.project-header {
  flex: 0 0 auto;
  height: 24px;
  padding: 0 6px;
  color: rgba(255, 255, 255, 0.6);
  font-family: 'PingFang SC', sans-serif;
  font-size: 12px;
}
.project-header > span:first-child { padding-left: 8px; }
.project-header > span:not(:first-child) { text-align: center; }

.project-row {
  position: relative;
  width: 100%;
  min-height: 32px;
  margin-top: 6px;
  padding: 4px 6px;
  box-sizing: border-box;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
}
.project-row:hover { background: rgba(255, 255, 255, 0.03); }
.project-row.is-selected {
  background: rgba(91, 137, 254, 0.2);
  border-radius: 7.45px;
}

/* ==================== 阶段列 ==================== */
.stage-cell {
  display: flex; align-items: center; gap: 6px;
  font-family: 'PingFang SC', sans-serif;
  font-size: 13px; font-weight: 500;
  white-space: nowrap;
}
.stage-dot {
  display: inline-block;
  width: 6px; height: 6px;
  flex-shrink: 0;
  border-radius: 50%;
  box-shadow: 0 0 8px 1px currentColor;
}
.stage-name {
  background: linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.7) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* ==================== 下拉 ==================== */
.dropdown-trigger {
  position: relative;
  display: flex; align-items: center; gap: 4px;
  cursor: pointer;
  padding: 2px 4px; border-radius: 4px;
}
.arrow-icon {
  display: inline-block;
  width: 0; height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 5px solid rgba(255, 255, 255, 0.6);
  transition: transform 0.3s;
}
.arrow-icon.is-open { transform: rotate(180deg); }

.glass-dropdown {
  position: absolute;
  top: 100%; left: 0;
  margin-top: 4px;
  min-width: 85px;
  padding: 4px;
  background: linear-gradient(180deg, rgba(16, 98, 222, 0.4) 0%, rgba(57, 126, 233, 0.35) 54.88%, rgba(19, 98, 215, 0.2) 75.82%, rgba(0, 95, 223, 0.15) 100%),
              linear-gradient(180deg, rgba(0, 40, 96, 0.2) 0%, rgba(0, 42, 95, 0.3) 23.24%, rgba(0, 42, 97, 0.4) 44.61%, rgba(0, 40, 96, 0.5) 100%);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(0, 119, 255, 0.4);
  border-radius: 4px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
  z-index: 999;
}
.dropdown-item {
  padding: 6px 10px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  border-radius: 3px;
  white-space: nowrap;
  transition: all 0.2s;
}
.dropdown-item:hover { background: rgba(27, 126, 242, 0.3); color: #fff; }
.dropdown-item.active { color: #00CEEA; font-weight: bold; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-4px); }

/* ==================== 容量数据组 ==================== */
.capacity-group {
  grid-column: span 3;
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  padding: 2px 0;
  height: 22px;
}
.bracket { width: 6px; border: 1px solid rgba(255, 255, 255, 0.2); }
.bracket-left { border-right: none; }
.bracket-right { border-left: none; }
.capacity-values {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
}
.capacity-values > span {
  text-align: center;
  font-family: 'PingFang SC', sans-serif;
  font-size: 13px;
  font-weight: 600;
}
.val-wind { color: #20DAED; }
.val-solar { color: #42A3FC; }
.val-total { color: #42A3FC; }
.val-count {
  margin-left: 1px;
  font-size: 10px;
  font-weight: 400;
  opacity: 0.75;
  color: inherit;
}

/* ==================== 装饰线 ==================== */
.decor-line {
  position: absolute; top: 50%; transform: translateY(-50%);
  display: flex; flex-direction: column; align-items: center;
  height: 100%; padding: 4px 0; box-sizing: border-box; pointer-events: none;
}
.decor-line.left { left: 0px; } .decor-line.right { right: 0px; }
.decor-line .dot { width: 4px; height: 4px; border: 1px solid #FFFFFF; }
.decor-line .line { width: 0; flex: 1; border-left: 1px solid rgba(255, 255, 255, 0.2); }

/* ==================== 容器自适应 ==================== */
@container (min-height: 200px) {
  .project-table { padding: clamp(20px, 10cqh, 28px) clamp(8px, 3cqw, 12px) 8px; }
  .project-header { font-size: clamp(11px, 3cqw, 12px); }
  .stage-cell, .capacity-values > span { font-size: clamp(12px, 3.2cqw, 13px); }
  .project-row { min-height: clamp(28px, 8cqh, 32px); margin-top: clamp(4px, 2cqh, 6px); }
}
</style>