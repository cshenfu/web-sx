<!-- Dashboard-area-editor.vue -->
<template>
  <main class="dashboard-page">
    <MapGL ref="mapRef" :style="satelliteStyle" @ready="onMapReady" />

    <div class="map-overlay" aria-hidden="true" />

    <DashboardHead class="head-layer" />

    <LeftDashboard
      v-if="!wizardVisible"
      class="left-layer"
      v-model="selectedStage"
      @project-select="onProjectStageSelect"
    />
    <ReportWizard
      v-else
      class="left-layer wizard-layer"
      :create-project-mode="wizardMode"
      :project-name="activeProjectDetail?.name || activeProjectDetail?.projectName || ''"
      :project="activeProjectDetail"
      @close="wizardVisible = false"
      @save-draft="handleWizardSaveDraft"
      @submit="handleWizardSubmit"
    />

    <!-- 15 级以下保留原右侧大屏，15 级及以上切换为项目列表 -->
    <RightDashboard v-if="!isAreaView" class="right-layer" />

    <div v-else class="area-view-layer right-layer">
      <EditToolbar
        v-model:activeTool="activeEditTool"
        :is-drawing="isDrawing"
        :new-area-feature-id="newAreaFeatureId"
        :new-area-name="newAreaName"
        :selected-area="selectedArea"
        :selected-area-features="selectedAreaFeatures"
        :edit-area-name="editAreaName"
        :action-loading="actionLoading"
        :panel-message="panelMessage"
        :delete-confirm-visible="deleteConfirmVisible"
        @update:new-area-name="(v) => (newAreaName = v)"
        @update:edit-area-name="(v) => (editAreaName = v)"
        @start-draw="startPolygonDrawing"
        @save-new="saveNewArea"
        @cancel-new="cancelNewArea"
        @save-selected="saveSelectedArea"
        @cancel-selected="cancelSelectedArea"
        @open-delete-confirm="openDeleteConfirm"
        @close-delete-confirm="closeDeleteConfirm"
        @confirm-delete="confirmDelete"
      />

      <ProjectDetailPanel
        v-if="rightPanelMode === 'detail'"
        class="panel-below"
        :project="activeProjectDetail"
        @back="handleBackToList"
        @generate-report="reportModalVisible = true"
      />

      <ProjectListPanel
        v-else
        class="panel-below"
        v-model:model-value-expanded="listExpanded"
        v-model:stage-filter="filters.stage"
        :list="projectList"
        :total="pagination.total"
        :page="pagination.page"
        :page-size="pagination.pageSize"
        :active-id="activeAreaId"
        :loading="listLoading"
        :stage-options="stageOptions"
        @update:page="handlePageChange"
        @select="handleProjectSelect"
        @add="startPolygonDrawing"
      />
    </div>

    <MapModeSwitch v-if="isAreaView" v-model="mapMode" class="map-mode-switch" />

    <ReportGenerateModal
      :visible="reportModalVisible"
      :project="activeProjectDetail"
      @close="reportModalVisible = false"
      @confirm="handleReportConfirm"
      @add-report="reportModalVisible = false"
    />
  </main>
</template>

<script setup>
import {
  ref,
  computed,
  reactive,
  watch,
  onMounted,
  onUnmounted,
  nextTick
} from 'vue'
import MapGL from '@/components/MapGL.vue'
import DashboardHead from './components/DashboardHead.vue'
import LeftDashboard from './components/LeftDashboard.vue'
import RightDashboard from './components/RightDashboard.vue'
import ProjectListPanel from './components/area-panel/ProjectListPanel.vue'
import ProjectDetailPanel from './components/area-panel/ProjectDetailPanel.vue'
import EditToolbar from './components/area-panel/EditToolbar.vue'
import ReportGenerateModal from './components/area-panel/ReportGenerateModal.vue'
import MapModeSwitch from './components/area-panel/MapModeSwitch.vue'
import ReportWizard from './components/report-wizard/ReportWizard.vue'
import { PACKAGE_TYPE } from './js/reportWizardMockData'
import { projectOverviewRows, stageCityData } from './js/dashboardMcokData'
import { buildStageColorMap } from './js/mapStageColor'
import { projectDetailMockData } from './js/areaPanelMockData'
import * as api from '@/api/modules/gisLayer.js'
// 项目相关接口（列表 / 阶段枚举）
import * as newApi from '@/api/modules/project'

import {
  satelliteStyle,
  shaanxiBoundary,
  AREA_SELECT_LAYER_KEY,
  UPDATED_BY,
  AREA_ZOOM_THRESHOLD,
  PROVINCE_EXTRUSION_ID
} from './js/mapConfig'
import { cloneValue, getFeatureGuid, getFeatureAreaName } from './js/geoUtils'
import { useProvinceAreaData } from './js/useProvinceAreaData'
import { useZoomThresholdSwitch } from './js/useZoomThresholdSwitch'

const mapRef = ref(null)
const selectedStage = ref(projectOverviewRows[0]?.key || null)
const activeProject = ref(projectOverviewRows[0] || null)
const mapReady = ref(false)

// 图层数据存储
const layerDataMap = ref({})
const loading = ref(false)

// 区域查询（分页拉取逻辑抽到 js/useProvinceAreaData）
const { provinceAreaGeoJSON, provinceAreaLoading, areaSelectResult, fetchAllProvinceAreaData } =
  useProvinceAreaData(shaanxiBoundary, AREA_SELECT_LAYER_KEY)

const actionLoading = ref(false)
const panelMessage = ref('')

// 新增区域状态
const isDrawing = ref(false)
const newAreaFeatureId = ref(null)
const newAreaName = ref('')

// 已有区域编辑状态
const selectedArea = ref(null)
const selectedAreaFeatures = ref([])
const originalSelectedArea = ref(null)
const editAreaName = ref('')

// 删除确认状态
const deleteConfirmVisible = ref(false)

// ---- 区域视图右侧面板状态 ----
const activeEditTool = ref('')
const rightPanelMode = ref('list')
const listExpanded = ref(false)
const listPage = ref(1) // 保留（EditToolbar / 其他面板可能用）
const activeAreaId = ref(null)
const activeProjectDetail = ref(projectDetailMockData)
const reportModalVisible = ref(false)
const mapMode = ref('map')

// 一键生成可研报告 三步向导
const wizardVisible = ref(false)
const wizardMode = ref(PACKAGE_TYPE.default)

const reportKeyToWizardMode = {
  'feasibility-centralized': PACKAGE_TYPE.default,
  'feasibility-distributed': PACKAGE_TYPE.distributedDefault,
  'feasibility-base': PACKAGE_TYPE.baseDefault,
}

// ─── 右侧项目列表（进入区域视图后显示，替换原 AreaListPanel） ───
const projectList = ref([])
const listLoading = ref(false)
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
})
const filters = reactive({
  stage: '',
})
const ITEM_TYPE_MAP = { FD: '风电', GF: '光伏' }

const stageOptions = ref([])
const stageMap = computed(() =>
  Object.fromEntries(stageOptions.value.map(item => [item.code, item.desc]))
)

async function fetchStageList() {
  try {
    const res = await newApi.getStageList()
    stageOptions.value = res?.data ?? []
  } catch (err) {
    console.error('阶段枚举加载失败:', err)
    stageOptions.value = []
  }
}

async function fetchProjectList() {
  listLoading.value = true
  try {
    const params = {
      pageNo: pagination.page,
      pageSize: pagination.pageSize,
    }
    if (filters.stage) {
      params.projectStage = filters.stage
    }

    const res = await newApi.getPageList(params)
    const data = res?.data ?? {}
    projectList.value = data.list ?? []
    pagination.total = Number(data.total ?? 0)
  } catch (err) {
    console.error('项目列表加载失败:', err)
    projectList.value = []
    pagination.total = 0
  } finally {
    listLoading.value = false
  }
}

function handlePageChange(page) {
  pagination.page = page
  fetchProjectList()
}

// 阶段筛选变化时重新请求（page 归 1）
watch(
  () => filters.stage,
  () => {
    pagination.page = 1
    fetchProjectList()
  }
)

// 把接口返回的项目映射成 ProjectDetailPanel 需要的结构。
// 说明：MainInfoTab 等子组件依赖 timeline / metrics / planCards / subTabs 这些结构，
// 目前接口里没有对应字段，所以先用 projectDetailMockData 作为骨架，
// 再把接口里项目的基础字段覆盖上去；等接口补齐后再逐项精确映射。
function buildDetailFromListItem(item) {
  const base = cloneValue(projectDetailMockData)

  // 基础字段
  base.id = item.id
  base.name = item.projectName || base.name
  base.projectName = item.projectName || base.projectName || base.name
  base.code = item.projectCode || base.code
  base.projectCode = item.projectCode || base.projectCode
  base.type = item.itemType || base.type
  base.capacity =
    item.currentProjectCapacity ?? base.capacity
  base.stage = item.projectStage || base.stage
  base.approvalStatus = item.approvalStatus || base.approvalStatus
  base.company = item.managerCompany || base.company
  base.manager = item.managerName || base.manager
  base.notes = item.notes || base.notes
  base.address = item.address || base.address

  // 报告向导引用数据
  base.coordinate = cloneValue(item.coordinate || [])
  base.windTurbinePoints = cloneValue(item.windTurbinePoints || [])
  base.boosterStationLocations = cloneValue(item.boosterStationLocations || [])
  base.fileCollection = cloneValue(item.fileCollection || [])
  base.itemType = item.itemType
  base.currentProjectCapacity = item.currentProjectCapacity
  base.totalProjectCapacity = item.totalProjectCapacity
  base.energyStorage = item.energyStorage
  base.rentalUnitPrice = item.rentalUnitPrice
  base.rentalPayType = item.rentalPayType
  base.capacityProportion = item.capacityProportion
  base.storageHours = item.storageHours
  base.hubType = item.hubType
  base.preferHubHeight = item.preferHubHeight

  // 保留完整原始对象，StepOne 会优先从 rawProject 读取引用数据
  base.rawProject = cloneValue(item)

  const hasCoord =
    item.longitude !== null &&
    item.longitude !== undefined &&
    item.latitude !== null &&
    item.latitude !== undefined

  if (hasCoord) {
    base.center = [Number(item.longitude), Number(item.latitude)]
  }
  base.zoom = AREA_ZOOM_THRESHOLD + 1.5

  return base
}

// 点击项目列表项：飞过去 + 切到详情面板（与原来点击区域列表项效果一致）
function handleProjectSelect(item) {
  activeAreaId.value = item.id
  activeProjectDetail.value = buildDetailFromListItem(item)

  const map = mapRef.value?.getMap()
  const center = activeProjectDetail.value.center
  if (map && center) {
    map.flyTo({
      center,
      zoom: AREA_ZOOM_THRESHOLD + 1.5,
      pitch: 0,
      duration: 1200,
    })
  }
  rightPanelMode.value = 'detail'
}

// ─── 以下为原有地图 / 区域编辑逻辑（未改动） ────────────────
const provinceEventLayerId = `${PROVINCE_EXTRUSION_ID}-event`
let drawCreateHandler = null
let drawSelectionChangeHandler = null
let drawUpdateHandler = null
let drawDeleteHandler = null
let suppressSelectionEvents = false

const areaAttributeDefaults = {
  name: '',
}

function buildAreaAttributes(properties = {}, name = '') {
  const attributes = { ...areaAttributeDefaults }

  Object.keys(areaAttributeDefaults).forEach((key) => {
    if (properties[key] !== undefined) {
      attributes[key] = properties[key]
    }
  })

  if (!name && properties.name) {
    attributes.name = properties.name
  } else {
    attributes.name = name
  }

  return attributes
}

function setPanelMessage(message) {
  panelMessage.value = message
}

function clearPanelMessage() {
  panelMessage.value = ''
}

const fetchAllLayerData = async (layerList) => {
  if (!layerList || layerList.length === 0) return

  const promises = layerList.map((layer) =>
    api
      .getLayerDataByLayerKey(layer.layerKey)
      .then((res) => ({ key: layer.layerKey, data: res.data }))
      .catch((error) => {
        console.error(`获取图层 ${layer.layerKey} 数据失败:`, error)
        return { key: layer.layerKey, data: null }
      })
  )

  const results = await Promise.all(promises)
  const map = {}

  results.forEach(({ key, data }) => {
    map[key] = data
  })

  layerDataMap.value = map

  if (mapReady.value) {
    renderDynamicLayers()
  }
}

const loadLayers = async () => {
  loading.value = true
  try {
    const res = await api.showLayerList()
    await fetchAllLayerData(res.data)
  } catch (error) {
    console.error('获取图层列表失败:', error)
  } finally {
    loading.value = false
  }
}

const renderDynamicLayers = () => {
  // 保留扩展入口
}

function renderSelectedProject(row) {
  if (!row || !mapRef.value) return

  const cityValues = stageCityData[row.key] || {}
  const colorMap = buildStageColorMap(cityValues, row.color)

  mapRef.value.addExtrusion({
    id: PROVINCE_EXTRUSION_ID,
    geojson: shaanxiBoundary,
    colorMap,
    defaultHeight: 10000,
    defaultColor: row.color || '#2A9FFF',
    highlightColor: '#FFFF00',
    opacity: 0.9,
    enableHover: true,
  })
}

async function refreshProvinceAreaData() {
  await fetchAllProvinceAreaData()

  if (isAreaView.value && provinceAreaGeoJSON.value?.features?.length) {
    mapRef.value?.loadEditableAreas(provinceAreaGeoJSON.value)
  }
}

const { isAreaView, syncByZoom, bindZoomListener, unbindZoomListener } = useZoomThresholdSwitch({
  mapRef,
  zoomThreshold: AREA_ZOOM_THRESHOLD,
  onAboveThreshold: () => {
    const map = mapRef.value?.getMap()
    if (map?.getLayer(PROVINCE_EXTRUSION_ID)) {
      mapRef.value.removeLayer(PROVINCE_EXTRUSION_ID)
    }
  },
  onEnter: () => {
    if (provinceAreaGeoJSON.value?.features?.length) {
      mapRef.value.loadEditableAreas(provinceAreaGeoJSON.value)
    }
    rightPanelMode.value = 'list'
    listExpanded.value = false
    activeEditTool.value = ''
  },
  onBelowThreshold: () => {
    const draw = mapRef.value?.getDraw()
    if (draw?.getMode?.() === 'draw_polygon') {
      draw.changeMode('simple_select')
    }

    const map = mapRef.value?.getMap()
    if (map?.getLayer(PROVINCE_EXTRUSION_ID)) {
      map.setLayoutProperty(PROVINCE_EXTRUSION_ID, 'visibility', 'visible')

      const eventLayerId = provinceEventLayerId
      if (map.getLayer(eventLayerId)) {
        map.setLayoutProperty(eventLayerId, 'visibility', 'visible')
      }
    } else {
      renderSelectedProject(activeProject.value)
    }
  },
  onExit: () => {
    mapRef.value.clearEditableAreas()
    clearExistingAreaSelection()
    resetNewAreaState()
    activeEditTool.value = ''
    rightPanelMode.value = 'list'
  }
})

function syncMapDisplayByZoom() {
  syncByZoom()
}

function focusCity(cityName) {
  if (!cityName || !mapRef.value) return

  const map = mapRef.value.getMap()
  const feature = shaanxiBoundary.features.find(
    (item) => item.properties?.name === cityName
  )
  const coords = feature ? centroidOfFeature(feature) : null

  if (!coords) return

  map.flyTo({
    center: coords,
    zoom: AREA_ZOOM_THRESHOLD + 0.5,
    pitch: 45,
    duration: 1500,
  })
}

function centroidOfFeature(feature) {
  const coords = feature?.geometry?.coordinates
  if (!coords) return null
  const ring = Array.isArray(coords[0][0]) ? coords[0] : coords
  let sx = 0
  let sy = 0
  let n = 0
  ring.forEach(([x, y]) => {
    sx += x
    sy += y
    n += 1
  })
  return n ? [sx / n, sy / n] : null
}

function bindCityClick() {
  if (!mapRef.value) return

  mapRef.value.onClick(provinceEventLayerId, (feature) => {
    const cityName = feature.properties?.name
    if (cityName) focusCity(cityName)
  })
}

function bindDrawEvents() {
  const map = mapRef.value?.getMap()
  if (!map) return

  drawCreateHandler = onDrawCreate
  drawSelectionChangeHandler = onDrawSelectionChange
  drawUpdateHandler = onDrawUpdate
  drawDeleteHandler = onDrawDelete

  map.on('draw.create', drawCreateHandler)
  map.on('draw.selectionchange', drawSelectionChangeHandler)
  map.on('draw.update', drawUpdateHandler)
  map.on('draw.delete', drawDeleteHandler)
}

function unbindDrawEvents() {
  const map = mapRef.value?.getMap()
  if (!map) return

  if (drawCreateHandler) map.off('draw.create', drawCreateHandler)
  if (drawSelectionChangeHandler) {
    map.off('draw.selectionchange', drawSelectionChangeHandler)
  }
  if (drawUpdateHandler) map.off('draw.update', drawUpdateHandler)
  if (drawDeleteHandler) map.off('draw.delete', drawDeleteHandler)

  drawCreateHandler = null
  drawSelectionChangeHandler = null
  drawUpdateHandler = null
  drawDeleteHandler = null
}

function onDrawCreate(event) {
  const feature = event?.features?.[0]
  if (!feature || feature.geometry?.type !== 'Polygon') return

  newAreaFeatureId.value = feature.id
  newAreaName.value = ''
  isDrawing.value = false
  clearExistingAreaSelection()
  clearPanelMessage()
}

function onDrawSelectionChange(event) {
  if (suppressSelectionEvents) return

  const features = (event?.features || []).filter(
    (feature) => feature.id !== newAreaFeatureId.value
  )

  if (!features.length) {
    if (!newAreaFeatureId.value) {
      clearExistingAreaSelection()
    }
    return
  }

  if (activeEditTool.value !== 'area') {
    const draw = mapRef.value?.getDraw()
    suppressSelectionEvents = true
    try {
      draw?.changeMode('simple_select')
    } finally {
      suppressSelectionEvents = false
    }
    openDetailForFeature(features[0])
    return
  }

  selectedAreaFeatures.value = features.map((feature) => cloneValue(feature))
  selectedArea.value = cloneValue(features[0])
  originalSelectedArea.value = cloneValue(features[0])
  editAreaName.value = getFeatureAreaName(features[0])
  clearPanelMessage()

  if (
    features.length === 1 &&
    features[0].geometry?.type === 'Polygon'
  ) {
    nextTick(() => {
      const draw = mapRef.value?.getDraw()
      if (!draw || draw.getMode() === 'direct_select') return

      draw.changeMode('direct_select', {
        featureId: features[0].id,
      })
    })
  }
}

function onDrawUpdate(event) {
  const features = event?.features || []

  if (newAreaFeatureId.value) {
    const newFeature = features.find(
      (feature) => feature.id === newAreaFeatureId.value
    )
    if (newFeature) {
      clearPanelMessage()
    }
  }

  if (selectedArea.value) {
    const selectedFeature = features.find(
      (feature) => feature.id === selectedArea.value.id
    )
    if (selectedFeature) {
      selectedArea.value = cloneValue(selectedFeature)
      selectedAreaFeatures.value = selectedAreaFeatures.value.map((feature) =>
        feature.id === selectedFeature.id
          ? cloneValue(selectedFeature)
          : feature
      )
    }
  }
}

function onDrawDelete(event) {
  const deletedIds = new Set(
    (event?.features || []).map((feature) => feature.id)
  )

  if (
    newAreaFeatureId.value &&
    deletedIds.has(newAreaFeatureId.value)
  ) {
    resetNewAreaState()
  }

  if (
    selectedArea.value &&
    deletedIds.has(selectedArea.value.id)
  ) {
    clearExistingAreaSelection()
  }
}

function startPolygonDrawing() {
  const draw = mapRef.value?.getDraw()
  if (!draw) return

  activeEditTool.value = 'area'
  rightPanelMode.value = 'list'

  clearExistingAreaSelection()
  resetNewAreaState()
  clearPanelMessage()

  isDrawing.value = true
  draw.changeMode('draw_polygon')
}

function cancelNewArea() {
  const draw = mapRef.value?.getDraw()

  if (draw && newAreaFeatureId.value) {
    draw.delete(newAreaFeatureId.value)
  } else if (draw && isDrawing.value) {
    draw.changeMode('simple_select')
  }

  resetNewAreaState()
}

function resetNewAreaState() {
  isDrawing.value = false
  newAreaFeatureId.value = null
  newAreaName.value = ''
}

async function saveNewArea() {
  const draw = mapRef.value?.getDraw()
  const feature = newAreaFeatureId.value
    ? draw?.get(newAreaFeatureId.value)
    : null

  if (!feature || !newAreaName.value) {
    setPanelMessage('请先完成多边形绘制并填写区域名称')
    return
  }

  actionLoading.value = true
  clearPanelMessage()

  try {
    const data = {
      geometry: feature.geometry,
      attributes: buildAreaAttributes(
        feature.properties,
        newAreaName.value
      ),
    }

    await api.addFeatureById(AREA_SELECT_LAYER_KEY, data)

    resetNewAreaState()
    await refreshProvinceAreaData()
    setPanelMessage('区域保存成功')
  } catch (error) {
    console.error('新增区域失败:', error)
    setPanelMessage('区域保存失败，请稍后重试')
  } finally {
    actionLoading.value = false
  }
}

function clearExistingAreaSelection() {
  selectedArea.value = null
  selectedAreaFeatures.value = []
  originalSelectedArea.value = null
  editAreaName.value = ''
}

function getCurrentSelectedFeature() {
  const draw = mapRef.value?.getDraw()
  if (!draw || !selectedArea.value) return null
  return draw.get(selectedArea.value.id)
}

function hasAreaChanged(currentFeature) {
  if (!currentFeature || !originalSelectedArea.value) return false

  const geometryChanged =
    JSON.stringify(currentFeature.geometry) !==
    JSON.stringify(originalSelectedArea.value.geometry)

  const originalName = getFeatureAreaName(originalSelectedArea.value)
  const nameChanged = editAreaName.value !== originalName

  return geometryChanged || nameChanged
}

async function saveSelectedArea() {
  if (
    !selectedArea.value ||
    selectedAreaFeatures.value.length !== 1
  ) {
    setPanelMessage('一次只能编辑一个区域')
    return
  }

  const currentFeature = getCurrentSelectedFeature()
  if (!currentFeature) {
    setPanelMessage('未找到当前编辑区域')
    return
  }

  if (!hasAreaChanged(currentFeature)) {
    setPanelMessage('区域没有发生变化')
    return
  }

  actionLoading.value = true
  clearPanelMessage()

  try {
    const data = {
      geometry: currentFeature.geometry,
      attributes: buildAreaAttributes(
        currentFeature.properties,
        editAreaName.value
      ),
      updatedBy: UPDATED_BY,
    }

    await api.updateFeatureById(
      AREA_SELECT_LAYER_KEY,
      getFeatureGuid(selectedArea.value),
      data
    )

    clearExistingAreaSelection()
    await refreshProvinceAreaData()
    setPanelMessage('区域更新成功')
  } catch (error) {
    console.error('更新区域失败:', error)
    setPanelMessage('区域更新失败，请稍后重试')
  } finally {
    actionLoading.value = false
  }
}

function cancelSelectedArea() {
  const draw = mapRef.value?.getDraw()
  const original = originalSelectedArea.value

  if (!draw || !original) {
    clearExistingAreaSelection()
    return
  }

  suppressSelectionEvents = true

  try {
    draw.delete(original.id)
    draw.add(cloneValue(original))
    draw.changeMode('simple_select')
  } finally {
    suppressSelectionEvents = false
  }

  clearExistingAreaSelection()
  clearPanelMessage()
}

function openDeleteConfirm() {
  if (!selectedAreaFeatures.value.length) {
    setPanelMessage('请先选择要删除的区域')
    return
  }

  deleteConfirmVisible.value = true
}

function closeDeleteConfirm() {
  if (actionLoading.value) return
  deleteConfirmVisible.value = false
}

async function confirmDelete() {
  const guids = selectedAreaFeatures.value
    .map((feature) => getFeatureGuid(feature))
    .filter(Boolean)

  if (!guids.length) {
    deleteConfirmVisible.value = false
    return
  }

  actionLoading.value = true
  clearPanelMessage()

  try {
    const data = {
      guids,
      updatedBy: UPDATED_BY,
    }

    await api.deletFeatureById(AREA_SELECT_LAYER_KEY, data)

    deleteConfirmVisible.value = false
    clearExistingAreaSelection()
    await refreshProvinceAreaData()
    setPanelMessage('区域删除成功')
  } catch (error) {
    console.error('删除区域失败:', error)
    setPanelMessage('区域删除失败，请稍后重试')
  } finally {
    actionLoading.value = false
  }
}

// ---- 区域列表 / 项目详情 面板联动 ----
// 地图上直接点击区域 feature（非编辑态）：打开详情面板。
function openDetailForFeature(feature) {
  const guid = getFeatureGuid(feature)
  activeAreaId.value = guid || null
  flyToProjectCenter(activeProjectDetail.value)
  rightPanelMode.value = 'detail'
}

function flyToProjectCenter(project) {
  const map = mapRef.value?.getMap()
  if (!map || !project?.center) return

  map.flyTo({
    center: project.center,
    zoom: project.zoom || AREA_ZOOM_THRESHOLD + 1.5,
    pitch: 0,
    duration: 1200,
  })
}

function handleBackToList() {
  rightPanelMode.value = 'list'
  listExpanded.value = true
  activeEditTool.value = ''
}

function handleReportConfirm(payload) {
  const option = payload?.option || payload
  const project = payload?.project || activeProjectDetail.value

  if (project) {
    activeProjectDetail.value = {
      ...activeProjectDetail.value,
      ...project,
    }
  }

  reportModalVisible.value = false

  if (reportKeyToWizardMode[option?.key] !== undefined) {
    wizardMode.value = reportKeyToWizardMode[option.key]
    wizardVisible.value = true
  } else {
    console.log('待接入的报告类型：', option)
  }
}

function handleWizardSaveDraft(payload) {
  // StepOne 已经调用 saveUpdateProject。
  // 这里保留入口，后续可以补充页面提示或刷新项目列表。
  console.log('第一步草稿已保存：', payload)
}

function handleWizardSubmit(payload) {
  // 第一步点击“下一步”成功后，ReportWizard 才会进入第二步。
  // 第三步完成后会从这里收到完整向导数据。
  console.log('报告向导提交：', payload)
  wizardVisible.value = false
}


// ---- 地图 ready ----
function onMapReady() {
  mapReady.value = true

  renderSelectedProject(activeProject.value)

  mapRef.value?.addCentroidLabels({
    id: 'shaanxi-labels',
    geojson: shaanxiBoundary,
    labelField: 'name',
    subLabelField: 'value',
    textColor: '#FFFFFF',
    textSize: 14,
    subTextSize: 10,
    textOffset: [0, 0],
  })

  bindCityClick()
  bindDrawEvents()
  bindZoomListener()

  nextTick(() => {
    syncMapDisplayByZoom()
  })

  if (Object.keys(layerDataMap.value).length > 0) {
    renderDynamicLayers()
  }
}

function onProjectStageSelect(row) {
  activeProject.value = row
  selectedStage.value = row.key || row.stage

  if (mapReady.value) {
    renderSelectedProject(row)
    syncMapDisplayByZoom()
  }
}

// ---- 生命周期 ----
onMounted(async () => {
  await Promise.all([
    loadLayers(),
    fetchAllProvinceAreaData(),
    fetchStageList(),
    fetchProjectList(),
  ])
})

onUnmounted(() => {
  unbindZoomListener()
  unbindDrawEvents()
})
</script>

<style scoped>
.dashboard-page {
  --global-head-height: 56px;
  --dashboard-side-top: clamp(70px, 9.5vh, 112px);
  --dashboard-side-bottom-gap: 10px;

  position: relative;
  width: 100%;
  height: calc(100dvh - var(--global-head-height));
  min-height: 0;
  overflow: hidden;
  background: #03162e;
}

.map-overlay {
  position: absolute;
  z-index: 2;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(
      circle at 53% 52%,
      transparent 0 21%,
      rgba(1, 17, 41, 0.06) 43%,
      rgba(1, 10, 27, 0.35) 100%
    ),
    linear-gradient(180deg, rgba(0, 16, 44, 0.12), rgba(0, 10, 30, 0.2));
}

.head-layer {
  position: absolute;
  z-index: 10;
  top: 0;
  right: 0;
  left: 0;
}

.left-layer,
.right-layer {
  position: absolute;
  z-index: 20;
  top: var(--dashboard-side-top);
  height: calc(
    100% - var(--dashboard-side-top) - var(--dashboard-side-bottom-gap)
  );
  max-height: calc(
    100% - var(--dashboard-side-top) - var(--dashboard-side-bottom-gap)
  );
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-color: rgba(82, 190, 245, 0.55) transparent;
  scrollbar-width: thin;
}

.left-layer {
  left: clamp(12px, 1.35vw, 26px);
}

.right-layer {
  right: clamp(12px, 1.35vw, 26px);
}

.left-layer::-webkit-scrollbar,
.right-layer::-webkit-scrollbar {
  width: 4px;
}

.left-layer::-webkit-scrollbar-track,
.right-layer::-webkit-scrollbar-track {
  background: transparent;
}

.left-layer::-webkit-scrollbar-thumb,
.right-layer::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(82, 190, 245, 0.55);
}

/* 区域视图：编辑工具栏 + 列表/详情面板 纵向堆叠 */
.area-view-layer {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  overflow: visible;
}

.panel-below {
  flex: 1;
  min-height: 0;
}

.map-mode-switch {
  position: absolute;
  z-index: 20;
  top: clamp(12px, 2vh, 20px);
  left: clamp(12px, 1.35vw, 26px);
}

@media (max-width: 700px) {
  .dashboard-page {
    overflow: auto;
  }

  .left-layer,
  .right-layer {
    position: relative;
    top: auto;
    right: auto;
    left: auto;
    height: auto;
    max-height: none;
    margin-right: 12px;
    margin-left: 12px;
    overflow: visible;
  }

  .left-layer {
    margin-top: 84px;
  }

  .right-layer {
    margin-top: 12px;
  }

  .area-view-layer {
    align-items: stretch;
  }
}
</style>