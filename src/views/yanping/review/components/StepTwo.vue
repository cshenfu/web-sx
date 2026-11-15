<template>
  <div class="step-two">
    <div class="form-item">
      <label class="form-label required">拟接入电压等级</label>
      <RadioOptionGroup v-model="form.substationRatedVoltage" :options="voltageOptions" name="voltage" />
      <p v-if="errors.substationRatedVoltage" class="field-error">{{ errors.substationRatedVoltage }}</p>
    </div>

    <!-- 基础建设条件引用区块 -->
    <ReferenceBlock v-model="form.isAnemometerTowerData" :block="referenceBlocks.windTower" />
    <ReferenceBlock v-model="form.isGeologicalSurveyReport" :block="referenceBlocks.geological" />
    <ReferenceBlock v-model="form.isTopographicMap" :block="referenceBlocks.topographic" />
    <ReferenceBlock v-model="form.isSystemReport" :block="referenceBlocks.system" />

    <div class="divider" />

    <!-- 高级参数设置 -->
    <div v-show="showAdvanced" class="advanced-block">
      <ReferenceBlock v-model="form.isWeatherStationData" :block="advancedBlocks.weather" />
      <ReferenceBlock v-model="form.isAvoidAreasData" :block="advancedBlocks.avoid" />
      <ReferenceBlock v-model="form.isCanDeployableAreaData" :block="advancedBlocks.deployable" />

      <div class="form-item">
        <label class="form-label">集电线路铺设方式</label>
        <el-select v-model="form.cableLayingMethod" placeholder="请选择" style="width: 100%">
          <el-option v-for="opt in cableLayingMethodOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
      </div>

      <div class="form-item">
        <label class="form-label">覆冰厚度</label>
        <el-select v-model="form.iceThickness" placeholder="请选择" style="width: 100%">
          <el-option v-for="opt in iceThicknessOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
      </div>

      <div class="form-item">
        <label class="form-label">电网污秽等级</label>
        <el-select v-model="form.dirtyLevel" placeholder="请选择" style="width: 100%">
          <el-option v-for="opt in powerGridOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
      </div>

      <div class="form-item">
        <label class="form-label">进站道路占地</label>
        <RadioOptionGroup 
          v-model="form.landAcquisitionType" 
          :options="[{ label: '永久征地', value: 0 }, { label: '长期征地', value: 1 }]" 
          name="landAcquisitionType" 
        />
      </div>

      <ReferenceBlock v-model="form.isEiaReport" :block="advancedBlocks.eia" />
      <ReferenceBlock v-model="form.isWaterConservationReport" :block="advancedBlocks.water" />
      <ReferenceBlock v-model="form.isMesoscaleFile" :block="advancedBlocks.mesoscale" />
    </div>

    <div class="show-more-row">
      <button type="button" class="show-more-btn" @click="showAdvanced = !showAdvanced">
        {{ showAdvanced ? '收起' : '高级参数设置' }}
        <svg viewBox="0 0 16 16" class="chevron" :class="{ up: showAdvanced }">
          <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>

    <p v-if="submitError" class="submit-error">{{ submitError }}</p>

    <!-- 底部按钮区 -->
    <div class="footer-actions">
      <!-- <button type="button" class="btn" :disabled="submitting" @click="handlePrev">上一步</button> -->
      <button type="button" class="btn" :disabled="submitting" @click="submitStep(true)">
        {{ submitting && submitMode === 'draft' ? '保存中…' : '保存草稿' }}
      </button>
      <button type="button" class="btn primary" :disabled="submitting" @click="submitStep(false)">
        {{ submitting && submitMode === 'next' ? '提交中…' : '下一步' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, h, reactive, ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import RadioOptionGroup from '@/views/qinchuan/components/shared/RadioOptionGroup.vue'
import ReferenceBox from '@/views/qinchuan/components/shared/ReferenceBox.vue'
import {
  PACKAGE_TYPE,
  voltageLevelOptionsByMode,
  referenceToggleOptions,
  stepTwoReferenceBlocks,
  stepTwoAdvancedBlocks,
  cableLayingMethodOptions,
  iceThicknessOptions,
  powerGridOptions
} from '@/views/qinchuan/js/Reportwizardmockdata'
import * as newApi from '@/api/modules/project'
import { getDataById } from '@/api/modules/newApi'   // 👈 新增

const props = defineProps({
  createProjectMode: { type: Number, default: PACKAGE_TYPE.default },
  project: { type: Object, default: () => null },
  aiReportData: { type: Object, default: () => null } // 保留兼容父组件传参，不再消费
})

const emit = defineEmits(['save-draft', 'next', 'prev'])

const showAdvanced = ref(false)
const submitting = ref(false)
const submitMode = ref('')
const submitError = ref('')
const errors = reactive({ substationRatedVoltage: '' })

const voltageOptions = computed(
  () =>
    voltageLevelOptionsByMode[props.createProjectMode] ||
    voltageLevelOptionsByMode[PACKAGE_TYPE.default]
)

// 初始化引用区块，并为每个区块加上 disabled 标记
const referenceBlocks = reactive(
  Object.keys(stepTwoReferenceBlocks).reduce((acc, key) => {
    acc[key] = { ...stepTwoReferenceBlocks[key], disabled: false }
    return acc
  }, {})
)
const advancedBlocks = reactive(
  Object.keys(stepTwoAdvancedBlocks).reduce((acc, key) => {
    acc[key] = { ...stepTwoAdvancedBlocks[key], disabled: false }
    return acc
  }, {})
)

const form = reactive({
  substationRatedVoltage: props.project?.substationRatedVoltage ?? voltageOptions.value[0]?.value ?? 110,
  isAnemometerTowerData: toNumber(props.project?.isAnemometerTowerData, 0),
  isGeologicalSurveyReport: toNumber(props.project?.isGeologicalSurveyReport, 0),
  isTopographicMap: toNumber(props.project?.isTopographicMap, 0),
  isSystemReport: toNumber(props.project?.isSystemReport, 0),
  isWeatherStationData: toNumber(props.project?.isWeatherStationData, 0),
  isAvoidAreasData: toNumber(props.project?.isAvoidAreasData, 0),
  isCanDeployableAreaData: toNumber(props.project?.isCanDeployableAreaData, 0),
  cableLayingMethod: toNumber(props.project?.cableLayingMethod, 0),
  iceThickness: toNumber(props.project?.iceThickness, 10),
  dirtyLevel: toNumber(props.project?.dirtyLevel, 0),
  landAcquisitionType: toNumber(props.project?.landAcquisitionType, 0),
  isEiaReport: toNumber(props.project?.isEiaReport, 0),
  isWaterConservationReport: toNumber(props.project?.isWaterConservationReport, 0),
  isMesoscaleFile: toNumber(props.project?.isMesoscaleFile, 0),

  // 无 UI 但接口需要：给默认值
  anemometerTowerFile: props.project?.anemometerTowerFile ?? '[]',
  anemometerTowerNum: props.project?.anemometerTowerNum ?? 0,
  isAnemometerImage: props.project?.isAnemometerImage ?? 0,
  cftPointList: props.project?.cftPointList ?? '[]',
  geologicalReportType: props.project?.geologicalReportType ?? 1,
  geologicalReportFile: props.project?.geologicalReportFile ?? '[]',
  topographicMapFile: props.project?.topographicMapFile ?? '[]',
  systemReportFile: props.project?.systemReportFile ?? '[]',
  accessSubstationName: props.project?.accessSubstationName ?? '',
  accessSubstationPoints: props.project?.accessSubstationPoints ?? '',
  sendOutType: props.project?.sendOutType ?? 1,
  sendOutUnitPrice: props.project?.sendOutUnitPrice ?? '',
  weatherStationFile: props.project?.weatherStationFile ?? '[]',
  weatherStationImageFile: props.project?.weatherStationImageFile ?? '[]',
  avoidAreasDataJson: props.project?.avoidAreasDataJson ?? '[]',
  canDeployableAreaDataJson: props.project?.canDeployableAreaDataJson ?? '[]',
  eiaReportFile: props.project?.eiaReportFile ?? '[]',
  waterConservationReportFile: props.project?.waterConservationReportFile ?? '[]',
  mesoscaleFilePath: props.project?.mesoscaleFilePath ?? '',
  mesoscalePoint: props.project?.mesoscalePoint ?? '',
  eachHeightSpeed: props.project?.eachHeightSpeed ?? null,
  obsPath: props.project?.obsPath ?? '',
})

// 内联 ReferenceBlock 组件 (加入拦截逻辑与样式微调)
const ReferenceBlock = {
  props: { modelValue: [Number, String], block: Object },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const handleUpdate = (val) => {
      if (Number(val) === 1 && props.block?.disabled) {
        ElMessage.warning(`${props.block.title || '该数据'}暂无数据可引用`)
        return
      }
      emit('update:modelValue', val)
    }

    return () =>
      h('div', { class: 'form-item reference-block-item' }, [
        h('label', { class: 'form-label required' }, props.block?.title || ''),
        h('div', { class: 'radio-group-wrapper' }, [
          h(RadioOptionGroup, {
            modelValue: props.modelValue,
            options: referenceToggleOptions,
            name: props.block?.key || 'default',
            'onUpdate:modelValue': handleUpdate,
          })
        ]),
        props.modelValue === 1 && props.block
          ? h('div', { class: 'form-item sub-item reference-box-wrapper' }, [
              h(ReferenceBox, { rows: props.block.rows || [] }),
            ])
          : null,
      ])
  },
}

// ================= 用 getDataById 填充引用块 =================
const dataByIdList = ref([])
const dataLoading = ref(false)
let unmounted = false

onUnmounted(() => { unmounted = true })

// 引用块 ↔ 接口 dataCategory + form 字段映射
// 后端如果有新 dataCategory，只需要在这里补一条
function matchCategoryByTitle(title) {
  const text = String(title || '')
  if (/测风|风塔/.test(text)) return 'WIND'
  if (/地形/.test(text)) return 'TERRAIN'
  if (/地质/.test(text)) return 'GEOLOGY'
  if (/接入|升压/.test(text)) return 'ACCESS_REPORT_INFO'
  if (/环评|环保/.test(text)) return 'ENVIRONMENT'
  if (/水保/.test(text)) return 'WATER_CONSERVANCY'
  if (/气象/.test(text)) return 'METEOROLOGY'
  if (/避让/.test(text)) return 'AVOID'
  if (/可布机/.test(text)) return 'DEPLOYABLE'
  if (/中尺度/.test(text)) return 'MESOSCALE'
  return null
}

const ALL_BLOCKS = [
  { blockKey: 'topographic',  group: 'reference', formKey: 'isTopographicMap',          fileKey: 'topographicMapFile' },
  { blockKey: 'system',       group: 'reference', formKey: 'isSystemReport',            fileKey: 'systemReportFile' },
  { blockKey: 'windTower',    group: 'reference', formKey: 'isAnemometerTowerData',     fileKey: 'anemometerTowerFile' },
  { blockKey: 'geological',   group: 'reference', formKey: 'isGeologicalSurveyReport',  fileKey: 'geologicalReportFile' },

  { blockKey: 'weather',      group: 'advanced',  formKey: 'isWeatherStationData',      fileKey: 'weatherStationFile' },
  { blockKey: 'avoid',        group: 'advanced',  formKey: 'isAvoidAreasData',          fileKey: 'avoidAreasDataJson' },
  { blockKey: 'deployable',   group: 'advanced',  formKey: 'isCanDeployableAreaData',   fileKey: 'canDeployableAreaDataJson' },
  { blockKey: 'eia',          group: 'advanced',  formKey: 'isEiaReport',               fileKey: 'eiaReportFile' },
  { blockKey: 'water',        group: 'advanced',  formKey: 'isWaterConservationReport', fileKey: 'waterConservationReportFile' },
  { blockKey: 'mesoscale',    group: 'advanced',  formKey: 'isMesoscaleFile',           fileKey: 'mesoscaleFilePath' },
]

function applyDataBlocks() {
  const categoryFiles = {}
  dataByIdList.value.forEach((item) => {
    categoryFiles[item.dataCategory] = item.fileList || []
  })

  ALL_BLOCKS.forEach(({ blockKey, group, formKey, fileKey }) => {
    const block = group === 'reference' ? referenceBlocks[blockKey] : advancedBlocks[blockKey]
    if (!block) return

    const category = matchCategoryByTitle(block.title)
    const files = category ? (categoryFiles[category] || []) : []
    const hasData = files.length > 0

    block.disabled = !hasData
    // 显示用 fileName
    block.rows = hasData
      ? files.map((f) => ({ label: '引用文件', value: f.fileName, filePath: f.filePath }))
      : [{ label: '引用文件', value: '暂无数据' }]

    if (hasData) {
      form[formKey] = 1
      // 存储用 filePath（中尺度是纯字符串，其它是 JSON 数组）
      if (fileKey === 'mesoscaleFilePath') {
        form[fileKey] = files[0]?.filePath || ''
      } else {
        form[fileKey] = JSON.stringify(
          files.map((f) => ({
            fileName: f.fileName,
            filePath: f.filePath,
            suffix: f.fileSuffix || '',
          }))
        )
      }
    } else {
      form[formKey] = 0
      form[fileKey] = fileKey === 'mesoscaleFilePath' ? '' : '[]'
    }
  })
}

async function loadDataById() {
  const aiProjectId = props.project?.aiProjectId ?? props.project?.id
  if (!aiProjectId) return

  dataLoading.value = true
  try {
    const res = await getDataById(aiProjectId)
    if (unmounted) return
    if (res?.code === 200) {
      dataByIdList.value = res.data || []
      await nextTick()
      if (unmounted) return
      applyDataBlocks()
    }
  } catch (e) {
    console.error('获取项目数据失败:', e)
  } finally {
    if (!unmounted) dataLoading.value = false
  }
}

onMounted(() => {
  loadDataById()
})

watch(
  () => props.project?.aiProjectId ?? props.project?.id,
  (id, oldId) => {
    if (id && id !== oldId) loadDataById()
  }
)

// ================= 工具函数 =================
function toNumber(value, fallback = 0) {
  if (value === '' || value === null || value === undefined) return fallback
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function toEditProjectId(value) {
  if (value === '' || value === null || value === undefined) return undefined
  return String(value)
}

function toProjectId(value) {
  if (value === '' || value === null || value === undefined) return 0
  return String(value)
}

function removeUndefined(object) {
  return Object.fromEntries(
    Object.entries(object).filter(([, value]) => value !== undefined)
  )
}

function extractSavedProjectId(response) {
  const candidates = [
    response?.data?.id,
    response?.data?.projectId,
    response?.data?.editProjectWindReqDTO?.id,
    response?.result?.id,
    response?.id,
    response?.data,
  ]
  const id = candidates.find((value) => {
    if (value === '' || value === null || value === undefined) return false
    return /^\d+$/.test(String(value))
  })
  return id === undefined ? null : String(id)
}

function serialize(value) {
  if (value === undefined || value === null) return '[]'
  if (typeof value === 'string') return value
  if (Array.isArray(value) || typeof value === 'object') {
    return JSON.stringify(value)
  }
  return '[]'
}

function resolveSendOutUnitPrice() {
  const voltage = Number(form.substationRatedVoltage)
  const sendOutType = Number(form.sendOutType) || 1
  const map = {
    220: { 1: 220, 2: 220 },
    110: { 1: 110, 2: 110 },
    35: { 1: 80, 2: 45 },
    10: { 1: 15, 2: 35 },
  }
  return map[voltage]?.[sendOutType] ?? 0
}

function validateForm() {
  errors.substationRatedVoltage = ''
  submitError.value = ''
  if (!form.substationRatedVoltage) {
    errors.substationRatedVoltage = '请选择拟接入电压等级'
    submitError.value = '请先完善页面中标红的必填项，再进入下一步'
    return false
  }
  return true
}

function buildPayload(isDraft) {
  const project = props.project || {}

  const sendOutUnitPrice =
    form.sendOutUnitPrice !== '' && Number.isFinite(Number(form.sendOutUnitPrice))
      ? Number(form.sendOutUnitPrice)
      : resolveSendOutUnitPrice()

  const editProjectWindReqDTO = {
    id: toEditProjectId(project.id),
    step: 2,
    isDraft,
    projectAdjustFlag: Boolean(project.id),
    projectAdjustOneStepFlag: false,
    uniqueIdentification:
      project.uniqueIdentification || `report-step-two-${project.id || 'new'}`,

    substationRatedVoltage: Number(form.substationRatedVoltage) || undefined,
    isAnemometerTowerData: Number(form.isAnemometerTowerData) || 0,
    isGeologicalSurveyReport: Number(form.isGeologicalSurveyReport) || 0,
    isTopographicMap: Number(form.isTopographicMap) || 0,
    isSystemReport: Number(form.isSystemReport) || 0,
    isWeatherStationData: Number(form.isWeatherStationData) || 0,
    isAvoidAreasData: Number(form.isAvoidAreasData) || 0,
    isCanDeployableAreaData: Number(form.isCanDeployableAreaData) || 0,
    cableLayingMethod: Number(form.cableLayingMethod) || 0,
    iceThickness: Number(form.iceThickness) || 10,
    dirtyLevel: Number(form.dirtyLevel) || 0,
    landAcquisitionType: Number(form.landAcquisitionType) || 0,
    isEiaReport: Number(form.isEiaReport) || 0,
    isWaterConservationReport: Number(form.isWaterConservationReport) || 0,
    isMesoscaleFile: Number(form.isMesoscaleFile) || 0,

    anemometerTowerFile: serialize(form.anemometerTowerFile),
    geologicalReportFile: serialize(form.geologicalReportFile),
    topographicMapFile: serialize(form.topographicMapFile),
    systemReportFile: serialize(form.systemReportFile),
    weatherStationFile: serialize(form.weatherStationFile),
    weatherStationImageFile: serialize(form.weatherStationImageFile),
    avoidAreasDataJson: serialize(form.avoidAreasDataJson),
    canDeployableAreaDataJson: serialize(form.canDeployableAreaDataJson),
    eiaReportFile: serialize(form.eiaReportFile),
    waterConservationReportFile: serialize(form.waterConservationReportFile),

    anemometerTowerNum: Number(form.anemometerTowerNum) || 0,
    isAnemometerImage: Number(form.isAnemometerImage) || 0,
    cftPointList: serialize(form.cftPointList),
    geologicalReportType: Number(form.geologicalReportType) || 1,
    accessSubstationName: form.accessSubstationName || '',
    accessSubstationPoints: form.accessSubstationPoints || '',
    sendOutType: Number(form.sendOutType) || 1,
    sendOutUnitPrice,
    mesoscaleFilePath: form.mesoscaleFilePath || '',
    mesoscalePoint: form.mesoscalePoint || '',
    eachHeightSpeed:
      form.isMesoscaleFile && form.eachHeightSpeed
        ? serialize(form.eachHeightSpeed)
        : null,
    obsPath: form.obsPath || '',
  }

  return {
    editProjectWindReqDTO: removeUndefined(editProjectWindReqDTO),
    sxProjectId: toProjectId(project.sxProjectId ?? project.id),
  }
}

async function submitStep(isDraft) {
  if (!isDraft && !validateForm()) return
  if (isDraft) {
    errors.substationRatedVoltage = ''
    submitError.value = ''
  }

  submitting.value = true
  submitMode.value = isDraft ? 'draft' : 'next'
  submitError.value = ''

  const payload = buildPayload(isDraft)

  try {
    const response = await newApi.saveUpdateProject(payload)
    if (response?.code !== undefined && response.code !== 200) {
      throw new Error(response.msg || '项目保存失败')
    }

    const savedProjectId = extractSavedProjectId(response) ?? props.project?.id ?? null

    const result = {
      form: { ...form },
      request: payload,
      response,
      savedProjectId,
      project: {
        ...(props.project || {}),
        ...form,
        ...(savedProjectId ? { id: savedProjectId } : {}),
      },
    }

    if (isDraft) emit('save-draft', result)
    else emit('next', result)
  } catch (error) {
    console.error('保存第二步项目数据失败:', error)
    submitError.value = error?.message || '保存失败，请稍后重试'
  } finally {
    submitting.value = false
    submitMode.value = ''
  }
}

const handlePrev = () => {
  emit('prev')
}
</script>

<style scoped>
.step-two { padding-bottom: 20px; }

/* 统一表单项间距 */
.form-item { 
  margin-bottom: 22px; 
}

.form-label { 
  display: block; 
  margin-bottom: 10px; 
  color: #303133; 
  font-size: 14px; 
  font-weight: 500;
}

/* 优化必填红星的间距和颜色 */
.form-label.required::before { 
  content: '*'; 
  margin-right: 4px; 
  color: #f56c6c; 
  font-size: 15px;
  vertical-align: middle;
}

/* 引用区块专属样式 */
.reference-block-item {
  margin-bottom: 22px;
}
.reference-box-wrapper {
  margin-top: 12px;
  padding: 12px;
  background: #fafafa;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}

/* 分割线 */
.divider { 
  height: 1px; 
  margin: 28px 0; 
  background: #ebeef5; 
}

/* 展开收起按钮 */
.show-more-row { 
  display: flex; 
  justify-content: center; 
  margin: 16px 0 24px; 
}
.show-more-btn { 
  display: inline-flex; 
  align-items: center; 
  gap: 6px; 
  padding: 8px 20px; 
  border: 1px solid #2f8dff; 
  border-radius: 16px; 
  cursor: pointer; 
  color: #2f8dff; 
  background: #f0f7ff; 
  font-size: 13px; 
  transition: all 0.2s;
}
.show-more-btn:hover { background: #e0efff; }
.chevron { width: 12px; height: 12px; transition: transform 0.2s; }
.chevron.up { transform: rotate(180deg); }

/* 错误提示 */
.field-error, .submit-error { 
  margin: 6px 0 0; 
  color: #f56c6c; 
  font-size: 12px; 
  line-height: 1.5; 
}
.submit-error { margin: 12px 0; text-align: center; }

/* 底部按钮 */
.footer-actions { 
  display: flex; 
  justify-content: center; 
  gap: 16px; 
  margin-top: 32px; 
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}
.btn { 
  min-width: 110px; 
  padding: 10px 20px; 
  border: 1px solid #dcdfe6; 
  border-radius: 20px; 
  cursor: pointer; 
  color: #606266; 
  background: #fff; 
  font-size: 14px; 
  transition: all 0.2s;
}
.btn:hover { color: #2f8dff; border-color: #c6e2ff; background: #ecf5ff; }
.btn.primary { 
  border-color: #2f8dff; 
  color: #fff; 
  background: #2f8dff; 
}
.btn.primary:hover { background: #66b1ff; border-color: #66b1ff; }
.btn:disabled { cursor: not-allowed; opacity: 0.6; }

/* 让 el-select 和整体高度对齐 */
:deep(.el-select__wrapper) {
  min-height: 36px;
  border-radius: 4px;
}

:deep(.radio-group-wrapper){
    margin-top: 15px;
}
</style>