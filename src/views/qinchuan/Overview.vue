<!-- Dashboard-area-editor.vue -->
<template>
  <main class="dashboard-page">
    <MapGL
      ref="mapRef"
      :style="satelliteStyle"
      :fly-to-on-load="false"   
      :isDashboard="true"  
      @ready="onMapReady"
      @city-click="onCityClick"
      @draw-update="onDrawChange"
      @draw-create="onDrawChange"
      @draw-delete="onDrawChange"
      @box-select="handleBoxSelect"
    />
    <div class="map-overlay" aria-hidden="true" />

    <LayerChipPanel
      v-if="!isAreaView || viewMode === 'map'"
      :visible-ids="layerVisibleIds"
      :offset="layerPanelOffset"
      :z-index="layerPanelZIndex"
      @toggle="onLayerToggle"
    >
      <template #legend>
        <div class="layer-legend">
          <span class="layer-legend-item">
            <i class="layer-legend-line road" />道路
          </span>
          <span class="layer-legend-item">
            <i class="layer-legend-line line" />线路
          </span>
        </div>
      </template>
    </LayerChipPanel>

    <!-- 道路 / 线路 hover 气泡 -->
    <div
      v-if="lineTip.visible"
      class="map-line-tip"
      :style="{ left: lineTip.x + 'px', top: lineTip.y + 'px' }"
    >{{ lineTip.text }}</div>

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

    <template v-else>
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

        <div class="area-view-layer" v-show="!popoverProject && !isEditing">
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

        <div
          v-if="popoverProject && !isDetailFullscreen && !selectedProject && !isEditing && !isActionPanelOpen"
          class="right-top-card"
        >
          <div class="tooltip-header">
            <button class="tooltip-title title-link" type="button" @click.stop="handleOpenDetailPanel(popoverProject)">
              {{ popoverProject.projectName || '-' }}
            </button>
            <div class="tooltip-status">
              <span class="status-dot" :style="{ background: getHoverThemeColor(popoverProject.projectStage) }"></span>
              <span class="status-text" :style="{ color: getHoverThemeColor(popoverProject.projectStage) }">
                {{ stageMap[popoverProject.projectStage] || '项目' }}
              </span>
            </div>
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
                <span class="bold">{{ popoverProject.recommendedModel || 'MySE5.0-200' }}</span>
              </div>
            </div>
            <div class="grid-item">
              <div class="grid-label">资本金IRR</div>
              <div class="grid-value text-red">
                {{ popoverProject.capitalFinancialRate != null ? popoverProject.capitalFinancialRate : '5.96' }} <span class="unit">%</span>
              </div>
            </div>
          </div>

          <div class="tooltip-footer" @click.stop>
            <button
              v-for="action in visiblePopoverActions"
              :key="action"
              type="button"
              class="footer-action"
              :class="{ danger: action === 'delete' }"
              @click.stop="executeProjectAction(action, popoverProject)"
            >
              {{ ACTION_LABELS[action] || action }}
            </button>
            <div v-if="overflowPopoverActions.length" class="action-menu-wrap">
              <button
                type="button"
                class="action-menu-button"
                aria-label="更多操作"
                title="更多操作"
                @click.stop="actionMenuOpen = !actionMenuOpen"
              >
                <el-icon><MoreFilled /></el-icon>
              </button>
              <div v-if="actionMenuOpen" class="action-menu">
                <button
                  v-for="action in overflowPopoverActions"
                  :key="action"
                  type="button"
                  :class="{ danger: action === 'delete' }"
                  @click.stop="executeProjectAction(action, popoverProject)"
                >
                  {{ ACTION_LABELS[action] || action }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="isAreaView && (isEditing || (popoverProject && !isDetailFullscreen && !selectedProject && !isActionPanelOpen))"
          class="geometry-edit-toolbar"
        >
          <button
            v-for="item in editTools"
            :key="item.key"
            type="button"
            class="edit-tool-button"
            :class="{ active: editMode === item.key }"
            @click="isEditing ? enterEditMode(item.key) : startGeometryEdit(popoverProject, item.key)"
          >
            <el-icon><component :is="item.icon" /></el-icon>{{ item.label }}
          </button>
          <template v-if="editMode === 'wind' || editMode === 'booster'">
            <span class="edit-divider" />
            <template v-if="editMode === 'wind'">
              <button class="edit-tool-button" :class="{ active: drawingNewPoint }" @click="startAddWindPoint">添加风机</button>
              <button class="edit-tool-button" :class="{ active: isBoxSelecting }" @click="startBoxSelection">框选</button>
              <button class="edit-tool-button danger" @click="deleteSelectedPoints">删除选中</button>
              <button class="edit-tool-button" @click="markReserve(true)">标记备选</button>
              <button class="edit-tool-button" @click="markReserve(false)">取消备选</button>
            </template>
            <template v-else>
              <button class="edit-tool-button" :class="{ active: drawingNewPoint }" @click="toggleAddPoint">{{ drawingNewPoint ? '退出新增' : '新增点' }}</button>
              <button class="edit-tool-button" :class="{ active: isBoxSelecting }" @click="startBoxSelection">框选</button>
              <button class="edit-tool-button danger" @click="deleteSelectedPoints">删除选中</button>
            </template>
          </template>
          <span class="edit-divider" />
          <button v-if="isDirty" class="edit-tool-button save" :disabled="saving" @click="saveEdit">{{ saving ? '保存中…' : '保存' }}</button>
          <button v-if="isDirty" class="edit-tool-button" :disabled="saving" @click="cancelEdit">取消修改</button>
          <button v-if="hasSaved && !isDirty" class="edit-tool-button recalculate" :disabled="recalculating" @click="handleRecalculate">{{ recalculating ? '计算中…' : '重新计算' }}</button>
          <button v-if="!isDirty" class="edit-tool-button" :disabled="saving" @click="exitEditMode">完成编辑</button>
        </div>
      </template>

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

    <section v-if="showEditProject" class="create-project-fullpage">
      <CreateProjectForm
        ref="editProjectFormRef"
        :map-ref="mapRef"
        :panel-width="550"
        mode="edit"
        :project="editProjectTarget"
        @cancel="onEditProjectCancel"
        @saved="onProjectUpdated"
      />
    </section>

    <VerifyPanel
      :visible="showVerifyPanel"
      :project="actionProject"
      @close="showVerifyPanel = false"
      @saved="onVerifySaved"
    />
    <SiteMapProjectDetailPanel
      :visible="showSiteMapDetailPanel"
      :project="actionProject"
      :stage="actionProject?.projectStage || ''"
      :initial-tab="detailPanelTab"
      @close="showSiteMapDetailPanel = false"
      @action="onSiteMapDetailAction"
    />
    <SiteMapGenerateReportPanel
      :visible="showGeneratePanel"
      :project="generatePanelProject"
      :action-key="generatePanelActionKey"
      :sub-code="generatePanelSubCode"
      @close="showGeneratePanel = false"
      @generated="onReportGenerated"
    />
    <AssignDialog v-model="showAssignDialog" :project="actionProject" @success="onAssignSuccess" />
    <ReserveApprovalDialog v-model="showReserveDialog" :project="actionProject" @saved="onReserveSaved" />
  </main>
</template>

<script setup>
import {
  ref, computed, reactive, watch, onMounted, onUnmounted, nextTick
} from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { List, MapLocation, Plus, Search, MoreFilled, Location, CircleCheck, CircleClose } from '@element-plus/icons-vue'

import MapGL from '@/components/MapGL.vue'
import LayerChipPanel from '@/components/site-map/LayerChipPanel.vue'
import { WHLN_LAYER_IDS, DEFAULT_VISIBLE } from '@/components/site-map/layerPanelConfig'
import { attachSxLayers } from '@/components/site-map/attachSxLayers'
import { ICON_SIZE_WIND, ICON_SIZE_BOOSTER } from '@/components/site-map/iconSize.js'
import DashboardHead from './components/DashboardHead.vue'
import LeftDashboard from './components/LeftDashboard.vue'
import RightDashboard from './components/RightDashboard.vue'
import ProjectOverview from './components/ProjectOverview.vue'
import ProjectListPanel from './components/area-panel/ProjectListPanel.vue'
import ProjectDetailPanel from './components/area-panel/ProjectDetailPanel.vue'
import ReportGenerateModal from './components/area-panel/ReportGenerateModal.vue'
import CreateProjectForm from './components/Createprojectform.vue'
import VerifyPanel from './components/VerifyPanel.vue'
import SiteMapProjectDetailPanel from './components/ProjectDetailPanel.vue'
import SiteMapGenerateReportPanel from './components/GenerateReportPanel.vue'
import AssignDialog from './components/AssignDialog.vue'
import ReserveApprovalDialog from './components/ReserveApprovalDialog.vue'
import ReportWizard from './components/report-wizard/ReportWizard.vue'
import { PACKAGE_TYPE } from './js/Reportwizardmockdata'
import { projectOverviewRows, stageCityData } from './js/dashboardMcokData'
import { buildStageColorMap } from './js/mapStageColor'
import { projectDetailMockData } from './js/areaPanelMockData'
import { buildMainInfoFromAi } from './js/aiProjectAdapter'
import * as newApi from '@/api/modules/project'
import * as configApi from '@/api/modules/selectConfig'

import {
  satelliteStyle,
  shaanxiBoundary,
  AREA_ZOOM_THRESHOLD,
  PROVINCE_EXTRUSION_ID
} from './js/mapConfig'
import { cloneValue } from './js/geoUtils'
import { useZoomThresholdSwitch } from './js/useZoomThresholdSwitch'

// ✅ WFS 边界加载（替代本地 610000.json / 610000_full.json）
import { loadShaanxiProvince, loadShaanxiCities } from '@/utils/shaanxiBoundary'

import fjIcon from '@/assets/img/mapIcon/fj-icon.png'
import gfIcon from '@/assets/img/mapIcon/gf-icon.png'
import fengjiIcon from '@/assets/img/mapIcon/fengji.png'
import fengjiBxIcon from '@/assets/img/mapIcon/fengji-bx.png'
import shengyazhanIcon from '@/assets/img/mapIcon/syz.png'
import {
  getIconNaturalWidth,
  getCoordsBounds,
  calcIconSizeAtRef,
  buildIconSizeExpression,
} from '@/components/site-map/areaCenterIcon'

// ==================== 常量 ====================
const CITY_OPTIONS = [
  { label: '西安市', value: '610100' }, { label: '铜川市', value: '610200' },
  { label: '宝鸡市', value: '610300' }, { label: '咸阳市', value: '610400' },
  { label: '渭南市', value: '610500' }, { label: '延安市', value: '610600' },
  { label: '汉中市', value: '610700' }, { label: '榆林市', value: '610800' },
  { label: '安康市', value: '610900' }, { label: '商洛市', value: '611000' }
]

const ICON_FENGJI = 'icon-fengji-overview'
const ICON_FENGJI_BX = 'icon-fengji-bx-overview'
const ICON_SHENGYAZHAN = 'icon-shengyazhan-overview'
const ICON_AREA_FJ = 'icon-area-fj-overview'
const ICON_AREA_GF = 'icon-area-gf-overview'
const AREA_CENTER_LAYER_ID = 'overview-project-area-center-icons'
let areaCenterIconRequestVersion = 0

// —— 场区道路 / 线路图层 ——
const ROAD_LAYER_ID = 'overview-project-road-layer'
const LINE_LAYER_ID = 'overview-project-35kv-line-layer'
let overviewRoadRequestVersion = 0
let currentOverviewRoadProjectId = null
const overviewRoadCache = new Map()
const overviewRoadInFlight = new Map()

const ROAD_LINE_COLORS = {
  road: '#2563eb',
  line: '#eab308',
}
const ROAD_PAINT = {
  'line-color': ROAD_LINE_COLORS.road,
  'line-width': 2.5,
  'line-opacity': 0.95,
}
const LINE_PAINT = {
  'line-color': ROAD_LINE_COLORS.line,
  'line-width': 2.5,
  'line-opacity': 0.95,
}
const lineTip = reactive({ visible: false, x: 0, y: 0, text: '' })

const PROJECT_ICON_LAYER_MAP = {
  'wind-gh': ['overview-project-wind-all', 'overview-project-wind-bx-all'],
  booster: ['overview-project-booster-all'],
}

const TERRAIN_SOURCE_ID = 'terrain-dem'
const HILLSHADE_SOURCE_ID = 'hillshade-dem'
const HILLSHADE_LAYER_ID = 'terrain-hillshade'
const TERRAIN_TILEJSON_URL = 'https://gis-rustfs.wh-ge.com/terrain/china-dem/tilejson.json'
const TERRAIN_EXAGGERATION = 1.5

const PROVINCE_MAP_STYLE = {
  defaultHeight: 20000,
  defaultColor: '#8CCBF5',
  highlightColor: '#EFA83D',
  opacity: 1,
  lineColor: '#E6F9FF',
  hoverLineColor: '#FFFFFF',
  borderWidth: 1000,
  borderHeight: 120,
  sideColors: ['#0072FF', '#2F8CFF', '#62A8FF', '#9AC7FF', '#D0E5FF', '#FFFFFF'],
  sideBands: 10,
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

const STAGE_ACTIONS = {
  PRELIMINARY_SELECTION: ['assign', 'verify', 'reserve', 'edit', 'delete'],
  PROJECT_RESERVE: ['material', 'edit', 'assign', 'delete'],
  PROJECT_INITIATION: ['establishMeeting', 'researchMaterial', 'edit', 'assign', 'delete'],
  FEASIBILITY_REVIEW: ['researchReview', 'investMaterial', 'edit', 'assign', 'delete'],
  INVESTMENT_DECISION: ['investMeeting', 'edit', 'assign', 'delete'],
}
const ACTION_LABELS = {
  material: '立项材料',
  researchMaterial: '可研材料',
  investMaterial: '投决材料',
  establishMeeting: '立项上会',
  researchReview: '可研审查',
  investMeeting: '投决上会',
  assign: '分配',
  verify: '核查',
  reserve: '储备',
  edit: '编辑',
  delete: '删除',
}

// ==================== 基础状态 ====================
const mapRef = ref(null)
const selectedStage = ref(null)
const activeProject = ref(null)
const mapReady = ref(false)
let hasEntered = false
const viewMode = ref('map')
const showLayerPanel = ref(false)
let whlnPlugin = null
const layerVisibleIds = ref([...DEFAULT_VISIBLE])
const isDetailFullscreen = ref(false)

const activeEditTool = ref('')
const rightPanelMode = ref('list')
const listExpanded = ref(false)
const activeAreaId = ref(null)
const activeProjectDetail = ref(projectDetailMockData)
const reportModalVisible = ref(false)
const detailLoading = ref(false)

const popoverProject = ref(null)
const selectedProject = ref(null)

const popoverActions = computed(() => {
  const actions = STAGE_ACTIONS[popoverProject.value?.projectStage] || STAGE_ACTIONS.PRELIMINARY_SELECTION
  const displayOrder = ['edit', 'reserve', 'verify', 'assign']
  const otherActions = actions.filter((action) => !displayOrder.includes(action) && action !== 'delete')
  const result = [
    ...displayOrder.filter((action) => actions.includes(action)),
    ...otherActions,
  ]
  if (actions.includes('delete')) {
    result.push('delete')
  }
  return result
})

const visiblePopoverActions = computed(() => {
  const all = popoverActions.value
  if (all.length <= 5) return all

  const withoutDelete = all.filter(a => a !== 'delete')
  const hasDelete = all.includes('delete')

  return hasDelete ? [...withoutDelete.slice(0, 4), 'delete'] : withoutDelete.slice(0, 5)
})

const overflowPopoverActions = computed(() => {
  const all = popoverActions.value
  if (all.length <= 5) return []

  const withoutDelete = all.filter(a => a !== 'delete')
  const hasDelete = all.includes('delete')

  return hasDelete ? withoutDelete.slice(4) : withoutDelete.slice(5)
})
const actionMenuOpen = ref(false)
const actionProject = ref(null)
const showVerifyPanel = ref(false)
const showSiteMapDetailPanel = ref(false)
const showGeneratePanel = ref(false)
const generatePanelProject = ref(null)
const generatePanelActionKey = ref('')
const generatePanelSubCode = ref('')
const detailPanelTab = ref('main')
const showAssignDialog = ref(false)
const showReserveDialog = ref(false)
const showEditProject = ref(false)
const editProjectTarget = ref(null)
const editProjectFormRef = ref(null)
const refreshingActionProject = ref(false)
const deleteConfirmOpen = ref(false)
const wizardVisible = ref(false)
const isActionPanelOpen = computed(() => (
  showEditProject.value ||
  showVerifyPanel.value ||
  showSiteMapDetailPanel.value ||
  showGeneratePanel.value ||
  showAssignDialog.value ||
  showReserveDialog.value ||
  reportModalVisible.value ||
  refreshingActionProject.value ||
  deleteConfirmOpen.value ||
  wizardVisible.value
))

const geometryProject = ref(null)
const editBuffer = ref(null)
const isEditing = ref(false)
const editMode = ref(null)
const drawingNewPoint = ref(false)
const isBoxSelecting = ref(false)
const saving = ref(false)
const isDirty = ref(false)
const hasSaved = ref(false)
const recalculating = ref(false)
let suppressDrawSync = false
const editTools = [
  { key: 'area', label: '编辑场区', icon: Location },
  { key: 'wind', label: '编辑风机', icon: MapLocation },
  { key: 'booster', label: '编辑升压站', icon: CircleCheck },
  { key: 'unavailable', label: '设置不可用区域', icon: CircleClose },
]

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
  return pts.filter((p) => Number(p.isReserve) !== 1).length
})
const popoverAltCount = computed(() => {
  const pts = popoverProject.value?.windTurbinePoints || []
  return pts.filter((p) => Number(p.isReserve) === 1).length
})

function getHoverThemeColor(projectStage) {
  const style = getAreaStyleByStage(projectStage)
  return style.outlineColor || '#22c55e'
}
function onCityClick(feature) {
  if (isAreaView.value) return
  if (!hasEntered) return
  const name = feature?.properties?.name
  if (name) focusCity(name)
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
  const popoverId = popoverProject.value?.id
  const selectedId = selectedProject.value?.id
  if (
    (popoverId != null && String(popoverId) === String(item.id)) ||
    (selectedId != null && String(selectedId) === String(item.id))
  ) return

  clearOverviewRoadLayer()
  popoverProject.value = item
  actionMenuOpen.value = false
  void renderAreaCenterIcons()

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
  loadOverviewRoadData(item.id)
}

async function handleOpenDetailPanel(item) {
  popoverProject.value = null
  actionMenuOpen.value = false
  selectedProject.value = item

  activeAreaId.value = item.id
  activeProjectDetail.value = buildDetailFromListItem(item)

  rightPanelMode.value = 'detail'
  isDetailFullscreen.value = true
  await loadAiProjectDetail(item.id)
}

function resolveMapProject(project) {
  return mapProjects.value.find((item) => String(item.id) === String(project?.id)) || project
}

function openSiteMapDetailPanel(project, tab = 'main') {
  actionProject.value = resolveMapProject(project)
  detailPanelTab.value = tab
  actionMenuOpen.value = false
  showSiteMapDetailPanel.value = true
}

function executeProjectAction(action, project) {
  if (!project) return
  const item = resolveMapProject(project)
  actionProject.value = item
  actionMenuOpen.value = false

  if (['material', 'researchMaterial', 'investMaterial'].includes(action)) {
    openSiteMapDetailPanel(item, 'material')
    return
  }
  if (['establishMeeting', 'researchReview', 'investMeeting'].includes(action)) {
    openSiteMapDetailPanel(item, 'meeting')
    return
  }
  if (action === 'assign') {
    showAssignDialog.value = true
    return
  }
  if (action === 'verify') {
    showVerifyPanel.value = true
    return
  }
  if (action === 'reserve') {
    showReserveDialog.value = true
    return
  }
  if (action === 'edit') {
    openEditProjectForm(item)
    return
  }
  if (action === 'delete') {
    void handleDeleteProject(item)
    return
  }
  ElMessage.info(`点击了「${ACTION_LABELS[action] || action}」：${item.projectName || ''}`)
}

function openEditProjectForm(project) {
  if (isDirty.value) {
    ElMessage.warning('请先保存或取消地图上的修改')
    return
  }
  actionProject.value = resolveMapProject(project)
  editProjectTarget.value = actionProject.value
  actionMenuOpen.value = false
  clearSelectedProjectIcons()
  showEditProject.value = true
}

async function onProjectUpdated() {
  showEditProject.value = false
  editProjectTarget.value = null
  await refreshActionProjectData()
}

function onEditProjectCancel() {
  showEditProject.value = false
  editProjectTarget.value = null
  if (actionProject.value) void renderSelectedProjectIcons(actionProject.value)
}

async function handleDeleteProject(project) {
  if (!project) return
  deleteConfirmOpen.value = true
  try {
    await ElMessageBox.confirm(
      `确认删除项目「${project.projectName || ''}」吗？删除后不可恢复。`,
      '提示',
      { type: 'warning' },
    )
  } catch {
    deleteConfirmOpen.value = false
    return
  }

  try {
    const response = await newApi.deletProject(project.id)
    if (response?.code !== 200) {
      ElMessage.error(response?.msg || '删除失败')
      return
    }
    ElMessage.success('删除成功')
    if (String(popoverProject.value?.id) === String(project.id)) popoverProject.value = null
    if (String(actionProject.value?.id) === String(project.id)) actionProject.value = null
    await Promise.all([fetchMapProjects(), fetchProjectList()])
  } catch (error) {
    ElMessage.error(error?.message || '删除失败')
  } finally {
    deleteConfirmOpen.value = false
  }
}

async function onVerifySaved() {
  showVerifyPanel.value = false
  await refreshActionProjectData()
}

async function onAssignSuccess() {
  await refreshActionProjectData()
}

async function onReserveSaved() {
  await refreshActionProjectData()
}

async function refreshActionProjectData() {
  const projectId = actionProject.value?.id
  refreshingActionProject.value = true
  try {
    await Promise.all([fetchMapProjects(), fetchProjectList()])
    if (projectId == null) return
    const fresh = mapProjects.value.find((item) => String(item.id) === String(projectId))
    if (!fresh) return
    actionProject.value = fresh
    if (popoverProject.value && String(popoverProject.value.id) === String(projectId)) {
      popoverProject.value = fresh
    }
    if (mapReady.value && isAreaView.value) await renderProjectsByStage('area')
  } finally {
    refreshingActionProject.value = false
  }
}

async function onSiteMapDetailAction(payload) {
  if (payload?.type === 'stage-changed') {
    showSiteMapDetailPanel.value = false
    await refreshActionProjectData()
    return
  }
  if (payload?.type === 'generate-report') {
    generatePanelProject.value = payload.project || actionProject.value
    generatePanelActionKey.value = payload.actionKey || ''
    generatePanelSubCode.value = payload.subCode || ''
    showGeneratePanel.value = true
  }
}

function onReportGenerated() {
  showGeneratePanel.value = false
  ElMessage.success('报告生成完成')
}

// ==================== 地图场区/点位编辑 ====================
function startGeometryEdit(project, mode = 'area') {
  const item = resolveMapProject(project)
  if (!item) return
  if (isDirty.value) {
    ElMessage.warning('当前地图修改尚未保存，请先保存或取消')
    return
  }

  geometryProject.value = item
  actionProject.value = item
  popoverProject.value = null
  selectedProject.value = null
  actionMenuOpen.value = false
  rightPanelMode.value = 'list'
  isDetailFullscreen.value = false
  clearOverviewRoadLayer()

  isEditing.value = true
  isDirty.value = false
  hasSaved.value = false
  initEditBuffer(item)
  enterEditMode(mode)
}

function initEditBuffer(project) {
  const area = getProjectCoords(project)
  const wind = (project.windTurbinePoints || [])
    .map((point) => {
      const lng = Number(point.longitude)
      const lat = Number(point.latitude)
      return Number.isFinite(lng) && Number.isFinite(lat)
        ? { lng, lat, isReserve: Number(point.isReserve) === 1 ? 1 : 0 }
        : null
    })
    .filter(Boolean)
  const booster = (project.boosterStationLocations || [])
    .map((point) => {
      const lng = Number(point.lng)
      const lat = Number(point.lat)
      return Number.isFinite(lng) && Number.isFinite(lat)
        ? { lng, lat, isBest: point.isBest === true || Number(point.isBest) === 1 ? 1 : 0 }
        : null
    })
    .filter(Boolean)
  editBuffer.value = { area, wind, booster, unavailable: [] }
}

function closeRing(coords) {
  if (!coords || coords.length < 3) return coords
  const first = coords[0]
  const last = coords[coords.length - 1]
  return first[0] === last[0] && first[1] === last[1]
    ? coords
    : [...coords, [first[0], first[1]]]
}

function syncDrawToBuffer() {
  if (!editBuffer.value) return
  const draw = mapRef.value?.getDraw?.()
  const all = draw?.getAll?.() || { type: 'FeatureCollection', features: [] }
  if (editMode.value === 'area') {
    const areaFeature = all.features.find((feature) => feature.properties?.kind === 'area')
    editBuffer.value.area = areaFeature
      ? areaFeature.geometry.coordinates[0].map(([lng, lat]) => [lng, lat])
      : []
  } else if (editMode.value === 'wind') {
    editBuffer.value.wind = all.features
      .filter((feature) => feature.properties?.kind === 'wind')
      .map((feature) => ({
        lng: feature.geometry.coordinates[0],
        lat: feature.geometry.coordinates[1],
        isReserve: Number(feature.properties?.isReserve) === 1 ? 1 : 0,
      }))
  } else if (editMode.value === 'booster') {
    editBuffer.value.booster = all.features
      .filter((feature) => feature.properties?.kind === 'booster')
      .map((feature) => ({
        lng: feature.geometry.coordinates[0],
        lat: feature.geometry.coordinates[1],
        isBest: Number(feature.properties?.isBest) === 1 ? 1 : 0,
      }))
  } else if (editMode.value === 'unavailable') {
    editBuffer.value.unavailable = all.features.filter((feature) => feature.properties?.kind === 'unavailable')
  }
  refreshAllPointsLayers()
}

function onDrawChange(event) {
  if (suppressDrawSync || !isEditing.value) return
  const draw = mapRef.value?.getDraw?.()
  if (event?.features?.length && draw && ['wind', 'booster', 'unavailable'].includes(editMode.value)) {
    const kind = editMode.value
    event.features.forEach((feature) => {
      if (!feature?.id || feature.geometry?.type !== (kind === 'unavailable' ? 'Polygon' : 'Point')) return
      if (feature.properties?.kind) return
      draw.setFeatureProperty(feature.id, 'kind', kind)
      if (kind === 'wind') draw.setFeatureProperty(feature.id, 'isReserve', 0)
      if (kind === 'booster') draw.setFeatureProperty(feature.id, 'isBest', 0)
    })
  }
  syncDrawToBuffer()
  isDirty.value = true
}

function enterEditMode(mode) {
  if (!geometryProject.value || !editBuffer.value) return
  const draw = mapRef.value?.getDraw?.()
  if (!draw) return

  const currentFeatures = draw.getAll?.().features || []
  if (!suppressDrawSync && currentFeatures.length) syncDrawToBuffer()
  refreshAllPointsLayers()
  suppressDrawSync = true
  editMode.value = mode
  drawingNewPoint.value = false
  isBoxSelecting.value = false
  mapRef.value?.stopBoxSelect?.()
  mapRef.value?.clearEditableAreas?.()

  const features = []
  const buffer = editBuffer.value
  if (mode === 'area' && buffer.area?.length >= 3) {
    features.push({
      type: 'Feature',
      id: 'edit-area',
      properties: { kind: 'area' },
      geometry: { type: 'Polygon', coordinates: [closeRing(buffer.area)] },
    })
  } else if (mode === 'wind') {
    buffer.wind.forEach((point, index) => {
      features.push({
        type: 'Feature',
        id: `edit-wind-${index}`,
        properties: { kind: 'wind', index, isReserve: point.isReserve },
        geometry: { type: 'Point', coordinates: [point.lng, point.lat] },
      })
    })
  } else if (mode === 'booster') {
    buffer.booster.forEach((point, index) => {
      features.push({
        type: 'Feature',
        id: `edit-booster-${index}`,
        properties: { kind: 'booster', index, isBest: point.isBest },
        geometry: { type: 'Point', coordinates: [point.lng, point.lat] },
      })
    })
  } else if (mode === 'unavailable') {
    buffer.unavailable.forEach((feature) => features.push(feature))
  }

  try {
    if (features.length) draw.add({ type: 'FeatureCollection', features })
    if (mode === 'area') {
      const areaFeature = features.find((feature) => feature.properties.kind === 'area')
      if (areaFeature) draw.changeMode('vertex_only_direct_select', { featureId: areaFeature.id })
      else draw.changeMode('simple_select')
    } else if (mode === 'unavailable') {
      draw.changeMode('draw_polygon')
    } else {
      draw.changeMode('simple_select')
    }
  } finally {
    nextTick(() => {
      mapRef.value?.bringDrawPointsToTop?.()
      suppressDrawSync = false
    })
  }
}

function startAddWindPoint() {
  const draw = mapRef.value?.getDraw?.()
  if (!draw) return
  draw.changeMode('draw_point')
  drawingNewPoint.value = true
  ElMessage.info('点击地图添加风机')
}

function toggleAddPoint() {
  const draw = mapRef.value?.getDraw?.()
  if (!draw) return
  if (drawingNewPoint.value) {
    draw.changeMode('simple_select')
    drawingNewPoint.value = false
  } else {
    draw.changeMode('draw_point')
    drawingNewPoint.value = true
    ElMessage.info('点击地图添加升压站')
  }
}

function startBoxSelection() {
  if (!['wind', 'booster'].includes(editMode.value)) {
    ElMessage.warning('仅支持在编辑风机/升压站时框选')
    return
  }
  isBoxSelecting.value = true
  mapRef.value?.startBoxSelect?.()
  ElMessage.info('请在地图上拖拽进行框选')
}

function handleBoxSelect(featureIds) {
  if (!featureIds?.length) return
  const draw = mapRef.value?.getDraw?.()
  if (draw) {
    draw.changeMode('simple_select', { featureIds })
    isBoxSelecting.value = false
  }
}

function markReserve(isReserve) {
  const draw = mapRef.value?.getDraw?.()
  if (!draw) return
  const ids = draw.getSelectedIds?.() || []
  if (!ids.length) {
    ElMessage.warning('请先选中风机点位')
    return
  }
  let count = 0
  ids.forEach((id) => {
    const feature = draw.get(id)
    if (feature?.properties?.kind !== 'wind') return
    draw.setFeatureProperty(id, 'isReserve', isReserve ? 1 : 0)
    count += 1
  })
  if (!count) return
  syncDrawToBuffer()
  enterEditMode('wind')
  isDirty.value = true
  ElMessage.success(`已${isReserve ? '标记' : '取消'}备选 ${count} 个风机`)
}

function deleteSelectedPoints() {
  const draw = mapRef.value?.getDraw?.()
  if (!draw) return
  const ids = draw.getSelectedIds?.() || []
  if (!ids.length) {
    ElMessage.warning('请先选中要删除的点')
    return
  }
  draw.delete(ids)
  syncDrawToBuffer()
  enterEditMode(editMode.value)
  isDirty.value = true
  ElMessage.success(`已删除 ${ids.length} 个点`)
}

function refreshAllPointsLayers() {
  const map = mapRef.value?.getMap?.()
  if (!map || !editBuffer.value || !geometryProject.value) return
  const windNormalFeatures = []
  const windReserveFeatures = []
  editBuffer.value.wind.forEach((point, index) => {
    const feature = {
      type: 'Feature',
      properties: { projectId: geometryProject.value.id, index, isReserve: point.isReserve },
      geometry: { type: 'Point', coordinates: [point.lng, point.lat] },
    }
    ;(Number(point.isReserve) === 1 ? windReserveFeatures : windNormalFeatures).push(feature)
  })
  const boosterFeatures = editBuffer.value.booster.map((point, index) => ({
    type: 'Feature',
    properties: { projectId: geometryProject.value.id, index, isBest: Number(point.isBest) === 1 },
    geometry: { type: 'Point', coordinates: [point.lng, point.lat] },
  }))
  map.getSource('overview-project-wind-all')?.setData({ type: 'FeatureCollection', features: windNormalFeatures })
  map.getSource('overview-project-wind-bx-all')?.setData({ type: 'FeatureCollection', features: windReserveFeatures })
  map.getSource('overview-project-booster-all')?.setData({ type: 'FeatureCollection', features: boosterFeatures })
}

async function saveEdit() {
  if (!editBuffer.value || !geometryProject.value || saving.value) return
  syncDrawToBuffer()
  const project = geometryProject.value
  const projectId = project.id
  if (editBuffer.value.area.length < 3) {
    ElMessage.warning('场区至少需要 3 个有效坐标点')
    return
  }

  const fallbackRegionCode = project.coordinate?.[0]?.regionCode ?? null
  const coordinate = editBuffer.value.area.map(([lng, lat]) => ({
    regionCode: fallbackRegionCode,
    longitude: String(lng),
    latitude: String(lat),
  }))
  const windTurbinePoints = editBuffer.value.wind.map((point) => ({
    longitude: point.lng,
    latitude: point.lat,
    isReserve: point.isReserve,
  }))
  const boosterStationLocations = editBuffer.value.booster.map((point) => ({
    lng: point.lng,
    lat: point.lat,
    isBest: point.isBest,
  }))
  const payload = {
    coordinate,
    windTurbinePoints,
    boosterStationLocations,
    accessSubstationName: project.accessSubstationName ?? null,
    accessSubstationPoints: project.accessSubstationPoints ?? null,
    address: project.address ?? null,
    capitalFinancialRate: project.capitalFinancialRate ?? null,
    city: project.city ?? null,
    currentProjectCapacity: project.currentProjectCapacity ?? null,
    district: project.district ?? null,
    fileCollection: project.fileCollection ?? [],
    itemType: project.itemType ?? null,
    notes: project.notes ?? null,
    projectCode: project.projectCode ?? null,
    projectName: project.projectName ?? null,
    projectStage: project.projectStage ?? null,
    province: project.province ?? null,
    sendOutType: project.sendOutType ?? null,
  }

  try {
    saving.value = true
    const response = await configApi.upDataLayer(projectId, payload)
    if (response?.code !== 200) {
      ElMessage.error(response?.msg || '保存失败')
      return
    }

    Object.assign(project, { coordinate, windTurbinePoints, boosterStationLocations })
    const target = mapProjects.value.find((item) => String(item.id) === String(projectId))
    if (target) Object.assign(target, { coordinate, windTurbinePoints, boosterStationLocations })
    geometryProject.value = target || project
    actionProject.value = geometryProject.value
    await renderProjectsByStage('area')
    initEditBuffer(geometryProject.value)
    editMode.value = null
    isDirty.value = false
    hasSaved.value = true
    ElMessage.success('保存成功')
    await fetchProjectList()
  } catch (error) {
    ElMessage.error(error?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

async function handleRecalculate() {
  if (!geometryProject.value || !hasSaved.value || recalculating.value) return
  try {
    recalculating.value = true
    const response = await configApi.updateCalculateStatus(geometryProject.value.id, { isReturnProject: 1 })
    if (response?.code === 200) {
      ElMessage.success('重新计算发起成功')
      hasSaved.value = false
      await Promise.all([fetchMapProjects(), fetchProjectList()])
    } else {
      ElMessage.error(response?.msg || '重新计算失败')
    }
  } catch (error) {
    ElMessage.error(error?.message || '重新计算请求异常')
  } finally {
    recalculating.value = false
  }
}

function exitEditMode() {
  if (!isEditing.value) return
  const project = geometryProject.value
  suppressDrawSync = true
  mapRef.value?.clearEditableAreas?.()
  mapRef.value?.stopBoxSelect?.()
  nextTick(() => { suppressDrawSync = false })
  editBuffer.value = null
  geometryProject.value = null
  drawingNewPoint.value = false
  isBoxSelecting.value = false
  isEditing.value = false
  isDirty.value = false
  editMode.value = null
  if (project && isAreaView.value) {
    popoverProject.value = resolveMapProject(project)
    void renderProjectsByStage('area')
    loadOverviewRoadData(project.id)
  }
}

function cancelEdit() {
  if (isDirty.value) {
    ElMessageBox.confirm('放弃当前未保存的地图修改吗？', '确认取消', { type: 'warning' })
      .then(() => exitEditMode())
      .catch(() => {})
    return
  }
  exitEditMode()
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

// ==================== 图层显隐 ====================
function setProjectIconVisible(chipId, visible) {
  const layerIds = PROJECT_ICON_LAYER_MAP[chipId]
  if (!layerIds) return
  const map = mapRef.value?.getMap?.()
  if (!map) return
  for (const layerId of layerIds) {
    if (map.getLayer(layerId)) map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none')
  }
}
function syncAllProjectIcons() {
  for (const chipId of Object.keys(PROJECT_ICON_LAYER_MAP)) {
    setProjectIconVisible(chipId, layerVisibleIds.value.includes(chipId))
  }
}

function toggleCustomLayer(id, visible) {
  if (id === 'road' || id === 'line') {
    syncRoadLineVisibility()
    return
  }
}

function handleAddProject() { ElMessage.info('添加项目功能已停用') }

// ==================== 3D 地形 ====================
function toggleTerrain(shouldEnable) {
  const map = mapRef.value?.getMap?.()
  if (!map) return

  if (!shouldEnable) {
    try { map.setTerrain(null) } catch (err) { console.warn('[terrain] 关闭地形失败:', err) }
    if (map.getLayer(HILLSHADE_LAYER_ID)) map.removeLayer(HILLSHADE_LAYER_ID)
    return
  }

  try {
    if (!map.getSource(TERRAIN_SOURCE_ID)) {
      map.addSource(TERRAIN_SOURCE_ID, { type: 'raster-dem', url: TERRAIN_TILEJSON_URL, maxzoom: 14 })
    }
    if (!map.getSource(HILLSHADE_SOURCE_ID)) {
      map.addSource(HILLSHADE_SOURCE_ID, { type: 'raster-dem', url: TERRAIN_TILEJSON_URL })
    }
    map.setTerrain({ source: TERRAIN_SOURCE_ID, exaggeration: TERRAIN_EXAGGERATION })
    if (!map.getLayer(HILLSHADE_LAYER_ID)) {
      map.addLayer({
        id: HILLSHADE_LAYER_ID,
        type: 'hillshade',
        source: HILLSHADE_SOURCE_ID,
        layout: { visibility: 'visible' },
        paint: { 'hillshade-shadow-color': '#473B24' },
      })
    }
  } catch (err) {
    console.error('[terrain] 开启地形失败:', err)
    ElMessage.error('3D 地形开启失败，请检查网络或 DEM 服务')
  }
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

function unwrapOverviewRoadResponse(response) {
  let value = response
  for (let i = 0; i < 4; i += 1) {
    if (
      value &&
      typeof value === 'object' &&
      value.data != null &&
      !Object.prototype.hasOwnProperty.call(value, 'roadMap') &&
      !Object.prototype.hasOwnProperty.call(value, 'line') &&
      !Object.prototype.hasOwnProperty.call(value, 'CNKJ')
    ) {
      value = value.data
      continue
    }
    break
  }
  return value
}

function toOverviewMapCoordinate(point) {
  const lng = Number(Array.isArray(point) ? point[0] : (point?.lon ?? point?.lng ?? point?.longitude))
  const lat = Number(Array.isArray(point) ? point[1] : (point?.lat ?? point?.latitude))
  return Number.isFinite(lng) && Number.isFinite(lat) ? [lng, lat] : null
}

function pushOverviewLineFeatures(target, rows, baseProps) {
  if (!Array.isArray(rows) || rows.length === 0) return 0
  const groups = Array.isArray(rows[0]) ? rows : [rows]
  let count = 0
  groups.forEach((group) => {
    if (!Array.isArray(group)) return
    const coords = group.map(toOverviewMapCoordinate).filter(Boolean)
    if (coords.length < 2) return
    target.push({
      type: 'Feature',
      properties: { ...baseProps },
      geometry: { type: 'LineString', coordinates: coords },
    })
    count += 1
  })
  return count
}

function buildRoadLineFeatures(data) {
  const roadFeatures = []
  const lineFeatures = []

  const roadMap = data?.roadMap ?? data?.data?.roadMap ?? {}
  for (const type of ['CNKJ', 'CNXJ', 'JZXJ']) {
    pushOverviewLineFeatures(
      roadFeatures,
      roadMap?.[type]?.roadpoint,
      { category: 'road', sourceType: type, label: '道路' }
    )
  }

  const line35Kv = data?.line35Kv ?? data?.data?.line35Kv
  const loops = line35Kv?.line?.loops ?? data?.line?.loops ?? []
  if (Array.isArray(loops)) {
    loops.forEach((loop, loopIndex) => {
      const loopName = loop?.loopname || String(loopIndex + 1)
      pushOverviewLineFeatures(
        lineFeatures,
        loop?.cablepoletower,
        {
          category: 'line',
          loopIndex,
          loopName,
          loopLength: loop?.looplength || '',
          fanCount: Number(loop?.fan) || (loop?.fanidarr?.length ?? 0),
          label: `35kV 线路 ${loopName}`,
        }
      )
    })
  }

  return { roadFeatures, lineFeatures }
}

function upsertLineLayer(layerId, geojson, paint) {
  const map = mapRef.value?.getMap?.()
  if (!map) return
  const sourceId = `${layerId}-src`

  if (map.getSource(sourceId)) {
    map.getSource(sourceId).setData(geojson)
    if (!map.getLayer(layerId)) {
      map.addLayer({ id: layerId, type: 'line', source: sourceId, layout: { visibility: 'visible' }, paint })
    } else {
      map.setLayoutProperty(layerId, 'visibility', 'visible')
    }
  } else {
    map.addSource(sourceId, { type: 'geojson', data: geojson })
    map.addLayer({ id: layerId, type: 'line', source: sourceId, layout: { visibility: 'visible' }, paint })
  }

  map.off('mousemove', layerId, onLineHoverMove)
  map.off('mouseleave', layerId, onLineHoverLeave)
  map.on('mousemove', layerId, onLineHoverMove)
  map.on('mouseleave', layerId, onLineHoverLeave)

  if (mapRef.value?.hasMaskLayer?.(MASK_LAYER_ID)) mapRef.value.bringMaskToTop(MASK_LAYER_ID)
}

function syncRoadLineVisibility() {
  const map = mapRef.value?.getMap?.()
  if (!map) return
  const roadOn = layerVisibleIds.value.includes('road')
  const lineOn = layerVisibleIds.value.includes('line')
  const pid = popoverProject.value?.id ?? selectedProject.value?.id
  const cached = pid != null ? overviewRoadCache.get(pid) : null

  if (roadOn && cached?.roadFeatures?.length) {
    upsertLineLayer(ROAD_LAYER_ID, { type: 'FeatureCollection', features: cached.roadFeatures }, ROAD_PAINT)
  } else if (map.getLayer(ROAD_LAYER_ID)) {
    map.setLayoutProperty(ROAD_LAYER_ID, 'visibility', 'none')
  }

  if (lineOn && cached?.lineFeatures?.length) {
    upsertLineLayer(LINE_LAYER_ID, { type: 'FeatureCollection', features: cached.lineFeatures }, LINE_PAINT)
  } else if (map.getLayer(LINE_LAYER_ID)) {
    map.setLayoutProperty(LINE_LAYER_ID, 'visibility', 'none')
  }

  if (!roadOn && !lineOn) lineTip.visible = false
}

function removeRoadLineLayers() {
  const map = mapRef.value?.getMap?.()
  if (map) {
    for (const layerId of [ROAD_LAYER_ID, LINE_LAYER_ID]) {
      map.off('mousemove', layerId, onLineHoverMove)
      map.off('mouseleave', layerId, onLineHoverLeave)
      if (map.getLayer(layerId)) map.removeLayer(layerId)
      const sourceId = `${layerId}-src`
      if (map.getSource(sourceId)) map.removeSource(sourceId)
    }
    map.getCanvas().style.cursor = ''
  }
  lineTip.visible = false
}

function clearOverviewRoadLayer() {
  overviewRoadRequestVersion += 1
  overviewRoadInFlight.clear()
  currentOverviewRoadProjectId = null
  removeRoadLineLayers()
}

function onLineHoverMove(e) {
  const feature = e.features?.[0]
  if (!feature) return
  const props = feature.properties || {}

  if (props.category === 'line') {
    const parts = ['35kV 线路']
    if (props.loopName) parts.push(`回路 ${props.loopName}`)
    if (props.loopLength && props.loopLength !== '0') parts.push(`${props.loopLength} km`)
    if (props.fanCount) parts.push(`${props.fanCount} 台风机`)
    lineTip.text = parts.join(' · ')
  } else {
    lineTip.text = props.label || '道路'
  }

  lineTip.x = e.point.x
  lineTip.y = e.point.y
  lineTip.visible = true
  const map = mapRef.value?.getMap?.()
  if (map) map.getCanvas().style.cursor = 'pointer'
}

function onLineHoverLeave() {
  lineTip.visible = false
  const map = mapRef.value?.getMap?.()
  if (map) map.getCanvas().style.cursor = ''
}

async function loadOverviewRoadData(projectId) {
  const isActive = () => {
    const pid = String(projectId)
    return String(popoverProject.value?.id ?? '') === pid
        || String(selectedProject.value?.id ?? '') === pid
  }
  if (!isActive()) return

  const cached = overviewRoadCache.get(projectId)
  if (cached) {
    if (currentOverviewRoadProjectId !== String(projectId)) {
      removeRoadLineLayers()
      currentOverviewRoadProjectId = String(projectId)
    }
    syncRoadLineVisibility()
    return
  }
  if (overviewRoadInFlight.has(projectId)) return

  const requestVersion = ++overviewRoadRequestVersion
  overviewRoadInFlight.set(projectId, requestVersion)
  removeRoadLineLayers()
  currentOverviewRoadProjectId = null

  try {
    const res = await newApi.getRoadData(projectId)
    if (requestVersion !== overviewRoadRequestVersion || !isActive()) return

    const data = unwrapOverviewRoadResponse(res)
    const { roadFeatures, lineFeatures } = buildRoadLineFeatures(data)
    overviewRoadCache.set(projectId, { roadFeatures, lineFeatures })
    currentOverviewRoadProjectId = String(projectId)
    syncRoadLineVisibility()

    if (!roadFeatures.length && !lineFeatures.length) {
      ElMessage.info('接口未返回可绘制的道路或线路点位')
    }
  } catch (err) {
    console.warn('[overview-road] 道路/线路数据加载失败:', err)
    ElMessage.warning(err?.message || '道路或线路数据加载失败')
  } finally {
    if (overviewRoadInFlight.get(projectId) === requestVersion) {
      overviewRoadInFlight.delete(projectId)
    }
  }
}

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
  const normal = []
  const reserve = []
  for (const [index, point] of (project.windTurbinePoints || []).entries()) {
    const lng = Number(point.longitude)
    const lat = Number(point.latitude)
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue
    const isReserve = Number(point.isReserve) === 1
    const feature = {
      type: 'Feature',
      properties: { projectId: project.id, index, isReserve: isReserve ? 1 : 0 },
      geometry: { type: 'Point', coordinates: [lng, lat] },
    }
    ;(isReserve ? reserve : normal).push(feature)
  }
  return {
    normal: { type: 'FeatureCollection', features: normal },
    reserve: { type: 'FeatureCollection', features: reserve },
  }
}

function buildBoosterFC(project) {
  return {
    type: 'FeatureCollection',
    features: (project.boosterStationLocations || []).map((p, index) => {
      if (!(p.isBest === true || Number(p.isBest) === 1)) return null
      const lng = Number(p.lng); const lat = Number(p.lat)
      if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null
      return { type: 'Feature', properties: { projectId: project.id, index, isBest: true }, geometry: { type: 'Point', coordinates: [lng, lat] } }
    }).filter(Boolean)
  }
}

function addProjectArea(project, highlighted = false) {
  const area = buildAreaFeature(project)
  if (!area) return
  const layerId = `overview-project-area-${project.id}`
  const base = getAreaStyleByStage(project.projectStage)

  // ✅ 与 SiteMapPage 一致：选中时透明只留描边，未选中时填充
  const style = highlighted
    ? {
        color: 'transparent',
        opacity: 0,
        outlineColor: base.outlineColor,
        outlineWidth: 3,
      }
    : {
        color: base.color,
        opacity: base.opacity,
        outlineColor: base.outlineColor,
        outlineWidth: 1.5,
      }

  mapRef.value.addPolygon({
    id: layerId,
    geojson: area,
    color: style.color,
    opacity: style.opacity,
    outlineColor: style.outlineColor,
    outlineWidth: style.outlineWidth,
  })
  renderedMapLayerIds.add(layerId)
  const fillLayerId = `${layerId}-fill`

  mapRef.value.offClick(fillLayerId)
  mapRef.value.onClick(fillLayerId, () => {
    if (!isEditing.value && !isActionPanelOpen.value) handleProjectSelect(project)
  })
}

async function safeAddIcon({ layerId, featureCollection, iconId, iconUrl, iconSize, iconAnchor = 'center', fallbackColor = '#3b82f6', fallbackRadius = 8 }) {
  try {
    await mapRef.value.ensureImage(iconId, iconUrl)
    await mapRef.value.addImagePoints({ id: layerId, geojson: featureCollection, iconId, iconUrl, iconSize, iconAnchor })
  } catch (err) { mapRef.value.addPoints({ id: layerId, geojson: featureCollection, color: fallbackColor, radius: fallbackRadius }) }
  renderedMapLayerIds.add(layerId)
}

function buildAreaCenterFC(projects = mapProjects.value, naturalWidthMap = {}) {
  const hiddenIds = new Set(
    [popoverProject.value?.id, selectedProject.value?.id, geometryProject.value?.id]
      .filter((id) => id != null)
      .map(String)
  )
  const features = projects
    .filter((project) => !hiddenIds.has(String(project.id)))
    .map((project) => {
      const center = getProjectCentroid(project)
      if (!center) return null
      const isGF = project.itemType === 'GF'
      const bounds = getCoordsBounds(getProjectCoords(project))
      const naturalWidth = isGF ? naturalWidthMap.gf : naturalWidthMap.fj
      return {
        type: 'Feature',
        properties: {
          projectId: project.id,
          iconId: isGF ? ICON_AREA_GF : ICON_AREA_FJ,
          sizeAtRef: calcIconSizeAtRef(bounds, naturalWidth),
        },
        geometry: { type: 'Point', coordinates: center },
      }
    })
    .filter(Boolean)
  return { type: 'FeatureCollection', features }
}

async function renderAreaCenterIcons() {
  const requestVersion = ++areaCenterIconRequestVersion
  if (!mapReady.value || !mapRef.value || !isAreaView.value) return

  const [fjW, gfW] = await Promise.all([
    getIconNaturalWidth(fjIcon),
    getIconNaturalWidth(gfIcon),
  ])
  if (requestVersion !== areaCenterIconRequestVersion) return

  const featureCollection = buildAreaCenterFC(mapProjects.value, { fj: fjW, gf: gfW })
  if (!featureCollection.features.length) {
    mapRef.value.removeLayer(AREA_CENTER_LAYER_ID)
    renderedMapLayerIds.delete(AREA_CENTER_LAYER_ID)
    return
  }

  try {
    await mapRef.value.ensureImage(ICON_AREA_FJ, fjIcon)
    await mapRef.value.ensureImage(ICON_AREA_GF, gfIcon)
    if (requestVersion !== areaCenterIconRequestVersion) return

    await mapRef.value.addImagePoints({
      id: AREA_CENTER_LAYER_ID,
      geojson: featureCollection,
      iconId: ICON_AREA_FJ,
      iconUrl: fjIcon,
      iconImage: ['get', 'iconId'],
      iconSize: 0.5,
      iconAnchor: 'center',
      allowOverlap: true,
      iconPitchAlignment: 'map',
      iconRotationAlignment: 'map',
      extraLayout: { 'icon-size': buildIconSizeExpression('sizeAtRef') },
      updateExisting: true,
    })
  } catch (err) {
    if (requestVersion !== areaCenterIconRequestVersion) return
    mapRef.value.addPoints({ id: AREA_CENTER_LAYER_ID, geojson: featureCollection, color: '#00e6c8', radius: 6 })
    console.warn('[overview-map] 场区中心图标加载失败:', err)
  }
  if (requestVersion === areaCenterIconRequestVersion) renderedMapLayerIds.add(AREA_CENTER_LAYER_ID)
}

function clearMapIconLayers() {
  if (!mapRef.value) return
  areaCenterIconRequestVersion += 1
  for (const id of renderedMapLayerIds) {
    mapRef.value.removeLayer(id)
  }
  renderedMapLayerIds.clear()
}

async function renderSelectedProjectIcons(project) {
  if (!mapRef.value || !mapReady.value || !project) return
  clearSelectedProjectIcons()
  const wf = buildWindFC(project)
  const bf = buildBoosterFC(project)
  await safeAddIcon({
    layerId: 'overview-project-wind-all',
    featureCollection: wf.normal,
    iconId: ICON_FENGJI,
    iconUrl: fengjiIcon,
    iconSize: ICON_SIZE_WIND,
    iconAnchor: 'bottom',
    fallbackColor: '#22c55e',
    fallbackRadius: 3,
  })
  await safeAddIcon({
    layerId: 'overview-project-wind-bx-all',
    featureCollection: wf.reserve,
    iconId: ICON_FENGJI_BX,
    iconUrl: fengjiBxIcon,
    iconSize: ICON_SIZE_WIND,
    iconAnchor: 'bottom',
    fallbackColor: '#f59e0b',
    fallbackRadius: 3,
  })
  await safeAddIcon({
    layerId: 'overview-project-booster-all',
    featureCollection: bf,
    iconId: ICON_SHENGYAZHAN,
    iconUrl: shengyazhanIcon,
    iconSize: ICON_SIZE_BOOSTER,
    iconAnchor: 'bottom',
    fallbackColor: '#ef4444',
    fallbackRadius: 3,
  })
  syncAllProjectIcons()
}

function clearSelectedProjectIcons() {
  if (!mapRef.value) return
  const map = mapRef.value.getMap?.()
  const layers = [
    'overview-project-wind-all',
    'overview-project-wind-bx-all',
    'overview-project-booster-all',
  ]
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
    addProjectArea(p, [popoverProject.value?.id, selectedProject.value?.id, geometryProject.value?.id].some((id) => id != null && String(id) === String(p.id)))
  }
  await renderAreaCenterIcons()
  if (popoverProject.value) await renderSelectedProjectIcons(popoverProject.value)
  else if (selectedProject.value) await renderSelectedProjectIcons(selectedProject.value)
  else if (geometryProject.value) await renderSelectedProjectIcons(geometryProject.value)
  syncAllProjectIcons()
}

async function fetchMapProjects() {
  try {
    const res = await newApi.getPageList({ pageNo: 1, pageSize: 500, province: '610000' })
    mapProjects.value = res?.data?.list ?? []
    if (mapReady.value && isAreaView.value) await renderProjectsByStage('area')
  } catch (err) { mapProjects.value = [] }
}

function clearSelection() {
  const activeId = selectedProject.value?.id ?? popoverProject.value?.id ?? null

  clearOverviewRoadLayer()
  popoverProject.value = null
  selectedProject.value = null
  actionMenuOpen.value = false
  void renderAreaCenterIcons()

  if (activeId) {
    const project = mapProjects.value.find((p) => String(p.id) === String(activeId))
    if (project && isAreaView.value) addProjectArea(project, false)
  }

  rightPanelMode.value = 'list'
  isDetailFullscreen.value = false
  clearSelectedProjectIcons()
}

function handleBackToList() {
  const projectToRestore = selectedProject.value || popoverProject.value
  clearSelection()
  if (projectToRestore) {
    const project = resolveMapProject(projectToRestore)
    popoverProject.value = project
    if (isAreaView.value) {
      addProjectArea(project, true)
      void renderSelectedProjectIcons(project)
    }
  }
  listExpanded.value = true
  activeEditTool.value = ''
}

function handleMapBlankClick(e) {
  if (!isAreaView.value) return
  if (isEditing.value || isActionPanelOpen.value) return
  const map = mapRef.value?.getMap?.()
  if (!map) return

  try {
    const hits = map.queryRenderedFeatures(e.point)
    if (hits.some((f) => f.properties?.projectId != null)) return
    clearSelection()
  } catch (err) {
    console.warn('[overview] handleMapBlankClick 查询失败:', err)
  }
}

// ==================== 阶段选择 ====================
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

  mapRef.value.addCentroidLabels({
    id: 'shaanxi-labels',
    geojson: shaanxiBoundary,
    labelField: 'name',
    subLabelField: 'value',
    textColor: '#FFFFFF',
    textSize: 14,
    subTextSize: 10,
    textOffset: [0, 0],
    height: PROVINCE_MAP_STYLE.defaultHeight,
    followLayer: PROVINCE_EXTRUSION_ID,
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

// ==================== 边界数据加载（WFS） ====================
let cityGeoJSONCache = null
let shaanxiBoundaryCache = null
let boundaryLoadingPromise = null
let citiesLoadingPromise = null

async function loadShaanxiBoundary() {
  if (shaanxiBoundaryCache) return shaanxiBoundaryCache
  if (!boundaryLoadingPromise) {
    boundaryLoadingPromise = loadShaanxiProvince()
      .then((data) => {
        shaanxiBoundaryCache = data
        return data
      })
      .catch((err) => {
        boundaryLoadingPromise = null
        console.error('[overview] 陕西省界加载失败:', err)
        return null
      })
  }
  return boundaryLoadingPromise
}

async function loadCityGeoJSON() {
  if (cityGeoJSONCache) return cityGeoJSONCache
  if (!citiesLoadingPromise) {
    citiesLoadingPromise = loadShaanxiCities()
      .then((data) => {
        cityGeoJSONCache = data
        return data
      })
      .catch((err) => {
        citiesLoadingPromise = null
        console.error('[overview] 陕西省市界加载失败:', err)
        return null
      })
  }
  return citiesLoadingPromise
}

async function ensureShaanxiMask() {
  if (!mapRef.value || !mapReady.value) return
  if (mapRef.value.hasMaskLayer(MASK_LAYER_ID)) { syncMaskVisibility(true); return }
  try {
    const boundary = await loadShaanxiBoundary()
    if (!boundary) return
    const data = buildMaskGeoJSON(boundary); if (!data.features.length) return
    mapRef.value.addMaskLayer({ id: MASK_LAYER_ID, geojson: data, color: MASK_COLOR, opacity: 0, fadeDuration: MASK_FADE_DURATION })
    lastMaskOpacity = -1; syncMaskVisibility(true)
  } catch (err) { console.error('[mask] 陕西省遮罩加载失败:', err) }
}

// ============================================================
// 陕西省市界线图层（替代无效的矢量切片，确保 Overview 和电网一致）
// ============================================================
const CITY_BOUNDARY_LAYER_ID = 'sx-city-boundary-line'
const CITY_BOUNDARY_SOURCE_ID = 'sx-city-boundary-src'

async function ensureCityBoundaryLine() {
  const map = mapRef.value?.getMap?.()
  if (!map) return
  if (map.getLayer(CITY_BOUNDARY_LAYER_ID)) return // 幂等

  const cities = await loadCityGeoJSON()
  if (!cities) return

  if (!map.getSource(CITY_BOUNDARY_SOURCE_ID)) {
    map.addSource(CITY_BOUNDARY_SOURCE_ID, {
      type: 'geojson',
      data: cities,
    })
  }
  if (!map.getLayer(CITY_BOUNDARY_LAYER_ID)) {
    map.addLayer({
      id: CITY_BOUNDARY_LAYER_ID,
      type: 'line',
      source: CITY_BOUNDARY_SOURCE_ID,
      layout: { visibility: 'visible' },
      paint: {
        'line-color': '#7dd3fc',
        'line-width': ['interpolate', ['linear'], ['zoom'], 4, 1, 10, 2],
        'line-opacity': 0.9,
      },
    })
  }

  if (mapRef.value?.hasMaskLayer?.(MASK_LAYER_ID)) {
    mapRef.value.bringMaskToTop(MASK_LAYER_ID)
  }
}

function onLayerToggle(item) {
  const isOn = layerVisibleIds.value.includes(item.id)
  const nextOn = !isOn

  if (isOn) {
    layerVisibleIds.value = layerVisibleIds.value.filter((id) => id !== item.id)
  } else {
    layerVisibleIds.value = [...layerVisibleIds.value, item.id]
  }

  if (item.type === 'whln') {
    whlnPlugin?.setVisibleIds?.(layerVisibleIds.value.filter((id) => WHLN_LAYER_IDS.includes(id)))
  } else if (item.type === 'project') {
    setProjectIconVisible(item.id, nextOn)
  } else if (item.type === 'terrain') {
    toggleTerrain(nextOn)
  } else if (item.type === 'custom') {
    toggleCustomLayer(item.id, nextOn)
  }
}

const provinceEventLayerId = `${PROVINCE_EXTRUSION_ID}-event`
const { isAreaView, syncByZoom, bindZoomListener, unbindZoomListener } = useZoomThresholdSwitch({
  mapRef, zoomThreshold: AREA_ZOOM_THRESHOLD,
  onAboveThreshold: () => { const map = mapRef.value?.getMap?.(); if (map?.getLayer(PROVINCE_EXTRUSION_ID)) mapRef.value.removeLayer(PROVINCE_EXTRUSION_ID) },
  onEnter: () => {
    ensureShaanxiMask()
    ensureCityBoundaryLine() // ✅ 切换视图时重新确保市界线存在
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
    renderSelectedProject(activeProject.value)
  },
  onExit: () => {
    clearOverviewRoadLayer()
    syncMaskVisibility(true)
    activeEditTool.value = ''
    rightPanelMode.value = 'list'
    popoverProject.value = null
    selectedProject.value = null
    if (isEditing.value) exitEditMode()
    isDetailFullscreen.value = false
    renderProjectsByStage('overview')
  }
})

const layerPanelOffset = computed(() => {
  if (isAreaView.value) return { left: '16px', bottom: '24px' }
  return {
    left: 'calc(clamp(12px, 1.35vw, 26px) + clamp(240px, 23vw, 410px) + 16px)',
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
const SHAANXI_BOUNDS = [[105.4, 31.6], [111.3, 39.6]]

function fitGlobeZoom(map, fill = 0.7) {
  const el = map.getContainer()
  const short = Math.min(el.clientWidth, el.clientHeight)
  if (!short) return 1.8
  const BASE_RATIO = 0.32
  const target = Math.max(0.4, Math.min(0.9, fill))
  return Math.log2(target / BASE_RATIO)
}

async function onMapReady() {
  // ✅ 边界数据守卫：先确保省界和市界就绪
  await Promise.allSettled([loadShaanxiBoundary(), loadCityGeoJSON()])

  mapReady.value = true
  renderSelectedProject(activeProject.value)

  const map = mapRef.value.getMap()

  try {
    map.setMinZoom(0)
    const zoom = fitGlobeZoom(map, 0.8)
    map.jumpTo({ center: [108.9, 35.2], zoom: 2, pitch: 0, bearing: 0 })
    mapRef.value.startAutoRotate(3)
    mapRef.value.setCentroidLabelsVisible?.(false)
  } catch (err) {
    console.warn('[map] 初始化地球视角失败:', err)
  }

  const handleEnterMap = () => {
    if (hasEntered) return
    hasEntered = true
    map.off('click', handleEnterMap)
    mapRef.value.stopAutoRotate?.()

    map.fitBounds(SHAANXI_BOUNDS, {
      padding: { top: 90, bottom: 140, left: 380, right: 340 },
      pitch: 45,
      bearing: 0,
      maxZoom: AREA_ZOOM_THRESHOLD - 0.3,
      duration: 3000,
      essential: true,
    })

    map.once('moveend', () => {
      mapRef.value.setCentroidLabelsVisible?.(true)
    })
  }
  map.on('click', handleEnterMap)

  map.on('click', handleMapBlankClick)
  bindZoomListener()

  map.on('zoom', syncMaskVisibility)
  map.on('move', syncMaskVisibility)
  map.on('style.load', ensureShaanxiMask)
  await ensureShaanxiMask()
  await ensureCityBoundaryLine() // ✅ 初次挂载时加载市界线
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

onMounted(async () => {
  // 提前预取边界，和业务请求并行
  void loadShaanxiBoundary()
  void loadCityGeoJSON()
  await Promise.all([fetchStageList(), fetchProjectList(), fetchMapProjects()])
})

onUnmounted(() => {
  try { mapRef.value?.stopAutoRotate?.() } catch (e) { /* 忽略 */ }
  unbindZoomListener()
  removeRoadLineLayers()
  whlnPlugin?.destroy?.()
  whlnPlugin = null
  const map = mapRef.value?.getMap?.()
  if (map) {
    map.off('click', handleMapBlankClick)
    map.off('zoom', syncMaskVisibility)
    map.off('move', syncMaskVisibility)
    map.off('style.load', ensureShaanxiMask)
  }
})
</script>

<style scoped>
.dashboard-page {
  position: relative;
  width: 100%;
  height: 100%;  
  min-height: 0;
  overflow: hidden;
  background: #03162e;
}

.dashboard-page::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 3;
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

.area-summary {
  position: absolute;
  z-index: 20;
  top: 60px;
  left: 12px;
  width: clamp(240px, 23vw, 320px);
  height: calc((85vh - 70px) * 0.3685 + 20px);
  padding-top: 20px;
  box-sizing: border-box;
}
.area-summary :deep(.dashboard-panel) {
  display: flex;
  flex-direction: column;
  margin-top: 0;
  height: 100%;
  min-height: 0;
}
.area-summary.wizard-layer {
  width: auto;
  height: auto;
  padding-top: 0;
}

.area-view-layer { position: absolute; z-index: 20; top: 60px; right: 12px; bottom: 10px; display: flex; flex-direction: column; align-items: flex-end; gap: 10px; overflow: visible; }
.panel-below { flex: 1; min-height: 0; }
.create-project-fullpage {
  position: absolute;
  z-index: 40;
  inset: 0;
  display: flex;
  justify-content: flex-end;
  pointer-events: none;
}
.create-project-fullpage :deep(.create-project-form) { pointer-events: auto; }

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

.right-top-card {
  position: absolute;
  z-index: 25;
  top: 60px;
  right: 12px;
  width: min(375px, calc(100vw - 24px));
  height: 192px;
  box-sizing: border-box;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.78) 0%, rgba(235, 247, 255, 0.7) 100%);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.16);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.right-top-card .tooltip-header {
  display: flex;
  flex: 0 0 66px;
  box-sizing: border-box;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(222, 225, 228, 0.72);
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
}
.right-top-card .tooltip-status { display: flex; align-items: center; gap: 6px; flex: 0 0 auto; font-size: 12px; white-space: nowrap; }
.right-top-card .status-dot { width: 8px; height: 8px; border-radius: 50%; box-shadow: 0 0 0 3px rgba(146, 84, 222, 0.14); }
.right-top-card .tooltip-title {
  display: block;
  min-width: 0;
  padding: 0;
  color: #172033;
  font-size: 16px;
  font-weight: 700;
  line-height: 22px;
  text-align: left;
  background: transparent;
  border: 0;
  cursor: pointer;
}
.right-top-card .tooltip-title:hover { color: #1677ff; }
.right-top-card .tooltip-grid {
  display: grid;
  flex: 0 0 76px;
  height: 76px;
  grid-template-columns: 1fr 1fr;
}
.right-top-card .grid-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  gap: 6px;
  height: 38px;
  min-height: 38px;
  padding: 3px 12px;
  background: rgba(255, 255, 255, 0.24);
}
.right-top-card .border-right { border-right: 1px solid rgba(255, 255, 255, 0.6); }
.right-top-card .border-bottom { border-bottom: 1px solid rgba(255, 255, 255, 0.6); }
.right-top-card .grid-label { flex: 0 0 auto; margin: 0; color: #6B7280; font-size: 12px; }
.right-top-card .grid-value { min-width: 0; color: #111827; font-size: 14px; font-weight: 700; text-align: right; }
.right-top-card .unit { font-size: 12px; font-weight: 400; color: #6B7280; margin-left: 2px; }
.right-top-card .text-blue { color: #2563EB; }
.right-top-card .text-red { color: #DC2626; }
.right-top-card .bold { font-weight: 800; }
.right-top-card .sub-text { font-size: 11px; color: #6B7280; font-weight: 400; margin-left: 2px; }
.right-top-card .tooltip-footer {
  display: flex;
  flex: 0 0 48px;
  box-sizing: border-box;
  align-items: center;
  gap: 4px;
  min-height: 48px;
  padding: 6px 12px;
  transition: background 0.2s;
}
.right-top-card .footer-action {
  flex: 1 1 0;
  min-width: 0;
  padding: 6px 4px;
  color: #172033;
  font-size: 12px;
  white-space: nowrap;
  background: transparent;
  border: 0;
  border-radius: 5px;
  cursor: pointer;
}
.right-top-card .footer-action:hover { color: #1677ff; }
.right-top-card .footer-action.danger {
  flex: 0 0 auto;
  padding: 6px 10px;
  color: #e5484d;
  background: transparent;
  border: 0;
}
.right-top-card .footer-action.danger:hover {
  color: #d9363e;
  background: transparent;
}
.action-menu-wrap { position: relative; flex: 0 0 auto; margin-left: 4px; }
.action-menu-button {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  color: #101828;
  font-size: 16px;
  background: rgba(255, 255, 255, 0.24);
  border: 0;
  border-radius: 6px;
  cursor: pointer;
}
.action-menu-button:hover { background: rgba(255, 255, 255, 0.6); }
.action-menu {
  position: absolute;
  z-index: 35;
  right: 0;
  bottom: calc(100% + 8px);
  display: flex;
  flex-direction: column;
  min-width: 170px;
  padding: 6px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.18);
}
.action-menu button {
  padding: 9px 10px;
  color: #273443;
  text-align: left;
  background: transparent;
  border: 0;
  border-radius: 5px;
  cursor: pointer;
}
.action-menu button.danger { color: #d9363e; }
.action-menu button:hover { color: #1677ff; background: #eff6ff; }

.geometry-edit-toolbar {
  position: absolute;
  z-index: 30;
  top: 6px;
  right: 12px;
  left: auto;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  width: max-content;
  max-width: calc(100vw - 24px);
  padding: 5px 6px;
  background: linear-gradient(149.65deg, rgba(255, 255, 255, 0.2) 4.61%, rgba(255, 255, 255, 0.15) 29.07%, rgba(255, 255, 255, 0.15) 49.01%, rgba(255, 255, 255, 0.1) 61.4%, rgba(255, 255, 255, 0.2) 74.74%, rgba(255, 255, 255, 0.22) 97.19%);
  border: 1px solid rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(4px);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.12);
}
.geometry-edit-title { padding: 0 8px; color: #273443; font-size: 13px; font-weight: 700; }
.edit-tool-button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 32px;
  padding: 0 10px;
  color: #344054;
  font-size: 12px;
  white-space: nowrap;
  background: rgba(239, 239, 239, 0.76);
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
}
.edit-tool-button:hover, .edit-tool-button.active { color: #2563eb; border-color: #0278e7; background: #efefef; }
.edit-tool-button:disabled { opacity: 0.55; cursor: not-allowed; }
.edit-tool-button.danger {
  color: #e5484d;
  background: rgba(239, 239, 239, 0.76);
  border-color: transparent;
}
.edit-tool-button.danger:hover {
  color: #d9363e;
  background: #fef2f2;
  border-color: #e5484d;
}
.edit-tool-button.save { color: #fff; background: #1677ff; border-color: #1677ff; }
.edit-tool-button.recalculate { color: #087443; border-color: #6ce9a6; background: #ecfdf3; }
.edit-divider { width: 1px; height: 24px; background: #d0d5dd; }

.map-line-tip {
  position: absolute;
  z-index: 26;
  padding: 4px 8px;
  color: #fff;
  font-size: 12px;
  line-height: 1.4;
  white-space: nowrap;
  pointer-events: none;
  background: rgba(17, 24, 39, 0.9);
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  transform: translate(12px, 12px);
}

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
.layer-legend-line {
  display: inline-block;
  width: 18px;
  height: 3px;
  border-radius: 2px;
}
.layer-legend-line.road { background: #2563eb; }
.layer-legend-line.line { background: #eab308; }

@media (max-width: 760px) {
  .right-top-card {
    top: 56px;
    right: 8px;
    width: min(375px, calc(100vw - 24px));
  }
  .right-top-card .tooltip-header { padding: 8px 10px; }
  .right-top-card .tooltip-title { font-size: 14px; }
  .right-top-card .tooltip-grid .grid-item { padding: 3px 8px; }
  .right-top-card .grid-value { font-size: 13px; }
  .right-top-card .tooltip-footer { gap: 2px; padding: 6px 8px; }
  .right-top-card .footer-action { font-size: 11px; }
  .right-top-card .footer-action.danger { padding: 6px 8px; }
  .action-menu-button { width: 28px; height: 28px; }
  .geometry-edit-toolbar { top: 6px; right: 8px; left: auto; max-width: calc(100vw - 16px); gap: 4px; padding: 5px; }
  .edit-tool-button { gap: 3px; padding: 0 7px; font-size: 11px; }
}
</style>