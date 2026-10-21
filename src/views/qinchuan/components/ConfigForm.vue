<template>
  <section class="config-form-panel" aria-label="基础配置">
    <header class="form-panel-header">
      <span class="panel-title-icon" aria-hidden="true"><el-icon><Grid /></el-icon></span>
      <h2 class="form-panel-title">基础配置</h2>
      <div class="form-panel-actions">
        <el-button v-if="!editing" size="small" @click="startEdit">编辑配置</el-button>
        <template v-else>
          <el-button type="primary" size="small" :loading="saving" @click="handleSave">保存</el-button>
          <el-button size="small" :disabled="saving" @click="handleCancel">取消</el-button>
        </template>
      </div>
    </header>

    <div class="config-form-body">
      <el-form label-position="left" label-width="112px" size="small" :disabled="!editing || saving" class="config-form">
        <section class="form-section first-section">
          <el-form-item label="年度优先开发设置">
            <div class="inline-fields">
              <el-input-number v-model="form.year" :min="2024" :max="2035" :step="1" controls-position="right" class="year-input" />
              <span class="unit">年</span>
              <el-input-number v-model="form.capacity" :min="0" controls-position="right" class="capacity-input" />
              <span class="unit">MW</span>
            </div>
          </el-form-item>

          <el-form-item label="选址策略">
            <el-select v-model="form.strategyType" class="wide-control">
              <el-option label="风电项目优先选址" value="风电项目优先选址" />
              <el-option label="光伏项目优先选址" value="光伏项目优先选址" />
            </el-select>
          </el-form-item>

          <el-form-item label="选址避让" class="avoid-item">
            <div class="checkbox-list">
              <el-checkbox v-model="form.excludePlannedWind">已规划风电项目不能规划光伏</el-checkbox>
              <el-checkbox v-model="form.excludeAssigned">已分配项目</el-checkbox>
              <el-checkbox v-model="form.excludeVerified">已核查项目</el-checkbox>
            </div>
          </el-form-item>
        </section>

        <section class="form-section">
          <h3 class="form-section-title"><span class="section-mark">风</span>风电项目</h3>
          <el-form-item label="风速要求">
            <div class="inline-fields">
              <el-input-number v-model="form.windSpeedRequirement" :min="0" :precision="1" controls-position="right" />
              <span class="unit">m/s 及以上</span>
            </div>
          </el-form-item>
          <el-form-item label="资本金内部收益率要求">
            <div class="inline-fields">
              <el-input-number v-model="form.windInternalRate" :min="0" :precision="1" controls-position="right" />
              <span class="unit">% 及以上</span>
            </div>
          </el-form-item>
        </section>

        <section class="form-section">
          <h3 class="form-section-title"><span class="section-mark">光</span>光伏项目</h3>
          <el-form-item label="资本金内部收益率要求">
            <div class="inline-fields">
              <el-input-number v-model="form.solarInternalRate" :min="0" :precision="1" controls-position="right" />
              <span class="unit">% 及以上</span>
            </div>
          </el-form-item>
        </section>

        <section class="form-section priority-section">
          <h3 class="form-section-title"><span class="section-mark">优</span>优先计算</h3>
          <el-form-item label="优先区域">
            <el-cascader
              v-model="priorityRegionPaths"
              :options="priorityRegionOptions"
              :props="priorityCascaderProps"
              :show-all-levels="false"
              :max-collapse-tags="2"
              collapse-tags
              collapse-tags-tooltip
              clearable
              filterable
              placeholder="请选择省 / 市 / 区"
              class="wide-control priority-region-select"
              @change="handlePriorityAreaChange"
            />
          </el-form-item>
          <p class="form-tip">说明：可选择省、市或区县；多个区域会按逗号分隔保存，并优先计算设置的区域。</p>
        </section>
      </el-form>
    </div>

  </section>
</template>

<script setup>
import { onMounted, reactive, ref, shallowRef } from 'vue'
import { ElMessage } from 'element-plus'
import { Grid } from '@element-plus/icons-vue'
import { regionData } from 'element-china-area-data'
import * as configApi from '@/api/modules/selectConfig'

const emit = defineEmits(['change'])
const saving = ref(false)
const editing = ref(false)
// 与 TaskPanel 使用同一套区域级联数据，只展示陕西省区域。
const priorityRegionOptions = shallowRef(
  regionData.filter((province) => String(province.value) === '61'),
)
const priorityRegionPaths = ref([])

const priorityCascaderProps = {
  value: 'value',
  label: 'label',
  children: 'children',
  multiple: true,
  checkStrictly: true,
  emitPath: true,
}

const regionPathByCode = new Map()
const regionPathByLabel = new Map()
const regionLabelByCode = new Map()

function indexRegionTree(nodes, codePath = []) {
  for (const node of nodes) {
    const nextPath = [...codePath, String(node.value)]
    regionPathByCode.set(String(node.value), nextPath)
    regionLabelByCode.set(String(node.value), node.label)
    if (!regionPathByLabel.has(node.label)) {
      regionPathByLabel.set(node.label, nextPath)
    }
    if (Array.isArray(node.children)) indexRegionTree(node.children, nextPath)
  }
}

indexRegionTree(priorityRegionOptions.value)

const form = reactive({
  id: null,
  year: 2026,
  capacity: 2000,
  strategyType: '风电项目优先选址',
  excludePlannedWind: true,
  excludeAssigned: true,
  excludeVerified: true,
  windSpeedRequirement: 4.5,
  windInternalRate: 6.5,
  solarInternalRate: 6.5,
  priorityAreaCode: '',
})

let backup = { ...form }

function bytesToBool(value, fallback) {
  if (value === true || value === 1 || value === '1') return true
  if (value === false || value === 0 || value === '0') return false
  return fallback
}

function boolToByte(value) {
  return value ? '1' : '0'
}

function snapshotForm() {
  backup = { ...form }
}

function decodePriorityAreas(value) {
  if (Array.isArray(value)) {
    return value.filter((path) => Array.isArray(path) && path.length)
  }

  return String(value ?? '')
    .split(/[,，、;；]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const parts = item.split(/[/>]/).map((part) => part.trim()).filter(Boolean)
      const lastPart = parts[parts.length - 1]
      return regionPathByCode.get(lastPart) || regionPathByLabel.get(lastPart) || null
    })
    .filter(Boolean)
}

function encodePriorityAreas(paths) {
  const labels = paths
    .map((path) => {
      const code = Array.isArray(path) ? String(path[path.length - 1] ?? '') : String(path ?? '')
      return regionLabelByCode.get(code) || code
    })
    .filter(Boolean)
  return [...new Set(labels)].join(',')
}

function handlePriorityAreaChange(paths) {
  priorityRegionPaths.value = Array.isArray(paths) ? paths : []
  form.priorityAreaCode = encodePriorityAreas(priorityRegionPaths.value)
}

function startEdit() {
  snapshotForm()
  editing.value = true
}

async function loadConfig() {
  try {
    const res = await configApi.getLastConfig()
    const data = res?.data
    if (data) {
      form.id = data.id ?? null
      form.year = data.year ?? form.year
      form.capacity = data.capacity ?? form.capacity
      form.strategyType = data.strategyType ?? form.strategyType
      form.excludePlannedWind = bytesToBool(data.excludePlannedWind, form.excludePlannedWind)
      form.excludeAssigned = bytesToBool(data.excludeAssigned, form.excludeAssigned)
      form.excludeVerified = bytesToBool(data.excludeVerified, form.excludeVerified)
      form.windSpeedRequirement = data.windSpeedRequirement ?? form.windSpeedRequirement
      form.windInternalRate = data.windInternalRate ?? form.windInternalRate
      form.solarInternalRate = data.solarInternalRate ?? form.solarInternalRate
      form.priorityAreaCode = data.priorityAreaCode ?? form.priorityAreaCode
      priorityRegionPaths.value = decodePriorityAreas(form.priorityAreaCode)
    }
    snapshotForm()
    emit('change', { ...form })
  } catch (err) {
    console.error('[config] getLastConfig 失败:', err)
    ElMessage.error(err?.message || '配置加载失败')
    snapshotForm()
  }
}

function handleCancel() {
  Object.assign(form, backup)
  priorityRegionPaths.value = decodePriorityAreas(backup.priorityAreaCode)
  editing.value = false
  emit('change', { ...form })
}

async function handleSave() {
  if (saving.value) return
  const payload = {
    id: form.id,
    year: form.year,
    capacity: form.capacity,
    strategyType: form.strategyType,
    excludePlannedWind: boolToByte(form.excludePlannedWind),
    excludeAssigned: boolToByte(form.excludeAssigned),
    excludeVerified: boolToByte(form.excludeVerified),
    windSpeedRequirement: form.windSpeedRequirement,
    windInternalRate: form.windInternalRate,
    solarInternalRate: form.solarInternalRate,
    priorityAreaCode: form.priorityAreaCode,
  }

  try {
    saving.value = true
    const res = await configApi.updateConfig(payload)
    if (res?.code === 200) {
      snapshotForm()
      editing.value = false
      emit('change', { ...form })
      ElMessage.success('配置已保存')
    } else {
      ElMessage.error(res?.msg || '保存失败')
    }
  } catch (err) {
    console.error('[config] 保存失败:', err)
    ElMessage.error(err?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

defineExpose({ loadConfig })

onMounted(() => {
  loadConfig()
})
</script>

<style scoped>
.config-form-panel {
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
.form-panel-header { display: flex; flex: 0 0 auto; align-items: center; gap: 8px; padding-bottom: 10px; }
.form-panel-actions { display: flex; align-items: center; gap: 6px; margin-left: auto; }
.panel-title-icon { display: inline-flex; align-items: center; justify-content: center; width: 19px; height: 19px; color: #3987ec; background: #edf5ff; border-radius: 5px; }
.form-panel-title { margin: 0; color: #273443; font-size: 13px; font-weight: 600; }
.config-form-body { flex: 1 1 auto; min-height: 0; overflow: auto; }
.config-form { padding-right: 10px; }
.form-section { padding: 12px 0 4px; border-top: 1px solid #f0f3f7; }
.form-section.first-section { padding-top: 4px; border-top: 0; }
.form-section-title { display: flex; align-items: center; gap: 7px; margin: 0 0 9px; color: #303c4b; font-size: 12px; font-weight: 600; }
.section-mark { display: inline-flex; align-items: center; justify-content: center; width: 17px; height: 17px; color: #3987ec; font-size: 10px; background: #edf5ff; border-radius: 5px; }
.inline-fields { display: flex; align-items: center; min-width: 0; }
.unit { flex: 0 0 auto; margin: 0 7px; color: #8793a1; font-size: 11px; white-space: nowrap; }
.year-input { width: 112px; }
.capacity-input { width: 112px; }
.wide-control { width: min(100%, 300px); }
.checkbox-list { display: flex; flex-direction: column; gap: 1px; }
.form-tip { margin: 0 0 5px 112px; color: #a0aab6; font-size: 10px; line-height: 1.55; }
:deep(.el-form-item) { margin-bottom: 10px; }
:deep(.el-form-item__label) { color: #7e8997; font-size: 11px; line-height: 30px; }
:deep(.el-form-item__content) { min-width: 0; line-height: 30px; }
:deep(.el-input-number) { width: 108px; }
:deep(.year-input.el-input-number), :deep(.capacity-input.el-input-number) { width: 112px; }
:deep(.el-checkbox) { height: 24px; margin-right: 0; }
:deep(.el-checkbox__label) { color: #586575; font-size: 11px; }
:deep(.el-input__wrapper), :deep(.el-select__wrapper) { box-shadow: 0 0 0 1px #d8e1eb inset; }
:deep(.el-input__wrapper:hover), :deep(.el-select__wrapper:hover) { box-shadow: 0 0 0 1px #9fc6f4 inset; }
@media (max-width: 760px) {
  .config-form-panel { min-height: 540px; }
  .form-tip { margin-left: 0; }
}
</style>