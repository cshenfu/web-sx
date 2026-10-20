<template>
  <div class="site-map-page">
    <!-- 选址配置：全屏页（仅智能选址开启） -->
    <section v-if="showConfigPage && showConfig" class="config-fullpage">
      <div class="config-header">
        <button class="exit-button" @click="showConfig = false">
          <el-icon><ArrowLeft /></el-icon>
          退出
        </button>
        <span class="config-header-title">选址配置</span>
      </div>
      <div class="config-layout">
        <ConfigForm />
        <TaskPanel />
      </div>
    </section>

    <!-- 常驻地图 -->
    <div class="map-layer">
      <MapGL
        ref="mapRef"
        :style="satelliteStyle"
        @ready="onMapReady"
        @draw-update="onDrawChange"
        @draw-create="onDrawChange"
        @draw-delete="onDrawChange"
        @box-select="handleBoxSelect"
      />
    </div>

    <!-- 默认视图 -->
    <template v-if="!showConfig && !showCreateProject">
      <!-- 顶部两颗浮动卡片 -->
      <div v-if="!showVerifyPanel && !showDetailPanel" class="view-toolbar">
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

        <slot name="toolbar-extra" />

        <button
          v-if="showConfigPage && !isAreaView && !showProjectDrawer && !selectedProject"
          class="config-button"
          @click="showConfig = true"
        >
          <el-icon><Setting /></el-icon>
          选址配置
        </button>
      </div>

      <section v-if="viewMode === 'map'" class="map-view">
        <!-- 左上：看板 -->
        <div v-if="!selectedProject" class="map-summary">
          <div class="summary-title">
            <span>{{ summaryTitle }}</span>
            <el-icon><Fold /></el-icon>
          </div>
          <div class="summary-location">
            <el-icon><LocationFilled /></el-icon>
            <span>陕西省</span>
            <strong>{{ overviewStats.totalCapacity }}/{{ overviewStats.totalCount }}</strong>
            <small>总容量/数量</small>
          </div>
          <div class="summary-row">
            <span><i class="dot wind" />风电项目</span>
            <b>{{ overviewStats.windCapacity }}/{{ overviewStats.windCount }}</b>
            <small>容量/数量</small>
          </div>
          <div class="summary-row">
            <span><i class="dot solar" />光伏项目</span>
            <b>{{ overviewStats.solarCapacity }}/{{ overviewStats.solarCount }}</b>
            <small>容量/数量</small>
          </div>
        </div>

        <!-- 右上：搜索栏 -->
        <div
          v-if="!selectedProject && (isAreaView || showProjectDrawer) && !showVerifyPanel && !showDetailPanel"
          class="search-panel"
        >
          <el-select
            v-model="filters.itemType"
            placeholder="项目类型"
            size="small"
            clearable
            style="width: 110px"
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
            style="width: 110px"
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
            v-model="filters.isVerified"
            placeholder="核查状态"
            size="small"
            clearable
            style="width: 110px"
            @change="handleSearch"
          >
            <el-option label="未核查" value="0" />
            <el-option label="已核查" value="1" />
          </el-select>
          <el-input
            v-model="filters.projectName"
            placeholder="项目名称"
            size="small"
            clearable
            style="width: 140px"
            @keyup.enter="handleSearch"
          >
            <template #suffix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <!-- 右上：编辑工具栏（两种状态：未进入编辑 = 只显示「编辑」；已进入编辑 = 完整工具栏） -->
        <div v-if="selectedProject && !showVerifyPanel && !showDetailPanel" class="edit-toolbar">
          <!-- 未进入编辑 -->
          <template v-if="!isEditing">
            <button class="edit-tool-button" @click="startEdit">
              <el-icon><Edit /></el-icon>
              编辑
            </button>
          </template>

          <!-- 已进入编辑 -->
          <template v-else>
            <button
              v-for="item in editTools"
              :key="item.key"
              class="edit-tool-button"
              :class="{ active: editMode === item.key }"
              @click="enterEditMode(item.key)"
            >
              <el-icon><component :is="item.icon" /></el-icon>
              {{ item.label }}
            </button>

            <template v-if="editMode === 'wind' || editMode === 'booster'">
              <span class="edit-divider" />
              <template v-if="editMode === 'wind'">
                <button class="edit-tool-button" :class="{ active: drawingNewPoint }" @click="startAddWindPoint">
                  添加风机
                </button>
                <button class="edit-tool-button" :class="{ active: isBoxSelecting }" @click="startBoxSelection">
                  框选
                </button>
                <button class="edit-tool-button" @click="deleteSelectedPoints">
                  删除
                </button>
                <button class="edit-tool-button" @click="markReserve(true)">
                  标记备选
                </button>
                <button class="edit-tool-button" @click="markReserve(false)">
                  取消备选
                </button>
              </template>
              <template v-else>
                <button class="edit-tool-button" :class="{ active: drawingNewPoint }" @click="toggleAddPoint">
                  {{ drawingNewPoint ? '退出新增' : '新增点' }}
                </button>
                <button class="edit-tool-button danger" @click="deleteSelectedPoints">
                  删除选中
                </button>
              </template>
            </template>

            <!-- 保存 / 取消：仅当有未保存修改时显示 -->
            <template v-if="isDirty">
              <span class="edit-divider" />
              <button class="edit-tool-button save" :disabled="saving" @click="saveEdit">
                {{ saving ? '保存中...' : '保存' }}
              </button>
              <button class="edit-tool-button" :disabled="saving" @click="cancelEdit">
                取消
              </button>
            </template>

            <!-- 重新计算：保存成功后显示（isDirty 为 false 时） -->
            <template v-if="hasSaved && !isDirty">
              <span class="edit-divider" />
              <button
                class="edit-tool-button recalculate"
                :disabled="recalculating"
                @click="handleRecalculate"
              >
                {{ recalculating ? '计算中...' : '重新计算' }}
              </button>
            </template>
          </template>
        </div>

        <!-- 详情卡 -->
        <div
          v-if="selectedProject && detailCardPos.visible"
          class="detail-card"
          :style="{ left: detailCardPos.x + 'px', top: detailCardPos.y + 'px' }"
        >
          <div class="detail-title">{{ selectedProject.projectName }}</div>
          <div class="detail-row">
            <span class="detail-label">装机容量</span>
            <span class="detail-value">{{ selectedProject.currentProjectCapacity ?? '-' }} MW</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">风机</span>
            <span class="detail-value">
              {{ windCount }} 台
              <span v-if="altCount > 0" class="detail-sub">（备选 {{ altCount }} 台）</span>
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">推荐机型</span>
            <span class="detail-value">{{ selectedProject.recommendedModel || '-' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">资本金 IRR</span>
            <span class="detail-value">
              {{ selectedProject.capitalFinancialRate != null ? selectedProject.capitalFinancialRate + '%' : '-' }}
            </span>
          </div>

          <slot name="detail-card-extra" :project="selectedProject" />

          <div class="detail-actions">
            <button
              v-for="action in cardActions"
              :key="action"
              class="detail-action"
              :class="{ danger: action === 'delete' }"
              @click="executeAction(action, selectedProject)"
            >
              {{ ACTION_LABELS[action] || action }}
            </button>
          </div>
        </div>

        <slot name="map-overlay" :projects="projectList" :selected="selectedProject" />

        <!-- 展开/收起项目列表 toggle -->
        <button
          v-if="!showVerifyPanel && !showDetailPanel"
          class="expand-button"
          :style="expandButtonStyle"
          :title="showProjectDrawer ? '收起项目列表' : '打开项目列表'"
          @click="showProjectDrawer = !showProjectDrawer"
        >
          <el-icon>
            <ArrowLeft v-if="showProjectDrawer" />
            <ArrowRight v-else />
          </el-icon>
        </button>

        <!-- 图层 chip 面板 -->
        <LayerChipPanel
          :visible-ids="layerVisibleIds"
          :inputs="layerInputs"
          @toggle="onLayerToggle"
          @input-change="onLayerInputChange"
        />
      </section>

      <section v-else class="project-list-view">
        <div class="list-heading">
          <div class="list-title">
            <el-icon><List /></el-icon>
            项目列表
          </div>
          <el-button type="primary" size="small" @click="openCreateProject">
            <el-icon><Plus /></el-icon>
            添加项目
          </el-button>
        </div>

        <SearchBar
          :filters="filters"
          :stage-options="stageOptions"
          @search="handleSearch"
          @reset="handleReset"
        />

        <el-table v-loading="listLoading" :data="projectList" size="small" stripe class="project-table">
          <el-table-column label="项目编号" min-width="130">
            <template #default="{ row }">{{ row.projectCode || '-' }}</template>
          </el-table-column>

          <el-table-column label="项目名称" min-width="220" show-overflow-tooltip>
            <template #default="{ row }">{{ row.projectName || '-' }}</template>
          </el-table-column>

          <el-table-column label="项目区域" min-width="180" show-overflow-tooltip>
            <template #default="{ row }">{{ formatRegion(row) }}</template>
          </el-table-column>

          <el-table-column label="装机容量MW" width="120" sortable>
            <template #default="{ row }">{{ row.currentProjectCapacity ?? '-' }}</template>
          </el-table-column>

          <el-table-column label="资本金财务内部收益率%" width="180" sortable>
            <template #default="{ row }">
              <span class="rate-cell">
                <span class="rate-line">资本金财务</span>
                <span class="rate-line">内部收益率%</span>
              </span>
              <span class="rate-value">{{ formatRate(row.capitalFinancialRate) }}</span>
            </template>
          </el-table-column>

          <el-table-column label="阶段" width="110">
            <template #default="{ row }">{{ stageMap[row.projectStage] || '-' }}</template>
          </el-table-column>

          <el-table-column
            v-if="statusColumnConfig"
            :label="statusColumnConfig.label"
            width="110"
          >
            <template #default="{ row }">
              <span
                v-if="statusColumnConfig.getText(row)"
                class="status-text"
                :class="statusColumnConfig.getClass(row)"
              >
                {{ statusColumnConfig.getText(row) }}
              </span>
            </template>
          </el-table-column>

          <el-table-column label="备注" min-width="100" show-overflow-tooltip>
            <template #default="{ row }">{{ row.notes || '-' }}</template>
          </el-table-column>

          <el-table-column label="所属" min-width="120" show-overflow-tooltip>
            <template #default="{ row }">{{ row.managerCompany || '-' }}</template>
          </el-table-column>

          <el-table-column label="负责人" width="90">
            <template #default="{ row }">{{ row.managerName || '-' }}</template>
          </el-table-column>

          <el-table-column label="创建时间" width="170">
            <template #default="{ row }">{{ row.createTime || '-' }}</template>
          </el-table-column>

          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <div class="row-actions">
                <el-button
                  v-for="action in rowActions"
                  :key="action"
                  link
                  :type="action === 'delete' ? 'danger' : 'primary'"
                  size="small"
                  @click="executeAction(action, row)"
                >
                  {{ ACTION_LABELS[action] || action }}
                </el-button>
              </div>
            </template>
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

    <!-- 创建项目 -->
    <section v-if="showCreateProject" class="create-project-fullpage">
      <div class="cp-map-overlay">
        <div class="cp-search-box">
          <el-input
            v-model="placeSearchKeyword"
            placeholder="请输入行政区划地名，市/县区/乡镇/村"
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

    <!-- 核查面板 -->
    <VerifyPanel
      v-if="showVerifyPanelFlag"
      :visible="showVerifyPanel"
      :project="selectedProject"
      @close="showVerifyPanel = false"
      @save="onVerifySaved"
    />

    <!-- 项目抽屉 -->
    <ProjectDrawer
      :visible="showProjectDrawer"
      :list="projectList"
      :total="pagination.total"
      :page="pagination.page"
      :page-size="pagination.pageSize"
      :selected-id="selectedProject?.id ?? null"
      :loading="listLoading"
      :row-actions="rowActions"
      @close="showProjectDrawer = false"
      @select="focusProject"
      @action="handleDrawerAction"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
      @sort-change="handleDrawerSortChange"
    />

    <ProjectDetailPanel
      :visible="showDetailPanel"
      :project="selectedProject"
      :stage="stage"
      :initial-tab="detailPanelTab"
      @close="showDetailPanel = false"
      @action="onDetailPanelAction"
    />

    <!-- 全屏生成报告面板 -->
    <GenerateReportPanel
      :visible="showGeneratePanel"
      :project="generatePanelProject"
      :action-key="generatePanelActionKey"
      :sub-code="generatePanelSubCode"
      @close="showGeneratePanel = false"
      @generated="onReportGenerated"
    />

    <!-- 分配负责人弹窗 -->
    <AssignDialog
      v-model="showAssignDialog"
      :project="assignTargetProject"
      @success="onAssignSuccess"
    />

    <slot name="page-extra" />
  </div>
</template>

<script setup>
import {
  computed, nextTick, onMounted, onUnmounted, reactive, ref, watch,
} from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft, ArrowRight, CircleCheck, Edit, Files, Fold, InfoFilled, List, Location,
  LocationFilled, MapLocation, Plus, Search, Setting,
} from '@element-plus/icons-vue'
import MapGL from '@/components/MapGL.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import CreateProjectForm from './Createprojectform.vue'
import ConfigForm from './ConfigForm.vue'
import TaskPanel from './TaskPanel.vue'
import VerifyPanel from './VerifyPanel.vue'
import ProjectDrawer from './ProjectDrawer.vue'
import ProjectDetailPanel from './ProjectDetailPanel.vue'
import AssignDialog from './AssignDialog.vue'
import GenerateReportPanel from './GenerateReportPanel.vue'
import { satelliteStyle } from '../js/mapConfig'
import { useZoomThresholdSwitch } from '../js/useZoomThresholdSwitch'
import { searchPlaceName } from '../js/useTiandituGeocode'
import * as api from '@/api/modules/project'
import * as configApi from '@/api/modules/selectConfig'

import fengjiIcon from '@/assets/img/mapIcon/fengji.png'
import fengjiBxIcon from '@/assets/img/mapIcon/fengji-bx.png'
import shengyazhanIcon from '@/assets/img/mapIcon/shengyazhan.png'

import LayerChipPanel from '@/components/site-map/LayerChipPanel.vue'
import { WHLN_LAYER_IDS, DEFAULT_VISIBLE } from '@/components/site-map/layerPanelConfig'
import { attachLayerControl } from '@whln/layer-control'

// =================== props ===================
const props = defineProps({
  stage: { type: String, default: '' },
  summaryTitle: { type: String, default: '项目通道概况' },
  cardActions: { type: Array, default: () => [] },
  statusColumn: {
    type: String,
    default: 'verify',
    validator: (v) => ['verify', 'approval', 'none'].includes(v),
  },
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

// =================== 常量 ===================
const ICON_FENGJI = 'icon-fengji'
const ICON_FENGJI_BX = 'icon-fengji-bx'
const ICON_SHENGYAZHAN = 'icon-shengyazhan'
const ICON_SIZE_WIND = 0.18
const ICON_SIZE_BOOSTER = 0.08

const CITY_LAYER_ID = 'site-city-stats'
const PROVINCE_CODE = '610000'
const CITY_GEOJSON_URL = 'https://geo.datav.aliyun.com/areas_v3/bound/610000_full.json'

const PROJECT_ICON_LAYER_MAP = {
  'wind-farm': ['project-wind-all', 'project-wind-bx-all'],
  booster: ['project-booster-all'],
}

const SELECTED_ICON_LAYER_IDS = ['project-wind-all', 'project-wind-bx-all', 'project-booster-all']

// 抽屉宽度与右边距，需与 ProjectDrawer.vue 的样式保持一致
const DRAWER_WIDTH = 460
const DRAWER_GAP = 12

const STAGE_ACTIONS = {
  PRELIMINARY_SELECTION: ['assign', 'verify', 'edit', 'delete'],
  PROJECT_RESERVE:       ['material', 'edit', 'assign', 'delete'],
  PROJECT_INITIATION:    ['establishMeeting', 'researchMaterial', 'edit', 'assign', 'delete'],
  FEASIBILITY_REVIEW:    ['researchReview', 'investMaterial', 'edit', 'assign', 'delete'],
  INVESTMENT_DECISION:   ['investMeeting', 'edit', 'assign', 'delete'],
}

const ACTION_LABELS = {
  material: '立项材料', researchMaterial: '可研材料', investMaterial: '投决材料',
  establishMeeting: '立项上会', researchReview: '可研审查', investMeeting: '投决上会',
  assign: '分配', verify: '核查', edit: '编辑', delete: '删除',
}

const CITY_OPTIONS = [
  { label: '西安市', value: '610100' }, { label: '铜川市', value: '610200' },
  { label: '宝鸡市', value: '610300' }, { label: '咸阳市', value: '610400' },
  { label: '渭南市', value: '610500' }, { label: '延安市', value: '610600' },
  { label: '汉中市', value: '610700' }, { label: '榆林市', value: '610800' },
  { label: '安康市', value: '610900' }, { label: '商洛市', value: '611000' },
]

const CITY_LABEL_CENTER = {
  '610100': [108.945, 34.26], '610200': [108.980, 35.10], '610300': [107.140, 34.36],
  '610400': [108.180, 34.52], '610500': [109.510, 34.83], '610600': [109.100, 36.58],
  '610700': [107.030, 33.06], '610800': [109.730, 38.28], '610900': [109.030, 32.68],
  '611000': [109.940, 33.86],
}

const STAGE_THEMES = {
  DEFAULT: { cityFillStops: ['interpolate', ['linear'], ['get', 'totalCapacity'], 0, '#e9d5ff', 30, '#c084fc', 80, '#a855f7', 150, '#7c3aed'], cityOutline: '#f0abfc' },
  PROJECT_RESERVE: { cityFillStops: ['interpolate', ['linear'], ['get', 'totalCapacity'], 0, '#bfdbfe', 30, '#60a5fa', 80, '#3b82f6', 150, '#1d4ed8'], cityOutline: '#93c5fd' },
  PROJECT_INITIATION: { cityFillStops: ['interpolate', ['linear'], ['get', 'totalCapacity'], 0, '#bbf7d0', 30, '#4ade80', 80, '#22c55e', 150, '#15803d'], cityOutline: '#86efac' },
  FEASIBILITY_REVIEW: { cityFillStops: ['interpolate', ['linear'], ['get', 'totalCapacity'], 0, '#fed7aa', 30, '#fb923c', 80, '#f97316', 150, '#c2410c'], cityOutline: '#fdba74' },
  INVESTMENT_DECISION: { cityFillStops: ['interpolate', ['linear'], ['get', 'totalCapacity'], 0, '#fecaca', 30, '#f87171', 80, '#ef4444', 150, '#b91c1c'], cityOutline: '#fca5a5' },
}

const showDetailPanel = ref(false)
const detailPanelTab = ref('main')
const showGeneratePanel = ref(false)
const generatePanelProject = ref(null)
const generatePanelActionKey = ref('')
const generatePanelSubCode = ref('')

const theme = computed(() => STAGE_THEMES[props.stage] || STAGE_THEMES.DEFAULT)
const currentActions = computed(() => STAGE_ACTIONS[props.stage] || STAGE_ACTIONS['PRELIMINARY_SELECTION'])
const cardActions = computed(() => currentActions.value)
const rowActions = computed(() => currentActions.value)

// ★ 场区样式：默认有半透明填充，选中（highlight）填充透明仅保留加粗边框
const AREA_STYLE = {
  FD: {
    color: '#3b82f6',
    opacity: 0.22,
    outlineColor: '#60a5fa',
    outlineWidth: 1.5,
    highlight: {
      color: 'transparent',
      opacity: 0,
      outlineColor: '#93c5fd',
      outlineWidth: 3,
    },
  },
  GF: {
    color: '#a855f7',
    opacity: 0.22,
    outlineColor: '#c084fc',
    outlineWidth: 1.5,
    highlight: {
      color: 'transparent',
      opacity: 0,
      outlineColor: '#d8b4fe',
      outlineWidth: 3,
    },
  },
}

// =================== 地图 ===================
const mapRef = ref(null)
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
const selectedProject = ref(null)
const detailCardPos = reactive({ x: 0, y: 0, visible: false })
const editMode = ref('area')
const drawingNewPoint = ref(false)
const saving = ref(false)
const isBoxSelecting = ref(false)
const hasSaved = ref(false)
const recalculating = ref(false)

// ★ 新增：编辑态 / 脏标记
const isEditing = ref(false)
const isDirty = ref(false)

const drawerSort = reactive({ key: '', dir: 'desc' })

let whlnPlugin = null
const layerVisibleIds = ref([...DEFAULT_VISIBLE])
const layerInputs = reactive({ noise: 700 })
const customLayerState = reactive({})

const overviewStats = reactive({ totalCapacity: 0, totalCount: 0, windCapacity: 0, windCount: 0, solarCapacity: 0, solarCount: 0 })
const cityStats = ref([])
let cityGeoJSONCache = null

const editTools = [
  { key: 'area', label: '编辑场区', icon: Location },
  { key: 'wind', label: '编辑风机', icon: MapLocation },
  { key: 'booster', label: '编辑升压站', icon: CircleCheck },
  { key: 'unavailable', label: '设置不可用区域', icon: InfoFilled },
]

// expand-button 位置：抽屉收起时贴右边缘，展开时贴抽屉左边
const expandButtonStyle = computed(() => ({
  right: showProjectDrawer.value
    ? `${DRAWER_WIDTH + DRAWER_GAP}px`
    : '0px',
}))

// =================== 图层显隐 ===================
function setProjectIconVisible(chipId, visible) {
  const layerIds = PROJECT_ICON_LAYER_MAP[chipId]
  if (!layerIds) return
  const map = mapRef.value?.getMap?.()
  if (!map) return
  for (const layerId of layerIds) {
    if (!map.getLayer(layerId)) continue
    map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none')
  }
}

function syncAllProjectIcons() {
  for (const chipId of Object.keys(PROJECT_ICON_LAYER_MAP)) {
    setProjectIconVisible(chipId, layerVisibleIds.value.includes(chipId))
  }
}

function onLayerToggle(item) {
  const isOn = layerVisibleIds.value.includes(item.id)
  if (item.type === 'whln') {
    const next = isOn ? layerVisibleIds.value.filter((id) => id !== item.id) : [...layerVisibleIds.value, item.id]
    layerVisibleIds.value = next
    whlnPlugin?.setVisibleIds?.(next.filter((id) => WHLN_LAYER_IDS.includes(id)))
    return
  }
  if (item.type === 'project') {
    setProjectIconVisible(item.id, !isOn)
  } else if (item.type === 'base') {
    toggleBaseMap(item.id)
  } else if (item.type === 'terrain') {
    toggleTerrain(item.id)
  } else if (item.type === 'custom') {
    toggleCustomLayer(item.id)
  }
  customLayerState[item.id] = !isOn
  layerVisibleIds.value = isOn ? layerVisibleIds.value.filter((id) => id !== item.id) : [...layerVisibleIds.value, item.id]
}

function onLayerInputChange({ id, value }) { layerInputs[id] = value }
function toggleBaseMap(id) {}
function toggleTerrain(id) {}
function toggleCustomLayer(id) {}

// =================== 创建项目 ===================
const showCreateProject = ref(false)
const createProjectFormRef = ref(null)
const placeSearchKeyword = ref('')

function openCreateProject() { showCreateProject.value = true; if (mapReady.value) nextTick(() => startCreateDrawing()) }
function closeCreateProject() { showCreateProject.value = false; placeSearchKeyword.value = '' }
function startCreateDrawing() { createProjectFormRef.value?.startPolygonDrawing?.() }
function saveCreateDrawing() { createProjectFormRef.value?.handleMapDrawSave?.() }
function clearCreateDrawing() { createProjectFormRef.value?.handleMapDrawClear?.() }
function onProjectCreated() {
  showCreateProject.value = false; placeSearchKeyword.value = ''; viewMode.value = 'list'; pagination.page = 1;
  fetchProjectList(); fetchMapProjects(); fetchOverviewStats(); fetchCityStats();
}
async function handlePlaceSearch() {
  if (!placeSearchKeyword.value.trim()) return
  try {
    const { lng, lat } = await searchPlaceName(placeSearchKeyword.value.trim())
    mapRef.value?.getMap?.()?.flyTo({ center: [lng, lat], zoom: 11, duration: 1500 })
  } catch (err) { ElMessage.warning(err.message || '未找到匹配的地名') }
}

// =================== 筛选 & 列表 ===================
const filters = reactive({
  province: '610000', city: '', district: '', itemType: '', projectStage: '', approvalStatus: '',
  managerCompany: '', managerName: '', createTimeStart: '', createTimeEnd: '', projectCode: '', projectName: '', isVerified: '',
})

const projectList = ref([])
const listLoading = ref(false)
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

const APPROVAL_STATUS_MAP = { NO_APPROVAL: '未审批', APPROVED: '审批通过', REJECTED: '审批不通过' }
const APPROVAL_STATUS_CLASS = { NO_APPROVAL: 'pending', APPROVED: 'passed', REJECTED: 'rejected' }
const stageOptions = ref([])
const stageMap = computed(() => Object.fromEntries(stageOptions.value.map(item => [item.code, item.desc])))

const STATUS_COLUMN_CONFIG = {
  verify: {
    label: '核查状态',
    getText: (row) => (row.isVerified === 1 || row.isVerified === true ? '已核查' : ''),
    getClass: (row) => (row.isVerified === 1 || row.isVerified === true ? 'passed' : ''),
  },
  approval: {
    label: '审批状态',
    getText: (row) => APPROVAL_STATUS_MAP[row.approvalStatus] || '',
    getClass: (row) => APPROVAL_STATUS_CLASS[row.approvalStatus] || '',
  },
  none: null,
}
const statusColumnConfig = computed(() => STATUS_COLUMN_CONFIG[props.statusColumn] || null)

async function fetchStageList() {
  try { stageOptions.value = (await api.getStageList())?.data ?? [] } catch { stageOptions.value = [] }
}
function formatRegion(row) {
  const names = [row.provinceName, row.cityName, row.districtName].filter(Boolean)
  return names.length ? names.join('/') : (row.address || '-')
}
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
  } catch (err) {
    ElMessage.error(err?.message || '项目列表加载失败')
    projectList.value = []
    pagination.total = 0
  } finally { listLoading.value = false }
}

function handleSearch() { pagination.page = 1; fetchProjectList() }
function handleReset() {
  Object.assign(filters, { city: '', district: '', itemType: '', projectStage: '', approvalStatus: '', managerCompany: '', managerName: '', createTimeStart: '', createTimeEnd: '', projectCode: '', projectName: '', isVerified: '' })
  drawerSort.key = ''; drawerSort.dir = 'desc'; pagination.page = 1; fetchProjectList()
}
function handlePageChange(page) { pagination.page = page; fetchProjectList() }
function handleSizeChange(size) { pagination.pageSize = size; pagination.page = 1; fetchProjectList() }

// =================== 动作分发 ===================
const deletingId = ref(null)

function executeAction(action, project) {
  if (!project) return
  const name = project.projectName || ''
  const mapProject = allMapProjects.value.find((p) => p.id === project.id) || project

  if (['material', 'researchMaterial', 'investMaterial'].includes(action)) { openDetailPanel(mapProject, 'material'); return }
  if (['establishMeeting', 'researchReview', 'investMeeting'].includes(action)) { openDetailPanel(mapProject, 'meeting'); return }
  if (action === 'assign') { assignTargetProject.value = mapProject; showAssignDialog.value = true; return }
  if (action === 'verify') {
    showProjectDrawer.value = false; showDetailPanel.value = false; viewMode.value = 'map'
    setTimeout(() => { onProjectClick(mapProject.id); showVerifyPanel.value = true }, 100)
    return
  }
  if (action === 'edit') {
  // 直接进入编辑模式，不打开右侧详情面板
  showProjectDrawer.value = false
  showDetailPanel.value = false
  viewMode.value = 'map'
  setTimeout(async () => {
    // 若目标项目尚未选中，先选中（onProjectClick 内部会飞到场区、加载图标）
    if (selectedProject.value?.id !== mapProject.id) {
      await onProjectClick(mapProject.id)
    }
    // 进入编辑（若尚未进入）
    if (!isEditing.value) startEdit()
  }, 100)
  return
}
  if (action === 'delete') {
    handleDeleteProject(mapProject)
    return
  }
  ElMessage.info(`点击了「${ACTION_LABELS[action] || action}」：${name}`)
}

async function handleDeleteProject(project) {
  if (!project || deletingId.value) return
  const id = project.id
  const name = project.projectName || ''

  try {
    await ElMessageBox.confirm(
      `确认删除项目「${name}」吗？删除后不可恢复。`,
      '提示',
      { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' }
    )
  } catch {
    return
  }

  deletingId.value = id
  try {
    const res = await api.deletProject(id)
    if (res?.code !== 200) {
      ElMessage.error(res?.msg || '删除失败')
      return
    }

    ElMessage.success('删除成功')

    showProjectDrawer.value = false
    showDetailPanel.value = false

    await fetchMapProjects()

    if (selectedProject.value?.id === id) {
      clearSelectionLayers()
    }

    if (projectList.value.length === 1 && pagination.page > 1) {
      pagination.page -= 1
    }

    await Promise.all([
      fetchProjectList(),
      fetchOverviewStats(),
      fetchCityStats(),
    ])
  } catch (err) {
    ElMessage.error(err?.message || '删除失败')
  } finally {
    deletingId.value = null
  }
}

function openDetailPanel(project, tab) {
  const p = allMapProjects.value.find(item => item.id === project.id)
  if (!p) { ElMessage.warning('地图上未找到该项目'); return }
  showProjectDrawer.value = false; viewMode.value = 'map'
  setTimeout(() => { onProjectClick(p.id); detailPanelTab.value = tab; showDetailPanel.value = true }, 100)
}

function onAssignSuccess() { fetchProjectList(); fetchMapProjects() }

function onDetailPanelAction(payload) {
  if (payload?.type === 'stage-changed') {
    showDetailPanel.value = false; fetchMapProjects(); fetchProjectList(); fetchOverviewStats(); fetchCityStats(); return
  }
  if (payload?.type === 'generate-report') {
    generatePanelProject.value = payload.project; generatePanelActionKey.value = payload.actionKey; generatePanelSubCode.value = payload.subCode; showGeneratePanel.value = true; return
  }
}
function onReportGenerated() { console.log('[site-map] 报告已生成') }

// =================== 看板 & 市级面 ===================
async function fetchOverviewStats() {
  try {
    const payload = { regionCode: PROVINCE_CODE, regionType: 'PROVINCE' }
    if (props.stage) payload.projectStage = props.stage
    const data = (await configApi.overViewData(payload))?.data ?? {}
    Object.assign(overviewStats, {
      totalCapacity: data.totalCapacity ?? 0, totalCount: data.totalCount ?? 0,
      windCapacity: data.windCapacity ?? 0, windCount: data.windCount ?? 0,
      solarCapacity: data.solarCapacity ?? 0, solarCount: data.solarCount ?? 0,
    })
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

async function loadCityGeoJSON() {
  if (cityGeoJSONCache) return cityGeoJSONCache
  try { cityGeoJSONCache = await (await fetch(CITY_GEOJSON_URL)).json(); return cityGeoJSONCache }
  catch (err) { console.error('[city] GeoJSON 加载失败:', err); return null }
}

async function renderCityStats() {
  if (!mapReady.value || !mapRef.value) return
  const geoJSON = await loadCityGeoJSON()
  if (!geoJSON) return
  const statMap = {}
  for (const s of cityStats.value) statMap[String(s.regionCode)] = s

  const features = geoJSON.features.map((f) => {
    const code = String(f.properties.adcode ?? f.properties.regionCode ?? f.properties.code ?? '')
    const stat = statMap[code]
    const center = CITY_LABEL_CENTER[code] || f.properties.center || f.properties.centroid || null
    return { ...f, properties: { ...f.properties, regionCode: code, regionName: stat?.regionName || f.properties.name || '', totalCapacity: Number(stat?.totalCapacity) || 0, center } }
  })

  mapRef.value.addFillLayer({ id: CITY_LAYER_ID, geojson: { type: 'FeatureCollection', features }, fillColor: theme.value.cityFillStops, fillOpacity: 0.55, outlineColor: theme.value.cityOutline, outlineWidth: 1.2 })

  const labelFeatures = features.filter((f) => Array.isArray(f.properties.center) && f.properties.center.length === 2).map((f) => ({ type: 'Feature', properties: f.properties, geometry: { type: 'Point', coordinates: f.properties.center } }))

  mapRef.value.addSymbolLayer({
    id: `${CITY_LAYER_ID}-labels`,
    geojson: { type: 'FeatureCollection', features: labelFeatures },
    layout: {
      'text-field': ['format', ['get', 'totalCapacity'], { 'font-scale': 1.25 }, 'MW', { 'font-scale': 0.85 }, '\n', ['get', 'regionName'], { 'font-scale': 0.85 }],
      'text-size': 13, 'text-anchor': 'center', 'text-allow-overlap': true, 'text-ignore-placement': true, 'text-line-height': 1.1,
    },
    paint: { 'text-color': '#ffffff', 'text-halo-color': '#000000', 'text-halo-width': 1.6 },
  })
}

function hideCityStats() { mapRef.value?.removeLayer(CITY_LAYER_ID); mapRef.value?.removeLayer(`${CITY_LAYER_ID}-labels`) }

// =================== 遮罩 ===================
const MASK_LAYER_ID = 'shaanxi-mask'
const MASK_SOURCE_ID = 'shaanxi-mask-src'
const SHAANXI_BOUNDARY_URL = 'https://geo.datav.aliyun.com/areas_v3/bound/610000.json'
const SHAANXI_BOUNDS = [[105.4, 31.7], [111.2, 39.6]]
let shaanxiBoundaryCache = null
let lastMaskOpacity = -1

async function loadShaanxiBoundary() { if (shaanxiBoundaryCache) return shaanxiBoundaryCache; shaanxiBoundaryCache = await (await fetch(SHAANXI_BOUNDARY_URL)).json(); return shaanxiBoundaryCache }
function ensureClosed(ring) { if (!ring || ring.length < 3) return ring; const f = ring[0], l = ring[ring.length - 1]; return (f[0] === l[0] && f[1] === l[1]) ? ring : [...ring, [f[0], f[1]]] }
function ringSignedArea(ring) { if (!ring || ring.length < 3) return 0; let a = 0; for (let i = 0; i < ring.length - 1; i++) { a += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1] } return a / 2 }
function ensureOuterCCW(ring) { const r = ensureClosed(ring); return ringSignedArea(r) >= 0 ? r : r.slice().reverse() }
function ensureHoleCW(ring) { const r = ensureClosed(ring); return ringSignedArea(r) <= 0 ? r : r.slice().reverse() }

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
    const data = buildMaskGeoJSON(await loadShaanxiBoundary()); if (!data.features.length) return
    if (!map.getSource(MASK_SOURCE_ID)) map.addSource(MASK_SOURCE_ID, { type: 'geojson', data })
    map.addLayer({ id: MASK_LAYER_ID, type: 'fill', source: MASK_SOURCE_ID, paint: { 'fill-color': props.maskColor, 'fill-opacity': 0, 'fill-opacity-transition': { duration: props.maskFadeDuration, delay: 0 } } })
    lastMaskOpacity = -1; syncMaskVisibility(true)
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

function smoothstep(e0, e1, x) { if (e1 <= e0) return x >= e1 ? 1 : 0; const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t) }

function computeMaskOpacity() {
  if (!props.enableShaanxiMask) return 0
  const map = mapRef.value?.getMap?.(); if (!map || !viewIntersectsShaanxi(map)) return 0
  return smoothstep(props.maskMinZoom, props.maskFullZoom, map.getZoom()) * props.maskMaxOpacity
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

// =================== 项目数据 ===================
function getProjectCoords(project) { return (project.coordinate || []).map((c) => [Number(c.longitude), Number(c.latitude)]).filter(([lng, lat]) => Number.isFinite(lng) && Number.isFinite(lat)) }
function getProjectCentroid(project) {
  const coords = getProjectCoords(project); if (!coords.length) return null
  let sx = 0, sy = 0; for (const [lng, lat] of coords) { sx += lng; sy += lat }
  return [sx / coords.length, sy / coords.length]
}

// 飞行到场区范围
function flyToProjectBounds(project) {
  const map = mapRef.value?.getMap?.()
  if (!map) return
  const coords = getProjectCoords(project)
  if (!coords.length) return

  let minLng = Infinity, minLat = Infinity
  let maxLng = -Infinity, maxLat = -Infinity
  for (const [lng, lat] of coords) {
    if (lng < minLng) minLng = lng
    if (lng > maxLng) maxLng = lng
    if (lat < minLat) minLat = lat
    if (lat > maxLat) maxLat = lat
  }

  if (minLng === maxLng || minLat === maxLat) {
    map.flyTo({
      center: [(minLng + maxLng) / 2, (minLat + maxLat) / 2],
      zoom: 15,
      pitch: 0,
      duration: 1200,
    })
    return
  }

  map.fitBounds([[minLng, minLat], [maxLng, maxLat]], {
    padding: { top: 80, bottom: 80, left: 200, right: 120 },
    maxZoom: 16,
    duration: 1200,
  })
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
  return { type: 'FeatureCollection', features: (project.boosterStationLocations || []).map((p, index) => { const lng = Number(p.lng), lat = Number(p.lat); return Number.isFinite(lng) && Number.isFinite(lat) ? { type: 'Feature', properties: { projectId: project.id, index, isBest: p.isBest }, geometry: { type: 'Point', coordinates: [lng, lat] } } : null }).filter(Boolean) }
}

function clearProjectLayers() { if (!mapRef.value) return; for (const id of renderedLayerIds) mapRef.value.removeLayer(id); renderedLayerIds.clear() }

async function safeAddIcon({ layerId, featureCollection, iconId, iconUrl, iconSize, iconAnchor = 'center', fallbackColor = '#3b82f6', fallbackRadius = 8 }) {
  try {
    await mapRef.value.ensureImage(iconId, iconUrl)
    await mapRef.value.addImagePoints({ id: layerId, geojson: featureCollection, iconId, iconUrl, iconSize, iconAnchor })
  } catch (err) { mapRef.value.addPoints({ id: layerId, geojson: featureCollection, color: fallbackColor, radius: fallbackRadius }) }
  renderedLayerIds.add(layerId)
}

function addProjectArea(project, highlighted = false) {
  const area = buildAreaFeature(project); if (!area) return
  const layerId = `project-area-${project.id}`
  const style = AREA_STYLE[project.itemType] || AREA_STYLE.FD
  const s = highlighted ? style.highlight : style
  mapRef.value.addPolygon({
    id: layerId,
    geojson: area,
    color: s.color,
    opacity: s.opacity,
    outlineColor: s.outlineColor,
    outlineWidth: s.outlineWidth,
  })
  renderedLayerIds.add(layerId)
  const fillLayerId = `${layerId}-fill`
  mapRef.value.offClick(fillLayerId)
  mapRef.value.onClick(fillLayerId, () => onProjectClick(project.id))
}

// 清除选中项目的风机 / 升压站图标
function clearSelectedProjectIcons() {
  if (!mapRef.value) return
  for (const layerId of SELECTED_ICON_LAYER_IDS) {
    if (renderedLayerIds.has(layerId)) {
      mapRef.value.removeLayer(layerId)
      renderedLayerIds.delete(layerId)
    }
  }
}

// 只加载选中项目的风机 / 升压站图标
async function renderSelectedProjectIcons(project) {
  if (!mapReady.value || !mapRef.value || !project) return
  clearSelectedProjectIcons()

  const wf = buildWindFC(project)
  const bf = buildBoosterFC(project)

  if (wf.normal.features.length) {
    await safeAddIcon({
      layerId: 'project-wind-all',
      featureCollection: wf.normal,
      iconId: ICON_FENGJI,
      iconUrl: fengjiIcon,
      iconSize: ICON_SIZE_WIND,
      iconAnchor: 'bottom',
      fallbackColor: '#22c55e',
      fallbackRadius: 3,
    })
  }
  if (wf.reserve.features.length) {
    await safeAddIcon({
      layerId: 'project-wind-bx-all',
      featureCollection: wf.reserve,
      iconId: ICON_FENGJI_BX,
      iconUrl: fengjiBxIcon,
      iconSize: ICON_SIZE_WIND,
      iconAnchor: 'bottom',
      fallbackColor: '#f59e0b',
      fallbackRadius: 3,
    })
  }
  if (bf.features.length) {
    await safeAddIcon({
      layerId: 'project-booster-all',
      featureCollection: bf,
      iconId: ICON_SHENGYAZHAN,
      iconUrl: shengyazhanIcon,
      iconSize: ICON_SIZE_BOOSTER,
      iconAnchor: 'bottom',
      fallbackColor: '#ef4444',
      fallbackRadius: 3,
    })
  }

  syncAllProjectIcons()
}

// 只渲染场区；选中项目才渲染图标
async function renderProjectsByStage(stage) {
  if (!mapReady.value || !mapRef.value) return
  clearProjectLayers()
  if (!allMapProjects.value.length || stage === 'overview') return

  for (const p of allMapProjects.value) {
    addProjectArea(p, p.id === selectedProject.value?.id)
  }

  if (selectedProject.value) {
    await renderSelectedProjectIcons(selectedProject.value)
  }

  syncAllProjectIcons()
  syncMaskVisibility()
}

async function fetchMapProjects() {
  try {
    const params = { pageNo: 1, pageSize: 100, province: '610000' }
    if (props.stage) params.projectStage = props.stage
    allMapProjects.value = (await api.getPageList(params))?.data?.list ?? []
    if (mapReady.value && isAreaView.value) await renderProjectsByStage('area')
  } catch (err) { ElMessage.error(err?.message || '地图项目数据加载失败') }
}

// =================== 选中 & 详情卡 ===================
const windCount = computed(() => selectedProject.value?.windTurbinePoints?.length || 0)
const altCount = computed(() => (selectedProject.value?.windTurbinePoints || []).filter((p) => Number(p.isReserve) === 1).length)

// ★ 选中项目：只选中、不自动进编辑
async function onProjectClick(projectId) {
  if (selectedProject.value?.id === projectId) return
  clearSelectionLayers()
  const project = allMapProjects.value.find((p) => p.id === projectId)
  if (!project) return

  flyToProjectBounds(project)

  selectedProject.value = project
  hasSaved.value = false
  isEditing.value = false
  isDirty.value = false
  addProjectArea(project, true)
  await renderSelectedProjectIcons(project)
  updateDetailCardPosition()
}

function clearSelectionLayers() {
  if (!selectedProject.value) return
  const pid = selectedProject.value.id
  showVerifyPanel.value = false
  showDetailPanel.value = false
  mapRef.value?.clearEditableAreas()
  mapRef.value?.stopBoxSelect?.()
  editBuffer.value = null
  drawingNewPoint.value = false
  isBoxSelecting.value = false
  isEditing.value = false
  isDirty.value = false
  hasSaved.value = false
  const project = allMapProjects.value.find((p) => p.id === pid)
  if (project && isAreaView.value) addProjectArea(project, false)
  clearSelectedProjectIcons()
  selectedProject.value = null
  detailCardPos.visible = false
}

function updateDetailCardPosition() {
  if (!selectedProject.value || !mapRef.value) { detailCardPos.visible = false; return }
  const centroid = getProjectCentroid(selectedProject.value)
  if (!centroid) { detailCardPos.visible = false; return }
  const map = mapRef.value.getMap(); if (!map) return
  const pt = map.project(centroid); detailCardPos.x = pt.x; detailCardPos.y = pt.y; detailCardPos.visible = true
}

// ★ 点击空白：退出编辑模式（但保留选中，直到点击下一个场区）
function handleMapBlankClick(e) {
  if (!isAreaView.value || !selectedProject.value) return
  const map = mapRef.value?.getMap?.()
  if (!map) return
  const areaIds = []
  for (const id of renderedLayerIds) {
    if (id.startsWith('project-area-')) areaIds.push(`${id}-fill`)
  }
  if (!areaIds.length) return
  // 点在场区外
  if (!map.queryRenderedFeatures(e.point, { layers: areaIds }).length) {
    if (isEditing.value) exitEditMode()
  }
}

function onVerifySaved(data) { console.log('[verify] 已保存:', data); showVerifyPanel.value = false }

// =================== 抽屉 ===================
async function focusProject(project) {
  const p = allMapProjects.value.find((item) => item.id === project.id)
  if (!p) { ElMessage.warning('地图上未找到该项目'); return }
  showProjectDrawer.value = false
  onProjectClick(p.id)
}
function handleDrawerAction({ type, project }) { executeAction(type, allMapProjects.value.find((item) => item.id === project.id) || project) }
function handleDrawerSortChange({ key, dir }) { drawerSort.key = key; drawerSort.dir = dir; pagination.page = 1; fetchProjectList() }

watch(viewMode, (val) => { if (val === 'list' && showProjectDrawer.value) showProjectDrawer.value = false })
watch(showProjectDrawer, (val) => { if (val) { pagination.page = 1; fetchProjectList() } })

// =================== 编辑核心 ===================
const editBuffer = ref(null)
let suppressDrawSync = false

function initEditBuffer(project) {
  const area = getProjectCoords(project)
  const wind = (project.windTurbinePoints || []).map(p => {
    const lng = Number(p.longitude), lat = Number(p.latitude)
    return Number.isFinite(lng) && Number.isFinite(lat) ? { lng, lat, isReserve: Number(p.isReserve) === 1 ? 1 : 0 } : null
  }).filter(Boolean)
  const booster = (project.boosterStationLocations || []).map(p => {
    const lng = Number(p.lng), lat = Number(p.lat)
    return Number.isFinite(lng) && Number.isFinite(lat) ? { lng, lat, isBest: Number(p.isBest) === 1 ? 1 : 0 } : null
  }).filter(Boolean)
  editBuffer.value = { area, wind, booster, unavailable: [] }
}

function closeRing(coords) { if (!coords || coords.length < 3) return coords; const f = coords[0], l = coords[coords.length - 1]; return f[0] === l[0] && f[1] === l[1] ? coords : [...coords, [f[0], f[1]]] }

function syncDrawToBuffer() {
  if (!editBuffer.value) return
  const draw = mapRef.value?.getDraw?.()
  const all = draw?.getAll?.() || { type: 'FeatureCollection', features: [] }

  const currentMode = editMode.value

  if (currentMode === 'area') {
    const areaF = all.features.find(f => f.properties?.kind === 'area')
    if (areaF) {
      editBuffer.value.area = areaF.geometry.coordinates[0].map(c => [c[0], c[1]])
    } else {
      editBuffer.value.area = []
    }
  }
  else if (currentMode === 'wind') {
    editBuffer.value.wind = all.features
      .filter(f => f.properties?.kind === 'wind')
      .map(f => ({
        lng: f.geometry.coordinates[0],
        lat: f.geometry.coordinates[1],
        isReserve: Number(f.properties?.isReserve) === 1 ? 1 : 0
      }))
  }
  else if (currentMode === 'booster') {
    editBuffer.value.booster = all.features
      .filter(f => f.properties?.kind === 'booster')
      .map(f => ({
        lng: f.geometry.coordinates[0],
        lat: f.geometry.coordinates[1],
        isBest: Number(f.properties?.isBest) === 1 ? 1 : 0
      }))
  }
  else if (currentMode === 'unavailable') {
    editBuffer.value.unavailable = all.features
      .filter(f => f.properties?.kind === 'unavailable')
  }

  refreshAllPointsLayers()
}

function onDrawChange() {
  if (suppressDrawSync) return
  syncDrawToBuffer()
  if (isEditing.value) isDirty.value = true
}

// ★ 进入编辑（点击「编辑」按钮触发）
function startEdit() {
  if (!selectedProject.value) return
  isEditing.value = true
  isDirty.value = false
  editMode.value = 'area'
  initEditBuffer(selectedProject.value)
  enterEditMode('area')
}

// ★ 退出编辑（保留选中，恢复图标）
function exitEditMode() {
  if (!isEditing.value) return
  mapRef.value?.clearEditableAreas()
  mapRef.value?.stopBoxSelect?.()
  editBuffer.value = null
  drawingNewPoint.value = false
  isBoxSelecting.value = false
  isEditing.value = false
  isDirty.value = false
  if (selectedProject.value) {
    renderSelectedProjectIcons(selectedProject.value)
  }
}

function enterEditMode(mode) {
  if (!selectedProject.value || !editBuffer.value) return
  const draw = mapRef.value?.getDraw?.()
  if (!draw) return

  const currentFeatures = draw.getAll().features
  if (!suppressDrawSync && currentFeatures.length > 0) {
    syncDrawToBuffer()
  }

  refreshAllPointsLayers()

  suppressDrawSync = true
  editMode.value = mode
  drawingNewPoint.value = false
  isBoxSelecting.value = false
  mapRef.value.stopBoxSelect?.()

  mapRef.value.clearEditableAreas()

  const buf = editBuffer.value
  const features = []

  if (mode === 'area') {
    if (buf.area && buf.area.length >= 3) {
      features.push({
        type: 'Feature',
        id: 'edit-area',
        properties: { kind: 'area' },
        geometry: { type: 'Polygon', coordinates: [closeRing(buf.area)] }
      })
    }
  } else if (mode === 'wind') {
    buf.wind.forEach((p, i) => {
      features.push({
        type: 'Feature',
        id: `edit-wind-${i}`,
        properties: { kind: 'wind', index: i, isReserve: p.isReserve },
        geometry: { type: 'Point', coordinates: [p.lng, p.lat] }
      })
    })
  } else if (mode === 'booster') {
    buf.booster.forEach((p, i) => {
      features.push({
        type: 'Feature',
        id: `edit-booster-${i}`,
        properties: { kind: 'booster', index: i, isBest: p.isBest },
        geometry: { type: 'Point', coordinates: [p.lng, p.lat] }
      })
    })
  } else if (mode === 'unavailable') {
    buf.unavailable.forEach(f => features.push(f))
  }

  if (features.length) {
    draw.add({ type: 'FeatureCollection', features })
  }

  if (mode === 'area') {
    const areaFeat = features.find(f => f.properties.kind === 'area')
    if (areaFeat) {
      draw.changeMode('direct_select', { featureId: areaFeat.id })
    } else {
      draw.changeMode('simple_select')
    }
  } else if (mode === 'unavailable') {
    draw.changeMode('draw_polygon')
  } else {
    draw.changeMode('simple_select')
  }

  nextTick(() => {
    mapRef.value?.bringDrawPointsToTop?.()
  })

  suppressDrawSync = false
}

function startAddWindPoint() {
  const draw = mapRef.value?.getDraw?.()
  if (!draw) return
  draw.changeMode('draw_point')
  drawingNewPoint.value = true
  ElMessage.info('点击地图添加风机，点击"标记备选"可切换备选状态')
}

// ★ 修复：升压站「新增点」切换
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
  if (editMode.value !== 'wind' && editMode.value !== 'booster') {
    ElMessage.warning('仅支持在编辑风机/升压站时框选')
    return
  }
  isBoxSelecting.value = true
  mapRef.value.startBoxSelect?.()
  ElMessage.info('请在地图上拖拽进行框选')
}

function handleBoxSelect(featureIds) {
  if (!featureIds.length) return
  const draw = mapRef.value?.getDraw?.()
  if (!draw) return
  draw.changeMode('simple_select', { featureIds })
  isBoxSelecting.value = false
}

function markReserve(isReserve) {
  const draw = mapRef.value?.getDraw?.()
  if (!draw) return
  const ids = draw.getSelectedIds()
  if (!ids.length) {
    ElMessage.warning('请先选中风机点位')
    return
  }

  let count = 0
  ids.forEach(id => {
    draw.setFeatureProperty(id, 'isReserve', isReserve ? 1 : 0)
    const feat = draw.get(id)
    if (feat && feat.properties?.kind === 'wind') {
      count++
    }
  })

  if (count === 0) return
  syncDrawToBuffer()
  enterEditMode('wind')
  ElMessage.success(`已${isReserve ? '标记' : '取消'}备选 ${count} 个风机`)
}

function deleteSelectedPoints() {
  const draw = mapRef.value?.getDraw?.()
  if (!draw) return
  const ids = draw.getSelectedIds()
  if (!ids.length) { ElMessage.warning('请先选中要删除的点'); return }
  draw.delete(ids)
  syncDrawToBuffer()
  enterEditMode(editMode.value)
  ElMessage.success(`已删除 ${ids.length} 个点`)
}

// 只刷新当前选中项目的场区 / 风机 / 升压站
function refreshAllPointsLayers() {
  if (!mapRef.value || !editBuffer.value || !selectedProject.value) return
  const map = mapRef.value.getMap?.()
  if (!map) return
  const pid = selectedProject.value.id

  if (editBuffer.value.area && editBuffer.value.area.length >= 3) {
    const areaFeature = {
      type: 'Feature',
      properties: {
        projectId: pid,
        projectCode: selectedProject.value.projectCode,
        projectName: selectedProject.value.projectName,
        itemType: selectedProject.value.itemType,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [closeRing(editBuffer.value.area)],
      },
    }
    const layerId = `project-area-${pid}`
    const style = AREA_STYLE[selectedProject.value.itemType] || AREA_STYLE.FD
    mapRef.value.addPolygon({
      id: layerId,
      geojson: areaFeature,
      color: style.highlight.color,
      opacity: style.highlight.opacity,
      outlineColor: style.highlight.outlineColor,
      outlineWidth: style.highlight.outlineWidth,
    })
  }

  const windNormal = []
  const windReserve = []
  for (const p of editBuffer.value.wind) {
    const f = {
      type: 'Feature',
      properties: { projectId: pid },
      geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
    }
    ;(p.isReserve === 1 ? windReserve : windNormal).push(f)
  }

  const boosterFeatures = []
  for (const p of editBuffer.value.booster) {
    boosterFeatures.push({
      type: 'Feature',
      properties: { projectId: pid },
      geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
    })
  }

  if (map.getSource('project-wind-all')) {
    map.getSource('project-wind-all').setData({ type: 'FeatureCollection', features: windNormal })
  }
  if (map.getSource('project-wind-bx-all')) {
    map.getSource('project-wind-bx-all').setData({ type: 'FeatureCollection', features: windReserve })
  }
  if (map.getSource('project-booster-all')) {
    map.getSource('project-booster-all').setData({ type: 'FeatureCollection', features: boosterFeatures })
  }
}

async function saveEdit() {
  if (!editBuffer.value || !selectedProject.value || saving.value) return
  syncDrawToBuffer()
  const project = selectedProject.value
  const pid = project.id

  const fallbackRegionCode = project.coordinate?.[0]?.regionCode ?? null
  const coordinate = editBuffer.value.area.map(([lng, lat]) => ({
    regionCode: fallbackRegionCode, longitude: String(lng), latitude: String(lat),
  }))

  const windTurbinePoints = editBuffer.value.wind.map(p => ({
    longitude: p.lng, latitude: p.lat, isReserve: p.isReserve,
  }))

  const boosterStationLocations = editBuffer.value.booster.map(p => ({
    lng: p.lng, lat: p.lat, isBest: p.isBest,
  }))

  const payload = {
    coordinate, windTurbinePoints, boosterStationLocations,
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
    const res = await configApi.upDataLayer(pid, payload)
    if (res?.code === 200) {
      ElMessage.success('保存成功')
      hasSaved.value = true
      isDirty.value = false
      const target = allMapProjects.value.find(p => p.id === pid)
      if (target) {
        target.coordinate = coordinate
        target.windTurbinePoints = windTurbinePoints
        target.boosterStationLocations = boosterStationLocations
      }
      await renderProjectsByStage('area')
      updateDetailCardPosition()
      if (target) { initEditBuffer(target); enterEditMode('area') }
      fetchOverviewStats(); fetchCityStats()
    } else { ElMessage.error(res?.msg || '保存失败') }
  } catch (err) { ElMessage.error(err?.message || '保存失败') }
  finally { saving.value = false }
}

// 重新计算
async function handleRecalculate() {
  if (!selectedProject.value || !hasSaved.value) return

  try {
    recalculating.value = true
    const res = await configApi.updateCalculateStatus(selectedProject.value.id, {
      isReturnProject: 1
    })

    if (res?.code === 200) {
      ElMessage.success('重新计算发起成功')
      hasSaved.value = false
      fetchMapProjects()
      fetchProjectList()
    } else {
      ElMessage.error(res?.msg || '重新计算失败')
    }
  } catch (err) {
    ElMessage.error(err?.message || '重新计算请求异常')
  } finally {
    recalculating.value = false
  }
}

// ★ 取消 = 恢复数据 + 退出编辑
function cancelEdit() {
  exitEditMode()
}

// =================== 缩放阈值 ===================
const { isAreaView, syncByZoom, bindZoomListener, unbindZoomListener } = useZoomThresholdSwitch({
  mapRef,
  onEnter: () => { hideCityStats(); renderProjectsByStage('area') },
  onExit: () => { clearSelectionLayers(); renderProjectsByStage('overview'); if (cityStats.value.length) renderCityStats() },
})

// =================== 就绪 ===================
async function onMapReady() {
  mapReady.value = true
  if (showCreateProject.value) nextTick(() => startCreateDrawing())
  const map = mapRef.value.getMap()
  map.on('move', updateDetailCardPosition)
  map.on('zoom', updateDetailCardPosition)
  map.on('click', handleMapBlankClick)
  bindZoomListener()
  syncByZoom()
  if (isAreaView.value) { hideCityStats(); renderProjectsByStage('area') }
  else { await renderCityStats() }

  map.on('zoom', syncMaskVisibility)
  map.on('move', syncMaskVisibility)
  map.on('style.load', ensureShaanxiMask)
  await ensureShaanxiMask()

  try {
    whlnPlugin = attachLayerControl(map, { beforeId: 'site-city-stats', placement: 'control', position: 'bottom-left', showLayerDetail: false })
    await nextTick()
    const hideWhlnUI = () => { document.querySelectorAll('.maplibregl-ctrl-bottom-left .whln-lc').forEach((el) => el.remove()) }
    hideWhlnUI()
    const ctrlHost = document.querySelector('.maplibregl-ctrl-bottom-left')
    if (ctrlHost) {
      window.__whlnLcHider = new MutationObserver(() => { hideWhlnUI(); syncMaskVisibility() })
      window.__whlnLcHider.observe(ctrlHost, { childList: true })
    }
    whlnPlugin.setVisibleIds?.(layerVisibleIds.value.filter((id) => WHLN_LAYER_IDS.includes(id)))
    whlnPlugin.subscribe?.((ids) => {
      layerVisibleIds.value = [...layerVisibleIds.value.filter((id) => !WHLN_LAYER_IDS.includes(id)), ...ids]
      emits('featureVisibleChange', ids)
      syncMaskVisibility()
    })
  } catch (err) { console.warn('[whln] 图层控制挂载失败:', err) }
}

onMounted(() => { fetchStageList(); fetchProjectList(); fetchMapProjects(); fetchOverviewStats(); fetchCityStats() })
onUnmounted(() => {
  if (window.__whlnLcHider) { window.__whlnLcHider.disconnect(); window.__whlnLcHider = null }
  whlnPlugin?.destroy?.(); whlnPlugin = null
  unbindZoomListener()
  const map = mapRef.value?.getMap?.()
  if (map) {
    map.off('move', updateDetailCardPosition); map.off('zoom', updateDetailCardPosition)
    map.off('click', handleMapBlankClick); map.off('zoom', syncMaskVisibility)
    map.off('move', syncMaskVisibility); map.off('style.load', ensureShaanxiMask)
  }
})
</script>

<style scoped>
.site-map-page { position: relative; width: 100%; height: 100%; overflow: hidden; background: #f5f7fa; }
.map-layer { position: absolute; inset: 0; z-index: 1; overflow: hidden; }

.config-fullpage { position: absolute; inset: 0; z-index: 10; overflow: auto; background: #fff; }
.config-header { display: flex; align-items: center; gap: 14px; height: 48px; padding: 0 18px; border-bottom: 1px solid #ebeef5; }
.exit-button {
  display: flex; align-items: center; gap: 4px; padding: 6px 11px;
  color: #333; font-size: 12px; background: #fff; border: 1px solid #dcdfe6;
  border-radius: 4px; cursor: pointer;
}
.exit-button:hover { color: #1677ff; border-color: #1677ff; }
.config-header-title { color: #303133; font-size: 14px; font-weight: 600; }
.config-fullpage .config-layout {
  display: grid; grid-template-columns: 43% 57%; max-width: 1200px;
  min-height: 535px; margin: 24px auto; padding: 0 28px;
}

.view-toolbar {
  position: absolute; top: 12px; left: 12px; right: 12px; z-index: 5;
  display: flex; align-items: center; justify-content: space-between;
  gap: 8px; pointer-events: none;
}
.view-toolbar > * { pointer-events: auto; }
.view-tabs {
  display: flex; height: 36px; padding: 3px; gap: 2px;
  background: #fff; border-radius: 6px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  flex-shrink: 0;
}
.view-tab {
  display: flex; align-items: center; gap: 5px; height: 100%; padding: 0 12px;
  color: #444; font-size: 12px; background: transparent; border: 0;
  border-radius: 4px; cursor: pointer;
}
.view-tab:hover { color: #1677ff; }
.view-tab.active { color: #1677ff; background: #e6f2ff; }
.config-button {
  display: flex; align-items: center; gap: 5px; height: 36px; padding: 0 12px;
  color: #333; font-size: 12px; background: #fff; border: 0; border-radius: 6px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1); cursor: pointer;
  flex-shrink: 0;
}
.config-button:hover { color: #1677ff; }

.map-view { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
.map-view > * { pointer-events: auto; }

.map-summary {
  position: absolute; top: 60px; left: 12px; z-index: 2; width: 175px; padding: 12px;
  color: #303133; background: rgba(255,255,255,0.94); border-radius: 6px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.12);
}
.summary-title {
  display: flex; justify-content: space-between; padding-bottom: 9px; margin-bottom: 7px;
  font-size: 12px; font-weight: 600; border-bottom: 1px solid #eee;
}
.summary-location, .summary-row { display: flex; align-items: center; min-height: 31px; font-size: 11px; }
.summary-location { gap: 4px; }
.summary-location strong, .summary-row b { margin-left: auto; font-size: 11px; font-weight: 500; }
.summary-location small, .summary-row small { width: 46px; color: #999; font-size: 9px; text-align: right; }
.summary-row { border-top: 1px solid #f0f0f0; }
.dot { width: 6px; height: 6px; margin-right: 6px; border-radius: 50%; }
.dot.wind { background: #4f9cff; }
.dot.solar { background: #f0c83e; }

.search-panel {
  position: absolute; top: 12px; right: 12px; z-index: 6;
  display: flex; align-items: center; gap: 8px; height: 36px; padding: 0 12px;
  background: #fff; border-radius: 6px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.edit-toolbar {
  position: absolute; top: 12px; right: 12px; z-index: 6;
  display: flex; align-items: center; flex-wrap: wrap; gap: 4px;
  padding: 4px 8px; height: 36px; background: #fff; border-radius: 6px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: calc(100vw - 24px);
}
.edit-tool-button {
  display: flex; align-items: center; gap: 4px; padding: 4px 8px;
  color: #444; font-size: 12px; background: transparent; border: 0;
  border-radius: 4px; cursor: pointer; white-space: nowrap;
}
.edit-tool-button:hover { color: #1677ff; background: #f0f7ff; }
.edit-tool-button.active { color: #1677ff; background: #e6f2ff; }
.edit-tool-button.save { color: #1677ff; font-weight: 500; }
.edit-tool-button.danger { color: #f56c6c; }
.edit-tool-button.danger:hover { color: #f56c6c; background: #fef0f0; }
.edit-tool-button:disabled { opacity: 0.6; cursor: not-allowed; }
.edit-divider { width: 1px; height: 18px; margin: 0 4px; background: #e5e7eb; }

.detail-card {
  position: absolute; z-index: 5; width: 220px; padding: 12px 14px;
  color: #303133; background: rgba(255,255,255,0.98); border-radius: 6px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.18);
  transform: translate(calc(-100% - 16px), 12px); pointer-events: auto;
}
.detail-title {
  padding-bottom: 8px; margin-bottom: 8px; color: #1f2d3d; font-size: 13px;
  font-weight: 600; border-bottom: 1px solid #eee;
}
.detail-row { display: flex; align-items: center; min-height: 22px; font-size: 12px; }
.detail-label { width: 68px; color: #909399; }
.detail-value { flex: 1; color: #303133; }
.detail-sub { color: #a0a5ad; font-size: 11px; }
.detail-actions {
  display: flex; justify-content: space-between; padding-top: 8px; margin-top: 8px;
  border-top: 1px solid #eee;
}
.detail-action {
  padding: 2px 4px; color: #1677ff; font-size: 12px; background: transparent;
  border: 0; cursor: pointer;
}
.detail-action:hover { text-decoration: underline; }
.detail-action.danger { color: #f56c6c; }

.expand-button {
  position: absolute; top: 50%; right: 0; z-index: 3; width: 25px; height: 54px;
  color: #fff; background: rgba(30,30,30,0.4); border: 0;
  border-radius: 5px 0 0 5px; cursor: pointer;
  transition: right 0.25s ease, background 0.15s ease;
}
.expand-button:hover { background: rgba(30, 30, 30, 0.65); }

.project-list-view {
  position: absolute; inset: 0; z-index: 4; height: 100%;
  padding: 60px 20px 12px; overflow: auto; box-sizing: border-box; background: #fff;
}
.list-heading { display: flex; align-items: center; justify-content: space-between; }
.list-title { display: flex; align-items: center; gap: 6px; color: #333; font-size: 13px; font-weight: 600; }
.project-table { width: 100%; margin-top: 2px; }

.project-table :deep(.el-table__row) { height: 56px; }
.project-table :deep(.el-table__cell) { padding: 10px 0; }
.project-table :deep(.el-table__header-wrapper th) {
  background: #f7f8fa; color: #606266; font-weight: 500;
}
.project-table :deep(.el-table__body tr.el-table__row--striped td) { background: #fafbfc; }
.project-table :deep(.el-table__body tr:hover > td) { background: #f5f8ff; }

.status-text.passed { color: #24b26b; }
.status-text.pending { color: #e6a23c; }
.status-text.rejected { color: #f56c6c; }

.pagination-row {
  display: flex; align-items: center; justify-content: flex-end; gap: 18px;
  padding-top: 14px; color: #666; font-size: 12px;
}

.row-actions { display: flex; flex-wrap: wrap; gap: 4px 8px; }
.row-actions .el-button { margin: 0; padding: 0; }

.rate-cell {
  display: inline-flex; flex-direction: column; line-height: 1.2;
  vertical-align: middle; margin-right: 8px;
}
.rate-line { font-size: 11px; white-space: nowrap; }
.rate-value { display: inline-block; vertical-align: middle; }

.create-project-fullpage {
  position: absolute; inset: 0; z-index: 3; display: flex;
  justify-content: flex-end; pointer-events: none;
}
.cp-map-overlay { position: relative; flex: 1; pointer-events: none; }
.cp-search-box {
  position: absolute; top: 18px; left: 18px; width: 300px;
  pointer-events: auto; background: #fff; border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.12);
}
.cp-search-icon { cursor: pointer; color: #909399; }
.cp-draw-actions {
  position: absolute; top: 18px; right: 18px; display: flex; gap: 8px; pointer-events: auto;
}
:deep(.create-project-form) { pointer-events: auto; }
:deep(.maplibregl-ctrl-bottom-right) { display: none; }
:deep(.maplibregl-ctrl-top-right) { display: none; }

@media (max-width: 1100px) {
  .project-list-view { padding-right: 10px; padding-left: 10px; }
  .config-fullpage .config-layout { grid-template-columns: 1fr; padding: 0 16px; }
  .create-project-fullpage { flex-direction: column; }
}
</style>