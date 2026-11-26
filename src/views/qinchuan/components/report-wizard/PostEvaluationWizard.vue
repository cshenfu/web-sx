<template>
  <div class="post-evaluation-wizard">
    <aside class="left-panel" :class="{ collapsed: isCollapsed }">
      <header v-show="!isCollapsed" class="panel-header">
        <div class="header-title">
          <el-icon class="back-icon" @click="$emit('close')"><Back /></el-icon>
          <span>一键生成后评价报告</span>
        </div>
      </header>

      <el-scrollbar v-show="!isCollapsed" class="panel-scroll">
        <div class="form-content">
          <section class="form-section project-section">
            <el-form label-position="right" label-width="128px">
              <el-form-item label="项目可研报告" required>
                <el-select
                  v-model="selectedProjectId"
                  filterable
                  remote
                  reserve-keyword
                  clearable
                  :remote-method="searchProjects"
                  :loading="loadingProjects"
                  placeholder="请选择项目"
                  style="width: 100%"
                  @change="handleProjectChange"
                >
                  <el-option
                    v-for="item in projectOptions"
                    :key="item.id"
                    :label="item.projectName || item.name"
                    :value="String(item.id)"
                  />
                </el-select>
              </el-form-item>
            </el-form>
          </section>

          <section class="form-section">
            <h3 class="section-title">设备运行数据</h3>
            <PostEvaluationUpload
              label="竣工结算报告"
              field-key="completionSettlement"
               :validation-message="uploads.completionSettlement?.validationMessage"
              :validation-status="uploads.completionSettlement?.validationStatus"
              :file="uploads.completionSettlement"
              @select="(file) => handleSingleFile('completionSettlement', file)"
              @remove="removeUpload('completionSettlement')"
              @template-download="handleTemplateDownload('completionSettlement')"
            />
            <p class="section-notice">说明：下面各项运行数据需满足至少1年时长，Scada时长需满足满发电量的时间周期</p>
            <PostEvaluationUpload
              label="区间发电量"
              field-key="intervalGeneration"
              hint-text="支持 xlsx 格式数据（从生产运行平台导出该场区月度发电量）"
              :validation-message="uploads.intervalGeneration?.validationMessage"
              :validation-status="uploads.intervalGeneration?.validationStatus"
              :file="uploads.intervalGeneration"
              @select="(file) => handleSingleFile('intervalGeneration', file)"
              @remove="removeUpload('intervalGeneration')"
              @template-download="handleTemplateDownload('intervalGeneration')"
            />
            <PostEvaluationUpload
              label="Scada风机坐标对照表"
              field-key="scadaCoordinate"
              :validation-message="uploads.scadaCoordinate?.validationMessage"
              :validation-status="uploads.scadaCoordinate?.validationStatus"
              :file="uploads.scadaCoordinate"
              @select="(file) => handleSingleFile('scadaCoordinate', file)"
              @remove="removeUpload('scadaCoordinate')"
              @template-download="handleTemplateDownload('scadaCoordinate')"
            />
            <div class="upload-row folder-row">
              <label class="upload-label required">各风机Scada风速和发电量数据</label>
              <div class="upload-stack">
                <PostEvaluationUpload
                  directory
                  accept=".xlsx,.xls,.csv"
                  :loading="folderUploading"
                  :files="folderFiles"
                  @select="handleFolderChange"
                  @remove="clearFolder"
                  :show-hint="false"
                >
                  <template #hint>
                    选择数据文件目录，需包含该风电场所有风机逐10分钟的风速及发电量时序数据，查看
                    <a class="template-link" href="#" @click.prevent="showScadaExample = true">文件示意</a>
                  </template>
                </PostEvaluationUpload>
                <div v-if="folderFiles.length" class="folder-summary">
                  {{ folderSummary }}
                  <el-button link type="primary" @click="showFolderDetails = !showFolderDetails">
                    {{ showFolderDetails ? '收起详情' : '查看详情' }}
                  </el-button>
                </div>
                <div v-if="showFolderDetails && folderFiles.length" class="folder-details">
                  <div v-for="item in folderFiles" :key="item.relativePath" class="folder-file">
                    <span class="file-name">{{ item.relativePath }}</span>
                    <el-tag size="small" :type="item.inspectStatus === 'success' ? 'success' : item.inspectStatus === 'warning' ? 'warning' : 'info'">
                      {{ item.inspectMessage }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </div>
            <div class="form-row fan-model-row">
              <label class="upload-label required">风机型号</label>
              <div class="paired-fields model-fields">
              <el-select v-model="form.turbineModelType" class="model-type-select">
                <el-option label="平台机型库" value="platform" />
                <el-option label="自定义型号" value="custom" />
              </el-select>
              <el-select
                v-if="form.turbineModelType === 'platform'"
                v-model="form.turbineModel"
                filterable
                allow-create
                default-first-option
                placeholder="请选择"
                class="model-value-select"
              >
                <el-option v-for="item in turbineModelOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
              <el-input v-else v-model="form.turbineModel" placeholder="请输入风机型号" class="model-value-select" />
              </div>
            </div>
            <div class="form-row capacity-row">
              <label class="upload-label">建设容量</label>
              <el-input :model-value="buildCapacity" disabled placeholder="系统自动计算" class="capacity-input">
                <template #append>MW</template>
              </el-input>
              <p class="field-tip">系统根据风机坐标数量及所选风机型号的单机容量自动计算，不可手动修改</p>
            </div>
            <div class="form-row k-value-row">
              <label class="upload-label required">机组保证K值</label>
              <div class="paired-fields k-value-control">
                <el-select v-model="form.kOperator" class="operator-select">
                  <el-option label="大于（>）" value=">" />
                  <el-option label="大于等于（≥）" value=">=" />
                </el-select>
                <el-input v-model="form.kValue" inputmode="decimal" placeholder="请输入数值">
                  <template #append>%</template>
                </el-input>
              </div>
              <p class="field-tip">说明：保证K值 = 折算发电量 / 保证发电量</p>
            </div>
          </section>

          <section class="form-section">
            <h3 class="section-title">项目经营数据</h3>
            <PostEvaluationUpload
              label="项目资本金投入表"
              field-key="capitalContribution"
              :validation-message="uploads.capitalContribution?.validationMessage"
              :validation-status="uploads.capitalContribution?.validationStatus"
              :file="uploads.capitalContribution"
              @select="(file) => handleSingleFile('capitalContribution', file)"
              @remove="removeUpload('capitalContribution')"
              @template-download="handleTemplateDownload('capitalContribution')"
            />
            <PostEvaluationUpload
              label="项目主要经营数据表（来源财务报表）"
              field-key="operationData"
              :validation-message="uploads.operationData?.validationMessage"
              :validation-status="uploads.operationData?.validationStatus"
              :file="uploads.operationData"
              @select="(file) => handleSingleFile('operationData', file)"
              @remove="removeUpload('operationData')"
              @template-download="handleTemplateDownload('operationData')"
            />
            <PostEvaluationUpload
              label="项目总成本费用对比表（来源财务报表）"
              field-key="costComparison"
              :validation-message="uploads.costComparison?.validationMessage"
              :validation-status="uploads.costComparison?.validationStatus"
              :file="uploads.costComparison"
              @select="(file) => handleSingleFile('costComparison', file)"
              @remove="removeUpload('costComparison')"
              @template-download="handleTemplateDownload('costComparison')"
            />
            <PostEvaluationUpload
              label="项目日电量电价表（来源财务报表）"
              field-key="dailyPowerFinance"
              :validation-message="uploads.dailyPowerFinance?.validationMessage"
              :validation-status="uploads.dailyPowerFinance?.validationStatus"
              :file="uploads.dailyPowerFinance"
              @select="(file) => handleSingleFile('dailyPowerFinance', file)"
              @remove="removeUpload('dailyPowerFinance')"
              @template-download="handleTemplateDownload('dailyPowerFinance')"
            />
            <PostEvaluationUpload
              label="项目日电量电价表（来源市场部）"
              field-key="dailyPowerMarket"
              :validation-message="uploads.dailyPowerMarket?.validationMessage"
              :validation-status="uploads.dailyPowerMarket?.validationStatus"
              :file="uploads.dailyPowerMarket"
              @select="(file) => handleSingleFile('dailyPowerMarket', file)"
              @remove="removeUpload('dailyPowerMarket')"
              @template-download="handleTemplateDownload('dailyPowerMarket')"
            />
            <PostEvaluationUpload
              label="财务评价基础数据表"
              field-key="financialBasicData"
              hint-text="支持 xlsx 格式数据"
              :validation-message="uploads.financialBasicData?.validationMessage"
              :validation-status="uploads.financialBasicData?.validationStatus"
              :file="uploads.financialBasicData"
              @select="(file) => handleSingleFile('financialBasicData', file)"
              @remove="removeUpload('financialBasicData')"
              @template-download="handleTemplateDownload('financialBasicData')"
            />
            <PostEvaluationUpload
              label="贷款信息"
              field-key="loanInfo"
              :validation-message="uploads.loanInfo?.validationMessage"
              :validation-status="uploads.loanInfo?.validationStatus"
              :file="uploads.loanInfo"
              @select="(file) => handleSingleFile('loanInfo', file)"
              @remove="removeUpload('loanInfo')"
              @template-download="handleTemplateDownload('loanInfo')"
            />
          </section>
          <div class="generate-action">
            <el-button type="primary" size="large" :loading="submitting" @click="handleStart">开始生成</el-button>
          </div>
        </div>
      </el-scrollbar>

      <el-dialog v-model="showScadaExample" title="SCADA 数据文件示意" width="620px" append-to-body>
        <div class="scada-example">
          <div class="example-folder"><el-icon><FolderOpened /></el-icon><span>风电场 SCADA 数据目录</span></div>
          <div class="example-file" v-for="name in scadaExampleFiles" :key="name">
            <el-icon><Document /></el-icon><span>{{ name }}</span><el-tag size="small" type="success">示例文件</el-tag>
          </div>
          <p>示意：目录中应包含该风电场各台风机的逐 10 分钟风速及发电量时序数据文件。实际目录和文件命名以项目数据为准。</p>
        </div>
      </el-dialog>

      <button class="collapse-trigger" type="button" @click="toggleCollapse">
        <el-icon><ArrowLeft v-if="!isCollapsed" /><ArrowRight v-else /></el-icon>
      </button>
    </aside>

    <main class="map-area">
      <MapGL
        ref="mapRef"
        :is-dashboard="false"
        :fly-to-on-load="false"
        :view-controls="true"
        view-controls-position="bottom-left"
        :style="satelliteStyle"
        @ready="onMapReady"
      />
      <div v-if="!selectedProjectId" class="map-empty-tip">
        <el-icon><Location /></el-icon>
        <span>请选择项目，地图将展示项目场区范围及风机位置</span>
      </div>
      <div v-else-if="!hasMapGeometry" class="map-empty-tip">
        <el-icon><InfoFilled /></el-icon>
        <span>当前项目暂无可展示的场区范围或风机坐标数据</span>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowLeft, ArrowRight, Back, Document, FolderOpened, InfoFilled, Location } from '@element-plus/icons-vue'
import PostEvaluationUpload from './PostEvaluationUpload.vue'
import MapGL from '@/components/MapGL.vue'
import fengjiIcon from '@/assets/img/mapIcon/fengji.png'
import { ICON_SIZE_WIND } from '@/components/site-map/iconSize.js'
import { satelliteStyle } from '../../js/mapConfig'
import { getPageList } from '@/api/modules/project'
import { useOssUpload } from '@/components/ossClient/index'
import { validatePostEvaluationFile, validateScadaFolder, readExcel } from './postEvaluationValidator'
import {
  POST_EVALUATION_UPLOAD_KEYS,
  POST_EVALUATION_TURBINE_MODELS,
  POST_EVALUATION_SCADA_EXAMPLE_FILES,
  POST_EVALUATION_TEMPLATE_FILES,
} from './postEvaluationConfig'

const props = defineProps({
  project: { type: Object, default: null },
})
const emit = defineEmits(['close', 'submit'])
const ossUpload = useOssUpload()

const projectOptions = ref([])
const loadingProjects = ref(false)
const selectedProjectId = ref('')
const selectedProject = ref(null)
const isCollapsed = ref(false)
const mapRef = ref(null)
const submitting = ref(false)
const folderUploading = ref(false)
const folderFiles = ref([])
const showFolderDetails = ref(false)
const showScadaExample = ref(false)
const fileValidation = reactive({})
const intervalMonths = ref([])
const scadaExampleFiles = POST_EVALUATION_SCADA_EXAMPLE_FILES
const turbineModelOptions = POST_EVALUATION_TURBINE_MODELS
const form = reactive({ turbineModelType: 'platform', turbineModel: '', kOperator: '>', kValue: '98' })

const uploadKeys = POST_EVALUATION_UPLOAD_KEYS
const uploads = reactive(Object.fromEntries(uploadKeys.map(key => [key, null])))

const hasMapGeometry = computed(() => {
  const p = selectedProject.value || {}
  return Boolean(
    (p.coordinate || p.rawProject?.coordinate || []).length ||
    (p.windTurbinePoints || p.rawProject?.windTurbinePoints || []).length
  )
})
const buildCapacity = computed(() => {
  const project = selectedProject.value || {}
  const fans = project.windTurbinePoints || project.rawProject?.windTurbinePoints || []
  const model = turbineModelOptions.find(item => item.value === form.turbineModel)
  if (!fans.length || !model) return ''
  const value = fans.length * model.capacity
  return Number.isInteger(value) ? String(value) : value.toFixed(2)
})
const folderSummary = computed(() => {
  const ok = folderFiles.value.filter(item => item.inspectStatus === 'success').length
  const warning = folderFiles.value.filter(item => item.inspectStatus !== 'success').length
  return `${ok} 个文件已读取，${warning} 个文件待确认`
})

watch(() => props.project, value => {
  if (!value) return
  const id = value.id ?? value.aiProjectId
  if (id !== undefined && id !== null) {
    selectedProjectId.value = String(id)
    selectedProject.value = value
    renderProjectOnMap()
  }
}, { immediate: true, deep: true })

onMounted(() => searchProjects(''))

async function searchProjects(keyword = '') {
  loadingProjects.value = true
  try {
    const res = await getPageList({ pageNo: 1, pageSize: 50, province: '610000', projectName: keyword })
    if (res?.code === 200) {
      projectOptions.value = res.data?.list || []
      if (selectedProject.value && !projectOptions.value.some(item => String(item.id) === String(selectedProjectId.value))) {
        projectOptions.value.unshift(selectedProject.value)
      }
    }
  } catch (error) {
    console.error('[后评价] 获取项目列表失败:', error)
    ElMessage.error('项目列表加载失败')
  } finally {
    loadingProjects.value = false
  }
}

function handleProjectChange(id) {
  selectedProject.value = projectOptions.value.find(item => String(item.id) === String(id)) || null
  renderProjectOnMap()
}

function onMapReady() {
  renderProjectOnMap()
}

function renderProjectOnMap() {
  const map = mapRef.value
  if (!map || !selectedProject.value) return
  const project = selectedProject.value
  const coordinates = project.coordinate || project.rawProject?.coordinate || []
  const fans = project.windTurbinePoints || project.rawProject?.windTurbinePoints || []
  map.removeLayer?.('post-evaluation-boundary')
  map.removeLayer?.('post-evaluation-fans')

  const points = coordinates.map(item => [
    Number(item.longitude ?? item.lng ?? item.x),
    Number(item.latitude ?? item.lat ?? item.y),
  ]).filter(point => point.every(Number.isFinite))

  if (points.length >= 3) {
    if (points[0][0] !== points[points.length - 1][0] || points[0][1] !== points[points.length - 1][1]) points.push(points[0])
    map.addPolygon({
      id: 'post-evaluation-boundary',
      geojson: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [points] }, properties: {} },
      color: '#2A9FFF',
      opacity: 0.2,
      outlineColor: '#2A9FFF',
      outlineWidth: 2,
    })
    const center = points.reduce((acc, point) => [acc[0] + point[0], acc[1] + point[1]], [0, 0])
    map.getMap?.()?.flyTo({ center: [center[0] / points.length, center[1] / points.length], zoom: 11, duration: 1200 })
  }
  if (fans.length) {
    const features = fans.map((item, index) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [Number(item.longitude ?? item.lng ?? item.x), Number(item.latitude ?? item.lat ?? item.y)],
      },
      properties: { index },
    })).filter(item => item.geometry.coordinates.every(Number.isFinite))
    if (features.length) {
      map.addImagePoints?.({
        id: 'post-evaluation-fans',
        geojson: { type: 'FeatureCollection', features },
        iconId: 'post-evaluation-fan-icon',
        iconUrl: fengjiIcon,
        iconSize: ICON_SIZE_WIND,
        iconAnchor: 'bottom',
      })
    }
  }
}

async function uploadToOss(file, relativePath = file.name) {
  const result = await ossUpload.uploadFile(file)
  const obsPath = result?.obsPath || result?.url
  if (!obsPath) throw new Error(result?.msg || `文件「${file.name}」上传失败，未获取到文件地址`)
  return {
    name: file.name,
    relativePath,
    size: file.size,
    obsPath,
    statusText: '已上传',
  }
}

async function handleSingleFile(key, file) {
  if (!/\\.xlsx?$/i.test(file.name)) {
    ElMessage.warning('请上传 xls 或 xlsx 格式文件')
    return
  }
  const project = selectedProject.value || {}
  const fullCapacityGridDate = project.fullCapacityGridDate || project.fullCapacityDate ||
    project.fullCapacityOnGridDate || project.rawProject?.fullCapacityGridDate ||
    project.rawProject?.fullCapacityDate || null
  const validation = await validatePostEvaluationFile(key, file, {
    fullCapacityGridDate,
    intervalMonths: intervalMonths.value,
  })
  fileValidation[key] = validation
  if (!validation.valid) {
    ElMessage.warning(validation.message)
    return
  }
  try {
    const item = await uploadToOss(file)
    uploads[key] = { ...item, rawFile: file, validationStatus: validation.warnings.length ? 'warning' : 'success', validationMessage: validation.warnings.join('；') || '校验通过' }
    if (key === 'intervalGeneration') {
      try {
        const { sheets } = await readExcel(file)
        const rows = sheets.flatMap(sheet => sheet.rows)
        const headerRow = rows.find(row => row.some(cell => /日期|时间|年份|年月/.test(String(cell ?? ''))))
        const headers = headerRow || []
        const dateIndex = headers.findIndex(cell => /日期|时间|年月|date/i.test(String(cell ?? '')))
        const yearIndex = headers.findIndex(cell => /年份|年度|year/i.test(String(cell ?? '')))
        const monthIndex = headers.findIndex(cell => /月份|月|month/i.test(String(cell ?? '')))
        const months = new Set()
        rows.slice(rows.indexOf(headerRow) + 1).forEach(row => {
          let date = dateIndex >= 0 ? new Date(String(row[dateIndex]).replace(/[年月]/g, '-').replace(/日/g, '')) : null
          if ((!date || Number.isNaN(date.getTime())) && yearIndex >= 0 && monthIndex >= 0) {
            const year = Number(row[yearIndex]), month = Number(String(row[monthIndex]).replace(/[^0-9]/g, ''))
            if (year > 1900 && month >= 1 && month <= 12) months.add(year * 100 + month)
          } else if (date && !Number.isNaN(date.getTime())) months.add(date.getFullYear() * 100 + date.getMonth() + 1)
        })
        intervalMonths.value = [...months].sort((x,y)=>x-y)
      } catch (error) {
        console.warn('[后评价] 提取区间发电量月份失败', error)
      }
    }
    ElMessage.success(validation.warnings.length ? `${file.name} 上传成功，${validation.warnings[0]}` : `${file.name} 校验并上传成功`)
  } catch (error) {
    console.error('[后评价] 文件上传失败:', error)
    ElMessage.error(error?.message || '文件上传失败')
  }
}
async function inspectFolderFile(file) {
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (!['xlsx', 'xls', 'csv'].includes(extension)) return { inspectStatus: 'error', inspectMessage: '仅支持 xlsx、xls、csv 文件' }
  if (!file.size) return { inspectStatus: 'error', inspectMessage: '空文件' }
  if (extension === 'csv') {
    const content = await file.text()
    const rows = content.split(/\r?\n/).filter(line => line.trim())
    if (rows.length < 2) return { inspectStatus: 'error', inspectMessage: '至少需要一行有效数据' }
    return { inspectStatus: 'success', inspectMessage: `可读取，${rows.length - 1} 行` }
  }
  const { sheets } = await readExcel(file)
  const rows = sheets.flatMap(sheet => sheet.rows)
  if (rows.length < 2) return { inspectStatus: 'error', inspectMessage: '至少需要一行有效数据' }
  return { inspectStatus: 'success', inspectMessage: `可读取，${sheets.length} 个工作表` }
}

async function handleFolderChange(files) {
  if (!files.length) return
  folderUploading.value = true
  folderFiles.value = []
  showFolderDetails.value = true

  try {
    const inspected = []
    for (const file of files) {
      const relativePath = file.webkitRelativePath || file.name
      let inspection
      try {
        inspection = await inspectFolderFile(file)
      } catch (error) {
        inspection = { inspectStatus: 'error', inspectMessage: '内容读取失败' }
      }
      inspected.push({ file, relativePath, ...inspection })
    }

    const uploaded = []
    for (const item of inspected) {
      try {
        const uploadResult = await uploadToOss(item.file, item.relativePath)
        uploaded.push({ ...item, ...uploadResult })
      } catch (error) {
        uploaded.push({ ...item, inspectStatus: 'error', inspectMessage: error?.message || '上传失败' })
      }
    }
    folderFiles.value = uploaded
    const failed = uploaded.filter(item => !item.obsPath).length
    if (failed) ElMessage.warning(`文件夹处理完成，${failed} 个文件上传失败`)
    else ElMessage.success(`已检查并上传 ${uploaded.length} 个文件`)
  } finally {
    folderUploading.value = false
  }
}

function clearFolder() {
  folderFiles.value = []
  showFolderDetails.value = false
}

function handleStart() {
  const missing = []
  if (!selectedProjectId.value) missing.push('项目可研报告')
  uploadKeys.forEach(key => {
    if (!uploads[key]) missing.push(uploadLabels[key])
  })
  if (!folderFiles.value.some(item => item.obsPath && item.inspectStatus === 'success')) missing.push('各风机Scada风速和发电量数据（至少需要一个可读取的 Excel / CSV 文件）')
  if (!form.turbineModel) missing.push('风机型号')
  if (!form.kValue || !Number.isFinite(Number(form.kValue))) missing.push('机组保证K值')

  if (missing.length) {
    ElMessage.warning(`请完善：${missing.join('、')}`)
    return
  }

  ElMessage.info('后评价报告生成接口尚未接入，当前已完成表单和材料采集')
  emit('submit', {
    project: selectedProject.value,
    form: { ...form },
    uploads: Object.fromEntries(uploadKeys.map(key => [key, uploads[key]])),
    scadaFolderFiles: folderFiles.value.map(({ file, ...item }) => item),
  })
}

const uploadLabels = {
  completionSettlement: '竣工结算报告',
  intervalGeneration: '区间发电量',
  scadaCoordinate: 'Scada风机坐标对照表',
  capitalContribution: '项目资本金投入表',
  operationData: '项目主要经营数据表',
  costComparison: '项目总成本费用对比表',
  dailyPowerFinance: '项目日电量电价表（来源财务报表）',
  dailyPowerMarket: '项目日电量电价表（来源市场部）',
  financialBasicData: '财务评价基础数据表',
  loanInfo: '贷款信息',
}

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
  window.setTimeout(() => mapRef.value?.getMap?.()?.resize?.(), 320)
}
</script>

<style scoped>
.post-evaluation-wizard {
  position: fixed;
  inset: 65px 0 0;
  z-index: 2000;
  display: flex;
  overflow: hidden;
  background: #f5f7fa;
}
.left-panel {
  position: relative;
  z-index: 10;
  display: flex;
  flex: 0 0 50%;
  flex-direction: column;
  width: 50%;
  min-width: 0;
  background: #fff;
  box-shadow: 2px 0 8px rgba(0, 0, 0, .06);
  transition: width .25s ease, flex-basis .25s ease;
}
.left-panel.collapsed {
  flex-basis: 0;
  width: 0;
  min-width: 0;
}
.panel-header {
  display: flex;
  align-items: center;
  height: 56px;
  flex-shrink: 0;
  padding: 0 20px;
  border-bottom: 1px solid #ebeef5;
}
.header-title { display: flex; align-items: center; gap: 12px; color: #303133; font-size: 16px; font-weight: 600; }
.back-icon { color: #409eff; font-size: 20px; cursor: pointer; }
.panel-scroll { flex: 1; min-height: 0; }
.form-content { padding: 20px 28px 28px 18px; max-width: 860px; margin: 0 auto; }
.form-section { padding: 8px 0 16px; border-bottom: 1px solid #f0f2f5; }
.form-section:last-child { border-bottom: 0; }
.section-title { margin: 0 0 12px 12px; color: #303133; font-size: 14px; font-weight: 600; }
.section-notice { margin: 0 0 14px 136px; color: #e6a23c; font-size: 12px; line-height: 1.6; }
.upload-row, .form-row { display: grid; grid-template-columns: minmax(150px, 190px) minmax(0, 1fr); gap: 18px; align-items: center; margin: 18px 0; }
.upload-label { padding-top: 0; color: #303133; font-size: 13px; line-height: 1.45; text-align: right; }
.upload-label.required::after { content: ' *'; color: #f56c6c; }
.upload-control { display: flex; align-items: center; gap: 16px; min-width: 0; }
.hidden-input { display: none; }
.upload-button {
  display: inline-flex;
  flex: 0 0 48px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  padding: 4px;
  border: 1px dashed #c0c4cc;
  border-radius: 0;
  color: #606266;
  background: #fff;
  font-size: 10px;
}
.upload-icon { display: flex; font-size: 18px; }
.upload-description { min-width: 0; padding-top: 8px; color: #a0a3a8; font-size: 12px; line-height: 1.6; overflow-wrap: anywhere; }
.uploaded-name { color: #409eff; margin-right: 8px; }
.upload-status { color: #67c23a; margin-right: 8px; }
.template-link { color: #1677ff; cursor: pointer; }
.remove-file { margin-left: 8px; border: 0; padding: 0; background: none; color: #f56c6c; cursor: pointer; font-size: 12px; }
.folder-row { grid-template-columns: minmax(150px, 190px) minmax(0, 1fr); }
.upload-stack { min-width: 0; }
.folder-summary { margin-top: 8px; color: #8492a6; font-size: 12px; }
.folder-details { margin-top: 8px; max-height: 180px; overflow: auto; padding: 8px 10px; border: 1px solid #ebeef5; background: #fafafa; }
.folder-file { display: flex; justify-content: space-between; gap: 10px; align-items: center; padding: 5px 0; font-size: 12px; }
.file-name { min-width: 0; overflow-wrap: anywhere; color: #606266; }
.capacity-row { grid-template-columns: minmax(150px, 190px) minmax(0, 1fr); }
.capacity-row .field-tip, .k-value-row .field-tip { grid-column: 2; }
.fan-model-row { grid-template-columns: minmax(150px, 190px) minmax(0, 360px); align-items: center; }
.paired-fields { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 10px; width: 100%; max-width: 360px; }
.model-type-select, .model-value-select, .operator-select { width: 100%; min-width: 0; }
.capacity-row { grid-template-columns: minmax(150px, 190px) minmax(0, 360px); }
.capacity-input { width: 100%; max-width: 360px; }
.k-value-row { grid-template-columns: minmax(150px, 190px) minmax(0, 360px); }
.k-value-control { min-width: 0; }
.operator-select { min-width: 0; }
.field-tip { grid-column: 2 / 4; margin: -6px 0 0; color: #a0a3a8; font-size: 12px; }
.generate-action { display: flex; justify-content: center; padding: 26px 0 12px; }
.generate-action :deep(.el-button) { min-width: 190px; height: 46px; font-size: 15px; font-weight: 600; }
.collapse-trigger {
  position: absolute; top: 50%; right: -24px; z-index: 11; display: flex;
  width: 24px; height: 48px; align-items: center; justify-content: center;
  transform: translateY(-50%); border: 1px solid #ebeef5; border-left: 0;
  border-radius: 0 6px 6px 0; background: #fff; color: #909399; cursor: pointer;
}
.scada-example { padding: 8px 12px; border: 1px solid #ebeef5; border-radius: 6px; background: #fafcff; color: #606266; }
.example-folder, .example-file { display: flex; align-items: center; gap: 10px; padding: 10px 12px; }
.example-folder { color: #303133; font-weight: 600; background: #f1f6fd; border-radius: 4px; }
.example-folder .el-icon { color: #e6a23c; font-size: 18px; }
.example-file { margin: 6px 0 0 24px; border-bottom: 1px dashed #e4e7ed; font-size: 13px; }
.example-file .el-icon { color: #409eff; }
.example-file .el-tag { margin-left: auto; }
.scada-example p { margin: 14px 4px 4px; color: #909399; font-size: 12px; line-height: 1.7; }
.map-area { position: relative; flex: 1; min-width: 0; height: 100%; }
.map-empty-tip {
  position: absolute; top: 50%; left: 50%; display: flex; align-items: center; gap: 8px;
  transform: translate(-50%, -50%); padding: 12px 18px; border: 1px solid rgba(255,255,255,.18);
  border-radius: 6px; background: rgba(12,27,51,.78); color: #d7e4f5; font-size: 13px;
  pointer-events: none;
}
@media (max-width: 1100px) {
  .left-panel { flex-basis: 50%; width: 50%; }
  .form-content { padding: 16px 18px 24px 12px; }
  .upload-row, .form-row, .folder-row { grid-template-columns: minmax(125px, 165px) minmax(0, 1fr); gap: 12px; }
  .paired-fields, .capacity-input { max-width: 100%; }
}
</style>
