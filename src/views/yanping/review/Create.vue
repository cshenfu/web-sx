<template>
  <div class="create-layout-container" v-loading="draftLoading">
    <!-- 左侧面板：支持展开/收起 -->
    <div class="left-panel" :class="{ 'is-collapsed': isCollapsed }">
      <div class="panel-header">
        <div class="title-area" v-show="!isCollapsed">
          <el-icon class="back-btn" @click="handleClose"><Back /></el-icon>
          <span class="title">一键生成风电场可行性研究报告（{{ modeLabel }}）</span>
        </div>
      </div>

      <!-- 💡 步骤条（使用你的图片样式） -->
      <div class="step-component" v-show="!isCollapsed">
        <div
          v-for="(step, index) in visibleSteps"
          :key="step.key"
          class="step-item"
          :class="[
            index === 0 ? (currentStep === 0 ? 'step-one-active' : '') : '',
            index === 1 ? (currentStep === 1 ? 'step-two-active' : 'step-two') : '',
            index === 2 ? (currentStep === 2 ? 'step-three-active' : 'step-three') : ''
          ]"
          @click="currentStep = index"
        >
          <span>{{ index + 1 }}.</span>{{ step.label }}
        </div>
      </div>

      <div class="panel-body" v-show="!isCollapsed">
        <el-scrollbar>
          <div v-if="draftReady" class="form-wrapper">
            <!-- 在 template 里的 StepOne 加上监听 -->
              <StepOne
                v-show="currentStep === 0"
                :create-project-mode="createProjectMode"
                :initial-project-name="resolvedProjectName"
                :project="workingProject"
                @project-selected="handleProjectSelected"
                @report-data-loaded="handleReportDataLoaded" 
                @map-data-updated="renderMapLayers"
                @save-draft="(payload) => handleSaveDraft(0, payload)"
                @next="(payload) => handleNext(0, payload)"
              />
              
              <StepTwo
                v-show="currentStep === 1"
                :create-project-mode="createProjectMode"
                :project="workingProject"
                :ai-report-data="aiReportData"  
                @prev="currentStep = 0"
                @save-draft="(data) => handleSaveDraft(1, data)"
                @next="(data) => handleNext(1, data)"
              />
            <StepThree
              v-show="currentStep === 2"
              :create-project-mode="createProjectMode"
              :project="workingProject"
              @prev="currentStep = 1"
              @save-draft="(data) => handleSaveDraft(2, data)"
              @submit="handleSubmit"
            />
          </div>
          <div v-else class="draft-loading-tip">正在加载草稿数据...</div>
        </el-scrollbar>
      </div>

      <!-- 收起/展开按钮（放置在面板外侧） -->
      <div class="collapse-trigger" @click="toggleCollapse">
        <el-icon>
          <ArrowLeft v-if="!isCollapsed" />
          <ArrowRight v-else />
        </el-icon>
      </div>
    </div>

    <!-- 右侧地图区域 -->
    <div class="right-map-area">
      <MapGL 
        ref="mapRef" 
        :is-dashboard="false" 
        :fly-to-on-load="false" 
        :view-controls="true"
        view-controls-position="bottom-left"
        :style="emptyMapStyle" 
        @ready="onMapReady"
      />

      <!-- 图层控制面板 -->
      <LayerChipPanel
        :visible-ids="layerVisibleIds"
        :inputs="layerInputs"
        @toggle="onLayerToggle"
        @input-change="onLayerInputChange"
      >
        <template #legend>
          <div class="layer-legend">
            <span class="layer-legend-item">
              <i class="layer-legend-point wind" />风机
            </span>
            <span class="layer-legend-item">
              <i class="layer-legend-point booster" />升压站
            </span>
          </div>
        </template>
      </LayerChipPanel>
    </div>
  </div>
</template>

<script setup>
// 这里保留你之前的逻辑即可，不需要修改
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Back, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import MapGL from '@/components/MapGL.vue' 
import LayerChipPanel from '@/components/site-map/LayerChipPanel.vue'

import { WHLN_LAYER_IDS, DEFAULT_VISIBLE } from '@/components/site-map/layerPanelConfig'
import { attachSxLayers } from '@/components/site-map/attachSxLayers'

import { ICON_SIZE_WIND, ICON_SIZE_BOOSTER } from '@/components/site-map/iconSize.js'
import fengjiIcon from '@/assets/img/mapIcon/fengji.png'
import fengjiBxIcon from '@/assets/img/mapIcon/fengji-bx.png'
import shengyazhanIcon from '@/assets/img/mapIcon/syz.png'

import StepOne from './components/StepOne.vue'
import StepTwo from './components/StepTwo.vue'
import StepThree from './components/StepThree.vue'
import { PACKAGE_TYPE } from '@/views/qinchuan/js/Reportwizardmockdata'
import { getZNPSReport } from '@/api/modules/report'

const props = defineProps({
  createProjectMode: { type: Number, default: PACKAGE_TYPE.default },
  projectName: { type: String, default: '' },
  project: { type: Object, default: () => null },
  title: { type: String, default: '' },
  maxStep: { type: Number, default: 2 },
})

const router = useRouter()
const route = useRoute()
const draftId = computed(() => String(route.query.draftId || '').trim())
const draftLoading = ref(Boolean(draftId.value))
const draftReady = ref(!draftId.value)
const currentStep = ref(0)
const isCollapsed = ref(false)
const mapRef = ref(null)
let whlnPlugin = null
let boundaryLayerIds = []
// 💡 空底图配置：去除默认 CartoCDN 底图，只保留透明背景和下方的深色底色
const emptyMapStyle = {
  version: 8,
  sources: {},
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': '#0c1b33' }
    }
  ]
}
const steps = [
  { key: 'basic', label: '项目基本信息' },
  { key: 'condition', label: '项目建设条件' },
  { key: 'invest', label: '项目投资设置' },
]
const visibleSteps = computed(() => steps.slice(0, Math.min(props.maxStep, steps.length - 1) + 1))

const workingProject = ref({
  ...(props.project || {}),
  id: props.project?.id ? String(props.project.id) : undefined,
  sxProjectId: props.project?.sxProjectId ?? props.project?.id ?? 0,
})
const aiReportData = ref(null) // 💡 新增变量

// 💡 新增方法
const handleReportDataLoaded = (data) => {
  aiReportData.value = data
}
const resolvedProjectName = computed(() => props.projectName || props.project?.name || props.project?.projectName || '')
const modeLabel = computed(() => {
  if (props.createProjectMode === PACKAGE_TYPE.distributedDefault) return '分散式'
  if (props.createProjectMode === PACKAGE_TYPE.baseDefault) return '基地项目'
  return '集中式'
})

const handleClose = () => router.push(draftId.value ? '/yanping/review/draft' : '/yanping/review/project')

function parseDraftValue(value) {
  if (typeof value !== 'string') return value
  try { return JSON.parse(value) } catch { return value }
}

function buildDraftProject(response) {
  const detail = response?.data?.data || response?.data || {}
  const reportParams = parseDraftValue(detail.reportParamResult) || {}
  const candidates = [
    detail.reviewProjectDetail, detail.projectDetail, detail.reviewProject, detail.project,
    reportParams?.reviewProject, reportParams?.project, reportParams?.form, reportParams,
  ]
  const projectData = candidates.find((item) => item && typeof item === 'object' && (
    item.projectName || item.currentProjectCapacity != null || item.totalProjectCapacity != null || item.id != null
  )) || {}
  return {
    ...projectData,
    ...detail,
    ...projectData,
    id: detail.reviewProjectId || detail.reviewProject?.id || projectData.id || route.query.reviewProjectId || undefined,
    projectName: projectData.projectName || detail.reportProjectName || route.query.projectName || '',
    projectCode: projectData.projectCode || detail.reportProjectCode || route.query.projectCode || '',
    totalProjectCapacity: projectData.totalProjectCapacity ?? route.query.totalProjectCapacity ?? '',
    currentProjectCapacity: projectData.currentProjectCapacity ?? route.query.currentProjectCapacity ?? '',
    itemType: projectData.itemType ?? route.query.itemType ?? detail.reportItemType,
    aiProjectId: detail.aiProjectId || projectData.aiProjectId,
    reviewRelationId: detail.id || draftId.value,
    uniqueIdentification: projectData.uniqueIdentification || ('review-draft-' + (detail.reviewProjectId || route.query.reviewProjectId || draftId.value)),
  }
}

async function loadDraftForEdit() {
  if (!draftId.value) return
  draftLoading.value = true
  draftReady.value = false
  try {
    const response = await getZNPSReport(draftId.value)
    if (response?.code !== undefined && response.code !== 200 && response.code !== 0) {
      throw new Error(response.msg || '获取草稿详情失败')
    }
    workingProject.value = { ...(props.project || {}), ...buildDraftProject(response) }
    if (!workingProject.value.id) throw new Error('草稿详情中未返回项目ID，无法回显编辑')
    ElMessage.success('草稿数据加载成功')
  } catch (error) {
    console.error('加载智能评审草稿失败:', error)
    ElMessage.error(error?.message || '加载草稿失败')
  } finally {
    draftLoading.value = false
    draftReady.value = true
  }
}

onMounted(() => { void loadDraftForEdit() })

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
  setTimeout(() => {
    if (mapRef.value?.getMap()) mapRef.value.getMap().resize()
  }, 320)
}

// ==========================================
// 图层控制逻辑
// ==========================================
const LAYER_WIND_NORMAL = 'proj-wind-all'
const LAYER_WIND_RESERVE = 'proj-wind-bx-all'
const LAYER_BOOSTER = 'proj-booster-all'

const layerVisibleIds = ref([...DEFAULT_VISIBLE, 'area', 'wind', 'booster'])
const layerInputs = reactive({})

const onMapReady = () => {
  const map = mapRef.value?.getMap?.()
  if (!map) return

  try {
    whlnPlugin = attachSxLayers(map, { 
      initialVisibleIds: layerVisibleIds.value.filter((id) => WHLN_LAYER_IDS.includes(id)) 
    })
    whlnPlugin.subscribe?.((ids) => { 
      layerVisibleIds.value = [
        ...layerVisibleIds.value.filter((id) => !WHLN_LAYER_IDS.includes(id)), 
        ...ids
      ] 
    })
  } catch (err) {
    console.warn('[whln] 图层控制挂载失败:', err)
  }
}

const onLayerToggle = (item) => {
  const isOn = layerVisibleIds.value.includes(item.id)
  const nextOn = !isOn

  if (isOn) {
    layerVisibleIds.value = layerVisibleIds.value.filter((id) => id !== item.id)
  } else {
    layerVisibleIds.value = [...layerVisibleIds.value, item.id]
  }

  const map = mapRef.value?.getMap()
  if (!map) return

  if (item.type === 'whln') {
    whlnPlugin?.setVisibleIds?.(
      layerVisibleIds.value.filter((id) => WHLN_LAYER_IDS.includes(id))
    )
    return
  }

  const layerMap = {
    'area': [...boundaryLayerIds],
    'wind': [LAYER_WIND_NORMAL, LAYER_WIND_RESERVE],
    'booster': [LAYER_BOOSTER]
  }

  const layerIds = layerMap[item.id] || []
  layerIds.forEach(layerId => {
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(layerId, 'visibility', nextOn ? 'visible' : 'none')
    }
  })
}

const onLayerInputChange = ({ id, value }) => {
  layerInputs[id] = value
}

// ==========================================
// 接收项目数据，绘制到地图上
// ==========================================
// 修改 Create.vue 中的 handleProjectSelected 和渲染逻辑

const handleProjectSelected = (project) => {
  workingProject.value = {
    ...workingProject.value,
    ...project,
    // 💡 关键：把第一步选中的项目 id 同步为 sxProjectId
    aiProjectId: project.id,
    sxProjectId: project.sxProjectId ?? project.id ?? workingProject.value.sxProjectId,
  }
  renderMapLayers({
    coordinate: project.coordinate || [],
    windTurbinePoints: project.windTurbinePoints || [],
    boosterStationLocations: project.boosterStationLocations || []
  })
}

// 统一的图层渲染函数
const renderMapLayers = async (data) => {
  if (!mapRef.value) return
  const map = mapRef.value
  const removeIds = new Set(['proj-boundary', ...boundaryLayerIds, LAYER_WIND_NORMAL, LAYER_WIND_RESERVE, LAYER_BOOSTER])
  removeIds.forEach((layerId) => map.removeLayer(layerId))
  boundaryLayerIds = []

  let coordinate = data?.coordinate || []
  if (typeof coordinate === 'string') {
    try { coordinate = JSON.parse(coordinate) } catch { coordinate = [] }
  }
  if (!Array.isArray(coordinate)) coordinate = []
  const windTurbinePoints = data?.windTurbinePoints || []
  const boosterStationLocations = data?.boosterStationLocations || []

  // 场区边界支持多个 regionCode 区域；单点场区按容量半径绘制近似圆。
  const readLngLat = (item) => {
    if (Array.isArray(item)) return [Number(item[0]), Number(item[1])]
    return [Number(item?.longitude ?? item?.lng ?? item?.x), Number(item?.latitude ?? item?.lat ?? item?.y)]
  }
  let rings = Array.isArray(data?.coordinateRings) ? data.coordinateRings : []
  if (!rings.length) {
    const grouped = new Map()
    coordinate.forEach((item) => {
      const key = item?.regionCode ?? 'region-1'
      if (!grouped.has(key)) grouped.set(key, [])
      grouped.get(key).push(item)
    })
    rings = Array.from(grouped.values())
  }
  rings = rings.map((ring) => ring.map(readLngLat).filter((point) => Number.isFinite(point[0]) && Number.isFinite(point[1])))
    .filter((ring) => ring.length >= 3)

  if (!rings.length && coordinate.length === 1 && Number(data?.boundaryRadiusKm) > 0) {
    const center = readLngLat(coordinate[0])
    const radiusKm = Number(data.boundaryRadiusKm)
    const ring = []
    const latRadians = center[1] * Math.PI / 180
    const longitudeScale = Math.max(0.1, Math.cos(latRadians))
    for (let i = 0; i <= 64; i++) {
      const angle = (2 * Math.PI * i) / 64
      const latitude = center[1] + (radiusKm / 111.32) * Math.sin(angle)
      const longitude = center[0] + (radiusKm / (111.32 * longitudeScale)) * Math.cos(angle)
      ring.push([longitude, latitude])
    }
    rings = [ring]
  }

  // 加载图标
  try {
    await Promise.all([
      map.ensureImage('icon-fengji', fengjiIcon),
      map.ensureImage('icon-fengji-bx', fengjiBxIcon),
      map.ensureImage('icon-shengyazhan', shengyazhanIcon),
    ])
  } catch (err) {
    console.warn('地图图标加载失败:', err)
  }

  rings.forEach((ring, index) => {
    const coords = ring.map((point) => [point[0], point[1]])
    if (coords.length && (coords[0][0] !== coords[coords.length - 1][0] || coords[0][1] !== coords[coords.length - 1][1])) coords.push(coords[0])
    if (coords.length < 4) return
    const layerId = index === 0 ? 'proj-boundary' : 'proj-boundary-' + index
    map.addPolygon({
      id: layerId,
      geojson: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [coords] }, properties: {} },
      color: '#2A9FFF', opacity: 0.2, outlineColor: '#2A9FFF', outlineWidth: 2,
    })
    boundaryLayerIds.push(layerId)
  })

  const mapPoints = coordinate.map(readLngLat).filter((point) => Number.isFinite(point[0]) && Number.isFinite(point[1]))
  if (mapPoints.length && map.getMap()) {
    const center = [
      mapPoints.reduce((sum, point) => sum + point[0], 0) / mapPoints.length,
      mapPoints.reduce((sum, point) => sum + point[1], 0) / mapPoints.length,
    ]
    map.getMap().flyTo({ center, zoom: 11, pitch: 0, duration: 1500 })
  }

  // 风机点位
  if (windTurbinePoints.length > 0) {
    const normalFeatures = []
    const reserveFeatures = []
    windTurbinePoints.forEach((pt, index) => {
      const lng = Number(pt.longitude ?? pt.lng ?? pt.x)
      const lat = Number(pt.latitude ?? pt.lat ?? pt.y)
      if (!Number.isFinite(lng) || !Number.isFinite(lat)) return
      const isReserve = Number(pt.isReserve) === 1
      const feature = {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [lng, lat] },
        properties: { index, isReserve: isReserve ? 1 : 0 },
      }
      if (isReserve) reserveFeatures.push(feature)
      else normalFeatures.push(feature)
    })
    if (normalFeatures.length > 0) {
      await map.addImagePoints({ id: LAYER_WIND_NORMAL, geojson: { type: 'FeatureCollection', features: normalFeatures }, iconId: 'icon-fengji', iconUrl: fengjiIcon, iconSize: ICON_SIZE_WIND, iconAnchor: 'bottom' })
    }
    if (reserveFeatures.length > 0) {
      await map.addImagePoints({ id: LAYER_WIND_RESERVE, geojson: { type: 'FeatureCollection', features: reserveFeatures }, iconId: 'icon-fengji-bx', iconUrl: fengjiBxIcon, iconSize: ICON_SIZE_WIND, iconAnchor: 'bottom' })
    }
  }

  // 升压站
  if (boosterStationLocations.length > 0) {
    const bestFeatures = boosterStationLocations
      .filter((pt) => pt.isBest === true || Number(pt.isBest) === 1)
      .map((pt, index) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [Number(pt.lng ?? pt.longitude ?? pt.x), Number(pt.lat ?? pt.latitude ?? pt.y)] },
        properties: { index, isBest: 1 },
      }))
      .filter((feature) => feature.geometry.coordinates.every(Number.isFinite))
    if (bestFeatures.length > 0) {
      await map.addImagePoints({ id: LAYER_BOOSTER, geojson: { type: 'FeatureCollection', features: bestFeatures }, iconId: 'icon-shengyazhan', iconUrl: shengyazhanIcon, iconSize: ICON_SIZE_BOOSTER, iconAnchor: 'bottom' })
    }
  }

  // 重新应用图层的显隐状态
  const layerMap = {
    area: [...boundaryLayerIds],
    wind: [LAYER_WIND_NORMAL, LAYER_WIND_RESERVE],
    booster: [LAYER_BOOSTER],
  }
  Object.keys(layerMap).forEach((key) => {
    const visible = layerVisibleIds.value.includes(key)
    if (!map.getMap()) return
    layerMap[key].forEach((layerId) => {
      if (map.getMap().getLayer(layerId)) map.getMap().setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none')
    })
  })
}

// ==========================================
// 步骤流转与数据同步
// ==========================================
function updateWorkingProject(data) {
  if (!data) return
  const { savedProjectId, form } = data

  // 💡 如果 form 中带了 sxProjectId，以它为准；否则保留当前值
  const nextSxProjectId = form?.sxProjectId ?? workingProject.value.sxProjectId

  workingProject.value = {
    ...workingProject.value,
    ...(form && typeof form === 'object' ? form : {}),
    ...(savedProjectId ? { id: savedProjectId } : {}),
    sxProjectId: nextSxProjectId,
  }
}

function handleSaveDraft(stepIndex, data) {
  updateWorkingProject(data)
  console.log('保存草稿成功', data)
  ElMessage.success('保存草稿成功')
}

function handleNext(stepIndex, data) {
  updateWorkingProject(data)
  const lastStepIndex = Math.min(props.maxStep, steps.length - 1)
  if (stepIndex >= lastStepIndex) {
    router.push('/yanping/review/project')
    return
  }
  currentStep.value = Math.min(stepIndex + 1, steps.length - 1)
}

function handleSubmit(data) {
  updateWorkingProject(data)
  router.push('/yanping/review/project')
}

onUnmounted(() => {
  whlnPlugin?.destroy?.()
  whlnPlugin = null
})
</script>

<style scoped>
/* ================= 页面布局 ================= */
.create-layout-container { 
  display: flex; 
  width: 100vw; 
  height: calc(100vh - 65px); 
  overflow: hidden; 
  background-color: #f5f7fa; 
}

/* ================= 左侧面板 ================= */
.left-panel { 
  position: relative; 
  /* 💡 修改：面板宽度改为 40% */
  width: 40%; 
  min-width: 500px; /* 防止在极小屏幕上变得太窄 */
  height: 100%; 
  background: #fff; 
  display: flex; 
  flex-direction: column; 
  box-shadow: 2px 0 8px rgba(0,0,0,0.05); 
  z-index: 10; 
  transition: width 0.3s ease; 
}

/* 收起时的面板状态 */
.left-panel.is-collapsed { 
  width: 0; 
  min-width: 0;
  border-right: none;
  box-shadow: none; 
}

/* 核心修复：收起时隐藏内部内容 */
.left-panel.is-collapsed .panel-header,
.left-panel.is-collapsed .step-component,
.left-panel.is-collapsed .panel-body {
  display: none !important;
}

.panel-header { 
  display: flex; 
  align-items: center; 
  padding: 16px; 
  border-bottom: 1px solid #ebeef5; 
  white-space: nowrap; 
  height: 64px; 
  box-sizing: border-box;
}
.title-area { display: flex; align-items: center; gap: 10px; overflow: hidden; }
.back-btn { font-size: 20px; cursor: pointer; color: #2f8dff; flex-shrink: 0; }
.title { font-size: 16px; font-weight: 600; color: #303133; }

.panel-body { flex: 1; overflow: hidden; }
.form-wrapper { padding: 24px; }

/* ================= 抽屉把手（左右三角） ================= */
.collapse-trigger {
  position: absolute;
  top: 50%;
  right: -24px;
  transform: translateY(-50%);
  width: 24px;
  height: 48px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-left: none;
  border-radius: 0 6px 6px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 2px 0 8px rgba(0,0,0,0.05);
  z-index: 11; 
  color: #909399;
  transition: all 0.3s;
}
.collapse-trigger:hover {
  color: #2f8dff;
  background: #f7faff;
}

/* ================= 你提供的步骤条样式 (放大版) ================= */
.step-component {
  display: flex;
  align-items: center;
  /* 💡 修改：居中显示，并调整间距 */
  justify-content: center; 
  margin: 16px 0 24px 0; 
  /* 💡 修改：将 zoom 从 0.68 放大到 0.9，让图标和文字更大 */
  zoom: 0.9; 
}

.step-component .step-item {
  max-width: 285px;
  min-width: 236px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #5c6170;
  margin-left: -18px;
  font-weight: bold;
}

.step-component .step-item:first-child {
  margin-left: 0;
}

.step-component .step-item span {
  margin: 0 8px;
}

.step-component .step-one-active {
  background: url(@/assets/img/step/step-one-active.png) no-repeat;
  background-size: 100% 100%;
  color: #ffffff;
  cursor: pointer;
}

.step-component .step-two {
  background: url(@/assets/img/step/step-two.png) no-repeat;
  background-size: 100% 100%;
  margin-left: -12px;
}

.step-component .step-two-active {
  background: url(@/assets/img/step/step-two-active.png) no-repeat;
  background-size: 100% 100%;
  color: #ffffff;
  margin-left: -12px;
  cursor: pointer;
}

.step-component .step-three {
  background: url(@/assets/img/step/step-three.png) no-repeat;
  background-size: 100% 100%;
  margin-left: -12px;
}

.step-component .step-three-active {
  background: url(@/assets/img/step/step-three-active.png) no-repeat;
  background-size: 100% 100%;
  color: #ffffff;
  margin-left: -12px;
  cursor: pointer;
}

/* ================= 右侧地图区域 ================= */
.right-map-area { 
  flex: 1; 
  height: 100%; 
  position: relative; 
  background: #0c1b33; 
}

/* 地图控件位置调整 */
:deep(.maplibregl-ctrl-bottom-left) {
  display: block !important;
  left: 16px !important;
  bottom: 80px !important;
  z-index: 20 !important;
}

/* ================= 图例 ================= */
.layer-legend {
  display: flex;
  gap: 14px;
  padding: 8px 2px 2px;
  margin-top: 2px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}
.layer-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #606266;
  font-size: 12px;
  user-select: none;
}
.layer-legend-point {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.layer-legend-point.wind { background: #E6A23C; }
.layer-legend-point.booster { background: #67C23A; }
</style>