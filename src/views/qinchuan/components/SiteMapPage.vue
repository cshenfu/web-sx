<template>
  <div class="site-map-page">
    <section v-if="showConfigPage && showConfig" class="config-fullpage">
      <div class="config-header">
        <button class="exit-button" type="button" aria-label="退出选址配置" title="退出配置" @click="showConfig = false">
          <el-icon><ArrowLeft /></el-icon>
        </button>
        <span class="config-header-title">选址配置</span>
      </div>
      <div class="config-layout">
        <ConfigForm />
        <TaskPanel />
      </div>
    </section>

    <div class="map-layer">
      <MapGL
        ref="mapRef"
        :style="satelliteStyle"
        :fly-to-on-load="false"
        :fast-reveal="true"
        :center="[30, 22]"
        :zoom="1.2"
        @ready="onMapReady"
        @draw-update="onDrawChange"
        @draw-create="onDrawChange"
        @draw-delete="onDrawChange"
        @box-select="handleBoxSelect"
      />
    </div>

    <template v-if="!showConfig && !showCreateProject && !showEditProject">
      <div v-if="!showVerifyPanel && !showDetailPanel" class="view-toolbar">
        <div class="view-tabs">
          <button class="view-tab" :class="{ active: viewMode === 'map' }" @click="viewMode = 'map'">
            <el-icon><MapLocation /></el-icon>地图模式
          </button>
          <button class="view-tab" :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'">
            <el-icon><List /></el-icon>项目列表
          </button>
        </div>
        <slot name="toolbar-extra" />
        <button v-if="showConfigPage && !isAreaView && !showProjectDrawer && !popoverProject" class="config-button" @click="showConfig = true">
          <el-icon><Setting /></el-icon>选址配置
        </button>
      </div>

      <section v-if="viewMode === 'map'" class="map-view">
        <div v-if="!popoverProject" class="map-summary">
          <div class="summary-title"><span>{{ summaryTitle }}</span><el-icon><Fold /></el-icon></div>
          <div class="summary-location">
            <el-icon><LocationFilled /></el-icon><span>陕西省</span>
            <strong>{{ overviewStats.totalCapacity }}/{{ overviewStats.totalCount }}</strong><small>总容量/数量</small>
          </div>
          <div class="summary-row">
            <span><i class="dot wind" />风电项目</span><b>{{ overviewStats.windCapacity }}/{{ overviewStats.windCount }}</b><small>容量/数量</small>
          </div>
          <div class="summary-row">
            <span><i class="dot solar" />光伏项目</span><b>{{ overviewStats.solarCapacity }}/{{ overviewStats.solarCount }}</b><small>容量/数量</small>
          </div>
        </div>

        <div v-if="!popoverProject && (isAreaView || showProjectDrawer) && !showVerifyPanel && !showDetailPanel" class="search-panel">
          <el-select v-model="filters.itemType" placeholder="项目类型" size="small" clearable style="width: 110px" @change="handleSearch">
            <el-option label="风电" value="FD" /><el-option label="光伏" value="GF" />
          </el-select>
          <el-select v-model="filters.city" placeholder="市/区" size="small" clearable style="width: 110px" @change="handleSearch">
            <el-option v-for="c in CITY_OPTIONS" :key="c.value" :label="c.label" :value="c.value" />
          </el-select>
          <el-select v-model="filters.managerCompany" placeholder="项目所属" size="small" clearable style="width: 130px" @change="handleSearch">
            <el-option label="XX能源有限公司" value="XX能源有限公司" />
          </el-select>
          <el-select v-model="filters.isVerified" placeholder="核查状态" size="small" clearable style="width: 110px" @change="handleSearch">
            <el-option label="未核查" value="0" /><el-option label="已核查" value="1" />
          </el-select>
          <el-input v-model="filters.projectName" placeholder="项目名称" size="small" clearable style="width: 140px" @keyup.enter="handleSearch">
            <template #suffix><el-icon><Search /></el-icon></template>
          </el-input>
        </div>

        <!-- ★ 编辑工具条 -->
        <div v-if="popoverProject && !showVerifyPanel && !showDetailPanel" class="edit-toolbar">
          <button
            v-for="item in editTools"
            :key="item.key"
            class="edit-tool-button"
            :class="{ active: editMode === item.key }"
            @click="isEditing ? enterEditMode(item.key) : startGeometryEdit(popoverProject, item.key)"
          >
            <el-icon><component :is="item.icon" /></el-icon>{{ item.label }}
          </button>

          <template v-if="isEditing">
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

            <template v-if="isDirty">
              <span class="edit-divider" />
              <button class="edit-tool-button save" :disabled="saving" @click="saveEdit">{{ saving ? '保存中…' : '保存' }}</button>
              <button class="edit-tool-button" :disabled="saving" @click="cancelEdit">取消修改</button>
            </template>

            <template v-if="hasSaved && !isDirty">
              <span class="edit-divider" />
              <button class="edit-tool-button recalculate" :disabled="recalculating" @click="handleRecalculate">{{ recalculating ? '计算中…' : '重新计算' }}</button>
            </template>

            <template v-if="!isDirty">
              <span class="edit-divider" />
              <button class="edit-tool-button" :disabled="saving" @click="exitEditMode">完成编辑</button>
            </template>
          </template>
        </div>

        <!-- ★ 点击选中：右上角固定卡片 -->
        <!-- ★ 点击选中：右上角固定卡片 -->
        <ProjectActionCard
          v-if="popoverProject && !isEditing && !showVerifyPanel && !showDetailPanel && !showSiteMapDetailPanel && !showCreateProject && !showEditProject"
          :project="popoverProject"
          :stage-map="stageMap"
          :actions="cardActions"
          @open-detail="(p) => openDetailPanel(p, 'main')"
          @action="executeAction"
        />
        <!-- (hover 的卡片也加上 !showSiteMapDetailPanel) -->

        <!-- ★ hover：点标题同样走完整场区选中流程 -->
        <ProjectActionCard
          v-if="hoveredProject && isAreaView && viewMode === 'map' && !popoverProject && !isEditing && !showVerifyPanel && !showDetailPanel && !showCreateProject && !showEditProject"
          :project="hoveredProject"
          hover-mode
          :position="hoveredPos"
          :stage-map="stageMap"
          :actions="cardActions"
          @open-detail="(p) => openDetailPanel(p, 'main')"
          @action="executeAction"
          @mouseenter="onHoverCardEnter"
          @mouseleave="onHoverCardLeave"
        />

        <slot name="map-overlay" :projects="projectList" :selected="popoverProject" />

        <button v-if="!showVerifyPanel && !showDetailPanel" class="expand-button" :style="expandButtonStyle" :title="showProjectDrawer ? '收起项目列表' : '打开项目列表'" @click="showProjectDrawer = !showProjectDrawer">
          <el-icon><ArrowLeft v-if="showProjectDrawer" /><ArrowRight v-else /></el-icon>
        </button>

        <div
          v-if="lineTip.visible"
          class="map-line-tip"
          :style="{ left: lineTip.x + 'px', top: lineTip.y + 'px' }"
        >{{ lineTip.text }}</div>

        <LayerChipPanel
          :visible-ids="layerVisibleIds"
          :inputs="layerInputs"
          @toggle="onLayerToggle"
          @input-change="onLayerInputChange"
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
      </section>

      <section v-else class="project-list-view">
        <div class="list-heading">
          <div class="list-title"><el-icon><List /></el-icon>项目列表</div>
          <el-button type="primary" size="small" @click="openCreateProject"><el-icon><Plus /></el-icon>添加项目</el-button>
        </div>
        <SearchBar @search="handleSearch" @reset="handleReset">
          <el-select v-model="filters.city" placeholder="所属市/区" size="small" clearable style="width: 120px">
            <el-option v-for="city in CITY_OPTIONS" :key="city.value" :label="city.label" :value="city.value" />
          </el-select>
          <el-select v-model="filters.itemType" placeholder="项目类型" size="small" clearable style="width: 120px">
            <el-option label="风电" value="FD" />
            <el-option label="光伏" value="GF" />
          </el-select>
          <el-select v-model="filters.projectStage" placeholder="项目阶段" size="small" clearable style="width: 140px">
            <el-option v-for="stage in stageOptions" :key="stage.code" :label="stage.desc" :value="stage.code" />
          </el-select>
          <el-select v-model="filters.approvalStatus" placeholder="审批状态" size="small" clearable style="width: 130px">
            <el-option label="未审批" value="NO_APPROVAL" />
            <el-option label="审批通过" value="APPROVED" />
            <el-option label="审批不通过" value="REJECTED" />
          </el-select>
          <el-select v-model="filters.isVerified" placeholder="核查状态" size="small" clearable style="width: 120px">
            <el-option label="未核查" value="0" />
            <el-option label="已核查" value="1" />
          </el-select>
          <el-input v-model="filters.managerCompany" placeholder="所属公司" size="small" clearable style="width: 150px" @keyup.enter="handleSearch" />
          <el-input v-model="filters.managerName" placeholder="负责人" size="small" clearable style="width: 120px" @keyup.enter="handleSearch" />
          <el-date-picker
            v-model="listCreateTimeRange"
            type="daterange"
            size="small"
            value-format="YYYY-MM-DD"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
          />
          <el-input v-model="filters.projectCode" placeholder="项目编号" size="small" clearable style="width: 150px" @keyup.enter="handleSearch" />
          <el-input v-model="filters.projectName" placeholder="项目名称" size="small" clearable style="width: 150px" @keyup.enter="handleSearch" />
        </SearchBar>
        <el-table v-loading="listLoading" :data="projectList" size="small" stripe class="project-table">
          <el-table-column label="项目编号" min-width="130"><template #default="{ row }">{{ row.projectCode || '-' }}</template></el-table-column>
          <el-table-column label="项目名称" min-width="220" show-overflow-tooltip>
            <template #default="{ row }">
              <span
                class="project-name-link"
                :title="row.projectName"
                @click.stop="locateProjectFromList(row)"
              >
                {{ row.projectName || '-' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="项目区域" min-width="180" show-overflow-tooltip><template #default="{ row }">{{ formatRegion(row) }}</template></el-table-column>
          <el-table-column label="装机容量MW" width="120" sortable><template #default="{ row }">{{ row.currentProjectCapacity ?? '-' }}</template></el-table-column>
          <el-table-column label="资本金财务内部收益率%" width="180" sortable>
            <template #default="{ row }"><span class="rate-cell"><span class="rate-line">资本金财务</span><span class="rate-line">内部收益率%</span></span><span class="rate-value">{{ formatRate(row.capitalFinancialRate) }}</span></template>
          </el-table-column>
          <el-table-column label="阶段" width="110"><template #default="{ row }">{{ stageMap[row.projectStage] || '-' }}</template></el-table-column>
          <el-table-column v-if="statusColumnConfig" :label="statusColumnConfig.label" width="110">
            <template #default="{ row }"><span v-if="statusColumnConfig.getText(row)" class="status-text" :class="statusColumnConfig.getClass(row)">{{ statusColumnConfig.getText(row) }}</span></template>
          </el-table-column>
          <el-table-column label="备注" min-width="100" show-overflow-tooltip><template #default="{ row }">{{ row.notes || '-' }}</template></el-table-column>
          <el-table-column label="所属" min-width="120" show-overflow-tooltip><template #default="{ row }">{{ row.managerCompany || '-' }}</template></el-table-column>
          <el-table-column label="负责人" width="90"><template #default="{ row }">{{ row.managerName || '-' }}</template></el-table-column>
          <el-table-column label="创建时间" width="170"><template #default="{ row }">{{ row.createTime || '-' }}</template></el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <div class="row-actions">
                <el-button v-for="action in rowActions" :key="action" link :type="action === 'delete' ? 'danger' : 'primary'" size="small" @click="executeAction(action, row)">{{ ACTION_LABELS[action] || action }}</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-row">
          <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.pageSize" :page-sizes="[10, 20, 50, 100]" small background layout="total, sizes, prev, pager, next, jumper" :total="pagination.total" @current-change="handlePageChange" @size-change="handleSizeChange" />
        </div>
      </section>
    </template>

    <section v-if="showCreateProject" class="create-project-fullpage">
      <div class="cp-map-overlay">
        <div class="cp-search-box">
          <el-input v-model="placeSearchKeyword" placeholder="请输入行政区划地名" size="small" @keyup.enter="handlePlaceSearch">
            <template #suffix><el-icon class="cp-search-icon" @click="handlePlaceSearch"><ArrowRight /></el-icon></template>
          </el-input>
        </div>
        <div class="cp-draw-actions">
          <el-button size="small" @click="startCreateDrawing">开始绘制</el-button>
          <el-button size="small" @click="saveCreateDrawing">保存</el-button>
          <el-button size="small" @click="clearCreateDrawing">清空</el-button>
        </div>
      </div>
      <CreateProjectForm ref="createProjectFormRef" :map-ref="mapRef" :panel-width="550" @cancel="closeCreateProject" @saved="onProjectCreated" />
    </section>

    <section v-if="showEditProject" class="create-project-fullpage">
      <CreateProjectForm ref="editProjectFormRef" :map-ref="mapRef" :panel-width="550" mode="edit" :project="editProjectTarget" @cancel="onEditProjectCancel" @saved="onProjectUpdated" />
    </section>

    
    <ProjectDrawer :visible="showProjectDrawer" :list="projectList" :total="pagination.total" :page="pagination.page" :page-size="pagination.pageSize" :selected-id="popoverProject?.id ?? null" :loading="listLoading" :row-actions="rowActions" @close="showProjectDrawer = false" @select="focusProject" @action="handleDrawerAction" @page-change="handlePageChange" @size-change="handleSizeChange" @sort-change="handleDrawerSortChange" />

        <!-- ★ 1. 点击“项目名称”进的全量面板 -->
    <ProjectDetailPanelFull
      v-if="showDetailPanel"
      :project="selectedProject"
      :is-fullscreen="true"
      :initial-tab="detailTabMapped"
      :refresh-key="detailRefreshKey"
      @back="showDetailPanel = false"
      @toggle-fullscreen="() => {}"
      @generate-report="handleGenerateReportFromHeader"
      @open-confirm="handleOpenConfirm"
      @create-report="handleCreateReportFromDetail"
      @action="onDetailPanelAction"
      @support-add-data="() => {}"
      @support-file-action="() => {}"
      @survey-add-data="() => {}"
      @survey-file-action="() => {}"
      @report-row-action="() => {}"
    />

    <!-- ★ 2. 点击“操作按钮”进的简版面板 -->
    <ProjectDetailPanel
      :visible="showSiteMapDetailPanel"
      :project="selectedProject"
      :stage="props.stage || selectedProject?.projectStage || ''"
      :initial-tab="detailPanelTab"
      :refresh-key="detailRefreshKey"
      @close="showSiteMapDetailPanel = false"
      @action="onDetailPanelAction"
      @generate-report="handleGenerateReportFromHeader"
      @open-confirm="handleOpenConfirm"
    />

    <GenerateReportPanel
      :visible="showGeneratePanel"
      :project="generatePanelProject"
      :action-key="generatePanelActionKey"
      :sub-code="generatePanelSubCode"
      :source="generatePanelSource"
      :first-business-title="generatePanelFirstBusinessTitle"
      :secondary-business-title="generatePanelSecondaryBusinessTitle"
      :file-type-tag="generatePanelFileTypeTag"
      :ai-detail="selectedProject"
      @close="showGeneratePanel = false"
      @generated="onReportGenerated"
    />    
    
    

    <ProjectWorkflowDialogs
      :visibility="{ verify: showVerifyPanel, assign: showAssignDialog, reserve: showReserveDialog, addReport: showAddReportPanel, confirm: showConfirmPanel }"
      :verify-project="selectedProject"
      :assign-project="assignTargetProject"
      :reserve-project="selectedProject"
      :report-project="selectedProject"
      :report-id="confirmReportId"
      :verify-mounted="showVerifyPanelFlag"
      @close-verify="showVerifyPanel = false"
      @verify-saved="onVerifySaved"
      @update:assign="showAssignDialog = $event"
      @assign-success="onAssignSuccess"
      @update:reserve="showReserveDialog = $event"
      @reserve-saved="onReserveSaved"
      @close-add-report="showAddReportPanel = false"
      @report-success="handleReportPanelSuccess"
      @close-confirm="showConfirmPanel = false"
      @confirm-success="handleConfirmSuccess"
    />

    <ReportGenerateModal
      :visible="showGenerateModal"
      :project="selectedProject"
      @close="showGenerateModal = false"
      @add-report="showGenerateModal = false"
      @confirm="handleReportConfirm"
      @generate-competitive="handleOpenCompetitivePanel"
      @generate-request="handleGenerateRequest"
      @open-add-report="handleOpenAddReport"
    />

    

    

    <ReportWizard
      v-if="wizardVisible"
      class="wizard-overlay"
      :create-project-mode="wizardMode"
      :title="wizardTitleLabel"
      :max-step="wizardMaxStep"
      :project-name="selectedProject?.name || selectedProject?.projectName || ''"
      :project="selectedProject"
      @close="closeWizard"
      @save-draft="handleWizardSaveDraft"
      @submit="handleWizardSubmit"
    />

    <slot name="page-extra" />
  </div>
</template>

<script setup>
import { ensureOuterCCW, ensureHoleCW, smoothstep } from '../js/mapGeometry'
import { useProjectHover } from '../js/useProjectHover'

import ProjectWorkflowDialogs from './ProjectWorkflowDialogs.vue'
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, ArrowRight, CircleCheck, Fold, InfoFilled, List, Location, LocationFilled, MapLocation, Plus, Search, Setting } from '@element-plus/icons-vue'
import MapGL from '@/components/MapGL.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import CreateProjectForm from './Createprojectform.vue'
import ConfigForm from './ConfigForm.vue'
import TaskPanel from './TaskPanel.vue'
import ProjectDrawer from './ProjectDrawer.vue'
import ProjectDetailPanel from './ProjectDetailPanel.vue'                                        // 简版（其他阶段）
// ★ 全量 overview 详情面板（路径按你项目实际调整）
import ProjectDetailPanelFull from './area-panel/ProjectDetailPanel.vue'
import GenerateReportPanel from './GenerateReportPanel.vue'
import ReportGenerateModal from './area-panel/ReportGenerateModal.vue'
import ReportWizard from './report-wizard/ReportWizard.vue'
import { PACKAGE_TYPE } from '../js/Reportwizardmockdata'

import { satelliteStyle } from '../js/mapConfig'
import { useZoomThresholdSwitch } from '../js/useZoomThresholdSwitch'
import { searchPlaceName } from '../js/useTiandituGeocode'
import { ICON_SIZE_WIND, ICON_SIZE_BOOSTER } from '@/components/site-map/iconSize.js'
import * as api from '@/api/modules/project'
import * as configApi from '@/api/modules/selectConfig'
import fjIcon from '@/assets/img/mapIcon/fj-icon.png'
import gfIcon from '@/assets/img/mapIcon/gf-icon.png'
import fengjiIcon from '@/assets/img/mapIcon/fengji.png'
import fengjiBxIcon from '@/assets/img/mapIcon/fengji-bx.png'
import shengyazhanIcon from '@/assets/img/mapIcon/syz.png'
import LayerChipPanel from '@/components/site-map/LayerChipPanel.vue'
import { WHLN_LAYER_IDS, DEFAULT_VISIBLE } from '@/components/site-map/layerPanelConfig'
import { attachSxLayers } from '@/components/site-map/attachSxLayers'

import {
  getIconNaturalWidth,
  getCoordsBounds,
  calcIconSizeAtRef,
  buildIconSizeExpression,
} from '@/components/site-map/areaCenterIcon'

import { loadShaanxiProvince, loadShaanxiCities } from '@/utils/shaanxiBoundary'
import { buildMainInfoFromAi } from '../js/aiProjectAdapter'
import ProjectActionCard from './area-panel/ProjectActionCard.vue'

const props = defineProps({
  stage: { type: String, default: '' },
  summaryTitle: { type: String, default: '项目通道概况' },
  cardActions: { type: Array, default: () => [] },
  statusColumn: { type: String, default: 'verify', validator: (v) => ['verify', 'approval', 'none'].includes(v) },
  rowActions: { type: Array, default: () => [] },
  showConfigPage: { type: Boolean, default: false },
  showVerifyPanelFlag: { type: Boolean, default: false },
  enableShaanxiMask: { type: Boolean, default: true },
  maskMinZoom: { type: Number, default: 4.5 },
  maskFullZoom: { type: Number, default: 6.5 },
  maskMaxOpacity: { type: Number, default: 1 },
  maskColor: { type: String, default: '#0b1e3a' },
  maskFadeDuration: { type: Number, default: 300 },
})
const emits = defineEmits(['featureVisibleChange'])

const ICON_FENGJI = 'icon-fengji'
const ICON_FENGJI_BX = 'icon-fengji-bx'
const ICON_SHENGYAZHAN = 'icon-shengyazhan'
const ICON_AREA_FJ = 'icon-area-fj'
const ICON_AREA_GF = 'icon-area-gf'
const AREA_CENTER_LAYER_ID = 'project-area-center-icons'
let areaCenterIconRequestVersion = 0
const CITY_LAYER_ID = 'site-city-stats'
const PROVINCE_BOUNDARY_LAYER_ID = 'site-province-boundary-line'
const PROVINCE_BOUNDARY_SOURCE_ID = 'site-province-boundary-src'
const CITY_BOUNDARY_LAYER_ID = 'site-city-boundary-line'
const CITY_BOUNDARY_SOURCE_ID = 'site-city-boundary-src'
const SHAANXI_FIT_BOUNDS = [[105.4, 31.7], [111.2, 39.6]]

// ★ 星空渐变阈值（zoom）
//   zoom 6.8 ≈ 整个陕西范围 → 不显示星空
//   zoom 8    ≈ 看到某市/部分         → 星空开始淡入
//   zoom 10   ≈ 看到市内部/场区       → 星空完全覆盖
const STARFIELD_FADE_START = 7
const STARFIELD_FADE_END = 10
const SHAANXI_FIT_PADDING = { top: 120, bottom: 120, left: 120, right: 120 }
const MIN_ZOOM_OFFSET = 2
const PROVINCE_CODE = '610000'

const PROJECT_ICON_LAYER_MAP = { 'wind-gh': ['project-wind-all', 'project-wind-bx-all'], booster: ['project-booster-all'] }
const SELECTED_ICON_LAYER_IDS = ['project-wind-all', 'project-wind-bx-all', 'project-booster-all']
const DRAWER_WIDTH = 460
const DRAWER_GAP = 12
let roadRequestVersion = 0
let currentRoadProjectId = null
const roadDataCache = new Map()
const roadInFlight = new Map()

const CITY_CLICK_ZOOM_TARGET = 8.5

const TERRAIN_SOURCE_ID = 'terrain-dem'
const HILLSHADE_SOURCE_ID = 'hillshade-dem'
const HILLSHADE_LAYER_ID = 'terrain-hillshade'
const TERRAIN_TILEJSON_URL = 'https://gis-rustfs.wh-ge.com/terrain/china-dem/tilejson.json'
const TERRAIN_EXAGGERATION = 1.5

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
const CITY_OPTIONS = [
  { label: '西安市', value: '610100' }, { label: '铜川市', value: '610200' }, { label: '宝鸡市', value: '610300' },
  { label: '咸阳市', value: '610400' }, { label: '渭南市', value: '610500' }, { label: '延安市', value: '610600' },
  { label: '汉中市', value: '610700' }, { label: '榆林市', value: '610800' }, { label: '安康市', value: '610900' }, { label: '商洛市', value: '611000' },
]
const CITY_LABEL_CENTER = { '610100': [108.945, 34.26], '610200': [108.980, 35.10], '610300': [107.140, 34.36], '610400': [108.180, 34.52], '610500': [109.510, 34.83], '610600': [109.100, 36.58], '610700': [107.030, 33.06], '610800': [109.730, 38.28], '610900': [109.030, 32.68], '611000': [109.940, 33.86] }
const STAGE_THEMES = {
  DEFAULT: { cityFillStops: ['interpolate', ['linear'], ['get', 'totalCapacity'], 0, '#e9d5ff', 30, '#c084fc', 80, '#a855f7', 150, '#7c3aed'], cityOutline: '#f0abfc' },
  PROJECT_RESERVE: { cityFillStops: ['interpolate', ['linear'], ['get', 'totalCapacity'], 0, '#bfdbfe', 30, '#60a5fa', 80, '#3b82f6', 150, '#1d4ed8'], cityOutline: '#93c5fd' },
  PROJECT_INITIATION: { cityFillStops: ['interpolate', ['linear'], ['get', 'totalCapacity'], 0, '#bbf7d0', 30, '#4ade80', 80, '#22c55e', 150, '#15803d'], cityOutline: '#86efac' },
  FEASIBILITY_REVIEW: { cityFillStops: ['interpolate', ['linear'], ['get', 'totalCapacity'], 0, '#fed7aa', 30, '#fb923c', 80, '#f97316', 150, '#c2410c'], cityOutline: '#fdba74' },
  INVESTMENT_DECISION: { cityFillStops: ['interpolate', ['linear'], ['get', 'totalCapacity'], 0, '#fecaca', 30, '#f87171', 80, '#ef4444', 150, '#b91c1c'], cityOutline: '#fca5a5' },
}

// ★ 智能选址阶段 code —— 只这个阶段用全量 overview 面板
const SMART_SITE_STAGES = ['PRELIMINARY_SELECTION']

// 报告与面板状态
const showGenerateModal = ref(false)
const wizardVisible = ref(false)
const wizardMode = ref(PACKAGE_TYPE.default)
const wizardTitleLabel = ref('')
const wizardMaxStep = ref(2)
const wizardReportSubTab = ref('')
const reportKeyToWizardMode = {
  'feasibility-centralized': PACKAGE_TYPE.default,
  'feasibility-distributed': PACKAGE_TYPE.distributedDefault,
}

const SUB_TAB_REPORT_CONFIG = {
  PROJECT_PROPOSAL:       { packageType: PACKAGE_TYPE.default, maxStep: 1, title: '一键生成项目建议书' },
  FEASIBILITY_STUDY:      { packageType: PACKAGE_TYPE.default, maxStep: 2, title: '一键生成风电场可行性研究报告' },
  COMPETITIVE_ALLOCATION: { packageType: PACKAGE_TYPE.default, maxStep: 2, title: '一键生成竞配申报报告' },
  PROJECT_INITIATION:     { packageType: PACKAGE_TYPE.default, maxStep: 2, title: '一键生成请示文件' },
  POST_EVALUATION:        { packageType: PACKAGE_TYPE.default, maxStep: 2, title: '一键生成后评价报告' },
}
// 顶部加
const detailRefreshKey = ref(0)
function handleOpenCompetitivePanel(project) {
  showGenerateModal.value = false
  generatePanelProject.value = project || selectedProject.value
  generatePanelActionKey.value = 'bidding'
  generatePanelSubCode.value = ''
  generatePanelSource.value = 'competitive-modal'
  generatePanelFirstBusinessTitle.value = ''
  generatePanelSecondaryBusinessTitle.value = ''
  generatePanelFileTypeTag.value = ''
  showGeneratePanel.value = true
}
function getReportConfigBySubTab(subTab) {
  return SUB_TAB_REPORT_CONFIG[subTab] || SUB_TAB_REPORT_CONFIG.FEASIBILITY_STUDY
}
const showDetailPanel = ref(false)
const showSiteMapDetailPanel = ref(false) // ★ 新增：专门控制简版面板
const detailPanelTab = ref('main')

// ★ 简版面板 tab（'main' / 'material' / 'meeting'）→ 全量面板 tab（'main' / 'survey' / 'support' / 'report' / 'review'）
const TAB_KEY_MAP = {
  main: 'main',
  material: 'support',
  meeting:  'review',
}
const detailTabMapped = computed(() => TAB_KEY_MAP[detailPanelTab.value] || 'main')

// ★ 当前项目 / 页面级 stage 是否为智能选址
const isSmartSite = computed(() => {
  const code = selectedProject.value?.projectStage || props.stage || ''
  return SMART_SITE_STAGES.includes(code)
})

const showGeneratePanel = ref(false)
const generatePanelProject = ref(null)
const generatePanelActionKey = ref('')
const generatePanelSubCode = ref('')
// ★ 新增
const generatePanelSource = ref('')
const generatePanelFirstBusinessTitle = ref('')
const generatePanelSecondaryBusinessTitle = ref('')
const generatePanelFileTypeTag = ref('')

const showAddReportPanel = ref(false)
const showConfirmPanel = ref(false)
const confirmReportId = ref(null)
  // ============================================================
  // ★ 计算并应用"当前容器下完整看到陕西"对应的最小 zoom
  //   用户不能再缩小到超过陕西范围
  // ============================================================
  function applyMinZoomForShaanxi(map, padding = SHAANXI_FIT_PADDING) {
    if (!map) return
    const container = map.getContainer()
    const W = container.clientWidth - padding.left - padding.right
    const H = container.clientHeight - padding.top - padding.bottom
    if (W <= 0 || H <= 0) return

    const [[w, s], [e, n]] = SHAANXI_FIT_BOUNDS
    const toY = (lat) => {
      const m = Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360))
      return (Math.PI - m) / (2 * Math.PI)
    }
    const dx = (e - w) / 360
    const dy = Math.abs(toY(s) - toY(n))
    const zx = Math.log2(W / (dx * 256))
    const zy = Math.log2(H / (dy * 256))
    const fitZ = Math.min(zx, zy)

    // ★ 关键：允许缩小 0.8 级，这样你能看到陕西完整的轮廓，甚至带一点周边省份
    const minZ = Math.max(3.5, fitZ - MIN_ZOOM_OFFSET) 
    
    map.setMinZoom(minZ)
    if (map.getZoom() < minZ) map.jumpTo({ zoom: minZ })
  }

  // ★ window resize 时重新计算 minZoom
  function handleWindowResize() {
    // requestAnimationFrame 等 MapLibre 内部 resize 完成
    requestAnimationFrame(() => {
      const map = mapRef.value?.getMap?.()
      if (!map) return
      applyMinZoomForShaanxi(map)
    })
  }

function handleOpenAddReport() {
   showGenerateModal.value = false
   showProjectDrawer.value = false
   showDetailPanel.value = false
   showAddReportPanel.value = true
}

function handleReportPanelSuccess() {
  fetchMapProjects()
  fetchProjectList()
}

function handleOpenConfirm(id) {
  confirmReportId.value = id
  showConfirmPanel.value = true
}
// 报告/函件生成 —— header 按钮 emit 过来
function handleGenerateReportFromHeader(proj) {
  if (proj) selectedProject.value = proj
  showGenerateModal.value = true
}
function handleConfirmSuccess() {
  fetchMapProjects()
  fetchProjectList()
  if (selectedProject.value?.id) {
    const fresh = allMapProjects.value.find(p => p.id === selectedProject.value.id)
    if (fresh) {
      selectedProject.value = fresh
      if (popoverProject.value && String(popoverProject.value.id) === String(fresh.id)) {
        popoverProject.value = fresh
      }
    }
  }
}

const theme = computed(() => STAGE_THEMES[props.stage] || STAGE_THEMES.DEFAULT)
const currentActions = computed(() => STAGE_ACTIONS[props.stage] || STAGE_ACTIONS['PRELIMINARY_SELECTION'])
const cardActions = computed(() => currentActions.value)
const rowActions = computed(() => currentActions.value)

const AREA_STYLE = {
  FD: { color: '#3b82f6', opacity: 0.22, outlineColor: '#60a5fa', outlineWidth: 1.5, highlight: { color: 'transparent', opacity: 0, outlineColor: '#93c5fd', outlineWidth: 3 } },
  GF: { color: '#a855f7', opacity: 0.22, outlineColor: '#c084fc', outlineWidth: 1.5, highlight: { color: 'transparent', opacity: 0, outlineColor: '#d8b4fe', outlineWidth: 3 } },
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
const mapReady = ref(false)
const route = useRoute()
const viewMode = ref(route.query.view === 'list' ? 'list' : 'map')
const showConfig = ref(false)
const showProjectDrawer = ref(false)
const showVerifyPanel = ref(false)
const showAssignDialog = ref(false)
const assignTargetProject = ref(null)
const renderedLayerIds = new Set()
const allMapProjects = ref([])
const popoverProject = ref(null)
const hoveredProject = ref(null)
const hoveredPos = reactive({ x: 0, y: 0 })

const { clearHoverHideTimer, clearHoverState, scheduleHoverHide, onHoverCardEnter, onHoverCardLeave } = useProjectHover(hoveredProject)
\n



const selectedProject = ref(null)

const editMode = ref(null)
const drawingNewPoint = ref(false)
const saving = ref(false)
const isBoxSelecting = ref(false)
const hasSaved = ref(false)
const recalculating = ref(false)
const isEditing = ref(false)
const isDirty = ref(false)

const showEditProject = ref(false)
const editProjectTarget = ref(null)
const editProjectFormRef = ref(null)
const showReserveDialog = ref(false)

const drawerSort = reactive({ key: '', dir: 'desc' })
let whlnPlugin = null
let zeroPitchGuard = null
const layerVisibleIds = ref([...DEFAULT_VISIBLE])
const layerInputs = reactive({ noise: 700 })
const customLayerState = reactive({})

const overviewStats = reactive({ totalCapacity: 0, totalCount: 0, windCapacity: 0, windCount: 0, solarCapacity: 0, solarCount: 0 })
const cityStats = ref([])

let cityGeoJSONCache = null
let shaanxiBoundaryCache = null
let boundaryLoadingPromise = null
let citiesLoadingPromise = null

const editTools = [
  { key: 'area', label: '编辑场区', icon: Location },
  { key: 'wind', label: '编辑风机', icon: MapLocation },
  { key: 'booster', label: '编辑升压站', icon: CircleCheck },
  { key: 'unavailable', label: '设置不可用区域', icon: InfoFilled },
]
const expandButtonStyle = computed(() => ({ right: showProjectDrawer.value ? `${DRAWER_WIDTH + DRAWER_GAP}px` : '0px' }))

const ROAD_LAYER_ID = 'project-road-layer'
const LINE_LAYER_ID = 'project-35kv-line-layer'

const ROAD_LINE_COLORS = {
  road: '#2563eb',
  line: '#eab308',
}
const ROAD_PAINT = { 'line-color': ROAD_LINE_COLORS.road, 'line-width': 2.5, 'line-opacity': 0.95 }
const LINE_PAINT = { 'line-color': ROAD_LINE_COLORS.line, 'line-width': 2.5, 'line-opacity': 0.95 }
const lineTip = reactive({ visible: false, x: 0, y: 0, text: '' })

function setProjectIconVisible(chipId, visible) {
  const layerIds = PROJECT_ICON_LAYER_MAP[chipId]
  if (!layerIds) return
  const map = mapRef.value?.getMap?.()
  if (!map) return
  for (const layerId of layerIds) { if (map.getLayer(layerId)) map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none') }
}
function syncAllProjectIcons() { for (const chipId of Object.keys(PROJECT_ICON_LAYER_MAP)) setProjectIconVisible(chipId, layerVisibleIds.value.includes(chipId)) }

function onLayerToggle(item) {
  const isOn = layerVisibleIds.value.includes(item.id)
  const nextOn = !isOn

  if (isOn) {
    layerVisibleIds.value = layerVisibleIds.value.filter((id) => id !== item.id)
  } else {
    layerVisibleIds.value = [...layerVisibleIds.value, item.id]
  }
  customLayerState[item.id] = nextOn

  if (item.type === 'whln') {
    whlnPlugin?.setVisibleIds?.(
      layerVisibleIds.value.filter((id) => WHLN_LAYER_IDS.includes(id))
    )
    return
  }
  if (item.type === 'project') setProjectIconVisible(item.id, nextOn)
  else if (item.type === 'terrain') toggleTerrain(nextOn)
  else if (item.type === 'custom') toggleCustomLayer(item.id, nextOn)
}

function toggleCustomLayer(id, visible) {
  if (id === 'road' || id === 'line') {
    syncRoadLineVisibility()
    return
  }
}

function onLayerInputChange({ id, value }) { layerInputs[id] = value }

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

const showCreateProject = ref(false)
const createProjectFormRef = ref(null)
const placeSearchKeyword = ref('')
function openCreateProject() { showCreateProject.value = true; if (mapReady.value) nextTick(() => startCreateDrawing()) }
function closeCreateProject() { showCreateProject.value = false; placeSearchKeyword.value = '' }
function startCreateDrawing() { createProjectFormRef.value?.startPolygonDrawing?.() }
function saveCreateDrawing() { createProjectFormRef.value?.handleMapDrawSave?.() }
function clearCreateDrawing() { createProjectFormRef.value?.handleMapDrawClear?.() }
function onProjectCreated() { showCreateProject.value = false; placeSearchKeyword.value = ''; viewMode.value = 'list'; pagination.page = 1; fetchProjectList(); fetchMapProjects(); fetchOverviewStats(); fetchCityStats(); }
async function handlePlaceSearch() {
  if (!placeSearchKeyword.value.trim()) return
  try {
    const { lng, lat } = await searchPlaceName(placeSearchKeyword.value.trim())
    mapRef.value?.getMap?.()?.flyTo({ center: [lng, lat], zoom: 11, duration: 1500 })
  } catch (err) { ElMessage.warning(err.message || '未找到匹配的地名') }
}

function openEditProjectForm() {
  if (!popoverProject.value) return
  if (isDirty.value) { ElMessage.warning('请先保存或取消地图上的修改'); return }
  clearSelectedProjectIcons()
  editProjectTarget.value = popoverProject.value
  showEditProject.value = true
}
async function onProjectUpdated() {
  showEditProject.value = false
  editProjectTarget.value = null
  await Promise.all([fetchMapProjects(), fetchProjectList(), fetchOverviewStats(), fetchCityStats()])
  const fresh = allMapProjects.value.find((p) => p.id === popoverProject.value?.id)
  if (fresh) {
    popoverProject.value = fresh
    if (selectedProject.value && String(selectedProject.value.id) === String(fresh.id)) {
      selectedProject.value = fresh
    }
    initEditBuffer(fresh)
    await renderProjectsByStage('area')
  }
}
function onEditProjectCancel() {
  showEditProject.value = false
  editProjectTarget.value = null
  if (popoverProject.value) renderSelectedProjectIcons(popoverProject.value)
}
function onReserveSaved() { fetchMapProjects(); fetchProjectList() }

const filters = reactive({ province: '610000', city: '', district: '', itemType: '', projectStage: '', approvalStatus: '', managerCompany: '', managerName: '', createTimeStart: '', createTimeEnd: '', projectCode: '', projectName: '', isVerified: '' })
const listCreateTimeRange = computed({
  get: () => (filters.createTimeStart || filters.createTimeEnd)
    ? [filters.createTimeStart || '', filters.createTimeEnd || '']
    : null,
  set: (value) => {
    filters.createTimeStart = value?.[0] || ''
    filters.createTimeEnd = value?.[1] || ''
  },
})
const projectList = ref([])
const listLoading = ref(false)
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
const APPROVAL_STATUS_MAP = { NO_APPROVAL: '未审批', APPROVED: '审批通过', REJECTED: '审批不通过' }
const APPROVAL_STATUS_CLASS = { NO_APPROVAL: 'pending', APPROVED: 'passed', REJECTED: 'rejected' }
const stageOptions = ref([])
const stageMap = computed(() => Object.fromEntries(stageOptions.value.map(item => [item.code, item.desc])))

const STATUS_COLUMN_CONFIG = {
  verify: { label: '核查状态', getText: (row) => (row.isVerified === 1 || row.isVerified === true ? '已核查' : ''), getClass: (row) => (row.isVerified === 1 || row.isVerified === true ? 'passed' : '') },
  approval: { label: '审批状态', getText: (row) => APPROVAL_STATUS_MAP[row.approvalStatus] || '', getClass: (row) => APPROVAL_STATUS_CLASS[row.approvalStatus] || '' },
  none: null,
}
const statusColumnConfig = computed(() => STATUS_COLUMN_CONFIG[props.statusColumn] || null)

async function fetchStageList() { try { stageOptions.value = (await api.getStageList())?.data ?? [] } catch { stageOptions.value = [] } }
function formatRegion(row) { const names = [row.provinceName, row.cityName, row.districtName].filter(Boolean); return names.length ? names.join('/') : (row.address || '-') }
function formatRate(val) { return val === null || val === undefined || val === '' ? '-' : `${val}%` }

async function fetchProjectList() {
  listLoading.value = true
  try {
    const params = { pageNo: pagination.page, pageSize: pagination.pageSize, province: filters.province }
    const stage = filters.projectStage || props.stage
    if (stage) params.projectStage = stage
    if (filters.city) params.city = filters.city
    if (filters.district) params.district = filters.district
    if (filters.itemType) params.itemType = filters.itemType
    if (filters.approvalStatus) params.approvalStatus = filters.approvalStatus
    if (filters.managerCompany) params.managerCompany = filters.managerCompany
    if (filters.managerName) params.managerName = filters.managerName
    if (filters.createTimeStart) params.createTimeStart = filters.createTimeStart
    if (filters.createTimeEnd) params.createTimeEnd = filters.createTimeEnd
    if (filters.projectCode) params.projectCode = filters.projectCode
    if (filters.projectName) params.projectName = filters.projectName
    if (filters.isVerified !== '' && filters.isVerified !== null) params.isVerified = String(filters.isVerified)
    if (drawerSort.key === 'capacity') params.capacitySort = drawerSort.dir
    if (drawerSort.key === 'rate') params.rateSort = drawerSort.dir
    const res = await api.getPageList(params)
    const data = res?.data ?? {}
    projectList.value = data.list ?? []
    pagination.total = Number(data.total ?? 0)
  } catch (err) { ElMessage.error(err?.message || '项目列表加载失败'); projectList.value = []; pagination.total = 0 }
  finally { listLoading.value = false }
}

function handleSearch() { pagination.page = 1; fetchProjectList() }
function handleReset() { Object.assign(filters, { city: '', district: '', itemType: '', projectStage: '', approvalStatus: '', managerCompany: '', managerName: '', createTimeStart: '', createTimeEnd: '', projectCode: '', projectName: '', isVerified: '' }); drawerSort.key = ''; drawerSort.dir = 'desc'; pagination.page = 1 }
function handlePageChange(page) { pagination.page = page; fetchProjectList() }
function handleSizeChange(size) { pagination.pageSize = size; pagination.page = 1; fetchProjectList() }

const deletingId = ref(null)
function executeAction(action, project) {
  if (!project) return
  clearHoverState()

  const mapProject = allMapProjects.value.find((p) => p.id === project.id) || project

  if (['material', 'researchMaterial', 'investMaterial'].includes(action)) {
    openSiteMapDetailPanel(mapProject, 'material');
    return
  }
  if (['establishMeeting', 'researchReview', 'investMeeting'].includes(action)) {
    openSiteMapDetailPanel(mapProject, 'meeting');
    return
  }
  if (action === 'assign') { assignTargetProject.value = mapProject; showAssignDialog.value = true; return }

  if (action === 'verify') {
    showProjectDrawer.value = false; showDetailPanel.value = false; viewMode.value = 'map'
    setTimeout(() => { onProjectClick(mapProject.id); showVerifyPanel.value = true }, 100)
    return
  }

  if (action === 'reserve') {
    showProjectDrawer.value = false; showDetailPanel.value = false; viewMode.value = 'map'
    setTimeout(async () => {
      if (String(popoverProject.value?.id ?? '') !== String(mapProject.id)) await onProjectClick(mapProject.id)
      showReserveDialog.value = true
    }, 100)
    return
  }

  if (action === 'edit') {
    showProjectDrawer.value = false; showDetailPanel.value = false; viewMode.value = 'map'
    setTimeout(async () => {
      if (String(popoverProject.value?.id ?? '') !== String(mapProject.id)) await onProjectClick(mapProject.id)
      openEditProjectForm()
    }, 100)
    return
  }
  if (action === 'delete') { handleDeleteProject(mapProject); return }
  ElMessage.info(`点击了「${ACTION_LABELS[action] || action}」：${project.projectName || ''}`)
}

async function handleDeleteProject(project) {
  if (!project || deletingId.value) return
  const id = project.id
  try { await ElMessageBox.confirm(`确认删除项目「${project.projectName || ''}」吗？删除后不可恢复。`, '提示', { type: 'warning' }) } catch { return }
  deletingId.value = id
  try {
    const res = await api.deletProject(id)
    if (res?.code !== 200) { ElMessage.error(res?.msg || '删除失败'); return }
    ElMessage.success('删除成功')
    showProjectDrawer.value = false; showDetailPanel.value = false
    await fetchMapProjects()
    if (String(popoverProject.value?.id ?? '') === String(id)) clearPopover()
    if (String(hoveredProject.value?.id ?? '') === String(id)) clearHoverState()
    if (projectList.value.length === 1 && pagination.page > 1) pagination.page -= 1
    await Promise.all([fetchProjectList(), fetchOverviewStats(), fetchCityStats()])
  } catch (err) { ElMessage.error(err?.message || '删除失败') }
  finally { deletingId.value = null }
}

// ★ 打开详情面板 —— 统一走"选中场区"完整流程
// ★ 打开全量详情面板（点击标题）
async function openDetailPanel(project, tab) {
  clearHoverState()
  const p = allMapProjects.value.find(item => item.id === project.id)
  if (!p) { ElMessage.warning('地图上未找到该项目'); return }
  showProjectDrawer.value = false
  viewMode.value = 'map'

  await onProjectClick(p.id)

  try {
    const res = await api.getAiProjectData(p.id)
    if (res?.code === 200 && res.data) {
      const ai = res.data
      selectedProject.value = {
        ...selectedProject.value,
        listItemId: p.id,
        aiProjectId: ai.aiProjectId ?? p.id,
        id: p.id,
        relationId: ai.relationId,
        reportProjectId: ai.reportProjectId,
        mainInfo: buildMainInfoFromAi(ai),
        stageTimeList: ai.stageTimeList || [],
        rawAiData: ai,
      }
      if (popoverProject.value && String(popoverProject.value.id) === String(p.id)) {
        popoverProject.value = { ...popoverProject.value, ...selectedProject.value }
      }
    }
  } catch (err) {
    console.warn('[site-map] AI 详情加载失败:', err)
  }

  detailPanelTab.value = tab
  showSiteMapDetailPanel.value = false // ★ 互斥
  showDetailPanel.value = true         // ★ 打开全量
}

// ★ 新增：打开简版详情面板（点击操作按钮）
async function openSiteMapDetailPanel(project, tab = 'main') {
  clearHoverState()
  const p = allMapProjects.value.find(item => item.id === project.id) || project
  await onProjectClick(p.id)
  
  selectedProject.value = p
  detailPanelTab.value = tab
  showDetailPanel.value = false        // ★ 互斥
  showSiteMapDetailPanel.value = true  // ★ 打开简版
}
function onAssignSuccess() { fetchProjectList(); fetchMapProjects() }
function onDetailPanelAction(payload) {
  if (payload?.type === 'stage-changed') {
    showDetailPanel.value = false
    fetchMapProjects(); fetchProjectList(); fetchOverviewStats(); fetchCityStats()
    return
  }
  if (payload?.type === 'generate-report') {
    generatePanelProject.value = payload.project || selectedProject.value
    generatePanelActionKey.value = payload.actionKey || ''
    generatePanelSubCode.value = payload.subCode || ''
    generatePanelSource.value = 'sitemap-detail'   // ★ 触发 updateFile
    generatePanelFirstBusinessTitle.value = payload.firstBusinessTitle || ''
    generatePanelSecondaryBusinessTitle.value = payload.secondaryBusinessTitle || ''
    generatePanelFileTypeTag.value = payload.fileTypeTag || ''
    showGeneratePanel.value = true
    return
  }
  if (payload?.type === 'create-report') {
    handleCreateReportFromDetail(payload)
    return
  }
}

// ★ 全量面板 / 简版面板共用的 "create-report" 处理
// 打开 GeneratePanel（用于 report-tab 的各种 subTab）
function openGeneratePanelFromReportTab(payload, { actionKey, fileTypeTag, firstBusinessTitle }) {
  generatePanelProject.value = payload.project || selectedProject.value
  generatePanelActionKey.value = actionKey
  generatePanelSubCode.value = ''
  generatePanelSource.value = 'report-tab'
  generatePanelFirstBusinessTitle.value = firstBusinessTitle || ''
  generatePanelSecondaryBusinessTitle.value = ''
  generatePanelFileTypeTag.value = fileTypeTag || ''
  showGeneratePanel.value = true
  showDetailPanel.value = false
}

function handleCreateReportFromDetail(payload) {
  if (!payload?.subTab) return
  const subTab = payload.subTab
  const project = payload.project || selectedProject.value
  const stage =
    project?.projectStage ||
    project?.stage ||
    selectedProject.value?.projectStage ||
    selectedProject.value?.stage ||
    ''

  switch (subTab) {
    case 'COMPETITIVE_ALLOCATION':
      return openGeneratePanelFromReportTab(payload, { actionKey: 'bidding' })

    case 'FEASIBILITY_STUDY':
      return openGeneratePanelFromReportTab(payload, {
        actionKey: 'gen-report',
        fileTypeTag: '可研审查报告',
        firstBusinessTitle: 'PROJECT_FEASIBILITY_MATERIALS',
      })

    case 'PROJECT_INITIATION':
      if (stage === 'INVESTMENT_DECISION') {
        return openGeneratePanelFromReportTab(payload, {
          actionKey: 'gen-invest-letter',
          fileTypeTag: '投资决策请示函',
          firstBusinessTitle: 'INVESTMENT_DECISION_MATERIALS',
        })
      }
      return openGeneratePanelFromReportTab(payload, {
        actionKey: 'gen-letter',
        fileTypeTag: '立项请示函',
        firstBusinessTitle: 'PROJECT_INITIATION_MATERIALS',
      })

    case 'PROJECT_PROPOSAL':
    case 'POST_EVALUATION':
    default: {
      const config = getReportConfigBySubTab(subTab)
      wizardMode.value = config.packageType
      wizardTitleLabel.value = config.title
      wizardMaxStep.value = config.maxStep
      wizardReportSubTab.value = subTab
      wizardVisible.value = true
      showDetailPanel.value = false
      return
    }
  }
}



function onReportGenerated() {
  console.log('[site-map] 报告已生成')
  // ★ 等后端落库再刷，避免接口抢先返回旧数据
  window.setTimeout(() => { detailRefreshKey.value++ }, 300)
}

async function fetchOverviewStats() {
  try {
    const payload = { regionCode: PROVINCE_CODE, regionType: 'PROVINCE' }
    if (props.stage) payload.projectStage = props.stage
    const data = (await configApi.overViewData(payload))?.data ?? {}
    Object.assign(overviewStats, { totalCapacity: data.totalCapacity ?? 0, totalCount: data.totalCount ?? 0, windCapacity: data.windCapacity ?? 0, windCount: data.windCount ?? 0, solarCapacity: data.solarCapacity ?? 0, solarCount: data.solarCount ?? 0 })
  } catch (err) { console.error('[stats] overViewData 失败:', err) }
}
async function fetchCityStats() {
  try {
    const payload = { provinceCode: PROVINCE_CODE }
    if (props.stage) payload.projectStage = props.stage
    cityStats.value = (await configApi.provinceViewData(payload))?.data ?? []
    if (mapReady.value && !isAreaView.value) await renderCityStats()
  } catch (err) { console.error('[stats] provinceViewData 失败:', err) }
}

async function loadShaanxiBoundary() {
  if (shaanxiBoundaryCache) return shaanxiBoundaryCache
  if (!boundaryLoadingPromise) {
    boundaryLoadingPromise = loadShaanxiProvince()
      .then((data) => { shaanxiBoundaryCache = data; return data })
      .catch((err) => { boundaryLoadingPromise = null; console.error('[site-map] 陕西省界加载失败:', err); return null })
  }
  return boundaryLoadingPromise
}

async function loadCityGeoJSON() {
  if (cityGeoJSONCache) return cityGeoJSONCache
  if (!citiesLoadingPromise) {
    citiesLoadingPromise = loadShaanxiCities()
      .then((data) => { cityGeoJSONCache = data; return data })
      .catch((err) => { citiesLoadingPromise = null; console.error('[site-map] 陕西省市界加载失败:', err); return null })
  }
  return citiesLoadingPromise
}

async function renderCityStats() {
  if (!mapReady.value || !mapRef.value) return
  const geoJSON = await loadCityGeoJSON(); if (!geoJSON) return
  const statMap = {}; for (const s of cityStats.value) statMap[String(s.regionCode)] = s
  const features = geoJSON.features.map((f) => {
    const code = String(f.properties.adcode ?? f.properties.regionCode ?? f.properties.code ?? '')
    const stat = statMap[code]
    const center = CITY_LABEL_CENTER[code] || f.properties.center || f.properties.centroid || null
    return { ...f, properties: { ...f.properties, regionCode: code, regionName: stat?.regionName || f.properties.name || '', totalCapacity: Number(stat?.totalCapacity) || 0, center } }
  })
  mapRef.value.addFillLayer({ id: CITY_LAYER_ID, geojson: { type: 'FeatureCollection', features }, fillColor: theme.value.cityFillStops, fillOpacity: 0.55, outlineColor: theme.value.cityOutline, outlineWidth: 1.2 })
  const labelFeatures = features.filter((f) => Array.isArray(f.properties.center) && f.properties.center.length === 2).map((f) => ({ type: 'Feature', properties: f.properties, geometry: { type: 'Point', coordinates: f.properties.center } }))
  mapRef.value.addSymbolLayer({ id: `${CITY_LAYER_ID}-labels`, geojson: { type: 'FeatureCollection', features: labelFeatures }, layout: { 'text-field': ['format', ['get', 'totalCapacity'], { 'font-scale': 1.25 }, 'MW', { 'font-scale': 0.85 }, '\n', ['get', 'regionName'], { 'font-scale': 0.85 }], 'text-size': 13, 'text-anchor': 'center', 'text-allow-overlap': true, 'text-ignore-placement': true, 'text-line-height': 1.1 }, paint: { 'text-color': '#ffffff', 'text-halo-color': '#000000', 'text-halo-width': 1.6 } })
  syncMaskVisibility()
}
function hideCityStats() { mapRef.value?.removeLayer(CITY_LAYER_ID); mapRef.value?.removeLayer(`${CITY_LAYER_ID}-labels`) }

const MASK_LAYER_ID = 'shaanxi-mask'
const MASK_PATTERN = 'shaanxi-starfield-mask'
const MASK_SOURCE_ID = 'shaanxi-mask-src'
const SHAANXI_BOUNDS = [[105.4, 31.7], [111.2, 39.6]]
let lastMaskOpacity = -1
const WORLD_OUTER = ensureOuterCCW([[-180, -85], [180, -85], [180, 85], [-180, 85], [-180, -85]])
function buildMaskGeoJSON(boundary) {
  const holes = []
  for (const f of boundary?.features || []) {
    const g = f?.geometry; if (!g) continue
    const polys = g.type === 'Polygon' ? [g.coordinates] : (g.type === 'MultiPolygon' ? g.coordinates : [])
    for (const poly of polys) { if (poly?.[0] && poly[0].length >= 4) holes.push(ensureHoleCW(poly[0])) }
  }
  if (!holes.length) return { type: 'FeatureCollection', features: [] }
  return { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [WORLD_OUTER, ...holes] } }] }
}
async function ensureShaanxiMask() {
  if (!props.enableShaanxiMask || !mapReady.value) return
  const map = mapRef.value?.getMap?.(); if (!map) return
  if (map.getLayer(MASK_LAYER_ID)) { syncMaskVisibility(true); return }
  try {
    const boundary = await loadShaanxiBoundary(); if (!boundary) return
    const data = buildMaskGeoJSON(boundary); if (!data.features.length) return
    if (!map.getSource(MASK_SOURCE_ID)) map.addSource(MASK_SOURCE_ID, { type: 'geojson', data })
    mapRef.value.addMaskLayer({
      id: MASK_LAYER_ID,
      geojson: data,
      pattern: MASK_PATTERN,
      color: props.maskColor,
      opacity: 0,                     // ★ 改为 0，由 syncMaskVisibility 后续渐变
      fadeDuration: props.maskFadeDuration,
    })
    lastMaskOpacity = -1
    syncMaskVisibility(true) 
  } catch (err) { console.warn('[mask] 陕西省遮罩加载失败:', err) }
}
function viewIntersectsShaanxi(map) {
  const b = map.getBounds()
  const w = Math.max(-180, Math.min(180, b.getWest())), e = Math.max(-180, Math.min(180, b.getEast()))
  const s = Math.max(-90, Math.min(90, b.getSouth())), n = Math.max(-90, Math.min(90, b.getNorth()))
  if (w > e) return false
  const [[sw, ss], [ne, nn]] = SHAANXI_BOUNDS
  return !(e < sw || w > ne || n < ss || s > nn)
}
function computeMaskOpacity() {
  if (!props.enableShaanxiMask) return 0
  const map = mapRef.value?.getMap?.()
  if (!map) return 0
  const z = map.getZoom()
  // 与 overview 同款：用 smoothstep 做"底图 → 星空"的渐变
  return smoothstep(STARFIELD_FADE_START, STARFIELD_FADE_END, z) * props.maskMaxOpacity
}
function syncMaskVisibility(force = false) {
  if (!props.enableShaanxiMask) return
  const map = mapRef.value?.getMap?.(); if (!map || !map.getLayer(MASK_LAYER_ID)) return
  const top = map.getStyle()?.layers?.slice(-1)[0]
  if (top && top.id !== MASK_LAYER_ID) map.moveLayer(MASK_LAYER_ID)
  const target = computeMaskOpacity()
  if (!force && Math.abs(target - lastMaskOpacity) < 0.01) return
  lastMaskOpacity = target
  map.setPaintProperty(MASK_LAYER_ID, 'fill-opacity', target)
}

function getProjectCoords(project) { return (project.coordinate || []).map((c) => [Number(c.longitude), Number(c.latitude)]).filter(([lng, lat]) => Number.isFinite(lng) && Number.isFinite(lat)) }
function getProjectCentroid(project) {
  let coords = getProjectCoords(project)
  if (coords.length > 1) {
    const [firstLng, firstLat] = coords[0]
    const [lastLng, lastLat] = coords[coords.length - 1]
    if (firstLng === lastLng && firstLat === lastLat) coords = coords.slice(0, -1)
  }
  if (!coords.length) return null
  let sx = 0, sy = 0; for (const [lng, lat] of coords) { sx += lng; sy += lat }
  return [sx / coords.length, sy / coords.length]
}

function buildAreaCenterFC(projects = allMapProjects.value, naturalWidthMap = {}) {
  const hiddenIds = new Set(
    [popoverProject.value?.id, selectedProject.value?.id]
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
  if (!mapReady.value || !mapRef.value) return

  const [fjW, gfW] = await Promise.all([
    getIconNaturalWidth(fjIcon),
    getIconNaturalWidth(gfIcon),
  ])
  if (requestVersion !== areaCenterIconRequestVersion) return

  const geojson = buildAreaCenterFC(allMapProjects.value, { fj: fjW, gf: gfW })
  if (!geojson.features.length) {
    mapRef.value.removeLayer(AREA_CENTER_LAYER_ID)
    renderedLayerIds.delete(AREA_CENTER_LAYER_ID)
    return
  }

  try {
    await mapRef.value.ensureImage(ICON_AREA_FJ, fjIcon)
    await mapRef.value.ensureImage(ICON_AREA_GF, gfIcon)
    if (requestVersion !== areaCenterIconRequestVersion) return

    await mapRef.value.addImagePoints({
      id: AREA_CENTER_LAYER_ID,
      geojson,
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
    if (requestVersion !== areaCenterIconRequestVersion) return
    renderedLayerIds.add(AREA_CENTER_LAYER_ID)
  } catch (err) {
    console.warn('[map] 场区中心图标加载失败:', err)
  }
}

function flyToProjectBounds(project) {
  const map = mapRef.value?.getMap?.(); if (!map) return
  const coords = getProjectCoords(project); if (!coords.length) return
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity
  for (const [lng, lat] of coords) { if (lng < minLng) minLng = lng; if (lng > maxLng) maxLng = lng; if (lat < minLat) minLat = lat; if (lat > maxLat) maxLat = lat }
  if (minLng === maxLng || minLat === maxLat) { map.flyTo({ center: [(minLng + maxLng) / 2, (minLat + maxLat) / 2], zoom: 15, pitch: 0, duration: 1200 }); return }
  map.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: { top: 80, bottom: 80, left: 200, right: 120 }, maxZoom: 16, duration: 1200 })
}
function buildAreaFeature(project) {
  const coords = getProjectCoords(project); if (coords.length < 3) return null
  const f = coords[0], l = coords[coords.length - 1]; if (f[0] !== l[0] || f[1] !== l[1]) coords.push([f[0], f[1]])
  return { type: 'Feature', properties: { projectId: project.id, projectCode: project.projectCode, projectName: project.projectName, itemType: project.itemType }, geometry: { type: 'Polygon', coordinates: [coords] } }
}
function buildWindFC(project) {
  const normal = [], reserve = []
  for (const [index, p] of (project.windTurbinePoints || []).entries()) {
    const lng = Number(p.longitude), lat = Number(p.latitude)
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue
    const isReserve = Number(p.isReserve) === 1
    const feature = { type: 'Feature', properties: { projectId: project.id, index, isReserve: isReserve ? 1 : 0 }, geometry: { type: 'Point', coordinates: [lng, lat] } }
    ;(isReserve ? reserve : normal).push(feature)
  }
  return { normal: { type: 'FeatureCollection', features: normal }, reserve: { type: 'FeatureCollection', features: reserve } }
}
function buildBoosterFC(project) {
  return {
    type: 'FeatureCollection',
    features: (project.boosterStationLocations || [])
      .map((p, index) => {
        if (!(p.isBest === true || Number(p.isBest) === 1)) return null
        const lng = Number(p.lng), lat = Number(p.lat)
        return Number.isFinite(lng) && Number.isFinite(lat)
          ? { type: 'Feature', properties: { projectId: project.id, index, isBest: true }, geometry: { type: 'Point', coordinates: [lng, lat] } }
          : null
      })
      .filter(Boolean),
  }
}
function clearProjectLayers() {
  if (!mapRef.value) return
  areaCenterIconRequestVersion += 1
  for (const id of renderedLayerIds) mapRef.value.removeLayer(id)
  renderedLayerIds.clear()
}

async function safeAddIcon({ layerId, featureCollection, iconId, iconUrl, iconSize, iconAnchor = 'center', fallbackColor = '#3b82f6', fallbackRadius = 8 }) {
  try { await mapRef.value.ensureImage(iconId, iconUrl); await mapRef.value.addImagePoints({ id: layerId, geojson: featureCollection, iconId, iconUrl, iconSize, iconAnchor }) }
  catch (err) { mapRef.value.addPoints({ id: layerId, geojson: featureCollection, color: fallbackColor, radius: fallbackRadius }) }
  renderedLayerIds.add(layerId)
}
function addProjectArea(project, highlighted = false) {
  const area = buildAreaFeature(project); if (!area) return
  const layerId = `project-area-${project.id}`
  const style = AREA_STYLE[project.itemType] || AREA_STYLE.FD
  const s = highlighted ? style.highlight : style
  mapRef.value.addPolygon({ id: layerId, geojson: area, color: s.color, opacity: s.opacity, outlineColor: s.outlineColor, outlineWidth: s.outlineWidth })
  renderedLayerIds.add(layerId)
  const fillLayerId = `${layerId}-fill`
  mapRef.value.offClick(fillLayerId)
  mapRef.value.onClick(fillLayerId, () => onProjectClick(project.id))

  mapRef.value.offHover?.(fillLayerId)
  mapRef.value.onHover?.(fillLayerId, {
    onEnter: (_, e) => {
      if (isEditing.value || showCreateProject.value || showEditProject.value || showVerifyPanel.value || showDetailPanel.value) return
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
function clearSelectedProjectIcons() { if (!mapRef.value) return; for (const layerId of SELECTED_ICON_LAYER_IDS) { if (renderedLayerIds.has(layerId)) { mapRef.value.removeLayer(layerId); renderedLayerIds.delete(layerId) } } }
async function renderSelectedProjectIcons(project) {
  if (!mapReady.value || !mapRef.value || !project) return
  clearSelectedProjectIcons()
  const wf = buildWindFC(project), bf = buildBoosterFC(project)
  if (wf.normal.features.length) await safeAddIcon({ layerId: 'project-wind-all', featureCollection: wf.normal, iconId: ICON_FENGJI, iconUrl: fengjiIcon, iconSize: ICON_SIZE_WIND, iconAnchor: 'bottom', fallbackColor: '#22c55e', fallbackRadius: 3 })
  if (wf.reserve.features.length) await safeAddIcon({ layerId: 'project-wind-bx-all', featureCollection: wf.reserve, iconId: ICON_FENGJI_BX, iconUrl: fengjiBxIcon, iconSize: ICON_SIZE_WIND, iconAnchor: 'bottom', fallbackColor: '#f59e0b', fallbackRadius: 3 })
  if (bf.features.length) await safeAddIcon({ layerId: 'project-booster-all', featureCollection: bf, iconId: ICON_SHENGYAZHAN, iconUrl: shengyazhanIcon, iconSize: ICON_SIZE_BOOSTER, iconAnchor: 'bottom', fallbackColor: '#ef4444', fallbackRadius: 3 })
  syncAllProjectIcons()
}
async function renderProjectsByStage(stage) {
  if (!mapReady.value || !mapRef.value) return
  clearProjectLayers()
  if (!allMapProjects.value.length || stage === 'overview') return
  const highlightIds = new Set(
    [popoverProject.value?.id, selectedProject.value?.id]
      .filter((id) => id != null)
      .map(String)
  )
  for (const p of allMapProjects.value) addProjectArea(p, highlightIds.has(String(p.id)))
  await renderAreaCenterIcons()
  const focus = popoverProject.value || selectedProject.value
  if (focus) await renderSelectedProjectIcons(focus)
  syncAllProjectIcons(); syncMaskVisibility()
}
async function fetchMapProjects() {
  try {
    const params = { pageNo: 1, pageSize: 100, province: '610000' }
    if (props.stage) params.projectStage = props.stage
    allMapProjects.value = (await api.getPageList(params))?.data?.list ?? []
    if (mapReady.value && isAreaView.value) await renderProjectsByStage('area')
  } catch (err) { ElMessage.error(err?.message || '地图项目数据加载失败') }
}

const windCount = computed(() => popoverProject.value?.windTurbinePoints?.length || 0)
const altCount = computed(() => (popoverProject.value?.windTurbinePoints || []).filter((p) => Number(p.isReserve) === 1).length)

async function onProjectClick(projectId) {
  if (showCreateProject.value || showEditProject.value) return
  if (isEditing.value && isDirty.value) {
    ElMessage.warning('当前有未保存的地图修改，请先保存或取消')
    return
  }
  if (String(popoverProject.value?.id ?? '') === String(projectId)) return

  clearPopoverLayersOnly()

  const project = allMapProjects.value.find((p) => String(p.id) === String(projectId)); if (!project) return
  flyToProjectBounds(project)
  popoverProject.value = project
  selectedProject.value = project
  clearHoverState()
  hasSaved.value = false
  isEditing.value = false
  isDirty.value = false
  editMode.value = null
  initEditBuffer(project)
  addProjectArea(project, true)
  await renderAreaCenterIcons()
  await renderSelectedProjectIcons(project)
  fetchAndRenderRoadData(project.id)
}

function unwrapApiPayload(response) {
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

function toMapCoordinate(point) {
  const lng = Number(Array.isArray(point) ? point[0] : (point?.lon ?? point?.lng ?? point?.longitude))
  const lat = Number(Array.isArray(point) ? point[1] : (point?.lat ?? point?.latitude))
  return Number.isFinite(lng) && Number.isFinite(lat) ? [lng, lat] : null
}

function pushLineFeatures(target, rows, baseProps) {
  if (!Array.isArray(rows) || rows.length === 0) return 0
  const groups = Array.isArray(rows[0]) ? rows : [rows]
  let count = 0
  groups.forEach((group) => {
    if (!Array.isArray(group)) return
    const coords = group.map(toMapCoordinate).filter(Boolean)
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

  // ---------- 道路（保持不变） ----------
  const roadMap = data?.roadMap ?? data?.data?.roadMap ?? {}
  for (const type of ['CNKJ', 'CNXJ', 'JZXJ']) {
    pushLineFeatures(
      roadFeatures,
      roadMap?.[type]?.roadpoint,
      { category: 'road', sourceType: type, label: '道路' }
    )
  }

  // ---------- 35kV 线路 ----------
  // ★ 补齐 line35Kv 的多路径解包（与 overview 对齐）
  const line35Kv =
    data?.line35Kv ??
    data?.line35KV ??
    data?.data?.line35Kv ??
    data?.data?.line35KV ??
    null

  const mapGeoJson =
    line35Kv?.mapGeoJson ??
    line35Kv?.mapGeojson ??
    line35Kv?.mapGeoJSON ??
    data?.mapGeoJson ??
    null

  // loops 同时兼容 line35Kv.loops / line35Kv.line.loops / data.loops / data.line.loops
  const loops =
    line35Kv?.loops ??
    line35Kv?.line?.loops ??
    data?.loops ??
    data?.line?.loops ??
    []

  // 建立 loopname -> { fanCount, loopLength } 映射，供 mapGeoJson 分支回查 fanCount
  const loopMeta = new Map()
  if (Array.isArray(loops)) {
    loops.forEach((loop, index) => {
      const name = loop?.loopname || String(index + 1)
      loopMeta.set(String(name), {
        fanCount: Number(loop?.fan) || (loop?.fanidarr?.length ?? 0),
        loopLength: loop?.looplength || '',
      })
    })
  }

  // ★ 分支 A：mapGeoJson（新格式，优先）
  if (mapGeoJson?.features?.length) {
    const sorted = [...mapGeoJson.features].sort((a, b) => {
      const ai = Number(a?.properties?.edge_index)
      const bi = Number(b?.properties?.edge_index)
      if (Number.isFinite(ai) && Number.isFinite(bi)) return ai - bi
      return 0
    })

    sorted.forEach((feature) => {
      const geom = feature?.geometry
      if (!geom) return
      const props = feature?.properties || {}
      const loopName = props.loopname || ''
      const meta = loopMeta.get(String(loopName)) || {}
      const lengthM = Number(props.length_m) || 0
      const lengthKm = lengthM > 0
        ? (lengthM / 1000).toFixed(2)
        : (meta.loopLength || '')
      const typeText =
        props.type === 'underground' ? '地埋'
          : props.type === 'trunk' ? '主干'
            : props.type === 'branch' ? '分支'
              : ''

      const coordsList =
        geom.type === 'LineString'
          ? [geom.coordinates]
          : geom.type === 'MultiLineString'
            ? (geom.coordinates || [])
            : []

      coordsList.forEach((coords) => {
        const points = (coords || []).map(toMapCoordinate).filter(Boolean)
        if (points.length < 2) return
        lineFeatures.push({
          type: 'Feature',
          properties: {
            category: 'line',
            loopIndex: props.edge_index ?? null,
            loopName,
            lineType: props.type || '',
            lineTypeText: typeText,
            segmentName: props.name || '',
            loopLength: lengthKm,
            fanCount: meta.fanCount || 0,
            label: loopName ? `35kV 线路 ${loopName}` : `35kV 线路 ${props.name || ''}`,
          },
          geometry: { type: 'LineString', coordinates: points },
        })
      })
    })
  }
  // ★ 分支 B：loops（老格式，作为兜底）
  // else if (Array.isArray(loops)) {
  //   loops.forEach((loop, loopIndex) => {
  //     const loopName = loop?.loopname || String(loopIndex + 1)
  //     pushLineFeatures(
  //       lineFeatures,
  //       loop?.cablepoletower,
  //       {
  //         category: 'line',
  //         loopIndex,
  //         loopName,
  //         loopLength: loop?.looplength || '',
  //         fanCount: Number(loop?.fan) || (loop?.fanidarr?.length ?? 0),
  //         label: `35kV 线路 ${loopName}`,
  //       }
  //     )
  //   })
  // }

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

  if (map.getLayer(MASK_LAYER_ID)) map.moveLayer(MASK_LAYER_ID)
}

function syncRoadLineVisibility() {
  const map = mapRef.value?.getMap?.()
  if (!map) return
  const roadOn = layerVisibleIds.value.includes('road')
  const lineOn = layerVisibleIds.value.includes('line')
  const pid = popoverProject.value?.id ?? selectedProject.value?.id
  const cached = pid != null ? roadDataCache.get(pid) : null

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

function clearRoadLayer() {
  roadRequestVersion += 1
  roadInFlight.clear()
  currentRoadProjectId = null
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

async function fetchAndRenderRoadData(projectId) {
  if (String(popoverProject.value?.id ?? '') !== String(projectId)) return

  const cached = roadDataCache.get(projectId)
  if (cached) {
    if (currentRoadProjectId !== String(projectId)) {
      removeRoadLineLayers()
      currentRoadProjectId = String(projectId)
    }
    syncRoadLineVisibility()
    return
  }
  if (roadInFlight.has(projectId)) return

  const requestVersion = ++roadRequestVersion
  roadInFlight.set(projectId, requestVersion)
  removeRoadLineLayers()
  currentRoadProjectId = null

  try {
    const res = await api.getRoadData(projectId)

    if (requestVersion !== roadRequestVersion || String(popoverProject.value?.id ?? '') !== String(projectId)) return

    const data = unwrapApiPayload(res)
    const { roadFeatures, lineFeatures } = buildRoadLineFeatures(data)
    roadDataCache.set(projectId, { roadFeatures, lineFeatures })
    currentRoadProjectId = String(projectId)
    syncRoadLineVisibility()

    if (!roadFeatures.length && !lineFeatures.length) {
      ElMessage.info('接口未返回可绘制的道路或线路点位')
    }
  } catch (err) {
    console.warn('[road] getRoadData 请求或解析失败:', err)
    ElMessage.warning(err?.message || '道路或线路数据加载失败，请检查接口返回')
  } finally {
    if (roadInFlight.get(projectId) === requestVersion) roadInFlight.delete(projectId)
  }
}

function clearPopoverLayersOnly() {
  const pid = popoverProject.value?.id
  if (pid == null) {
    mapRef.value?.clearEditableAreas(); mapRef.value?.stopBoxSelect?.()
    editBuffer.value = null; drawingNewPoint.value = false; isBoxSelecting.value = false; isEditing.value = false; isDirty.value = false; hasSaved.value = false
    editMode.value = null
    return
  }
  clearRoadLayer()
  mapRef.value?.clearEditableAreas(); mapRef.value?.stopBoxSelect?.()
  editBuffer.value = null; drawingNewPoint.value = false; isBoxSelecting.value = false; isEditing.value = false; isDirty.value = false; hasSaved.value = false
  editMode.value = null
  const project = allMapProjects.value.find((p) => p.id === pid)
  if (project && isAreaView.value) addProjectArea(project, false)
  clearSelectedProjectIcons()
}

function clearPopover() {
  clearPopoverLayersOnly()
  popoverProject.value = null
  selectedProject.value = null
  clearHoverState()
  showVerifyPanel.value = false
  showDetailPanel.value = false
  showSiteMapDetailPanel.value = false // ★ 加上这行
  renderAreaCenterIcons()
}

function handleMapBlankClick(e) {
  if (showCreateProject.value || showEditProject.value) return
  if (!popoverProject.value && !showDetailPanel.value) return

  const map = mapRef.value?.getMap?.()
  if (!map) return

  try {
    const hits = map.queryRenderedFeatures(e.point)
    if (hits.some((f) => f.properties?.projectId != null)) return

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

    clearPopover()
  } catch (err) {
    console.warn('[site-map] handleMapBlankClick 查询失败:', err)
  }
}

function getCityCenterFromFeature(feature) {
  const p = feature?.properties || {}
  const code = String(p.regionCode || p.adcode || '')
  const fromProps = Array.isArray(p.center) ? p.center : null
  const center = fromProps || CITY_LABEL_CENTER[code] || null
  if (!center) return null
  const lng = Number(center[0]); const lat = Number(center[1])
  return Number.isFinite(lng) && Number.isFinite(lat) ? [lng, lat] : null
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

async function ensureProvinceBoundaryLine() {
  const map = mapRef.value?.getMap?.()
  if (!map) return
  if (map.getLayer(PROVINCE_BOUNDARY_LAYER_ID)) return
  const province = await loadShaanxiBoundary()
  if (!province) return

  if (!map.getSource(PROVINCE_BOUNDARY_SOURCE_ID)) {
    map.addSource(PROVINCE_BOUNDARY_SOURCE_ID, { type: 'geojson', data: province })
  }
  if (!map.getLayer(PROVINCE_BOUNDARY_LAYER_ID)) {
    map.addLayer({
      id: PROVINCE_BOUNDARY_LAYER_ID,
      type: 'line',
      source: PROVINCE_BOUNDARY_SOURCE_ID,
      layout: { visibility: 'visible' },
      paint: {
        'line-color': '#facc15',
        'line-width': ['interpolate', ['linear'], ['zoom'], 4, 1.5, 8, 3, 12, 4],
        'line-opacity': 0.95,
      },
    })
  }
}

async function ensureCityBoundaryLine() {
  const map = mapRef.value?.getMap?.()
  if (!map) return
  if (map.getLayer(CITY_BOUNDARY_LAYER_ID)) return
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
      layout: { visibility: 'visible' },
      paint: {
        'line-color': '#7dd3fc',
        'line-width': ['interpolate', ['linear'], ['zoom'], 4, 1, 10, 2],
        'line-opacity': 0.9,
      },
    })
  }
}
function handleCityFillClick(e) {
  if (isAreaView.value) return
  if (showCreateProject.value || showEditProject.value) return
  const map = mapRef.value?.getMap?.(); if (!map) return
  const fillLayerId = `${CITY_LAYER_ID}-fill`
  if (!map.getLayer(fillLayerId)) return
  const features = map.queryRenderedFeatures(e.point, { layers: [fillLayerId] })
  if (!features.length) return

  const bounds = getFeatureBounds(features[0])
  if (bounds) {
    map.fitBounds(bounds, {
      padding: { top: 80, bottom: 80, left: 60, right: 60 },
      pitch: 0,
      bearing: 0,
      duration: 1500,
    })
    return
  }

  const center = getCityCenterFromFeature(features[0])
  if (!center) return
  map.flyTo({ center, zoom: CITY_CLICK_ZOOM_TARGET, pitch: 0, bearing: 0, duration: 1500 })
}

async function onVerifySaved() {
  showVerifyPanel.value = false
  await fetchMapProjects()
  const fresh = allMapProjects.value.find(p => p.id === popoverProject.value?.id)
  if (fresh) {
    popoverProject.value = fresh
    if (selectedProject.value && String(selectedProject.value.id) === String(fresh.id)) {
      selectedProject.value = fresh
    }
    initEditBuffer(fresh)
  }
  fetchProjectList()
  fetchOverviewStats()
  fetchCityStats()
}
async function focusProject(project) {
  const p = allMapProjects.value.find((item) => item.id === project.id)
  if (!p) { ElMessage.warning('地图上未找到该项目'); return }
  showProjectDrawer.value = false; onProjectClick(p.id)
}
function handleDrawerAction({ type, project }) { executeAction(type, allMapProjects.value.find((item) => item.id === project.id) || project) }
function handleDrawerSortChange({ key, dir }) { drawerSort.key = key; drawerSort.dir = dir; pagination.page = 1; fetchProjectList() }
// 列表模式点击项目名称：切回地图模式并定位到该项目
// 复用 focusProject → onProjectClick，与 ProjectDrawer 卡片点击、地图点场区行为一致
function locateProjectFromList(row) {
  if (!row) return
  // 详情面板互斥，避免切到地图后残留遮挡
  showDetailPanel.value = false
  showSiteMapDetailPanel.value = false
  viewMode.value = 'map'
  nextTick(() => focusProject(row))
}
watch(viewMode, (val) => {
  if (val === 'list' && showProjectDrawer.value) showProjectDrawer.value = false
  if (val === 'list') clearHoverState()
})
watch(showProjectDrawer, (val) => { if (val) { pagination.page = 1; fetchProjectList() } })

const editBuffer = ref(null)
let suppressDrawSync = false

function initEditBuffer(project) {
  if (!project) { editBuffer.value = null; return }
  const area = getProjectCoords(project)
  const wind = (project.windTurbinePoints || []).map(p => { const lng = Number(p.longitude), lat = Number(p.latitude); return Number.isFinite(lng) && Number.isFinite(lat) ? { lng, lat, isReserve: Number(p.isReserve) === 1 ? 1 : 0 } : null }).filter(Boolean)
  const booster = (project.boosterStationLocations || []).map(p => { const lng = Number(p.lng), lat = Number(p.lat); return Number.isFinite(lng) && Number.isFinite(lat) ? { lng, lat, isBest: Number(p.isBest) === 1 ? 1 : 0 } : null }).filter(Boolean)
  editBuffer.value = { area, wind, booster, unavailable: [] }
}
function closeRing(coords) { if (!coords || coords.length < 3) return coords; const f = coords[0], l = coords[coords.length - 1]; return f[0] === l[0] && f[1] === l[1] ? coords : [...coords, [f[0], f[1]]] }
function syncDrawToBuffer() {
  if (!editBuffer.value) return
  const draw = mapRef.value?.getDraw?.(); const all = draw?.getAll?.() || { type: 'FeatureCollection', features: [] }
  const currentMode = editMode.value
  if (currentMode === 'area') { const areaF = all.features.find(f => f.properties?.kind === 'area'); if (areaF) editBuffer.value.area = areaF.geometry.coordinates[0].map(c => [c[0], c[1]]); else editBuffer.value.area = [] }
  else if (currentMode === 'wind') { editBuffer.value.wind = all.features.filter(f => f.properties?.kind === 'wind').map(f => ({ lng: f.geometry.coordinates[0], lat: f.geometry.coordinates[1], isReserve: Number(f.properties?.isReserve) === 1 ? 1 : 0 })) }
  else if (currentMode === 'booster') { editBuffer.value.booster = all.features.filter(f => f.properties?.kind === 'booster').map(f => ({ lng: f.geometry.coordinates[0], lat: f.geometry.coordinates[1], isBest: Number(f.properties?.isBest) === 1 ? 1 : 0 })) }
  else if (currentMode === 'unavailable') { editBuffer.value.unavailable = all.features.filter(f => f.properties?.kind === 'unavailable') }
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

function startGeometryEdit(project, mode = 'area') {
  if (!project) return
  if (isDirty.value) {
    ElMessage.warning('当前地图修改尚未保存，请先保存或取消')
    return
  }
  const p = allMapProjects.value.find((item) => String(item.id) === String(project.id)) || project
  popoverProject.value = p
  selectedProject.value = p
  clearHoverState()
  isEditing.value = true
  isDirty.value = false
  hasSaved.value = false
  initEditBuffer(p)
  enterEditMode(mode)
}

function startEdit() { if (!popoverProject.value) return; isEditing.value = true; isDirty.value = false; editMode.value = null; initEditBuffer(popoverProject.value); enterEditMode('area') }
function exitEditMode() {
  if (!isEditing.value) return
  suppressDrawSync = true
  mapRef.value?.clearEditableAreas(); mapRef.value?.stopBoxSelect?.()
  nextTick(() => { suppressDrawSync = false })
  editBuffer.value = null; drawingNewPoint.value = false; isBoxSelecting.value = false; isEditing.value = false; isDirty.value = false; hasSaved.value = false
  editMode.value = null
  if (popoverProject.value) renderSelectedProjectIcons(popoverProject.value)
}
function enterEditMode(mode) {
  if (!popoverProject.value || !editBuffer.value) return
  const draw = mapRef.value?.getDraw?.(); if (!draw) return
  const currentFeatures = draw.getAll().features
  if (!suppressDrawSync && currentFeatures.length > 0) syncDrawToBuffer()
  refreshAllPointsLayers()
  suppressDrawSync = true
  editMode.value = mode; drawingNewPoint.value = false; isBoxSelecting.value = false; mapRef.value.stopBoxSelect?.()
  mapRef.value.clearEditableAreas()
  const buf = editBuffer.value; const features = []
  if (mode === 'area') { if (buf.area && buf.area.length >= 3) features.push({ type: 'Feature', id: 'edit-area', properties: { kind: 'area' }, geometry: { type: 'Polygon', coordinates: [closeRing(buf.area)] } }) }
  else if (mode === 'wind') { buf.wind.forEach((p, i) => features.push({ type: 'Feature', id: `edit-wind-${i}`, properties: { kind: 'wind', index: i, isReserve: p.isReserve }, geometry: { type: 'Point', coordinates: [p.lng, p.lat] } })) }
  else if (mode === 'booster') { buf.booster.forEach((p, i) => features.push({ type: 'Feature', id: `edit-booster-${i}`, properties: { kind: 'booster', index: i, isBest: p.isBest }, geometry: { type: 'Point', coordinates: [p.lng, p.lat] } })) }
  else if (mode === 'unavailable') { buf.unavailable.forEach(f => features.push(f)) }
  try {
    if (features.length) draw.add({ type: 'FeatureCollection', features })
    if (mode === 'area') { const areaFeat = features.find(f => f.properties.kind === 'area'); if (areaFeat) draw.changeMode('vertex_only_direct_select', { featureId: areaFeat.id }); else draw.changeMode('simple_select') }
    else if (mode === 'unavailable') draw.changeMode('draw_polygon')
    else draw.changeMode('simple_select')
  } finally {
    nextTick(() => {
      mapRef.value?.bringDrawPointsToTop?.()
      suppressDrawSync = false
    })
  }
}
function startAddWindPoint() { const draw = mapRef.value?.getDraw?.(); if (!draw) return; draw.changeMode('draw_point'); drawingNewPoint.value = true; ElMessage.info('点击地图添加风机，点击"标记备选"可切换备选状态') }
function toggleAddPoint() {
  const draw = mapRef.value?.getDraw?.(); if (!draw) return
  if (drawingNewPoint.value) { draw.changeMode('simple_select'); drawingNewPoint.value = false }
  else { draw.changeMode('draw_point'); drawingNewPoint.value = true; ElMessage.info('点击地图添加升压站') }
}
function startBoxSelection() {
  if (editMode.value !== 'wind' && editMode.value !== 'booster') { ElMessage.warning('仅支持在编辑风机/升压站时框选'); return }
  isBoxSelecting.value = true; mapRef.value.startBoxSelect?.(); ElMessage.info('请在地图上拖拽进行框选')
}
function handleBoxSelect(featureIds) { if (!featureIds?.length) return; const draw = mapRef.value?.getDraw?.(); if (draw) { draw.changeMode('simple_select', { featureIds }); isBoxSelecting.value = false } }
function markReserve(isReserve) {
  const draw = mapRef.value?.getDraw?.(); if (!draw) return
  const ids = draw.getSelectedIds(); if (!ids.length) { ElMessage.warning('请先选中风机点位'); return }
  let count = 0
  ids.forEach(id => {
    const feat = draw.get(id)
    if (!feat || feat.properties?.kind !== 'wind') return
    draw.setFeatureProperty(id, 'isReserve', isReserve ? 1 : 0)
    count++
  })
  if (count === 0) return
  syncDrawToBuffer()
  enterEditMode('wind')
  isDirty.value = true
  ElMessage.success(`已${isReserve ? '标记' : '取消'}备选 ${count} 个风机`)
}
function deleteSelectedPoints() {
  const draw = mapRef.value?.getDraw?.(); if (!draw) return
  const ids = draw.getSelectedIds(); if (!ids.length) { ElMessage.warning('请先选中要删除的点'); return }
  draw.delete(ids); syncDrawToBuffer(); enterEditMode(editMode.value); isDirty.value = true
  ElMessage.success(`已删除 ${ids.length} 个点`)
}
function refreshAllPointsLayers() {
  if (!mapRef.value || !editBuffer.value || !popoverProject.value) return
  const map = mapRef.value.getMap?.(); if (!map) return
  const pid = popoverProject.value.id
  if (editBuffer.value.area && editBuffer.value.area.length >= 3) {
    const areaFeature = { type: 'Feature', properties: { projectId: pid, projectCode: popoverProject.value.projectCode, projectName: popoverProject.value.projectName, itemType: popoverProject.value.itemType }, geometry: { type: 'Polygon', coordinates: [closeRing(editBuffer.value.area)] } }
    const layerId = `project-area-${pid}`; const style = AREA_STYLE[popoverProject.value.itemType] || AREA_STYLE.FD
    mapRef.value.addPolygon({ id: layerId, geojson: areaFeature, color: style.highlight.color, opacity: style.highlight.opacity, outlineColor: style.highlight.outlineColor, outlineWidth: style.highlight.outlineWidth })
  }
  const windNormal = [], windReserve = []
  for (const p of editBuffer.value.wind) {
    const f = { type: 'Feature', properties: { projectId: pid }, geometry: { type: 'Point', coordinates: [p.lng, p.lat] } }
    ;(p.isReserve === 1 ? windReserve : windNormal).push(f)
  }
  const boosterFeatures = []
  for (const p of editBuffer.value.booster) { boosterFeatures.push({ type: 'Feature', properties: { projectId: pid }, geometry: { type: 'Point', coordinates: [p.lng, p.lat] } }) }
  if (map.getSource('project-wind-all')) map.getSource('project-wind-all').setData({ type: 'FeatureCollection', features: windNormal })
  if (map.getSource('project-wind-bx-all')) map.getSource('project-wind-bx-all').setData({ type: 'FeatureCollection', features: windReserve })
  if (map.getSource('project-booster-all')) map.getSource('project-booster-all').setData({ type: 'FeatureCollection', features: boosterFeatures })
}
async function saveEdit() {
  if (!editBuffer.value || !popoverProject.value || saving.value) return
  syncDrawToBuffer(); const project = popoverProject.value; const pid = project.id
  if (editBuffer.value.area.length < 3) { ElMessage.warning('场区至少需要 3 个有效坐标点'); return }
  const fallbackRegionCode = project.coordinate?.[0]?.regionCode ?? null
  const coordinate = editBuffer.value.area.map(([lng, lat]) => ({ regionCode: fallbackRegionCode, longitude: String(lng), latitude: String(lat) }))
  const windTurbinePoints = editBuffer.value.wind.map(p => ({ longitude: p.lng, latitude: p.lat, isReserve: p.isReserve }))
  const boosterStationLocations = editBuffer.value.booster.map(p => ({ lng: p.lng, lat: p.lat, isBest: p.isBest }))
  const payload = { coordinate, windTurbinePoints, boosterStationLocations, accessSubstationName: project.accessSubstationName ?? null, accessSubstationPoints: project.accessSubstationPoints ?? null, address: project.address ?? null, capitalFinancialRate: project.capitalFinancialRate ?? null, city: project.city ?? null, currentProjectCapacity: project.currentProjectCapacity ?? null, district: project.district ?? null, fileCollection: project.fileCollection ?? [], itemType: project.itemType ?? null, notes: project.notes ?? null, projectCode: project.projectCode ?? null, projectName: project.projectName ?? null, projectStage: project.projectStage ?? null, province: project.province ?? null, sendOutType: project.sendOutType ?? null }
  try {
    saving.value = true
    const res = await configApi.upDataLayer(pid, payload)
    if (res?.code === 200) {
      ElMessage.success('保存成功'); hasSaved.value = true; isDirty.value = false
      const target = allMapProjects.value.find(p => p.id === pid)
      if (target) { target.coordinate = coordinate; target.windTurbinePoints = windTurbinePoints; target.boosterStationLocations = boosterStationLocations }
      if (popoverProject.value) Object.assign(popoverProject.value, { coordinate, windTurbinePoints, boosterStationLocations })
      if (selectedProject.value && String(selectedProject.value.id) === String(pid)) {
        Object.assign(selectedProject.value, { coordinate, windTurbinePoints, boosterStationLocations })
      }
      await renderProjectsByStage('area')
      if (target) { popoverProject.value = target; if (selectedProject.value && String(selectedProject.value.id) === String(pid)) selectedProject.value = target; initEditBuffer(target); editMode.value = null }
      fetchOverviewStats(); fetchCityStats()
    } else ElMessage.error(res?.msg || '保存失败')
  } catch (err) { ElMessage.error(err?.message || '保存失败') }
  finally { saving.value = false }
}
async function handleRecalculate() {
  if (!popoverProject.value || !hasSaved.value) return
  try {
    recalculating.value = true
    const res = await configApi.updateCalculateStatus(popoverProject.value.id, { isReturnProject: 1 })
    if (res?.code === 200) { ElMessage.success('重新计算发起成功'); hasSaved.value = false; fetchMapProjects(); fetchProjectList() }
    else ElMessage.error(res?.msg || '重新计算失败')
  } catch (err) { ElMessage.error(err?.message || '重新计算请求异常') }
  finally { recalculating.value = false }
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

const { isAreaView, syncByZoom, bindZoomListener, unbindZoomListener } = useZoomThresholdSwitch({
  mapRef,
  onEnter: () => { hideCityStats(); renderProjectsByStage('area') },
  onExit: () => {
    clearPopover()
    renderProjectsByStage('overview')
    if (cityStats.value.length) renderCityStats()
    const map = mapRef.value?.getMap?.()
    if (map) {
      try { map.setProjection({ type: 'globe' }) } catch (e) { try { map.setProjection('globe') } catch (e2) {} }
    }
  },
})

async function onMapReady() {
  await Promise.allSettled([loadShaanxiBoundary(), loadCityGeoJSON()])
  mapReady.value = true

  if (showCreateProject.value) nextTick(() => startCreateDrawing())
  const map = mapRef.value.getMap()

  // ★ 1. 使用平面投影（Mercator），这样底边不会被地球弧度裁切
  try { map.setProjection({ type: 'mercator' }) } catch (e) {}

  try {
    map.dragRotate.enable()
    map.touchPitch.enable()
    map.setMaxPitch(60)
    if (map.getPitch() !== 0 || map.getBearing() !== 0) {
      map.jumpTo({ pitch: 0, bearing: 0 })
    }
  } catch (e) {
    console.warn('[site-map] 初始化俯仰设置失败:', e)
  }

  // ★ 2. 先正常定位
  map.fitBounds(SHAANXI_FIT_BOUNDS, {
    padding: { top: 100, bottom: 100, left: 180, right: 180 }, // 左边留出大卡片的位置
    pitch: 0,
    bearing: 0,
    duration: 0,
  })

  // ★ 3. 核心：算完之后，强行把视野拉远 1.0 级！（让镜头退后，看到更大范围）
  const fitZoom = map.getZoom()
  map.setZoom(fitZoom)
  map.setMaxBounds([[98.0, 28.0], [120.0, 43.0]])
  // ★ 4. 解除缩小限制，允许用户自己继续往下滚轮看更大范围
  map.setMinZoom(5.9) 

  // ================= 下面是原有逻辑 =================
  map.on('click', handleMapBlankClick)
  map.on('click', handleCityFillClick)
  if (isAreaView.value) { hideCityStats(); renderProjectsByStage('area') } else await renderCityStats()
  map.on('zoom', syncMaskVisibility); map.on('move', syncMaskVisibility); map.on('style.load', ensureShaanxiMask)
  await ensureShaanxiMask()

  await ensureProvinceBoundaryLine()
  await ensureCityBoundaryLine()

  bindZoomListener()
  try {
    whlnPlugin = attachSxLayers(map, { initialVisibleIds: layerVisibleIds.value.filter((id) => WHLN_LAYER_IDS.includes(id)) })
    whlnPlugin.subscribe?.((ids) => { layerVisibleIds.value = [...layerVisibleIds.value.filter((id) => !WHLN_LAYER_IDS.includes(id)), ...ids]; emits('featureVisibleChange', ids); syncMaskVisibility() })
  } catch (err) { console.warn('[whln] 图层控制挂载失败:', err) }
    // ★ 初始化 + 监听 whln 对 base imagery 的 visibility 切换
  syncLowLevelBase()
  map.on('styledata', syncLowLevelBase)
}

onMounted(() => {
  void loadShaanxiBoundary()
  void loadCityGeoJSON()
  fetchStageList(); fetchProjectList(); fetchMapProjects(); fetchOverviewStats(); fetchCityStats()
  window.addEventListener('resize', handleWindowResize)   // ★ 新增
})
onUnmounted(() => {
  clearHoverHideTimer()
  removeRoadLineLayers()
  whlnPlugin?.destroy?.(); whlnPlugin = null
  unbindZoomListener()
  window.removeEventListener('resize', handleWindowResize)   // ★ 新增
  const map = mapRef.value?.getMap?.()
  if (map) {
    map.off('styledata', syncLowLevelBase)
    map.off('click', handleMapBlankClick)
    map.off('click', handleCityFillClick)
    map.off('zoom', syncMaskVisibility)
    map.off('move', syncMaskVisibility)
    map.off('style.load', ensureShaanxiMask)
  }
})

function handleReportConfirm(payload) {
  const option = payload?.option || payload
  const project = payload?.project || selectedProject.value
  if (project) selectedProject.value = { ...selectedProject.value, ...project }
  showGenerateModal.value = false

  if (reportKeyToWizardMode[option?.key] !== undefined) {
    wizardMode.value = reportKeyToWizardMode[option.key]
    wizardVisible.value = true
    showDetailPanel.value = false
  }
}

function closeWizard() {
  wizardVisible.value = false
  wizardTitleLabel.value = ''
  wizardMaxStep.value = 2
  wizardReportSubTab.value = ''
  showDetailPanel.value = true
}

function handleWizardSaveDraft(payload) {
  console.log('[site-map][wizard] save-draft:', payload)
}

function handleWizardSubmit(payload) {
  const subTab = wizardReportSubTab.value
  const label = wizardTitleLabel.value || '报告'
  console.log(`[site-map][wizard] submit subTab=${subTab}`, payload)
  ElMessage.success(`${label}提交成功（演示流程，接口待接）`)
  wizardVisible.value = false
  wizardTitleLabel.value = ''
  wizardMaxStep.value = 2
  wizardReportSubTab.value = ''
}

function handleGenerateRequest(payload) {
  showGenerateModal.value = false
}
</script>



<style scoped>
.site-map-page { position: relative; width: 100%; height: 100%; overflow: hidden; background: #f5f7fa; }
.map-layer { position: absolute; inset: 0; z-index: 1; overflow: hidden; }
.config-fullpage {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background:
    radial-gradient(ellipse at 10% 0%, rgba(255, 220, 232, 0.42), transparent 42%),
    radial-gradient(ellipse at 96% 100%, rgba(176, 210, 250, 0.48), transparent 43%),
    linear-gradient(122deg, #f1f4f9 0%, #e8f0fa 100%);
}
.config-header {
  display: flex;
  flex: 0 0 52px;
  align-items: center;
  gap: 8px;
  height: 52px;
  padding: 0 14px;
  border-bottom: 0;
}
.exit-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  color: #667383;
  font-size: 16px;
  background: transparent;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
}
.exit-button:hover { color: #1677ff; background: rgba(255, 255, 255, 0.65); }
.config-header-title { color: #273443; font-size: 14px; font-weight: 600; }
.config-fullpage .config-layout {
  display: grid;
  flex: 1 1 auto;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 12px;
  min-width: 0;
  min-height: 0;
  padding: 0 10px 10px;
  box-sizing: border-box;
}
.config-fullpage .config-layout > * { min-width: 0; min-height: 0; }
.view-toolbar { position: absolute; top: 12px; left: 12px; right: 12px; z-index: 5; display: flex; align-items: center; justify-content: space-between; gap: 8px; pointer-events: none; }
.view-toolbar > * { pointer-events: auto; }
.view-tabs { display: flex; height: 36px; padding: 3px; gap: 2px; background: #fff; border-radius: 6px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); flex-shrink: 0; }
.view-tab { display: flex; align-items: center; gap: 5px; height: 100%; padding: 0 12px; color: #444; font-size: 12px; background: transparent; border: 0; border-radius: 4px; cursor: pointer; }
.view-tab:hover { color: #1677ff; }
.view-tab.active { color: #1677ff; background: #e6f2ff; }
.config-button { display: flex; align-items: center; gap: 5px; height: 36px; padding: 0 12px; color: #333; font-size: 12px; background: #fff; border: 0; border-radius: 6px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); cursor: pointer; flex-shrink: 0; }
.config-button:hover { color: #1677ff; }
.map-view { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
.map-view > * { pointer-events: auto; }
.map-summary { position: absolute; top: 60px; left: 12px; z-index: 2; width: 175px; padding: 12px; color: #303133; background: rgba(255,255,255,0.94); border-radius: 6px; box-shadow: 0 2px 10px rgba(0,0,0,0.12); }
.summary-title { display: flex; justify-content: space-between; padding-bottom: 9px; margin-bottom: 7px; font-size: 12px; font-weight: 600; border-bottom: 1px solid #eee; }
.summary-location, .summary-row { display: flex; align-items: center; min-height: 31px; font-size: 11px; }
.summary-location { gap: 4px; }
.summary-location strong, .summary-row b { margin-left: auto; font-size: 11px; font-weight: 500; }
.summary-location small, .summary-row small { width: 46px; color: #999; font-size: 9px; text-align: right; }
.summary-row { border-top: 1px solid #f0f0f0; }
.dot { width: 6px; height: 6px; margin-right: 6px; border-radius: 50%; }
.dot.wind { background: #4f9cff; }
.dot.solar { background: #f0c83e; }
.search-panel { position: absolute; top: 12px; right: 12px; z-index: 6; display: flex; align-items: center; gap: 8px; height: 36px; padding: 0 12px; background: #fff; border-radius: 6px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
.edit-toolbar { position: absolute; top: 12px; right: 12px; z-index: 6; display: flex; align-items: center; flex-wrap: wrap; gap: 4px; padding: 4px 8px; height: 36px; background: #fff; border-radius: 6px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: calc(100vw - 24px); }
.edit-tool-button { display: flex; align-items: center; gap: 4px; padding: 4px 8px; color: #444; font-size: 12px; background: transparent; border: 0; border-radius: 4px; cursor: pointer; white-space: nowrap; }
.edit-tool-button:hover { color: #1677ff; background: #f0f7ff; }
.edit-tool-button.active { color: #1677ff; background: #e6f2ff; }
.edit-tool-button.save { color: #1677ff; font-weight: 500; }
.edit-tool-button.recalculate { color: #087443; border: 1px solid #6ce9a6; background: #ecfdf3; }
.edit-tool-button.danger { color: #f56c6c; }
.edit-tool-button.danger:hover { color: #f56c6c; background: #fef0f0; }
.edit-tool-button:disabled { opacity: 0.6; cursor: not-allowed; }
.edit-divider { width: 1px; height: 18px; margin: 0 4px; background: #e5e7eb; }

.expand-button { position: absolute; top: 50%; right: 0; z-index: 3; width: 25px; height: 54px; color: #fff; background: rgba(30,30,30,0.4); border: 0; border-radius: 5px 0 0 5px; cursor: pointer; transition: right 0.25s ease, background 0.15s ease; }
.expand-button:hover { background: rgba(30, 30, 30, 0.65); }
.project-list-view { position: absolute; inset: 0; z-index: 4; height: 100%; padding: 60px 20px 12px; overflow: auto; box-sizing: border-box; background: #fff; }
.list-heading { display: flex; align-items: center; justify-content: space-between; }
.list-title { display: flex; align-items: center; gap: 6px; color: #333; font-size: 14px; font-weight: 600; }
.project-table { width: 100%; margin-top: 2px; }
.project-table :deep(.el-table__row) { height: 56px; }
.project-table :deep(.el-table__cell) { padding: 10px 0; }
.project-table :deep(.el-table__header-wrapper th) { background: #f7f8fa; color: #606266; font-weight: 500; }
.project-table :deep(.el-table__body tr.el-table__row--striped td) { background: #fafbfc; }
.project-table :deep(.el-table__body tr:hover > td) { background: #f5f8ff; }
.status-text.passed { color: #24b26b; }
.status-text.pending { color: #e6a23c; }
.status-text.rejected { color: #f56c6c; }
.pagination-row { display: flex; align-items: center; justify-content: flex-end; gap: 18px; padding-top: 14px; color: #666; font-size: 14px; }
.row-actions { display: flex; flex-wrap: wrap; gap: 4px 8px; }
.row-actions .el-button { margin: 0; padding: 0; }
.rate-cell { display: inline-flex; flex-direction: column; line-height: 1.2; vertical-align: middle; margin-right: 8px; }
.rate-line { font-size: 11px; white-space: nowrap; }
.rate-value { display: inline-block; vertical-align: middle; }
.create-project-fullpage { position: absolute; inset: 0; z-index: 3; display: flex; justify-content: flex-end; pointer-events: none; }
.cp-map-overlay { position: relative; flex: 1; pointer-events: none; }
.cp-search-box { position: absolute; top: 18px; left: 18px; width: 300px; pointer-events: auto; background: #fff; border-radius: 4px; box-shadow: 0 2px 10px rgba(0,0,0,0.12); }
.cp-search-icon { cursor: pointer; color: #909399; }
.cp-draw-actions { position: absolute; top: 18px; right: 18px; display: flex; gap: 8px; pointer-events: auto; }
:deep(.create-project-form) { pointer-events: auto; }
:deep(.maplibregl-ctrl-bottom-right) { display: none; }
:deep(.maplibregl-ctrl-top-right) { display: none; }

.map-line-tip {
  position: absolute;
  z-index: 20;
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
.map-view > .map-line-tip { pointer-events: none; }

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

.wizard-overlay {
  position: fixed;
  top: 65px;
  right: 0;
  bottom: 0;
  z-index: 2000;
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.1);
}
/* ★ 视图控件：左下角，抬到 LayerChipPanel 上方 */
:deep(.maplibregl-ctrl-bottom-left) {
  display: block;
  left: 12px;
  bottom: 70px;   /* LayerChipPanel 高度 + 间距，实际可按需调 */
  z-index: 22;     /* 高于 view-toolbar(5) / map-summary(2)，不影响 Drawer */
}
@media (max-width: 1100px) {
  .project-list-view { padding-right: 10px; padding-left: 10px; }
  .create-project-fullpage { flex-direction: column; }
}
@media (max-width: 760px) {
  .config-fullpage { overflow-y: auto; }
  .config-header { position: sticky; top: 0; z-index: 2; background: rgba(241, 245, 250, 0.92); backdrop-filter: blur(10px); }
  .config-fullpage .config-layout {
    display: grid;
    flex: 0 0 auto;
    grid-template-columns: minmax(0, 1fr);
    grid-auto-rows: minmax(540px, auto);
    padding: 0 8px 8px;
  }
}
.project-name-link {
  color: #1677ff;
  cursor: pointer;
}
.project-name-link:hover {
  text-decoration: underline;
}
</style>