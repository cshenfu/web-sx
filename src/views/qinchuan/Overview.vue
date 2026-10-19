<!-- Dashboard-area-editor.vue -->
<template>
  <main class="dashboard-page">
    <MapGL ref="mapRef" :style="satelliteStyle" @ready="onMapReady" />

    <div class="map-overlay" aria-hidden="true" />

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

        <div class="area-view-layer">
          <template v-if="!selectedProject">
            <!-- <div class="area-search-panel">
              <el-select
                v-model="filters.itemType"
                placeholder="项目类型"
                size="small"
                clearable
                style="width: 108px"
                @change="handleSearch"
              >
                <el-option label="风电" value="FD" />
                <el-option label="光伏" value="GF" />
              </el-select>
              <el-select
                v-model="filters.city"
                placeholder="市/区"
                size="small"
                clearable
                style="width: 108px"
                @change="handleSearch"
              >
                <el-option
                  v-for="c in CITY_OPTIONS"
                  :key="c.value"
                  :label="c.label"
                  :value="c.value"
                />
              </el-select>
              <el-select
                v-model="filters.managerCompany"
                placeholder="项目所属"
                size="small"
                clearable
                style="width: 130px"
                @change="handleSearch"
              >
                <el-option label="XX能源有限公司" value="XX能源有限公司" />
              </el-select>
              <el-select
                v-model="filters.stage"
                placeholder="项目阶段"
                size="small"
                clearable
                style="width: 120px"
                @change="handleSearch"
              >
                <el-option
                  v-for="opt in stageOptions"
                  :key="opt.code"
                  :label="opt.desc"
                  :value="opt.code"
                />
              </el-select>
              <el-input
                v-model="filters.projectName"
                placeholder="项目名称"
                size="small"
                clearable
                style="width: 160px"
                @keyup.enter="handleSearch"
              >
                <template #suffix>
                  <el-icon class="area-search-icon" @click="handleSearch"><Search /></el-icon>
                </template>
              </el-input>
            </div>

            <div class="area-sort-bar">
              <button
                class="sort-btn"
                :class="{ active: sortKey === 'capacity' }"
                @click="toggleSort('capacity')"
              >
                容量
                <span class="sort-arrow" v-if="sortKey === 'capacity'">
                  {{ sortDir === 'asc' ? '▲' : '▼' }}
                </span>
              </button>
              <button
                class="sort-btn"
                :class="{ active: sortKey === 'rate' }"
                @click="toggleSort('rate')"
              >
                收益率
                <span class="sort-arrow" v-if="sortKey === 'rate'">
                  {{ sortDir === 'asc' ? '▲' : '▼' }}
                </span>
              </button>
            </div> -->

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
              @add="startPolygonDrawing"
            />
          </template>

          <!-- <template v-else>
            <EditToolbar
              v-if="!isDetailFullscreen"
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
              class="panel-below"
              :project="activeProjectDetail"
              :is-fullscreen="isDetailFullscreen"
              @toggle-fullscreen="isDetailFullscreen = !isDetailFullscreen"
              @back="handleBackToList"
              @generate-report="reportModalVisible = true"
            />
          </template> -->
        </div>

        <div
          v-if="selectedProject && detailCardPos.visible && !isDetailFullscreen"
          class="detail-card"
          :style="{ left: detailCardPos.x + 'px', top: detailCardPos.y + 'px' }"
        >
          <div class="detail-title">{{ selectedProject.projectName }}</div>
          <div class="detail-row">
            <span class="detail-label">装机容量</span>
            <span class="detail-value">
              {{ selectedProject.currentProjectCapacity ?? '-' }} MW
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">风机</span>
            <span class="detail-value">
              {{ windCount }} 台
              <span v-if="altCount > 0" class="detail-sub">
                （备选 {{ altCount }} 台）
              </span>
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">资本金 IRR</span>
            <span class="detail-value">
              {{
                selectedProject.capitalFinancialRate != null
                  ? selectedProject.capitalFinancialRate + '%'
                  : '-'
              }}
            </span>
          </div>

          <div class="detail-actions">
            <button class="detail-action" @click="handleCardAction('edit')">
              编辑
            </button>
            <button
              class="detail-action danger"
              @click="handleCardAction('delete')"
            >
              删除
            </button>
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
          <el-button type="primary" size="small" @click="startPolygonDrawing">
            <el-icon><Plus /></el-icon>
            添加项目
          </el-button>
        </div>

        <div class="list-search-bar">
          <el-select
            v-model="filters.itemType"
            placeholder="项目类型"
            size="small"
            clearable
            style="width: 120px"
          >
            <el-option label="风电" value="FD" />
            <el-option label="光伏" value="GF" />
          </el-select>
          <el-select
            v-model="filters.city"
            placeholder="市/区"
            size="small"
            clearable
            style="width: 120px"
          >
            <el-option
              v-for="c in CITY_OPTIONS"
              :key="c.value"
              :label="c.label"
              :value="c.value"
            />
          </el-select>
          <el-select
            v-model="filters.managerCompany"
            placeholder="项目所属"
            size="small"
            clearable
            style="width: 150px"
          >
            <el-option label="XX能源有限公司" value="XX能源有限公司" />
          </el-select>
          <el-select
            v-model="filters.stage"
            placeholder="项目阶段"
            size="small"
            clearable
            style="width: 140px"
          >
            <el-option
              v-for="opt in stageOptions"
              :key="opt.code"
              :label="opt.desc"
              :value="opt.code"
            />
          </el-select>
          <el-input
            v-model="filters.projectName"
            placeholder="项目名称"
            size="small"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          >
            <template #suffix>
              <el-icon @click="handleSearch"><Search /></el-icon>
            </template>
          </el-input>
          <el-button size="small" type="primary" @click="handleSearch">
            查询
          </el-button>
        </div>

        <el-table
          v-loading="listLoading"
          :data="projectList"
          size="small"
          stripe
          class="project-table"
          @sort-change="handleTableSortChange"
        >
          <el-table-column label="项目编号" min-width="140">
            <template #default="{ row }">{{ row.projectCode || '-' }}</template>
          </el-table-column>

          <el-table-column label="项目名称" min-width="240" show-overflow-tooltip>
            <template #default="{ row }">{{ row.projectName || '-' }}</template>
          </el-table-column>

          <el-table-column
            label="装机容量MW"
            width="140"
            prop="currentProjectCapacity"
            sortable="custom"
          >
            <template #default="{ row }">
              {{ row.currentProjectCapacity ?? '-' }}
            </template>
          </el-table-column>

          <el-table-column
            label="资本金财务内部收益率%"
            width="200"
            prop="capitalFinancialRate"
            sortable="custom"
          >
            <template #default="{ row }">
              {{
                row.capitalFinancialRate != null
                  ? row.capitalFinancialRate + '%'
                  : '-'
              }}
            </template>
          </el-table-column>

          <el-table-column label="阶段" width="120">
            <template #default="{ row }">
              {{ stageMap[row.projectStage] || '-' }}
            </template>
          </el-table-column>

          <el-table-column label="所属" min-width="140" show-overflow-tooltip>
            <template #default="{ row }">
              {{ row.managerCompany || '-' }}
            </template>
          </el-table-column>

          <el-table-column label="负责人" width="100">
            <template #default="{ row }">
              {{ row.managerName || '-' }}
            </template>
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

      <!-- 左下角图层按钮 -->
      <div class="layer-control">
        <transition name="layer-pop">
          <div v-if="showLayerPanel" class="layer-panel">
            <div class="layer-panel-title">图层</div>
            <div class="layer-panel-body">
              <button class="layer-chip" @click="notImplemented('资源图谱')">资源图谱</button>
              <button class="layer-chip" @click="notImplemented('卫星遥感')">卫星遥感</button>
              <button class="layer-chip" @click="notImplemented('路网')">路网</button>
              <button class="layer-chip" @click="notImplemented('3D地形')">3D地形</button>
              <button class="layer-chip" @click="notImplemented('测风塔')">测风塔</button>
              <button class="layer-chip" :class="{ active: layerVisible.wind }" @click="toggleLayer('wind')">风机</button>
              <button class="layer-chip" :class="{ active: layerVisible.booster }" @click="toggleLayer('booster')">升压塔</button>
              <button class="layer-chip" @click="notImplemented('接入塔')">接入塔</button>
              <button class="layer-chip" @click="notImplemented('道路')">道路</button>
              <button class="layer-chip" @click="notImplemented('线路')">线路</button>
              <button class="layer-chip" @click="notImplemented('噪音距离')">噪音距离</button>
              <button class="layer-chip" @click="notImplemented('建筑物')">建筑物</button>
              <button class="layer-chip" @click="notImplemented('林地')">林地</button>
              <button class="layer-chip" @click="notImplemented('耕地')">耕地</button>
              <button class="layer-chip" @click="notImplemented('水系')">水系</button>
              <button class="layer-chip" @click="notImplemented('自然保护区')">自然保护区</button>
              <button class="layer-chip" @click="notImplemented('矿区')">矿区</button>
            </div>
          </div>
        </transition>

        <button
          class="layer-toggle-button"
          :class="{ active: showLayerPanel }"
          title="图层"
          @click="showLayerPanel = !showLayerPanel"
        >
          <el-icon><Files /></el-icon>
        </button>
      </div>
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
  ref,
  computed,
  reactive,
  watch,
  onMounted,
  onUnmounted,
  nextTick
} from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Files,
  List,
  MapLocation,
  Plus,
  Search
} from '@element-plus/icons-vue'

import MapGL from '@/components/MapGL.vue'
import DashboardHead from './components/DashboardHead.vue'
import LeftDashboard from './components/LeftDashboard.vue'
import RightDashboard from './components/RightDashboard.vue'
import ProjectOverview from './components/ProjectOverview.vue'
import ProjectListPanel from './components/area-panel/ProjectListPanel.vue'
import ProjectDetailPanel from './components/area-panel/ProjectDetailPanel.vue'
import EditToolbar from './components/area-panel/EditToolbar.vue'
import ReportGenerateModal from './components/area-panel/ReportGenerateModal.vue'
import ReportWizard from './components/report-wizard/ReportWizard.vue'
import { PACKAGE_TYPE } from './js/Reportwizardmockdata'
import { projectOverviewRows, stageCityData } from './js/dashboardMcokData'
import { buildStageColorMap } from './js/mapStageColor'
import { projectDetailMockData } from './js/areaPanelMockData'
import { buildMainInfoFromAi } from './js/aiProjectAdapter'
// 区域编辑 API（增 / 改 / 删）
import * as api from '@/api/modules/gisLayer.js'
// 项目接口（列表 / 阶段枚举）
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

// 地图图标
import fengjiIcon from '@/assets/img/mapIcon/fengji.png'
import shengyazhanIcon from '@/assets/img/mapIcon/shengyazhan.png'

// ★ 陕西省轮廓（和 shaanxi.json 同目录）
import shaanxiOutline610000 from '/public/geojson/610000.json'

// ==================== 常量 ====================
const CITY_OPTIONS = [
  { label: '西安市', value: '610100' },
  { label: '铜川市', value: '610200' },
  { label: '宝鸡市', value: '610300' },
  { label: '咸阳市', value: '610400' },
  { label: '渭南市', value: '610500' },
  { label: '延安市', value: '610600' },
  { label: '汉中市', value: '610700' },
  { label: '榆林市', value: '610800' },
  { label: '安康市', value: '610900' },
  { label: '商洛市', value: '611000' }
]

const ICON_FENGJI = 'icon-fengji-overview'
const ICON_SHENGYAZHAN = 'icon-shengyazhan-overview'
const ICON_SIZE_WIND = 0.08
const ICON_SIZE_BOOSTER = 0.08

// 场区样式
const AREA_STYLE = {
  FD: { color: '#3b82f6', opacity: 0.22, outlineColor: '#60a5fa' },
  GF: { color: '#a855f7', opacity: 0.22, outlineColor: '#c084fc' }
}

// ==================== 基础状态 ====================
const mapRef = ref(null)
const selectedStage = ref(projectOverviewRows[0]?.key || null)
const activeProject = ref(projectOverviewRows[0] || null)
const mapReady = ref(false)

const viewMode = ref('map')
const showLayerPanel = ref(false)
const isDetailFullscreen = ref(false)

const {
  provinceAreaGeoJSON,
  fetchAllProvinceAreaData
} = useProvinceAreaData(shaanxiBoundary, AREA_SELECT_LAYER_KEY)

const actionLoading = ref(false)
const panelMessage = ref('')

const isDrawing = ref(false)
const newAreaFeatureId = ref(null)
const newAreaName = ref('')

const selectedArea = ref(null)
const selectedAreaFeatures = ref([])
const originalSelectedArea = ref(null)
const editAreaName = ref('')

const deleteConfirmVisible = ref(false)

const activeEditTool = ref('')
const rightPanelMode = ref('list')
const listExpanded = ref(false)
const activeAreaId = ref(null)
const activeProjectDetail = ref(projectDetailMockData)
const reportModalVisible = ref(false)
const detailLoading = ref(false)

const selectedProject = ref(null)
const detailCardPos = reactive({ x: 0, y: 0, visible: false })

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
const stageMap = computed(() =>
  Object.fromEntries(stageOptions.value.map((item) => [item.code, item.desc]))
)

// ==================== 数据请求 ====================
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
    const params = { pageNo: pagination.page, pageSize: pagination.pageSize }
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
    console.error('项目列表加载失败:', err)
    projectList.value = []
    pagination.total = 0
  } finally {
    listLoading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  fetchProjectList()
}

function handlePageChange(page) {
  pagination.page = page
  fetchProjectList()
}

function handleSizeChange(size) {
  pagination.pageSize = size
  pagination.page = 1
  fetchProjectList()
}

function toggleSort(key) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'desc' ? 'asc' : 'desc'
  } else {
    sortKey.value = key
    sortDir.value = 'desc'
  }
  pagination.page = 1
  fetchProjectList()
}

function handleTableSortChange({ prop, order }) {
  if (!order) {
    sortKey.value = ''
    sortDir.value = 'desc'
  } else {
    sortKey.value = prop === 'capitalFinancialRate' ? 'rate' : 'capacity'
    sortDir.value = order === 'ascending' ? 'asc' : 'desc'
  }
  pagination.page = 1
  fetchProjectList()
}

watch(() => filters.stage, () => {
  pagination.page = 1
  fetchProjectList()
})

watch(viewMode, (val) => {
  if (val === 'list' && showLayerPanel.value) showLayerPanel.value = false
})

// ==================== 图层显示 ====================
const layerVisible = reactive({ wind: true, booster: true })

function toggleLayer(key) {
  layerVisible[key] = !layerVisible[key]
  applyLayerVisibility()
  ElMessage.success(`${layerVisible[key] ? '已显示' : '已隐藏'}${key === 'wind' ? '风机' : '升压塔'}`)
}

function applyLayerVisibility() {
  const map = mapRef.value?.getMap?.()
  if (!map) return
  const setVis = (id, visible) => {
    if (map.getLayer(id)) {
      map.setLayoutProperty(id, 'visibility', visible ? 'visible' : 'none')
    }
  }
  setVis('overview-project-wind-all', layerVisible.wind)
  setVis('overview-project-booster-all', layerVisible.booster)
}

function notImplemented(name) {
  ElMessage.info(`「${name}」功能待开发`)
}

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
  base.energyStorage = item.energyStorage
  base.rentalUnitPrice = item.rentalUnitPrice
  base.rentalPayType = item.rentalPayType
  base.capacityProportion = item.capacityProportion
  base.storageHours = item.storageHours
  base.hubType = item.hubType
  base.preferHubHeight = item.preferHubHeight
  base.rawProject = cloneValue(item)

  const hasCoord = item.longitude !== null && item.longitude !== undefined && item.latitude !== null && item.latitude !== undefined
  if (hasCoord) base.center = [Number(item.longitude), Number(item.latitude)]
  base.zoom = AREA_ZOOM_THRESHOLD + 1.5
  return base
}

async function handleProjectSelect(item) {
  activeAreaId.value = item.id
  activeProjectDetail.value = buildDetailFromListItem(item)
  const map = mapRef.value?.getMap()
  const center = activeProjectDetail.value.center
  if (map && center) {
    map.flyTo({ center, zoom: AREA_ZOOM_THRESHOLD + 1.5, pitch: 0, duration: 1200 })
  }
  rightPanelMode.value = 'detail'
  selectProjectOnMap(item.id)
  await loadAiProjectDetail(item.id)
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
        ...base,
        listItemId: base.id,
        id: ai.aiProjectId ?? aiProjectId,
        aiProjectId: ai.aiProjectId ?? aiProjectId,
        relationId: ai.relationId,
        reportProjectId: ai.reportProjectId,
        name: ai.reportProjectName || base.name,
        projectName: ai.reportProjectName || base.projectName,
        projectCode: ai.reportProjectCode || base.projectCode,
        mainInfo: buildMainInfoFromAi(ai),
        stageTimeList: ai.stageTimeList || [],
        rawAiData: ai
      }
    }
  } catch (err) {
    console.error('AI 项目详情加载失败:', err)
  } finally {
    detailLoading.value = false
  }
}

// ==================== 地图项目 ====================
const mapProjects = ref([])
const renderedMapLayerIds = new Set()

function getProjectCoords(project) {
  return (project.coordinate || [])
    .map((c) => [Number(c.longitude), Number(c.latitude)])
    .filter(([lng, lat]) => Number.isFinite(lng) && Number.isFinite(lat))
}

function getProjectCentroid(project) {
  const coords = getProjectCoords(project)
  if (!coords.length) return null
  let sumLng = 0; let sumLat = 0
  for (const [lng, lat] of coords) { sumLng += lng; sumLat += lat }
  return [sumLng / coords.length, sumLat / coords.length]
}

function buildAreaFeature(project) {
  const coords = getProjectCoords(project)
  if (coords.length < 3) return null
  const first = coords[0]
  const last = coords[coords.length - 1]
  if (first[0] !== last[0] || first[1] !== last[1]) coords.push([first[0], first[1]])
  return {
    type: 'Feature',
    properties: { projectId: project.id, projectCode: project.projectCode, projectName: project.projectName, itemType: project.itemType },
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
  const base = AREA_STYLE[project.itemType] || AREA_STYLE.FD
  const style = highlighted ? { color: base.color, opacity: base.opacity + 0.16, outlineColor: base.outlineColor } : base
  mapRef.value.addPolygon({ id: layerId, geojson: area, color: style.color, opacity: style.opacity, outlineColor: style.outlineColor })
  renderedMapLayerIds.add(layerId)
  const fillLayerId = `${layerId}-fill`
  mapRef.value.offClick(fillLayerId)
  mapRef.value.onClick(fillLayerId, () => selectProjectOnMap(project.id))
}

async function safeAddIcon({ layerId, featureCollection, iconId, iconUrl, iconSize, iconAnchor = 'center', fallbackColor = '#3b82f6', fallbackRadius = 8 }) {
  try {
    await mapRef.value.ensureImage(iconId, iconUrl)
    await mapRef.value.addImagePoints({ id: layerId, geojson: featureCollection, iconId, iconUrl, iconSize, iconAnchor })
  } catch (err) {
    mapRef.value.addPoints({ id: layerId, geojson: featureCollection, color: fallbackColor, radius: fallbackRadius })
  }
  renderedMapLayerIds.add(layerId)
}

function clearMapIconLayers() {
  if (!mapRef.value) return
  for (const id of renderedMapLayerIds) mapRef.value.removeLayer(id)
  renderedMapLayerIds.clear()
}

async function renderProjectsByStage(stage) {
  if (!mapReady.value || !mapRef.value) return
  clearMapIconLayers()
  if (stage === 'overview') return

  const allWindFeatures = []
  const allBoosterFeatures = []

  for (const p of mapProjects.value) {
    addProjectArea(p, p.id === selectedProject.value?.id)
    const wf = buildWindFC(p); if (wf.features.length) allWindFeatures.push(...wf.features)
    const bf = buildBoosterFC(p); if (bf.features.length) allBoosterFeatures.push(...bf.features)
  }

  if (allWindFeatures.length) {
    await safeAddIcon({ layerId: 'overview-project-wind-all', featureCollection: { type: 'FeatureCollection', features: allWindFeatures }, iconId: ICON_FENGJI, iconUrl: fengjiIcon, iconSize: ICON_SIZE_WIND, iconAnchor: 'bottom', fallbackColor: '#22c55e', fallbackRadius: 5 })
  }
  if (allBoosterFeatures.length) {
    await safeAddIcon({ layerId: 'overview-project-booster-all', featureCollection: { type: 'FeatureCollection', features: allBoosterFeatures }, iconId: ICON_SHENGYAZHAN, iconUrl: shengyazhanIcon, iconSize: ICON_SIZE_BOOSTER, iconAnchor: 'bottom', fallbackColor: '#ef4444', fallbackRadius: 3 })
  }
  applyLayerVisibility()
  // 项目图层新建后，保证遮罩仍置顶
  syncMaskVisibility(true)
}

async function fetchMapProjects() {
  try {
    const res = await newApi.getPageList({ pageNo: 1, pageSize: 500 })
    const data = res?.data ?? {}
    mapProjects.value = data.list ?? []
    if (mapReady.value && isAreaView.value) await renderProjectsByStage('area')
  } catch (err) {
    console.error('地图项目数据加载失败:', err)
    mapProjects.value = []
  }
}

function selectProjectOnMap(projectId) {
  const project = mapProjects.value.find((p) => p.id === projectId)
  if (!project) return
  if (selectedProject.value?.id === projectId) return
  if (selectedProject.value) {
    const prev = mapProjects.value.find((p) => p.id === selectedProject.value.id)
    if (prev && isAreaView.value) addProjectArea(prev, false)
  }
  selectedProject.value = project
  activeProjectDetail.value = buildDetailFromListItem(project)
  addProjectArea(project, true)
  updateDetailCardPosition()
}

function clearSelection() {
  if (!selectedProject.value) return
  const pid = selectedProject.value.id
  const project = mapProjects.value.find((p) => p.id === pid)
  if (project && isAreaView.value) addProjectArea(project, false)
  selectedProject.value = null
  detailCardPos.visible = false
  rightPanelMode.value = 'list'
}

function updateDetailCardPosition() {
  if (!selectedProject.value || !mapRef.value) { detailCardPos.visible = false; return }
  const centroid = getProjectCentroid(selectedProject.value)
  if (!centroid) { detailCardPos.visible = false; return }
  const map = mapRef.value.getMap()
  if (!map) return
  const point = map.project(centroid)
  detailCardPos.x = point.x
  detailCardPos.y = point.y
  detailCardPos.visible = true
}

function handleMapBlankClick(e) {
  if (!isAreaView.value || !selectedProject.value) return
  const map = mapRef.value?.getMap()
  if (!map) return
  const areaLayerIds = []
  for (const id of renderedMapLayerIds) {
    if (id.startsWith('overview-project-area-')) areaLayerIds.push(`${id}-fill`)
  }
  if (!areaLayerIds.length) return
  if (!map.queryRenderedFeatures(e.point, { layers: areaLayerIds }).length) clearSelection()
}

function handleCardAction(type) {
  const p = selectedProject.value
  if (!p) return
  if (type === 'edit') { rightPanelMode.value = 'detail'; return }
  if (type === 'delete') {
    ElMessageBox.confirm(`确认删除项目「${p.projectName || ''}」吗？`, '提示', { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' })
      .then(() => { ElMessage.success('删除成功'); clearSelection(); fetchProjectList(); fetchMapProjects() })
      .catch(() => {})
  }
}

// ==================== 阶段选择 ====================
function renderSelectedProject(row) {
  if (!row || !mapRef.value) return
  const cityValues = stageCityData[row.key] || {}
  const colorMap = buildStageColorMap(cityValues, row.color)
  mapRef.value.addExtrusion({ id: PROVINCE_EXTRUSION_ID, geojson: shaanxiBoundary, colorMap, defaultHeight: 10000, defaultColor: row.color || '#2A9FFF', highlightColor: '#FFFF00', opacity: 0.9, enableHover: true })
}

function onProjectStageSelect(row) {
  activeProject.value = row
  selectedStage.value = row.key || row.stage
  if (mapReady.value && !isAreaView.value) renderSelectedProject(row)
}

// ==================== ★ 陕西省遮罩（反遮罩，opacity 平滑） ====================
const MASK_LAYER_ID = 'shaanxi-mask'
const MASK_COLOR = '#000000'      // 想柔和一点改 '#03162e' 或 'rgba(0,0,0,0.85)'
const MASK_MAX_OPACITY = 1.0      // 1 = 全黑，0.9 = 稍柔，0.8 = 更透
const MASK_FADE_DURATION = 300    // 淡入淡出时长(ms)
const MASK_FULL_ZOOM_OFFSET = 1.5 // 从 AREA_ZOOM_THRESHOLD 到 +1.5 之间 opacity 爬升到最大

let lastMaskOpacity = -1

// 环方向工具（Non-Zero 填充规则下正确挖洞）
function ensureClosed(ring) {
  if (!ring || ring.length < 3) return ring
  const first = ring[0]
  const last = ring[ring.length - 1]
  if (first[0] === last[0] && first[1] === last[1]) return ring
  return [...ring, [first[0], first[1]]]
}

function ringSignedArea(ring) {
  if (!ring || ring.length < 3) return 0
  let area = 0
  for (let i = 0; i < ring.length - 1; i++) {
    const [x1, y1] = ring[i]
    const [x2, y2] = ring[i + 1]
    area += x1 * y2 - x2 * y1
  }
  return area / 2
}

function ensureOuterCCW(ring) {
  const r = ensureClosed(ring)
  return ringSignedArea(r) >= 0 ? r : r.slice().reverse()
}

function ensureHoleCW(ring) {
  const r = ensureClosed(ring)
  return ringSignedArea(r) <= 0 ? r : r.slice().reverse()
}

// 世界外环（CCW），反遮罩的外边界
const WORLD_OUTER = ensureOuterCCW([
  [-180, -85], [180, -85], [180, 85], [-180, 85], [-180, -85],
])

// 从本地 610000.json 构造"世界 + 洞"的反遮罩 GeoJSON
function buildMaskGeoJSON(boundary) {
  const holes = []
  for (const feature of boundary?.features || []) {
    const geom = feature?.geometry
    if (!geom) continue
    const polygons = geom.type === 'Polygon'
      ? [geom.coordinates]
      : geom.type === 'MultiPolygon'
        ? geom.coordinates
        : []
    for (const polygon of polygons) {
      const outerRing = polygon?.[0]
      if (!outerRing || outerRing.length < 4) continue
      holes.push(ensureHoleCW(outerRing))
    }
  }
  if (!holes.length) {
    console.warn('[mask] buildMaskGeoJSON: 610000.json 没有有效的 Polygon 环')
    return { type: 'FeatureCollection', features: [] }
  }
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: { type: 'Polygon', coordinates: [WORLD_OUTER, ...holes] },
      },
    ],
  }
}

function smoothstep(edge0, edge1, x) {
  if (edge1 <= edge0) return x >= edge1 ? 1 : 0
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

function computeMaskOpacity() {
  if (!isAreaView.value) return 0
  const map = mapRef.value?.getMap?.()
  if (!map) return 0
  const z = map.getZoom()
  const t = smoothstep(AREA_ZOOM_THRESHOLD, AREA_ZOOM_THRESHOLD + MASK_FULL_ZOOM_OFFSET, z)
  return t * MASK_MAX_OPACITY
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
  if (mapRef.value.hasMaskLayer(MASK_LAYER_ID)) {
    syncMaskVisibility(true)
    return
  }
  try {
    const data = buildMaskGeoJSON(shaanxiOutline610000)
    if (!data.features.length) {
      console.warn('[mask] 遮罩 geojson 为空，检查 610000.json 内容')
      return
    }
    mapRef.value.addMaskLayer({
      id: MASK_LAYER_ID,
      geojson: data,
      color: MASK_COLOR,
      opacity: 0,
      fadeDuration: MASK_FADE_DURATION,
    })
    console.log('[mask] 遮罩层已添加 ✓，洞数量 =', data.features[0].geometry.coordinates.length - 1)
    lastMaskOpacity = -1
    syncMaskVisibility(true)
  } catch (err) {
    console.error('[mask] 陕西省遮罩初始化失败:', err)
  }
}

function removeShaanxiMask() {
  if (!mapRef.value) return
  mapRef.value.removeMaskLayer(MASK_LAYER_ID)
  lastMaskOpacity = -1
}

// ==================== 缩放阈值 ====================
const provinceEventLayerId = `${PROVINCE_EXTRUSION_ID}-event`

const { isAreaView, syncByZoom, bindZoomListener, unbindZoomListener } = useZoomThresholdSwitch({
  mapRef,
  zoomThreshold: AREA_ZOOM_THRESHOLD,
  onAboveThreshold: () => {
    const map = mapRef.value?.getMap()
    if (map?.getLayer(PROVINCE_EXTRUSION_ID)) mapRef.value.removeLayer(PROVINCE_EXTRUSION_ID)
  },
  onEnter: () => {
    ensureShaanxiMask()
    if (provinceAreaGeoJSON.value?.features?.length) mapRef.value.loadEditableAreas(provinceAreaGeoJSON.value)
    rightPanelMode.value = 'list'
    listExpanded.value = false
    activeEditTool.value = ''
    renderProjectsByStage('area')
  },
  onBelowThreshold: () => {
    const draw = mapRef.value?.getDraw()
    if (draw?.getMode?.() === 'draw_polygon') draw.changeMode('simple_select')
    const map = mapRef.value?.getMap()
    if (map?.getLayer(PROVINCE_EXTRUSION_ID)) {
      map.setLayoutProperty(PROVINCE_EXTRUSION_ID, 'visibility', 'visible')
      if (map.getLayer(provinceEventLayerId)) map.setLayoutProperty(provinceEventLayerId, 'visibility', 'visible')
    } else {
      renderSelectedProject(activeProject.value)
    }
  },
  onExit: () => {
    syncMaskVisibility(true)
    mapRef.value.clearEditableAreas()
    clearExistingAreaSelection()
    resetNewAreaState()
    activeEditTool.value = ''
    rightPanelMode.value = 'list'
    selectedProject.value = null
    detailCardPos.visible = false
    isDetailFullscreen.value = false
    renderProjectsByStage('overview')
  }
})

function syncMapDisplayByZoom() { syncByZoom() }

// ==================== 城市点击 ====================
function focusCity(cityName) {
  if (!cityName || !mapRef.value) return
  const map = mapRef.value.getMap()
  const feature = shaanxiBoundary.features.find((item) => item.properties?.name === cityName)
  const coords = feature ? centroidOfFeature(feature) : null
  if (!coords) return
  map.flyTo({ center: coords, zoom: AREA_ZOOM_THRESHOLD + 0.5, pitch: 45, duration: 1500 })
}

function centroidOfFeature(feature) {
  const coords = feature?.geometry?.coordinates
  if (!coords) return null
  const ring = Array.isArray(coords[0][0]) ? coords[0] : coords
  let sx = 0; let sy = 0; let n = 0
  ring.forEach(([x, y]) => { sx += x; sy += y; n += 1 })
  return n ? [sx / n, sy / n] : null
}

function bindCityClick() {
  if (!mapRef.value) return
  mapRef.value.onClick(provinceEventLayerId, (feature) => {
    const cityName = feature.properties?.name
    if (cityName) focusCity(cityName)
  })
}

// ==================== 区域编辑 ====================
let drawCreateHandler = null
let drawSelectionChangeHandler = null
let drawUpdateHandler = null
let drawDeleteHandler = null
let suppressSelectionEvents = false

const areaAttributeDefaults = { name: '' }

function buildAreaAttributes(properties = {}, name = '') {
  const attributes = { ...areaAttributeDefaults }
  Object.keys(areaAttributeDefaults).forEach((key) => {
    if (properties[key] !== undefined) attributes[key] = properties[key]
  })
  attributes.name = (!name && properties.name) ? properties.name : name
  return attributes
}

function setPanelMessage(message) { panelMessage.value = message }
function clearPanelMessage() { panelMessage.value = '' }

async function refreshProvinceAreaData() {
  await fetchAllProvinceAreaData()
  if (isAreaView.value && provinceAreaGeoJSON.value?.features?.length) mapRef.value?.loadEditableAreas(provinceAreaGeoJSON.value)
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
  if (drawSelectionChangeHandler) map.off('draw.selectionchange', drawSelectionChangeHandler)
  if (drawUpdateHandler) map.off('draw.update', drawUpdateHandler)
  if (drawDeleteHandler) map.off('draw.delete', drawDeleteHandler)
  drawCreateHandler = null; drawSelectionChangeHandler = null; drawUpdateHandler = null; drawDeleteHandler = null
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
  const features = (event?.features || []).filter((feature) => feature.id !== newAreaFeatureId.value)
  if (!features.length) {
    if (!newAreaFeatureId.value) clearExistingAreaSelection()
    return
  }
  if (activeEditTool.value !== 'area') {
    const draw = mapRef.value?.getDraw()
    suppressSelectionEvents = true
    try { draw?.changeMode('simple_select') } finally { suppressSelectionEvents = false }
    openDetailForFeature(features[0])
    return
  }
  selectedAreaFeatures.value = features.map((feature) => cloneValue(feature))
  selectedArea.value = cloneValue(features[0])
  originalSelectedArea.value = cloneValue(features[0])
  editAreaName.value = getFeatureAreaName(features[0])
  clearPanelMessage()
  if (features.length === 1 && features[0].geometry?.type === 'Polygon') {
    nextTick(() => {
      const draw = mapRef.value?.getDraw()
      if (!draw || draw.getMode() === 'direct_select') return
      draw.changeMode('direct_select', { featureId: features[0].id })
    })
  }
}

function onDrawUpdate(event) {
  const features = event?.features || []
  if (newAreaFeatureId.value) {
    if (features.find((f) => f.id === newAreaFeatureId.value)) clearPanelMessage()
  }
  if (selectedArea.value) {
    const selectedFeature = features.find((f) => f.id === selectedArea.value.id)
    if (selectedFeature) {
      selectedArea.value = cloneValue(selectedFeature)
      selectedAreaFeatures.value = selectedAreaFeatures.value.map((f) => f.id === selectedFeature.id ? cloneValue(selectedFeature) : f)
    }
  }
}

function onDrawDelete(event) {
  const deletedIds = new Set((event?.features || []).map((feature) => feature.id))
  if (newAreaFeatureId.value && deletedIds.has(newAreaFeatureId.value)) resetNewAreaState()
  if (selectedArea.value && deletedIds.has(selectedArea.value.id)) clearExistingAreaSelection()
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
  if (draw && newAreaFeatureId.value) draw.delete(newAreaFeatureId.value)
  else if (draw && isDrawing.value) draw.changeMode('simple_select')
  resetNewAreaState()
}

function resetNewAreaState() {
  isDrawing.value = false
  newAreaFeatureId.value = null
  newAreaName.value = ''
}

async function saveNewArea() {
  const draw = mapRef.value?.getDraw()
  const feature = newAreaFeatureId.value ? draw?.get(newAreaFeatureId.value) : null
  if (!feature || !newAreaName.value) { setPanelMessage('请先完成多边形绘制并填写区域名称'); return }
  actionLoading.value = true
  clearPanelMessage()
  try {
    await api.addFeatureById(AREA_SELECT_LAYER_KEY, { geometry: feature.geometry, attributes: buildAreaAttributes(feature.properties, newAreaName.value) })
    resetNewAreaState()
    await refreshProvinceAreaData()
    setPanelMessage('区域保存成功')
  } catch (error) {
    console.error('新增区域失败:', error)
    setPanelMessage('区域保存失败，请稍后重试')
  } finally { actionLoading.value = false }
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
  const geometryChanged = JSON.stringify(currentFeature.geometry) !== JSON.stringify(originalSelectedArea.value.geometry)
  const nameChanged = editAreaName.value !== getFeatureAreaName(originalSelectedArea.value)
  return geometryChanged || nameChanged
}

async function saveSelectedArea() {
  if (!selectedArea.value || selectedAreaFeatures.value.length !== 1) { setPanelMessage('一次只能编辑一个区域'); return }
  const currentFeature = getCurrentSelectedFeature()
  if (!currentFeature) { setPanelMessage('未找到当前编辑区域'); return }
  if (!hasAreaChanged(currentFeature)) { setPanelMessage('区域没有发生变化'); return }
  actionLoading.value = true
  clearPanelMessage()
  try {
    await api.updateFeatureById(AREA_SELECT_LAYER_KEY, getFeatureGuid(selectedArea.value), {
      geometry: currentFeature.geometry,
      attributes: buildAreaAttributes(currentFeature.properties, editAreaName.value),
      updatedBy: UPDATED_BY
    })
    clearExistingAreaSelection()
    await refreshProvinceAreaData()
    setPanelMessage('区域更新成功')
  } catch (error) {
    console.error('更新区域失败:', error)
    setPanelMessage('区域更新失败，请稍后重试')
  } finally { actionLoading.value = false }
}

function cancelSelectedArea() {
  const draw = mapRef.value?.getDraw()
  const original = originalSelectedArea.value
  if (!draw || !original) { clearExistingAreaSelection(); return }
  suppressSelectionEvents = true
  try {
    draw.delete(original.id)
    draw.add(cloneValue(original))
    draw.changeMode('simple_select')
  } finally { suppressSelectionEvents = false }
  clearExistingAreaSelection()
  clearPanelMessage()
}

function openDeleteConfirm() {
  if (!selectedAreaFeatures.value.length) { setPanelMessage('请先选择要删除的区域'); return }
  deleteConfirmVisible.value = true
}

function closeDeleteConfirm() {
  if (actionLoading.value) return
  deleteConfirmVisible.value = false
}

async function confirmDelete() {
  const guids = selectedAreaFeatures.value.map((f) => getFeatureGuid(f)).filter(Boolean)
  if (!guids.length) { deleteConfirmVisible.value = false; return }
  actionLoading.value = true
  clearPanelMessage()
  try {
    await api.deletFeatureById(AREA_SELECT_LAYER_KEY, { guids, updatedBy: UPDATED_BY })
    deleteConfirmVisible.value = false
    clearExistingAreaSelection()
    await refreshProvinceAreaData()
    setPanelMessage('区域删除成功')
  } catch (error) {
    console.error('删除区域失败:', error)
    setPanelMessage('区域删除失败，请稍后重试')
  } finally { actionLoading.value = false }
}

// ==================== 联动 ====================
function openDetailForFeature(feature) {
  activeAreaId.value = getFeatureGuid(feature) || null
  flyToProjectCenter(activeProjectDetail.value)
  rightPanelMode.value = 'detail'
}

function flyToProjectCenter(project) {
  const map = mapRef.value?.getMap()
  if (!map || !project?.center) return
  map.flyTo({ center: project.center, zoom: project.zoom || AREA_ZOOM_THRESHOLD + 1.5, pitch: 0, duration: 1200 })
}

function handleBackToList() {
  clearSelection()
  rightPanelMode.value = 'list'
  listExpanded.value = true
  activeEditTool.value = ''
  isDetailFullscreen.value = false
}

function handleReportConfirm(payload) {
  const option = payload?.option || payload
  const project = payload?.project || activeProjectDetail.value
  if (project) activeProjectDetail.value = { ...activeProjectDetail.value, ...project }
  reportModalVisible.value = false
  if (reportKeyToWizardMode[option?.key] !== undefined) {
    wizardMode.value = reportKeyToWizardMode[option.key]
    wizardVisible.value = true
  } else {
    console.log('待接入的报告类型：', option)
  }
}

function handleWizardSaveDraft(payload) { console.log('第一步草稿已保存：', payload) }
function handleWizardSubmit(payload) { console.log('报告向导提交：', payload); wizardVisible.value = false }

// ==================== 地图 ready ====================
function onMapReady() {
  mapReady.value = true
  renderSelectedProject(activeProject.value)
  mapRef.value?.addCentroidLabels({ id: 'shaanxi-labels', geojson: shaanxiBoundary, labelField: 'name', subLabelField: 'value', textColor: '#FFFFFF', textSize: 14, subTextSize: 10, textOffset: [0, 0] })
  const map = mapRef.value.getMap()
  map.on('move', updateDetailCardPosition)
  map.on('zoom', updateDetailCardPosition)
  map.on('click', handleMapBlankClick)
  bindCityClick()
  bindDrawEvents()
  bindZoomListener()

  // ★ 陕西省遮罩：监听 + 初始化
  map.on('zoom', syncMaskVisibility)
  map.on('move', syncMaskVisibility)
  map.on('style.load', ensureShaanxiMask)
  ensureShaanxiMask()

  nextTick(() => { syncMapDisplayByZoom() })
}

// ==================== 生命周期 ====================
onMounted(async () => {
  await Promise.all([fetchAllProvinceAreaData(), fetchStageList(), fetchProjectList(), fetchMapProjects()])
})

onUnmounted(() => {
  unbindZoomListener()
  unbindDrawEvents()
  const map = mapRef.value?.getMap?.()
  if (map) {
    map.off('move', updateDetailCardPosition)
    map.off('zoom', updateDetailCardPosition)
    map.off('click', handleMapBlankClick)
    map.off('zoom', syncMaskVisibility)
    map.off('move', syncMaskVisibility)
    map.off('style.load', ensureShaanxiMask)
  }
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
  background: radial-gradient(circle at 53% 52%, transparent 0 21%, rgba(1, 17, 41, 0.06) 43%, rgba(1, 10, 27, 0.35) 100%),
              linear-gradient(180deg, rgba(0, 16, 44, 0.12), rgba(0, 10, 30, 0.2));
}

.head-layer {
  position: absolute;
  z-index: 10;
  top: 0;
  right: 0;
  left: 0;
}

/* ⭐️ 左右侧栏：严格使用 80vh 高度，并隐藏外层滚动条 */
.left-layer, .right-layer {
  position: absolute;
  z-index: 20;
  bottom: 20px;
  height: 85vh;
  max-height: 85vh;
  overflow-x: hidden;
  overflow-y: auto; /* 内部组件有自适应比例和内部滚动，外层不用滚 */
}

.left-layer {
  left: clamp(12px, 1.35vw, 26px);
}
.right-layer {
  right: clamp(12px, 1.35vw, 26px);
}

/* 隐藏外层滚动条，让界面更干净 */
.left-layer::-webkit-scrollbar,
.right-layer::-webkit-scrollbar {
  display: none;
}
.left-layer, .right-layer {
  scrollbar-width: none;
}

/* ===================== 放大时的 UI (地图模式 / 项目列表) ===================== */
.area-top-toolbar {
  position: absolute;
  z-index: 25;
  top: 12px;
  left: 12px;
}

.view-tabs {
  display: flex;
  height: 36px;
  padding: 3px;
  gap: 2px;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
}

.view-tab {
  display: flex;
  align-items: center;
  gap: 5px;
  height: 100%;
  padding: 0 14px;
  color: #444;
  font-size: 13px;
  background: transparent;
  border: 0;
  border-radius: 4px;
  cursor: pointer;
}

.view-tab:hover {
  color: #1677ff;
}

.view-tab.active {
  color: #1677ff;
  background: #e6f2ff;
}

.area-summary {
  position: absolute;
  z-index: 20;
  top: 60px;
  left: 12px;
  width: 240px;
}

.area-summary.wizard-layer {
  width: auto;
}

.area-view-layer {
  position: absolute;
  z-index: 20;
  top: 60px;
  right: 12px;
  bottom: 10px;
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

.area-search-panel {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 12px;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}

.area-search-icon {
  color: #909399;
  cursor: pointer;
}

.area-sort-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  font-size: 12px;
  color: #606266;
}

.sort-btn {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px 10px;
  color: #606266;
  font-size: 12px;
  background: #f5f7fa;
  border: 1px solid #e3e7ee;
  border-radius: 4px;
  cursor: pointer;
  transition: color 0.15s, background 0.15s, border-color 0.15s;
}

.sort-btn:hover {
  color: #1677ff;
  border-color: #a9cfff;
}

.sort-btn.active {
  color: #1677ff;
  background: #e8f2ff;
  border-color: #1677ff;
}

.sort-arrow {
  font-size: 10px;
}

.area-list-view {
  position: absolute;
  z-index: 15;
  inset: 56px 12px 12px;
  padding: 14px 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
}

.list-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.list-title {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #333;
  font-size: 14px;
  font-weight: 600;
}

.list-search-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.project-table {
  flex: 1;
  width: 100%;
}

.project-table :deep(.el-table__row) {
  height: 48px;
}

.project-table :deep(.el-table__header-wrapper th) {
  background: #f7f8fa;
  color: #606266;
  font-weight: 500;
}

.project-table :deep(.el-table__body tr.el-table__row--striped td) {
  background: #fafbfc;
}

.project-table :deep(.el-table__body tr:hover > td) {
  background: #f5f8ff;
}

.pagination-row {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
}

.detail-card {
  position: absolute;
  z-index: 22;
  width: 220px;
  padding: 12px 14px;
  color: #303133;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 6px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
  transform: translate(calc(-100% - 16px), 12px);
  pointer-events: auto;
}

.detail-title {
  padding-bottom: 8px;
  margin-bottom: 8px;
  color: #1f2d3d;
  font-size: 13px;
  font-weight: 600;
  border-bottom: 1px solid #eee;
}

.detail-row {
  display: flex;
  align-items: center;
  min-height: 22px;
  font-size: 12px;
}

.detail-label {
  width: 68px;
  color: #909399;
}

.detail-value {
  flex: 1;
  color: #303133;
}

.detail-sub {
  color: #a0a5ad;
  font-size: 11px;
}

.detail-actions {
  display: flex;
  justify-content: space-between;
  padding-top: 8px;
  margin-top: 8px;
  border-top: 1px solid #eee;
}

.detail-action {
  padding: 2px 4px;
  color: #1677ff;
  font-size: 12px;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.detail-action:hover {
  text-decoration: underline;
}

.detail-action.danger {
  color: #f56c6c;
}

/* ===================== 左下角图层控制 ===================== */
.layer-control {
  position: absolute;
  z-index: 25;
  left: 12px;
  bottom: 12px;
}

.layer-toggle-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  color: #303133;
  font-size: 20px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 8px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: color 0.16s, background 0.16s, border-color 0.16s;
}

.layer-toggle-button:hover {
  color: #1677ff;
}

.layer-toggle-button.active {
  color: #1677ff;
  background: #e8f2ff;
  border-color: #b9d8ff;
}

.layer-panel {
  position: absolute;
  left: 56px;
  bottom: 0;
  width: 320px;
  padding: 10px 14px 14px;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  transform-origin: left bottom;
}

.layer-panel-title {
  padding-bottom: 8px;
  margin-bottom: 8px;
  border-bottom: 1px solid #eee;
  color: #303133;
  font-size: 13px;
  font-weight: 600;
}

.layer-panel-body {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.layer-chip {
  height: 30px;
  padding: 0 12px;
  color: #3a4652;
  font-size: 12px;
  background: #f5f7fa;
  border: 1px solid #e3e7ee;
  border-radius: 6px;
  white-space: nowrap;
  cursor: pointer;
  transition: color 0.15s, background 0.15s, border-color 0.15s;
}

.layer-chip:hover {
  color: #1677ff;
  border-color: #a9cfff;
}

.layer-chip.active {
  color: #1677ff;
  background: #e8f2ff;
  border-color: #1677ff;
}

.layer-pop-enter-active, .layer-pop-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.layer-pop-enter-from, .layer-pop-leave-to {
  opacity: 0;
  transform: translateX(-8px) scale(0.98);
}

/* ===================== 响应式 ===================== */
@media (max-width: 700px) {
  .dashboard-page {
    overflow: auto;
  }

  .left-layer, .right-layer {
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

  .area-summary, .area-view-layer {
    position: relative;
    top: auto;
    right: auto;
    bottom: auto;
    left: auto;
    width: auto;
    margin: 12px;
  }
}
</style>