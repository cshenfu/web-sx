<!-- components/report-wizard/steps/StepOne.vue -->
<template>
  <div class="step-one">
    <div class="form-item">
      <label class="form-label required">项目名称</label>
      <input
        v-model.trim="form.projectName"
        class="text-input"
        maxlength="30"
        placeholder="请输入您的项目名称"
      />
      <p v-if="errors.projectName" class="field-error">{{ errors.projectName }}</p>
    </div>

    <div v-if="!isDistributedMode" class="form-item">
      <label class="form-label required">项目总规划装机容量</label>
      <div class="input-with-suffix">
        <input
          v-model="form.totalProjectCapacity"
          class="text-input"
          inputmode="decimal"
          placeholder="请输入总装机容量"
          @blur="normalizeNumber('totalProjectCapacity')"
        />
        <span class="suffix">MW</span>
      </div>
      <p v-if="errors.totalProjectCapacity" class="field-error">
        {{ errors.totalProjectCapacity }}
      </p>
    </div>

    <div class="form-item">
      <label class="form-label required">本期规划装机容量</label>
      <div class="input-with-suffix">
        <input
          v-model="form.currentProjectCapacity"
          class="text-input"
          inputmode="decimal"
          placeholder="请输入本期装机容量"
          @blur="normalizeNumber('currentProjectCapacity')"
        />
        <span class="suffix">MW</span>
      </div>
      <p v-if="errors.currentProjectCapacity" class="field-error">
        {{ errors.currentProjectCapacity }}
      </p>
    </div>

    <div class="form-item">
      <label class="form-label required">储能系统</label>
      <RadioOptionGroup
        v-model="form.energyStorage"
        :options="storageOptions"
        name="energyStorage"
        @change="handleEnergyStorageChange"
      />
      <p v-if="errors.energyStorage" class="field-error">{{ errors.energyStorage }}</p>
    </div>

    <div v-if="form.energyStorage === 2" class="form-item sub-item">
      <label class="form-label">租借单价</label>
      <div class="input-with-suffix short-input">
        <input
          v-model="form.rentalUnitPrice"
          class="text-input"
          inputmode="decimal"
          placeholder="请输入租借单价"
        />
        <span class="suffix">万元 MWh/年</span>
      </div>
      <p v-if="errors.rentalUnitPrice" class="field-error">{{ errors.rentalUnitPrice }}</p>

      <label class="form-label sub-label">费用支付方式</label>
      <select v-model="form.rentalPayType" class="select-input payment-select">
        <option value="">请选择</option>
        <option v-for="item in payTypeOptions" :key="item.value" :value="item.value">
          {{ item.label }}
        </option>
      </select>
    </div>

    <div
      v-if="form.energyStorage === 1 || form.energyStorage === 2"
      class="form-item sub-item"
    >
      <label class="form-label">配置容量</label>
      <div class="storage-ratio-row">
        <span>占本期比例</span>
        <select
          v-model="form.capacityProportion"
          class="select-input"
          :disabled="form.energyStorage === 1 && isBaseMode"
        >
          <option value="">请选择</option>
          <option
            v-for="option in capacityProportionOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
        <select v-model="form.storageHours" class="select-input">
          <option value="">请选择</option>
          <option v-for="option in storageHoursOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
        <span>个小时储电</span>
      </div>
      <p v-if="errors.storage" class="field-error">{{ errors.storage }}</p>
    </div>

    <div class="form-item">
      <label class="form-label required">场区坐标</label>
      <RadioOptionGroup
        v-model="form.fieldAreaSource"
        :options="fieldAreaOptions"
        name="fieldAreaSource"
      />

      <div v-if="form.fieldAreaSource === 'reference'" class="reference-wrap">
        <ReferenceBox v-if="hasReferenceData('field')" :rows="referenceRows('field')" />
        <div v-else class="reference-empty">
          该项目目前没有场区范围数据，请选择“自定义”手动上传
        </div>
      </div>

      <div v-else class="upload-wrap">
        <UploadBox
          ref="fieldUploadRef"
          accept=".kml,.kmz,.shp,.zip"
          tip="支持 kml、kmz、shp 压缩包，最多上传1个文件"
          @change="(value) => handleUploadEvent('field', value)"
          @success="(value) => handleUploadEvent('field', value)"
          @uploaded="(value) => handleUploadEvent('field', value)"
          @update:file-list="(value) => handleUploadEvent('field', value)"
        />
        <p v-if="errors.field" class="field-error">{{ errors.field }}</p>
      </div>
    </div>

    <div class="divider" />

    <div v-show="showAdvanced" class="advanced-block">
      <div class="form-item">
        <label class="form-label">倾向风机类型</label>
        <RadioOptionGroup
          v-model="form.fanTypeMode"
          :options="fanTypeModeOptions"
          name="fanTypeMode"
        />

        <div v-if="form.fanTypeMode === 'prefer'" class="fan-type-box">
          <div class="fan-type-head">
            <span>风机型号</span>
            <span>额定功率</span>
            <span>来源</span>
            <button type="button" class="icon-add" title="添加风机类型" @click="addFanTypeRow">
              +
            </button>
          </div>
          <div v-for="(row, index) in fanTypeRows" :key="row.id" class="fan-type-row">
            <input v-model.trim="row.model" class="table-input" placeholder="请输入型号" />
            <input v-model="row.power" class="table-input" placeholder="请输入功率" />
            <select v-model="row.source" class="table-input">
              <option value="1">平台</option>
              <option value="2">用户</option>
            </select>
            <button
              v-if="fanTypeRows.length > 1"
              type="button"
              class="row-remove"
              title="删除"
              @click="removeFanTypeRow(index)"
            >
              ×
            </button>
          </div>
          <p class="illustrate">
            在机型比选阶段，系统会优先使用您指定的风机型号；若有多个型号，将参与比选。
          </p>
        </div>
      </div>

      <div class="form-item">
        <label class="form-label required">倾向轮毂高度</label>
        <RadioOptionGroup
          v-model="form.hubType"
          :options="hubTypeOptions"
          name="hubType"
          @change="handleHubTypeChange"
        />
        <select v-model="form.preferHubHeight" class="select-input hub-height-select">
          <option value="">请选择轮毂高度</option>
          <option v-for="option in preferHubHeightOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
        <p class="illustrate">
          {{
            form.hubType === 1
              ? '若您指定轮毂高度，系统不进行轮毂高度比选'
              : '系统会优先使用您倾向的轮毂高度进行比选'
          }}
        </p>
      </div>

      <div class="form-item">
        <label class="form-label required">风机点位</label>
        <RadioOptionGroup
          v-model="form.fanLocationSource"
          :options="fanLocationOptions"
          name="fanLocationSource"
        />

        <div v-if="form.fanLocationSource === 'reference'" class="reference-wrap">
          <ReferenceBox v-if="hasReferenceData('fan')" :rows="referenceRows('fan')" />
          <div v-else class="reference-empty">
            该项目目前没有风机点位数据，请选择“自定义”手动上传
          </div>
        </div>

        <div v-else-if="form.fanLocationSource === 'custom'" class="upload-wrap">
          <UploadBox
            ref="fanUploadRef"
            accept=".xlsx,.xls,.csv"
            tip="支持 xlsx、xls、csv 格式，最多上传1个文件"
            @change="(value) => handleUploadEvent('fan', value)"
            @success="(value) => handleUploadEvent('fan', value)"
            @uploaded="(value) => handleUploadEvent('fan', value)"
            @update:file-list="(value) => handleUploadEvent('fan', value)"
          />
          <p v-if="errors.fan" class="field-error">{{ errors.fan }}</p>
        </div>

        <div v-else class="auto-tip">
          系统将根据场区范围和建设条件自动布置风机
        </div>
      </div>

      <div v-if="!isDistributedMode" class="form-item">
        <label class="form-label required">升压站点位</label>
        <RadioOptionGroup
          v-model="form.boosterLocationSource"
          :options="boosterLocationOptions"
          name="boosterLocationSource"
        />

        <div v-if="form.boosterLocationSource === 'reference'" class="reference-wrap">
          <ReferenceBox v-if="hasReferenceData('booster')" :rows="referenceRows('booster')" />
          <div v-else class="reference-empty">
            该项目目前没有升压站点位数据，请选择“自定义”手动上传
          </div>
        </div>

        <div v-else-if="form.boosterLocationSource === 'custom'" class="upload-wrap">
          <UploadBox
            ref="boosterUploadRef"
            accept=".xlsx,.xls,.csv"
            tip="支持 xlsx、xls、csv 格式，最多上传1个文件"
            @change="(value) => handleUploadEvent('booster', value)"
            @success="(value) => handleUploadEvent('booster', value)"
            @uploaded="(value) => handleUploadEvent('booster', value)"
            @update:file-list="(value) => handleUploadEvent('booster', value)"
          />
          <p v-if="errors.booster" class="field-error">{{ errors.booster }}</p>
        </div>

        <div v-else class="auto-tip">
          系统将根据场区范围和风机点位自动选择升压站位置
        </div>
      </div>

      <div class="form-item">
        <label class="form-label">地形现场照片</label>
        <UploadBox
          ref="terrainUploadRef"
          accept=".jpg,.jpeg,.png"
          tip="非必填，支持 JPG、PNG 格式，上限2个，单文件最大5M"
          @change="(value) => handleUploadEvent('terrain', value)"
          @success="(value) => handleUploadEvent('terrain', value)"
          @uploaded="(value) => handleUploadEvent('terrain', value)"
          @update:file-list="(value) => handleUploadEvent('terrain', value)"
        />
        <p class="illustrate">用于报告中展示，可不上传。</p>
      </div>
    </div>

    <div class="show-more-row">
      <button type="button" class="show-more-btn" @click="showAdvanced = !showAdvanced">
        {{ showAdvanced ? '收起' : '高级参数设置' }}
        <svg viewBox="0 0 16 16" class="chevron" :class="{ up: showAdvanced }">
          <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
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
import { computed, reactive, ref, watch } from 'vue'
import RadioOptionGroup from '../../shared/RadioOptionGroup.vue'
import ReferenceBox from '../../shared/ReferenceBox.vue'
import UploadBox from '../../shared/UploadBox.vue'
import { PACKAGE_TYPE } from '../../../js/reportWizardMockData'
import * as newApi from '@/api/modules/project'

const props = defineProps({
  createProjectMode: { type: Number, default: PACKAGE_TYPE.default },
  initialProjectName: { type: String, default: '' },
  project: { type: Object, default: () => null },
})

const emit = defineEmits(['save-draft', 'next'])

const showAdvanced = ref(false)
const submitting = ref(false)
const submitMode = ref('')
const submitError = ref('')
const fieldUploadRef = ref(null)
const fanUploadRef = ref(null)
const boosterUploadRef = ref(null)
const terrainUploadRef = ref(null)

const errors = reactive({
  projectName: '',
  totalProjectCapacity: '',
  currentProjectCapacity: '',
  energyStorage: '',
  rentalUnitPrice: '',
  storage: '',
  field: '',
  fan: '',
  booster: '',
})

const form = reactive({
  projectName: props.initialProjectName || getProjectName(props.project),
  totalProjectCapacity: props.project?.totalProjectCapacity ?? '',
  currentProjectCapacity: props.project?.currentProjectCapacity ?? '',
  energyStorage: toNumber(props.project?.energyStorage, 3),
  rentalUnitPrice: props.project?.rentalUnitPrice ?? '',
  rentalPayType: props.project?.rentalPayType ?? '',
  capacityProportion: props.project?.capacityProportion ?? '',
  storageHours: props.project?.storageHours ?? '',
  fieldAreaSource: 'reference',
  fanTypeMode: 'prefer',
  fanLocationSource: 'reference',
  boosterLocationSource: 'reference',
  hubType: toNumber(props.project?.hubType, 0),
  preferHubHeight: props.project?.preferHubHeight ?? 140,
})

const uploadState = reactive({
  field: { files: [], points: [] },
  fan: { files: [], points: [] },
  booster: { files: [], points: [] },
  terrain: { files: [], points: [] },
})

const fanTypeRows = reactive([
  { id: 1, model: '', power: '', source: '1' },
])

let nextFanTypeId = 2

const storageOptions = [
  { label: '自建', value: 1 },
  { label: '租借', value: 2 },
  { label: '不配置', value: 3 },
]

const capacityProportionOptions = [
  { label: '10%', value: 10 },
  { label: '15%', value: 15 },
  { label: '20%', value: 20 },
  { label: '30%', value: 30 },
]

const storageHoursOptions = [
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '4', value: 4 },
]

const payTypeOptions = [
  { label: '每年支付', value: 1 },
  { label: '每5年支付', value: 2 },
  { label: '每10年支付', value: 3 },
  { label: '一次性全部支付', value: 4 },
]

const fieldAreaOptions = [
  { label: '引用项目数据', value: 'reference' },
  { label: '自定义', value: 'custom' },
]

const fanLocationOptions = [
  { label: '引用项目数据', value: 'reference' },
  { label: '自定义', value: 'custom' },
  { label: '自动布机', value: 'auto' },
]

const boosterLocationOptions = [
  { label: '引用项目数据', value: 'reference' },
  { label: '自定义', value: 'custom' },
  { label: '自动选址', value: 'auto' },
]

const fanTypeModeOptions = [
  { label: '倾向', value: 'prefer' },
  { label: '系统自动配机', value: 'auto' },
]

const hubTypeOptions = [
  { label: '倾向', value: 0 },
  { label: '指定', value: 1 },
]

const preferHubHeightOptions = [
  { label: '100m', value: 100 },
  { label: '110m', value: 110 },
  { label: '120m', value: 120 },
  { label: '130m', value: 130 },
  { label: '140m', value: 140 },
  { label: '150m', value: 150 },
  { label: '160m', value: 160 },
]

const isDistributedMode = computed(
  () => props.createProjectMode === PACKAGE_TYPE.distributedDefault
)

const isBaseMode = computed(
  () => props.createProjectMode === PACKAGE_TYPE.baseDefault
)

const referenceData = computed(() => {
  const project = props.project || {}
  const source = project.rawProject || project

  return {
    field: {
      points: toArray(source.coordinate || source.fieldArea),
      files: findProjectFiles(source, 'field'),
    },
    fan: {
      points: toArray(source.windTurbinePoints || source.devicePoints),
      files: findProjectFiles(source, 'fan'),
    },
    booster: {
      points: toArray(source.boosterStationLocations),
      files: findProjectFiles(source, 'booster'),
    },
  }
})

watch(
  () => [props.initialProjectName, props.project?.name, props.project?.projectName],
  () => {
    if (!form.projectName || form.projectName === getProjectName(props.project)) {
      form.projectName = props.initialProjectName || getProjectName(props.project)
    }
  }
)

function getProjectName(project) {
  return project?.projectName || project?.name || ''
}

function toNumber(value, fallback = 0) {
  if (value === '' || value === null || value === undefined) return fallback
  const result = Number(value)
  return Number.isFinite(result) ? result : fallback
}

function toArray(value) {
  if (Array.isArray(value)) return value
  if (typeof value !== 'string' || !value.trim()) return []

  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function findProjectFiles(project, kind) {
  const allFiles = [
    ...(Array.isArray(project.fileCollection) ? project.fileCollection : []),
    ...(Array.isArray(project.files) ? project.files : []),
    ...(Array.isArray(project.projectFileList) ? project.projectFileList : []),
  ]

  const aliases = {
    field: ['场区范围', '场区文件', '场区坐标', 'FIELD_AREA', 'REGION'],
    fan: ['风机点位', '风机文件', '风机坐标', 'DEVICE_POINTS', 'WIND_TURBINE'],
    booster: ['升压站点位', '升压站文件', '开关站点位', 'BOOSTER_STATION'],
  }[kind]

  return allFiles.filter((file) => {
    const typeText = [
      file?.fileBusinessType,
      file?.businessType,
      file?.fileType,
      file?.fileTypeTag,
    ]
      .filter(Boolean)
      .join('|')

    return aliases.some(
      (alias) => typeText === alias || typeText.includes(alias)
    )
  })
}

function hasReferenceData(kind) {
  const data = referenceData.value[kind]
  return Boolean(data?.points?.length || data?.files?.length)
}

function pointLabel(point, index) {
  const lng = point?.longitude ?? point?.lng ?? point?.x ?? '-'
  const lat = point?.latitude ?? point?.lat ?? point?.y ?? '-'
  return `${index + 1}. ${lng}, ${lat}`
}

function fileLabel(file) {
  return file?.fileName || file?.name || file?.path || file?.filePath || '已上传文件'
}

function referenceRows(kind) {
  const data = referenceData.value[kind]
  const rows = []

  data.points.slice(0, 8).forEach((point, index) => {
    rows.push({
      label: kind === 'field' ? '场区坐标' : '点位',
      value: pointLabel(point, index),
    })
  })

  data.files.forEach((file) => {
    rows.push({
      label: '引用文件',
      value: fileLabel(file),
    })
  })

  return rows.length
    ? rows
    : [{ label: '引用数据', value: '暂无数据' }]
}

function handleEnergyStorageChange() {
  if (form.energyStorage === 3) {
    form.rentalUnitPrice = ''
    form.rentalPayType = ''
    form.capacityProportion = ''
    form.storageHours = ''
  }
}

function handleHubTypeChange() {
  if (form.hubType === 1 && Number(form.preferHubHeight) < 115) {
    form.preferHubHeight = ''
  }
}

function addFanTypeRow() {
  fanTypeRows.push({
    id: nextFanTypeId++,
    model: '',
    power: '',
    source: '1',
  })
}

function removeFanTypeRow(index) {
  if (fanTypeRows.length > 1) fanTypeRows.splice(index, 1)
}

function normalizeNumber(key) {
  if (form[key] === '' || form[key] === null || form[key] === undefined) return
  const value = Number(form[key])
  form[key] = Number.isFinite(value) ? value : ''
}

function normalizeFile(file) {
  if (!file) return null
  const raw = file.raw || file

  return {
    fileId: raw.fileId ?? raw.id ?? '',
    fileName: raw.fileName || raw.name || '',
    filePath: raw.filePath || raw.path || raw.url || '',
    suffix:
      raw.suffix ||
      raw.fileSuffix ||
      (raw.name && raw.name.includes('.') ? `.${raw.name.split('.').pop()}` : ''),
  }
}

function normalizeFileList(value) {
  const list = Array.isArray(value)
    ? value
    : value
      ? [value]
      : []

  return list.map(normalizeFile).filter(Boolean)
}

function readUploadPayload(value) {
  const eventFiles = value?.target?.files
    ? Array.from(value.target.files)
    : null
  const raw = eventFiles || value?.detail || value
  const files =
    raw?.fileList ||
    raw?.files ||
    raw?.data?.fileList ||
    raw?.data?.files ||
    (Array.isArray(raw) ? raw : raw ? [raw] : [])
  const points =
    raw?.points ||
    raw?.coordinates ||
    raw?.coordinate ||
    raw?.data?.points ||
    raw?.data?.coordinates ||
    []

  return {
    files: normalizeFileList(files),
    points: toArray(points),
  }
}

function handleUploadEvent(kind, value) {
  const payload = readUploadPayload(value)
  if (payload.files.length) uploadState[kind].files = payload.files
  if (payload.points.length) uploadState[kind].points = payload.points
}

function syncUploadExposedData(kind, componentRef) {
  const exposed = componentRef.value
  if (!exposed || typeof exposed.getData !== 'function') return

  const data = exposed.getData()
  if (data) handleUploadEvent(kind, data)
}

function clearErrors() {
  Object.keys(errors).forEach((key) => {
    errors[key] = ''
  })
  submitError.value = ''
}

function validateForm() {
  clearErrors()
  let valid = true

  if (!form.projectName || form.projectName.length < 2) {
    errors.projectName = '请输入至少2个字符的项目名称'
    valid = false
  }

  const total = Number(form.totalProjectCapacity)
  const current = Number(form.currentProjectCapacity)

  if (!isDistributedMode.value) {
    if (!Number.isFinite(total)) {
      errors.totalProjectCapacity = '请输入总规划装机容量'
      valid = false
    } else {
      const min = isBaseMode.value ? 200 : 30
      if (total < min || total > 500) {
        errors.totalProjectCapacity = `总规划装机容量范围为${min}~500MW`
        valid = false
      }
    }
  }

  if (!Number.isFinite(current)) {
    errors.currentProjectCapacity = '请输入本期规划装机容量'
    valid = false
  } else {
    const [min, max] = isDistributedMode.value
      ? [5, 40]
      : isBaseMode.value
        ? [200, 500]
        : [30, 200]

    if (current < min || current > max) {
      errors.currentProjectCapacity = `本期规划装机容量范围为${min}~${max}MW`
      valid = false
    }
    if (!isDistributedMode.value && Number.isFinite(total) && current > total) {
      errors.currentProjectCapacity = '本期装机容量不能大于总装机容量'
      valid = false
    }
  }

  if (![1, 2, 3].includes(Number(form.energyStorage))) {
    errors.energyStorage = '请选择储能系统配置方式'
    valid = false
  }

  if (form.energyStorage === 2) {
    if (!Number.isFinite(Number(form.rentalUnitPrice))) {
      errors.rentalUnitPrice = '请输入租借单价'
      valid = false
    }
    if (!form.rentalPayType) {
      errors.rentalUnitPrice = errors.rentalUnitPrice || '请选择费用支付方式'
      valid = false
    }
  }

  if (form.energyStorage === 1 || form.energyStorage === 2) {
    if (!form.capacityProportion || !form.storageHours) {
      errors.storage = '请选择配置容量比例和储电小时'
      valid = false
    }
  }

  if (
    form.fieldAreaSource === 'reference' &&
    !hasReferenceData('field')
  ) {
    errors.field = '该项目目前没有场区范围数据，请手动上传'
    valid = false
  }

  if (
    form.fieldAreaSource === 'custom' &&
    !uploadState.field.files.length &&
    !uploadState.field.points.length
  ) {
    errors.field = '请上传场区范围文件'
    valid = false
  }

  if (
    form.fanLocationSource === 'reference' &&
    !hasReferenceData('fan')
  ) {
    errors.fan = '该项目目前没有风机点位数据，请手动上传'
    valid = false
  }

  if (
    form.fanLocationSource === 'custom' &&
    !uploadState.fan.files.length &&
    !uploadState.fan.points.length
  ) {
    errors.fan = '请上传风机点位文件'
    valid = false
  }

  if (
    !isDistributedMode.value &&
    form.boosterLocationSource === 'reference' &&
    !hasReferenceData('booster')
  ) {
    errors.booster = '该项目目前没有升压站点位数据，请手动上传'
    valid = false
  }

  if (
    !isDistributedMode.value &&
    form.boosterLocationSource === 'custom' &&
    !uploadState.booster.files.length &&
    !uploadState.booster.points.length
  ) {
    errors.booster = '请上传升压站点位文件'
    valid = false
  }

  if (
    form.hubType === 1 &&
    (!form.preferHubHeight || Number(form.preferHubHeight) < 115)
  ) {
    submitError.value = '指定轮毂高度不能低于115m'
    valid = false
  }

  return valid
}

function getSelectedData(kind) {
  if (kind === 'field') {
    if (form.fieldAreaSource === 'reference') return referenceData.value.field
    return uploadState.field
  }

  if (kind === 'fan') {
    if (form.fanLocationSource === 'reference') return referenceData.value.fan
    if (form.fanLocationSource === 'auto') return { points: [], files: [] }
    return uploadState.fan
  }

  if (form.boosterLocationSource === 'reference') return referenceData.value.booster
  if (form.boosterLocationSource === 'auto') return { points: [], files: [] }
  return uploadState.booster
}

function serialize(value) {
  return JSON.stringify(Array.isArray(value) ? value : value || [])
}

function normalizeItemType() {
  const mode = Number(props.createProjectMode)
  if (Number.isFinite(mode) && mode > 0) return mode
  return props.project?.itemType === 'FD' ? 1 : 2
}

function buildPreferDeviceCodes() {
  if (form.fanTypeMode === 'auto') return ''

  return fanTypeRows
    .filter((row) => row.model || row.power)
    .map((row) => `${row.model},${row.power},${row.source}`)
    .join(';')
}

function buildPayload(isDraft) {
  const field = getSelectedData('field')
  const fan = getSelectedData('fan')
  const booster = getSelectedData('booster')
  const project = props.project || {}
  const fieldFiles =
    form.fieldAreaSource === 'reference'
      ? field.files
      : uploadState.field.files
  const fanFiles =
    form.fanLocationSource === 'reference'
      ? fan.files
      : uploadState.fan.files
  const boosterFiles =
    form.boosterLocationSource === 'reference'
      ? booster.files
      : uploadState.booster.files

  const editProjectWindReqDTO = {
    projectCode: project.projectCode || project.code,
    projectName: form.projectName,
    itemType: normalizeItemType(),
    step: 1,
    isDraft,
    projectAdjustFlag: Boolean(project.id),
    projectAdjustOneStepFlag: true,
    uniqueIdentification:
      project.uniqueIdentification || `report-step-one-${project.id || 'new'}`,

    totalProjectCapacity: isDistributedMode.value
      ? Number(form.currentProjectCapacity)
      : Number(form.totalProjectCapacity),
    currentProjectCapacity: Number(form.currentProjectCapacity),

    energyStorage: Number(form.energyStorage),
    collocationMethod: Number(form.energyStorage),
    rentalUnitPrice:
      form.energyStorage === 2 ? Number(form.rentalUnitPrice) : 0,
    rentalPayType:
      form.energyStorage === 2 ? Number(form.rentalPayType) : undefined,
    capacityProportion:
      form.energyStorage !== 3 ? Number(form.capacityProportion) : 0,
    storageHours: form.energyStorage !== 3 ? Number(form.storageHours) : 0,

    coordinate: serialize(field.points),
    regionFilePath: serialize(fieldFiles),

    isHaveDevicePoints:
      form.fanLocationSource === 'auto'
        ? 0
        : fan.points.length || fanFiles.length
          ? 1
          : 0,
    devicePoints: serialize(fan.points),
    deviceWindFilePath: serialize(fanFiles),

    boosterStationLocations: serialize(booster.points),
    boosterStationFilePath: serialize(boosterFiles),

    preferDeviceCodes: buildPreferDeviceCodes(),
    hubType: Number(form.hubType),
    preferHubHeight: Number(form.preferHubHeight) || undefined,

    isTerrainImage: uploadState.terrain.files.length ? 1 : 0,
    terrainImageFile: serialize(uploadState.terrain.files),
  }

  if (form.boosterLocationSource === 'auto') {
    editProjectWindReqDTO.boosterStationLocations = '[]'
    editProjectWindReqDTO.boosterStationFilePath = '[]'
  }

  return {
    // saveUpdateProject 的请求体结构：
    // {
    //   editProjectWindReqDTO: { ...第一步参数，不带 id },
    //   sxProjectId: 当前项目 id
    // }
    editProjectWindReqDTO: removeUndefined(editProjectWindReqDTO),
    sxProjectId: toProjectId(project.sxProjectId ?? project.id),
  }
}

function removeUndefined(object) {
  return Object.fromEntries(
    Object.entries(object).filter(([, value]) => value !== undefined)
  )
}

function toProjectId(value) {
  if (value === '' || value === null || value === undefined) return 0
  const id = Number(value)
  return Number.isFinite(id) ? id : 0
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
    const number = Number(value)
    return Number.isFinite(number) && number > 0
  })

  return id === undefined ? null : Number(id)
}

async function submitStep(isDraft) {
  syncUploadExposedData('field', fieldUploadRef)
  syncUploadExposedData('fan', fanUploadRef)
  syncUploadExposedData('booster', boosterUploadRef)
  syncUploadExposedData('terrain', terrainUploadRef)

  // 草稿允许保存当前已填写内容，不能因为必填项未完成而直接拦截请求。
  // “下一步”仍然需要通过校验，避免带着不完整参数进入后续步骤。
  if (!isDraft && !validateForm()) {
    submitError.value = '请先完善页面中标红的必填项，再进入下一步'
    return
  }

  if (isDraft) {
    clearErrors()
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

    const savedProjectId = extractSavedProjectId(response)
    const result = {
      form: { ...form, fanTypeRows: fanTypeRows.map((row) => ({ ...row })) },
      request: payload,
      response,
      savedProjectId,
      project: savedProjectId
        ? { ...(props.project || {}), id: savedProjectId }
        : props.project,
    }

    if (isDraft) emit('save-draft', result)
    else emit('next', result)
  } catch (error) {
    console.error('保存第一步项目数据失败:', error)
    submitError.value = error?.message || '保存失败，请稍后重试'
  } finally {
    submitting.value = false
    submitMode.value = ''
  }
}
</script>

<style scoped>
.step-one {
  padding-bottom: 20px;
}

.form-item {
  margin-bottom: 18px;
}

.form-item.sub-item {
  margin-top: -8px;
  padding-left: 0;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  color: #1f2937;
  font-size: 13px;
}

.form-label.required::before {
  content: '*';
  margin-right: 3px;
  color: #ff6b6b;
}

.sub-label {
  margin-top: 14px;
}

.text-input,
.select-input {
  box-sizing: border-box;
  height: 36px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  outline: none;
  background: #fff;
  font-size: 13px;
}

.text-input {
  width: 100%;
  padding: 0 12px;
}

.text-input:focus,
.select-input:focus {
  border-color: #2f8dff;
}

.input-with-suffix {
  position: relative;
}

.input-with-suffix .suffix {
  position: absolute;
  top: 50%;
  right: 12px;
  color: #1f2937;
  font-size: 12px;
  font-weight: 600;
  transform: translateY(-50%);
}

.short-input {
  width: 280px;
}

.short-input .text-input {
  padding-right: 100px;
}

.storage-ratio-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  color: #374151;
  font-size: 13px;
}

.select-input {
  min-width: 108px;
  padding: 0 8px;
}

.payment-select,
.hub-height-select {
  width: 190px;
}

.select-input:disabled {
  cursor: not-allowed;
  background: #f5f6f8;
}

.reference-wrap,
.upload-wrap,
.auto-tip {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 3px;
  background: #fafafa;
}

.reference-empty,
.auto-tip {
  color: #9ca3af;
  font-size: 12px;
  line-height: 1.6;
}

.reference-wrap :deep(*) {
  font-size: 12px;
}

.advanced-block {
  animation: show-advanced 0.18s ease-out;
}

.fan-type-box {
  margin-top: 10px;
  padding: 8px;
  border: 1px solid #edf0f4;
  border-radius: 4px;
  background: #fafbfc;
}

.fan-type-head,
.fan-type-row {
  display: grid;
  grid-template-columns: minmax(90px, 1fr) minmax(70px, 0.8fr) minmax(62px, 0.7fr) 22px;
  align-items: center;
  gap: 6px;
}

.fan-type-head {
  padding: 0 2px 6px;
  color: #9ca3af;
  font-size: 11px;
}

.fan-type-row + .fan-type-row {
  margin-top: 6px;
}

.table-input {
  box-sizing: border-box;
  width: 100%;
  height: 30px;
  padding: 0 6px;
  border: 1px solid #d7dce3;
  border-radius: 3px;
  outline: none;
  color: #374151;
  background: #fff;
  font-size: 11px;
}

.icon-add,
.row-remove {
  border: none;
  cursor: pointer;
  color: #2f8dff;
  background: transparent;
  font-size: 18px;
  line-height: 1;
}

.row-remove {
  color: #9ca3af;
}

.illustrate {
  margin: 8px 0 0;
  color: #9ca3af;
  font-size: 12px;
  line-height: 1.6;
}

.divider {
  height: 1px;
  margin: 20px 0;
  background: #eef0f3;
}

.show-more-row {
  display: flex;
  justify-content: center;
  margin: 8px 0 20px;
}

.show-more-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 18px;
  border: 1px solid #2f8dff;
  border-radius: 0;
  cursor: pointer;
  color: #2f8dff;
  background: #fff;
  font-size: 12.5px;
}

.chevron {
  width: 12px;
  height: 12px;
  transition: transform 0.2s;
}

.chevron.up {
  transform: rotate(180deg);
}

.field-error,
.submit-error {
  margin: 6px 0 0;
  color: #f04444;
  font-size: 12px;
  line-height: 1.5;
}

.submit-error {
  margin-bottom: 12px;
  text-align: center;
}

.footer-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
}

.btn {
  min-width: 100px;
  padding: 9px 20px;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  cursor: pointer;
  color: #374151;
  background: #fff;
  font-size: 13px;
}

.btn.primary {
  min-width: 154px;
  border-color: #2f8dff;
  color: #fff;
  background: #2f8dff;
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

@keyframes show-advanced {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 520px) {
  .short-input {
    width: 100%;
  }

  .storage-ratio-row {
    align-items: stretch;
  }

  .storage-ratio-row .select-input {
    flex: 1 1 100px;
  }

  .fan-type-head,
  .fan-type-row {
    grid-template-columns: minmax(70px, 1fr) minmax(58px, 0.8fr) 58px 18px;
  }
}
</style>