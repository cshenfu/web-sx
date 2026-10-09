<template>
  <div class="site-select-page">
    <!-- 选址配置：全屏页面 -->
    <section v-if="showConfig" class="config-fullpage">
      <div class="config-header">
        <button class="exit-button" @click="closeConfig">
          <el-icon><ArrowLeft /></el-icon>
          退出
        </button>
        <span class="config-header-title">选址配置</span>
      </div>

      <div class="config-layout">
        <!-- 左侧：ConfigForm 组件 -->
        <ConfigForm />

        <!-- 右侧：TaskPanel 组件 -->
        <TaskPanel />
      </div>
    </section>

    <!-- 常驻地图层 -->
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

    <!-- 默认模式：地图 / 列表 -->
    <template v-if="!showConfig && !showCreateProject">
      <div class="view-toolbar">
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

        <button class="config-button" @click="showConfig = true">
          <el-icon><Setting /></el-icon>
          选址配置
        </button>
      </div>

      <section v-if="viewMode === 'map'" class="map-view">
        <!-- 左上：项目通道概况 -->
        <div v-if="!selectedProject" class="map-summary">
          <div class="summary-title">
            <span>项目通道概况</span>
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

        <!-- 右上：放大后的搜索 tab -->
        <div v-if="isAreaView && !selectedProject" class="search-panel">
          <el-select v-model="mapFilters.year" placeholder="年度" size="small" style="width: 90px">
            <el-option label="2026" value="2026" />
            <el-option label="2027" value="2027" />
          </el-select>
          <el-select v-model="mapFilters.type" placeholder="项目类型" size="small" style="width: 100px">
            <el-option label="风电" value="FD" />
            <el-option label="光伏" value="GF" />
          </el-select>
          <el-select v-model="mapFilters.region" placeholder="市/区" size="small" style="width: 100px">
            <el-option label="榆林市" value="610800" />
            <el-option label="延安市" value="610600" />
          </el-select>
          <el-select v-model="mapFilters.verify" placeholder="核查状态" size="small" style="width: 100px">
            <el-option label="未核查" value="0" />
            <el-option label="已核查" value="1" />
          </el-select>
          <el-input
            v-model="mapFilters.projectName"
            placeholder="项目名称"
            size="small"
            clearable
            style="width: 130px"
          >
            <template #suffix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <!-- 右上：编辑工具条 -->
        <div v-if="selectedProject" class="edit-toolbar">
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
          <button
            class="edit-tool-button save"
            :disabled="saving"
            @click="saveEdit"
          >
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

          <div class="detail-actions">
            <button class="detail-action" @click="handleCardAction('share')">分享</button>
            <button class="detail-action" @click="handleCardAction('reserve')">储备</button>
            <button class="detail-action" @click="handleCardAction('verify')">核查</button>
            <button class="detail-action" @click="handleCardAction('edit')">编辑</button>
            <button class="detail-action danger" @click="handleCardAction('delete')">删除</button>
          </div>
        </div>

        <button
          v-if="!isAreaView && !selectedProject"
          class="expand-button"
          title="打开项目列表"
          @click="viewMode = 'list'"
        >
          <el-icon><ArrowRight /></el-icon>
        </button>
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

        <SearchBar @search="handleSearch" @reset="handleReset">
          <el-select v-model="filters.region" placeholder="所属区域" size="small" clearable style="width: 120px">
            <el-option label="陕西省" value="610000" />
            <el-option label="西安市" value="610100" />
            <el-option label="榆林市" value="610800" />
            <el-option label="延安市" value="610600" />
          </el-select>

          <el-select v-model="filters.type" placeholder="项目类型" size="small" clearable style="width: 112px">
            <el-option label="风电" value="风电" />
            <el-option label="光伏" value="光伏" />
          </el-select>

          <el-select v-model="filters.stage" placeholder="全部阶段" size="small" clearable style="width: 120px">
            <el-option v-for="item in stageOptions" :key="item.code" :label="item.desc" :value="item.code" />
          </el-select>

          <el-select v-model="filters.approvalStatus" placeholder="审批状态" size="small" clearable style="width: 112px">
            <el-option label="未审批" value="NO_APPROVAL" />
            <el-option label="审批通过" value="APPROVED" />
            <el-option label="审批不通过" value="REJECTED" />
          </el-select>

          <el-select v-model="filters.company" placeholder="所属公司" size="small" clearable style="width: 130px">
            <el-option label="XXX分公司" value="XXX分公司" />
          </el-select>

          <el-select v-model="filters.owner" placeholder="负责人" size="small" clearable style="width: 100px">
            <el-option label="张三" value="张三" />
            <el-option label="李四" value="李四" />
          </el-select>

          <el-date-picker
            v-model="filters.createdTime"
            type="daterange"
            size="small"
            value-format="YYYY-MM-DD"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width: 220px"
          />

          <el-input v-model="filters.projectNo" placeholder="项目编号" size="small" clearable style="width: 145px" />
          <el-input v-model="filters.projectName" placeholder="项目名称" size="small" clearable style="width: 145px" />
        </SearchBar>

        <el-table v-loading="listLoading" :data="projectList" size="small" stripe class="project-table">
          <el-table-column label="项目编号" min-width="120">
            <template #default="{ row }">{{ row.projectCode || '-' }}</template>
          </el-table-column>

          <el-table-column label="类型" width="80">
            <template #default="{ row }">{{ ITEM_TYPE_MAP[row.itemType] || '-' }}</template>
          </el-table-column>

          <el-table-column label="项目名称" min-width="200" show-overflow-tooltip>
            <template #default="{ row }">{{ row.projectName || '-' }}</template>
          </el-table-column>

          <el-table-column label="项目区域" min-width="160" show-overflow-tooltip>
            <template #default="{ row }">{{ formatRegion(row) }}</template>
          </el-table-column>

          <el-table-column label="规划容量MW" width="110" sortable>
            <template #default="{ row }">{{ row.currentProjectCapacity ?? '-' }}</template>
          </el-table-column>

          <el-table-column label="资本金财务内部收益率%" width="160" sortable>
            <template #default="{ row }">{{ formatRate(row.capitalFinancialRate) }}</template>
          </el-table-column>

          <el-table-column label="阶段" width="110">
            <template #default="{ row }">{{ stageMap[row.projectStage] || '-' }}</template>
          </el-table-column>

          <el-table-column label="审批状态" width="100">
            <template #default="{ row }">
              <span
                v-if="APPROVAL_STATUS_MAP[row.approvalStatus]"
                class="status-text"
                :class="APPROVAL_STATUS_CLASS[row.approvalStatus]"
              >
                {{ APPROVAL_STATUS_MAP[row.approvalStatus] }}
              </span>
            </template>
          </el-table-column>

          <el-table-column label="所属" min-width="120">
            <template #default="{ row }">{{ row.managerCompany || '-' }}</template>
          </el-table-column>

          <el-table-column label="负责人" width="90">
            <template #default="{ row }">{{ row.managerName || '-' }}</template>
          </el-table-column>

          <el-table-column label="备注" min-width="100" show-overflow-tooltip>
            <template #default="{ row }">{{ row.notes || '-' }}</template>
          </el-table-column>

          <el-table-column label="创建时间" width="160">
            <template #default="{ row }">{{ row.createTime || '-' }}</template>
          </el-table-column>

          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
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
  </div>
</template>

<script setup>
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  reactive,
  ref
} from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  ArrowRight,
  CircleCheck,
  Fold,
  InfoFilled,
  List,
  Location,
  LocationFilled,
  MapLocation,
  Plus,
  Search,
  Setting,
} from '@element-plus/icons-vue'
import MapGL from '@/components/MapGL.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import CreateProjectForm from './components/CreateProjectform.vue'
import ConfigForm from './components/ConfigForm.vue'
import TaskPanel from './components/TaskPanel.vue'
import { satelliteStyle } from './js/mapConfig'
import { useZoomThresholdSwitch } from './js/useZoomThresholdSwitch'
import { searchPlaceName } from './js/useTiandituGeocode'
import * as api from '@/api/modules/project'
import * as configApi from '@/api/modules/selectConfig'

// 地图图标
import fengjiIcon from '@/assets/img/mapIcon/fengji.png'
import shengyazhanIcon from '@/assets/img/mapIcon/shengyazhan.png'

// =================== 常量 ===================
const ICON_FENGJI = 'icon-fengji'
const ICON_SHENGYAZHAN = 'icon-shengyazhan'

const ICON_SIZE_WIND = 0.08
const ICON_SIZE_BOOSTER = 0.08

const CITY_LAYER_ID = 'site-city-stats'

const DEFAULT_STAGE = 'PRELIMINARY_SELECTION'
const PROVINCE_CODE = '610000'
// 各市标注坐标（视觉中心，可手动微调）
const CITY_LABEL_CENTER = {
  '610100': [108.945, 34.26],   // 西安市
  '610200': [108.980, 35.10],   // 铜川市
  '610300': [107.140, 34.36],   // 宝鸡市
  '610400': [108.280, 34.52],   // 咸阳市
  '610500': [109.560, 34.83],   // 渭南市
  '610600': [109.100, 36.58],   // 延安市
  '610700': [107.030, 33.06],   // 汉中市
  '610800': [109.730, 38.28],   // 榆林市
  '610900': [109.030, 32.68],   // 安康市
  '611000': [109.940, 33.86],   // 商洛市
}

const CITY_GEOJSON_URL = 'https://geo.datav.aliyun.com/areas_v3/bound/610000_full.json'

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

const renderedLayerIds = new Set()
const allMapProjects = ref([])
const selectedProject = ref(null)
const detailCardPos = reactive({ x: 0, y: 0, visible: false })
const editMode = ref('area')
const drawingNewPoint = ref(false)
const saving = ref(false)

// ---- 看板统计 ----
const overviewStats = reactive({
  totalCapacity: 0,
  totalCount: 0,
  windCapacity: 0,
  windCount: 0,
  solarCapacity: 0,
  solarCount: 0,
})
const cityStats = ref([])

let cityGeoJSONCache = null

const mapFilters = reactive({
  year: '',
  type: '',
  region: '',
  verify: '',
  projectName: ''
})

const editTools = [
  { key: 'area', label: '编辑场区', icon: Location },
  { key: 'wind', label: '编辑风机', icon: MapLocation },
  { key: 'booster', label: '编辑升压站', icon: CircleCheck },
  { key: 'unavailable', label: '设置不可用区域', icon: InfoFilled },
]

// =================== 创建项目 ===================
const showCreateProject = ref(false)
const createProjectFormRef = ref(null)
const placeSearchKeyword = ref('')

function openCreateProject() {
  showCreateProject.value = true
  if (mapReady.value) {
    nextTick(() => startCreateDrawing())
  }
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

// =================== 列表筛选 ===================
const filters = reactive({
  region: '',
  type: '',
  stage: '',
  approvalStatus: '',
  company: '',
  owner: '',
  createdTime: [],
  projectNo: '',
  projectName: ''
})

// =================== 列表分页 ===================
const projectList = ref([])
const listLoading = ref(false)
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

const ITEM_TYPE_MAP = { FD: '风电', GF: '光伏' }
const APPROVAL_STATUS_MAP = {
  NO_APPROVAL: '未审批',
  APPROVED: '审批通过',
  REJECTED: '审批不通过'
}
const APPROVAL_STATUS_CLASS = {
  NO_APPROVAL: 'pending',
  APPROVED: 'passed',
  REJECTED: 'rejected'
}

const stageOptions = ref([])
const stageMap = computed(() =>
  Object.fromEntries(stageOptions.value.map(item => [item.code, item.desc]))
)

async function fetchStageList() {
  try {
    const res = await api.getStageList()
    stageOptions.value = res?.data ?? []
  } catch (err) {
    ElMessage.error(err?.message || '阶段枚举加载失败')
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
    const params = { pageNo: pagination.page, pageSize: pagination.pageSize }
    if (filters.stage) params.projectStage = filters.stage

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

function handleSearch() {
  pagination.page = 1
  fetchProjectList()
}
function handleReset() {
  Object.assign(filters, {
    region: '', type: '', stage: '', approvalStatus: '',
    company: '', owner: '', createdTime: [], projectNo: '', projectName: ''
  })
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
function handleEdit(row) { console.log('edit', row.id) }

function handleDelete(row) {
  ElMessageBox.confirm(`确认删除项目「${row.projectName || ''}」吗？`, '提示', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
    .then(async () => {
      ElMessage.success('删除成功')
      if (projectList.value.length === 1 && pagination.page > 1) pagination.page -= 1
      fetchProjectList()
      fetchMapProjects()
      fetchOverviewStats()
      fetchCityStats()
    })
    .catch(() => {})
}

// =================== 看板统计 ===================
async function fetchOverviewStats() {
  try {
    const res = await configApi.overViewData({
      projectStage: DEFAULT_STAGE,
      regionCode: PROVINCE_CODE,
      regionType: 'PROVINCE'
    })
    const data = res?.data ?? {}
    overviewStats.totalCapacity = data.totalCapacity ?? 0
    overviewStats.totalCount = data.totalCount ?? 0
    overviewStats.windCapacity = data.windCapacity ?? 0
    overviewStats.windCount = data.windCount ?? 0
    overviewStats.solarCapacity = data.solarCapacity ?? 0
    overviewStats.solarCount = data.solarCount ?? 0
    console.log('[stats] 省级概览:', { ...overviewStats })
  } catch (err) {
    console.error('[stats] overViewData 失败:', err)
    ElMessage.error(err?.message || '省级统计加载失败')
  }
}

async function fetchCityStats() {
  try {
    const res = await configApi.provinceViewData({
      provinceCode: PROVINCE_CODE,
      projectStage: DEFAULT_STAGE
    })
    cityStats.value = res?.data ?? []
    console.log('[stats] 各市统计:', cityStats.value)
    if (mapReady.value) {
      await renderCityStats()
    }
  } catch (err) {
    console.error('[stats] provinceViewData 失败:', err)
    ElMessage.error(err?.message || '市级统计加载失败')
  }
}

// =================== 市级 GeoJSON 渲染 ===================
async function loadCityGeoJSON() {
  if (cityGeoJSONCache) return cityGeoJSONCache
  try {
    const res = await fetch(CITY_GEOJSON_URL)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    cityGeoJSONCache = await res.json()
    console.log('[city] 各市边界加载成功:', cityGeoJSONCache.features.length)
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
  for (const s of cityStats.value) {
    statMap[String(s.regionCode)] = s
  }

  const features = geoJSON.features.map((f) => {
  const code = String(
    f.properties.adcode ??
    f.properties.regionCode ??
    f.properties.code ??
    ''
  )
  const stat = statMap[code]
  // 优先用手动坐标，其次 DataV 的 center/centroid
  const center =
    CITY_LABEL_CENTER[code] ||
    f.properties.center ||
    f.properties.centroid ||
    null
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

  const fillColor = [
    'interpolate', ['linear'], ['get', 'totalCapacity'],
    0, '#e9d5ff',
    30, '#c084fc',
    80, '#a855f7',
    150, '#7c3aed'
  ]

  mapRef.value.addFillLayer({
    id: CITY_LAYER_ID,
    geojson: { type: 'FeatureCollection', features },
    fillColor,
    fillOpacity: 0.55,
    outlineColor: '#f0abfc',
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
      'text-halo-color': '#4c1d95',
      'text-halo-width': 1.6,
    },
  })
}

function hideCityStats() {
  mapRef.value?.removeLayer(CITY_LAYER_ID)
  mapRef.value?.removeLayer(`${CITY_LAYER_ID}-labels`)
}

// =================== 项目地图数据 ===================
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
      itemType: project.itemType
    },
    geometry: { type: 'Polygon', coordinates: [coords] }
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
          geometry: { type: 'Point', coordinates: [lng, lat] }
        }
      })
      .filter(Boolean)
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
          geometry: { type: 'Point', coordinates: [lng, lat] }
        }
      })
      .filter(Boolean)
  }
}

function clearProjectLayers() {
  if (!mapRef.value) return
  for (const id of renderedLayerIds) {
    mapRef.value.removeLayer(id)
  }
  renderedLayerIds.clear()
}

async function safeAddIcon({
  layerId, featureCollection,
  iconId, iconUrl, iconSize, iconAnchor = 'center',
  fallbackColor = '#3b82f6', fallbackRadius = 8
}) {
  try {
    await mapRef.value.ensureImage(iconId, iconUrl)
    await mapRef.value.addImagePoints({
      id: layerId,
      geojson: featureCollection,
      iconId,
      iconUrl,
      iconSize,
      iconAnchor
    })
  } catch (err) {
    console.warn('[icon] 降级为圆点:', iconUrl, err?.message || err)
    mapRef.value.addPoints({
      id: layerId,
      geojson: featureCollection,
      color: fallbackColor,
      radius: fallbackRadius
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
    id: layerId,
    geojson: area,
    color: s.color,
    opacity: s.opacity,
    outlineColor: s.outlineColor
  })
  renderedLayerIds.add(layerId)

  const fillLayerId = `${layerId}-fill`
  mapRef.value.offClick(fillLayerId)
  mapRef.value.onClick(fillLayerId, () => {
    onProjectClick(project.id)
  })
}

async function renderProjectsByStage(stage) {
  if (!mapReady.value || !mapRef.value) return
  clearProjectLayers()

  const projects = allMapProjects.value
  if (!projects.length) return

  if (stage === 'overview') return

  const allWindFeatures = []
  const allBoosterFeatures = []

  for (const p of projects) {
    addProjectArea(p, p.id === selectedProject.value?.id)

    const windFC = buildWindFC(p)
    if (windFC.features.length) allWindFeatures.push(...windFC.features)

    const boosterFC = buildBoosterFC(p)
    if (boosterFC.features.length) allBoosterFeatures.push(...boosterFC.features)
  }

  if (allWindFeatures.length) {
    await safeAddIcon({
      layerId: 'project-wind-all',
      featureCollection: { type: 'FeatureCollection', features: allWindFeatures },
      iconId: ICON_FENGJI,
      iconUrl: fengjiIcon,
      iconSize: ICON_SIZE_WIND,
      iconAnchor: 'bottom',
      fallbackColor: '#22c55e',
      fallbackRadius: 3
    })
  }

  if (allBoosterFeatures.length) {
    await safeAddIcon({
      layerId: 'project-booster-all',
      featureCollection: { type: 'FeatureCollection', features: allBoosterFeatures },
      iconId: ICON_SHENGYAZHAN,
      iconUrl: shengyazhanIcon,
      iconSize: ICON_SIZE_BOOSTER,
      iconAnchor: 'bottom',
      fallbackColor: '#ef4444',
      fallbackRadius: 3
    })
  }
}

async function fetchMapProjects() {
  try {
    const res = await api.getPageList({ pageNo: 1, pageSize: 100 })
    const data = res?.data ?? {}
    allMapProjects.value = data.list ?? []
    if (mapReady.value && isAreaView.value) {
      await renderProjectsByStage('area')
    }
  } catch (err) {
    console.error(err)
    ElMessage.error(err?.message || '地图项目数据加载失败')
  }
}

// =================== 选中 & 详情卡 ===================
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

  mapRef.value?.clearEditableAreas()
  editBuffer.value = null
  drawingNewPoint.value = false

  const project = allMapProjects.value.find((p) => p.id === pid)
  if (project && isAreaView.value) {
    addProjectArea(project, false)
  }

  selectedProject.value = null
  detailCardPos.visible = false
}

function updateDetailCardPosition() {
  if (!selectedProject.value || !mapRef.value) {
    detailCardPos.visible = false
    return
  }
  const centroid = getProjectCentroid(selectedProject.value)
  if (!centroid) {
    detailCardPos.visible = false
    return
  }
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
  const features = map.queryRenderedFeatures(e.point, { layers: areaLayerIds })
  if (!features.length) {
    clearSelectionLayers()
  }
}

function handleCardAction(type) {
  const name = selectedProject.value?.projectName || ''
  if (type === 'delete') {
    ElMessageBox.confirm(`确认删除项目「${name}」吗？`, '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    }).then(() => {
      ElMessage.success('删除成功')
      clearSelectionLayers()
      fetchMapProjects()
      fetchProjectList()
      fetchOverviewStats()
      fetchCityStats()
    }).catch(() => {})
    return
  }
  const labels = { share: '分享', reserve: '储备', verify: '核查', edit: '编辑' }
  ElMessage.info(`点击了「${labels[type] || type}」：${name}`)
}

// =================== 编辑工作副本 ===================
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

  editBuffer.value = {
    area,
    wind,
    booster,
    unavailable: []
  }
}

function closeRing(coords) {
  if (!coords || coords.length < 3) return coords
  const first = coords[0]
  const last = coords[coords.length - 1]
  if (first[0] !== last[0] || first[1] !== last[1]) {
    return [...coords, [first[0], first[1]]]
  }
  return coords
}

function syncDrawToBuffer() {
  if (!editBuffer.value) return
  const draw = mapRef.value?.getDraw?.()
  const all = draw?.getAll?.() || { type: 'FeatureCollection', features: [] }
  const mode = editMode.value

  if (mode === 'area') {
    const areaFeature = all.features.find(f => f.properties?.kind === 'area')
    if (areaFeature && areaFeature.geometry?.type === 'Polygon') {
      editBuffer.value.area = areaFeature.geometry.coordinates[0].map(c => [c[0], c[1]])
    }
  } else if (mode === 'wind') {
    editBuffer.value.wind = all.features
      .filter(f => f.properties?.kind === 'wind')
      .map(f => f.geometry.coordinates)
  } else if (mode === 'booster') {
    editBuffer.value.booster = all.features
      .filter(f => f.properties?.kind === 'booster')
      .map(f => f.geometry.coordinates)
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
      const ring = closeRing(coords)
      mapRef.value.loadEditableAreas({
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          id: `edit-area-${selectedProject.value.id}`,
          properties: { kind: 'area' },
          geometry: { type: 'Polygon', coordinates: [ring] }
        }]
      })
      const all = draw.getAll()
      if (all.features.length) {
        draw.changeMode('direct_select', { featureId: all.features[0].id })
      }
    }
  } else if (mode === 'wind') {
    const features = editBuffer.value.wind.map((coords, i) => ({
      type: 'Feature',
      id: `edit-wind-${i}`,
      properties: { kind: 'wind', index: i },
      geometry: { type: 'Point', coordinates: coords }
    }))
    if (features.length) {
      mapRef.value.loadEditableAreas({ type: 'FeatureCollection', features })
    }
    draw.changeMode('simple_select')
  } else if (mode === 'booster') {
    const features = editBuffer.value.booster.map((coords, i) => ({
      type: 'Feature',
      id: `edit-booster-${i}`,
      properties: { kind: 'booster', index: i },
      geometry: { type: 'Point', coordinates: coords }
    }))
    if (features.length) {
      mapRef.value.loadEditableAreas({ type: 'FeatureCollection', features })
    }
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
  if (!ids.length) {
    ElMessage.warning('请先点击选中要删除的点（可多选：按住 Shift 点击）')
    return
  }
  draw.delete(ids)
  syncDrawToBuffer()
  ElMessage.success(`已删除 ${ids.length} 个点`)
}

function refreshAllPointsLayers() {
  if (!mapRef.value || !editBuffer.value || !selectedProject.value) return
  const map = mapRef.value.getMap?.()
  if (!map) return

  const pid = selectedProject.value.id
  const otherProjects = allMapProjects.value.filter(p => p.id !== pid)

  const windFeatures = []
  for (const p of otherProjects) {
    const fc = buildWindFC(p)
    if (fc.features.length) windFeatures.push(...fc.features)
  }
  for (const [lng, lat] of editBuffer.value.wind) {
    windFeatures.push({
      type: 'Feature',
      properties: { projectId: pid },
      geometry: { type: 'Point', coordinates: [lng, lat] }
    })
  }

  const boosterFeatures = []
  for (const p of otherProjects) {
    const fc = buildBoosterFC(p)
    if (fc.features.length) boosterFeatures.push(...fc.features)
  }
  for (const [lng, lat] of editBuffer.value.booster) {
    boosterFeatures.push({
      type: 'Feature',
      properties: { projectId: pid },
      geometry: { type: 'Point', coordinates: [lng, lat] }
    })
  }

  if (map.getSource('project-wind-all')) {
    map.getSource('project-wind-all').setData({
      type: 'FeatureCollection', features: windFeatures
    })
  }
  if (map.getSource('project-booster-all')) {
    map.getSource('project-booster-all').setData({
      type: 'FeatureCollection', features: boosterFeatures
    })
  }
}

// ---- 保存 / 取消 ----
async function saveEdit() {
  if (!editBuffer.value || !selectedProject.value || saving.value) return
  syncDrawToBuffer()

  const project = selectedProject.value
  const pid = project.id

  const fallbackRegionCode = project.coordinate?.[0]?.regionCode ?? null
  const coordinate = editBuffer.value.area.map(([lng, lat]) => ({
    regionCode: fallbackRegionCode,
    longitude: String(lng),
    latitude: String(lat)
  }))

  const originalWind = project.windTurbinePoints || []
  const windTurbinePoints = editBuffer.value.wind.map(([lng, lat]) => {
    const match = originalWind.find(
      (p) =>
        Math.abs(Number(p.longitude) - lng) < 1e-9 &&
        Math.abs(Number(p.latitude) - lat) < 1e-9
    )
    return {
      longitude: lng,
      latitude: lat,
      isAlternative: match?.isAlternative ?? 0
    }
  })

  const originalBooster = project.boosterStationLocations || []
  const boosterStationLocations = editBuffer.value.booster.map(([lng, lat]) => {
    const match = originalBooster.find(
      (p) =>
        Math.abs(Number(p.lng) - lng) < 1e-9 &&
        Math.abs(Number(p.lat) - lat) < 1e-9
    )
    return {
      lng,
      lat,
      isBest: match?.isBest ?? 0
    }
  })

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

  console.log('[saveEdit] 提交数据:', payload)

  try {
    saving.value = true
    const res = await configApi.upDataLayer(pid, payload)

    if (res?.code === 200) {
      ElMessage.success('保存成功')

      const target = allMapProjects.value.find((p) => p.id === pid)
      if (target) {
        target.coordinate = coordinate
        target.windTurbinePoints = windTurbinePoints
        target.boosterStationLocations = boosterStationLocations
      }

      await renderProjectsByStage('area')
      updateDetailCardPosition()

      if (target) {
        initEditBuffer(target)
        enterEditMode('area')
      }

      fetchOverviewStats()
      fetchCityStats()
    } else {
      ElMessage.error(res?.msg || '保存失败')
    }
  } catch (err) {
    console.error('[saveEdit] 出错:', err)
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

// =================== 缩放阈值切换 ===================
const { isAreaView, syncByZoom, bindZoomListener, unbindZoomListener } = useZoomThresholdSwitch({
  mapRef,
  onEnter: () => {
    hideCityStats()
    renderProjectsByStage('area')
  },
  onExit: () => {
    clearSelectionLayers()
    renderProjectsByStage('overview')
    if (cityStats.value.length) renderCityStats()
  }
})

// =================== 地图就绪 ===================
async function onMapReady() {
  mapReady.value = true

  if (showCreateProject.value) {
    nextTick(() => startCreateDrawing())
  }

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

function closeConfig() {
  showConfig.value = false
  viewMode.value = 'map'
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
.site-select-page {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #f5f7fa;
}

.map-layer {
  position: absolute;
  inset: 0;
  z-index: 1;
  overflow: hidden;
}

/* ---- 选址配置全屏页 ---- */
.config-fullpage {
  position: absolute;
  inset: 0;
  z-index: 10;
  overflow: auto;
  background: #fff;
}
.config-header {
  display: flex;
  align-items: center;
  gap: 14px;
  height: 48px;
  padding: 0 18px;
  border-bottom: 1px solid #ebeef5;
}
.exit-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 11px;
  color: #333;
  font-size: 12px;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
}
.exit-button:hover { color: #1677ff; border-color: #1677ff; }
.config-header-title { color: #303133; font-size: 14px; font-weight: 600; }
.config-fullpage .config-layout {
  display: grid;
  grid-template-columns: 43% 57%;
  max-width: 1200px;
  min-height: 535px;
  margin: 24px auto;
  padding: 0 28px;
}

/* ---- 顶部工具条 ---- */
.view-toolbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 5;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
  background: rgba(255, 255, 255, 0.96);
  border-bottom: 1px solid #e5e7eb;
}
.view-tabs { display: flex; height: 100%; gap: 18px; }
.view-tab {
  position: relative;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0 4px;
  color: #444;
  font-size: 12px;
  background: transparent;
  border: 0;
  cursor: pointer;
}
.view-tab.active { color: #1677ff; }
.view-tab.active::after {
  content: '';
  position: absolute;
  right: 0; bottom: 0; left: 0;
  height: 2px;
  background: #1677ff;
}
.config-button {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 11px;
  color: #333;
  font-size: 12px;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
}
.config-button:hover { color: #1677ff; border-color: #1677ff; }

/* ---- 地图视图 ---- */
.map-view {
  position: absolute;
  inset: 42px 0 0;
  overflow: hidden;
  pointer-events: none;
}
.map-view > * { pointer-events: auto; }

/* ---- 项目通道概况 ---- */
.map-summary {
  position: absolute;
  top: 18px;
  left: 18px;
  z-index: 2;
  width: 175px;
  padding: 12px;
  color: #303133;
  background: rgba(255, 255, 255, 0.94);
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
}
.summary-title {
  display: flex;
  justify-content: space-between;
  padding-bottom: 9px;
  margin-bottom: 7px;
  font-size: 12px;
  font-weight: 600;
  border-bottom: 1px solid #eee;
}
.summary-location, .summary-row {
  display: flex;
  align-items: center;
  min-height: 31px;
  font-size: 11px;
}
.summary-location { gap: 4px; }
.summary-location strong, .summary-row b {
  margin-left: auto;
  font-size: 11px;
  font-weight: 500;
}
.summary-location small, .summary-row small {
  width: 46px;
  color: #999;
  font-size: 9px;
  text-align: right;
}
.summary-row { border-top: 1px solid #f0f0f0; }
.dot { width: 6px; height: 6px; margin-right: 6px; border-radius: 50%; }
.dot.wind { background: #4f9cff; }
.dot.solar { background: #f0c83e; }

/* ---- 右上角：搜索 tab ---- */
.search-panel {
  position: absolute;
  top: 18px;
  right: 18px;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 6px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
}

/* ---- 右上角：编辑工具条 ---- */
.edit-toolbar {
  position: absolute;
  top: 18px;
  right: 18px;
  z-index: 4;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 6px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
  max-width: 90vw;
}
.edit-tool-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  color: #444;
  font-size: 12px;
  background: transparent;
  border: 0;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
}
.edit-tool-button:hover { color: #1677ff; background: #f0f7ff; }
.edit-tool-button.active { color: #1677ff; background: #e6f2ff; }
.edit-tool-button.save { color: #1677ff; font-weight: 500; }
.edit-tool-button.danger { color: #f56c6c; }
.edit-tool-button.danger:hover { color: #f56c6c; background: #fef0f0; }
.edit-tool-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.edit-divider {
  width: 1px;
  height: 18px;
  margin: 0 4px;
  background: #e5e7eb;
}

/* ---- 详情卡 ---- */
.detail-card {
  position: absolute;
  z-index: 5;
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
.detail-label { width: 68px; color: #909399; }
.detail-value { flex: 1; color: #303133; }
.detail-sub { color: #a0a5ad; font-size: 11px; }
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
.detail-action:hover { text-decoration: underline; }
.detail-action.danger { color: #f56c6c; }

/* ---- 右侧展开按钮 ---- */
.expand-button {
  position: absolute;
  top: 50%;
  right: 0;
  z-index: 3;
  width: 25px;
  height: 54px;
  color: #fff;
  background: rgba(30, 30, 30, 0.4);
  border: 0;
  border-radius: 5px 0 0 5px;
  cursor: pointer;
}

/* ---- 项目列表 ---- */
.project-list-view {
  position: absolute;
  inset: 0;
  z-index: 4;
  height: 100%;
  padding: 52px 20px 12px;
  overflow: auto;
  box-sizing: border-box;
  background: #fff;
}
.list-heading { display: flex; align-items: center; justify-content: space-between; }
.list-title { display: flex; align-items: center; gap: 6px; color: #333; font-size: 13px; font-weight: 600; }
.project-table { width: 100%; margin-top: 2px; }
.status-text.passed { color: #24b26b; }
.status-text.pending { color: #e6a23c; }
.status-text.rejected { color: #f56c6c; }
.pagination-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 18px;
  padding-top: 14px;
  color: #666;
  font-size: 12px;
}

/* ---- 创建项目 ---- */
.create-project-fullpage {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  justify-content: flex-end;
  pointer-events: none;
}
.cp-map-overlay {
  position: relative;
  flex: 1;
  pointer-events: none;
}
.cp-search-box {
  position: absolute;
  top: 18px;
  left: 18px;
  width: 300px;
  pointer-events: auto;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
}
.cp-search-icon { cursor: pointer; color: #909399; }
.cp-draw-actions {
  position: absolute;
  top: 18px;
  right: 18px;
  display: flex;
  gap: 8px;
  pointer-events: auto;
}
:deep(.create-project-form) { pointer-events: auto; }
:deep(.el-form-item) { margin-bottom: 18px; }
:deep(.el-checkbox) { display: block; height: 27px; }
:deep(.el-input-number) { width: 108px; }

@media (max-width: 1100px) {
  .view-toolbar { padding: 0 10px; }
  .project-list-view { padding-right: 10px; padding-left: 10px; }
  .config-fullpage .config-layout { grid-template-columns: 1fr; padding: 0 16px; }
  .create-project-fullpage { flex-direction: column; }
}
</style>