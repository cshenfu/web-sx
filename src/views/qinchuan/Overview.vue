<!-- Dashboard-area-editor.vue -->
<template>
  <main class="dashboard-page">
    <MapGL ref="mapRef" :style="satelliteStyle" @ready="onMapReady" />

    <div class="map-overlay" aria-hidden="true" />

    <LayerChipPanel
      v-if="!isAreaView || viewMode === 'map'"
      :visible-ids="layerVisibleIds"
      :offset="layerPanelOffset"
      :z-index="layerPanelZIndex"
      @toggle="onLayerToggle"
    />

    <!-- ===================== 缩小时：head + 左右 dashboard ===================== -->
    <template v-if="!isAreaView">
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

      <RightDashboard class="right-layer" />
    </template>

    <!-- ===================== 放大时：无 head ===================== -->
    <template v-else>
      <!-- 顶部：地图模式 / 项目列表 -->
      <div class="area-top-toolbar">
        <div class="view-tabs">
          <button
            class="view-tab"
            :class="{ active: viewMode === 'map' }"
            @click="viewMode = 'map'"
          >
            <el-icon><MapLocation /></el-icon>
            地图模式
          </button>
          <button
            class="view-tab"
            :class="{ active: viewMode === 'list' }"
            @click="viewMode = 'list'"
          >
            <el-icon><List /></el-icon>
            项目列表
          </button>
        </div>
      </div>

      <!-- ──────── 地图模式 ──────── -->
      <template v-if="viewMode === 'map'">
        <aside v-if="!wizardVisible" class="area-summary">
          <ProjectOverview
            v-model="selectedStage"
            :rows="projectOverviewRows"
            @select="onProjectStageSelect"
          />
        </aside>

        <ReportWizard
          v-else
          class="area-summary wizard-layer"
          :create-project-mode="wizardMode"
          :project-name="activeProjectDetail?.name || activeProjectDetail?.projectName || ''"
          :project="activeProjectDetail"
          @close="wizardVisible = false"
          @save-draft="handleWizardSaveDraft"
          @submit="handleWizardSubmit"
        />

        <div class="area-view-layer" v-show="!popoverProject">
          <template v-if="!selectedProject">
            <ProjectListPanel
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
              @add="handleAddProject"
            />
          </template>

          <template v-else>
            <ProjectDetailPanel
              class="panel-below"
              :project="activeProjectDetail"
              :is-fullscreen="isDetailFullscreen"
              @toggle-fullscreen="isDetailFullscreen = !isDetailFullscreen"
              @back="handleBackToList"
              @generate-report="reportModalVisible = true"
            />
          </template>
        </div>

        <!-- 🌟 1. 悬浮深色气泡窗 -->
        <div
          v-if="hoverProject && detailCardPos.visible && !isDetailFullscreen && !popoverProject && !selectedProject"
          class="hover-tooltip"
          :style="{ left: detailCardPos.x + 'px', top: detailCardPos.y + 'px' }"
          @mouseenter="clearHideTimer"
          @mouseleave="startHideTimer"
        >
          <span class="corner top-left" :style="{ borderColor: getHoverThemeColor(hoverProject.projectStage) }"></span>
          <span class="corner bottom-left" :style="{ borderColor: getHoverThemeColor(hoverProject.projectStage) }"></span>

          <div class="tooltip-title" :style="{ color: getHoverThemeColor(hoverProject.projectStage) }">
            {{ hoverProject.projectName }}
          </div>
          <div class="tooltip-row">
            <span class="tooltip-label">项目状态：</span>
            <span class="tooltip-value" :style="{ color: getHoverThemeColor(hoverProject.projectStage) }">
              {{ stageMap[hoverProject.projectStage] || '已投产' }}
            </span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-label">收益率：</span>
            <span class="tooltip-value">
              {{ hoverProject.capitalFinancialRate != null ? hoverProject.capitalFinancialRate + '%' : '-' }}
            </span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-label">所属单位：</span>
            <span class="tooltip-value">{{ hoverProject.managerCompany || '-' }}</span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-label">项目地址：</span>
            <span class="tooltip-value">{{ formatRegion(hoverProject) }}</span>
          </div>
        </div>

        <!-- 🌟 2. 点击后右上角白色卡片 -->
        <div
          v-if="popoverProject && !isDetailFullscreen && !selectedProject"
          class="right-top-card"
        >
          <div class="tooltip-header">
            <div class="tooltip-status">
              <span class="status-dot" :style="{ background: getHoverThemeColor(popoverProject.projectStage) }"></span>
              <span class="status-text" :style="{ color: getHoverThemeColor(popoverProject.projectStage) }">
                {{ popoverProject.itemType === 'GF' ? '光伏项目' : '风电项目' }}·在研
              </span>
            </div>
            <div class="tooltip-title">{{ popoverProject.projectName }}</div>
          </div>

          <div class="tooltip-grid">
            <div class="grid-item border-right border-bottom">
              <div class="grid-label">装机容量</div>
              <div class="grid-value">
                {{ popoverProject.currentProjectCapacity ?? '-' }} <span class="unit">MW</span>
              </div>
            </div>
            <div class="grid-item border-bottom">
              <div class="grid-label">风机数量</div>
              <div class="grid-value text-blue">
                {{ popoverWindCount }} <span class="unit">台</span>
                <span v-if="popoverAltCount > 0" class="sub-text">（备选{{ popoverAltCount }}台）</span>
              </div>
            </div>
            <div class="grid-item border-right">
              <div class="grid-label">推荐机型</div>
              <div class="grid-value">
                <span class="bold">{{ popoverProject.recommendedModel?.split(' ')[0] || 'MySE' }}</span>
                <span class="sub-text">{{ popoverProject.recommendedModel?.split(' ')[1] || '5.0-200' }}</span>
              </div>
            </div>
            <div class="grid-item">
              <div class="grid-label">资本金IRR</div>
              <div class="grid-value text-red">
                {{ popoverProject.capitalFinancialRate != null ? popoverProject.capitalFinancialRate : '5.96' }} <span class="unit">%</span>
              </div>
            </div>
          </div>

          <div class="tooltip-footer" @click.stop="handleOpenDetailPanel(popoverProject)">
            <div class="footer-left">
              <el-icon><Edit /></el-icon> 推荐机型
            </div>
            <div class="footer-right">
              查看详情 <el-icon><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
      </template>

      <!-- ──────── 项目列表模式 ──────── -->
      <section v-else class="area-list-view">
        <div class="list-heading">
          <div class="list-title">
            <el-icon><List /></el-icon>
            项目列表
          </div>
          <el-button type="primary" size="small" @click="handleAddProject">
            <el-icon><Plus /></el-icon>
            添加项目
          </el-button>
        </div>

        <div class="list-search-bar">
          <el-select v-model="filters.itemType" placeholder="项目类型" size="small" clearable style="width: 120px">
            <el-option label="风电" value="FD" />
            <el-option label="光伏" value="GF" />
          </el-select>
          <el-select v-model="filters.city" placeholder="市/区" size="small" clearable style="width: 120px">
            <el-option v-for="c in CITY_OPTIONS" :key="c.value" :label="c.label" :value="c.value" />
          </el-select>
          <el-select v-model="filters.managerCompany" placeholder="项目所属" size="small" clearable style="width: 150px">
            <el-option label="XX能源有限公司" value="XX能源有限公司" />
          </el-select>
          <el-select v-model="filters.stage" placeholder="项目阶段" size="small" clearable style="width: 140px">
            <el-option v-for="opt in stageOptions" :key="opt.code" :label="opt.desc" :value="opt.code" />
          </el-select>
          <el-input v-model="filters.projectName" placeholder="项目名称" size="small" clearable style="width: 200px" @keyup.enter="handleSearch">
            <template #suffix>
              <el-icon @click="handleSearch"><Search /></el-icon>
            </template>
          </el-input>
          <el-button size="small" type="primary" @click="handleSearch">查询</el-button>
        </div>

        <el-table v-loading="listLoading" :data="projectList" size="small" stripe class="project-table" @sort-change="handleTableSortChange">
          <el-table-column label="项目编号" min-width="140">
            <template #default="{ row }">{{ row.projectCode || '-' }}</template>
          </el-table-column>
          <el-table-column label="项目名称" min-width="240" show-overflow-tooltip>
            <template #default="{ row }">{{ row.projectName || '-' }}</template>
          </el-table-column>
          <el-table-column label="装机容量MW" width="140" prop="currentProjectCapacity" sortable="custom">
            <template #default="{ row }">{{ row.currentProjectCapacity ?? '-' }}</template>
          </el-table-column>
          <el-table-column label="资本金财务内部收益率%" width="200" prop="capitalFinancialRate" sortable="custom">
            <template #default="{ row }">
              {{ row.capitalFinancialRate != null ? row.capitalFinancialRate + '%' : '-' }}
            </template>
          </el-table-column>
          <el-table-column label="阶段" width="120">
            <template #default="{ row }">{{ stageMap[row.projectStage] || '-' }}</template>
          </el-table-column>
          <el-table-column label="所属" min-width="140" show-overflow-tooltip>
            <template #default="{ row }">{{ row.managerCompany || '-' }}</template>
          </el-table-column>
          <el-table-column label="负责人" width="100">
            <template #default="{ row }">{{ row.managerName || '-' }}</template>
          </el-table-column>
          <el-table-column label="创建时间" width="170">
            <template #default="{ row }">{{ row.createTime || '-' }}</template>
          </el-table-column>
        </el-table>

        <div class="pagination-row">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            small
            background
            layout="total, sizes, prev, pager, next, jumper"
            :total="pagination.total"
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
          />
        </div>
      </section>
    </template>

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
  ref, computed, reactive, watch, onMounted, onUnmounted, nextTick
} from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { List, MapLocation, Plus, Search, Edit, ArrowRight } from '@element-plus/icons-vue'

import MapGL from '@/components/MapGL.vue'
import LayerChipPanel from '@/components/site-map/LayerChipPanel.vue'
import { WHLN_LAYER_IDS } from '@/components/site-map/layerPanelConfig'
import { attachSxLayers } from '@/components/site-map/attachSxLayers'
import DashboardHead from './components/DashboardHead.vue'
import LeftDashboard from './components/LeftDashboard.vue'
import RightDashboard from './components/RightDashboard.vue'
import ProjectOverview from './components/ProjectOverview.vue'
import ProjectListPanel from './components/area-panel/ProjectListPanel.vue'
import ProjectDetailPanel from './components/area-panel/ProjectDetailPanel.vue'
import ReportGenerateModal from './components/area-panel/ReportGenerateModal.vue'
import ReportWizard from './components/report-wizard/ReportWizard.vue'
import { PACKAGE_TYPE } from './js/Reportwizardmockdata'
import { projectOverviewRows, stageCityData } from './js/dashboardMcokData'
import { buildStageColorMap } from './js/mapStageColor'
import { projectDetailMockData } from './js/areaPanelMockData'
import { buildMainInfoFromAi } from './js/aiProjectAdapter'
import * as newApi from '@/api/modules/project'

import {
  satelliteStyle,
  shaanxiBoundary,
  AREA_ZOOM_THRESHOLD,
  PROVINCE_EXTRUSION_ID
} from './js/mapConfig'
import { cloneValue } from './js/geoUtils'
import { useZoomThresholdSwitch } from './js/useZoomThresholdSwitch'

import fengjiIcon from '@/assets/img/mapIcon/fengji.png'
import shengyazhanIcon from '@/assets/img/mapIcon/syz.png'
import shaanxiOutline610000 from '/public/geojson/610000.json'

// ==================== 常量 ====================
const CITY_OPTIONS = [
  { label: '西安市', value: '610100' }, { label: '铜川市', value: '610200' },
  { label: '宝鸡市', value: '610300' }, { label: '咸阳市', value: '610400' },
  { label: '渭南市', value: '610500' }, { label: '延安市', value: '610600' },
  { label: '汉中市', value: '610700' }, { label: '榆林市', value: '610800' },
  { label: '安康市', value: '610900' }, { label: '商洛市', value: '611000' }
]

const ICON_FENGJI = 'icon-fengji-overview'
const ICON_SHENGYAZHAN = 'icon-shengyazhan-overview'
const ICON_SIZE_WIND = 0.16
const ICON_SIZE_BOOSTER = 0.5

// 省级 3D 地图样式（取自 Figma：冰蓝顶面 + #0072FF→白 渐变侧面）
const PROVINCE_MAP_STYLE = {
  defaultHeight: 20000,
  defaultColor: '#8CCBF5',
  highlightColor: '#EFA83D',
  opacity: 1,
  lineColor: '#E6F9FF',
  hoverLineColor: '#FFFFFF',
  borderWidth: 1000,   // 边界宽度(米)，想更粗/更细改这里
  borderHeight: 120,   // 边界凸出顶面的高度(米)
  sideColors: ['#0072FF', '#2F8CFF', '#62A8FF', '#9AC7FF', '#D0E5FF', '#FFFFFF'],
  sideBands: 10,       // 侧面渐变层数，globe 下 10 层足够平滑、深度冲突更少
}

const STAGE_GROUP = {
  PRELIMINARY_SELECTION: 'selection',
  PROJECT_RESERVE: 'reserved',
  PROJECT_INITIATION: 'planning',
  FEASIBILITY_REVIEW: 'planning',
  INVESTMENT_DECISION: 'planning',
  PROJECT_CONSTRUCTION: 'construction',
  PROJECT_OPERATION: 'operating'
}

const GROUP_AREA_STYLE = {
  selection:    { color: '#9254de', opacity: 0.22, outlineColor: '#b37feb' },
  reserved:     { color: '#E8059B', opacity: 0.22, outlineColor: '#f759ab' },
  planning:     { color: '#fa8c16', opacity: 0.22, outlineColor: '#ffc069' },
  construction: { color: '#597ef7', opacity: 0.22, outlineColor: '#85a5ff' },
  operating:    { color: '#a0d911', opacity: 0.22, outlineColor: '#d3f261' },
  unknown:      { color: '#94a3b8', opacity: 0.18, outlineColor: '#cbd5e1' }
}

function getAreaStyleByStage(projectStage) {
  let group = STAGE_GROUP[projectStage]
  if (!group) {
    const opt = stageOptions.value.find(o => o.code === projectStage)
    const desc = opt?.desc || ''
    if (desc.includes('遴选')) group = 'selection'
    else if (desc.includes('储备')) group = 'reserved'
    else if (desc.includes('立项') || desc.includes('可研') || desc.includes('投资决策')) group = 'planning'
    else if (desc.includes('施工')) group = 'construction'
    else if (desc.includes('运营') || desc.includes('投产')) group = 'operating'
  }
  return GROUP_AREA_STYLE[group || 'unknown']
}

// ==================== 基础状态 ====================
const mapRef = ref(null)
const selectedStage = ref(null)          // 初始无选中
const activeProject = ref(null)          // 初始无选中 → 地图为默认态
const mapReady = ref(false)

const viewMode = ref('map')
const showLayerPanel = ref(false)
let whlnPlugin = null
const layerVisibleIds = ref(['hd-imagery'])
const isDetailFullscreen = ref(false)

const activeEditTool = ref('')
const rightPanelMode = ref('list')
const listExpanded = ref(false)
const activeAreaId = ref(null)
const activeProjectDetail = ref(projectDetailMockData)
const reportModalVisible = ref(false)
const detailLoading = ref(false)

// 🌟 三个关键状态
const hoverProject = ref(null)     // 悬浮深色气泡
const popoverProject = ref(null)   // 点击后的右上角白卡
const selectedProject = ref(null)  // 点击查看详情后的完整面板

const detailCardPos = reactive({ x: 0, y: 0, visible: false })

const hoverHandlers = new Map()
let hideTimer = null

const wizardVisible = ref(false)
const wizardMode = ref(PACKAGE_TYPE.default)
const reportKeyToWizardMode = {
  'feasibility-centralized': PACKAGE_TYPE.default,
  'feasibility-distributed': PACKAGE_TYPE.distributedDefault,
  'feasibility-base': PACKAGE_TYPE.baseDefault
}

const projectList = ref([])
const listLoading = ref(false)
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
const filters = reactive({ itemType: '', city: '', managerCompany: '', stage: '', projectName: '' })

const sortKey = ref('')
const sortDir = ref('desc')
const stageOptions = ref([])
const stageMap = computed(() => Object.fromEntries(stageOptions.value.map((item) => [item.code, item.desc])))

const popoverWindCount = computed(() => {
  const pts = popoverProject.value?.windTurbinePoints || []
  return pts.filter((p) => !p.isAlternative).length
})
const popoverAltCount = computed(() => {
  const pts = popoverProject.value?.windTurbinePoints || []
  return pts.filter((p) => p.isAlternative).length
})

// ==================== 悬浮交互逻辑 ====================
function clearHideTimer() {
  if (hideTimer) { clearTimeout(hideTimer); hideTimer = null }
}

function startHideTimer() {
  clearHideTimer()
  hideTimer = setTimeout(() => {
    hoverProject.value = null
    detailCardPos.visible = false
  }, 200)
}

function getHoverThemeColor(projectStage) {
  const style = getAreaStyleByStage(projectStage)
  return style.outlineColor || '#22c55e'
}

function formatRegion(row) {
  const names = [row.cityName, row.districtName].filter(Boolean)
  return names.length ? names.join('/') : (row.address || '未知区域')
}

// ==================== 场区坐标工具 ====================
function getProjectCoords(project) {
  return (project?.coordinate || [])
    .map((c) => [Number(c.longitude), Number(c.latitude)])
    .filter(([lng, lat]) => Number.isFinite(lng) && Number.isFinite(lat))
}

function getProjectCentroid(project) {
  let coords = getProjectCoords(project)
  if (coords.length >= 2) {
    const [fx, fy] = coords[0]
    const [lx, ly] = coords[coords.length - 1]
    if (fx === lx && fy === ly) coords = coords.slice(0, -1)
  }
  if (!coords.length) return null
  let sumLng = 0, sumLat = 0
  for (const [lng, lat] of coords) { sumLng += lng; sumLat += lat }
  return [sumLng / coords.length, sumLat / coords.length]
}

function getProjectBounds(project) {
  const coords = getProjectCoords(project)
  if (!coords.length) return null
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity
  for (const [lng, lat] of coords) {
    if (lng < minLng) minLng = lng
    if (lng > maxLng) maxLng = lng
    if (lat < minLat) minLat = lat
    if (lat > maxLat) maxLat = lat
  }
  if (minLng === maxLng && minLat === maxLat) return null
  return [[minLng, minLat], [maxLng, maxLat]]
}

// ==================== 核心点击事件 ====================
function handleProjectSelect(item) {
  hoverProject.value = null
  detailCardPos.visible = false
  clearHideTimer()

  popoverProject.value = item

  const map = mapRef.value?.getMap()
  const bounds = getProjectBounds(item)
  const center = getProjectCentroid(item)

  if (map) {
    if (bounds) {
      map.fitBounds(bounds, { padding: { top: 110, bottom: 80, left: 340, right: 40 }, maxZoom: AREA_ZOOM_THRESHOLD + 4, duration: 1200 })
    } else if (center) {
      map.flyTo({ center, zoom: AREA_ZOOM_THRESHOLD + 1.5, pitch: 0, duration: 1200 })
    }
  }

  addProjectArea(item, true)
  renderSelectedProjectIcons(item)
}

async function handleOpenDetailPanel(item) {
  popoverProject.value = null
  selectedProject.value = item

  activeAreaId.value = item.id
  activeProjectDetail.value = buildDetailFromListItem(item)

  rightPanelMode.value = 'detail'
  isDetailFullscreen.value = true
  await loadAiProjectDetail(item.id)
}

// ==================== 数据请求 ====================
async function fetchStageList() {
  try {
    const res = await newApi.getStageList()
    stageOptions.value = res?.data ?? []
  } catch (err) { stageOptions.value = [] }
}

async function fetchProjectList() {
  listLoading.value = true
  try {
    const params = { pageNo: pagination.page, pageSize: pagination.pageSize, province: '610000' }
    if (filters.itemType) params.itemType = filters.itemType
    if (filters.city) params.city = filters.city
    if (filters.managerCompany) params.managerCompany = filters.managerCompany
    if (filters.stage) params.projectStage = filters.stage
    if (filters.projectName) params.projectName = filters.projectName
    if (sortKey.value === 'capacity') params.capacitySort = sortDir.value
    if (sortKey.value === 'rate') params.rateSort = sortDir.value

    const res = await newApi.getPageList(params)
    const data = res?.data ?? {}
    projectList.value = data.list ?? []
    pagination.total = Number(data.total ?? 0)
  } catch (err) {
    projectList.value = []
    pagination.total = 0
  } finally { listLoading.value = false }
}

function handleSearch() { pagination.page = 1; fetchProjectList() }
function handlePageChange(page) { pagination.page = page; fetchProjectList() }
function handleSizeChange(size) { pagination.pageSize = size; pagination.page = 1; fetchProjectList() }
function handleTableSortChange({ prop, order }) {
  if (!order) { sortKey.value = ''; sortDir.value = 'desc' }
  else {
    sortKey.value = prop === 'capitalFinancialRate' ? 'rate' : 'capacity'
    sortDir.value = order === 'ascending' ? 'asc' : 'desc'
  }
  pagination.page = 1
  fetchProjectList()
}

watch(() => filters.stage, () => { pagination.page = 1; fetchProjectList() })
watch(viewMode, (val) => { if (val === 'list' && showLayerPanel.value) showLayerPanel.value = false })

// ==================== 图层显示 ====================
const layerVisible = reactive({ wind: true, booster: true })

function applyLayerVisibility() {
  const map = mapRef.value?.getMap?.()
  if (!map) return
  const setVis = (id, visible) => { if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', visible ? 'visible' : 'none') }
  setVis('overview-project-wind-all', layerVisible.wind)
  setVis('overview-project-booster-all', layerVisible.booster)
}

function handleAddProject() { ElMessage.info('添加项目功能已停用') }

// ==================== 详情数据映射 ====================
function buildDetailFromListItem(item) {
  const base = cloneValue(projectDetailMockData)
  base.id = item.id
  base.name = item.projectName || base.name
  base.projectName = item.projectName || base.projectName || base.name
  base.code = item.projectCode || base.code
  base.projectCode = item.projectCode || base.projectCode
  base.type = item.itemType || base.type
  base.capacity = item.currentProjectCapacity ?? base.capacity
  base.stage = item.projectStage || base.stage
  base.approvalStatus = item.approvalStatus || base.approvalStatus
  base.company = item.managerCompany || base.company
  base.manager = item.managerName || base.manager
  base.notes = item.notes || base.notes
  base.address = item.address || base.address
  base.coordinate = cloneValue(item.coordinate || [])
  base.windTurbinePoints = cloneValue(item.windTurbinePoints || [])
  base.boosterStationLocations = cloneValue(item.boosterStationLocations || [])
  base.fileCollection = cloneValue(item.fileCollection || [])
  base.itemType = item.itemType
  base.currentProjectCapacity = item.currentProjectCapacity
  base.totalProjectCapacity = item.totalProjectCapacity
  base.rawProject = cloneValue(item)

  const centroid = getProjectCentroid(item)
  if (centroid) base.center = centroid
  else if (item.longitude != null && item.latitude != null) base.center = [Number(item.longitude), Number(item.latitude)]
  base.zoom = AREA_ZOOM_THRESHOLD + 1.5
  return base
}

async function loadAiProjectDetail(aiProjectId) {
  if (!aiProjectId) return
  detailLoading.value = true
  try {
    const res = await newApi.getAiProjectData(aiProjectId)
    if (res?.code === 200 && res.data) {
      const ai = res.data
      const base = activeProjectDetail.value || {}
      activeProjectDetail.value = {
        ...base, listItemId: base.id, id: ai.aiProjectId ?? aiProjectId, aiProjectId: ai.aiProjectId ?? aiProjectId,
        relationId: ai.relationId, reportProjectId: ai.reportProjectId, name: ai.reportProjectName || base.name,
        projectName: ai.reportProjectName || base.projectName, projectCode: ai.reportProjectCode || base.projectCode,
        mainInfo: buildMainInfoFromAi(ai), stageTimeList: ai.stageTimeList || [], rawAiData: ai
      }
    }
  } catch (err) { console.error('AI 项目详情加载失败:', err) }
  finally { detailLoading.value = false }
}

// ==================== 地图项目 ====================
const mapProjects = ref([])
const renderedMapLayerIds = new Set()

function buildAreaFeature(project) {
  const coords = getProjectCoords(project)
  if (coords.length < 3) return null
  const first = coords[0], last = coords[coords.length - 1]
  if (first[0] !== last[0] || first[1] !== last[1]) coords.push([first[0], first[1]])
  return {
    type: 'Feature', properties: { projectId: project.id, projectCode: project.projectCode, projectName: project.projectName, itemType: project.itemType, projectStage: project.projectStage },
    geometry: { type: 'Polygon', coordinates: [coords] }
  }
}

function buildWindFC(project) {
  return {
    type: 'FeatureCollection',
    features: (project.windTurbinePoints || []).map((p, index) => {
      const lng = Number(p.longitude); const lat = Number(p.latitude)
      if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null
      return { type: 'Feature', properties: { projectId: project.id, index, isAlternative: p.isAlternative }, geometry: { type: 'Point', coordinates: [lng, lat] } }
    }).filter(Boolean)
  }
}

function buildBoosterFC(project) {
  return {
    type: 'FeatureCollection',
    features: (project.boosterStationLocations || []).map((p, index) => {
      const lng = Number(p.lng); const lat = Number(p.lat)
      if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null
      return { type: 'Feature', properties: { projectId: project.id, index, isBest: p.isBest }, geometry: { type: 'Point', coordinates: [lng, lat] } }
    }).filter(Boolean)
  }
}

function addProjectArea(project, highlighted = false) {
  const area = buildAreaFeature(project)
  if (!area) return
  const layerId = `overview-project-area-${project.id}`
  const base = getAreaStyleByStage(project.projectStage)
  const style = highlighted ? { ...base, opacity: base.opacity + 0.16 } : base
  mapRef.value.addPolygon({ id: layerId, geojson: area, color: style.color, opacity: style.opacity, outlineColor: style.outlineColor })
  renderedMapLayerIds.add(layerId)
  const fillLayerId = `${layerId}-fill`

  mapRef.value.offClick(fillLayerId)
  mapRef.value.onClick(fillLayerId, () => handleProjectSelect(project))

  const map = mapRef.value.getMap?.()
  if (map) {
    if (hoverHandlers.has(fillLayerId)) {
      const old = hoverHandlers.get(fillLayerId)
      map.off('mouseenter', fillLayerId, old.onEnter)
      map.off('mouseleave', fillLayerId, old.onLeave)
    }

    const onEnter = () => {
      clearHideTimer()
      if (hoverProject.value?.id !== project.id) {
        hoverProject.value = project
        updateDetailCardPosition()
      }
      map.getCanvas().style.cursor = 'pointer'
    }

    const onLeave = () => {
      map.getCanvas().style.cursor = ''
      startHideTimer()
    }

    map.on('mouseenter', fillLayerId, onEnter)
    map.on('mouseleave', fillLayerId, onLeave)
    hoverHandlers.set(fillLayerId, { onEnter, onLeave })
  }
}

async function safeAddIcon({ layerId, featureCollection, iconId, iconUrl, iconSize, iconAnchor = 'center', fallbackColor = '#3b82f6', fallbackRadius = 8 }) {
  try {
    await mapRef.value.ensureImage(iconId, iconUrl)
    await mapRef.value.addImagePoints({ id: layerId, geojson: featureCollection, iconId, iconUrl, iconSize, iconAnchor })
  } catch (err) { mapRef.value.addPoints({ id: layerId, geojson: featureCollection, color: fallbackColor, radius: fallbackRadius }) }
  renderedMapLayerIds.add(layerId)
}

function clearMapIconLayers() {
  if (!mapRef.value) return
  const map = mapRef.value.getMap?.()
  for (const id of renderedMapLayerIds) {
    mapRef.value.removeLayer(id)
    if (map) {
      const fillLayerId = `${id}-fill`
      if (hoverHandlers.has(fillLayerId)) {
        const old = hoverHandlers.get(fillLayerId)
        map.off('mouseenter', fillLayerId, old.onEnter)
        map.off('mouseleave', fillLayerId, old.onLeave)
        hoverHandlers.delete(fillLayerId)
      }
    }
  }
  renderedMapLayerIds.clear()
}

async function renderSelectedProjectIcons(project) {
  if (!mapRef.value || !mapReady.value || !project) return
  clearSelectedProjectIcons()
  const wf = buildWindFC(project)
  const bf = buildBoosterFC(project)
  if (wf.features.length) {
    await safeAddIcon({ layerId: 'overview-project-wind-all', featureCollection: wf, iconId: ICON_FENGJI, iconUrl: fengjiIcon, iconSize: ICON_SIZE_WIND, iconAnchor: 'bottom' })
  }
  if (bf.features.length) {
    await safeAddIcon({ layerId: 'overview-project-booster-all', featureCollection: bf, iconId: ICON_SHENGYAZHAN, iconUrl: shengyazhanIcon, iconSize: ICON_SIZE_BOOSTER, iconAnchor: 'bottom' })
  }
  applyLayerVisibility()
}

function clearSelectedProjectIcons() {
  if (!mapRef.value) return
  const map = mapRef.value.getMap?.()
  const layers = ['overview-project-wind-all', 'overview-project-booster-all']
  layers.forEach(id => {
    if (map?.getLayer(id)) mapRef.value.removeLayer(id)
    renderedMapLayerIds.delete(id)
  })
}

async function renderProjectsByStage(stage) {
  if (!mapReady.value || !mapRef.value) return
  clearMapIconLayers()
  if (stage === 'overview') return

  for (const p of mapProjects.value) {
    addProjectArea(p, p.id === popoverProject.value?.id || p.id === selectedProject.value?.id)
  }
  if (popoverProject.value) await renderSelectedProjectIcons(popoverProject.value)
  else if (selectedProject.value) await renderSelectedProjectIcons(selectedProject.value)
}

async function fetchMapProjects() {
  try {
    const res = await newApi.getPageList({ pageNo: 1, pageSize: 500, province: '610000' })
    mapProjects.value = res?.data?.list ?? []
    if (mapReady.value && isAreaView.value) await renderProjectsByStage('area')
  } catch (err) { mapProjects.value = [] }
}

function clearSelection() {
  popoverProject.value = null
  if (selectedProject.value) {
    const pid = selectedProject.value.id
    const project = mapProjects.value.find((p) => p.id === pid)
    if (project && isAreaView.value) addProjectArea(project, false)
    selectedProject.value = null
  }
  detailCardPos.visible = false
  rightPanelMode.value = 'list'
  isDetailFullscreen.value = false
  clearSelectedProjectIcons()
}

function handleBackToList() {
  clearSelection()
  listExpanded.value = true
  activeEditTool.value = ''
}

function updateDetailCardPosition() {
  const p = hoverProject.value
  if (!p || !mapRef.value) { detailCardPos.visible = false; return }
  const centroid = getProjectCentroid(p)
  if (!centroid) { detailCardPos.visible = false; return }
  const map = mapRef.value.getMap()
  if (!map) return
  const point = map.project(centroid)
  detailCardPos.x = point.x
  detailCardPos.y = point.y
  detailCardPos.visible = true
}

function handleMapBlankClick(e) {
  if (!isAreaView.value) return
  const map = mapRef.value?.getMap()
  if (!map) return
  const areaLayerIds = []
  for (const id of renderedMapLayerIds) {
    if (id.startsWith('overview-project-area-')) areaLayerIds.push(`${id}-fill`)
  }
  if (!areaLayerIds.length) return
  if (!map.queryRenderedFeatures(e.point, { layers: areaLayerIds }).length) clearSelection()
}

// ==================== 阶段选择 ====================
// row 为 null 时：渲染默认态（所有城市统一底色，无阶段着色）
function renderSelectedProject(row) {
  if (!mapRef.value) return
  const colorMap = row
    ? buildStageColorMap(stageCityData[row.key] || {}, row.color)
    : {}

  mapRef.value.addExtrusion({
    id: PROVINCE_EXTRUSION_ID,
    geojson: shaanxiBoundary,
    colorMap,
    enableHover: true,
    ...PROVINCE_MAP_STYLE
  })
}

function onProjectStageSelect(row) {
  activeProject.value = row || null
  selectedStage.value = row ? (row.key || row.stage) : null
  if (mapReady.value && !isAreaView.value) renderSelectedProject(row || null)
}

// ==================== 遮罩与阈值 ====================
const MASK_LAYER_ID = 'shaanxi-mask'
const MASK_COLOR = '#000000'
const MASK_MAX_OPACITY = 1.0
const MASK_FADE_DURATION = 300
const MASK_FULL_ZOOM_OFFSET = 1.5

let lastMaskOpacity = -1

function ensureClosed(ring) { if (!ring || ring.length < 3) return ring; const f = ring[0], l = ring[ring.length - 1]; return (f[0] === l[0] && f[1] === l[1]) ? ring : [...ring, [f[0], f[1]]] }
function ringSignedArea(ring) { if (!ring || ring.length < 3) return 0; let a = 0; for (let i = 0; i < ring.length - 1; i++) { a += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1] } return a / 2 }
function ensureOuterCCW(ring) { const r = ensureClosed(ring); return ringSignedArea(r) >= 0 ? r : r.slice().reverse() }
function ensureHoleCW(ring) { const r = ensureClosed(ring); return ringSignedArea(r) <= 0 ? r : r.slice().reverse() }
const WORLD_OUTER = ensureOuterCCW([[-180, -85], [180, -85], [180, 85], [-180, 85], [-180, -85]])

function buildMaskGeoJSON(boundary) {
  const holes = []
  for (const feature of boundary?.features || []) {
    const geom = feature?.geometry; if (!geom) continue
    const polygons = geom.type === 'Polygon' ? [geom.coordinates] : geom.type === 'MultiPolygon' ? geom.coordinates : []
    for (const polygon of polygons) { const outerRing = polygon?.[0]; if (!outerRing || outerRing.length < 4) continue; holes.push(ensureHoleCW(outerRing)) }
  }
  if (!holes.length) return { type: 'FeatureCollection', features: [] }
  return { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [WORLD_OUTER, ...holes] } }] }
}

function smoothstep(e0, e1, x) { if (e1 <= e0) return x >= e1 ? 1 : 0; const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t) }

function computeMaskOpacity() {
  if (!isAreaView.value) return 0
  const map = mapRef.value?.getMap?.(); if (!map) return 0
  const z = map.getZoom()
  return smoothstep(AREA_ZOOM_THRESHOLD, AREA_ZOOM_THRESHOLD + MASK_FULL_ZOOM_OFFSET, z) * MASK_MAX_OPACITY
}

function syncMaskVisibility(force = false) {
  if (!mapRef.value || !mapRef.value.hasMaskLayer(MASK_LAYER_ID)) return
  const target = computeMaskOpacity()
  if (!force && Math.abs(target - lastMaskOpacity) < 0.01) return
  lastMaskOpacity = target
  mapRef.value.bringMaskToTop(MASK_LAYER_ID)
  mapRef.value.setMaskOpacity(MASK_LAYER_ID, target)
}

function ensureShaanxiMask() {
  if (!mapRef.value || !mapReady.value) return
  if (mapRef.value.hasMaskLayer(MASK_LAYER_ID)) { syncMaskVisibility(true); return }
  try {
    const data = buildMaskGeoJSON(shaanxiOutline610000); if (!data.features.length) return
    mapRef.value.addMaskLayer({ id: MASK_LAYER_ID, geojson: data, color: MASK_COLOR, opacity: 0, fadeDuration: MASK_FADE_DURATION })
    lastMaskOpacity = -1; syncMaskVisibility(true)
  } catch (err) { console.error('[mask] 陕西省遮罩加载失败:', err) }
}

function onLayerToggle(item) {
  const isOn = layerVisibleIds.value.includes(item.id)
  const next = isOn
    ? layerVisibleIds.value.filter((id) => id !== item.id)
    : [...layerVisibleIds.value, item.id]
  layerVisibleIds.value = next
  if (item.type === 'whln') {
    whlnPlugin?.setVisibleIds?.(next.filter((id) => WHLN_LAYER_IDS.includes(id)))
  }
}

const provinceEventLayerId = `${PROVINCE_EXTRUSION_ID}-event`
const { isAreaView, syncByZoom, bindZoomListener, unbindZoomListener } = useZoomThresholdSwitch({
  mapRef, zoomThreshold: AREA_ZOOM_THRESHOLD,
  onAboveThreshold: () => { const map = mapRef.value?.getMap?.(); if (map?.getLayer(PROVINCE_EXTRUSION_ID)) mapRef.value.removeLayer(PROVINCE_EXTRUSION_ID) },
  onEnter: () => {
    ensureShaanxiMask()
    rightPanelMode.value = 'list'
    listExpanded.value = false
    activeEditTool.value = ''
    renderProjectsByStage('area')
  },
  onBelowThreshold: () => {
    const map = mapRef.value?.getMap?.()
    if (map?.getLayer(PROVINCE_EXTRUSION_ID)) {
      map.setLayoutProperty(PROVINCE_EXTRUSION_ID, 'visibility', 'visible')
      if (map.getLayer(provinceEventLayerId)) map.setLayoutProperty(provinceEventLayerId, 'visibility', 'visible')
    } else { renderSelectedProject(activeProject.value) }
  },
  onExit: () => {
    syncMaskVisibility(true)
    activeEditTool.value = ''
    rightPanelMode.value = 'list'
    popoverProject.value = null
    selectedProject.value = null
    hoverProject.value = null
    detailCardPos.visible = false
    isDetailFullscreen.value = false
    renderProjectsByStage('overview')
  }
})

const layerPanelOffset = computed(() => {
  if (isAreaView.value) return { left: '16px', bottom: '24px' }
  return {
    left: 'calc(clamp(12px, 1.35vw, 26px) + clamp(240px, 23vw, 320px) + 16px)',
    bottom: '24px',
  }
})
const layerPanelZIndex = computed(() => (isAreaView.value ? 26 : 21))

// ==================== 城市点击 ====================
function focusCity(cityName) {
  if (!cityName || !mapRef.value) return
  const map = mapRef.value.getMap(); if (!map) return
  const feature = shaanxiBoundary.features.find((item) => item.properties?.name === cityName); if (!feature) return
  const center = resolveCityCenter(feature); if (!center) return
  map.flyTo({ center, zoom: AREA_ZOOM_THRESHOLD + 0.5, pitch: 45, duration: 1500 })
}

function resolveCityCenter(feature) {
  const p = feature?.properties || {}
  const c1 = p.centroid
  if (Array.isArray(c1) && Number.isFinite(Number(c1[0])) && Number.isFinite(Number(c1[1]))) return [Number(c1[0]), Number(c1[1])]
  const c2 = p.center
  if (Array.isArray(c2) && Number.isFinite(Number(c2[0])) && Number.isFinite(Number(c2[1]))) return [Number(c2[0]), Number(c2[1])]
  const geom = feature?.geometry; if (!geom) return null
  let rings = []
  if (geom.type === 'Polygon') { if (geom.coordinates?.[0]) rings = [geom.coordinates[0]] }
  else if (geom.type === 'MultiPolygon') { rings = (geom.coordinates || []).map((poly) => poly?.[0]).filter(Boolean) }
  if (!rings.length) return null
  let sx = 0, sy = 0, n = 0
  for (const ring of rings) { for (const pt of ring) { const lng = Number(pt?.[0]), lat = Number(pt?.[1]); if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue; sx += lng; sy += lat; n += 1 } }
  return n ? [sx / n, sy / n] : null
}

function bindCityClick() {
  if (!mapRef.value) return
  mapRef.value.onClick(provinceEventLayerId, (feature) => { const cityName = feature.properties?.name; if (cityName) focusCity(cityName) })
}

// ==================== 其他回调 ====================
function handleReportConfirm(payload) {
  const option = payload?.option || payload
  const project = payload?.project || activeProjectDetail.value
  if (project) activeProjectDetail.value = { ...activeProjectDetail.value, ...project }
  reportModalVisible.value = false
  if (reportKeyToWizardMode[option?.key] !== undefined) {
    wizardMode.value = reportKeyToWizardMode[option.key]
    wizardVisible.value = true
  }
}
function handleWizardSaveDraft(payload) {}
function handleWizardSubmit(payload) { wizardVisible.value = false }

// ==================== 生命周期 ====================
function onMapReady() {
  mapReady.value = true
  renderSelectedProject(activeProject.value) // 初始为 null → 默认态
  mapRef.value?.addCentroidLabels({ id: 'shaanxi-labels', geojson: shaanxiBoundary, labelField: 'name', subLabelField: 'value', textColor: '#FFFFFF', textSize: 14, subTextSize: 10, textOffset: [0, 0], height: PROVINCE_MAP_STYLE.defaultHeight, followLayer: PROVINCE_EXTRUSION_ID })
  const map = mapRef.value.getMap()
  map.on('move', updateDetailCardPosition)
  map.on('zoom', updateDetailCardPosition)
  map.on('click', handleMapBlankClick)
  bindCityClick()
  bindZoomListener()

  map.on('zoom', syncMaskVisibility)
  map.on('move', syncMaskVisibility)
  map.on('style.load', ensureShaanxiMask)
  ensureShaanxiMask()
  nextTick(() => { syncByZoom() })
  try {
    whlnPlugin = attachSxLayers(map, {
      initialVisibleIds: layerVisibleIds.value.filter((id) => WHLN_LAYER_IDS.includes(id)),
    })
    whlnPlugin.subscribe?.((ids) => {
      layerVisibleIds.value = [
        ...layerVisibleIds.value.filter((id) => !WHLN_LAYER_IDS.includes(id)),
        ...ids,
      ]
      syncMaskVisibility()
    })
  } catch (err) {
    console.warn('[whln] 图层控制挂载失败:', err)
  }
}

onMounted(async () => { await Promise.all([fetchStageList(), fetchProjectList(), fetchMapProjects()]) })

onUnmounted(() => {
  clearHideTimer()
  unbindZoomListener()
  whlnPlugin?.destroy?.()
  whlnPlugin = null
  const map = mapRef.value?.getMap?.()
  if (map) {
    map.off('move', updateDetailCardPosition)
    map.off('zoom', updateDetailCardPosition)
    map.off('click', handleMapBlankClick)
    map.off('zoom', syncMaskVisibility)
    map.off('move', syncMaskVisibility)
    map.off('style.load', ensureShaanxiMask)
  }
  hoverHandlers.forEach((handlers, layerId) => {
    if (map) { map.off('mouseenter', layerId, handlers.onEnter); map.off('mouseleave', layerId, handlers.onLeave) }
  })
  hoverHandlers.clear()
})
</script>

<style scoped>
.dashboard-page {
  --global-head-height: 56px;
  position: relative;
  width: 100%;
  height: calc(100dvh - var(--global-head-height));
  min-height: 0;
  overflow: hidden;
  background: #03162e;
}

/* 地图边缘内发光（已去掉径向压暗，避免地图发灰） */
.dashboard-page::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 3; /* 在地图上面，UI 下面 */
  box-shadow: inset 0 0 60px rgba(47, 218, 255, 0.12);
  background: none;
}

.map-overlay {
  position: absolute; z-index: 2; inset: 0; pointer-events: none;
  background: radial-gradient(circle at 53% 52%, transparent 0 30%, rgba(1, 17, 41, 0.04) 55%, rgba(1, 10, 27, 0.25) 100%);
}
.head-layer { position: absolute; z-index: 10; top: 0; right: 0; left: 0; }
.left-layer, .right-layer { position: absolute; z-index: 20; bottom: 20px; height: 85vh; max-height: 85vh; overflow-x: hidden; overflow-y: auto; }
.left-layer { left: clamp(12px, 1.35vw, 26px); }
.right-layer { right: clamp(12px, 1.35vw, 26px); }
.left-layer::-webkit-scrollbar, .right-layer::-webkit-scrollbar { display: none; }
.left-layer, .right-layer { scrollbar-width: none; }

.area-top-toolbar { position: absolute; z-index: 25; top: 12px; left: 12px; }
.view-tabs { display: flex; height: 36px; padding: 3px; gap: 2px; background: #fff; border-radius: 6px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15); }
.view-tab { display: flex; align-items: center; gap: 5px; height: 100%; padding: 0 14px; color: #444; font-size: 13px; background: transparent; border: 0; border-radius: 4px; cursor: pointer; }
.view-tab:hover { color: #1677ff; }
.view-tab.active { color: #1677ff; background: #e6f2ff; }

.area-summary { position: absolute; z-index: 20; top: 60px; left: 12px; width: 240px; }
.area-summary.wizard-layer { width: auto; }
.area-view-layer { position: absolute; z-index: 20; top: 60px; right: 12px; bottom: 10px; display: flex; flex-direction: column; align-items: flex-end; gap: 10px; overflow: visible; }
.panel-below { flex: 1; min-height: 0; }

.area-list-view { position: absolute; z-index: 15; height: 100%; width: 100%; padding: 55px 20px; background: #fff; border-radius: 8px; box-shadow: 0 2px 16px rgba(0, 0, 0, 0.12); display: flex; flex-direction: column; box-sizing: border-box; overflow: hidden; }
.list-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.list-title { display: flex; align-items: center; gap: 6px; color: #333; font-size: 14px; font-weight: 600; }
.list-search-bar { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; }
.project-table { flex: 1; width: 100%; }
.project-table :deep(.el-table__row) { height: 48px; }
.project-table :deep(.el-table__header-wrapper th) { background: #f7f8fa; color: #606266; font-weight: 500; }
.project-table :deep(.el-table__body tr.el-table__row--striped td) { background: #fafbfc; }
.project-table :deep(.el-table__body tr:hover > td) { background: #f5f8ff; }
.pagination-row { display: flex; justify-content: flex-end; padding-top: 12px; }

/* ================= 🌟 1. 深色悬浮气泡窗 ================= */
.hover-tooltip {
  position: absolute;
  z-index: 30;
  width: 280px;
  padding: 16px 20px;
  background: rgba(12, 20, 15, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  transform: translate(-50%, 15px);
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.corner {
  position: absolute; width: 8px; height: 8px; pointer-events: none;
}
.corner.top-left {
  top: -1px; left: -1px;
  border-top: 2px solid; border-left: 2px solid;
}
.corner.bottom-left {
  bottom: -1px; left: -1px;
  border-bottom: 2px solid; border-left: 2px solid;
}
.tooltip-title { font-size: 16px; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 4px; }
.tooltip-row { display: flex; align-items: flex-start; font-size: 13px; line-height: 1.4; }
.tooltip-label { color: #A0AEC0; flex-shrink: 0; width: 70px; }
.tooltip-value { color: #FFFFFF; flex: 1; word-break: break-all; }

/* ================= 🌟 2. 右上角白色卡片 ================= */
.right-top-card {
  position: absolute;
  z-index: 25;
  top: 60px;
  right: 12px;
  width: 340px;
  background: rgba(235, 240, 245, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.right-top-card .tooltip-header { padding: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.5); }
.right-top-card .tooltip-status { display: flex; align-items: center; gap: 6px; font-size: 13px; margin-bottom: 6px; }
.right-top-card .status-dot { width: 6px; height: 6px; border-radius: 50%; }
.right-top-card .tooltip-title { font-size: 20px; font-weight: 700; color: #111827; line-height: 1.3; }
.right-top-card .tooltip-grid { display: grid; grid-template-columns: 1fr 1fr; }
.right-top-card .grid-item { padding: 16px; }
.right-top-card .border-right { border-right: 1px solid rgba(255, 255, 255, 0.6); }
.right-top-card .border-bottom { border-bottom: 1px solid rgba(255, 255, 255, 0.6); }
.right-top-card .grid-label { font-size: 13px; color: #6B7280; margin-bottom: 6px; }
.right-top-card .grid-value { font-size: 20px; font-weight: 700; color: #111827; }
.right-top-card .unit { font-size: 13px; font-weight: 400; color: #6B7280; margin-left: 2px; }
.right-top-card .text-blue { color: #2563EB; }
.right-top-card .text-red { color: #DC2626; }
.right-top-card .bold { font-weight: 800; }
.right-top-card .sub-text { font-size: 13px; color: #6B7280; font-weight: 400; margin-left: 2px; }
.right-top-card .tooltip-footer {
  display: flex; justify-content: space-between; align-items: center; padding: 12px 16px;
  background: rgba(200, 210, 220, 0.4); cursor: pointer; transition: background 0.2s;
}
.right-top-card .tooltip-footer:hover { background: rgba(200, 210, 220, 0.7); }
.right-top-card .footer-left { display: flex; align-items: center; gap: 6px; color: #374151; font-size: 13px; }
.right-top-card .footer-right { display: flex; align-items: center; gap: 4px; color: #1677ff; font-size: 13px; font-weight: 500; }
</style>