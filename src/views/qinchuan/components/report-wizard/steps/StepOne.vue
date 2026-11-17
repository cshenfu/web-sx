<template>
  <div class="step-one">
    <!-- 💡 顶部选择区 (未选或重新选择时显示) -->
    <div v-if="!hasSelectedProject" class="project-selector-area">
      <el-form label-width="100px" label-position="left">
        <el-form-item label="选择项目" required>
          <el-select v-model="selectedProjectId" filterable remote reserve-keyword placeholder="请输入项目名称搜索" :remote-method="searchProjects" :loading="loadingProject" style="width: 100%" @change="handleProjectChange">
            <el-option v-for="item in projectList" :key="item.id" :label="`${item.projectName} (${item.projectCode})`" :value="item.id" />
          </el-select>
          <div class="form-tip">说明：如果系统中还未录入该项目，需要先创建该项目，完善项目相关材料信息</div>
        </el-form-item>

        <el-form-item label="选择可研报告" required>
          <el-select v-model="selectedReportId" placeholder="请选择可研报告" :disabled="!selectedProjectId" :loading="loadingReport" style="width: 100%">
            <el-option v-for="item in reportList" :key="item.reportProjectId" :label="`${item.reportProjectName} (${item.reportProjectCode})`" :value="item.reportProjectId" />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="action-btns">
        <el-button type="primary" :disabled="!selectedProjectId || !selectedReportId" @click="handleConfirmSelect">确认关联</el-button>
      </div>
    </div>

    <!-- 💡 原有表单区 (选好项目后显示) -->
    <div v-show="hasSelectedProject" class="original-form-area">
      <div class="selected-header">
        <div class="project-info">
          <span class="label">当前项目：</span>
          <span class="value">{{ form.projectName }}</span>
        </div>
        <el-button link type="primary" @click="hasSelectedProject = false">重新选择</el-button>
      </div>

      <div class="form-item">
        <label class="form-label required">项目名称</label>
        <input v-model.trim="form.projectName" class="text-input" maxlength="30" placeholder="请输入您的项目名称" />
        <p v-if="errors.projectName" class="field-error">{{ errors.projectName }}</p>
      </div>

      <div v-if="!isDistributedMode" class="form-item">
        <label class="form-label required">项目总规划装机容量</label>
        <div class="input-with-suffix">
          <input v-model="form.totalProjectCapacity" class="text-input" inputmode="decimal" placeholder="请输入总装机容量" @blur="normalizeNumber('totalProjectCapacity')" />
          <span class="suffix">MW</span>
        </div>
        <p v-if="errors.totalProjectCapacity" class="field-error">{{ errors.totalProjectCapacity }}</p>
      </div>

      <div class="form-item">
        <label class="form-label required">本期规划装机容量</label>
        <div class="input-with-suffix">
          <input v-model="form.currentProjectCapacity" class="text-input" inputmode="decimal" placeholder="请输入本期装机容量" @blur="normalizeNumber('currentProjectCapacity')" />
          <span class="suffix">MW</span>
        </div>
        <p v-if="errors.currentProjectCapacity" class="field-error">{{ errors.currentProjectCapacity }}</p>
      </div>

      <div class="form-item">
        <label class="form-label required">储能系统</label>
        <RadioOptionGroup v-model="form.energyStorage" :options="storageOptions" name="energyStorage" @change="handleEnergyStorageChange" />
        <p v-if="errors.energyStorage" class="field-error">{{ errors.energyStorage }}</p>
      </div>

      <div v-if="form.energyStorage === 2" class="form-item sub-item">
        <label class="form-label">租借单价</label>
        <div class="input-with-suffix short-input">
          <input v-model="form.rentalUnitPrice" class="text-input" inputmode="decimal" placeholder="请输入租借单价" />
          <span class="suffix">万元 MWh/年</span>
        </div>
        <p v-if="errors.rentalUnitPrice" class="field-error">{{ errors.rentalUnitPrice }}</p>

        <label class="form-label sub-label">费用支付方式</label>
        <select v-model="form.rentalPayType" class="select-input payment-select">
          <option value="">请选择</option>
          <option v-for="item in payTypeOptions" :key="item.value" :value="item.value">{{ item.label }}</option>
        </select>
      </div>

      <div v-if="form.energyStorage === 1 || form.energyStorage === 2" class="form-item sub-item">
        <label class="form-label">配置容量</label>
        <div class="storage-ratio-row">
          <span>占本期比例</span>
          <select v-model="form.capacityProportion" class="select-input" :disabled="form.energyStorage === 1 && isBaseMode">
            <option value="">请选择</option>
            <option v-for="option in capacityProportionOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
          <select v-model="form.storageHours" class="select-input">
            <option value="">请选择</option>
            <option v-for="option in storageHoursOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
          <span>个小时储电</span>
        </div>
        <p v-if="errors.storage" class="field-error">{{ errors.storage }}</p>
      </div>

      <div class="form-item">
        <label class="form-label required">场区坐标</label>
        <RadioOptionGroup v-model="form.fieldAreaSource" :options="fieldAreaOptions" name="fieldAreaSource" />
        <div v-if="form.fieldAreaSource === 'reference'" class="reference-wrap">
          <ReferenceBox v-if="hasReferenceData('field')" :rows="referenceRows('field')" />
          <div v-else class="reference-empty">该项目目前没有场区范围数据，请选择“自定义”手动上传</div>
        </div>
        <div v-else class="upload-wrap custom-location-wrap">
          <RadioOptionGroup v-model="fieldInputMode" :options="fieldInputModeOptions" name="fieldInputMode" />
          <div v-if="fieldInputMode === 'upload'" class="custom-upload-panel">
            <Upload ref="fieldUploadRef" fileTypes="xlsx,kml,kmz,ovkml" :maxCount="1" :fileSize="5" fileSizeMessage="每个文件最大限制为5M" fileTypeMessage="请上传 xlsx、kml、kmz 或 ovkml 文件" :isImmediatelyUpload="false" :disabled="processing.field" @upFileList="(file) => handleCustomFileUpload('field', file)" @deleteFile="() => clearCustomUpload('field')">
              <template #tip><span class="form-tip">支持 xlsx、kml、kmz、ovkml；xlsx 使用平台模板。</span></template>
            </Upload>
            <p v-if="processing.field" class="form-tip">正在解析并上传场区文件…</p>
          </div>
          <div v-else class="manual-coordinate-panel">
            <div class="point-count-row"><span>场区拐点数：</span><button v-for="count in manualFieldPointCounts" :key="count" type="button" class="point-count-btn" :class="{ active: manualFieldPointCount === count }" @click="setManualFieldPointCount(count)">{{ count }}</button></div>
            <div v-for="(point, index) in manualFieldPoints" :key="index" class="custom-coordinate-row">
              <span class="coordinate-index">{{ index + 1 }}</span>
              <input v-model.trim="point.lng" class="text-input" inputmode="decimal" placeholder="请输入经度 / X" @blur="syncManualFieldPoints" />
              <input v-model.trim="point.lat" class="text-input" inputmode="decimal" placeholder="请输入纬度 / Y" @blur="syncManualFieldPoints" />
            </div>
            <p class="form-tip">支持十进制度经纬度或 CGCS 2000 平面坐标；1 个点按场区中心点处理。</p>
          </div>
          <p v-if="errors.field" class="field-error">{{ errors.field }}</p>
        </div>
      </div>

      <div class="divider" />

      <div v-show="showAdvanced" class="advanced-block">
        <div class="form-item">
          <label class="form-label">倾向风机类型</label>
          <RadioOptionGroup v-model="form.fanTypeMode" :options="fanTypeModeOptions" name="fanTypeMode" />
          <div v-if="form.fanTypeMode === 'prefer'" class="fan-type-box">
            <div class="fan-type-head"><span>风机型号</span><span>额定功率</span><span>来源</span><button type="button" class="icon-add" @click="addFanTypeRow">+</button></div>
            <div v-for="(row, index) in fanTypeRows" :key="row.id" class="fan-type-row">
              <input v-model.trim="row.model" class="table-input" placeholder="请输入型号" />
              <input v-model="row.power" class="table-input" placeholder="请输入功率" />
              <select v-model="row.source" class="table-input"><option value="1">平台</option><option value="2">用户</option></select>
              <button v-if="fanTypeRows.length > 1" type="button" class="row-remove" @click="removeFanTypeRow(index)">×</button>
            </div>
          </div>
        </div>

        <div class="form-item">
          <label class="form-label required">倾向轮毂高度</label>
          <RadioOptionGroup v-model="form.hubType" :options="hubTypeOptions" name="hubType" @change="handleHubTypeChange" />
          <select v-model="form.preferHubHeight" class="select-input hub-height-select">
            <option value="">请选择轮毂高度</option>
            <option v-for="option in preferHubHeightOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </div>

        <div class="form-item">
          <label class="form-label required">风机点位</label>
          <RadioOptionGroup v-model="form.fanLocationSource" :options="fanLocationOptions" name="fanLocationSource" />
          <div v-if="form.fanLocationSource === 'reference'" class="reference-wrap">
            <ReferenceBox v-if="hasReferenceData('fan')" :rows="referenceRows('fan')" />
            <div v-else class="reference-empty">该项目目前没有风机点位数据</div>
          </div>
          <div v-else-if="form.fanLocationSource === 'custom'" class="upload-wrap custom-location-wrap">
            <Upload ref="fanUploadRef" fileTypes="xlsx,kml,kmz,ovkml" :maxCount="1" :fileSize="5" fileSizeMessage="每个文件最大限制为5M" fileTypeMessage="请上传 xlsx、kml、kmz 或 ovkml 文件" :isImmediatelyUpload="false" :disabled="processing.fan || !hasFieldData" @upFileList="(file) => handleCustomFileUpload('fan', file)" @deleteFile="() => clearCustomUpload('fan')">
              <template #tip><span class="form-tip">支持 xlsx、kml、kmz、ovkml；请先填写场区坐标。</span></template>
            </Upload>
            <p v-if="processing.fan" class="form-tip">正在解析并上传风机文件…</p>
            <p v-if="errors.fan" class="field-error">{{ errors.fan }}</p>
          </div>
          <div v-else class="auto-tip">系统将根据场区范围和建设条件自动布置风机</div>
        </div>

        <div v-if="!isDistributedMode" class="form-item">
          <label class="form-label required">升压站点位</label>
          <RadioOptionGroup v-model="form.boosterLocationSource" :options="boosterLocationOptions" name="boosterLocationSource" />
          <div v-if="form.boosterLocationSource === 'reference'" class="reference-wrap">
            <ReferenceBox v-if="hasReferenceData('booster')" :rows="referenceRows('booster')" />
            <div v-else class="reference-empty">该项目目前没有升压站点位数据</div>
          </div>
          <div v-else-if="form.boosterLocationSource === 'custom'" class="upload-wrap custom-location-wrap">
            <RadioOptionGroup v-model="boosterInputMode" :options="boosterInputModeOptions" name="boosterInputMode" />
            <div v-if="boosterInputMode === 'manual'" class="manual-coordinate-panel">
              <div class="point-count-row"><span>升压站数量：</span><button v-for="count in boosterPointCounts" :key="count" type="button" class="point-count-btn" :class="{ active: boosterPointCount === count }" @click="setBoosterPointCount(count)">{{ count }}</button></div>
              <div v-for="(point, index) in manualBoosterPoints" :key="index" class="custom-coordinate-row booster-coordinate-row">
                <span class="coordinate-index">{{ index + 1 }}</span>
                <input v-model.trim="point.lng" class="text-input" inputmode="decimal" placeholder="请输入经度 / X" @blur="syncManualBoosterPoints" />
                <input v-model.trim="point.lat" class="text-input" inputmode="decimal" placeholder="请输入纬度 / Y" @blur="syncManualBoosterPoints" />
                <select v-model.number="point.isBest" class="select-input" @change="syncManualBoosterPoints"><option :value="1">最优</option><option :value="0">非最优</option></select>
              </div>
              <p class="form-tip">坐标需位于场区中心点 20 公里范围内。</p>
            </div>
            <div v-else class="custom-upload-panel">
              <RadioOptionGroup v-model="boosterGeometryMode" :options="boosterGeometryOptions" name="boosterGeometryMode" />
              <Upload ref="boosterUploadRef" fileTypes="xlsx,kml,kmz,ovkml" :maxCount="1" :fileSize="5" fileSizeMessage="每个文件最大限制为5M" fileTypeMessage="请上传 xlsx、kml、kmz 或 ovkml 文件" :isImmediatelyUpload="false" :disabled="processing.booster || !hasFieldData" @upFileList="(file) => handleCustomFileUpload('booster', file)" @deleteFile="() => clearCustomUpload('booster')">
                <template #tip><span class="form-tip">中心点模式需 1 个点；封闭区域模式需 1 个闭合区域。请先填写场区坐标。</span></template>
              </Upload>
              <div class="booster-best-row"><label>是否最优</label><select v-model.number="boosterImportedIsBest" class="select-input"><option :value="1">最优</option><option :value="0">非最优</option></select></div>
              <p v-if="processing.booster" class="form-tip">正在解析并上传升压站文件…</p>
            </div>
            <p v-if="errors.booster" class="field-error">{{ errors.booster }}</p>
          </div>
          <div v-else class="auto-tip">系统将根据场区范围和风机点位自动选择升压站位置</div>
        </div>

        <div class="form-item">
          <label class="form-label">地形现场照片</label>
          <UploadBox accept=".jpg,.jpeg,.png" tip="非必填，支持 JPG、PNG 格式" @upload="handleTerrainFileUpload" @remove="clearTerrainFile" />
        </div>
      </div>

      <div class="show-more-row">
        <button type="button" class="show-more-btn" @click="showAdvanced = !showAdvanced">
          {{ showAdvanced ? '收起' : '高级参数设置' }}
          <svg viewBox="0 0 16 16" class="chevron" :class="{ up: showAdvanced }"><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" /></svg>
        </button>
      </div>

      <p v-if="submitError" class="submit-error">{{ submitError }}</p>

      <div class="footer-actions">
        <button type="button" class="btn" :disabled="submitting || anyUploadProcessing" @click="submitStep(true)">
          {{ submitting && submitMode === 'draft' ? '保存中…' : '保存草稿' }}
        </button>
        <button type="button" class="btn primary" :disabled="submitting || anyUploadProcessing" @click="submitStep(false)">
          {{ submitting && submitMode === 'next' ? '提交中…' : '下一步' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import RadioOptionGroup from '@/views/qinchuan/components/shared/RadioOptionGroup.vue'
import ReferenceBox from '@/views/qinchuan/components/shared/ReferenceBox.vue'
import UploadBox from '@/views/qinchuan/components/shared/UploadBox.vue'
import Upload from '@/components/steps/components/upload/Upload.vue'
import JSZip from 'jszip'
import * as XLSX from 'xlsx'
import { checkAreaPointData } from '@/api/modules/light/firstStep'
import { coverPoints } from '@/api/modules/base.js'
import { formatKMLFileEvent } from '@/utils/formatKMLFile'
import { useOssUpload } from '@/components/ossClient/modifytUpload'
import { PACKAGE_TYPE } from '@/views/qinchuan/js/Reportwizardmockdata'
import * as newApi from '@/api/modules/project'
import { getPageList } from '@/api/modules/project'
import { pageReport } from '@/api/modules/aiProject'
import { createZNPSReport } from '@/api/modules/report'
import { getAiProjectData } from '@/api/modules/project'

const props = defineProps({
  createProjectMode: { type: Number, default: PACKAGE_TYPE.default },
  initialProjectName: { type: String, default: '' },
  project: { type: Object, default: () => null },
})

const uniqueIdentification = computed(() => props.project?.uniqueIdentification || 'report-step-one-' + (props.project?.id || 'new'))
const emit = defineEmits(['save-draft', 'next', 'project-selected', 'map-data-updated', 'report-data-loaded'])

// ================= 💡 选择项目与报告逻辑 =================
const hasSelectedProject = ref(false)
const projectList = ref([])
const loadingProject = ref(false)
const selectedProjectId = ref(null)
const reportList = ref([])
const loadingReport = ref(false)
const selectedReportId = ref(null)
const selectedProjectInfo = ref(null)
const selectedReportInfo = ref(null)

const fetchProjects = async (keyword = '') => {
  loadingProject.value = true
  try {
    const res = await getPageList({ pageNo: 1, pageSize: 20, province: '610000', projectName: keyword })
    if (res.code === 200) projectList.value = res.data.list || []
  } catch (e) { console.error(e) } finally { loadingProject.value = false }
}
const searchProjects = (query) => fetchProjects(query)

const handleProjectChange = async (projectId) => {
  selectedReportId.value = null
  reportList.value = []
  if (!projectId) return
  loadingReport.value = true
  try {
    const res = await pageReport({
      aiProjectId: projectId, pageNo: 1, pageSize: 50, status: "COMPLETED", reportType: "FEASIBILITY_STUDY", fileName: ""
    })
    if (res.code === 200) reportList.value = res.data.list || []
  } catch (e) { console.error(e) } finally { loadingReport.value = false }
}

const handleConfirmSelect = async () => {
  if (!selectedProjectId.value || !selectedReportId.value) return
  selectedProjectInfo.value = projectList.value.find(item => item.id === selectedProjectId.value)
  selectedReportInfo.value = reportList.value.find(item => item.reportProjectId === selectedReportId.value)

  if (selectedProjectInfo.value) {
    form.projectName = selectedProjectInfo.value.projectName
    form.currentProjectCapacity = selectedProjectInfo.value.currentProjectCapacity
    form.totalProjectCapacity = selectedProjectInfo.value.currentProjectCapacity
  }

  // 💡 明确把 sxProjectId 交给父组件
  emit('project-selected', {
    ...selectedProjectInfo.value,
    sxProjectId: selectedProjectInfo.value?.id,
  })
  hasSelectedProject.value = true

  try {
    const res = await getAiProjectData(selectedProjectId.value)
    if (res.code === 200 && res.data) {
      emit('report-data-loaded', res.data)
    }
  } catch (error) {
    console.error('获取 AI 项目数据失败:', error)
  }

  setTimeout(() => syncMapDataToParent(), 0)
  ElMessage.success('项目与报告已关联')
}

// ================= 原有表单逻辑 =================
const showAdvanced = ref(false)
const submitting = ref(false)
const submitMode = ref('')
const submitError = ref('')
const fieldUploadRef = ref(null)
const fanUploadRef = ref(null)
const boosterUploadRef = ref(null)
const fieldInputMode = ref('upload')
const manualFieldPointCount = ref(1)
const manualFieldPoints = ref([{ lng: '', lat: '' }])
const boosterInputMode = ref('manual')
const boosterGeometryMode = ref('point')
const boosterPointCount = ref(1)
const manualBoosterPoints = ref([{ lng: '', lat: '', isBest: 1 }])
const boosterImportedIsBest = ref(1)
const processing = reactive({ field: false, fan: false, booster: false, terrain: false })
const anyUploadProcessing = computed(() => Object.values(processing).some(Boolean))
const ossUpload = useOssUpload()

const errors = reactive({ projectName: '', totalProjectCapacity: '', currentProjectCapacity: '', energyStorage: '', rentalUnitPrice: '', storage: '', field: '', fan: '', booster: '' })

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
  field: { files: [], points: [], polygons: [] },
  fan: { files: [], points: [], polygons: [] },
  booster: { files: [], points: [], polygons: [] },
  terrain: { files: [], points: [], polygons: [] },
})
const fanTypeRows = reactive([{ id: 1, model: '', power: '', source: '1' }])
let nextFanTypeId = 2

const storageOptions = [{ label: '自建', value: 1 }, { label: '租借', value: 2 }, { label: '不配置', value: 3 }]
const capacityProportionOptions = [{ label: '10%', value: 10 }, { label: '15%', value: 15 }, { label: '20%', value: 20 }, { label: '30%', value: 30 }]
const storageHoursOptions = [{ label: '1', value: 1 }, { label: '2', value: 2 }, { label: '4', value: 4 }]
const payTypeOptions = [{ label: '每年支付', value: 1 }, { label: '每5年支付', value: 2 }, { label: '每10年支付', value: 3 }, { label: '一次性全部支付', value: 4 }]
const fieldAreaOptions = [{ label: '引用项目数据', value: 'reference' }, { label: '自定义', value: 'custom' }]
const fieldInputModeOptions = [{ label: '批量导入', value: 'upload' }, { label: '手动录入', value: 'manual' }]
const manualFieldPointCounts = [1, 3, 4]
const boosterInputModeOptions = [{ label: '手动录入', value: 'manual' }, { label: '导入数据', value: 'upload' }]
const boosterGeometryOptions = [{ label: '中心点', value: 'point' }, { label: '封闭区域', value: 'polygon' }]
const boosterPointCounts = [1, 2]
const fanLocationOptions = [{ label: '引用项目数据', value: 'reference' }, { label: '自定义', value: 'custom' }, { label: '自动布机', value: 'auto' }]
const boosterLocationOptions = [{ label: '引用项目数据', value: 'reference' }, { label: '自定义', value: 'custom' }, { label: '自动选址', value: 'auto' }]
const fanTypeModeOptions = [{ label: '倾向', value: 'prefer' }, { label: '系统自动配机', value: 'auto' }]
const hubTypeOptions = [{ label: '倾向', value: 0 }, { label: '指定', value: 1 }]
const preferHubHeightOptions = [100, 110, 120, 130, 140, 150, 160].map(v => ({ label: `${v}m`, value: v }))

const isDistributedMode = computed(() => props.createProjectMode === PACKAGE_TYPE.distributedDefault)
const isBaseMode = computed(() => props.createProjectMode === PACKAGE_TYPE.baseDefault)

const referenceData = computed(() => {
  const project = props.project || {}
  const source = project.rawProject || project
  return {
    field: { points: toArray(source.coordinate || source.fieldArea), files: findProjectFiles(source, 'field'), polygons: [] },
    fan: { points: toArray(source.windTurbinePoints || source.devicePoints), files: findProjectFiles(source, 'fan'), polygons: toArray(source.devicePointsPlane) },
    booster: { points: toArray(source.boosterStationLocations), files: findProjectFiles(source, 'booster'), polygons: toArray(source.userBoosterStationAreaPoint) },
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

function getProjectName(project) { return project?.projectName || project?.name || '' }
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
  } catch { return [] }
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
    const typeText = [file?.fileBusinessType, file?.businessType, file?.fileType, file?.fileTypeTag].filter(Boolean).join('|')
    return aliases.some((alias) => typeText === alias || typeText.includes(alias))
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
    rows.push({ label: kind === 'field' ? '场区坐标' : '点位', value: pointLabel(point, index) })
  })
  data.files.forEach((file) => { rows.push({ label: '引用文件', value: fileLabel(file) }) })
  return rows.length ? rows : [{ label: '引用数据', value: '暂无数据' }]
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
function addFanTypeRow() { fanTypeRows.push({ id: nextFanTypeId++, model: '', power: '', source: '1' }) }
function removeFanTypeRow(index) { if (fanTypeRows.length > 1) fanTypeRows.splice(index, 1) }
function normalizeNumber(key) {
  if (form[key] === '' || form[key] === null || form[key] === undefined) return
  const value = Number(form[key])
  form[key] = Number.isFinite(value) ? value : ''
}

// ================= 原有解析函数（保持不变） =================
function parseArrayValue(value) {
  if (Array.isArray(value)) return value
  if (typeof value === 'string' && value.trim()) {
    try { return parseArrayValue(JSON.parse(value)) } catch { return [] }
  }
  if (value && typeof value === 'object') {
    if (Array.isArray(value.list)) return value.list
    if (Array.isArray(value.data)) return value.data
    if (value.data !== undefined) return parseArrayValue(value.data)
  }
  return []
}

function coordinateFromRecord(point) {
  if (Array.isArray(point)) return { longitude: Number(point[0]), latitude: Number(point[1]) }
  return {
    longitude: Number(point?.longitude ?? point?.lng ?? point?.lon ?? point?.x),
    latitude: Number(point?.latitude ?? point?.lat ?? point?.y),
  }
}

function isGeographicCoordinate(point) {
  return Number.isFinite(point.longitude) && Number.isFinite(point.latitude) &&
    Math.abs(point.longitude) <= 180 && Math.abs(point.latitude) <= 90
}

async function convertCoordinateRecords(records) {
  const normalized = records.map((item) => ({ ...item, ...coordinateFromRecord(item) }))
  if (!normalized.length || normalized.some((point) => !Number.isFinite(point.longitude) || !Number.isFinite(point.latitude))) {
    throw new Error('文件中存在无效经纬度坐标')
  }
  if (normalized.every(isGeographicCoordinate)) return normalized

  const response = await coverPoints({
    points: normalized.map((point) => ({ longitude: String(point.longitude), latitude: String(point.latitude) })),
  })
  if (Number(response?.code) !== 200) throw new Error(response?.msg || '平面坐标转换失败')
  const converted = parseArrayValue(response.data?.data ?? response.data)
  if (converted.length !== normalized.length) throw new Error('坐标转换结果数量不匹配')
  return normalized.map((point, index) => ({
    ...point,
    longitude: Number(converted[index].longitude),
    latitude: Number(converted[index].latitude),
  }))
}

function pointOnSegment(x, y, x1, y1, x2, y2) {
  const cross = (x - x1) * (y2 - y1) - (y - y1) * (x2 - x1)
  if (Math.abs(cross) > 1e-9) return false
  const dot = (x - x1) * (x - x2) + (y - y1) * (y - y2)
  return dot <= 1e-9
}

function checkPointInArea([x, y], points) {
  if (!Array.isArray(points) || points.length < 3) return false
  let inside = false
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [x1, y1] = points[j]
    const [x2, y2] = points[i]
    if (pointOnSegment(x, y, x1, y1, x2, y2)) return true
    const crosses = ((y1 > y) !== (y2 > y)) &&
      (x < ((x2 - x1) * (y - y1)) / (y2 - y1) + x1)
    if (crosses) inside = !inside
  }
  return inside
}

function distanceKm(first, second) {
  const radians = (value) => (value * Math.PI) / 180
  const lat1 = radians(first.latitude)
  const lat2 = radians(second.latitude)
  const dLat = lat2 - lat1
  const dLng = radians(second.longitude - first.longitude)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 6371.0088 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function polygonCenter(ring) {
  const points = ring.map(coordinateFromRecord).filter((point) => Number.isFinite(point.longitude) && Number.isFinite(point.latitude))
  if (points.length > 1 && points[0].longitude === points[points.length - 1].longitude && points[0].latitude === points[points.length - 1].latitude) points.pop()
  if (!points.length) return null
  let area = 0
  let xSum = 0
  let ySum = 0
  for (let i = 0; i < points.length; i++) {
    const current = points[i]
    const next = points[(i + 1) % points.length]
    const cross = current.longitude * next.latitude - next.longitude * current.latitude
    area += cross
    xSum += (current.longitude + next.longitude) * cross
    ySum += (current.latitude + next.latitude) * cross
  }
  if (Math.abs(area) < 1e-12) {
    return {
      longitude: points.reduce((sum, point) => sum + point.longitude, 0) / points.length,
      latitude: points.reduce((sum, point) => sum + point.latitude, 0) / points.length,
    }
  }
  return { longitude: xSum / (3 * area), latitude: ySum / (3 * area) }
}

function getSelectedFieldPoints() {
  const selected = getSelectedData('field')
  return Array.isArray(selected?.points) ? selected.points : []
}

function getFieldRings() {
  const groups = new Map()
  getSelectedFieldPoints().forEach((item, index) => {
    const point = coordinateFromRecord(item)
    if (!Number.isFinite(point.longitude) || !Number.isFinite(point.latitude)) return
    const key = item?.regionCode ?? 'region-1'
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push([point.longitude, point.latitude])
  })
  return Array.from(groups.values())
}

function capacityRadiusKm() {
  const capacity = Number(form.currentProjectCapacity)
  if (capacity > 100 && capacity <= 200) return 15
  if (capacity > 50 && capacity <= 100) return 10
  return 5
}

function isPointInsideCurrentField(point) {
  const target = coordinateFromRecord(point)
  if (!Number.isFinite(target.longitude) || !Number.isFinite(target.latitude)) return false
  const rings = getFieldRings().filter((ring) => ring.length >= 3)
  if (rings.length) return rings.some((ring) => checkPointInArea([target.longitude, target.latitude], ring))
  const centers = getSelectedFieldPoints().map(coordinateFromRecord).filter((item) => Number.isFinite(item.longitude) && Number.isFinite(item.latitude))
  return centers.some((center) => distanceKm(center, target) <= capacityRadiusKm())
}

function getFieldCenter() {
  const rings = getFieldRings().filter((ring) => ring.length >= 3)
  const centers = rings.map((ring) => polygonCenter(ring)).filter(Boolean)
  const points = centers.length ? centers : getSelectedFieldPoints().map(coordinateFromRecord).filter((item) => Number.isFinite(item.longitude) && Number.isFinite(item.latitude))
  if (!points.length) return null
  return {
    longitude: points.reduce((sum, point) => sum + point.longitude, 0) / points.length,
    latitude: points.reduce((sum, point) => sum + point.latitude, 0) / points.length,
  }
}

function isBoosterWithinField(point) {
  const center = getFieldCenter()
  const target = coordinateFromRecord(point)
  return Boolean(center && Number.isFinite(target.longitude) && Number.isFinite(target.latitude) && distanceKm(center, target) <= 20)
}

async function parseKmlFile(file) {
  let text = ''
  if (/\.kmz$/i.test(file.name)) {
    const zip = await JSZip.loadAsync(file)
    const entry = Object.values(zip.files).find((item) => !item.dir && /\.kml$/i.test(item.name))
    if (!entry) throw new Error('KMZ 文件中没有找到 KML 数据')
    text = await entry.async('text')
  } else {
    text = await file.text()
  }
  const parsed = formatKMLFileEvent(text)
  if (!parsed || (!parsed.pointData?.length && !parsed.polygonData?.length)) throw new Error('未解析到有效的点位或封闭区域')
  return parsed
}

function kmlPoints(parsed) {
  return (parsed.pointData || []).map((point) => ({
    ...point,
    longitude: Number(point.longitude),
    latitude: Number(point.latitude),
  }))
}

function kmlPolygons(parsed) {
  return (parsed.polygonData || []).map((ring) => (ring || []).map((pair) => ({
    longitude: Number(pair[1]),
    latitude: Number(pair[0]),
  })).filter((point) => Number.isFinite(point.longitude) && Number.isFinite(point.latitude)))
    .filter((ring) => ring.length >= 3)
}

async function parseExcelCoordinates(file) {
  const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  if (!sheet) throw new Error('Excel 文件没有可读取的工作表')
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: null })
  if (!rows.length) throw new Error('Excel 文件没有坐标数据')
  const headers = Object.keys(rows[0])
  const longitudeKey = headers.find((key) => {
    const normalized = String(key).trim().toLowerCase()
    return normalized.includes('经度') || normalized.includes('longitude') || ['lng', 'lon', 'x'].includes(normalized) || normalized.startsWith('x/')
  })
  const latitudeKey = headers.find((key) => {
    const normalized = String(key).trim().toLowerCase()
    return normalized.includes('纬度') || normalized.includes('latitude') || ['lat', 'y'].includes(normalized) || normalized.startsWith('y/')
  })
  if (!longitudeKey || !latitudeKey) throw new Error('Excel 表头需包含“经度/X”和“纬度/Y”列')
  const reserveKey = headers.find((key) => /预留|备用|reserve/i.test(String(key)))
  const bestKey = headers.find((key) => /最优|isbest/i.test(String(key)))
  const points = rows.map((row) => {
    const longitudeValue = row[longitudeKey]
    const latitudeValue = row[latitudeKey]
    if (longitudeValue === null || longitudeValue === '' || latitudeValue === null || latitudeValue === '') return null
    return {
      longitude: Number(longitudeValue),
      latitude: Number(latitudeValue),
      ...(reserveKey ? { isReserve: Number(row[reserveKey]) || 0 } : {}),
      ...(bestKey ? { isBest: Number(row[bestKey]) } : {}),
    }
  }).filter((point) => point && Number.isFinite(point.longitude) && Number.isFinite(point.latitude))
  if (!points.length) throw new Error('Excel 文件中没有有效坐标行')
  return points
}

async function uploadFileToOss(file) {
  const result = await ossUpload.uploadFile(file, sessionStorage.getItem('obsFilePath') || '')
  if (!result?.obsPath) throw new Error(result?.msg || '文件上传失败，未获得文件路径')
  const extension = file.name.includes('.') ? '.' + file.name.split('.').pop().toLowerCase() : ''
  return { fileName: file.name, filePath: result.obsPath, suffix: extension }
}

function resetLocationData(kind) {
  uploadState[kind].files = []
  uploadState[kind].points = []
  uploadState[kind].polygons = []
}

function clearCustomUpload(kind) {
  resetLocationData(kind)
  errors[kind] = ''
  if (kind === 'field') {
    resetLocationData('fan')
    resetLocationData('booster')
    fanUploadRef.value?.deleteItem?.()
    boosterUploadRef.value?.deleteItem?.()
  }
  syncMapDataToParent()
}

function setManualFieldPointCount(count) {
  manualFieldPointCount.value = count
  manualFieldPoints.value = Array.from({ length: count }, () => ({ lng: '', lat: '' }))
  syncManualFieldPoints()
}

function setBoosterPointCount(count) {
  boosterPointCount.value = count
  manualBoosterPoints.value = Array.from({ length: count }, (_, index) => ({ lng: '', lat: '', isBest: index === 0 ? 1 : 0 }))
  syncManualBoosterPoints()
}

async function syncManualFieldPoints() {
  if (fieldInputMode.value !== 'manual') return false
  const raw = manualFieldPoints.value.map((point) => ({ longitude: point.lng, latitude: point.lat, regionCode: 1 }))
  if (raw.some((point) => point.longitude === '' || point.latitude === '')) {
    uploadState.field.points = []
    uploadState.field.polygons = []
    syncMapDataToParent()
    return false
  }
  try {
    const converted = await convertCoordinateRecords(raw)
    uploadState.field.points = converted.map((point) => ({ ...point, regionCode: 1 }))
    uploadState.field.files = []
    syncMapDataToParent()
    return true
  } catch (error) {
    errors.field = error?.message || '场区坐标转换失败'
    return false
  }
}

async function syncManualBoosterPoints() {
  if (boosterInputMode.value !== 'manual') return false
  const raw = manualBoosterPoints.value.map((point) => ({ longitude: point.lng, latitude: point.lat, isBest: Number(point.isBest) }))
  if (raw.some((point) => point.longitude === '' || point.latitude === '')) {
    uploadState.booster.points = []
    uploadState.booster.polygons = []
    syncMapDataToParent()
    return false
  }
  try {
    const converted = await convertCoordinateRecords(raw)
    uploadState.booster.points = converted.map((point) => ({ lng: point.longitude, lat: point.latitude, isBest: point.isBest }))
    uploadState.booster.files = []
    syncMapDataToParent()
    return true
  } catch (error) {
    errors.booster = error?.message || '升压站坐标转换失败'
    return false
  }
}

async function processFieldFile(file) {
  const extension = file.name.split('.').pop().toLowerCase()
  let points = []
  let polygons = []
  if (extension === 'xlsx') {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('uniqueIdentification', uniqueIdentification.value)
    const response = await checkAreaPointData(formData)
    if (![200, 10030006].includes(Number(response?.code))) throw new Error(response?.msg || '场区 Excel 解析失败')
    points = parseArrayValue(response?.data?.data ?? response?.data?.list ?? response?.data)
      .map((point) => ({ ...point, regionCode: point.regionCode ?? 1 }))
    points = await convertCoordinateRecords(points)
  } else {
    const parsed = await parseKmlFile(file)
    polygons = kmlPolygons(parsed)
    if (!polygons.length) throw new Error('场区文件必须包含至少一个封闭区域')
    const flat = []
    polygons.forEach((ring, ringIndex) => ring.forEach((point) => flat.push({ ...point, regionCode: ringIndex + 1 })))
    const converted = await convertCoordinateRecords(flat)
    points = converted
    let offset = 0
    polygons = polygons.map((ring) => {
      const next = converted.slice(offset, offset + ring.length)
      offset += ring.length
      return next
    })
  }
  if (!points.length) throw new Error('场区文件中没有有效坐标')
  return { points, polygons }
}

async function processFanFile(file) {
  let points = []
  let polygons = []
  if (/\.xlsx$/i.test(file.name)) {
    points = await parseExcelCoordinates(file)
  } else {
    const parsed = await parseKmlFile(file)
    points = kmlPoints(parsed)
    polygons = kmlPolygons(parsed)
    if (!points.length && !polygons.length) throw new Error('风机文件中没有点位或封闭区域')
  }
  if (polygons.length) {
    const flat = polygons.flat()
    const converted = await convertCoordinateRecords(flat)
    let offset = 0
    polygons = polygons.map((ring) => {
      const next = converted.slice(offset, offset + ring.length)
      offset += ring.length
      return next
    })
    points = polygons.map((ring) => polygonCenter(ring)).filter(Boolean)
  } else {
    points = await convertCoordinateRecords(points)
  }
  if (!points.length) throw new Error('风机文件中没有有效点位')
  if (points.some((point) => !isPointInsideCurrentField(point))) throw new Error('风机点位不在场区范围内，请检查坐标或场区数据')
  return {
    points: points.map((point) => ({ ...point, isReserve: Number(point.isReserve) || 0 })),
    polygons: polygons.map((ring) => ring.map((point) => [point.latitude, point.longitude])),
  }
}

async function processBoosterFile(file) {
  let points = []
  let polygons = []
  if (/\.xlsx$/i.test(file.name)) {
    points = await parseExcelCoordinates(file)
  } else {
    const parsed = await parseKmlFile(file)
    points = kmlPoints(parsed)
    polygons = kmlPolygons(parsed)
  }
  const best = Number(boosterImportedIsBest.value)
  if (boosterGeometryMode.value === 'point') {
    if (points.length !== 1 || polygons.length) throw new Error('中心点模式要求文件中恰好包含 1 个点')
    points = await convertCoordinateRecords(points)
    if (!isBoosterWithinField(points[0])) throw new Error('升压站点位距离场区中心超过 20 公里')
    return { points: [{ lng: points[0].longitude, lat: points[0].latitude, isBest: best }], polygons: [] }
  }
  let ring = []
  if (polygons.length) {
    if (polygons.length !== 1 || points.length) throw new Error('封闭区域模式要求文件中恰好包含 1 个封闭区域')
    ring = polygons[0]
  } else if (points.length >= 3) {
    ring = points
  } else {
    throw new Error('封闭区域模式至少需要 3 个坐标点')
  }
  ring = await convertCoordinateRecords(ring)
  const center = polygonCenter(ring)
  if (!center || !isBoosterWithinField(center)) throw new Error('升压站区域中心距离场区中心超过 20 公里')
  return {
    points: [{ lng: center.longitude, lat: center.latitude, isBest: best }],
    polygons: [{ isBest: best, boosterStationPointList: ring.map((point) => ({ lng: point.longitude, lat: point.latitude })) }],
  }
}

async function handleCustomFileUpload(kind, file) {
  if (!file) return
  if (kind !== 'field' && !getSelectedFieldPoints().length) {
    errors[kind] = '请先提供场区坐标，再导入点位文件'
    ElMessage.error(errors[kind])
    return
  }
  processing[kind] = true
  errors[kind] = ''
  resetLocationData(kind)
  try {
    let result
    if (kind === 'field') result = await processFieldFile(file)
    else if (kind === 'fan') result = await processFanFile(file)
    else result = await processBoosterFile(file)
    const fileInfo = await uploadFileToOss(file)
    uploadState[kind].points = result.points
    uploadState[kind].polygons = result.polygons || []
    uploadState[kind].files = [fileInfo]
    syncMapDataToParent()
    ElMessage.success('文件解析并上传成功')
  } catch (error) {
    resetLocationData(kind)
    errors[kind] = error?.message || '文件解析失败，请检查文件内容后重试'
    ElMessage.error(errors[kind])
    syncMapDataToParent()
  } finally {
    processing[kind] = false
  }
}

async function handleTerrainFileUpload(file) {
  if (!file) return
  processing.terrain = true
  try {
    uploadState.terrain.files = [await uploadFileToOss(file)]
    ElMessage.success('地形照片上传成功')
  } catch (error) {
    uploadState.terrain.files = []
    submitError.value = error?.message || '地形照片上传失败'
    ElMessage.error(submitError.value)
  } finally {
    processing.terrain = false
  }
}

function clearTerrainFile() {
  uploadState.terrain.files = []
}

// ... 其他代码保持不变，只替换 syncMapDataToParent 和 onMounted 部分
const syncMapDataToParent = () => {
  if (!hasSelectedProject.value) return
  
  const field = getSelectedData('field')
  const fan = getSelectedData('fan')
  const booster = getSelectedData('booster')

  const coordinate = (field.points || []).map(p => {
    const c = coordinateFromRecord(p)
    return { longitude: c.longitude, latitude: c.latitude, regionCode: p.regionCode || 1 }
  }).filter(p => Number.isFinite(p.longitude) && Number.isFinite(p.latitude))

  const windTurbinePoints = (fan.points || []).map(p => {
    const c = coordinateFromRecord(p)
    return { longitude: c.longitude, latitude: c.latitude, isReserve: Number(p.isReserve) || 0 }
  }).filter(p => Number.isFinite(p.longitude) && Number.isFinite(p.latitude))

  const boosterStationLocations = (booster.points || []).map(p => {
    const c = coordinateFromRecord(p)
    return { lng: c.longitude, lat: c.latitude, isBest: p.isBest ?? 1 }
  }).filter(p => Number.isFinite(p.lng) && Number.isFinite(p.lat))

  // 💡 增加调试日志，按 F12 看看有没有打印出来
  console.log('【StepOne 抛出地图数据】', {
    场区点数: coordinate.length,
    风机点数: windTurbinePoints.length,
    升压站点数: boosterStationLocations.length,
    风机数据: windTurbinePoints
  })

  emit('map-data-updated', { coordinate, windTurbinePoints, boosterStationLocations })
}

watch(() => [form.fieldAreaSource, form.fanLocationSource, form.boosterLocationSource], () => syncMapDataToParent())
watch(() => uploadState, () => syncMapDataToParent(), { deep: true })

onMounted(() => {
  if (props.project?.id) {
    hasSelectedProject.value = true
    form.projectName = props.project.projectName || ''
    form.currentProjectCapacity = props.project.currentProjectCapacity || ''
    emit('project-selected', props.project)
    // 延迟触发，确保 props.project 赋值完成
    setTimeout(() => syncMapDataToParent(), 300)
  } else {
    fetchProjects()
  }
})


// ================= 工具函数与提交 =================
function clearErrors() { Object.keys(errors).forEach((key) => { errors[key] = '' }); submitError.value = '' }

function validateForm() {
  clearErrors()
  let valid = true
  if (!form.projectName || form.projectName.length < 2) { errors.projectName = '请输入至少2个字符的项目名称'; valid = false }
  const total = Number(form.totalProjectCapacity)
  const current = Number(form.currentProjectCapacity)
  if (!isDistributedMode.value) {
    if (!Number.isFinite(total)) { errors.totalProjectCapacity = '请输入总规划装机容量'; valid = false }
    else {
      const [min, max] = isBaseMode.value ? [200, 500] : [30, 200]
      if (total < min || total > max) {
        errors.totalProjectCapacity = `总规划装机容量范围为${min}~${max}MW`
        valid = false
      }
    }
  }
  if (!Number.isFinite(current)) { errors.currentProjectCapacity = '请输入本期规划装机容量'; valid = false }
  else {
    const [min, max] = isDistributedMode.value ? [5, 40] : isBaseMode.value ? [200, 500] : [30, 200]
    if (current < min || current > max) { errors.currentProjectCapacity = `本期规划装机容量范围为${min}~${max}MW`; valid = false }
    if (!isDistributedMode.value && Number.isFinite(total) && current > total) { errors.currentProjectCapacity = '本期装机容量不能大于总装机容量'; valid = false }
  }
  if (![1, 2, 3].includes(Number(form.energyStorage))) { errors.energyStorage = '请选择储能系统配置方式'; valid = false }
  if (form.energyStorage === 2) {
    if (!Number.isFinite(Number(form.rentalUnitPrice))) { errors.rentalUnitPrice = '请输入租借单价'; valid = false }
    if (!form.rentalPayType) { errors.rentalUnitPrice = errors.rentalUnitPrice || '请选择费用支付方式'; valid = false }
  }
  if (form.energyStorage === 1 || form.energyStorage === 2) { if (!form.capacityProportion || !form.storageHours) { errors.storage = '请选择配置容量比例和储电小时'; valid = false } }
  if (form.fieldAreaSource === 'reference' && !hasReferenceData('field')) { errors.field = '该项目目前没有场区范围数据，请手动上传'; valid = false }
  if (form.fieldAreaSource === 'custom') {
    if (fieldInputMode.value === 'manual') {
      const complete = manualFieldPoints.value.every((point) => point.lng !== '' && point.lat !== '')
      if (!complete || !uploadState.field.points.length) { errors.field = '请完整录入场区坐标'; valid = false }
    } else if (!uploadState.field.points.length || !uploadState.field.files.length) { errors.field = '请上传并解析场区范围文件'; valid = false }
  }
  if (form.fanLocationSource === 'reference' && !hasReferenceData('fan')) { errors.fan = '该项目目前没有风机点位数据，请手动上传'; valid = false }
  if (form.fanLocationSource === 'custom') {
    if (!uploadState.fan.points.length || !uploadState.fan.files.length) { errors.fan = '请上传并解析风机点位文件'; valid = false }
    else if (uploadState.fan.points.some((point) => !isPointInsideCurrentField(point))) { errors.fan = '风机点位不在场区范围内，请检查坐标'; valid = false }
  }
  if (!isDistributedMode.value && form.boosterLocationSource === 'reference' && !hasReferenceData('booster')) { errors.booster = '该项目目前没有升压站点位数据，请手动上传'; valid = false }
  if (!isDistributedMode.value && form.boosterLocationSource === 'custom') {
    if (!uploadState.booster.points.length) { errors.booster = boosterInputMode.value === 'manual' ? '请完整录入升压站坐标' : '请上传并解析升压站点位文件'; valid = false }
    else {
      const bestCount = uploadState.booster.points.filter((point) => Number(point.isBest) === 1).length
      const pointKeys = uploadState.booster.points.map((point) => { const value = coordinateFromRecord(point); return value.longitude.toFixed(8) + ',' + value.latitude.toFixed(8) })
      if (new Set(pointKeys).size !== pointKeys.length) { errors.booster = '升压站点位存在重复，请重新录入'; valid = false }
      else if (bestCount !== 1) { errors.booster = '请且仅选择一个最优升压站点位'; valid = false }
      else if (uploadState.booster.points.some((point) => !isBoosterWithinField(point))) { errors.booster = '升压站点位距离场区中心超过 20 公里'; valid = false }
      if (boosterInputMode.value === 'upload' && !uploadState.booster.files.length) { errors.booster = '请重新上传升压站文件'; valid = false }
    }
  }
  if (form.hubType === 1 && (!form.preferHubHeight || Number(form.preferHubHeight) < 115)) { submitError.value = '指定轮毂高度不能低于115m'; valid = false }
  return valid
}

function getSelectedData(kind) {
  if (kind === 'field') { if (form.fieldAreaSource === 'reference') return referenceData.value.field; return uploadState.field }
  if (kind === 'fan') { if (form.fanLocationSource === 'reference') return referenceData.value.fan; if (form.fanLocationSource === 'auto') return { points: [], files: [], polygons: [] }; return uploadState.fan }
  if (form.boosterLocationSource === 'reference') return referenceData.value.booster
  if (form.boosterLocationSource === 'auto') return { points: [], files: [], polygons: [] }
  return uploadState.booster
}

const hasFieldData = computed(() => getSelectedFieldPoints().length > 0)

function serialize(value) { return JSON.stringify(Array.isArray(value) ? value : value || []) }
function normalizeItemType() { const mode = Number(props.createProjectMode); if (Number.isFinite(mode) && mode > 0) return mode; return props.project?.itemType === 'FD' ? 1 : 2 }
function buildPreferDeviceCodes() { if (form.fanTypeMode === 'auto') return ''; return fanTypeRows.filter((row) => row.model || row.power).map((row) => `${row.model},${row.power},${row.source}`).join(';') }
function toProjectId(value) { if (value === '' || value === null || value === undefined) return 0; const id = Number(value); return Number.isFinite(id) ? id : 0 }

function buildPayload(isDraft) {
  const field = getSelectedData('field')
  const fan = getSelectedData('fan')
  const booster = getSelectedData('booster')
  const project = props.project || {}
  const fieldFiles = field.files || []
  const fanFiles = fan.files || []
  const boosterFiles = booster.files || []

  const editProjectWindReqDTO = {
    projectCode: project.projectCode || project.code,
    projectName: form.projectName,
    itemType: normalizeItemType(),
    step: 1, isDraft,
    projectAdjustFlag: Boolean(project.id), projectAdjustOneStepFlag: true,
    uniqueIdentification: uniqueIdentification.value,
    totalProjectCapacity: isDistributedMode.value ? Number(form.currentProjectCapacity) : Number(form.totalProjectCapacity),
    currentProjectCapacity: Number(form.currentProjectCapacity),
    energyStorage: Number(form.energyStorage), collocationMethod: Number(form.energyStorage),
    rentalUnitPrice: form.energyStorage === 2 ? Number(form.rentalUnitPrice) : 0,
    rentalPayType: form.energyStorage === 2 ? Number(form.rentalPayType) : undefined,
    capacityProportion: form.energyStorage !== 3 ? Number(form.capacityProportion) : 0,
    storageHours: form.energyStorage !== 3 ? Number(form.storageHours) : 0,
    coordinate: serialize(field.points),
    regionFilePath: serialize(fieldFiles),
    isHaveDevicePoints: form.fanLocationSource === 'auto' ? 0 : fan.points.length || fanFiles.length ? 1 : 0,
    devicePoints: serialize(fan.points || []),
    devicePointsPlane: serialize(fan.polygons || []),
    deviceWindFilePath: serialize(fanFiles),
    boosterStationLocations: serialize(booster.points || []),
    userBoosterStationAreaPoint: serialize(booster.polygons || []),
    boosterStationFilePath: serialize(boosterFiles),
    preferDeviceCodes: buildPreferDeviceCodes(), hubType: Number(form.hubType),
    preferHubHeight: Number(form.preferHubHeight) || undefined,
    isTerrainImage: uploadState.terrain.files.length ? 1 : 0, terrainImageFile: serialize(uploadState.terrain.files),
  }
  if (form.boosterLocationSource === 'auto') { editProjectWindReqDTO.boosterStationLocations = '[]'; editProjectWindReqDTO.userBoosterStationAreaPoint = '[]'; editProjectWindReqDTO.boosterStationFilePath = '[]' }
  
  return { editProjectWindReqDTO: removeUndefined(editProjectWindReqDTO), sxProjectId: toProjectId(project.sxProjectId ?? project.id) }
}

function removeUndefined(object) { return Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined)) }
function extractSavedProjectId(response) {
  const candidates = [response?.data?.id, response?.data?.projectId, response?.data?.editProjectWindReqDTO?.id, response?.result?.id, response?.id, response?.data]
  const id = candidates.find((value) => { if (value === '' || value === null || value === undefined) return false; return /^\d+$/.test(String(value)) })
  return id === undefined ? null : String(id)
}

async function submitStep(isDraft) {
  submitError.value = ''
  if (anyUploadProcessing.value) { submitError.value = '文件仍在解析或上传中，请稍候再提交'; return }
  if (form.fieldAreaSource === 'custom' && fieldInputMode.value === 'manual') await syncManualFieldPoints()
  if (!isDistributedMode.value && form.boosterLocationSource === 'custom' && boosterInputMode.value === 'manual') await syncManualBoosterPoints()

  if (!isDraft && !validateForm()) { submitError.value = '请先完善页面中标红的必填项，再进入下一步'; return }
  if (isDraft) clearErrors()

  submitting.value = true
  submitMode.value = isDraft ? 'draft' : 'next'
  submitError.value = ''
  const payload = buildPayload(isDraft)
  console.log(payload,"ddddddddddddddddddddddddddddddddddddddddddddddddddddddddd")

  try {
    const response = await newApi.saveUpdateProject(payload)
    if (response?.code !== undefined && response.code !== 200) { throw new Error(response.msg || '项目保存失败') }
    const savedProjectId = extractSavedProjectId(response)

    if (!isDraft && selectedProjectId.value && selectedReportId.value) {
      if (!savedProjectId) throw new Error('未获取到保存后的项目ID')
      const znpsRes = await createZNPSReport({ aiProjectId: Number(selectedProjectId.value), originalProjectId: String(selectedReportInfo.value.reportProjectId), reviewProjectId: String(savedProjectId) })
      if (znpsRes?.code !== undefined && znpsRes.code !== 200) throw new Error(znpsRes.msg || '生成智能评审报告失败')
    }

    const result = { form: { ...form, fanTypeRows: fanTypeRows.map((row) => ({ ...row })) }, request: payload, response, savedProjectId, project: savedProjectId ? { ...(props.project || {}), id: savedProjectId } : props.project }
    if (isDraft) emit('save-draft', result)
    else emit('next', result)
  } catch (error) {
    console.error('保存失败:', error)
    submitError.value = error?.message || '保存失败，请稍后重试'
  } finally { submitting.value = false; submitMode.value = '' }
}

onMounted(() => {
  if (props.project?.id) {
    hasSelectedProject.value = true
    form.projectName = props.project.projectName || ''
    form.currentProjectCapacity = props.project.currentProjectCapacity || ''
    emit('project-selected', props.project)
    setTimeout(() => syncMapDataToParent(), 0)
  } else {
    fetchProjects()
  }
})
</script>

<style scoped>
/* 你的所有样式保持原样 */
.step-one { padding-bottom: 20px; }
.project-selector-area { padding: 20px 0; }
.form-tip { color: #909399; font-size: 12px; line-height: 1.5; margin-top: 8px; }
.action-btns { text-align: right; margin-top: 10px; }
.selected-header { display: flex; justify-content: space-between; align-items: center; background-color: #f0f7ff; padding: 10px 16px; border-radius: 4px; margin-bottom: 20px; }
.selected-header .label { color: #606266; font-size: 14px; }
.selected-header .value { color: #2f8dff; font-weight: 600; font-size: 15px; }
.form-item { margin-bottom: 18px; }
.form-item.sub-item { margin-top: -8px; padding-left: 0; }
.form-label { display: block; margin-bottom: 8px; color: #1f2937; font-size: 13px; }
.form-label.required::before { content: '*'; margin-right: 3px; color: #ff6b6b; }
.sub-label { margin-top: 14px; }
.text-input, .select-input { box-sizing: border-box; height: 36px; border: 1px solid #d1d5db; border-radius: 4px; outline: none; background: #fff; font-size: 13px; }
.text-input { width: 100%; padding: 0 12px; }
.text-input:focus, .select-input:focus { border-color: #2f8dff; }
.input-with-suffix { position: relative; }
.input-with-suffix .suffix { position: absolute; top: 50%; right: 12px; color: #1f2937; font-size: 12px; font-weight: 600; transform: translateY(-50%); }
.short-input { width: 280px; }
.short-input .text-input { padding-right: 100px; }
.storage-ratio-row { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; color: #374151; font-size: 13px; }
.select-input { min-width: 108px; padding: 0 8px; }
.payment-select, .hub-height-select { width: 190px; }
.select-input:disabled { cursor: not-allowed; background: #f5f6f8; }
.reference-wrap, .upload-wrap, .auto-tip { margin-top: 10px; padding: 10px 12px; border-radius: 3px; background: #fafafa; }
.reference-empty, .auto-tip { color: #9ca3af; font-size: 12px; line-height: 1.6; }
.advanced-block { animation: show-advanced 0.18s ease-out; }
.fan-type-box { margin-top: 10px; padding: 8px; border: 1px solid #edf0f4; border-radius: 4px; background: #fafbfc; }
.fan-type-head, .fan-type-row { display: grid; grid-template-columns: minmax(90px, 1fr) minmax(70px, 0.8fr) minmax(62px, 0.7fr) 22px; align-items: center; gap: 6px; }
.fan-type-head { padding: 0 2px 6px; color: #9ca3af; font-size: 11px; }
.fan-type-row + .fan-type-row { margin-top: 6px; }
.table-input { box-sizing: border-box; width: 100%; height: 30px; padding: 0 6px; border: 1px solid #d7dce3; border-radius: 3px; outline: none; color: #374151; background: #fff; font-size: 11px; }
.icon-add, .row-remove { border: none; cursor: pointer; color: #2f8dff; background: transparent; font-size: 18px; line-height: 1; }
.row-remove { color: #9ca3af; }
.divider { height: 1px; margin: 20px 0; background: #eef0f3; }
.show-more-row { display: flex; justify-content: center; margin: 8px 0 20px; }
.show-more-btn { display: inline-flex; align-items: center; gap: 4px; padding: 8px 18px; border: 1px solid #2f8dff; border-radius: 0; cursor: pointer; color: #2f8dff; background: #fff; font-size: 12.5px; }
.chevron { width: 12px; height: 12px; transition: transform 0.2s; }
.chevron.up { transform: rotate(180deg); }
.field-error, .submit-error { margin: 6px 0 0; color: #f04444; font-size: 12px; line-height: 1.5; }
.submit-error { margin-bottom: 12px; text-align: center; }
.custom-location-wrap { display: flex; flex-direction: column; gap: 10px; }
.custom-upload-panel, .manual-coordinate-panel { width: 100%; }
.point-count-row, .booster-best-row { display: flex; align-items: center; gap: 8px; margin: 8px 0; color: #606266; font-size: 12px; }
.point-count-btn { width: 28px; height: 26px; border: 1px solid #d1d5db; border-radius: 3px; color: #606266; background: #fff; cursor: pointer; }
.point-count-btn.active { border-color: #2f8dff; color: #2f8dff; background: #f2f8ff; }
.custom-coordinate-row { display: grid; grid-template-columns: 22px minmax(0, 1fr) minmax(0, 1fr); gap: 8px; align-items: center; margin: 8px 0; }
.booster-coordinate-row { grid-template-columns: 22px minmax(0, 1fr) minmax(0, 1fr) 96px; }
.coordinate-index { color: #909399; font-size: 12px; text-align: center; }
.custom-coordinate-row .text-input { min-width: 0; }
.booster-best-row { margin-top: 12px; }
.form-tip { color: #909399; font-size: 12px; line-height: 1.6; }
@media (max-width: 600px) { .booster-coordinate-row { grid-template-columns: 22px minmax(0, 1fr) minmax(0, 1fr); } .booster-coordinate-row .select-input { grid-column: 2 / 4; width: 100%; } }
.footer-actions { display: flex; justify-content: center; gap: 12px; margin-top: 24px; }
.btn { min-width: 100px; padding: 9px 20px; border: 1px solid #d1d5db; border-radius: 20px; cursor: pointer; color: #374151; background: #fff; font-size: 13px; }
.btn.primary { min-width: 154px; border-color: #2f8dff; color: #fff; background: #2f8dff; }
.btn:disabled { cursor: not-allowed; opacity: 0.6; }
@keyframes show-advanced { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
</style>