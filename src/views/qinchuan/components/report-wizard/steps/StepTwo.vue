<!-- components/report-wizard/steps/StepTwo.vue -->
<template>
  <div class="step-two">
    <div class="form-item">
      <label class="form-label required">拟接入电压等级</label>
      <RadioOptionGroup v-model="form.substationRatedVoltage" :options="voltageOptions" name="voltage" />
      <p v-if="errors.substationRatedVoltage" class="field-error">
        {{ errors.substationRatedVoltage }}
      </p>
    </div>

    <ReferenceBlock v-model="form.isAnemometerTowerData" :block="stepTwoReferenceBlocks.windTower" />
    <ReferenceBlock v-model="form.isGeologicalSurveyReport" :block="stepTwoReferenceBlocks.geological" />
    <ReferenceBlock v-model="form.isTopographicMap" :block="stepTwoReferenceBlocks.topographic" />
    <ReferenceBlock v-model="form.isSystemReport" :block="stepTwoReferenceBlocks.system" />

    <div class="divider" />

    <div v-show="showAdvanced" class="advanced-block">
      <ReferenceBlock v-model="form.isWeatherStationData" :block="stepTwoAdvancedBlocks.weather" />
      <ReferenceBlock v-model="form.isAvoidAreasData" :block="stepTwoAdvancedBlocks.avoid" />
      <ReferenceBlock v-model="form.isCanDeployableAreaData" :block="stepTwoAdvancedBlocks.deployable" />

      <div class="form-item">
        <label class="form-label">集电线路铺设方式</label>
        <select v-model="form.cableLayingMethod" class="select-input wide">
          <option v-for="opt in cableLayingMethodOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>

      <div class="form-item">
        <label class="form-label">覆冰厚度</label>
        <select v-model="form.iceThickness" class="select-input wide">
          <option v-for="opt in iceThicknessOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>

      <div class="form-item">
        <label class="form-label">电网污秽等级</label>
        <select v-model="form.dirtyLevel" class="select-input wide">
          <option v-for="opt in powerGridOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>

      <div class="form-item">
        <label class="form-label">进站道路占地</label>
        <RadioOptionGroup
          v-model="form.landAcquisitionType"
          :options="[
            { label: '永久征地', value: 0 },
            { label: '长期征地', value: 1 },
          ]"
          name="landAcquisitionType"
        />
      </div>

      <ReferenceBlock v-model="form.isEiaReport" :block="stepTwoAdvancedBlocks.eia" />
      <ReferenceBlock v-model="form.isWaterConservationReport" :block="stepTwoAdvancedBlocks.water" />
      <ReferenceBlock v-model="form.isMesoscaleFile" :block="stepTwoAdvancedBlocks.mesoscale" />
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

    <div class="footer-actions">
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
import { computed, h, reactive, ref } from 'vue'
import RadioOptionGroup from '../../shared/RadioOptionGroup.vue'
import ReferenceBox from '../../shared/ReferenceBox.vue'
import {
  PACKAGE_TYPE,
  voltageLevelOptionsByMode,
  referenceToggleOptions,
  stepTwoReferenceBlocks,
  stepTwoAdvancedBlocks,
  cableLayingMethodOptions,
  iceThicknessOptions,
  powerGridOptions,
} from '../../../js/Reportwizardmockdata'
import * as newApi from '@/api/modules/project'

const props = defineProps({
  createProjectMode: { type: Number, default: PACKAGE_TYPE.default },
  project: { type: Object, default: () => null },
})

const emit = defineEmits(['save-draft', 'next'])

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

// ---------------- form：接口文档第二步所有字段 ----------------
const form = reactive({
  // 有 UI 控件的
  substationRatedVoltage:
    props.project?.substationRatedVoltage ??
    voltageOptions.value[0]?.value ??
    110,
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

// 内联 ReferenceBlock 保持不变
const ReferenceBlock = {
  props: { modelValue: [Number, String], block: Object },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () =>
      h('div', { class: 'form-item' }, [
        h('label', { class: 'form-label required' }, props.block.title),
        h(RadioOptionGroup, {
          modelValue: props.modelValue,
          options: referenceToggleOptions,
          name: props.block.key,
          'onUpdate:modelValue': (val) => emit('update:modelValue', val),
        }),
        props.modelValue === 1
          ? h('div', { class: 'form-item sub-item' }, [
              h(ReferenceBox, { rows: props.block.rows }),
            ])
          : null,
      ])
  },
}

// ---------------- 工具 ----------------
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

// 数组 / 对象 / 字符串统一序列化成字符串
function serialize(value) {
  if (value === undefined || value === null) return '[]'
  if (typeof value === 'string') return value
  if (Array.isArray(value) || typeof value === 'object') {
    return JSON.stringify(value)
  }
  return '[]'
}

// 按电压等级 + 接入方式推算送出工程单价默认值
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

// ---------------- 校验 ----------------
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

// ---------------- 构建请求体 ----------------
function buildPayload(isDraft) {
  const project = props.project || {}

  // 用户没有手动改过单价 → 按电压等级推默认
  const sendOutUnitPrice =
    form.sendOutUnitPrice !== '' && Number.isFinite(Number(form.sendOutUnitPrice))
      ? Number(form.sendOutUnitPrice)
      : resolveSendOutUnitPrice()

  const editProjectWindReqDTO = {
    // 项目 id：第一步返回的 data 值（字符串）
    id: toEditProjectId(project.id),

    step: 2,
    isDraft,
    projectAdjustFlag: Boolean(project.id),
    projectAdjustOneStepFlag: false,
    uniqueIdentification:
      project.uniqueIdentification || `report-step-two-${project.id || 'new'}`,

    // ---------- 有 UI 的字段 ----------
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

    // ---------- 文件类：暂无也传 '[]' ----------
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

    // ---------- 非文件类默认值 ----------
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
    // sxProjectId 与第一步一致（由 ReportWizard 锁定）
    sxProjectId: toProjectId(project.sxProjectId ?? project.id),
  }
}

// ---------------- 提交 ----------------
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

    const savedProjectId =
      extractSavedProjectId(response) ?? props.project?.id ?? null

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
</script>

<style scoped>
.step-two { padding-bottom: 20px; }
.form-item { margin-bottom: 18px; }
.form-item.sub-item { margin-top: 10px; margin-bottom: 0; }
.form-label { display: block; margin-bottom: 8px; color: #1f2937; font-size: 13px; }
.form-label.required::before { content: '*'; margin-right: 3px; color: #ff6b6b; }
.select-input {
  height: 32px; padding: 0 8px; border: 1px solid #d1d5db;
  border-radius: 4px; outline: none; font-size: 13px;
}
.select-input.wide { width: 220px; }
.divider { height: 1px; margin: 20px 0; background: #eef0f3; }
.show-more-row { display: flex; justify-content: center; margin: 8px 0 20px; }
.show-more-btn {
  display: inline-flex; align-items: center; gap: 4px; padding: 6px 16px;
  border: 1px solid #2f8dff; border-radius: 4px; cursor: pointer;
  color: #2f8dff; background: #fff; font-size: 12.5px;
}
.chevron { width: 12px; height: 12px; transition: transform 0.2s; }
.chevron.up { transform: rotate(180deg); }
.field-error,
.submit-error {
  margin: 6px 0 0; color: #f04444; font-size: 12px; line-height: 1.5;
}
.submit-error { margin: 8px 0 12px; text-align: center; }
.footer-actions { display: flex; justify-content: center; gap: 12px; margin-top: 24px; }
.btn {
  min-width: 100px; padding: 9px 20px; border: 1px solid #d1d5db;
  border-radius: 20px; cursor: pointer; color: #374151; background: #fff; font-size: 13px;
}
.btn.primary { border-color: #2f8dff; color: #fff; background: #2f8dff; }
.btn:disabled { cursor: not-allowed; opacity: 0.6; }
</style>