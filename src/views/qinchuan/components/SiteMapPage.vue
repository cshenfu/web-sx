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

        <!-- 右上：编辑工具栏 -->
        <div v-if="selectedProject && !showVerifyPanel && !showDetailPanel" class="edit-toolbar">
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
            <button
              class="edit-tool-button"
              :class="{ active: drawingNewPoint }"
              @click="toggleAddPoint"
            >
              {{ drawingNewPoint ? '退出新增' : '新增点' }}
            </button>
            <button class="edit-tool-button danger" @click="deleteSelectedPoints">
              删除选中
            </button>
          </template>

          <span class="edit-divider" />
          <button class="edit-tool-button save" :disabled="saving" @click="saveEdit">
            {{ saving ? '保存中...' : '保存' }}
          </button>
          <button class="edit-tool-button" :disabled="saving" @click="cancelEdit">取消</button>
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
              @click="handleCardAction(action)"
            >
              {{ CARD_ACTION_LABELS[action] || action }}
            </button>
          </div>
        </div>

        <slot name="map-overlay" :projects="projectList" :selected="selectedProject" />

        <button
          v-if="!showProjectDrawer && !showVerifyPanel && !showDetailPanel"
          class="expand-button"
          title="打开项目列表"
          @click="showProjectDrawer = true"
        >
          <el-icon><ArrowRight /></el-icon>
        </button>

        <!-- ★ 左下角：图层控制 -->
        <div class="layer-control">
          <transition name="layer-pop">
            <div v-if="showLayerPanel" class="layer-panel">
              <!-- 底图 -->
              <div class="layer-row">
                <div class="layer-row-label">底图</div>
                <div class="layer-row-body">
                  <button
                    v-for="item in BASE_MAP_OPTIONS"
                    :key="item.key"
                    class="layer-chip"
                    @click="handleBaseMapClick(item)"
                  >
                    <el-icon><component :is="item.icon" /></el-icon>
                    {{ item.label }}
                  </button>
                </div>
              </div>

              <!-- 规划元素 -->
              <div class="layer-row">
                <div class="layer-row-label">规划<br />元素</div>
                <div class="layer-row-body">
                  <button
                    v-for="item in PLANNING_ELEMENT_OPTIONS"
                    :key="item.key"
                    class="layer-chip"
                    :class="{ active: isPlanLayerActive(item.key) }"
                    @click="handlePlanElementClick(item)"
                  >
                    <el-icon><component :is="item.icon" /></el-icon>
                    {{ item.label }}
                  </button>

                  <div class="layer-noise">
                    <el-icon><Bell /></el-icon>
                    <span>噪音距离</span>
                    <el-input v-model="noiseDistance" size="small" class="noise-input" />
                    <span class="noise-unit">m</span>
                  </div>
                </div>
              </div>

              <!-- 地物 / 限制因素 -->
              <div class="layer-row">
                <div class="layer-row-label">规划<br />元素</div>
                <div class="layer-row-body">
                  <button
                    v-for="item in TERRAIN_OPTIONS"
                    :key="item.key"
                    class="layer-chip terrain"
                    @click="handleTerrainClick(item)"
                  >
                    <span class="terrain-dot" :style="{ background: item.color }" />
                    {{ item.label }}
                  </button>
                </div>
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
                  @click="handleRowAction(action, row)"
                >
                  {{ ROW_ACTION_LABELS[action] || action }}
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

    <!-- ★ 右侧项目详情面板 -->
    <ProjectDetailPanel
      :visible="showDetailPanel"
      :project="selectedProject"
      :stage="stage"
      :initial-tab="detailPanelTab"
      @close="showDetailPanel = false"
    />

    <slot name="page-extra" />
  </div>
</template>

<script setup>
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  watch,
} from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  CircleCheck,
  Compass,
  Connection,
  Files,
  Fold,
  Grid,
  Guide,
  InfoFilled,
  Lightning,
  List,
  Location,
  LocationFilled,
  MapLocation,
  Odometer,
  Picture,
  Plus,
  Search,
  Setting,
  Share,
} from '@element-plus/icons-vue'
import MapGL from '@/components/MapGL.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import CreateProjectForm from './CreateProjectform.vue'
import ConfigForm from './ConfigForm.vue'
import TaskPanel from './TaskPanel.vue'
import VerifyPanel from './VerifyPanel.vue'
import ProjectDrawer from './ProjectDrawer.vue'
import { satelliteStyle } from '../js/mapConfig'
import { useZoomThresholdSwitch } from '../js/useZoomThresholdSwitch'
import { searchPlaceName } from '../js/useTiandituGeocode'
import * as api from '@/api/modules/project'
import * as configApi from '@/api/modules/selectConfig'

import fengjiIcon from '@/assets/img/mapIcon/fengji.png'
import shengyazhanIcon from '@/assets/img/mapIcon/shengyazhan.png'

import ProjectDetailPanel from './ProjectDetailPanel.vue'

// =================== props ===================
const props = defineProps({
  // 阶段编码；空字符串 = 不过滤（智能选址用）
  stage: { type: String, default: '' },
  summaryTitle: { type: String, default: '项目通道概况' },
  cardActions: {
    type: Array,
    default: () => ['share', 'reserve', 'verify', 'edit', 'delete'],
  },
  // 'verify' → 核查状态 | 'approval' → 审批状态 | 'none' → 隐藏第 7 列
  statusColumn: {
    type: String,
    default: 'verify',
    validator: (v) => ['verify', 'approval', 'none'].includes(v),
  },
  // 操作列按钮
  rowActions: {
    type: Array,
    default: () => ['edit', 'delete'],
  },
  showConfigPage: { type: Boolean, default: false },
  showVerifyPanelFlag: { type: Boolean, default: false },
})

// =================== 常量 ===================
const ICON_FENGJI = 'icon-fengji'
const ICON_SHENGYAZHAN = 'icon-shengyazhan'
const ICON_SIZE_WIND = 0.08
const ICON_SIZE_BOOSTER = 0.08

const CITY_LAYER_ID = 'site-city-stats'
const PROVINCE_CODE = '610000'
const CITY_GEOJSON_URL = 'https://geo.datav.aliyun.com/areas_v3/bound/610000_full.json'

const CARD_ACTION_LABELS = {
  share: '分享',
  reserve: '储备',
  establish: '立项',
  verify: '核查',
  edit: '编辑',
  delete: '删除',
}

// 行操作按钮标签
const ROW_ACTION_LABELS = {
  material: '立项材料',
  establishMeeting: '立项上会',
  researchMaterial: '可研材料',
  researchReview: '可研审查',
  investMaterial: '投资材料',
  investMeeting: '投决上会',
  assign: '分配',
  reserve: '储备',
  verify: '核查',
  share: '分享',
  edit: '编辑',
  delete: '删除',
}

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
  { label: '商洛市', value: '611000' },
]

const CITY_LABEL_CENTER = {
  '610100': [108.945, 34.26],
  '610200': [108.980, 35.10],
  '610300': [107.140, 34.36],
  '610400': [108.180, 34.52],
  '610500': [109.510, 34.83],
  '610600': [109.100, 36.58],
  '610700': [107.030, 33.06],
  '610800': [109.730, 38.28],
  '610900': [109.030, 32.68],
  '611000': [109.940, 33.86],
}

const STAGE_THEMES = {
  DEFAULT: {
    cityFillStops: ['interpolate', ['linear'], ['get', 'totalCapacity'],
      0, '#e9d5ff', 30, '#c084fc', 80, '#a855f7', 150, '#7c3aed'],
    cityOutline: '#f0abfc',
  },
  PROJECT_RESERVE: {
    cityFillStops: ['interpolate', ['linear'], ['get', 'totalCapacity'],
      0, '#bfdbfe', 30, '#60a5fa', 80, '#3b82f6', 150, '#1d4ed8'],
    cityOutline: '#93c5fd',
  },
  PROJECT_INITIATION: {
    cityFillStops: ['interpolate', ['linear'], ['get', 'totalCapacity'],
      0, '#bbf7d0', 30, '#4ade80', 80, '#22c55e', 150, '#15803d'],
    cityOutline: '#86efac',
  },
  FEASIBILITY_REVIEW: {
    cityFillStops: ['interpolate', ['linear'], ['get', 'totalCapacity'],
      0, '#fed7aa', 30, '#fb923c', 80, '#f97316', 150, '#c2410c'],
    cityOutline: '#fdba74',
  },
  INVESTMENT_DECISION: {
    cityFillStops: ['interpolate', ['linear'], ['get', 'totalCapacity'],
      0, '#fecaca', 30, '#f87171', 80, '#ef4444', 150, '#b91c1c'],
    cityOutline: '#fca5a5',
  },
}

const showDetailPanel = ref(false)
const detailPanelTab = ref('main')

const theme = computed(() => STAGE_THEMES[props.stage] || STAGE_THEMES.DEFAULT)

const AREA_STYLE = {
  FD: {
    color: '#3b82f6', opacity: 0.22, outlineColor: '#60a5fa',
    highlight: { color: '#2563eb', opacity: 0.38, outlineColor: '#93c5fd' },
  },
  GF: {
    color: '#a855f7', opacity: 0.22, outlineColor: '#c084fc',
    highlight: { color: '#7c3aed', opacity: 0.38, outlineColor: '#d8b4fe' },
  },
}

// =================== 地图 ===================
const mapRef = ref(null)
const mapReady = ref(false)
const viewMode = ref('map')
const showConfig = ref(false)
const showProjectDrawer = ref(false)
const showVerifyPanel = ref(false)

const renderedLayerIds = new Set()
const allMapProjects = ref([])
const selectedProject = ref(null)
const detailCardPos = reactive({ x: 0, y: 0, visible: false })
const editMode = ref('area')
const drawingNewPoint = ref(false)
const saving = ref(false)

const drawerSort = reactive({ key: '', dir: 'desc' })

const overviewStats = reactive({
  totalCapacity: 0, totalCount: 0,
  windCapacity: 0, windCount: 0,
  solarCapacity: 0, solarCount: 0,
})
const cityStats = ref([])
let cityGeoJSONCache = null

const editTools = [
  { key: 'area', label: '编辑场区', icon: Location },
  { key: 'wind', label: '编辑风机', icon: MapLocation },
  { key: 'booster', label: '编辑升压站', icon: CircleCheck },
  { key: 'unavailable', label: '设置不可用区域', icon: InfoFilled },
]

// =================== 图层控制 ===================
const showLayerPanel = ref(false)
const noiseDistance = ref(700)

// 只有 wind / booster 是真实生效的
const layerVisible = reactive({
  wind: true,
  booster: true,
})

const BASE_MAP_OPTIONS = [
  { key: 'resource',  label: '资源图谱', icon: Grid },
  { key: 'satellite', label: '卫星遥感', icon: Compass },
  { key: 'road',      label: '路网',     icon: Share },
  { key: 'terrain',   label: '3D地形',   icon: Picture },
]

const PLANNING_ELEMENT_OPTIONS = [
  { key: 'mast',    label: '测风塔', icon: Odometer },
  { key: 'wind',    label: '风机',   icon: MapLocation },
  { key: 'booster', label: '升压塔', icon: Lightning },
  { key: 'access',  label: '接入塔', icon: Connection },
  { key: 'road',    label: '道路',   icon: Guide },
  { key: 'line',    label: '线路',   icon: Share },
]

const TERRAIN_OPTIONS = [
  { key: 'building',    label: '建筑物',     color: '#2b6cff' },
  { key: 'forest',      label: '林地',       color: '#5ac25a' },
  { key: 'farmland',    label: '耕地',       color: '#26c6a6' },
  { key: 'water',       label: '水系',       color: '#4a9ff5' },
  { key: 'unavailable', label: '不可用',     color: '#d6d9de' },
  { key: 'nature',      label: '自然保护区', color: '#b57edc' },
  { key: 'mining',      label: '矿区',       color: '#f5b942' },
]

function isPlanLayerActive(key) {
  if (key === 'wind' || key === 'booster') return layerVisible[key]
  return false
}

function handleBaseMapClick(item) {
  ElMessage.info(`「${item.label}」功能待开发`)
}

function handleTerrainClick(item) {
  ElMessage.info(`「${item.label}」功能待开发`)
}

function handlePlanElementClick(item) {
  // 仅风机 / 升压塔真实生效
  if (item.key === 'wind' || item.key === 'booster') {
    layerVisible[item.key] = !layerVisible[item.key]
    const layerId = item.key === 'wind' ? 'project-wind-all' : 'project-booster-all'
    const map = mapRef.value?.getMap?.()
    if (map?.getLayer(layerId)) {
      map.setLayoutProperty(
        layerId,
        'visibility',
        layerVisible[item.key] ? 'visible' : 'none'
      )
    }
    ElMessage.success(`${layerVisible[item.key] ? '已显示' : '已隐藏'}${item.label}`)
    return
  }
  ElMessage.info(`「${item.label}」功能待开发`)
}

// 渲染完成后统一应用可见性
function applyLayerVisibility() {
  const map = mapRef.value?.getMap?.()
  if (!map) return
  const setVis = (id, visible) => {
    if (map.getLayer(id)) {
      map.setLayoutProperty(id, 'visibility', visible ? 'visible' : 'none')
    }
  }
  setVis('project-wind-all', layerVisible.wind)
  setVis('project-booster-all', layerVisible.booster)
}

// =================== 创建项目 ===================
const showCreateProject = ref(false)
const createProjectFormRef = ref(null)
const placeSearchKeyword = ref('')

function openCreateProject() {
  showCreateProject.value = true
  if (mapReady.value) nextTick(() => startCreateDrawing())
}
function closeCreateProject() {
  showCreateProject.value = false
  placeSearchKeyword.value = ''
}
function startCreateDrawing() { createProjectFormRef.value?.startPolygonDrawing?.() }
function saveCreateDrawing() { createProjectFormRef.value?.handleMapDrawSave?.() }
function clearCreateDrawing() { createProjectFormRef.value?.handleMapDrawClear?.() }
function onProjectCreated() {
  showCreateProject.value = false
  placeSearchKeyword.value = ''
  viewMode.value = 'list'
  pagination.page = 1
  fetchProjectList()
  fetchMapProjects()
  fetchOverviewStats()
  fetchCityStats()
}
async function handlePlaceSearch() {
  if (!placeSearchKeyword.value.trim()) return
  try {
    const { lng, lat } = await searchPlaceName(placeSearchKeyword.value.trim())
    mapRef.value?.getMap?.()?.flyTo({ center: [lng, lat], zoom: 11, duration: 1500 })
  } catch (err) {
    ElMessage.warning(err.message || '未找到匹配的地名')
  }
}

// =================== 筛选 ===================
const filters = reactive({
  province: '610000',
  city: '', district: '',
  itemType: '', projectStage: '',
  approvalStatus: '', managerCompany: '', managerName: '',
  createTimeStart: '', createTimeEnd: '',
  projectCode: '', projectName: '', isVerified: '',
})

// =================== 列表 ===================
const projectList = ref([])
const listLoading = ref(false)
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

const ITEM_TYPE_MAP = { FD: '风电', GF: '光伏' }
const APPROVAL_STATUS_MAP = {
  NO_APPROVAL: '未审批', APPROVED: '审批通过', REJECTED: '审批不通过',
}
const APPROVAL_STATUS_CLASS = {
  NO_APPROVAL: 'pending', APPROVED: 'passed', REJECTED: 'rejected',
}

const stageOptions = ref([])
const stageMap = computed(() =>
  Object.fromEntries(stageOptions.value.map(item => [item.code, item.desc]))
)

// ★ 第 7 列配置
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
  try {
    const res = await api.getStageList()
    stageOptions.value = res?.data ?? []
  } catch {
    stageOptions.value = []
  }
}
function formatRegion(row) {
  const names = [row.provinceName, row.cityName, row.districtName].filter(Boolean)
  return names.length ? names.join('/') : (row.address || '-')
}
function formatRate(val) {
  return val === null || val === undefined || val === '' ? '-' : `${val}%`
}

async function fetchProjectList() {
  listLoading.value = true
  try {
    const params = {
      pageNo: pagination.page,
      pageSize: pagination.pageSize,
      province: filters.province,
    }

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
    if (filters.isVerified !== '' && filters.isVerified !== null) {
      params.isVerified = String(filters.isVerified)
    }

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
  } finally {
    listLoading.value = false
  }
}

function handleSearch() { pagination.page = 1; fetchProjectList() }
function handleReset() {
  Object.assign(filters, {
    city: '', district: '', itemType: '', projectStage: '',
    approvalStatus: '', managerCompany: '', managerName: '',
    createTimeStart: '', createTimeEnd: '',
    projectCode: '', projectName: '', isVerified: '',
  })
  drawerSort.key = ''; drawerSort.dir = 'desc'
  pagination.page = 1
  fetchProjectList()
}
function handlePageChange(page) { pagination.page = page; fetchProjectList() }
function handleSizeChange(size) { pagination.pageSize = size; pagination.page = 1; fetchProjectList() }
function handleEdit(row) { console.log('edit', row.id) }

function handleDelete(row) {
  ElMessageBox.confirm(`确认删除项目「${row.projectName || ''}」吗？`, '提示', {
    type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消',
  })
    .then(() => {
      ElMessage.success('删除成功')
      if (projectList.value.length === 1 && pagination.page > 1) pagination.page -= 1
      fetchProjectList(); fetchMapProjects(); fetchOverviewStats(); fetchCityStats()
    })
    .catch(() => {})
}

// ★ 行操作统一入口
function handleRowAction(action, row) {
  if (action === 'delete') { handleDelete(row); return }

  if (action === 'edit') {
    openDetailPanel(row, 'main')
    return
  }
  if (['material', 'researchMaterial', 'investMaterial'].includes(action)) {
    openDetailPanel(row, 'material')
    return
  }
  if (['establishMeeting', 'researchReview', 'investMeeting'].includes(action)) {
    openDetailPanel(row, 'meeting')
    return
  }
  if (action === 'verify') {
    const p = allMapProjects.value.find(item => item.id === row.id)
    if (!p) { ElMessage.warning('地图上未找到该项目'); return }
    showProjectDrawer.value = false
    viewMode.value = 'map'
    const centroid = getProjectCentroid(p)
    if (centroid) {
      mapRef.value?.getMap?.()?.flyTo({ center: centroid, zoom: 13, duration: 1200 })
    }
    setTimeout(() => {
      onProjectClick(p.id)
      showVerifyPanel.value = true
    }, 1300)
    return
  }

  const label = ROW_ACTION_LABELS[action] || action
  ElMessage.info(`点击了「${label}」：${row.projectName || ''}`)
}

// 打开右侧详情面板
function openDetailPanel(row, tab) {
  const p = allMapProjects.value.find(item => item.id === row.id)
  if (!p) {
    ElMessage.warning('地图上未找到该项目')
    return
  }
  const centroid = getProjectCentroid(p)
  if (centroid) {
    mapRef.value?.getMap?.()?.flyTo({ center: centroid, zoom: 13, duration: 1200 })
  }
  showProjectDrawer.value = false
  viewMode.value = 'map'
  setTimeout(() => {
    onProjectClick(p.id)
    detailPanelTab.value = tab
    showDetailPanel.value = true
  }, 1300)
}

// =================== 看板 ===================
async function fetchOverviewStats() {
  try {
    const payload = { regionCode: PROVINCE_CODE, regionType: 'PROVINCE' }
    if (props.stage) payload.projectStage = props.stage

    const res = await configApi.overViewData(payload)
    const data = res?.data ?? {}
    overviewStats.totalCapacity = data.totalCapacity ?? 0
    overviewStats.totalCount = data.totalCount ?? 0
    overviewStats.windCapacity = data.windCapacity ?? 0
    overviewStats.windCount = data.windCount ?? 0
    overviewStats.solarCapacity = data.solarCapacity ?? 0
    overviewStats.solarCount = data.solarCount ?? 0
  } catch (err) {
    console.error('[stats] overViewData 失败:', err)
  }
}

async function fetchCityStats() {
  try {
    const payload = { provinceCode: PROVINCE_CODE }
    if (props.stage) payload.projectStage = props.stage

    const res = await configApi.provinceViewData(payload)
    cityStats.value = res?.data ?? []
    if (mapReady.value && !isAreaView.value) {
      await renderCityStats()
    }
  } catch (err) {
    console.error('[stats] provinceViewData 失败:', err)
  }
}

// =================== 市级面 ===================
async function loadCityGeoJSON() {
  if (cityGeoJSONCache) return cityGeoJSONCache
  try {
    const res = await fetch(CITY_GEOJSON_URL)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    cityGeoJSONCache = await res.json()
    return cityGeoJSONCache
  } catch (err) {
    console.error('[city] GeoJSON 加载失败:', err)
    return null
  }
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
    return {
      ...f,
      properties: {
        ...f.properties,
        regionCode: code,
        regionName: stat?.regionName || f.properties.name || '',
        totalCapacity: Number(stat?.totalCapacity) || 0,
        center,
      },
    }
  })

  mapRef.value.addFillLayer({
    id: CITY_LAYER_ID,
    geojson: { type: 'FeatureCollection', features },
    fillColor: theme.value.cityFillStops,
    fillOpacity: 0.55,
    outlineColor: theme.value.cityOutline,
    outlineWidth: 1.2,
  })

  const labelFeatures = features
    .filter((f) => Array.isArray(f.properties.center) && f.properties.center.length === 2)
    .map((f) => ({
      type: 'Feature',
      properties: f.properties,
      geometry: { type: 'Point', coordinates: f.properties.center },
    }))

  mapRef.value.addSymbolLayer({
    id: `${CITY_LAYER_ID}-labels`,
    geojson: { type: 'FeatureCollection', features: labelFeatures },
    layout: {
      'text-field': [
        'format',
        ['get', 'totalCapacity'], { 'font-scale': 1.25 },
        'MW', { 'font-scale': 0.85 },
        '\n',
        ['get', 'regionName'], { 'font-scale': 0.85 },
      ],
      'text-size': 13,
      'text-anchor': 'center',
      'text-allow-overlap': true,
      'text-ignore-placement': true,
      'text-line-height': 1.1,
    },
    paint: {
      'text-color': '#ffffff',
      'text-halo-color': '#000000',
      'text-halo-width': 1.6,
    },
  })
}

function hideCityStats() {
  mapRef.value?.removeLayer(CITY_LAYER_ID)
  mapRef.value?.removeLayer(`${CITY_LAYER_ID}-labels`)
}

// =================== 项目数据 ===================
function getProjectCoords(project) {
  return (project.coordinate || [])
    .map((c) => [Number(c.longitude), Number(c.latitude)])
    .filter(([lng, lat]) => Number.isFinite(lng) && Number.isFinite(lat))
}
function getProjectCentroid(project) {
  const coords = getProjectCoords(project)
  if (!coords.length) return null
  let sumLng = 0, sumLat = 0
  for (const [lng, lat] of coords) { sumLng += lng; sumLat += lat }
  return [sumLng / coords.length, sumLat / coords.length]
}
function buildAreaFeature(project) {
  const coords = getProjectCoords(project)
  if (coords.length < 3) return null
  const first = coords[0], last = coords[coords.length - 1]
  if (first[0] !== last[0] || first[1] !== last[1]) coords.push([first[0], first[1]])
  return {
    type: 'Feature',
    properties: {
      projectId: project.id,
      projectCode: project.projectCode,
      projectName: project.projectName,
      itemType: project.itemType,
    },
    geometry: { type: 'Polygon', coordinates: [coords] },
  }
}
function buildWindFC(project) {
  return {
    type: 'FeatureCollection',
    features: (project.windTurbinePoints || [])
      .map((p, index) => {
        const lng = Number(p.longitude), lat = Number(p.latitude)
        if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null
        return {
          type: 'Feature',
          properties: { projectId: project.id, index, isAlternative: p.isAlternative },
          geometry: { type: 'Point', coordinates: [lng, lat] },
        }
      })
      .filter(Boolean),
  }
}
function buildBoosterFC(project) {
  return {
    type: 'FeatureCollection',
    features: (project.boosterStationLocations || [])
      .map((p, index) => {
        const lng = Number(p.lng), lat = Number(p.lat)
        if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null
        return {
          type: 'Feature',
          properties: { projectId: project.id, index, isBest: p.isBest },
          geometry: { type: 'Point', coordinates: [lng, lat] },
        }
      })
      .filter(Boolean),
  }
}

function clearProjectLayers() {
  if (!mapRef.value) return
  for (const id of renderedLayerIds) mapRef.value.removeLayer(id)
  renderedLayerIds.clear()
}

async function safeAddIcon({
  layerId, featureCollection,
  iconId, iconUrl, iconSize, iconAnchor = 'center',
  fallbackColor = '#3b82f6', fallbackRadius = 8,
}) {
  try {
    await mapRef.value.ensureImage(iconId, iconUrl)
    await mapRef.value.addImagePoints({
      id: layerId, geojson: featureCollection,
      iconId, iconUrl, iconSize, iconAnchor,
    })
  } catch (err) {
    mapRef.value.addPoints({
      id: layerId, geojson: featureCollection,
      color: fallbackColor, radius: fallbackRadius,
    })
  }
  renderedLayerIds.add(layerId)
}

function addProjectArea(project, highlighted = false) {
  const area = buildAreaFeature(project)
  if (!area) return
  const layerId = `project-area-${project.id}`
  const style = AREA_STYLE[project.itemType] || AREA_STYLE.FD
  const s = highlighted ? style.highlight : style
  mapRef.value.addPolygon({
    id: layerId, geojson: area,
    color: s.color, opacity: s.opacity, outlineColor: s.outlineColor,
  })
  renderedLayerIds.add(layerId)

  const fillLayerId = `${layerId}-fill`
  mapRef.value.offClick(fillLayerId)
  mapRef.value.onClick(fillLayerId, () => onProjectClick(project.id))
}

async function renderProjectsByStage(stage) {
  if (!mapReady.value || !mapRef.value) return
  clearProjectLayers()
  const projects = allMapProjects.value
  if (!projects.length || stage === 'overview') return

  const allWindFeatures = []
  const allBoosterFeatures = []

  for (const p of projects) {
    addProjectArea(p, p.id === selectedProject.value?.id)
    const wf = buildWindFC(p); if (wf.features.length) allWindFeatures.push(...wf.features)
    const bf = buildBoosterFC(p); if (bf.features.length) allBoosterFeatures.push(...bf.features)
  }

  if (allWindFeatures.length) {
    await safeAddIcon({
      layerId: 'project-wind-all',
      featureCollection: { type: 'FeatureCollection', features: allWindFeatures },
      iconId: ICON_FENGJI, iconUrl: fengjiIcon,
      iconSize: ICON_SIZE_WIND, iconAnchor: 'bottom',
      fallbackColor: '#22c55e', fallbackRadius: 3,
    })
  }
  if (allBoosterFeatures.length) {
    await safeAddIcon({
      layerId: 'project-booster-all',
      featureCollection: { type: 'FeatureCollection', features: allBoosterFeatures },
      iconId: ICON_SHENGYAZHAN, iconUrl: shengyazhanIcon,
      iconSize: ICON_SIZE_BOOSTER, iconAnchor: 'bottom',
      fallbackColor: '#ef4444', fallbackRadius: 3,
    })
  }

  // ★ 应用图层可见性
  applyLayerVisibility()
}

async function fetchMapProjects() {
  try {
    const params = { pageNo: 1, pageSize: 100, province: '610000' }
    if (props.stage) params.projectStage = props.stage

    const res = await api.getPageList(params)
    const data = res?.data ?? {}
    allMapProjects.value = data.list ?? []
    if (mapReady.value && isAreaView.value) {
      await renderProjectsByStage('area')
    }
  } catch (err) {
    ElMessage.error(err?.message || '地图项目数据加载失败')
  }
}

// =================== 选中 ===================
const windCount = computed(() => selectedProject.value?.windTurbinePoints?.length || 0)
const altCount = computed(
  () => (selectedProject.value?.windTurbinePoints || [])
    .filter((p) => p.isAlternative === 1 || p.isAlternative === true).length
)

async function onProjectClick(projectId) {
  if (selectedProject.value?.id === projectId) return
  clearSelectionLayers()
  const project = allMapProjects.value.find((p) => p.id === projectId)
  if (!project) return
  selectedProject.value = project
  addProjectArea(project, true)
  updateDetailCardPosition()
  initEditBuffer(project)
  enterEditMode('area')
}

function clearSelectionLayers() {
  if (!selectedProject.value) return
  const pid = selectedProject.value.id
  showVerifyPanel.value = false
  showDetailPanel.value = false
  mapRef.value?.clearEditableAreas()
  editBuffer.value = null
  drawingNewPoint.value = false
  const project = allMapProjects.value.find((p) => p.id === pid)
  if (project && isAreaView.value) addProjectArea(project, false)
  selectedProject.value = null
  detailCardPos.visible = false
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
  for (const id of renderedLayerIds) {
    if (id.startsWith('project-area-')) areaLayerIds.push(`${id}-fill`)
  }
  if (!areaLayerIds.length) return
  if (!map.queryRenderedFeatures(e.point, { layers: areaLayerIds }).length) {
    clearSelectionLayers()
  }
}

function handleCardAction(type) {
  const p = selectedProject.value
  const name = p?.projectName || ''

  if (type === 'verify') {
    showProjectDrawer.value = false
    showDetailPanel.value = false
    showVerifyPanel.value = true
    return
  }

  if (type === 'delete') {
    ElMessageBox.confirm(`确认删除项目「${name}」吗？`, '提示', {
      type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消',
    })
      .then(() => {
        ElMessage.success('删除成功')
        clearSelectionLayers()
        fetchMapProjects(); fetchProjectList(); fetchOverviewStats(); fetchCityStats()
      })
      .catch(() => {})
    return
  }

  // ★ 编辑 / 分享 / 储备 等 → 统一走打开详情面板
  if (type === 'edit') {
    detailPanelTab.value = 'main'
    showDetailPanel.value = true
    return
  }
  if (['material', 'researchMaterial', 'investMaterial'].includes(type)) {
    detailPanelTab.value = 'material'
    showDetailPanel.value = true
    return
  }
  if (['establishMeeting', 'researchReview', 'investMeeting'].includes(type)) {
    detailPanelTab.value = 'meeting'
    showDetailPanel.value = true
    return
  }

  const labels = CARD_ACTION_LABELS
  ElMessage.info(`点击了「${labels[type] || type}」：${name}`)
}

function onVerifySaved(data) {
  console.log('[verify] 已保存:', data)
  showVerifyPanel.value = false
}

// =================== 抽屉 ===================
async function focusProject(project) {
  const p = allMapProjects.value.find((item) => item.id === project.id)
  if (!p) { ElMessage.warning('地图上未找到该项目'); return }
  const centroid = getProjectCentroid(p)
  if (!centroid) { ElMessage.warning('该项目缺少坐标信息'); return }
  const map = mapRef.value?.getMap?.()
  if (!map) return
  showProjectDrawer.value = false
  map.flyTo({ center: centroid, zoom: 13, duration: 1200 })
  setTimeout(() => onProjectClick(p.id), 1300)
}

function handleDrawerAction({ type, project }) {
  const p = allMapProjects.value.find((item) => item.id === project.id)
  if (!p) return

  if (type === 'edit') {
    openDetailPanel(p, 'main')
    return
  }
  if (['material', 'researchMaterial', 'investMaterial'].includes(type)) {
    openDetailPanel(p, 'material')
    return
  }
  if (['establishMeeting', 'researchReview', 'investMeeting'].includes(type)) {
    openDetailPanel(p, 'meeting')
    return
  }
  if (type === 'delete') {
    ElMessageBox.confirm(`确认删除项目「${p.projectName}」吗？`, '提示', {
      type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消',
    })
      .then(() => {
        ElMessage.success('删除成功')
        fetchProjectList(); fetchMapProjects(); fetchOverviewStats(); fetchCityStats()
      })
      .catch(() => {})
    return
  }

  const labels = { assign: '分配' }
  ElMessage.info(`点击了「${labels[type] || type}」：${p.projectName}`)
}

function handleDrawerSortChange({ key, dir }) {
  drawerSort.key = key
  drawerSort.dir = dir
  pagination.page = 1
  fetchProjectList()
}

// 切到列表模式时，自动关闭右侧抽屉（避免重复）+ 收起图层面板
watch(viewMode, (val) => {
  if (val === 'list') {
    if (showProjectDrawer.value) showProjectDrawer.value = false
    if (showLayerPanel.value) showLayerPanel.value = false
  }
})
watch(showProjectDrawer, (val) => {
  if (val) { pagination.page = 1; fetchProjectList() }
})

// =================== 编辑 ===================
const editBuffer = ref(null)
let suppressDrawSync = false

function initEditBuffer(project) {
  const area = getProjectCoords(project)
  const wind = (project.windTurbinePoints || [])
    .map(p => [Number(p.longitude), Number(p.latitude)])
    .filter(([lng, lat]) => Number.isFinite(lng) && Number.isFinite(lat))
  const booster = (project.boosterStationLocations || [])
    .map(p => [Number(p.lng), Number(p.lat)])
    .filter(([lng, lat]) => Number.isFinite(lng) && Number.isFinite(lat))
  editBuffer.value = { area, wind, booster, unavailable: [] }
}

function closeRing(coords) {
  if (!coords || coords.length < 3) return coords
  const first = coords[0], last = coords[coords.length - 1]
  if (first[0] !== last[0] || first[1] !== last[1]) return [...coords, [first[0], first[1]]]
  return coords
}

function syncDrawToBuffer() {
  if (!editBuffer.value) return
  const draw = mapRef.value?.getDraw?.()
  const all = draw?.getAll?.() || { type: 'FeatureCollection', features: [] }
  const mode = editMode.value
  if (mode === 'area') {
    const af = all.features.find(f => f.properties?.kind === 'area')
    if (af && af.geometry?.type === 'Polygon') {
      editBuffer.value.area = af.geometry.coordinates[0].map(c => [c[0], c[1]])
    }
  } else if (mode === 'wind') {
    editBuffer.value.wind = all.features.filter(f => f.properties?.kind === 'wind').map(f => f.geometry.coordinates)
  } else if (mode === 'booster') {
    editBuffer.value.booster = all.features.filter(f => f.properties?.kind === 'booster').map(f => f.geometry.coordinates)
  } else if (mode === 'unavailable') {
    editBuffer.value.unavailable = all.features
      .filter(f => !f.properties?.kind || f.properties.kind === 'unavailable')
      .map(f => f.geometry)
  }
  refreshAllPointsLayers()
}

function enterEditMode(mode) {
  if (!selectedProject.value || !editBuffer.value) return
  const draw = mapRef.value?.getDraw?.()
  if (!draw) return
  suppressDrawSync = true
  editMode.value = mode
  drawingNewPoint.value = false
  mapRef.value.clearEditableAreas()

  if (mode === 'area') {
    const coords = editBuffer.value.area
    if (coords && coords.length >= 3) {
      mapRef.value.loadEditableAreas({
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          id: `edit-area-${selectedProject.value.id}`,
          properties: { kind: 'area' },
          geometry: { type: 'Polygon', coordinates: [closeRing(coords)] },
        }],
      })
      const all = draw.getAll()
      if (all.features.length) draw.changeMode('direct_select', { featureId: all.features[0].id })
    }
  } else if (mode === 'wind') {
    const features = editBuffer.value.wind.map((coords, i) => ({
      type: 'Feature', id: `edit-wind-${i}`,
      properties: { kind: 'wind', index: i },
      geometry: { type: 'Point', coordinates: coords },
    }))
    if (features.length) mapRef.value.loadEditableAreas({ type: 'FeatureCollection', features })
    draw.changeMode('simple_select')
  } else if (mode === 'booster') {
    const features = editBuffer.value.booster.map((coords, i) => ({
      type: 'Feature', id: `edit-booster-${i}`,
      properties: { kind: 'booster', index: i },
      geometry: { type: 'Point', coordinates: coords },
    }))
    if (features.length) mapRef.value.loadEditableAreas({ type: 'FeatureCollection', features })
    draw.changeMode('simple_select')
  } else if (mode === 'unavailable') {
    draw.changeMode('draw_polygon')
  }
  suppressDrawSync = false
}

function onDrawChange() {
  if (suppressDrawSync) return
  syncDrawToBuffer()
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
    ElMessage.info('点击地图添加新点，添加完记得点"保存"')
  }
}

function deleteSelectedPoints() {
  const draw = mapRef.value?.getDraw?.()
  if (!draw) return
  const ids = draw.getSelectedIds()
  if (!ids.length) { ElMessage.warning('请先点击选中要删除的点'); return }
  draw.delete(ids)
  syncDrawToBuffer()
  ElMessage.success(`已删除 ${ids.length} 个点`)
}

function refreshAllPointsLayers() {
  if (!mapRef.value || !editBuffer.value || !selectedProject.value) return
  const map = mapRef.value.getMap?.()
  if (!map) return
  const pid = selectedProject.value.id
  const other = allMapProjects.value.filter(p => p.id !== pid)

  const windFeatures = []
  for (const p of other) { const fc = buildWindFC(p); if (fc.features.length) windFeatures.push(...fc.features) }
  for (const [lng, lat] of editBuffer.value.wind) {
    windFeatures.push({ type: 'Feature', properties: { projectId: pid }, geometry: { type: 'Point', coordinates: [lng, lat] } })
  }

  const boosterFeatures = []
  for (const p of other) { const fc = buildBoosterFC(p); if (fc.features.length) boosterFeatures.push(...fc.features) }
  for (const [lng, lat] of editBuffer.value.booster) {
    boosterFeatures.push({ type: 'Feature', properties: { projectId: pid }, geometry: { type: 'Point', coordinates: [lng, lat] } })
  }

  if (map.getSource('project-wind-all')) {
    map.getSource('project-wind-all').setData({ type: 'FeatureCollection', features: windFeatures })
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
    regionCode: fallbackRegionCode,
    longitude: String(lng),
    latitude: String(lat),
  }))

  const originalWind = project.windTurbinePoints || []
  const windTurbinePoints = editBuffer.value.wind.map(([lng, lat]) => {
    const match = originalWind.find(p =>
      Math.abs(Number(p.longitude) - lng) < 1e-9 && Math.abs(Number(p.latitude) - lat) < 1e-9)
    return { longitude: lng, latitude: lat, isAlternative: match?.isAlternative ?? 0 }
  })

  const originalBooster = project.boosterStationLocations || []
  const boosterStationLocations = editBuffer.value.booster.map(([lng, lat]) => {
    const match = originalBooster.find(p =>
      Math.abs(Number(p.lng) - lng) < 1e-9 && Math.abs(Number(p.lat) - lat) < 1e-9)
    return { lng, lat, isBest: match?.isBest ?? 0 }
  })

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
    } else {
      ElMessage.error(res?.msg || '保存失败')
    }
  } catch (err) {
    ElMessage.error(err?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

function cancelEdit() {
  mapRef.value?.clearEditableAreas()
  drawingNewPoint.value = false
  if (selectedProject.value) {
    initEditBuffer(selectedProject.value)
    editMode.value = 'area'
    enterEditMode('area')
    refreshAllPointsLayers()
  }
}

// =================== 缩放阈值 ===================
const { isAreaView, syncByZoom, bindZoomListener, unbindZoomListener } = useZoomThresholdSwitch({
  mapRef,
  onEnter: () => { hideCityStats(); renderProjectsByStage('area') },
  onExit: () => {
    clearSelectionLayers()
    renderProjectsByStage('overview')
    if (cityStats.value.length) renderCityStats()
  },
})

// =================== 地图就绪 ===================
async function onMapReady() {
  mapReady.value = true
  if (showCreateProject.value) nextTick(() => startCreateDrawing())
  const map = mapRef.value.getMap()
  map.on('move', updateDetailCardPosition)
  map.on('zoom', updateDetailCardPosition)
  map.on('click', handleMapBlankClick)
  bindZoomListener()
  syncByZoom()
  if (isAreaView.value) {
    hideCityStats()
    renderProjectsByStage('area')
  } else {
    await renderCityStats()
  }
}

// =================== 生命周期 ===================
onMounted(() => {
  fetchStageList()
  fetchProjectList()
  fetchMapProjects()
  fetchOverviewStats()
  fetchCityStats()
})

onUnmounted(() => {
  unbindZoomListener()
  const map = mapRef.value?.getMap?.()
  if (map) {
    map.off('move', updateDetailCardPosition)
    map.off('zoom', updateDetailCardPosition)
    map.off('click', handleMapBlankClick)
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
}

/* ================= 左下角图层控制 ================= */
.layer-control {
  position: absolute;
  left: 12px;
  bottom: 12px;
  z-index: 6;
}

.layer-toggle-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  color: #5a6472;
  font-size: 22px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 10px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.16);
  backdrop-filter: blur(8px);
  cursor: pointer;
  transition: color 0.16s, background 0.16s, border-color 0.16s;
}
.layer-toggle-button:hover { color: #1677ff; }
.layer-toggle-button.active {
  color: #1677ff;
  background: #e8f2ff;
  border-color: #b9d8ff;
}

/* ★ 512 x 246 固定面板，绝对定位在按钮右侧 */
.layer-panel {
  position: absolute;
  left: 64px;
  bottom: 0;
  box-sizing: border-box;
  width: 512px;
  height: 246px;
  padding: 8px 14px;
  background: rgba(240, 243, 247, 0.93);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 10px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(12px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transform-origin: left bottom;
}

.layer-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 0;
  flex: 1;
  min-height: 0;
}
.layer-row + .layer-row {
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}
.layer-row-label {
  flex: 0 0 44px;
  padding-top: 8px;
  color: #5a6472;
  font-size: 13px;
  line-height: 1.25;
  word-break: break-all;
}
.layer-row-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  align-content: flex-start;
  gap: 8px;
}

.layer-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 30px;
  padding: 0 12px;
  color: #3a4652;
  font-size: 13px;
  line-height: 1;
  background: rgba(255, 255, 255, 0.9);
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
.layer-chip .el-icon { font-size: 15px; }

.layer-chip.terrain { padding: 0 12px 0 10px; }
.terrain-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 3px;
  flex-shrink: 0;
}

.layer-noise {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 30px;
  padding: 0 10px;
  color: #1677ff;
  font-size: 13px;
  background: #e8f2ff;
  border: 1px solid #1677ff;
  border-radius: 6px;
  white-space: nowrap;
}
.layer-noise .el-icon { font-size: 15px; }

.noise-input { width: 62px; }
.layer-noise :deep(.el-input__wrapper) {
  height: 22px;
  padding: 0 6px;
  background: #fff;
  border-radius: 4px;
  box-shadow: none;
}
.layer-noise :deep(.el-input__inner) {
  height: 22px;
  color: #1677ff;
  font-size: 13px;
  text-align: center;
}

/* 展开动画 */
.layer-pop-enter-active,
.layer-pop-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.layer-pop-enter-from,
.layer-pop-leave-to {
  opacity: 0;
  transform: translateX(-8px) scale(0.98);
}

.project-list-view {
  position: absolute; inset: 0; z-index: 4; height: 100%;
  padding: 60px 20px 12px; overflow: auto; box-sizing: border-box; background: #fff;
}
.list-heading { display: flex; align-items: center; justify-content: space-between; }
.list-title { display: flex; align-items: center; gap: 6px; color: #333; font-size: 13px; font-weight: 600; }
.project-table {
  width: 100%;
  margin-top: 2px;
}

/* ★ 行高 */
.project-table :deep(.el-table__row) {
  height: 56px;
}
.project-table :deep(.el-table__cell) {
  padding: 10px 0;
}

/* 表头背景浅灰 */
.project-table :deep(.el-table__header-wrapper th) {
  background: #f7f8fa;
  color: #606266;
  font-weight: 500;
}

/* 斑马纹 */
.project-table :deep(.el-table__body tr.el-table__row--striped td) {
  background: #fafbfc;
}

/* 鼠标悬浮 */
.project-table :deep(.el-table__body tr:hover > td) {
  background: #f5f8ff;
}
.status-text.passed { color: #24b26b; }
.status-text.pending { color: #e6a23c; }
.status-text.rejected { color: #f56c6c; }
.pagination-row {
  display: flex; align-items: center; justify-content: flex-end; gap: 18px;
  padding-top: 14px; color: #666; font-size: 12px;
}

.row-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 8px;
}
.row-actions .el-button {
  margin: 0;
  padding: 0;
}

.rate-cell {
  display: inline-flex;
  flex-direction: column;
  line-height: 1.2;
  vertical-align: middle;
  margin-right: 8px;
}
.rate-line {
  font-size: 11px;
  white-space: nowrap;
}
.rate-value {
  display: inline-block;
  vertical-align: middle;
}

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

@media (max-width: 1100px) {
  .project-list-view { padding-right: 10px; padding-left: 10px; }
  .config-fullpage .config-layout { grid-template-columns: 1fr; padding: 0 16px; }
  .create-project-fullpage { flex-direction: column; }
  .layer-panel { width: calc(100vw - 100px); }
}
</style>