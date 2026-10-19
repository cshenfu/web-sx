<template>
  <div class="cost-tab">
    <div class="table-wrap">
      <table class="year-table">
        <thead>
          <tr>
            <th class="col-project">项目</th>
            <th class="col-unit">单位</th>
            <th class="col-mode">设置方式</th>
            <th :colspan="CONSTRUCTION_YEARS" class="period-header construction">建设期</th>
            <th :colspan="operationYears" class="period-header operation">运营期</th>
          </tr>
          <tr>
            <th class="col-project" />
            <th class="col-unit" />
            <th class="col-mode" />
            <th v-for="y in constructionCols" :key="`ch-${y}`" class="year-cell">第{{ y }}年</th>
            <th v-for="y in operationCols" :key="`oh-${y}`" class="year-cell">第{{ y }}年</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in rows" :key="row.id">
            <td class="col-project td-bg">
              <div class="label-cell">
                <button v-if="row.isDynamic" class="del-btn" type="button" @click="deleteRow(idx)">−</button>
                <!-- 动态行：名称可编辑，失焦时校验唯一性 -->
                <input
                  v-if="row.isDynamic"
                  :value="row.label"
                  class="cell-input label-input"
                  :class="{ 'label-error': labelErrors[row.id] }"
                  type="text"
                  placeholder="请输入名称"
                  @change="e => onLabelChange(row, e)"
                />
                <span v-if="row.isDynamic && labelErrors[row.id]" class="label-error-tip">名称已存在</span>
                <!-- 固定行：仅展示 -->
                <span v-if="!row.isDynamic">{{ row.label }}</span>
              </div>
            </td>
            <td class="col-unit td-bg p0 center">
              <select
                v-if="['元/kW', '万元'].includes(row.unit)"
                v-model="row.unit"
                class="cell-select unit-select"
              >
                <option value="元/kW">元/kW</option>
                <option value="万元">万元</option>
              </select>
              <span v-else class="unit-label">{{ row.unit }}</span>
            </td>
            <td class="col-mode td-bg">
              <div class="mode-cell">
                <select
                  v-model="row.mode"
                  class="cell-select mode-select"
                  @change="() => onModeChange(row, row.mode)"
                >
                  <option value="quick">快速输入</option>
                  <option value="annual">逐年输入</option>
                </select>
                <input
                  v-if="row.mode === 'quick'"
                  :value="row.quickValue"
                  type="number"
                  class="cell-input mode-input"
                  placeholder="请输入值"
                  @input="e => onQuickValueChange(row, e)"
                />
              </div>
            </td>
            <!-- 建设期：固定第1年，锁定为 0 -->
            <td
              v-for="y in constructionCols"
              :key="`c-${row.id}-${y}`"
              class="year-cell cell-locked"
            >
              <span class="cell-zero">0</span>
            </td>
            <!-- 运营期：第2年起 -->
            <td
              v-for="y in operationCols"
              :key="`o-${row.id}-${y}`"
              class="year-cell"
              :class="row.mode === 'quick' ? 'cell-locked' : ''"
            >
              <span v-if="row.mode === 'quick'" class="cell-zero">{{ row.yearValues[y - 1] ?? '' }}</span>
              <input
                v-else
                :value="row.yearValues[y - 1]"
                type="number"
                class="cell-input center"
                @input="e => { row.yearValues[y - 1] = e.target.value === '' ? null : Number(e.target.value) }"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <button class="add-row-btn" type="button" @click="addRow">
      <span class="add-icon">⊕</span> 添加其他费用项
    </button>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { TOTAL_YEARS, initTableRow } from '../types.js'

// 建设期固定为第1年，不受外部 prop 影响
const CONSTRUCTION_YEARS = 1

const props = defineProps({
  modelValue: { type: Array, required: true },
})
const emit = defineEmits(['update:modelValue'])

const rows = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

// 建设期只有第1年
const constructionCols = [1]
// 运营期从第2年到最后一年
const operationCols = computed(() =>
  Array.from({ length: TOTAL_YEARS - CONSTRUCTION_YEARS }, (_, i) => CONSTRUCTION_YEARS + 1 + i)
)
const operationYears = computed(() => TOTAL_YEARS - CONSTRUCTION_YEARS)

// ── 名称校验错误状态（key: row.id） ────────────────────────────
const labelErrors = reactive({})

/**
 * 名称变更：校验唯一性，重复则恢复旧值并提示
 */
function onLabelChange(row, event) {
  const newLabel = event.target.value.trim()

  // 不允许为空
  if (!newLabel) {
    event.target.value = row.label
    return
  }

  // 检查是否与其他行重复（不含自身）
  const isDuplicate = props.modelValue.some(r => r.id !== row.id && r.label === newLabel)
  if (isDuplicate) {
    event.target.value = row.label   // 恢复旧值
    labelErrors[row.id] = true
    message.error(`名称"${newLabel}"已存在，请使用其他名称`)
    // 短暂显示错误样式后清除
    setTimeout(() => { delete labelErrors[row.id] }, 2000)
    return
  }

  delete labelErrors[row.id]
  row.label = newLabel
}

function onModeChange(row, mode) {
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

/**
 * 计算下一个可用的"其他费用N"标签（从 2 开始，跳过已存在的编号）
 */
function getNextLabel() {
  const existingLabels = new Set(props.modelValue.map(r => r.label))
  let n = 2
  while (existingLabels.has(`其他费用${n}`)) n++
  return `其他费用${n}`
}

function addRow() {
  const label = getNextLabel()
  const newRow = initTableRow(
    `dynamic_${Date.now()}`,
    label,
    '万元',
    { isDynamic: true, constructionReadOnly: true }
  )
  emit('update:modelValue', [...props.modelValue, newRow])
}

function deleteRow(idx) {
  const row = props.modelValue[idx]
  if (row) delete labelErrors[row.id]
  emit('update:modelValue', props.modelValue.filter((_, i) => i !== idx))
}
</script>

<style scoped>
.cost-tab { width: 100%; }
.table-wrap { overflow-x: auto; border: 1px solid #e8e8e8; border-radius: 8px; }
.year-table { border-collapse: collapse; min-width: max-content; width: 100%; }
.year-table th, .year-table td { border: 1px solid #e8e8e8; white-space: nowrap; font-size: 13px; }
.year-table th { background: #f0f2f5; font-weight: 500; text-align: center; padding: 8px 10px; }

.col-project { position: sticky; left: 0;    z-index: 3; min-width: 150px; max-width: 150px; }
.col-unit    { position: sticky; left: 150px; z-index: 3; min-width: 70px;  max-width: 70px; text-align: center; }
.col-mode    { position: sticky; left: 220px; z-index: 3; min-width: 210px; max-width: 210px; }
.year-table thead th.col-project,
.year-table thead th.col-unit,
.year-table thead th.col-mode { z-index: 4; }

.td-bg { background: #fff; }
.year-cell { min-width: 90px; max-width: 90px; text-align: center; padding: 0; background: #fff; }

/* 锁定单元格：灰色、不可点击、不可选中 */
.cell-locked {
  background: #f5f5f5 !important;
  pointer-events: none;
  user-select: none;
  cursor: default;
}
.cell-zero { color: #999; font-size: 13px; line-height: 36px; height: 36px; display: block; }

.period-header { font-weight: 600; }
.period-header.construction { background: #e8f0fe; }
.period-header.operation    { background: #f0f2f5; }

.label-cell { display: flex; align-items: center; padding: 6px 10px; gap: 4px; flex-wrap: nowrap; }
.mode-cell  { display: flex; align-items: center; gap: 0; padding: 0; }

/* 透明下拉 */
.cell-select {
  display: block;
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
.cell-select:focus { background: rgba(22, 119, 255, 0.04); }
.mode-select { width: 80px; }

/* 透明输入框 */
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
.mode-input { width: 80px; border-left: 1px solid #e8e8e8; }

/* 名称重复错误样式 */
.label-input.label-error {
  border-bottom: 1px solid #ff4d4f !important;
  color: #ff4d4f;
}
.label-error-tip {
  font-size: 11px;
  color: #ff4d4f;
  white-space: nowrap;
  width: 100%;
  padding-left: 24px;
  line-height: 1;
  margin-top: 2px;
}

.p0     { padding: 0; }
.center { text-align: center; }

.unit-label {
  display: block;
  text-align: center;
  line-height: 36px;
  height: 36px;
  font-size: 13px;
  color: #333;
}
.unit-select { width: 100%; text-align: center; }

.del-btn {
  width: 20px; height: 20px; border-radius: 50%; background: #ff4d4f;
  color: #fff; border: none; cursor: pointer; font-size: 14px; line-height: 1;
  flex-shrink: 0; display: flex; align-items: center; justify-content: center;
}
.del-btn:hover { opacity: 0.8; }

.add-row-btn {
  display: inline-flex; align-items: center; gap: 4px;
  margin-top: 8px; padding: 6px 12px;
  color: #1677ff; background: none; border: none; cursor: pointer; font-size: 14px;
}
.add-row-btn:hover { text-decoration: underline; }
.add-icon { font-size: 18px; font-weight: bold; }

.label-input {
  width: 100%;
  min-width: 80px;
}
</style>
