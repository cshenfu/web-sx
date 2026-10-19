<template>
  <div class="revenue-tab">
    <div class="table-wrap">
      <table class="year-table">
        <colgroup>
          <col class="col-project" />
          <col class="col-unit" />
          <col class="col-mode-type" />
          <col class="col-mode-value" />
          <col v-for="y in totalYearCols" :key="`col-${y}`" class="col-year" />
        </colgroup>
        <thead>
          <tr>
            <th class="col-project th-bg" rowspan="2">项目</th>
            <th class="col-unit th-bg" rowspan="2">单位</th>
            <th class="col-mode-type th-bg" colspan="2" style="text-align:center;border-bottom:none">设置方式</th>
            <th :colspan="CONSTRUCTION_YEARS" class="period-header construction">建设期</th>
            <th :colspan="operationYears" class="period-header operation">运营期</th>
          </tr>
          <tr>
            <th class="col-mode-type th-bg" style="font-weight:400;color:#888;font-size:12px;border-top:none">方式</th>
            <th class="col-mode-value th-bg" style="font-weight:400;color:#888;font-size:12px">数值</th>
            <th v-for="y in constructionCols" :key="`ch-${y}`" class="year-th th-bg">第{{ y }}年</th>
            <th v-for="y in operationCols"    :key="`oh-${y}`" class="year-th th-bg">第{{ y }}年</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="group in GROUPS" :key="group.label">
            <!-- 分组标题行 -->
            <tr class="group-header-row">
              <td colspan="4" class="group-header-cell group-header-sticky">{{ group.label }}</td>
              <td :colspan="CONSTRUCTION_YEARS + operationYears" class="group-header-fill" />
            </tr>

            <!-- 数据行 -->
            <tr v-for="row in groupRows(group)" :key="row.id">
              <!-- 项目 -->
              <td class="col-project td-bg">
                <div class="label-cell">{{ row.label }}</div>
              </td>

              <!-- 单位 -->
              <td class="col-unit td-bg p0 center">
                <select v-if="row.unitOptions" v-model="row.unit" class="cell-select center">
                  <option v-for="opt in row.unitOptions" :key="opt" :value="opt">{{ opt }}</option>
                </select>
                <span v-else class="unit-label">{{ row.unit }}</span>
              </td>

              <!-- 设置方式 col1 -->
              <td class="col-mode-type td-bg p0" :colspan="row.isSimpleInput ? 2 : 1">
                <template v-if="row.isSimpleInput">
                  <input
                    :value="row.quickValue"
                    type="number"
                    class="cell-input"
                    placeholder="请输入"
                    @input="row.quickValue = $event.target.value === '' ? null : Number($event.target.value)"
                  />
                </template>
                <template v-else>
                  <select
                    v-model="row.mode"
                    class="cell-select"
                    @change="e => onModeChange(row, e.target.value)"
                  >
                    <option value="quick">快速输入</option>
                    <option value="annual">逐年输入</option>
                  </select>
                </template>
              </td>

              <!-- 设置方式 col2：快速值输入（非简单行） -->
              <td v-if="!row.isSimpleInput" class="col-mode-value td-bg p0">
                <input
                  v-if="row.mode === 'quick'"
                  :value="row.quickValue"
                  type="number"
                  class="cell-input center"
                  placeholder="请输入"
                  @input="onQuickValueChange(row, $event)"
                />
              </td>

              <!-- 年份列：普通行 -->
              <template v-if="!row.isSimpleInput">
                <!-- 建设期：固定第1年，锁定为 0 -->
                <td
                  v-for="y in constructionCols"
                  :key="`c-${row.id}-${y}`"
                  class="year-td cell-locked"
                >
                  <span class="cell-zero">0</span>
                </td>

                <!-- 运营期：第2年起 -->
                <td
                  v-for="y in operationCols"
                  :key="`o-${row.id}-${y}`"
                  class="year-td p0"
                  :class="row.mode === 'quick' ? 'cell-locked' : ''"
                >
                  <span v-if="row.mode === 'quick'" class="cell-zero">
                    {{ row.yearValues[y - 1] !== null ? row.yearValues[y - 1] : '' }}
                  </span>
                  <input
                    v-else
                    :value="row.yearValues[y - 1]"
                    type="number"
                    class="cell-input center"
                    @input="setYearValue(row, y - 1, $event)"
                  />
                </td>
              </template>

              <!-- 简单行：年份区域整行灰色占位 -->
              <template v-else>
                <td
                  :colspan="CONSTRUCTION_YEARS + operationYears"
                  class="cell-locked"
                  style="text-align:left;padding-left:8px;color:#bbb;font-size:12px"
                >—</td>
              </template>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { TOTAL_YEARS } from '../types.js'

// 建设期固定为第1年，不受外部 prop 影响
const CONSTRUCTION_YEARS = 1

const props = defineProps({
  modelValue: { type: Array, required: true },
})
const emit = defineEmits(['update:modelValue'])

// 建设期只有第1年
const constructionCols = [1]
// 运营期从第2年到最后一年
const operationCols = computed(() =>
  Array.from({ length: TOTAL_YEARS - CONSTRUCTION_YEARS }, (_, i) => CONSTRUCTION_YEARS + 1 + i)
)
const operationYears = computed(() => TOTAL_YEARS - CONSTRUCTION_YEARS)
const totalYearCols  = computed(() => TOTAL_YEARS)

const GROUPS = [
{ label: '风电收入', start: 0, end: 3  },  // 原 end:5，减2→3
  { label: '其他收入', start: 4, end: 7  },  // 原 start:6→4, end:9→7
  { label: '税率',     start: 8, end: 11 },
]

function groupRows(group) {
  return props.modelValue.slice(group.start, group.end + 1)
}

function onModeChange(row, mode) {
  row.mode = mode
  if (mode === 'quick') {
    const val = row.quickValue !== null ? Number(row.quickValue) : null
    for (let i = CONSTRUCTION_YEARS; i < TOTAL_YEARS; i++) {
      row.yearValues[i] = val
    }
  }
}

function onQuickValueChange(row, event) {
  const val = event.target.value === '' ? null : Number(event.target.value)
  row.quickValue = val
  for (let i = CONSTRUCTION_YEARS; i < TOTAL_YEARS; i++) {
    row.yearValues[i] = val
  }
}

function setYearValue(row, index, event) {
  const val = event.target.value === '' ? null : Number(event.target.value)
  row.yearValues[index] = val
}
</script>

<style scoped>
.revenue-tab { width: 100%; }

.table-wrap {
  overflow-x: auto;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
}

.year-table {
  border-collapse: collapse;
  min-width: max-content;
  width: 100%;
}

.year-table th,
.year-table td {
  border: 1px solid #e8e8e8;
  white-space: nowrap;
  font-size: 13px;
  box-sizing: border-box;
}

.year-table th {
  font-weight: 500;
  text-align: center;
  padding: 8px 4px;
}

/* ── colgroup 定义列宽 ── */
col.col-project   { width: 160px; }
col.col-unit      { width: 80px; }
col.col-mode-type { width: 120px; }
col.col-mode-value{ width: 90px; }
col.col-year      { width: 88px; }

/* ── Sticky 固定列 ── */
.col-project   { position: sticky; left: 0;    z-index: 3; min-width: 160px; max-width: 160px; }
.col-unit      { position: sticky; left: 160px; z-index: 3; min-width: 80px;  max-width: 80px;  }
.col-mode-type { position: sticky; left: 240px; z-index: 3; min-width: 120px; max-width: 120px; }
.col-mode-value{ position: sticky; left: 360px; z-index: 3; min-width: 90px;  max-width: 90px;  }

thead th.col-project,
thead th.col-unit,
thead th.col-mode-type,
thead th.col-mode-value { z-index: 4; }

.th-bg { background: #f0f2f5; }
.td-bg { background: #fff; }

/* ── 年份列 ── */
.year-th {
  min-width: 88px;
  max-width: 88px;
  text-align: center;
  padding: 8px 4px;
}
.year-td {
  min-width: 88px;
  max-width: 88px;
  text-align: center;
  padding: 0;
  background: #fff;
}

/* ── 锁定单元格 ── */
.cell-locked {
  background: #f5f5f5 !important;
  pointer-events: none;
  user-select: none;
  cursor: default;
}

.cell-zero {
  display: block;
  color: #999;
  font-size: 13px;
  text-align: center;
  line-height: 36px;
  height: 36px;
}

/* ── 透明输入框 ── */
.cell-input {
  display: block;
  width: 100%;
  height: 36px;
  padding: 0 4px;
  border: none;
  background: transparent;
  outline: none;
  font-size: 13px;
  color: #333;
  box-sizing: border-box;
  cursor: text;
  -moz-appearance: textfield;
}
.cell-input::-webkit-outer-spin-button,
.cell-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.cell-input:focus { background: rgba(22, 119, 255, 0.04); }
.cell-input.center { text-align: center; }

/* ── 透明下拉框 ── */
.cell-select {
  display: block;
  width: 100%;
  height: 36px;
  padding: 0 4px;
  border: none;
  background: transparent;
  outline: none;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  box-sizing: border-box;
}
.cell-select.center { text-align: center; }
.cell-select:focus { background: rgba(22, 119, 255, 0.04); }

.unit-label {
  display: block;
  text-align: center;
  line-height: 36px;
  height: 36px;
  font-size: 13px;
  color: #333;
}

/* ── 辅助类 ── */
.p0     { padding: 0; }
.center { text-align: center; }

/* ── 分组标题行 ── */
.group-header-cell {
  background: #f5f5f5;
  font-weight: 600;
  color: #444;
  padding: 8px 12px;
  font-size: 13px;
}
.group-header-sticky {
  position: sticky;
  left: 0;
  z-index: 3;
  background: #f5f5f5;
}
.group-header-fill {
  background: #f5f5f5;
  padding: 0;
}

/* ── 建设期/运营期大标题 ── */
.period-header { font-weight: 600; text-align: center; padding: 8px 4px; }
.period-header.construction { background: #e8f0fe; }
.period-header.operation    { background: #f0f2f5; }

.label-cell {
  display: flex;
  align-items: center;
  padding: 0 10px;
  height: 36px;
  box-sizing: border-box;
}
</style>
