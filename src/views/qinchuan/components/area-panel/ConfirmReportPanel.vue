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

            <!-- 1. 财务表格 (长表格合并，固定左侧，横向滚动) -->
            <div v-if="subModule.type === 'financial'" class="table-wrapper">
              <el-table 
                :data="getFinancialRows(subModule)" 
                size="small" 
                border 
                class="custom-table"
                height="400"
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

            <!-- 2. 测风塔湍流参数 (Grid 两列布局) -->
            <div v-else-if="subModule.type === 'turbulence'" class="turbulence-grid">
              <div v-for="(towerData, tIdx) in groupedTurbulenceData" :key="tIdx" class="tower-block">
                <div class="tower-title">{{ towerData.name }}</div>
                <el-table :data="towerData.list" size="small" border class="custom-table">
                  <el-table-column prop="height" label="高度 (m)" align="center" />
                  <el-table-column prop="average_value" label="平均湍流强度" align="center" />
                  <el-table-column prop="representative_value" label="代表性湍流强度" align="center" />
                </el-table>
              </div>
            </div>

            <!-- 3. 普通动态表格 (GIS、概算表等) -->
            <div v-else-if="subModule.type === 'table'" class="table-wrapper">
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
                  v-if="isTableData(rawData[subModule.fieldKey])"
                  :data="transformTableData(rawData[subModule.fieldKey])"
                  size="small"
                  border
                  class="custom-table"
                  show-overflow-tooltip
                >
                  <el-table-column
                    v-for="(col, cIdx) in rawData[subModule.fieldKey].columns"
                    :key="cIdx"
                    :prop="'col_' + cIdx"
                    :label="col || `列 ${cIdx + 1}`"
                    min-width="100"
                  />
                </el-table>
                <el-table
                  v-else-if="Array.isArray(rawData[subModule.fieldKey])"
                  :data="transformArrayData(rawData[subModule.fieldKey])"
                  size="small"
                  border
                  class="custom-table"
                  show-overflow-tooltip
                >
                  <el-table-column
                    v-for="(colName, cIdx) in getArrayHeaders(rawData[subModule.fieldKey])"
                    :key="cIdx"
                    :prop="'col_' + cIdx"
                    :label="colName"
                    min-width="100"
                  />
                </el-table>
                <div v-else class="empty-table-placeholder">暂无数据</div>
              </template>
            </div>

            <!-- 4. 普通字段表单 -->
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
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { updateUploadDetail, getParamsData } from '@/api/modules/aiProject'
import { MODULES, LABELS, UNITS, MODULE_CONFIG } from './paramsConfig.js' // 引入配置文件

const props = defineProps({
  visible: { type: Boolean, default: false },
  reportId: { type: [String, Number], default: null }
})

const emit = defineEmits(['close', 'success'])

const loading = ref(false)
const confirming = ref(false)
const rawData = ref({})
const formData = ref({})
const activeModule = ref(MODULES[0])
const contentRef = ref(null)

const landTableRows = ref([])
const financialState = ref({})

const companyName = computed(() => {
  return formData.value['${construct_project_name}'] || '陕西华电新能源发电有限公司'
})

// 提取字段属性方法
const getFieldKey = (f) => typeof f === 'string' ? f : f.key
const getFieldType = (f) => typeof f === 'string' ? 'text' : (f.type || 'text')
const getFieldSpan = (f) => (typeof f === 'object' && f.span) ? f.span : 1
const getFieldLabel = (key) => LABELS[key] || key.replace('${', '').replace('}', '')
const getUnit = (key) => UNITS[key] || ''

const isFieldDisabled = (key) => {
  const targetFields = [
    '${turbine_foundation_c15_concrete}', '${turbine_foundation_c20_concrete}', 
    '${turbine_foundation_c40_concrete}', '${turbine_foundation_c45_concrete}'
  ]
  if (targetFields.includes(key)) {
    const rawVal = rawData.value[key]
    return rawVal === undefined || rawVal === null || rawVal === ''
  }
  return false
}

// ==========================================
// 表格/数据 渲染逻辑
// ==========================================
const isTableData = (val) => val && typeof val === 'object' && !Array.isArray(val) && val.columns && val.data

// 处理表格里的空对象 {}、undefined
const cellToText = (cell) => {
  if (cell === null || cell === undefined) return ''
  if (typeof cell === 'string' || typeof cell === 'number') return cell
  if (typeof cell === 'object') {
    if (Array.isArray(cell)) return cell.length ? `共 ${cell.length} 条` : ''
    return Object.keys(cell).length ? JSON.stringify(cell) : ''
  }
  return cell
}

const transformTableData = (tableObj) => {
  if (!tableObj || !tableObj.data) return []
  return tableObj.data.map(row => {
    const rowData = {}
    row.forEach((cell, idx) => {
      rowData[`col_${idx}`] = cellToText(cell)
    })
    return rowData
  })
}

const getArrayHeaders = (arr) => {
  if (!arr || !arr.length) return []
  const headers = arr[0]
  if (!Array.isArray(headers)) return []
  return headers.map((cell, idx) => typeof cell === 'string' ? cell : `列 ${idx + 1}`)
}

const transformArrayData = (arr) => {
  if (!arr || !arr.length) return []
  return arr.slice(1).map((row) => {
    const rowData = {}
    if (Array.isArray(row)) {
      row.forEach((cell, cIdx) => {
        rowData[`col_${cIdx}`] = cellToText(cell)
      })
    }
    return rowData
  })
}

// 测风塔网格数据
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

// 财务表格状态获取
const getFinancialRows = (subModule) => {
  const key = (subModule.fieldKeys || []).join('|')
  return financialState.value[key]?.rows || []
}
const getFinancialHasTotal = (subModule) => {
  const key = (subModule.fieldKeys || []).join('|')
  return financialState.value[key]?.hasTotal || false
}

// 用地面积合并逻辑
const landTableSpanMethod = ({ row, columnIndex, rowIndex }) => {
  if (columnIndex === 0) {
    const currentCategory = row.category
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

// ==========================================
// 数据加载与保存
// ==========================================
const cleanEmptyValues = (obj) => {
  for (let key in obj) {
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

watch(() => props.visible, async (val) => {
  if (val && props.reportId) await loadData()
})

async function loadData() {
  loading.value = true
  try {
    const res = await getParamsData(props.reportId)
    if (res?.code === 0 || res?.code === 200) {
      rawData.value = res.data || {}
      formData.value = JSON.parse(JSON.stringify(rawData.value))
      
      // 1. 清理输入空值
      cleanEmptyValues(formData.value)

      // 2. 用地面积表格处理
      const landRaw = rawData.value['${wind_farm_engineering_land_area_table}']
      if (isTableData(landRaw)) {
        landTableRows.value = landRaw.data.map((row, index) => ({
          category: row[0] || '', subItem: row[1] || '', area: row[2],
          _isEmpty: row[2] === undefined || row[2] === null || row[2] === '',
          _rowIndex: index
        }))
      }

      // 3. 财务表格解析
      financialState.value = {}
      Object.values(MODULE_CONFIG).forEach(subModules => {
        subModules.forEach(sub => {
          if (sub.type !== 'financial' || !sub.fieldKeys) return
          const key = sub.fieldKeys.join('|')
          let hasTotal = false
          
          const rows = sub.fieldKeys.map(fieldKey => {
            const rawArr = formData.value[fieldKey]
            if (!Array.isArray(rawArr) || rawArr.length < 2) return null
            
            const headers = rawArr[0]
            const values = rawArr[1]
            const isTotal = headers[0] === '合计'
            if (isTotal) hasTotal = true
            
            const yearStart = isTotal ? 1 : 0
            const years = Array.from({ length: 21 }, (_, i) => {
              const v = values[yearStart + i]
              return (v === null || v === undefined || typeof v === 'object') ? '' : v
            })
            
            return { key: fieldKey, name: getFieldLabel(fieldKey), unit: '万元', total: isTotal ? (values[0] ?? '') : '', years }
          }).filter(Boolean)
          
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

async function handleConfirm() {
  if (!props.reportId) return
  confirming.value = true
  try {
    let fileUrl = rawData.value.fileUrl || formData.value.fileUrl || ''
    let fileName = ''
    if (fileUrl) {
      const lastPart = fileUrl.split('/').pop()
      fileName = decodeURIComponent(lastPart.split('?')[0])
    }

    // 1. 用地面积表格回写
    if (landTableRows.value.length > 0) {
      formData.value['${wind_farm_engineering_land_area_table}'] = {
        columns: ['项目', '分项', '征地面积（㎡）'],
        data: landTableRows.value.map(r => [r.category, r.subItem, r.area])
      }
    }

    // 2. 财务表格二维数组回写
    Object.values(financialState.value).forEach(state => {
      state.rows.forEach(row => {
        const headers = row.hasTotal 
          ? ['合计', ...Array.from({length: 21}, (_,i) => `第${i+1}年`)]
          : Array.from({length: 21}, (_,i) => `第${i+1}年`)
        const values = row.hasTotal ? [row.total, ...row.years] : [...row.years]
        formData.value[row.key] = [headers, values]
      })
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
      emit('success'); emit('close')
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

// 导航交互
function scrollToModule(moduleName) {
  activeModule.value = moduleName
  const el = document.getElementById(`module-${moduleName}`)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

let scrollTimer = null
function handleScroll() {
  if (scrollTimer) clearTimeout(scrollTimer)
  scrollTimer = setTimeout(() => {
    const sections = contentRef.value?.querySelectorAll('.module-section')
    if (!sections) return
    const scrollTop = contentRef.value.scrollTop
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i]
      if (section.offsetTop - 30 <= scrollTop) {
        const id = section.id.replace('module-', '')
        if (activeModule.value !== id) activeModule.value = id
        break
      }
    }
  }, 100)
}
</script>

<style scoped>
/* 样式部分与之前保持一致，新增 turbulence-grid 样式 */
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
.tower-title {
  background: #f4f6f8;
  padding: 8px 12px;
  font-weight: 600;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #ebeef5;
}
</style>