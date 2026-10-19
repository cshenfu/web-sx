<template>
  <aside class="create-project-form">
    <div class="cp-header">
      <span class="cp-title">创建项目</span>
      <div class="cp-header-actions">
        <el-button size="small" @click="handleCancel">取消</el-button>
        <el-button type="primary" size="small" :loading="submitting" @click="handleSave">保存</el-button>
      </div>
    </div>

    <div class="cp-body">
      <!-- 标签宽度设置为 110px，标签在左侧 -->
      <el-form label-position="right" label-width="110px" size="default" class="cp-form">
        <!-- 项目类型 -->
        <el-form-item label="项目类型" required>
          <el-radio-group v-model="form.itemType">
            <el-radio label="FD">风电</el-radio>
            <el-radio label="GF">光伏</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 项目编号 -->
        <el-form-item label="项目编号" required>
          <el-input v-model="form.projectCode" placeholder="请输入" />
        </el-form-item>

        <!-- 项目名称 -->
        <el-form-item label="项目名称" required>
          <el-input v-model="form.projectName" placeholder="请输入" />
        </el-form-item>

        <!-- 项目阶段 -->
        <el-form-item label="项目阶段" required>
          <el-select v-model="form.projectStage" placeholder="请选择" :loading="stageLoading" style="width: 100%">
            <el-option v-for="opt in projectStageOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>

        <!-- ================= 场区范围 ================= -->
        <el-form-item label="场区范围" required>
          <el-radio-group v-model="form.siteRangeMode">
            <el-radio label="upload">上传坐标</el-radio>
            <el-radio label="draw">在线绘制</el-radio>
          </el-radio-group>

          <div class="cp-full-width">
            <template v-if="form.siteRangeMode === 'draw'">
              <p class="cp-tip" style="margin-bottom: 8px;">说明：请在左侧地图绘制场区范围，最大支持半径 25km。</p>
              
              <div class="cp-point-toolbar">
                <el-button size="small" type="primary" plain @click="startPolygonDrawing">
                  {{ siteRangeDrawn ? '重画场区' : '开始绘制' }}
                </el-button>
                <el-button size="small" :disabled="!siteRangeDrawn" @click="startEditSiteRange">
                  编辑顶点
                </el-button>
                <el-button size="small" :disabled="!siteRangeDrawn" @click="clearSiteRange">
                  清空场区
                </el-button>
              </div>
              <p v-if="siteRangePoints.length" class="cp-tip cp-tip-success">
                已获取场区范围坐标（{{ siteRangePoints.length }} 个点）
              </p>
            </template>

            <template v-else>
              <OmniUploader
                v-model="siteRangeFileModel"
                accept=".xlsx,.kmz,.kml,.ovkml"
                biz-type="场区范围"
                button-text="上传数据"
                :user-name="userName"
                :show-progress="true"
                @success="handleSiteRangeUploadSuccess"
                @remove="handleSiteRangeUploadRemove"
                @error="handleUploadError"
              />
              <p class="cp-tip">
                说明：支持xlsx/kmz/kml/ovkml格式数据，xlsx数据需
                <span class="cp-link" @click="downloadTemplate('siteRange')">下载数据模板</span>
              </p>
            </template>
          </div>
        </el-form-item>

        <!-- ================= 风机点位（仅上传） ================= -->
        <el-form-item label="风机点位">
          <el-radio-group v-model="form.windTurbineMode">
            <el-radio label="has">有</el-radio>
            <el-radio label="none">暂无</el-radio>
          </el-radio-group>

          <div class="cp-full-width" v-if="form.windTurbineMode === 'has'">
            <OmniUploader
              v-model="windTurbineFileModel"
              accept=".xlsx,.kmz,.kml,.ovkml"
              biz-type="风机点位"
              button-text="上传数据"
              :user-name="userName"
              :show-progress="true"
              @success="handleWindTurbineUploadSuccess"
              @remove="handleWindTurbineUploadRemove"
              @error="handleUploadError"
            />
            <p class="cp-tip">
              说明：支持xlsx/kmz/kml/ovkml格式数据，xlsx数据需
              <span class="cp-link" @click="downloadTemplate('windTurbine')">下载数据模板</span>
            </p>

            <!-- 解析结果 -->
            <div v-if="windTurbinePoints.length" class="cp-point-result">
              <p class="cp-tip cp-tip-success">
                共解析 {{ windTurbinePoints.length }} 个风机点位
                <span v-if="windOutOfRangeList.length > 0" class="cp-tip-error">
                  ，其中 {{ windOutOfRangeList.length }} 个不在场区范围内
                </span>
              </p>
              <div v-if="windOutOfRangeList.length > 0" class="cp-warn-box">
                <div v-for="(p, i) in windOutOfRangeList" :key="i" class="cp-warn-item">
                  <span>第 {{ p.index + 1 }} 个点 ({{ p.lng }}, {{ p.lat }})</span>
                  <el-button link type="danger" size="small" @click="removeWindPoint(p.index)">删除</el-button>
                </div>
                <el-button size="small" type="danger" plain style="margin-top: 8px;" @click="removeAllOutOfRangeWindPoints">
                  一键删除全部超范围点
                </el-button>
              </div>
            </div>
          </div>
        </el-form-item>

        <!-- ================= 升压站位置 ================= -->
        <el-form-item label="升压站位置">
          <el-radio-group v-model="form.boosterMode">
            <el-radio label="has">有</el-radio>
            <el-radio label="none">暂无</el-radio>
          </el-radio-group>

          <div class="cp-full-width" v-if="form.boosterMode === 'has'">
            <!-- 录入方式及工具栏 (紧凑一行) -->
            <div class="booster-toolbar">
              <el-select v-model="boosterEntryMode" size="small" class="booster-select-mode">
                <el-option label="手动录入" value="manual" />
                <el-option label="导入数据" value="upload" />
              </el-select>

              <template v-if="boosterEntryMode === 'manual'">
                <div class="booster-tabs">
                  <span
                    v-for="(point, idx) in boosterPoints"
                    :key="idx"
                    class="booster-tab"
                    :class="{ active: idx === activeBoosterIndex }"
                    @click="activeBoosterIndex = idx"
                  >
                    {{ idx + 1 }}
                  </span>
                  <!-- ★ 限制最多 2 个 -->
                  <span 
                    v-if="boosterPoints.length < 2" 
                    class="booster-tab booster-tab-add" 
                    title="添加升压站点位" 
                    @click="addBoosterPoint"
                  >
                    +
                  </span>
                </div>
                
                <span class="booster-caption">个点位</span>

                <el-radio-group v-model="activeBoosterPoint.placement" size="small" class="booster-placement">
                  <el-radio-button label="center">中心点</el-radio-button>
                  <el-radio-button label="closure">封闭区域</el-radio-button>
                </el-radio-group>

                <el-select v-model="activeBoosterPoint.isBest" size="small" class="booster-select-best">
                  <el-option label="最优" :value="1" />
                  <el-option label="非最优" :value="0" />
                </el-select>
              </template>
            </div>

            <!-- 手动录入：坐标行 -->
            <div v-if="boosterEntryMode === 'manual'" class="booster-coord-row">
              <el-input v-model="activeBoosterPoint.lng" placeholder="请输入经度" />
              <el-input v-model="activeBoosterPoint.lat" placeholder="请输入纬度" />
              <el-icon
                v-if="boosterPoints.length > 1"
                class="booster-remove"
                title="删除该点位"
                style="cursor: pointer; margin-left: 8px; color: #f56c6c;"
                @click="removeBoosterPoint(activeBoosterIndex)"
              >
                <Close />
              </el-icon>
            </div>

            <!-- 导入数据 -->
            <template v-else>
              <OmniUploader
                v-model="boosterFileModel"
                accept=".xlsx,.kmz,.kml,.ovkml"
                biz-type="升压站点位"
                button-text="上传数据"
                :user-name="userName"
                :show-progress="true"
                @success="handleBoosterUploadSuccess"
                @remove="handleBoosterUploadRemove"
                @error="handleUploadError"
              />
              <p class="cp-tip">
                说明：支持xlsx/kmz/kml/ovkml格式数据，xlsx数据需
                <span class="cp-link" @click="downloadTemplate('booster')">下载数据模板</span>
              </p>
            </template>
          </div>
        </el-form-item>

        <!-- ================= 接入站位置 ================= -->
        <el-form-item label="接入站位置">
          <el-radio-group v-model="form.accessMode">
            <el-radio label="has">有</el-radio>
            <el-radio label="none">暂无</el-radio>
          </el-radio-group>

          <div class="cp-full-width" v-if="form.accessMode === 'has'">
            <!-- 名称占满整行 -->
            <div class="cp-subfield-row">
              <span class="cp-subfield-label">拟接入变电站名称</span>
              <el-input v-model="form.accessName" placeholder="请输入拟接入的变电站名称" />
            </div>
            
            <!-- 经纬度平分 -->
            <div class="cp-subfield-row">
              <span class="cp-subfield-label">拟接入变电站位置</span>
              <div class="cp-inline-row">
                <el-input v-model="form.accessLng" placeholder="请输入经度" />
                <el-input v-model="form.accessLat" placeholder="请输入纬度" />
              </div>
            </div>

            <!-- 接入方式 -->
            <div class="cp-subfield-row">
              <span class="cp-subfield-label">送出工程接入方式</span>
              <el-radio-group v-model="form.sendOutType">
                <el-radio :label="1">架空线路</el-radio>
                <el-radio :label="2">电缆铺设</el-radio>
              </el-radio-group>
            </div>
          </div>
        </el-form-item>

        <!-- 项目备注 -->
        <el-form-item label="项目备注">
          <el-input v-model="form.notes" type="textarea" :rows="3" placeholder="请输入" />
        </el-form-item>
      </el-form>
    </div>
  </aside>
</template>

<script setup>
import {
  reactive, ref, computed, watch, onMounted, onUnmounted
} from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Close } from '@element-plus/icons-vue'
import OmniUploader from '@/components/upload/Upload2.vue'
import * as api from '@/api/modules/project'
import { parseSiteRangeFile, parseWindTurbineFile } from '../js/parseCoordinateFile'
import { resolveRegionByPoints, isPolygonWithinRadius } from '../js/useTiandituGeocode'

const MAX_SITE_RANGE_RADIUS_KM = 25

const props = defineProps({
  mapRef: { type: Object, required: true },
  // ★ 右侧创建项目面板宽度，用于计算地图可视区中心（面板盖在地图上）
  panelWidth: { type: Number, default: 550 },
})
const emit = defineEmits(['cancel', 'saved', 'site-range-mode-change'])

function resolveMapInstance(mapRefProp) {
  if (!mapRefProp) return null
  if (typeof mapRefProp.getMap === 'function') return mapRefProp
  if (mapRefProp.value && typeof mapRefProp.value.getMap === 'function') return mapRefProp.value
  return null
}

const userName = sessionStorage.getItem('userName') || ''
const submitting = ref(false)
const stageLoading = ref(false)
const projectStageOptions = ref([])

const form = reactive({
  itemType: 'FD',
  projectCode: '',
  projectName: '',
  projectStage: '',
  siteRangeMode: 'draw',
  windTurbineMode: 'none',
  boosterMode: 'none',
  accessMode: 'none',
  accessName: '',
  accessLng: '',
  accessLat: '',
  sendOutType: 1,
  notes: ''
})

/* ==================== 场区范围 ==================== */
const siteRangePoints = ref([])
const siteRangeFileModel = ref(null)
const siteRangeFileDto = ref(null)
const siteRangeDrawn = computed(() => siteRangePoints.value.length >= 3)

/* ==================== 风机点位 ==================== */
const windTurbineFileModel = ref(null)
const windTurbineFileDto = ref(null)
const windTurbinePoints = ref([])
const windOutOfRangeList = ref([])

/* ==================== 升压站 ==================== */
const boosterEntryMode = ref('manual')
const createBoosterPoint = () => ({ lng: '', lat: '', isBest: 0, placement: 'center' })
const boosterPoints = ref([createBoosterPoint()])
const activeBoosterIndex = ref(0)
const activeBoosterPoint = computed(() => boosterPoints.value[activeBoosterIndex.value])
const boosterFileModel = ref(null)
const boosterFileDto = ref(null)
const boosterOutOfRangeList = ref([])

function addBoosterPoint() {
  if (boosterPoints.value.length >= 2) {
    ElMessage.warning('最多只能添加2个升压站点位')
    return
  }
  boosterPoints.value.push(createBoosterPoint())
  activeBoosterIndex.value = boosterPoints.value.length - 1
}

function removeBoosterPoint(idx) {
  if (boosterPoints.value.length <= 1) return
  boosterPoints.value.splice(idx, 1)
  activeBoosterIndex.value = Math.min(activeBoosterIndex.value, boosterPoints.value.length - 1)
  renderBoosterPointsOnMap()
  checkBoosterPointsInRange()
}

/* ==================== 几何工具 ==================== */
function pointInPolygon([lng, lat], ring) {
  if (!ring || ring.length < 3) return false
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    const intersect = ((yi > lat) !== (yj > lat)) &&
      (lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi)
    if (intersect) inside = !inside
  }
  return inside
}

function getSiteRangeRing() {
  if (siteRangePoints.value.length < 3) return null
  const ring = siteRangePoints.value.map((p) => [Number(p.lng), Number(p.lat)])
  const first = ring[0]
  const last = ring[ring.length - 1]
  if (first[0] !== last[0] || first[1] !== last[1]) ring.push([first[0], first[1]])
  return ring
}

/* ==================== 视角聚焦 ==================== */
const VIEW_PADDING_EXTRA = 40 // 额外留白，避免贴边

/**
 * 计算多边形中心 + bounds
 * @param {Array<{lng:number|string, lat:number|string}>} points
 */
function getRingCenterAndBounds(points) {
  const lngs = []
  const lats = []
  for (const p of points) {
    const lng = Number(p.lng)
    const lat = Number(p.lat)
    if (Number.isFinite(lng) && Number.isFinite(lat)) {
      lngs.push(lng)
      lats.push(lat)
    }
  }
  if (!lngs.length) return null
  const minLng = Math.min(...lngs)
  const maxLng = Math.max(...lngs)
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  return {
    center: [(minLng + maxLng) / 2, (minLat + maxLat) / 2],
    bounds: [[minLng, minLat], [maxLng, maxLat]],
  }
}

/**
 * 将地图视角聚焦到场区范围
 * 右侧有固定面板遮挡，所以 padding.right 加大，使内容落在地图可见区中心偏左
 */
function focusSiteRangeOnMap(points) {
  const mapInstance = resolveMapInstance(props.mapRef)
  const map = mapInstance?.getMap?.()
  if (!map) return

  const info = getRingCenterAndBounds(points)
  if (!info) return

  const { bounds } = info
  const [minLng, minLat] = bounds[0]
  const [maxLng, maxLat] = bounds[1]
  // 单点/极小范围时 fitBounds 会算得很大，给个最小跨度兜底
  const MIN_SPAN = 0.001
  const lngSpan = Math.max(maxLng - minLng, MIN_SPAN)
  const latSpan = Math.max(maxLat - minLat, MIN_SPAN)
  const safeBounds = [[minLng, minLat], [minLng + lngSpan, minLat + latSpan]]

  map.fitBounds(safeBounds, {
    padding: {
      top: VIEW_PADDING_EXTRA + 40,           // 顶部有搜索框/工具栏
      bottom: VIEW_PADDING_EXTRA + 40,
      left: VIEW_PADDING_EXTRA,
      right: props.panelWidth + VIEW_PADDING_EXTRA, // ★ 关键：右侧让出面板宽度
    },
    maxZoom: 14,
    duration: 1000,
  })
}

/* ==================== 范围校验 ==================== */
function checkWindPointsInRange() {
  const ring = getSiteRangeRing()
  if (!ring) {
    windOutOfRangeList.value = []
    return
  }
  const list = []
  windTurbinePoints.value.forEach((p, index) => {
    if (!pointInPolygon([Number(p.lng), Number(p.lat)], ring)) {
      list.push({ index, lng: p.lng, lat: p.lat })
    }
  })
  windOutOfRangeList.value = list
  renderWindPointsOnMap()
}

function checkBoosterPointsInRange() {
  const ring = getSiteRangeRing()
  if (!ring) {
    boosterOutOfRangeList.value = []
    return
  }
  const list = []
  boosterPoints.value.forEach((p, index) => {
    if (!p.lng || !p.lat) return
    if (!pointInPolygon([Number(p.lng), Number(p.lat)], ring)) {
      list.push({ index, lng: p.lng, lat: p.lat })
    }
  })
  boosterOutOfRangeList.value = list
  renderBoosterPointsOnMap()
}

/* ==================== 地图渲染 ==================== */
const WIND_LAYER_IN = 'create-wind-in'
const WIND_LAYER_OUT = 'create-wind-out'
const BOOSTER_LAYER = 'create-booster'
const SITE_RANGE_LAYER = 'create-site-range'

function removeLayers(ids) {
  const mapInstance = resolveMapInstance(props.mapRef)
  ids.forEach((id) => mapInstance?.removeLayer?.(id))
}

function renderWindPointsOnMap() {
  const mapInstance = resolveMapInstance(props.mapRef)
  if (!mapInstance) return
  removeLayers([WIND_LAYER_IN, WIND_LAYER_OUT])

  const outIndexSet = new Set(windOutOfRangeList.value.map((p) => p.index))
  const inFeatures = []
  const outFeatures = []
  windTurbinePoints.value.forEach((p, i) => {
    const feature = {
      type: 'Feature',
      properties: { index: i },
      geometry: { type: 'Point', coordinates: [Number(p.lng), Number(p.lat)] }
    }
    if (outIndexSet.has(i)) outFeatures.push(feature)
    else inFeatures.push(feature)
  })

  if (inFeatures.length) {
    mapInstance.addPoints({ id: WIND_LAYER_IN, geojson: { type: 'FeatureCollection', features: inFeatures }, color: '#22c55e', radius: 6 })
  }
  if (outFeatures.length) {
    mapInstance.addPoints({ id: WIND_LAYER_OUT, geojson: { type: 'FeatureCollection', features: outFeatures }, color: '#f56c6c', radius: 6 })
  }
}

function renderBoosterPointsOnMap() {
  const mapInstance = resolveMapInstance(props.mapRef)
  if (!mapInstance) return
  removeLayers([BOOSTER_LAYER])

  const features = boosterPoints.value
    .filter((p) => p.lng && p.lat)
    .map((p, i) => ({
      type: 'Feature',
      properties: { index: i },
      geometry: { type: 'Point', coordinates: [Number(p.lng), Number(p.lat)] }
    }))
  if (!features.length) return
  mapInstance.addPoints({ id: BOOSTER_LAYER, geojson: { type: 'FeatureCollection', features }, color: '#f59e0b', radius: 7 })
}

function renderSiteRangeOnMap() {
  const mapInstance = resolveMapInstance(props.mapRef)
  if (!mapInstance) return
  mapInstance.removeLayer?.(SITE_RANGE_LAYER)
  const ring = getSiteRangeRing()
  if (!ring) return
  mapInstance.addPolygon({
    id: SITE_RANGE_LAYER,
    geojson: { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [ring] } },
    color: '#2A9FFF',
    opacity: 0.2,
    outlineColor: '#2A9FFF'
  })
}

/* ==================== 场区绘制 ==================== */
let unbindDrawCreate = null
let boundDrawMap = null

function bindSiteRangeDrawEvents() {
  const mapInstance = resolveMapInstance(props.mapRef)
  const map = mapInstance?.getMap?.()
  const draw = mapInstance?.getDraw?.()
  if (!map || !draw || boundDrawMap === map) return
  unbindDrawCreate?.()

  const handleDrawCreate = (event) => {
    const feature = event?.features?.[0]
    if (!feature || feature.geometry?.type !== 'Polygon') return
    if (!isPolygonWithinRadius(feature, MAX_SITE_RANGE_RADIUS_KM)) {
      draw.delete(feature.id)
      ElMessage.warning(`绘制范围超出限制，目前最大支持半径${MAX_SITE_RANGE_RADIUS_KM}km`)
      return
    }
    const all = draw.getAll()
    all.features.filter((f) => f.id !== feature.id).forEach((f) => draw.delete(f.id))

    const ring = feature.geometry.coordinates?.[0] || []
    siteRangePoints.value = ring.map(([lng, lat]) => ({ lng, lat })).filter((p) => Number.isFinite(Number(p.lng)) && Number.isFinite(Number(p.lat)))
    renderSiteRangeOnMap()
    checkWindPointsInRange()
    checkBoosterPointsInRange()
    focusSiteRangeOnMap(siteRangePoints.value) // ★ 绘制完成后聚焦
  }

  const handleDrawUpdate = (event) => {
    const feature = event?.features?.[0]
    if (!feature || feature.geometry?.type !== 'Polygon') return
    if (!isPolygonWithinRadius(feature, MAX_SITE_RANGE_RADIUS_KM)) {
      ElMessage.warning(`场区范围超出${MAX_SITE_RANGE_RADIUS_KM}km限制，请调整`)
    }
    const ring = feature.geometry.coordinates?.[0] || []
    siteRangePoints.value = ring.map(([lng, lat]) => ({ lng, lat })).filter((p) => Number.isFinite(Number(p.lng)) && Number.isFinite(Number(p.lat)))
    renderSiteRangeOnMap()
    checkWindPointsInRange()
    checkBoosterPointsInRange()
    // ★ 注意：这里不聚焦，避免用户拖顶点时地图乱跳
  }

  map.on('draw.create', handleDrawCreate)
  map.on('draw.update', handleDrawUpdate)
  boundDrawMap = map
  unbindDrawCreate = () => { map.off('draw.create', handleDrawCreate); map.off('draw.update', handleDrawUpdate); boundDrawMap = null }
}

function startPolygonDrawing() {
  bindSiteRangeDrawEvents()
  const mapInstance = resolveMapInstance(props.mapRef)
  const draw = mapInstance?.getDraw?.()
  if (!draw) { ElMessage.warning('地图尚未加载完成'); return }
  mapInstance.clearEditableAreas?.()
  siteRangePoints.value = []
  renderSiteRangeOnMap()
  draw.changeMode('draw_polygon')
}

function startEditSiteRange() {
  const mapInstance = resolveMapInstance(props.mapRef)
  const draw = mapInstance?.getDraw?.()
  if (!draw) return
  if (!siteRangeDrawn.value) { ElMessage.warning('请先绘制场区范围'); return }
  const ring = getSiteRangeRing()
  draw.deleteAll()
  draw.add({ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [ring] } })
  const all = draw.getAll()
  if (all.features.length) draw.changeMode('direct_select', { featureId: all.features[0].id })
}

function clearSiteRange() {
  const mapInstance = resolveMapInstance(props.mapRef)
  mapInstance?.clearEditableAreas?.()
  siteRangePoints.value = []
  renderSiteRangeOnMap()
  windOutOfRangeList.value = []
  boosterOutOfRangeList.value = []
  renderWindPointsOnMap()
  renderBoosterPointsOnMap()
}

/* ==================== 上传处理 ==================== */
async function handleSiteRangeUploadSuccess(dto, file) {
  siteRangeFileDto.value = { ...dto }
  try {
    const points = await parseSiteRangeFile(file)
    siteRangePoints.value = points
    renderSiteRangeOnMap()
    checkWindPointsInRange()
    checkBoosterPointsInRange()
    focusSiteRangeOnMap(points) // ★ 上传解析成功后聚焦
    ElMessage.success('场区范围文件解析成功')
  } catch (err) {
    ElMessage.error(`场区范围文件解析失败：${err?.message || '文件内容无法解析'}`)
    siteRangePoints.value = []
    renderSiteRangeOnMap()
  }
}
function handleSiteRangeUploadRemove() {
  siteRangeFileDto.value = null
  clearSiteRange()
}

async function handleWindTurbineUploadSuccess(dto, file) {
  windTurbineFileDto.value = { ...dto }
  try {
    const points = await parseWindTurbineFile(file)
    windTurbinePoints.value = points.map((p) => ({ lng: Number(p.lng), lat: Number(p.lat), isAlternative: Number(p.isAlternative || 0) }))
    checkWindPointsInRange()
    const out = windOutOfRangeList.value.length
    if (out > 0) ElMessage.warning(`风机点位解析成功，但有 ${out} 个点位不在场区范围内（已标红）`)
    else ElMessage.success('风机点位文件解析成功')
  } catch (err) {
    ElMessage.error(`风机点位文件解析失败：${err?.message || '文件内容无法解析'}`)
    windTurbinePoints.value = []
    windOutOfRangeList.value = []
    renderWindPointsOnMap()
  }
}
function handleWindTurbineUploadRemove() {
  windTurbineFileDto.value = null
  windTurbinePoints.value = []
  windOutOfRangeList.value = []
  renderWindPointsOnMap()
}
function removeWindPoint(index) {
  windTurbinePoints.value.splice(index, 1)
  checkWindPointsInRange()
}
function removeAllOutOfRangeWindPoints() {
  if (!windOutOfRangeList.value.length) return
  ElMessageBox.confirm(`确认删除全部 ${windOutOfRangeList.value.length} 个超范围风机点位？`, '提示', { type: 'warning' }).then(() => {
    const outSet = new Set(windOutOfRangeList.value.map((p) => p.index))
    windTurbinePoints.value = windTurbinePoints.value.filter((_, i) => !outSet.has(i))
    checkWindPointsInRange()
  }).catch(() => {})
}

async function handleBoosterUploadSuccess(dto, file) {
  boosterFileDto.value = { ...dto }
  try {
    const points = await parseWindTurbineFile(file)
    // 导入数据不限制 2 个，全部接收
    boosterPoints.value = points.map((p) => ({ 
      lng: String(p.lng), 
      lat: String(p.lat), 
      isBest: Number(p.isBest || 0), 
      placement: 'center' 
    }))
    
    activeBoosterIndex.value = 0
    renderBoosterPointsOnMap()
    checkBoosterPointsInRange()
  } catch (err) {
    ElMessage.error(`升压站点位文件解析失败：${err?.message || '文件内容无法解析'}`)
    boosterPoints.value = [createBoosterPoint()]
    boosterOutOfRangeList.value = []
    renderBoosterPointsOnMap()
  }
}
function handleBoosterUploadRemove() {
  boosterFileDto.value = null
  boosterPoints.value = [createBoosterPoint()]
  boosterOutOfRangeList.value = []
  renderBoosterPointsOnMap()
}

function handleUploadError(err) { ElMessage.error(`上传失败：${err?.message || '请稍后重试'}`) }
function downloadTemplate(type) { ElMessage.info(`下载 ${type} 数据模板`) }

/* ==================== 监听 & 生命周期 ==================== */
watch(() => form.siteRangeMode, (mode) => {
  emit('site-range-mode-change', mode)
  const mapInstance = resolveMapInstance(props.mapRef)
  if (mode === 'draw') { clearSiteRange(); startPolygonDrawing() } 
  else { clearSiteRange(); mapInstance?.getDraw?.()?.changeMode?.('simple_select') }
}, { immediate: true })

watch(() => form.windTurbineMode, (mode) => {
  if (mode !== 'has') { windTurbinePoints.value = []; windOutOfRangeList.value = []; renderWindPointsOnMap() }
})
watch(() => form.boosterMode, (mode) => {
  if (mode !== 'has') { boosterPoints.value = [createBoosterPoint()]; boosterOutOfRangeList.value = []; renderBoosterPointsOnMap() }
})
watch(() => resolveMapInstance(props.mapRef), (mapInstance) => { if (mapInstance) bindSiteRangeDrawEvents() }, { immediate: true })

onMounted(() => { bindSiteRangeDrawEvents(); loadProjectStages() })
onUnmounted(() => { unbindDrawCreate?.(); removeLayers([WIND_LAYER_IN, WIND_LAYER_OUT, BOOSTER_LAYER, SITE_RANGE_LAYER]) })

/* ==================== 其他 ==================== */
async function loadProjectStages() {
  stageLoading.value = true
  try {
    const response = await api.getStageList()
    const body = response?.data && !Array.isArray(response.data) && Array.isArray(response.data.data) ? response.data : response
    if (body?.code !== undefined && Number(body.code) !== 200) throw new Error(body.msg)
    projectStageOptions.value = (body?.data || []).map(item => ({ value: String(item.code).trim(), label: String(item.desc).trim() })).filter(i => i.value && i.label)
  } catch (err) { ElMessage.error('获取项目阶段失败') } finally { stageLoading.value = false }
}

function validate() {
  if (!form.projectCode.trim()) return '请输入项目编号'
  if (!form.projectName.trim()) return '请输入项目名称'
  if (!form.projectStage) return '请选择项目阶段'
  if (form.siteRangeMode === 'draw' && !siteRangeDrawn.value) return '请在地图上绘制场区范围'
  if (form.siteRangeMode === 'upload' && !siteRangeDrawn.value) return '请上传场区范围数据'

  if (form.windTurbineMode === 'has') {
    if (!windTurbinePoints.value.length) return '请上传风机点位数据'
    checkWindPointsInRange()
    if (windOutOfRangeList.value.length > 0) return `有 ${windOutOfRangeList.value.length} 个风机点位不在场区范围内，请调整`
  }

  if (form.boosterMode === 'has') {
    if (boosterEntryMode.value === 'manual') {
      const invalid = boosterPoints.value.some((p) => !p.lng || !p.lat || !Number.isFinite(Number(p.lng)) || !Number.isFinite(Number(p.lat)))
      if (invalid) return '请完整填写升压站点位经纬度'
    }
    checkBoosterPointsInRange()
    if (boosterOutOfRangeList.value.length > 0) return `有 ${boosterOutOfRangeList.value.length} 个升压站点位不在场区范围内，请调整`
  }

  if (form.accessMode === 'has') {
    if (!form.accessName.trim()) return '请输入拟接入变电站名称'
    if (!form.accessLng || !form.accessLat) return '请输入拟接入变电站位置经纬度'
  }
  return ''
}

function buildFileCollection() {
  const list = []
  if (siteRangeFileDto.value) list.push({ fileBusinessType: '场区范围', fileId: crypto.randomUUID(), fileName: siteRangeFileDto.value.fileName, filePath: siteRangeFileDto.value.filePath || siteRangeFileDto.value.objectKey, fileSuffix: siteRangeFileDto.value.fileSuffix })
  if (windTurbineFileDto.value) list.push({ fileBusinessType: '风机点位', fileId: crypto.randomUUID(), fileName: windTurbineFileDto.value.fileName, filePath: windTurbineFileDto.value.filePath || windTurbineFileDto.value.objectKey, fileSuffix: windTurbineFileDto.value.fileSuffix })
  if (boosterFileDto.value) list.push({ fileBusinessType: '升压站点位', fileId: crypto.randomUUID(), fileName: boosterFileDto.value.fileName, filePath: boosterFileDto.value.filePath || boosterFileDto.value.objectKey, fileSuffix: boosterFileDto.value.fileSuffix })
  return list
}

async function handleSave() {
  const errorMsg = validate()
  if (errorMsg) { ElMessage.warning(errorMsg); return }
  submitting.value = true
  try {
    const region = await resolveRegionByPoints(siteRangePoints.value)
    const regionPayload = {
      province: String(region.provinceCode || '').trim(), city: String(region.cityCode || '').trim(), district: String(region.districtCode || '').trim(),
      provinceName: String(region.provinceName || '').trim(), cityName: String(region.cityName || '').trim(), districtName: String(region.districtName || '').trim(), address: String(region.address || '').trim()
    }
    if (!regionPayload.province || !regionPayload.city) throw new Error('无法识别省、市行政区划编码')

    const payload = {
      itemType: form.itemType, projectCode: form.projectCode.trim(), projectName: form.projectName.trim(), projectStage: form.projectStage,
      province: regionPayload.province, city: regionPayload.city, district: regionPayload.district,
      province_name: regionPayload.provinceName, city_name: regionPayload.cityName, district_name: regionPayload.districtName, address: regionPayload.address,
      coordinate: siteRangePoints.value.map(p => ({ longitude: String(p.lng), latitude: String(p.lat), regionCode: Number(region.regionCode) })),
      windTurbinePoints: form.windTurbineMode === 'has' ? windTurbinePoints.value.map(p => ({ longitude: Number(p.lng), latitude: Number(p.lat), isAlternative: Number(p.isAlternative || 0) })) : [],
      boosterStationLocations: form.boosterMode === 'has' ? boosterPoints.value.map(p => ({ lng: Number(p.lng), lat: Number(p.lat), isBest: Number(p.isBest || 0) })) : [],
      accessSubstationName: form.accessMode === 'has' ? form.accessName.trim() : undefined,
      accessSubstationPoints: form.accessMode === 'has' ? [{ lng: Number(form.accessLng), lat: Number(form.accessLat) }] : [],
      sendOutType: form.accessMode === 'has' ? Number(form.sendOutType) : undefined,
      fileCollection: buildFileCollection(), notes: form.notes
    }
    await api.createProject(payload)
    ElMessage.success('项目创建成功')
    emit('saved', payload)
  } catch (err) { ElMessage.error(err?.message || '保存失败') } finally { submitting.value = false }
}

function handleCancel() { resolveMapInstance(props.mapRef)?.clearEditableAreas?.(); emit('cancel') }

defineExpose({
  startPolygonDrawing,
  handleMapDrawSave: () => { checkWindPointsInRange(); checkBoosterPointsInRange(); if (!siteRangeDrawn.value) { ElMessage.warning('请先绘制场区范围'); return } ElMessage.success('已保存当前地图数据') },
  handleMapDrawClear: clearSiteRange,
  isDrawing: ref(false)
})
</script>

<style scoped>
/* ★ 父容器宽度修改为 550px */
.create-project-form {
  display: flex; flex-direction: column; 
  flex: 0 0 550px; 
  width: 550px; 
  height: 100%;
  background: #fff; border-left: 1px solid #ebeef5; box-shadow: -4px 0 16px rgba(0, 0, 0, 0.06);
}
.cp-header { display: flex; align-items: center; justify-content: space-between; height: 48px; padding: 0 18px; border-bottom: 1px solid #ebeef5; flex-shrink: 0; }
.cp-title { color: #303133; font-size: 14px; font-weight: 600; }
.cp-header-actions { display: flex; gap: 8px; }
.cp-body { flex: 1; overflow-y: auto; padding: 16px 18px 24px; }

/* 表单左标签调整 */
:deep(.el-form-item) { margin-bottom: 20px; }
:deep(.el-form-item__label) { color: #606266; padding-right: 12px; font-size: 13px; line-height: 32px; }
:deep(.el-form-item__content) { flex: 1; display: block; } 

.cp-full-width { width: 100%; margin-top: 8px; }
.cp-tip { margin-top: 4px; color: #a0a5ad; font-size: 12px; line-height: 1.6; }
.cp-tip-success { color: #24b26b; }
.cp-tip-error { color: #f56c6c; }
.cp-link { color: #1677ff; cursor: pointer; }
.cp-point-toolbar { display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap; }

/* ★ 升压站工具栏极小化紧凑排版，强制一行 */
.booster-toolbar { 
  display: flex; 
  align-items: center; 
  gap: 6px; 
  flex-wrap: nowrap; 
  margin-bottom: 8px; 
}
.booster-select-mode { width: 85px; flex-shrink: 0; }
.booster-select-best { width: 75px; flex-shrink: 0; }

.booster-tabs { display: flex; gap: 2px; flex-shrink: 0; }
.booster-tab {
  display: flex; align-items: center; justify-content: center;
  width: 20px; height: 20px; color: #606266; font-size: 11px;
  background: #f5f7fa; border: 1px solid #dcdfe6; border-radius: 3px; cursor: pointer;
}
.booster-tab.active { color: #fff; background: #1677ff; border-color: #1677ff; }
.booster-tab-add { color: #1677ff; font-weight: 600; }
.booster-caption { color: #606266; font-size: 12px; white-space: nowrap; margin-right: 2px; }
.booster-placement { flex-shrink: 0; }

/* 覆盖 Element Plus 的默认 Radio Button Padding，让按钮更小 */
.booster-placement :deep(.el-radio-button__inner) { padding: 5px 8px; font-size: 12px; }

.booster-coord-row { display: flex; align-items: center; gap: 8px; margin-top: 8px; }

/* 接入站排版 */
.cp-subfield-row { display: flex; align-items: flex-start; margin-bottom: 12px; }
.cp-subfield-row:last-child { margin-bottom: 0; }
.cp-subfield-label {
  width: 120px; flex-shrink: 0; color: #606266; font-size: 13px; line-height: 32px;
  text-align: right; padding-right: 12px; box-sizing: border-box;
}
.cp-inline-row { flex: 1; display: flex; gap: 8px; }
.cp-inline-row .el-input { flex: 1; }

/* 超范围警告框 */
.cp-point-result { margin-top: 10px; }
.cp-warn-box {
  margin-top: 6px; padding: 8px 10px;
  background: #fef0f0; border: 1px solid #fbc4c4; border-radius: 4px;
  max-height: 160px; overflow-y: auto;
}
.cp-warn-item {
  display: flex; align-items: center; justify-content: space-between;
  font-size: 12px; color: #f56c6c; line-height: 1.8;
}
</style>