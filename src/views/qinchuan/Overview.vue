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
        :title="wizardTitleLabel"
        :max-step="wizardMaxStep"
        :project-name="(wizardProject || activeProjectDetail)?.name || (wizardProject || activeProjectDetail)?.projectName || ''"
        :project="wizardProject || activeProjectDetail"
        @close="wizardVisible = false"
        @save-draft="handleWizardSaveDraft"
        @submit="handleWizardSubmit"
      />

      <RightDashboard class="right-layer" />
    </template>

    <template v-else>
      <!-- ★ 创建项目期间，隐藏区域视图所有面板 -->
      <template v-if="!showCreateProject">
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
            :title="wizardTitleLabel"
            :max-step="wizardMaxStep"
            :project-name="(wizardProject || activeProjectDetail)?.name || (wizardProject || activeProjectDetail)?.projectName || ''"
            :project="wizardProject || activeProjectDetail"
            @close="wizardVisible = false"
            @save-draft="handleWizardSaveDraft"
            @submit="handleWizardSubmit"
          />

          <div class="area-view-layer" v-show="!popoverProject && !isEditing && !isActionPanelOpen">
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
                :stage="activeProjectDetail?.projectStage || activeProjectDetail?.stage || ''"
                :initial-tab="detailPanelTab"
                :initial-report-sub-tab="generatedReportSubTab"
                :refresh-key="detailRefreshKey"
                @toggle-fullscreen="isDetailFullscreen = !isDetailFullscreen"
                @back="handleBackToList"
                @generate-report="reportModalVisible = true"
                @action="onDetailPanelAction"
                @open-confirm="handleOpenConfirm"
                @create-report="dispatchCreateReport"
              />
            </template>
          </div>

          <!-- ★ 点击选中：右上角固定卡片 -->
          <ProjectActionCard
            v-if="popoverProject && !isDetailFullscreen && !selectedProject && !isEditing && !isActionPanelOpen"
            :project="popoverProject"
            :stage-map="stageMap"
            :actions="popoverActions"
            @open-detail="handleOpenDetailPanel"
            @action="executeProjectAction"
          />

          <!-- ★ hover：首次进入位置固定弹窗 -->
          <ProjectActionCard
            v-if="hoveredProject && isAreaView && viewMode === 'map' && !popoverProject && !selectedProject && !isEditing && !isActionPanelOpen && !isDetailFullscreen"
            :project="hoveredProject"
            hover-mode
            :position="hoveredPos"
            :stage-map="stageMap"
            :actions="popoverActions"
            @open-detail="handleOpenDetailPanel"
            @action="executeProjectAction"
            @mouseenter="onHoverCardEnter"
            @mouseleave="onHoverCardLeave"
          />

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
              <template #default="{ row }">
                <span
                  class="project-name-link"
                  :title="row.projectName"
                  @click="handleOpenDetailPanel(row)"
                >
                  {{ row.projectName || '-' }}
                </span>
              </template>
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

      <!-- ★ 新增：创建项目全屏层（与 sitemap 一致） -->
      <section v-if="showCreateProject" class="create-project-fullpage">
        <div class="cp-map-overlay">
          <div class="cp-search-box">
            <el-input
              v-model="placeSearchKeyword"
              placeholder="请输入行政区划地名"
              size="small"
              @keyup.enter="handlePlaceSearch"
            >
              <template #suffix>
                <el-icon class="cp-search-icon" @click="handlePlaceSearch"><ArrowRight /></el-icon>
              </template>
            </el-input>
          </div>
          <div class="cp-draw-actions">
            <el-button size="small" @click="startCreateDrawing">开始绘制</el-button>
            <el-button size="small" @click="saveCreateDrawing">保存</el-button>
            <el-button size="small" @click="clearCreateDrawing">清空</el-button>
          </div>
        </div>
        <CreateProjectForm
          ref="createProjectFormRef"
          :map-ref="mapRef"
          :panel-width="550"
          @cancel="closeCreateProject"
          @saved="onProjectCreated"
        />
      </section>
    </template>

    <ProjectWorkflowDialogs
      :visibility="{ verify: showVerifyPanel, assign: showAssignDialog, reserve: showReserveDialog, addReport: showAddReportPanel, confirm: showConfirmPanel }"
      :verify-project="actionProject"
      :assign-project="actionProject"
      :reserve-project="actionProject"
      :report-project="activeProjectDetail"
      :report-type="addReportType"
      :report-id="confirmReportId"
      :verify-mounted="true"
      @close-verify="showVerifyPanel = false"
      @verify-saved="onVerifySaved"
      @update:assign="showAssignDialog = $event"
      @assign-success="onAssignSuccess"
      @update:reserve="showReserveDialog = $event"
      @reserve-saved="onReserveSaved"
      @close-add-report="showAddReportPanel = false; addReportType = ''"
      @report-success="handleReportPanelSuccess"
      @close-confirm="showConfirmPanel = false"
      @confirm-success="handleConfirmSuccess"
    />

    <ReportGenerateModal
      :visible="reportModalVisible"
      :project="activeProjectDetail"
      @close="reportModalVisible = false"
      @confirm="handleReportConfirm"
      @add-report="reportModalVisible = false"
      @generate-competitive="handleOpenCompetitivePanel"
      @open-add-report="handleOpenAddReport"
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

    

    <!-- 修复头部按钮绑定 -->
    <SiteMapProjectDetailPanel
      :visible="showSiteMapDetailPanel"
      :project="actionProject"
      :stage="actionProject?.projectStage || ''"
      :initial-tab="detailPanelTab"
      :refresh-key="detailRefreshKey"
      @close="showSiteMapDetailPanel = false"
      @action="onSiteMapDetailAction"
      @generate-report="handleGenerateReportFromHeader"
      @open-confirm="handleOpenConfirm"
    />

    <SiteMapGenerateReportPanel
      :visible="showGeneratePanel"
      :project="generatePanelProject"
      :ai-detail="activeProjectDetail"
      :action-key="generatePanelActionKey"
      :sub-code="generatePanelSubCode"
      :source="generatePanelSource"
      :first-business-title="generatePanelFirstBusinessTitle"
      :secondary-business-title="generatePanelSecondaryBusinessTitle"
      :file-type-tag="generatePanelFileTypeTag"
      @close="handleGeneratePanelClose"
      @generated="onReportGenerated"
    />
    
    

    
  </main>
</template>

<script setup>
import { ensureOuterCCW, ensureHoleCW, smoothstep } from './js/mapGeometry'
import { getProjectCoords, getProjectCentroid, buildWindFC, buildBoosterFC } from './js/projectGeoUtils'
import { unwrapRoadResponse, buildRoadLineFeatures } from './js/roadGeoUtils'
import { useProjectHover } from './js/useProjectHover'

import ProjectWorkflowDialogs from './components/ProjectWorkflowDialogs.vue'
import { useReportPanelController } from './js/useReportPanelController'
import { useProjectContext } from './js/useProjectContext'
import {
  ref, computed, reactive, watch, onMounted, onUnmounted, nextTick
} from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { List, MapLocation, Plus, Search, Location, CircleCheck, CircleClose } from '@element-plus/icons-vue'
import { searchPlaceName } from './js/useTiandituGeocode'
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
import SiteMapProjectDetailPanel from './components/ProjectDetailPanel.vue'
import SiteMapGenerateReportPanel from './components/GenerateReportPanel.vue'
import ReportWizard from './components/report-wizard/ReportWizard.vue'
import { PACKAGE_TYPE } from './js/Reportwizardmockdata'
import { projectOverviewRows } from './js/dashboardMcokData'
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
import ProjectActionCard from './components/area-panel/ProjectActionCard.vue'

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
    else if (desc.includes('立项') || desc.includes('可研') || desc.includes('投决')) group = 'planning'
    else if (desc.includes('施工')) group = 'construction'
    else if (desc.includes('运营') || desc.includes('投产')) group = 'operating'
  }
  return GROUP_AREA_STYLE[group || 'unknown']
}

const STAGE_ACTIONS = {
  PRELIMINARY_SELECTION: ['assign', 'verify', 'reserve', 'edit', 'delete'],
  PROJECT_RESERVE:       ['material', 'edit', 'assign', 'delete'],
  PROJECT_INITIATION:    ['establishMeeting', 'edit', 'assign', 'delete'],
  FEASIBILITY_REVIEW:    ['researchMaterial', 'researchReview', 'investMaterial', 'edit', 'assign', 'delete'],
  INVESTMENT_DECISION:   ['investMeeting', 'edit', 'assign', 'delete'],
}
const ACTION_LABELS = {
  material: '立项准备',
  researchMaterial: '可研材料',
  investMaterial: '投决准备',
  establishMeeting: '立项上会',
  researchReview: '可研审查',
  investMeeting: '投决上会',
  assign: '分配',
  verify: '核查',
  reserve: '储备',
  edit: '编辑',
  delete: '删除'
}

const mapRef = ref(null)
// ============================================================
// ★ 低层级底图：跟随 sx-base-imagery-layer 的可见性
//   (whln 插件接管 sx-base-imagery-layer 的显隐，我们不介入)
//   - sx-base-imagery-layer 在 → 低层级底图在
//   - sx-base-imagery-layer 关 → 低层级底图跟着关
// ============================================================
const BASE_IMAGERY_LAYER_ID = 'sx-base-imagery-layer'
const LOW_BASE_LAYER_ID = 'sx-world-preview-layer'
// 加
const detailRefreshKey = ref(0)
const generatedReportSubTab = ref('')
const pendingGeneratedReport = ref(null)

// 只有这六类报告属于“项目报告”列表；其他函件生成成功后不切换到项目报告页。
const PROJECT_REPORT_TYPE_KEYS = new Set([
  'PROJECT_PROPOSAL',
  'WIND_RESOURCE_ASSESSMENT',
  'FEASIBILITY_STUDY',
  'PROJECT_INITIATION',
  'COMPETITIVE_ALLOCATION',
  'POST_EVALUATION',
])

function onReportGenerated(payload = {}) {
  const reportType = String(payload.reportType || '').trim()
  if (!PROJECT_REPORT_TYPE_KEYS.has(reportType)) {
    pendingGeneratedReport.value = null
    return
  }

  pendingGeneratedReport.value = {
    project: payload.project || generatePanelProject.value || activeProjectDetail.value,
    reportType,
  }

  // 生成成功即自动关闭生成面板并切换到对应报告分类，不再要求用户手动关闭。
  handleGeneratePanelClose()
}

function handleGeneratePanelClose() {
  showGeneratePanel.value = false
  const pending = pendingGeneratedReport.value
  if (!pending) return

  pendingGeneratedReport.value = null
  const project = pending.project
  if (project) {
    const resolvedProject = resolveMapProject(project)
    selectedProject.value = resolvedProject
    actionProject.value = resolvedProject
    activeProjectDetail.value = { ...(activeProjectDetail.value || {}), ...resolvedProject }
  }

  generatedReportSubTab.value = pending.reportType
  detailPanelTab.value = 'report'
  // 阶段面板中的报告/函件生成完成后，切换到通用项目详情面板的项目报告列表。
  actionProject.value = project || activeProjectDetail.value
  showSiteMapDetailPanel.value = true
  isDetailFullscreen.value = false
  nextTick(() => { detailRefreshKey.value++ })
}
function syncLowLevelBase() {
  const map = mapRef.value?.getMap?.()
  if (!map) return
  if (!map.getLayer(BASE_IMAGERY_LAYER_ID) || !map.getLayer(LOW_BASE_LAYER_ID)) return

  // MapLibre: 未显式设置 layout 时 getLayoutProperty 返回 undefined，按 visible 处理
  const baseVisible =
    map.getLayoutProperty(BASE_IMAGERY_LAYER_ID, 'visibility') !== 'none'
  const target = baseVisible ? 'visible' : 'none'

  const current =
    map.getLayoutProperty(LOW_BASE_LAYER_ID, 'visibility') ?? 'visible'
  if (current === target) return    // ★ short-circuit，避免 styledata 递归触发

  map.setLayoutProperty(LOW_BASE_LAYER_ID, 'visibility', target)
}
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
const addReportType = ref('')
const detailLoading = ref(false)
const detailPanelTab = ref('main')

const projectContext = useProjectContext()
const {
  focusedProject: popoverProject,
  selectedProject,
  actionProject,
  geometryProject
} = projectContext

const hoveredProject = ref(null)
const hoveredPos = reactive({ x: 0, y: 0 })

const { clearHoverHideTimer, clearHoverState, scheduleHoverHide, onHoverCardEnter, onHoverCardLeave } = useProjectHover(hoveredProject)

const reportPanels = useReportPanelController(PACKAGE_TYPE)
const {
  showGeneratePanel, generatePanelProject, generatePanelActionKey, generatePanelSubCode,
  generatePanelSource, generatePanelFirstBusinessTitle, generatePanelSecondaryBusinessTitle,
  generatePanelFileTypeTag, showAddReportPanel, showConfirmPanel, confirmReportId,
  wizardVisible, wizardProject, wizardMode, wizardTitleLabel, wizardMaxStep, wizardReportSubTab,
} = reportPanels

const popoverActions = computed(() => {
  const actions = STAGE_ACTIONS[popoverProject.value?.projectStage] || STAGE_ACTIONS.PRELIMINARY_SELECTION
  const displayOrder = ['material', 'establishMeeting', 'researchMaterial', 'researchReview', 'investMaterial', 'investMeeting', 'edit', 'reserve', 'verify', 'assign']
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

const actionMenuOpen = ref(false)
const showVerifyPanel = ref(false)
const showSiteMapDetailPanel = ref(false)
const showAssignDialog = ref(false)
const showReserveDialog = ref(false)
const showEditProject = ref(false)
const editProjectTarget = ref(null)
const editProjectFormRef = ref(null)
const refreshingActionProject = ref(false)
const deleteConfirmOpen = ref(false)
const showCreateProject = ref(false)
const createProjectFormRef = ref(null)
const placeSearchKeyword = ref('')
const isActionPanelOpen = computed(() => (
  showEditProject.value ||
  showCreateProject.value ||   // ★ 新增：创建项目期间也视为面板打开
  showVerifyPanel.value ||
  showSiteMapDetailPanel.value ||
  showGeneratePanel.value ||
  showAssignDialog.value ||
  showReserveDialog.value ||
  reportModalVisible.value ||
  refreshingActionProject.value ||
  deleteConfirmOpen.value ||
  wizardVisible.value ||
  showAddReportPanel.value ||
  showConfirmPanel.value
))

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

const reportKeyToWizardMode = {
  'feasibility-centralized': PACKAGE_TYPE.default,
  'feasibility-distributed': PACKAGE_TYPE.distributedDefault,
  'feasibility-base': PACKAGE_TYPE.baseDefault,
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

function handleOpenAddReport(payload = {}) {
  reportModalVisible.value = false
  addReportType.value = ''
  if (payload.project) activeProjectDetail.value = { ...(activeProjectDetail.value || {}), ...payload.project }
  generatedReportSubTab.value = payload.subTab || 'FEASIBILITY_STUDY'
  detailPanelTab.value = 'report'
  const targetProject = payload.project || activeProjectDetail.value
  if (targetProject) {
    actionProject.value = targetProject
    selectedProject.value = resolveMapProject(targetProject)
  }
  // 从阶段面板进入时，先打开通用项目详情面板并定位到项目报告列表。
  showSiteMapDetailPanel.value = true
  isDetailFullscreen.value = false
  reportPanels.openAddReport()
  nextTick(() => { detailRefreshKey.value++ })
}

function handleOpenCompetitivePanel(project) {
  reportModalVisible.value = false
  reportPanels.openCompetitivePanel(project, activeProjectDetail.value)
}

function dispatchCreateReport(payload) {
  return reportPanels.dispatchCreateReport(payload, activeProjectDetail.value, () => {
    isDetailFullscreen.value = false
  })
}

function handleReportPanelSuccess() {
  fetchMapProjects()
  fetchProjectList()
  detailRefreshKey.value++
}

function handleOpenConfirm(reportId) { reportPanels.openConfirm(reportId) }

function handleConfirmSuccess() {
  fetchMapProjects()
  fetchProjectList()
  if (activeProjectDetail.value?.id) {
    loadAiProjectDetail(activeProjectDetail.value.id)
  }
}

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
// 列表模式点击项目名称：切回地图模式并定位到该项目
// 复用 handleProjectSelect，和 ProjectListPanel 的 @select 行为完全一致
function handleLocateProject(row) {
  if (!row) return
  const p = resolveMapProject(row)   // 优先用 mapProjects 里的完整数据（含 coordinate / 风机点等）
  viewMode.value = 'map'
  nextTick(() => {
    handleProjectSelect(p)
  })
}
function handleProjectSelect(item) {
  const popoverId = popoverProject.value?.id
  const selectedId = selectedProject.value?.id
  if (
    (popoverId != null && String(popoverId) === String(item.id)) ||
    (selectedId != null && String(selectedId) === String(item.id))
  ) return

  clearHoverState()

  const prevProject = popoverProject.value
  if (prevProject && String(prevProject.id) !== String(item.id) && isAreaView.value) {
    addProjectArea(prevProject, false)
  }

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

// ★★★ 关键修复：先走完整选中流程，再打开详情
async function handleOpenDetailPanel(item) {
  if (!item) return
  actionMenuOpen.value = false

  // 从列表模式进入详情时，先切回地图模式，避免全屏列表继续覆盖地图。
  viewMode.value = 'map'
  listExpanded.value = false
  isActionPanelOpen.value = false

  const p = resolveMapProject(item)

  // ★ 走完整"选中场区"流程：flyTo + 高亮场区 + 渲染风机/升压站 + 加载道路
  //   handleProjectSelect 内部有同 id return 保护，从固定卡片点标题时不会重复 flyTo
  handleProjectSelect(p)

  // ★ 清 popoverProject 让 area-view-layer 的 v-show 生效（详情面板显示）
  popoverProject.value = null

  selectedProject.value = p
  activeAreaId.value = p.id
  activeProjectDetail.value = buildDetailFromListItem(p)
  rightPanelMode.value = 'detail'
  isDetailFullscreen.value = true

  await loadAiProjectDetail(p.id)
}

function resolveMapProject(project) {
  return mapProjects.value.find((item) => String(item.id) === String(project?.id)) || project
}

async function openSiteMapDetailPanel(project, tab = 'main') {
  if (!project) return
  clearHoverState()
  actionMenuOpen.value = false

  const p = resolveMapProject(project)

  // ① 先走完整"选中场区"流程：flyTo + 高亮场区 + 渲染风机/升压站 + 加载道路
  //    handleProjectSelect 内部有同 id 短路保护，重复点不会重复 flyTo
  handleProjectSelect(p)

  // ② 同步选中态，保证组件内部拿到的 project 与地图选中一致
  selectedProject.value = p
  activeAreaId.value = p.id
  rightPanelMode.value = 'detail'
  isDetailFullscreen.value = false

  // ③ 设置面板数据
  actionProject.value = p
  detailPanelTab.value = tab
  showSiteMapDetailPanel.value = true
}

function executeProjectAction(action, project) {
  if (!project) return
  clearHoverState()
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
    if (String(hoveredProject.value?.id) === String(project.id)) clearHoverState()
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
    projectContext.syncProject(fresh)
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
    reportPanels.openGeneratePanel({
      project: payload.project || actionProject.value,
      actionKey: payload.actionKey,
      subCode: payload.subCode,
      source: 'sitemap-detail',
      firstBusinessTitle: payload.firstBusinessTitle,
      secondaryBusinessTitle: payload.secondaryBusinessTitle,
      fileTypeTag: payload.fileTypeTag,
    })
    return
  }

  if (payload?.type === 'create-report') {
    dispatchCreateReport(payload)
    showSiteMapDetailPanel.value = false
    return
  }
  if (payload?.type === 'generate-feasibility-report') {
    reportPanels.openWizard('FEASIBILITY_STUDY', payload.project || actionProject.value || activeProjectDetail.value, {
      packageType: 'default', title: '一键生成集中式可行性研究报告', maxStep: 2,
    })
    return
  }
  if (payload?.type === 'upload-feasibility-report') {
    const project = payload.project || actionProject.value || activeProjectDetail.value
    if (project) { activeProjectDetail.value = { ...(activeProjectDetail.value || {}), ...project }; actionProject.value = project }
    addReportType.value = 'FEASIBILITY_STUDY'
    reportPanels.openAddReport()
    return
  }
}
async function onDetailPanelAction(payload) {
  if (!payload?.type) return

  // ============ 阶段推进：刷新数据并关闭全屏详情 ============
  if (payload.type === 'stage-changed') {
    isDetailFullscreen.value = false
    await refreshActionProjectData()
    return
  }

  // ============ 会议 tab 里点「生成 XXX 报告」 ============
  if (payload.type === 'generate-report') {
    reportPanels.openGeneratePanel({
      project: payload.project || activeProjectDetail.value,
      actionKey: payload.actionKey,
      subCode: payload.subCode,
      source: 'sitemap-detail',
      firstBusinessTitle: payload.firstBusinessTitle,
      secondaryBusinessTitle: payload.secondaryBusinessTitle,
      fileTypeTag: payload.fileTypeTag,
    })
    return
  }

  // ============ 报告列表 tab 里点「创建 XXX」 ============
  if (payload.type === 'create-report') {
    dispatchCreateReport(payload)
    return
  }
  if (payload.type === 'generate-feasibility-report') {
    reportPanels.openWizard('FEASIBILITY_STUDY', payload.project || activeProjectDetail.value, {
      packageType: 'default', title: '一键生成集中式可行性研究报告', maxStep: 2,
    })
    return
  }
  if (payload.type === 'upload-feasibility-report') {
    if (payload.project) activeProjectDetail.value = { ...(activeProjectDetail.value || {}), ...payload.project }
    addReportType.value = 'FEASIBILITY_STUDY'
    reportPanels.openAddReport()
    return
  }

  // ============ 智能审查：暂未接，先记录 ============
  if (payload.type === 'intelligent-review') {
    console.warn('[overview] intelligent-review 尚未处理', payload)
    return
  }

  // ============ 其他（meeting / set-owner 等）：保持静默 ============
}
// 1. 修复头部按钮（必须加 .value，否则 ref 被覆盖，真实数据永远进不来）
function handleGenerateReportFromHeader(proj) {
  if (proj) activeProjectDetail.value = proj
  reportModalVisible.value = true
}


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
  clearHoverState()
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
    projectContext.syncProject(geometryProject.value)
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

async function fetchStageList() {
  try {
    const res = await newApi.getStageList()
    stageOptions.value = res?.data ?? []
  } catch (err) { stageOptions.value = [] }
}

async function fetchProjectList() {
  listLoading.value = true
  try {
    const params = { pageNo: pagination.page, pageSize: pagination.pageSize}
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
watch(viewMode, (val) => {
  if (val === 'list' && showLayerPanel.value) showLayerPanel.value = false
  if (val === 'list') clearHoverState()
})

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

function openCreateProject() {
  if (isEditing.value && isDirty.value) {
    ElMessage.warning('请先保存或取消地图上的修改')
    return
  }
  // 关掉当前的项目卡片 / 选中态，避免创建表单关闭后残留
  clearHoverState()
  popoverProject.value = null
  selectedProject.value = null
  isDetailFullscreen.value = false
  showCreateProject.value = true
  if (mapReady.value) nextTick(() => startCreateDrawing())
}

function closeCreateProject() {
  showCreateProject.value = false
  placeSearchKeyword.value = ''
}

function startCreateDrawing() {
  createProjectFormRef.value?.startPolygonDrawing?.()
}
function saveCreateDrawing() {
  createProjectFormRef.value?.handleMapDrawSave?.()
}
function clearCreateDrawing() {
  createProjectFormRef.value?.handleMapDrawClear?.()
}

async function onProjectCreated() {
  showCreateProject.value = false
  placeSearchKeyword.value = ''
  // ★ overview 特有：省级容量色阶是缓存的，创建后必须清掉，否则新项目容量不反映到省界上
  stageCityCapacityCache.value = {}
  await Promise.all([fetchMapProjects(), fetchProjectList()])
  if (mapReady.value && !isAreaView.value) {
    renderSelectedProject(activeProject.value || null)
  }
}

async function handlePlaceSearch() {
  const kw = placeSearchKeyword.value.trim()
  if (!kw) return
  try {
    const { lng, lat } = await searchPlaceName(kw)
    mapRef.value?.getMap?.()?.flyTo({ center: [lng, lat], zoom: 11, duration: 1500 })
  } catch (err) {
    ElMessage.warning(err?.message || '未找到匹配的地名')
  }
}

// 保留原有入口名，模板里 @add / @click 不用改
function handleAddProject() {
  openCreateProject()
}

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
     console.log('[getAiProjectData]', JSON.stringify(res.data, null, 2))  // ★ 加这行
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

const mapProjects = ref([])
const renderedMapLayerIds = new Set()

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
    if (props.lineTypeText) parts.push(props.lineTypeText)
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

    const data = unwrapRoadResponse(res)
    const { roadFeatures, lineFeatures } = buildRoadLineFeatures(data, { includeLegacyLoopFallback: true })
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

function addProjectArea(project, highlighted = false) {
  const area = buildAreaFeature(project)
  if (!area) return
  const layerId = `overview-project-area-${project.id}`
  const base = getAreaStyleByStage(project.projectStage)

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

  mapRef.value.offHover?.(fillLayerId)
  mapRef.value.onHover?.(fillLayerId, {
    onEnter: (_, e) => {
      if (isEditing.value || isActionPanelOpen.value) return
      if (String(popoverProject.value?.id ?? '') === String(project.id)) return
      if (String(selectedProject.value?.id ?? '') === String(project.id)) return
      clearHoverHideTimer()
      hoveredProject.value = project
      hoveredPos.x = e.point.x
      hoveredPos.y = e.point.y
    },
    onMove: () => {},
    onLeave: () => {
      if (hoveredProject.value && String(hoveredProject.value.id) === String(project.id)) {
        scheduleHoverHide()
      }
    },
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
  clearHoverState()
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

// ★★★ 关键修复：点场区外可以取消选中
function handleMapBlankClick(e) {
  // 编辑态 / 各类面板打开时，点地图空白不做取消处理（避免误关）
  if (isEditing.value || isActionPanelOpen.value) return

  // 没有任何选中 / 详情状态时，点空白直接返回
  if (!popoverProject.value && !selectedProject.value && !isDetailFullscreen.value) return

  const map = mapRef.value?.getMap?.()
  if (!map) return

  try {
    // ★ 只在场区多边形（-fill 层）上判定是否点在场区内，
    //   避免风机/升压站/场区中心图标命中导致无法取消
    const projectFillLayerIds = []
    for (const p of mapProjects.value) {
      const id = `overview-project-area-${p.id}-fill`
      if (map.getLayer(id)) projectFillLayerIds.push(id)
    }
    const hits = projectFillLayerIds.length
      ? map.queryRenderedFeatures(e.point, { layers: projectFillLayerIds })
      : []
    if (hits.length > 0) return

    // 编辑态：只收掉临时绘制/框选状态，不关闭选中
    if (editMode.value !== null) {
      if (drawingNewPoint.value) {
        mapRef.value?.getDraw?.()?.changeMode('simple_select')
        drawingNewPoint.value = false
      }
      if (isBoxSelecting.value) {
        mapRef.value?.stopBoxSelect?.()
        isBoxSelecting.value = false
      }
      return
    }

    // ★ 点空白：不管详情面板是否打开，都清掉选中并关闭详情
    //   clearSelection 内部会把 isDetailFullscreen 置 false
    clearSelection()
  } catch (err) {
    console.warn('[overview] handleMapBlankClick 查询失败:', err)
  }
}

// ==================================================================
// ★ 省级大屏：按城市容量渲染色阶 + 数值 label
// ==================================================================

const stageCityCapacityCache = ref({})
let provinceRenderVersion = 0

function normalizeCityName(name) {
  return String(name || '').replace(/(市|地区|自治州|盟)$/, '').trim()
}

async function fetchStageCityCapacity(stageCode) {
  if (stageCityCapacityCache.value[stageCode] !== undefined) {
    return stageCityCapacityCache.value[stageCode]
  }
  try {
    const res = await configApi.provinceViewData({
      provinceCode: '610000',
      projectStage: stageCode,
    })
    console.log(`[overview] provinceViewData(${stageCode}) raw:`, res)

    const list = Array.isArray(res?.data)
      ? res.data
      : (res?.data?.list || res?.data?.records || [])

    const map = {}
    for (const item of list) {
      const rawName = item.regionName || item.cityName || item.areaName
                    || item.name || item.region || ''
      const v = Number(
        item.totalCapacity ?? item.capacity ?? item.total_capacity ?? 0
      )
      if (!rawName) continue
      const key = normalizeCityName(rawName)
      map[key] = (map[key] || 0) + v
    }
    console.log(`[overview] stage ${stageCode} 处理后 map:`, map)
    stageCityCapacityCache.value[stageCode] = map
    return map
  } catch (err) {
    console.warn(`[overview] provinceViewData(${stageCode}) 失败:`, err)
    return {}
  }
}

function hexToHsl(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '')
  if (!m) return { h: 210, s: 80, l: 55 }
  const int = parseInt(m[1], 16)
  const r = ((int >> 16) & 255) / 255
  const g = ((int >> 8) & 255) / 255
  const b = (int & 255) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0, s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
    else if (max === g) h = ((b - r) / d + 2) / 6
    else h = ((r - g) / d + 4) / 6
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360
  s = Math.max(0, Math.min(100, s)) / 100
  l = Math.max(0, Math.min(100, l)) / 100
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0, g = 0, b = 0
  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  const toHex = (v) => Math.round((v + m) * 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function buildCityColorMapForBoundary(boundary, cityData, baseHex) {
  const values = Object.values(cityData || {})
  const max = values.length ? Math.max(...values) : 0
  const { h } = hexToHsl(baseHex)
  const result = {}
  for (const f of boundary?.features || []) {
    const rawName = f.properties?.name || ''
    if (!rawName) continue
    const key = normalizeCityName(rawName)
    const v = cityData[key] ?? 0
    const ratio = max > 0 ? v / max : 0
    result[rawName] = hslToHex(h, 40 + 50 * ratio, 45 + 20 * ratio)
  }
  return result
}

function injectCityLabels(boundary, cityData) {
  const clone = JSON.parse(JSON.stringify(boundary))
  for (const f of clone.features || []) {
    const rawName = f.properties?.name || ''
    const key = normalizeCityName(rawName)
    const v = cityData[key] ?? 0
    f.properties = { ...(f.properties || {}), value: `${v} MW`, totalCapacity: v }
  }
  return clone
}

async function renderSelectedProject(row) {
  if (!mapRef.value) return
  const version = ++provinceRenderVersion

  if (!row) {
    mapRef.value.addExtrusion({
      ...PROVINCE_MAP_STYLE,
      id: PROVINCE_EXTRUSION_ID,
      geojson: shaanxiBoundary,
      colorMap: {},
      enableHover: true,
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
    return
  }

  let mergedRaw = {}
  const isAggregationSelf = row.key === 'AGGREGATION'
    && (!row.dropdownKey || row.dropdownKey === 'AGGREGATION')

  if (!isAggregationSelf) {
    const stageCode = row.dropdownKey || row.key
    const cityMap = await fetchStageCityCapacity(stageCode)
    if (version !== provinceRenderVersion) return
    Object.assign(mergedRaw, cityMap)
  }

  const REGION_CODE_TO_CITY = {
    '610100': '西安', '610200': '铜川', '610300': '宝鸡', '610400': '咸阳',
    '610500': '渭南', '610600': '延安', '610700': '汉中', '610800': '榆林',
    '610900': '安康', '611000': '商洛',
  }
  const cityData = {}
  for (const [k, v] of Object.entries(mergedRaw)) {
    let key
    if (/^\d+$/.test(k)) {
      key = REGION_CODE_TO_CITY[k] || k
    } else {
      key = normalizeCityName(k)
    }
    if (!key) continue
    cityData[key] = (cityData[key] || 0) + v
  }

  const baseHex = row.baseColor || row.color || PROVINCE_MAP_STYLE.defaultColor
  const colorMap = buildCityColorMapForBoundary(shaanxiBoundary, cityData, baseHex)

  console.log('[overview] renderSelectedProject', {
    row,
    isAggregationSelf,
    mergedRaw,
    cityData,
    colorMap,
  })

  mapRef.value.addExtrusion({
    ...PROVINCE_MAP_STYLE,
    id: PROVINCE_EXTRUSION_ID,
    geojson: shaanxiBoundary,
    colorMap,
    enableHover: true,
  })

  const labelsGeo = injectCityLabels(shaanxiBoundary, cityData)
  mapRef.value.addCentroidLabels({
    id: 'shaanxi-labels',
    geojson: labelsGeo,
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
  selectedStage.value = row ? (row.key || null) : null
  if (mapReady.value && !isAreaView.value) renderSelectedProject(row || null)
}

const MASK_LAYER_ID = 'shaanxi-mask'
const MASK_PATTERN = 'shaanxi-starfield-mask'
const MASK_COLOR = '#000000'
const MASK_MAX_OPACITY = 1.0
const MASK_FADE_DURATION = 300
const MASK_FULL_ZOOM_OFFSET = 1.5

let lastMaskOpacity = -1

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
    mapRef.value.addMaskLayer({
      id: MASK_LAYER_ID,
      geojson: data,
      pattern: MASK_PATTERN,
      color: MASK_COLOR,
      opacity: 0,
      fadeDuration: MASK_FADE_DURATION,
    })
    lastMaskOpacity = -1; syncMaskVisibility(true)
  } catch (err) { console.error('[mask] 陕西省遮罩加载失败:', err) }
}

const CITY_BOUNDARY_LAYER_ID = 'sx-city-boundary-line'
const CITY_BOUNDARY_SOURCE_ID = 'sx-city-boundary-src'
let cityBoundaryVisible = null

function syncCityBoundaryVisibility() {
  const map = mapRef.value?.getMap?.()
  if (!map) return
  if (!map.getLayer(CITY_BOUNDARY_LAYER_ID)) return

  const zoom = map.getZoom?.() ?? 0
  const extrusionVisible = !!map.getLayer(PROVINCE_EXTRUSION_ID) &&
    map.getLayoutProperty(PROVINCE_EXTRUSION_ID, 'visibility') !== 'none'

  const shouldShow = zoom >= AREA_ZOOM_THRESHOLD && !extrusionVisible
  if (cityBoundaryVisible === shouldShow) return
  cityBoundaryVisible = shouldShow

  map.setLayoutProperty(
    CITY_BOUNDARY_LAYER_ID,
    'visibility',
    shouldShow ? 'visible' : 'none'
  )

  if (shouldShow && mapRef.value?.hasMaskLayer?.(MASK_LAYER_ID)) {
    mapRef.value.bringMaskToTop(MASK_LAYER_ID)
  }
}
function setCityBoundaryVisible(visible) {
  const map = mapRef.value?.getMap?.()
  if (!map || !map.getLayer(CITY_BOUNDARY_LAYER_ID)) return
  map.setLayoutProperty(CITY_BOUNDARY_LAYER_ID, 'visibility', visible ? 'visible' : 'none')
  if (visible && mapRef.value?.hasMaskLayer?.(MASK_LAYER_ID)) {
    mapRef.value.bringMaskToTop(MASK_LAYER_ID)
  }
}
async function ensureCityBoundaryLine() {
  const map = mapRef.value?.getMap?.()
  if (!map) return

  if (map.getLayer(CITY_BOUNDARY_LAYER_ID)) {
    return
  }

  const cities = await loadCityGeoJSON()
  if (!cities) return

  if (!map.getSource(CITY_BOUNDARY_SOURCE_ID)) {
    map.addSource(CITY_BOUNDARY_SOURCE_ID, { type: 'geojson', data: cities })
  }
  if (!map.getLayer(CITY_BOUNDARY_LAYER_ID)) {
    map.addLayer({
      id: CITY_BOUNDARY_LAYER_ID,
      type: 'line',
      source: CITY_BOUNDARY_SOURCE_ID,
      layout: { visibility: 'none' },
      paint: {
        'line-color': '#7dd3fc',
        'line-width': ['interpolate', ['linear'], ['zoom'], 4, 1, 10, 2],
        'line-opacity': 0.9,
      },
    })
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
  onAboveThreshold: () => {
    const map = mapRef.value?.getMap?.()
    if (map?.getLayer(PROVINCE_EXTRUSION_ID)) mapRef.value.removeLayer(PROVINCE_EXTRUSION_ID)
  },
  onEnter: async () => {
    const map = mapRef.value?.getMap?.()
    if (map) {
      map.dragRotate.enable()
      map.touchPitch.enable()
      map.setMaxPitch(60)
      if (map.getPitch() !== 0) map.easeTo({ pitch: 0, duration: 300 })
    }

    await ensureShaanxiMask()
    await ensureCityBoundaryLine()
    setCityBoundaryVisible(true)
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
    } else {
      renderSelectedProject(activeProject.value)
    }
  },
  onExit: () => {
    const map = mapRef.value?.getMap?.()
    if (map) {
      map.dragRotate.enable()
      map.touchPitch.enable()
      map.setMaxPitch(60)
      if (map.getPitch() !== 45) map.easeTo({ pitch: 45, bearing: 0, duration: 800 })
    }

    clearOverviewRoadLayer()
    syncMaskVisibility(true)
    activeEditTool.value = ''
    rightPanelMode.value = 'list'
    popoverProject.value = null
    selectedProject.value = null
    clearHoverState()
    if (isEditing.value) exitEditMode()
    isDetailFullscreen.value = false
    renderProjectsByStage('overview')
    setCityBoundaryVisible(false)
  },
})

const layerPanelOffset = computed(() => {
  if (isAreaView.value) return { left: '16px', bottom: '24px' }
  return {
    left: 'calc(clamp(12px, 1.35vw, 26px) + clamp(240px, 23vw, 410px) + 16px)',
    bottom: '24px',
  }
})
const layerPanelZIndex = computed(() => (isAreaView.value ? 26 : 21))

function focusCity(cityName) {
  if (!cityName || !mapRef.value) return
  const map = mapRef.value.getMap(); if (!map) return
  const feature = shaanxiBoundary.features.find((item) => item.properties?.name === cityName)
  if (!feature) return

  const bounds = getFeatureBounds(feature)
  if (bounds) {
    map.fitBounds(bounds, {
      padding: { top: 80, bottom: 80, left: 340, right: 340 },
      pitch: 0,
      bearing: 0,
      maxZoom: AREA_ZOOM_THRESHOLD + 4,
      duration: 1500,
    })
    return
  }

  const center = resolveCityCenter(feature)
  if (!center) return
  map.flyTo({ center, zoom: AREA_ZOOM_THRESHOLD + 0.5, pitch: 0, bearing: 0, duration: 1500 })
}

function getFeatureBounds(feature) {
  const geom = feature?.geometry
  if (!geom) return null
  const polys = geom.type === 'Polygon'
    ? [geom.coordinates]
    : geom.type === 'MultiPolygon'
      ? geom.coordinates
      : []
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity
  for (const poly of polys) {
    for (const ring of poly) {
      for (const pt of ring) {
        const lng = Number(pt?.[0]), lat = Number(pt?.[1])
        if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue
        if (lng < minLng) minLng = lng
        if (lng > maxLng) maxLng = lng
        if (lat < minLat) minLat = lat
        if (lat > maxLat) maxLat = lat
      }
    }
  }
  if (!Number.isFinite(minLng)) return null
  return [[minLng, minLat], [maxLng, maxLat]]
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

function handleReportConfirm(payload) {
  const option = payload?.option || payload
  const project = payload?.project || activeProjectDetail.value
  if (project) activeProjectDetail.value = { ...activeProjectDetail.value, ...project }
  reportModalVisible.value = false

  // 每次从报告类型弹窗进入时显式设置模式和标题，避免沿用上一次向导状态。
  if (option?.key === 'proposal') {
    reportPanels.openWizard('PROJECT_PROPOSAL', project, {
      packageType: PACKAGE_TYPE.default,
      title: '一键生成项目建议书',
      maxStep: 1,
    })
    return
  }

  const packageType = reportKeyToWizardMode[option?.key]
  if (packageType !== undefined) {
    reportPanels.openWizard('FEASIBILITY_STUDY', project, {
      packageType,
      title: '',
      maxStep: 2,
    })
  }
}
function handleWizardSaveDraft(payload) {
  console.log('[overview][wizard] save-draft:', payload)
}

function handleWizardSubmit(payload) {
  const subTab = wizardReportSubTab.value
  const label = wizardTitleLabel.value || '报告'
  console.log(`[overview][wizard] submit subTab=${subTab}`, payload)
  ElMessage.success(`${label}提交成功（演示流程，接口待接）`)
  wizardVisible.value = false
  wizardTitleLabel.value = ''
  wizardMaxStep.value = 2
  wizardReportSubTab.value = ''
}
const SHAANXI_BOUNDS = [[105.4, 31.6], [111.3, 39.6]]

function handleStyleLoad() {
  try {
    syncMaskVisibility(true)
  } catch (err) {
    console.warn('[style.load] 重绘失败:', err)
  }
}

async function onMapReady() {
  await Promise.allSettled([loadShaanxiBoundary(), loadCityGeoJSON()])

  mapReady.value = true
  renderSelectedProject(activeProject.value)

  const map = mapRef.value.getMap()

  try {
    map.setMinZoom(0)
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
      padding: { top: 20, bottom: 20, left: 250, right: 250 },
      pitch: 45,
      bearing: 0,
      maxZoom: AREA_ZOOM_THRESHOLD - 0.3,
      duration: 2500,
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
  map.on('style.load', handleStyleLoad)
  await ensureShaanxiMask()
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
   // ★ 初始化 + 监听 whln 对 base imagery 的 visibility 切换
  syncLowLevelBase()
  map.on('styledata', syncLowLevelBase)
}
watch(isAreaView, (val) => {
  const el = document.querySelector('.maplibregl-ctrl-bottom-left')
  if (!el) return
  el.style.left = val
    ? '16px'
    : 'calc(clamp(12px, 1.35vw, 26px) + clamp(240px, 23vw, 410px) + 16px)'
}, { immediate: true })
onMounted(async () => {
  void loadShaanxiBoundary()
  void loadCityGeoJSON()
  await Promise.all([fetchStageList(), fetchProjectList(), fetchMapProjects()])
})

onUnmounted(() => {
  clearHoverHideTimer()
  try { mapRef.value?.stopAutoRotate?.() } catch (e) { }
  unbindZoomListener()
  removeRoadLineLayers()
  whlnPlugin?.destroy?.()
  whlnPlugin = null
  const map = mapRef.value?.getMap?.()
  if (map) {
    map.off('styledata', syncLowLevelBase)
    map.off('click', handleMapBlankClick)
    map.off('zoom', syncMaskVisibility)
    map.off('move', syncMaskVisibility)
    map.off('style.load', handleStyleLoad)
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
  width: 100%;
  height: 100%;
  z-index: 2000;
  padding-top: 0;
  top: 0;
  left: 0;
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

.area-list-view {
  position: absolute;
  z-index: 15;
  inset: 0;
  width: 100%;
  height: 100%;
  padding: 55px 20px 16px;
  background:
    radial-gradient(circle at 8% 8%, rgba(255, 205, 220, 0.34), transparent 30%),
    radial-gradient(circle at 92% 10%, rgba(184, 219, 255, 0.4), transparent 32%),
    radial-gradient(circle at 90% 100%, rgba(172, 216, 255, 0.34), transparent 36%),
    linear-gradient(122deg, #eef3fa 0%, #f7f8fc 48%, #eaf2fb 100%);
  border-radius: 8px;
  box-shadow: 0 2px 16px rgba(34, 57, 86, 0.08);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
}
.list-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.list-title { display: flex; align-items: center; gap: 6px; color: #152536; font-size: 14px; font-weight: 600; }
.list-search-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
  padding: 10px 14px;
  border: 1px solid rgba(225, 231, 239, 0.9);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.72);
}
.project-table {
  flex: 1;
  width: 100%;
  border: 1px solid #e1e7ef;
  border-radius: 6px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.96);
}
.project-table :deep(.el-table) { --el-table-border-color: #e6ebf1; --el-table-header-bg-color: #f2f5f9; --el-table-row-hover-bg-color: #f7faff; background: transparent; }
.project-table :deep(.el-table__row) { height: 40px; }
.project-table :deep(.el-table__cell) { padding: 0; }
.project-table :deep(.el-table__header-wrapper th) { height: 40px; padding: 0; background: #f2f5f9; color: #637285; font-weight: 600; font-size: 14px; border-bottom: 1px solid #e0e7ef; }
.project-table :deep(.el-table th .cell), .project-table :deep(.el-table td .cell) { padding: 0 14px; line-height: 40px; }
.project-table :deep(.el-table td.el-table__cell) { height: 40px; color: #304153; font-size: 14px; border-bottom: 1px solid #e8edf3; }
.project-table :deep(.el-table__body tr:hover > td) { background: #f8fbff !important; }
.project-table :deep(.el-table__inner-wrapper::before) { display: none; }
.pagination-row { display: flex; justify-content: flex-end; padding-top: 12px; }

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
/* 非 area view：对齐 LayerChipPanel 的 left */
.dashboard-page :deep(.maplibregl-ctrl-bottom-left) {
  display: block;
  left: calc(clamp(12px, 1.35vw, 26px) + clamp(240px, 23vw, 410px) + 16px);
  bottom: 70px;
  z-index: 22;
}

/* area view：LayerChipPanel 在 16px */
.dashboard-page.is-area-view :deep(.maplibregl-ctrl-bottom-left) {
  left: 16px;
}
@media (max-width: 760px) {
  .geometry-edit-toolbar { top: 6px; right: 8px; left: auto; max-width: calc(100vw - 16px); gap: 4px; padding: 5px; }
  .edit-tool-button { gap: 3px; padding: 0 7px; font-size: 11px; }
}

.project-name-link {
  color: #409eff;
  cursor: pointer;
}

.project-name-link:hover {
  text-decoration: underline;
}
</style>