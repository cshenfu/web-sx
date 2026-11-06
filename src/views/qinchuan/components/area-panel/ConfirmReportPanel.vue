<template>
  <div v-if="visible" class="confirm-panel">
    <header class="panel-header">
      <div class="header-left">
        <span class="company-name">{{ companyName }}</span>
      </div>
      <div class="header-right">
        <el-button @click="$emit('close')">取消</el-button>
        <el-button type="primary" :loading="confirming" @click="handleConfirm">保存</el-button>
      </div>
    </header>

    <div class="panel-body" v-loading="loading">
      <!-- 左侧导航 -->
      <aside class="side-nav">
        <div
          v-for="moduleName in MODULES"
          :key="moduleName"
          class="nav-item"
          :class="{ active: activeModule === moduleName }"
          @click="scrollToModule(moduleName)"
        >
          {{ moduleName }}
        </div>
      </aside>

      <!-- 右侧内容区 -->
      <main class="content-area" ref="contentRef" @scroll="handleScroll">
        <div
          v-for="moduleName in MODULES"
          :key="moduleName"
          class="module-section"
          :id="`module-${moduleName}`"
        >
          <div class="module-title">{{ moduleName }}</div>

          <div v-for="(subModule, idx) in (MODULE_CONFIG[moduleName] || [])" :key="idx" class="sub-module">
            <div class="sub-title" v-if="subModule.title">
              <span class="dot"></span>{{ subModule.title }}
            </div>

            <!-- 1. 财务表格 -->
            <div v-if="subModule.type === 'financial'" class="table-wrapper">
              <el-table 
                :data="getFinancialRows(subModule)" 
                size="small" 
                border 
                class="custom-table"
                max-height="400"
              >
                <el-table-column prop="name" label="项目" width="180" fixed="left" />
                <el-table-column 
                  v-if="getFinancialHasTotal(subModule)" 
                  prop="total" 
                  label="合计" 
                  width="100" 
                  align="center" 
                  fixed="left"
                >
                  <template #default="{ row }">
                    <el-input v-model="row.total" size="small" class="table-edit-input" />
                  </template>
                </el-table-column>
                <el-table-column
                  v-for="i in 21"
                  :key="i"
                  :label="`第${i}年`"
                  min-width="90"
                  align="center"
                >
                  <template #default="{ row }">
                    <el-input v-model="row.years[i - 1]" size="small" class="table-edit-input" />
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- 2. 测风塔湍流参数 (卡片布局) -->
            <div v-else-if="subModule.type === 'turbulence'" class="turbulence-grid">
              <div v-for="(towerData, tIdx) in groupedTurbulenceData" :key="tIdx" class="tower-block">
                <el-table :data="towerData.list" size="small" border class="custom-table">
                  <el-table-column prop="tower_code" label="测风塔塔号" align="center" />
                  <el-table-column prop="height" label="高度 (m)" align="center" />
                  <el-table-column prop="average_value" label="平均湍流强度" align="center" />
                  <el-table-column prop="representative_value" label="代表性湍流强度" align="center" />
                </el-table>
              </div>
            </div>

            <!-- 3. 多行固定表格 (电气二次) -->
            <div v-else-if="subModule.type === 'customRows'" class="table-wrapper">
              <el-table :data="subModule.rows" size="small" border class="custom-table">
                <el-table-column
                  v-for="(col, cIdx) in subModule.columns"
                  :key="cIdx"
                  :label="col"
                  :min-width="cIdx === 1 || cIdx === 4 ? 240 : 100"
                >
                  <template #default="{ row }">
                    <el-input 
                      v-if="row[cIdx] && row[cIdx].startsWith('${')" 
                      v-model="formData[row[cIdx]]" 
                      size="small" 
                      class="table-edit-input" 
                    />
                    <span v-else>{{ row[cIdx] }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- 4. 单行键值对表格 (GIS参数) -->
            <div v-else-if="subModule.type === 'kvTable'" class="table-wrapper">
              <el-table :data="[{}]" size="small" border class="custom-table">
                <el-table-column
                  v-for="(col, cIdx) in subModule.columns"
                  :key="cIdx"
                  :label="col"
                  :min-width="120"
                >
                  <template #default>
                    <el-input 
                      v-model="formData[subModule.fields[cIdx]]" 
                      size="small" 
                      class="table-edit-input" 
                    />
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- 5. 概算总表 (树形合并) -->
            <div v-else-if="subModule.type === 'estimateTable'" class="table-wrapper" :style="{ width: subModule.width || '100%' }">
              <el-table :data="estimateRows" size="small" border class="custom-table" :span-method="estimateSpanMethod">
                <el-table-column prop="parentName" label="项目名称" width="200" align="left" />
                <el-table-column prop="childName" label="项目名称" width="250" align="left" />
                <el-table-column prop="total" label="合计（万元）" align="left">
                  <template #default="{ row }">
                    <el-input v-if="row.totalField" v-model="formData[row.totalField]" size="small" class="table-edit-input" />
                    <span v-else>{{ row.total }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- 6. 普通动态表格 -->
            <div v-else-if="subModule.type === 'table'" class="table-wrapper" :style="{ width: subModule.width || '100%' }">
              <!-- 用地面积特殊表格 -->
              <template v-if="subModule.fieldKey === '${wind_farm_engineering_land_area_table}'">
                <el-table
                  :data="landTableRows"
                  size="small"
                  border
                  class="custom-table"
                  :span-method="landTableSpanMethod"
                >
                  <el-table-column prop="category" label="项目" width="150" />
                  <el-table-column prop="subItem" label="分项" width="200" />
                  <el-table-column label="征地面积（㎡）">
                    <template #default="{ row }">
                      <el-input
                        v-if="!row._isEmpty"
                        v-model="row.area"
                        size="small"
                        class="table-edit-input"
                      />
                      <span v-else></span>
                    </template>
                  </el-table-column>
                </el-table>
              </template>

              <!-- 普通数据表格 -->
              <template v-else>
                <el-table
                  :data="getProcessedTableData(subModule)"
                  size="small"
                  border
                  class="custom-table"
                  show-overflow-tooltip
                >
                  <el-table-column
                    v-for="(col, cIdx) in getProcessedTableColumns(subModule.fieldKey)"
                    :key="cIdx"
                    :label="col || `列 ${cIdx + 1}`"
                    min-width="120"
                  >
                    <template #default="{ row, $index }">
                      <el-input
                        v-model="row[`col_${cIdx}`]"
                        size="small"
                        class="table-edit-input"
                        @change="updateTableData(subModule.fieldKey, $index, cIdx, $event)"
                      />
                    </template>
                  </el-table-column>
                </el-table>
              </template>
            </div>

            <!-- 7. 普通字段表单 -->
            <div 
              v-else 
              class="field-grid" 
              :style="{ gridTemplateColumns: `repeat(${subModule.cols || 3}, 1fr)` }"
            >
              <div
                v-for="(field, fIdx) in subModule.fields"
                :key="fIdx"
                class="field-item"
                :style="{ gridColumn: `span ${getFieldSpan(field)}` }"
                v-show="field !== ''"
              >
                <div class="field-label">{{ getFieldLabel(getFieldKey(field)) }}</div>
                <div class="field-value-wrapper">
                  <el-input
                    v-if="getFieldType(field) === 'textarea'"
                    v-model="formData[getFieldKey(field)]"
                    type="textarea"
                    :rows="3"
                    :disabled="isFieldDisabled(getFieldKey(field))"
                    class="edit-textarea"
                  />
                  <el-input
                    v-else
                    v-model="formData[getFieldKey(field)]"
                    :disabled="isFieldDisabled(getFieldKey(field))"
                    class="edit-input"
                  >
                    <template #suffix>
                      <span class="unit-text">{{ getUnit(getFieldKey(field)) }}</span>
                    </template>
                  </el-input>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { updateUploadDetail, getParamsData } from '@/api/modules/aiProject'
import { MODULES, LABELS, UNITS, MODULE_CONFIG } from './paramsConfig.js'

const props = defineProps({
  visible: { type: Boolean, default: false },
  reportId: { type: [String, Number], default: null }
})

const emit = defineEmits(['close', 'success'])

const USE_LOCAL_MOCK = false 

const loading = ref(false)
const confirming = ref(false)
const rawData = ref({})
const formData = ref({})
const activeModule = ref(MODULES[0])
const contentRef = ref(null)

const landTableRows = ref([])
const financialState = ref({})

// ==========================================
// 配置提取与预处理
// ==========================================
const fieldConfigMap = {}
const tableFieldKeys = new Set()
const disabledIfEmptyMap = {}

Object.values(MODULE_CONFIG).forEach(mods => mods.forEach(sub => {
  if (sub.type === 'table' || sub.type === 'financial' || sub.type === 'kvTable' || sub.type === 'customRows') {
    if (sub.fieldKey) tableFieldKeys.add(sub.fieldKey)
    if (sub.fieldKeys) sub.fieldKeys.forEach(k => tableFieldKeys.add(k))
    if (sub.fields && sub.type === 'kvTable') sub.fields.forEach(k => tableFieldKeys.add(k))
    if (sub.rows && sub.type === 'customRows') {
      sub.rows.forEach(row => row.forEach(cell => {
        if (typeof cell === 'string' && cell.startsWith('${')) tableFieldKeys.add(cell)
      }))
    }
  }
  if (sub.fieldKey) fieldConfigMap[sub.fieldKey] = sub
  ;(sub.fields || []).forEach(f => {
    if (typeof f === 'object' && f.disabledIfEmpty) disabledIfEmptyMap[f.key] = true
  })
}))
tableFieldKeys.add('${wind_farm_engineering_land_area_table}')
tableFieldKeys.add('${eachTierHeightTurbulenceTableList}')

// ==========================================
// 字段属性方法
// ==========================================
const companyName = computed(() => {
  return formData.value['${construct_project_name}'] || '陕西华电新能源发电有限公司'
})

const getFieldKey = (f) => typeof f === 'string' ? f : f.key
const getFieldType = (f) => typeof f === 'string' ? 'text' : (f.type || 'text')
const getFieldSpan = (f) => (typeof f === 'object' && f.span) ? f.span : 1
const getFieldLabel = (key) => LABELS[key] || key.replace('${', '').replace('}', '')
const getUnit = (key) => UNITS[key] || ''

const isFieldDisabled = (key) => {
  if (!disabledIfEmptyMap[key]) return false
  const rawVal = rawData.value[key]
  return rawVal === undefined || rawVal === null || rawVal === ''
}

// ==========================================
// 表格/数据 渲染逻辑
// ==========================================
const isTableData = (val) => val && typeof val === 'object' && !Array.isArray(val) && val.columns && val.data

const getProcessedTableColumns = (fieldKey) => {
  const config = fieldConfigMap[fieldKey]
  if (config && config.columnIndexes) {
    return config.defaultColumns
  }
  const raw = formData.value[fieldKey]
  if (isTableData(raw) && raw.columns?.length > 0) {
    return raw.columns
  }
  if (Array.isArray(raw) && raw.length > 0 && Array.isArray(raw[0])) {
    return raw[0].map((cell, idx) => typeof cell === 'string' ? cell : `列 ${idx + 1}`)
  }
  return config?.defaultColumns || ['列1', '列2', '列3']
}

const getProcessedTableData = (subModule) => {
  const fieldKey = subModule.fieldKey
  const config = fieldConfigMap[fieldKey]
  const raw = formData.value[fieldKey]
  let rawRows = []
  
  if (isTableData(raw) && Array.isArray(raw.data)) {
    rawRows = raw.data
  } else if (Array.isArray(raw) && raw.length > 1) {
    rawRows = raw.slice(1)
  }

  if (rawRows.length === 0) {
    rawRows = [[]]
  }

  const cols = getProcessedTableColumns(fieldKey)
  return rawRows.map(rowArr => {
    const rowData = {}
    const safeRow = Array.isArray(rowArr) ? rowArr : []
    
    cols.forEach((_, idx) => {
      const realIdx = config?.columnIndexes ? config.columnIndexes[idx] : idx
      const cell = safeRow[realIdx]
      rowData[`col_${idx}`] = (cell === null || cell === undefined || typeof cell === 'object' && !Array.isArray(cell)) ? '' : cell
    })
    return rowData
  })
}

const updateTableData = (fieldKey, rowIndex, colIndex, newVal) => {
  let raw = formData.value[fieldKey]
  const config = fieldConfigMap[fieldKey]
  let cols = getProcessedTableColumns(fieldKey)
  
  if (!raw || (!isTableData(raw) && !Array.isArray(raw))) {
    raw = { columns: cols, data: [] }
  }

  let rawRows = []
  if (isTableData(raw)) rawRows = raw.data
  else if (Array.isArray(raw)) rawRows = raw.slice(1)

  if (rawRows.length === 0) rawRows = [[]]
  if (!rawRows[rowIndex]) rawRows[rowIndex] = []
  
  const realIdx = config?.columnIndexes ? config.columnIndexes[colIndex] : colIndex
  rawRows[rowIndex][realIdx] = newVal

  if (isTableData(raw)) {
    // 保留原始表头和完整数据，只修改对应单元格
    formData.value[fieldKey] = {
      columns: raw.columns,
      data: rawRows
    }
  } else {
    // 数组格式同样保留原始表头
    const originalHeaders = Array.isArray(raw) ? raw[0] : cols
    formData.value[fieldKey] = [originalHeaders, ...rawRows]
  }
}

// 测风塔
const groupedTurbulenceData = computed(() => {
  const rawList = rawData.value['${eachTierHeightTurbulenceTableList}'] || []
  if (!Array.isArray(rawList)) return []
  return rawList.map(towerArr => {
    if (Array.isArray(towerArr) && towerArr.length > 0 && typeof towerArr[0] === 'object') {
      return {
        name: towerArr[0].tower_code || '未知测风塔',
        list: towerArr
      }
    }
    return null
  }).filter(Boolean)
})

// 财务表格兜底
const getFinancialRows = (subModule) => {
  const key = (subModule.fieldKeys || []).join('|')
  const state = financialState.value[key]
  if (!state || !state.rows || state.rows.length === 0) {
    return (subModule.fieldKeys || []).map(k => ({
      key: k,
      name: getFieldLabel(k),
      unit: '万元',
      total: '',
      years: Array.from({ length: 21 }, () => ''),
      hasTotal: true
    }))
  }
  return state.rows
}
const getFinancialHasTotal = (subModule) => {
  const key = (subModule.fieldKeys || []).join('|')
  return financialState.value[key]?.hasTotal ?? true
}

// 用地面积合并
const landTableSpanMethod = ({ row, columnIndex, rowIndex }) => {
  if (columnIndex === 0) {
    const currentCategory = row.category
    if (!currentCategory) return { rowspan: 1, colspan: 1 }
    if (rowIndex > 0 && currentCategory === landTableRows.value[rowIndex - 1]?.category) {
      return { rowspan: 0, colspan: 0 }
    } else {
      let rowspan = 1
      for (let i = rowIndex + 1; i < landTableRows.value.length; i++) {
        if (landTableRows.value[i].category === currentCategory) rowspan++
        else break
      }
      return { rowspan, colspan: 1 }
    }
  }
}

// 概算总表数据与合并逻辑
const estimateRows = computed(() => {
  return [
    { parentName: '送出工程', childName: '送出工程', totalField: '${delivery_project}' },
    { parentName: '送出工程', childName: '扩建工程', totalField: '${expansion_project}' },
    { parentName: '送出工程', childName: '送出分摊费', totalField: '${outgoing_shared_cost}' },
    
    { parentName: '其他费用', childName: '配套费', totalField: '${supporting_cost}' },
    { parentName: '其他费用', childName: '片区管理综合楼', totalField: '${area_management_building}' },
    { parentName: '其他费用', childName: '智慧风场', totalField: '${smart_wind_farm}' },
    { parentName: '其他费用', childName: '新能源场站感知设备', totalField: '${new_energy_sensing_equipment}' },
    { parentName: '其他费用', childName: '研发费用', totalField: '${research_development_cost}' },
    { parentName: '其他费用', childName: '科技费用', totalField: '${technology_cost}' },
    { parentName: '其他费用', childName: '平台集控费', totalField: '${centralized_control_platform_cost}' },
    
    { parentName: '静态投资（部分）', childName: '', totalField: '${static_investment}' },
    { parentName: '动态投资（部分）', childName: '', totalField: '${dynamic_investment}' },
    { parentName: '单位千瓦静态投资（部分）', childName: '', totalField: '${static_investment_per_kw}' },
    { parentName: '单位千瓦动态投资（部分）', childName: '', totalField: '${dynamic_investment_per_kw}' },
    
    { parentName: '静态投资', childName: '', totalField: '${project_static_investment}' },
    { parentName: '动态投资', childName: '', totalField: '${project_dynamic_investment}' },
    { parentName: '单位千瓦静态投资', childName: '', totalField: '${unit_kw_static_investment}' },
    { parentName: '单位千瓦动态投资', childName: '', totalField: '${unit_kw_dynamic_investment}' }
  ]
})

const estimateSpanMethod = ({ row, columnIndex, rowIndex }) => {
  if (columnIndex === 0) {
    if (!row.childName) {
      return { rowspan: 1, colspan: 2 }
    }
    const currentParent = row.parentName
    if (rowIndex > 0 && currentParent === estimateRows.value[rowIndex - 1].parentName) {
      return { rowspan: 0, colspan: 0 }
    } else {
      let rowspan = 1
      for (let i = rowIndex + 1; i < estimateRows.value.length; i++) {
        if (estimateRows.value[i].parentName === currentParent) rowspan++
        else break
      }
      return { rowspan, colspan: 1 }
    }
  } else if (columnIndex === 1) {
    if (!row.childName) {
      return { rowspan: 0, colspan: 0 }
    }
  }
}

// ==========================================
// 数据清理
// ==========================================
const cleanEmptyValues = (obj) => {
  for (let key in obj) {
    if (tableFieldKeys.has(key)) continue
    if (obj[key] === null || obj[key] === undefined) {
      obj[key] = ''
    } else if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      if (Object.keys(obj[key]).length === 0) obj[key] = ''
      else cleanEmptyValues(obj[key])
    } else if (Array.isArray(obj[key])) {
      obj[key].forEach(item => {
        if (typeof item === 'object' && item !== null) cleanEmptyValues(item)
      })
    }
  }
}

// ==========================================
// 数据加载
// ==========================================
watch(() => [props.visible, props.reportId], async ([vis, rid]) => {
  if (!vis) return
  if (USE_LOCAL_MOCK || rid) await loadData()
}, { immediate: true })

async function loadData() {
  loading.value = true
  try {
    let res
    if (USE_LOCAL_MOCK) {
      const mod = await import('@/assets/js/data.json')
      res = { code: 200, data: JSON.parse(JSON.stringify(mod.default)) }
    } else {
      res = await getParamsData(props.reportId)
    }

    if (res?.code === 0 || res?.code === 200) {
      rawData.value = res.data || {}
      formData.value = JSON.parse(JSON.stringify(rawData.value))
      cleanEmptyValues(formData.value)

      // 修复 [Object Object] 问题
      if (formData.value['${fixed_asset_original_value}'] && typeof formData.value['${fixed_asset_original_value}'] === 'object') {
        formData.value['${fixed_asset_original_value}'] = Object.values(formData.value['${fixed_asset_original_value}'])[0] || ''
      }

      // 1. 用地面积特殊初始化
      const landRaw = rawData.value['${wind_farm_engineering_land_area_table}']
      if (isTableData(landRaw) && landRaw.data.length > 0) {
        landTableRows.value = landRaw.data.map((row, index) => ({
          category: row[0] || '', subItem: row[1] || '', area: row[2],
          _isEmpty: row[2] === undefined || row[2] === null || row[2] === '', _rowIndex: index,
        }))
      } else {
        const rd = rawData.value
        const defaultRows = [
          ['永久征地', '风机基础', rd['${wind_turbine_foundation_land_area}']],
          ['永久征地', '箱变基础', rd['${box_transformer_foundation_land_area}']],
          ['永久征地', '进站道路', rd['${entrance_road_land_area}']],
          ['永久征地', '升压站', rd['${booster_station_land_area}']],
          ['永久征地', '合计', rd['${permanent_land_wind_farms}']],
          ['长期租地', '检修道路', rd['${maintenance_road_total_land_area}']],
          ['长期租地', '铁塔基础', rd['${tower_foundation_total_land_area}']],
          ['长期租地', '合计', rd['${long_term_leasing_wind_farms}']],
          ['临时租地', '施工吊装平台', rd['${construction_lifting_platform_total_land_area}']],
          ['临时租地', '施工道路', rd['${construction_road_total_land_area}']],
          ['临时租地', '直埋电缆', rd['${buried_cable_total_land_area}']],
          ['临时租地', '临时施工区', rd['${temporary_construction_area}']],
          ['临时租地', '合计', rd['${temporary_lease_wind_farm_land}']]
        ]
        landTableRows.value = defaultRows.map((row, index) => ({
          category: row[0], subItem: row[1], area: row[2] ?? '',
          _isEmpty: row[2] === undefined || row[2] === null || row[2] === '', _rowIndex: index
        }))
      }

      // 2. 财务表格解析
      financialState.value = {}
      Object.values(MODULE_CONFIG).forEach((subModules) => {
        subModules.forEach((sub) => {
          if (sub.type !== 'financial' || !sub.fieldKeys) return
          const key = sub.fieldKeys.join('|')
          let hasTotal = false

          const rows = sub.fieldKeys
            .map((fieldKey) => {
              const rawArr = formData.value[fieldKey]
              if (!Array.isArray(rawArr) || rawArr.length < 2) return null

              const headers = rawArr[0]
              const values = rawArr[1]
              const isTotal = headers[0] === '合计'
              if (isTotal) hasTotal = true

              const yearStart = isTotal ? 1 : 0
              const years = Array.from({ length: 21 }, (_, i) => {
                const v = values[yearStart + i]
                return v === null || v === undefined || typeof v === 'object' ? '' : v
              })

              return {
                key: fieldKey,
                name: getFieldLabel(fieldKey),
                unit: '万元',
                total: isTotal ? (values[0] ?? '') : '',
                years,
                hasTotal: isTotal,
              }
            })
            .filter(Boolean)

          financialState.value[key] = { rows, hasTotal }
        })
      })

      activeModule.value = MODULES[0]
    } else {
      ElMessage.error(res?.msg || '获取数据失败')
    }
  } catch (err) {
    console.error(err)
    ElMessage.error('网络异常')
  } finally {
    loading.value = false
  }
}

// ==========================================
// 数据保存
// ==========================================
async function handleConfirm() {
  if (!props.reportId) {
    ElMessage.warning('缺少报告ID，无法保存（若为本地测试请忽略此提示）')
    return
  }
  confirming.value = true
  try {
    let fileUrl = rawData.value.fileUrl || formData.value.fileUrl || ''
    let fileName = ''
    if (fileUrl) {
      const lastPart = fileUrl.split('/').pop()
      fileName = decodeURIComponent(lastPart.split('?')[0])
    }

    // 1. 用地面积回写
    if (landTableRows.value.length > 0) {
      const validRows = landTableRows.value.filter(r => r.category || r.subItem || r.area)
      formData.value['${wind_farm_engineering_land_area_table}'] = {
        columns: ['项目', '分项', '征地面积（㎡）'],
        data: validRows.map(r => [r.category, r.subItem, r.area])
      }
    }

    // 2. 财务表格回写
    Object.values(financialState.value).forEach(state => {
      state.rows.forEach(row => {
        const headers = row.hasTotal 
          ? ['合计', ...Array.from({length: 21}, (_,i) => `第${i+1}年`)]
          : Array.from({length: 21}, (_,i) => `第${i+1}年`)
        const values = row.hasTotal ? [row.total, ...row.years] : [...row.years]
        formData.value[row.key] = [headers, values]
      })
    })

    // 3. 过滤普通表格中全空行
    Object.keys(formData.value).forEach(key => {
      if (tableFieldKeys.has(key) && key !== '${wind_farm_engineering_land_area_table}' && key !== '${eachTierHeightTurbulenceTableList}') {
        const val = formData.value[key]
        if (isTableData(val)) {
          val.data = val.data.filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ''))
        } else if (Array.isArray(val) && val.length > 1) {
          const headers = val[0]
          const dataRows = val.slice(1).filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ''))
          formData.value[key] = dataRows.length === 0 ? [] : [headers, ...dataRows]
        }
      }
    })

    const payload = {
      fileName, fileUrl,
      parsedDataJson: formData.value,
      remark: "",
      reportId: props.reportId
    }
    const res = await updateUploadDetail(payload)
    if (res?.code === 0 || res?.code === 200) {
      ElMessage.success('保存成功')
      emit('success')
      emit('close')
    } else {
      ElMessage.error(res?.msg || '保存失败')
    }
  } catch (err) {
    console.error(err)
    ElMessage.error('网络异常')
  } finally {
    confirming.value = false
  }
}

// ==========================================
// 导航交互
// ==========================================
function scrollToModule(moduleName) {
  activeModule.value = moduleName
  const el = document.getElementById(`module-${moduleName}`)
  const container = contentRef.value
  if (el && container) {
    const cRect = container.getBoundingClientRect()
    const eRect = el.getBoundingClientRect()
    const relativeTop = eRect.top - cRect.top + container.scrollTop
    container.scrollTo({ top: relativeTop - 20, behavior: 'smooth' })
  }
}

let scrollTimer = null
function handleScroll() {
  if (scrollTimer) clearTimeout(scrollTimer)
  scrollTimer = setTimeout(() => {
    const container = contentRef.value
    if (!container) return
    const sections = container.querySelectorAll('.module-section')
    if (!sections) return
    const cTop = container.getBoundingClientRect().top
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i]
      const sTop = section.getBoundingClientRect().top - cTop
      if (sTop <= 30) {
        const id = section.id.replace('module-', '')
        if (activeModule.value !== id) activeModule.value = id
        break
      }
    }
  }, 100)
}

onUnmounted(() => {
  if (scrollTimer) clearTimeout(scrollTimer)
})
</script>

<style scoped>
.confirm-panel { position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 3000; background: #f7f9fc; display: flex; flex-direction: column; }
.panel-header { flex: 0 0 56px; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; background: #fff; border-bottom: 1px solid #e4e9f0; }
.header-left .company-name { font-size: 18px; font-weight: 600; color: #333; }
.header-right { display: flex; gap: 12px; }
.panel-body { flex: 1; display: flex; overflow: hidden; }
.side-nav { flex: 0 0 200px; background: #f7f9fc; padding-top: 20px; overflow-y: auto; }
.nav-item { padding: 14px 0 14px 32px; font-size: 15px; color: #333; cursor: pointer; position: relative; }
.nav-item:hover { color: #1d4ed8; }
.nav-item.active { color: #1d4ed8; font-weight: 600; background: #fff; }
.nav-item.active::before { content: ''; position: absolute; left: 0; top: 10px; bottom: 10px; width: 4px; background: #1d4ed8; border-radius: 0 4px 4px 0; }
.content-area { flex: 1; padding: 24px 40px; overflow-y: auto; background: #fff; margin: 16px 24px 16px 0; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.02); }
.module-section { margin-bottom: 40px; scroll-margin-top: 20px; }
.module-title { font-size: 18px; font-weight: 600; color: #1d4ed8; margin-bottom: 20px; padding-left: 12px; border-left: 4px solid #1d4ed8; }
.sub-module { margin-bottom: 24px; }
.sub-title { font-size: 15px; font-weight: 600; color: #333; margin-bottom: 16px; display: flex; align-items: center; }
.sub-title .dot { width: 6px; height: 6px; background: #333; border-radius: 50%; margin-right: 8px; }
.field-grid { display: grid; gap: 16px 24px; margin-bottom: 16px; }
.field-item { display: flex; align-items: flex-start; gap: 12px; }
.field-label { flex: 0 0 130px; text-align: right; font-size: 14px; color: #666; line-height: 32px; }
.field-value-wrapper { flex: 1; }
.edit-input :deep(.el-input__wrapper) { background-color: #f9fafb; box-shadow: 0 0 0 1px #dcdfe6 inset; }
.edit-textarea :deep(.el-textarea__inner) { background-color: #f9fafb; box-shadow: 0 0 0 1px #dcdfe6 inset; }
.unit-text { color: #999; font-size: 13px; padding-right: 8px; }
.table-wrapper { margin-top: 12px; border-radius: 4px; overflow-x: auto; }
.custom-table { width: 100%; }
.custom-table :deep(th.el-table__cell) { background-color: #f4f6f8; color: #333; font-weight: 500; }
/* 所有表格的表头文字水平、垂直居中 */
.confirm-panel :deep(.el-table th.el-table__cell .cell) {
  text-align: center !important;
  display: flex;
  justify-content: center;
  align-items: center;
}
.table-edit-input :deep(.el-input__wrapper) { box-shadow: none; background: transparent; }
.table-edit-input :deep(.el-input__inner) { text-align: center; }

/* 测风塔网格布局 */
.turbulence-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 12px;
}
.tower-block {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}
</style>