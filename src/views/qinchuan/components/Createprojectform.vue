<template>
  <aside class="create-project-form">
    <div class="cp-header">
      <!-- ★ 改动：标题按模式动态 -->
      <span class="cp-title">{{ isEditMode ? '编辑项目' : '创建项目' }}</span>
      <div class="cp-header-actions">
        <el-button size="small" @click="handleCancel">取消</el-button>
        <el-button type="primary" size="small" :loading="submitting" @click="handleSave">保存</el-button>
      </div>
    </div>

    <div class="cp-body">
      <el-form label-position="right" label-width="110px" size="default" class="cp-form">
        <!-- 项目类型 -->
        <el-form-item label="项目类型" required>
          <el-radio-group v-model="form.itemType">
            <el-radio label="FD">风电</el-radio>
            <el-radio label="GF">光伏</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="项目编号" required>
          <el-input v-model="form.projectCode" placeholder="请输入" />
        </el-form-item>

        <el-form-item label="项目名称" required>
          <el-input v-model="form.projectName" placeholder="请输入" />
        </el-form-item>

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
                accept=".xlsx,.kmz,.kml,.ovkml,.json"
                biz-type="场区范围"
                button-text="上传数据"
                :user-name="userName"
                :show-progress="true"
                @success="handleSiteRangeUploadSuccess"
                @remove="handleSiteRangeUploadRemove"
                @error="handleUploadError"
              />
              <p class="cp-tip">
                说明：支持xlsx/kmz/kml/ovkml/json格式数据，xlsx数据需
                <span class="cp-link" @click="downloadTemplate('siteRange')">下载数据模板</span>
              </p>
            </template>
          </div>
        </el-form-item>

        <!-- ================= 风机点位 ================= -->
        <el-form-item label="风机点位">
          <el-radio-group v-model="form.windTurbineMode">
            <el-radio label="has">有</el-radio>
            <el-radio label="none">暂无</el-radio>
          </el-radio-group>

          <div class="cp-full-width" v-if="form.windTurbineMode === 'has'">
            <OmniUploader
              v-model="windTurbineFileModel"
              accept=".xlsx,.kmz,.kml,.ovkml,.json"
              biz-type="风机点位"
              button-text="上传数据"
              :user-name="userName"
              :show-progress="true"
              @success="handleWindTurbineUploadSuccess"
              @remove="handleWindTurbineUploadRemove"
              @error="handleUploadError"
            />
            <p class="cp-tip">
              说明：支持xlsx/kmz/kml/ovkml/json格式数据，xlsx数据需
              <span class="cp-link" @click="downloadTemplate('windTurbine')">下载数据模板</span>
            </p>

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

                <el-select v-model="activeBoosterPoint.isBest" size="small" class="booster-select-best">
                  <el-option label="最优" :value="1" />
                  <el-option label="非最优" :value="0" />
                </el-select>
              </template>
            </div>

            <div v-if="boosterEntryMode === 'manual'" class="booster-coord-list">
              <div
                v-for="(point, idx) in boosterPoints"
                :key="idx"
                class="booster-coord-row"
                :class="{ active: idx === activeBoosterIndex }"
                @click="activeBoosterIndex = idx"
              >
                <span class="booster-coord-index">{{ idx + 1 }}</span>
                <el-input
                  v-model="point.lng"
                  placeholder="请输入经度"
                  @blur="onBoosterCoordInput"
                />
                <el-input
                  v-model="point.lat"
                  placeholder="请输入纬度"
                  @blur="onBoosterCoordInput"
                />
                <el-icon
                  v-if="boosterPoints.length > 1"
                  class="booster-remove"
                  title="删除该点位"
                  @click.stop="removeBoosterPoint(idx)"
                >
                  <Close />
                </el-icon>
              </div>
            </div>

            <template v-else>
              <OmniUploader
                v-model="boosterFileModel"
                accept=".xlsx,.kmz,.kml,.ovkml,.json"
                biz-type="升压站点位"
                button-text="上传数据"
                :user-name="userName"
                :show-progress="true"
                @success="handleBoosterUploadSuccess"
                @remove="handleBoosterUploadRemove"
                @error="handleUploadError"
              />
              <p class="cp-tip">
                说明：支持xlsx/kmz/kml/ovkml/json格式数据，xlsx数据需
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
            <div class="cp-subfield-row">
              <span class="cp-subfield-label">拟接入变电站名称</span>
              <el-input v-model="form.accessName" placeholder="请输入拟接入的变电站名称" />
            </div>

            <div class="cp-subfield-row">
              <span class="cp-subfield-label">拟接入变电站位置</span>
              <div class="cp-inline-row">
                <el-input v-model="form.accessLng" placeholder="请输入经度" />
                <el-input v-model="form.accessLat" placeholder="请输入纬度" />
              </div>
            </div>

            <div class="cp-subfield-row">
              <span class="cp-subfield-label">送出工程接入方式</span>
              <el-radio-group v-model="form.sendOutType">
                <el-radio :label="1">架空线路</el-radio>
                <el-radio :label="2">电缆铺设</el-radio>
              </el-radio-group>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="项目备注">
          <el-input v-model="form.notes" type="textarea" :rows="3" placeholder="请输入" />
        </el-form-item>
      </el-form>
    </div>
  </aside>
</template>

<script setup>
import {
  reactive, ref, computed, watch, onMounted, onUnmounted, nextTick
} from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Close } from '@element-plus/icons-vue'
import OmniUploader from '@/components/upload/Upload2.vue'
import * as api from '@/api/modules/project'
import {
  parseSiteRangeFile,
  parseWindTurbineFile,
  parseBoosterFile as parseBoosterFileFromModule,
} from '../js/parseCoordinateFile'
import { resolveRegionByPoints, isPolygonWithinRadius } from '../js/useTiandituGeocode'

import fengjiIcon from '@/assets/img/mapIcon/fengji.png'
import shengyazhanIcon from '@/assets/img/mapIcon/syz.png'

const MAX_SITE_RANGE_RADIUS_KM = 25

// ★ 改动：新增 mode / project
const props = defineProps({
  mapRef: { type: Object, required: true },
  mode: { type: String, default: 'create' },   // 'create' | 'edit'
  project: { type: Object, default: null },    // 编辑时的回显数据
})
const emit = defineEmits(['cancel', 'saved', 'site-range-mode-change'])

// ★ 改动
const isEditMode = computed(() => props.mode === 'edit')

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
const createBoosterPoint = () => ({ lng: '', lat: '', isBest: 0, placement: 'center', geometry: null })
const boosterPoints = ref([createBoosterPoint()])
const activeBoosterIndex = ref(0)
const activeBoosterPoint = computed(() => boosterPoints.value[activeBoosterIndex.value])
const boosterFileModel = ref(null)
const boosterFileDto = ref(null)
const boosterOutOfRangeList = ref([])

// ★ 改动：编辑时的原始文件集合，保存时与新增文件合并
const originalFileCollection = ref([])

function addBoosterPoint() {
  if (boosterPoints.value.length >= 2) {
    ElMessage.warning('最多只能添加2个升压站点位')
    return
  }
  boosterPoints.value.push(createBoosterPoint())
  activeBoosterIndex.value = boosterPoints.value.length - 1
  renderBoosterOnMap()
}

function removeBoosterPoint(idx) {
  if (boosterPoints.value.length <= 1) return
  boosterPoints.value.splice(idx, 1)
  activeBoosterIndex.value = Math.min(activeBoosterIndex.value, boosterPoints.value.length - 1)
  renderBoosterOnMap()
  checkBoosterPointsInRange()
}

let boosterInputTimer = null
function onBoosterCoordInput() {
  renderBoosterOnMap()
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

/* ==================== 升压站文件解析辅助 ==================== */
function withName(blob, name) {
  if (!blob || !name) return blob
  try {
    Object.defineProperty(blob, 'name', { value: name, configurable: true })
  } catch { /* 某些环境不可写，忽略 */ }
  return blob
}

async function resolveUploadFile(dto, file) {
  const raw = (typeof file?.text === 'function' && file)
    || (typeof file?.raw?.text === 'function' && file.raw)
    || (typeof file?.file?.text === 'function' && file.file)
  if (raw) return raw

  if (dto?.url) {
    const res = await fetch(dto.url)
    if (!res.ok) throw new Error(`下载文件失败：HTTP ${res.status}`)
    const blob = await res.blob()
    return withName(blob, dto.fileName || `file.${dto.fileSuffix || 'kml'}`)
  }
  throw new Error('未获取到可解析的文件内容')
}

function dedupeRing(points) {
  const out = []
  for (const p of points) {
    const lng = Number(Array.isArray(p) ? p[0] : (p.lng ?? p.longitude))
    const lat = Number(Array.isArray(p) ? p[1] : (p.lat ?? p.latitude))
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue
    const last = out[out.length - 1]
    if (!last || last[0] !== lng || last[1] !== lat) out.push([lng, lat])
  }
  if (out.length >= 3) {
    const first = out[0], last = out[out.length - 1]
    if (first[0] !== last[0] || first[1] !== last[1]) out.push([first[0], first[1]])
  }
  return out
}

function centroidOfRing(ring) {
  let sumLng = 0, sumLat = 0
  const pts = (ring.length > 1 &&
    ring[0][0] === ring[ring.length - 1][0] &&
    ring[0][1] === ring[ring.length - 1][1])
    ? ring.slice(0, -1)
    : ring
  for (const [lng, lat] of pts) { sumLng += lng; sumLat += lat }
  return [sumLng / pts.length, sumLat / pts.length]
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
    if (p.placement === 'closure' && p.geometry) {
      const center = p.geometry[0][0]
      if (!pointInPolygon(center, ring)) list.push({ index, lng: p.lng, lat: p.lat })
      return
    }
    if (!p.lng || !p.lat) return
    if (!pointInPolygon([Number(p.lng), Number(p.lat)], ring)) {
      list.push({ index, lng: p.lng, lat: p.lat })
    }
  })
  boosterOutOfRangeList.value = list
  renderBoosterOnMap()
}

/* ==================== 地图渲染 ==================== */
const WIND_LAYER_IN = 'create-wind-in'
const WIND_LAYER_OUT = 'create-wind-out'
const BOOSTER_POINT_LAYER = 'create-booster-point'
const BOOSTER_AREA_LAYER = 'create-booster-area'
const SITE_RANGE_LAYER = 'create-site-range'

function removeLayers(ids) {
  const mapInstance = resolveMapInstance(props.mapRef)
  ids.forEach((id) => mapInstance?.removeLayer?.(id))
}

function bringCustomLayersToFront() {
  const mapInstance = resolveMapInstance(props.mapRef)
  const map = mapInstance?.getMap?.()
  if (!map) return
  const layers = [
    WIND_LAYER_IN, WIND_LAYER_OUT,
    BOOSTER_POINT_LAYER, BOOSTER_AREA_LAYER,
    SITE_RANGE_LAYER
  ]
  layers.forEach(id => {
    if (map.getLayer(id)) map.moveLayer(id)
  })
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
    mapInstance.addImagePoints({
      id: WIND_LAYER_IN,
      geojson: { type: 'FeatureCollection', features: inFeatures },
      iconId: 'wind-icon',
      iconUrl: fengjiIcon,
      iconSize: 0.15,
      iconAnchor: 'bottom'
    })
  }

  if (outFeatures.length) {
    mapInstance.addImagePoints({
      id: WIND_LAYER_OUT,
      geojson: { type: 'FeatureCollection', features: outFeatures },
      iconId: 'wind-icon',
      iconUrl: fengjiIcon,
      iconSize: 0.15,
      iconAnchor: 'bottom'
    })
  }
  setTimeout(bringCustomLayersToFront, 50)
}

function renderBoosterOnMap() {
  const mapInstance = resolveMapInstance(props.mapRef)
  if (!mapInstance) return
  removeLayers([BOOSTER_POINT_LAYER, BOOSTER_AREA_LAYER])

  const centerPoints = []
  const closureAreas = []

  boosterPoints.value.forEach((p, i) => {
    if (p.placement === 'closure' && p.geometry && p.geometry.length > 0) {
      closureAreas.push({
        type: 'Feature',
        properties: { index: i },
        geometry: { type: 'Polygon', coordinates: p.geometry }
      })
    } else if (p.lng && p.lat) {
      const lng = Number(p.lng), lat = Number(p.lat)
      if (!Number.isFinite(lng) || !Number.isFinite(lat)) return
      centerPoints.push({
        type: 'Feature',
        properties: { index: i },
        geometry: { type: 'Point', coordinates: [lng, lat] }
      })
    }
  })

  if (closureAreas.length) {
    mapInstance.addPolygon({
      id: BOOSTER_AREA_LAYER,
      geojson: { type: 'FeatureCollection', features: closureAreas },
      color: '#22c55e',
      opacity: 0.4,
      outlineColor: '#16a34a'
    })
  }

  if (centerPoints.length) {
    mapInstance.addImagePoints({
      id: BOOSTER_POINT_LAYER,
      geojson: { type: 'FeatureCollection', features: centerPoints },
      iconId: 'booster-icon',
      iconUrl: shengyazhanIcon,
      iconSize: 0.04,
      iconAnchor: 'bottom'
    })
  }
  setTimeout(bringCustomLayersToFront, 50)
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
  setTimeout(bringCustomLayersToFront, 50)
}

/* ==================== 视角飞行 ==================== */
function flyToBounds(coords) {
  if (!coords || !coords.length) return
  const mapInstance = resolveMapInstance(props.mapRef)
  const map = mapInstance?.getMap?.()
  if (!map) return
  let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity
  coords.forEach(c => {
    const lng = Array.isArray(c) ? c[0] : c.lng
    const lat = Array.isArray(c) ? c[1] : c.lat
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) return
    if (lng < minLng) minLng = lng
    if (lng > maxLng) maxLng = lng
    if (lat < minLat) minLat = lat
    if (lat > maxLat) maxLat = lat
  })
  if (minLng !== Infinity) {
    map.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: 100, duration: 1200 })
  }
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
    flyToBounds(ring)
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
  renderBoosterOnMap()
}

/* ==================== 上传处理 ==================== */
async function handleSiteRangeUploadSuccess(dto, file) {
  siteRangeFileDto.value = { ...dto }
  try {
    const raw = await resolveUploadFile(dto, file)
    const points = await parseSiteRangeFile(raw)
    siteRangePoints.value = points
    renderSiteRangeOnMap()
    checkWindPointsInRange()
    checkBoosterPointsInRange()
    flyToBounds(points.map(p => [Number(p.lng), Number(p.lat)]))
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
    const raw = await resolveUploadFile(dto, file)
    const points = await parseWindTurbineFile(raw)
    windTurbinePoints.value = points.map((p) => ({ lng: Number(p.lng), lat: Number(p.lat), isAlternative: Number(p.isAlternative || 0) }))
    checkWindPointsInRange()
    const out = windOutOfRangeList.value.length
    if (out > 0) ElMessage.warning(`风机点位解析成功，但有 ${out} 个点位不在场区范围内`)
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
    const raw = await resolveUploadFile(dto, file)
    const parsed = await parseBoosterFileFromModule(raw)

    if (parsed.type === 'polygon') {
      const ring = dedupeRing(parsed.rings[0])
      if (ring.length < 3) throw new Error('范围坐标点不足')
      const [centerLng, centerLat] = centroidOfRing(ring)
      boosterPoints.value = [{
        lng: centerLng.toFixed(6),
        lat: centerLat.toFixed(6),
        isBest: 1,
        placement: 'closure',
        geometry: [ring],
      }]
      activeBoosterIndex.value = 0
      renderBoosterOnMap()
      checkBoosterPointsInRange()
      flyToBounds(ring)
    } else {
      const pts = parsed.points || []
      if (!pts.length) throw new Error('文件内无坐标数据')
      const seen = new Set()
      const uniq = []
      for (const p of pts) {
        const key = `${p.lng},${p.lat}`
        if (!seen.has(key)) { seen.add(key); uniq.push(p) }
      }
      boosterPoints.value = uniq.map(p => ({
        lng: String(p.lng),
        lat: String(p.lat),
        isBest: Number(p.isBest || 0),
        placement: 'center',
        geometry: null,
      }))
      activeBoosterIndex.value = 0
      renderBoosterOnMap()
      checkBoosterPointsInRange()
      if (uniq.length) {
        flyToBounds(uniq.map(p => [Number(p.lng), Number(p.lat)]))
      }
    }

    ElMessage.success('升压站数据解析成功')
  } catch (err) {
    ElMessage.error(`升压站点位文件解析失败：${err?.message || '文件内容无法解析'}`)
    boosterPoints.value = [createBoosterPoint()]
    boosterOutOfRangeList.value = []
    renderBoosterOnMap()
  }
}
function handleBoosterUploadRemove() {
  boosterFileDto.value = null
  boosterPoints.value = [createBoosterPoint()]
  boosterOutOfRangeList.value = []
  renderBoosterOnMap()
}

function handleUploadError(err) { ElMessage.error(`上传失败：${err?.message || '请稍后重试'}`) }
function downloadTemplate(type) { ElMessage.info(`下载 ${type} 数据模板`) }

/* ==================== 监听 & 生命周期 ==================== */
// ★ 改动：去掉 immediate，避免初始化时冲掉编辑回显；仅在用户切换时触发
watch(() => form.siteRangeMode, (mode, oldMode) => {
  if (oldMode === undefined) return
  emit('site-range-mode-change', mode)
  const mapInstance = resolveMapInstance(props.mapRef)
  if (mode === 'draw') { clearSiteRange(); startPolygonDrawing() }
  else { clearSiteRange(); mapInstance?.getDraw?.()?.changeMode?.('simple_select') }
})

watch(() => form.windTurbineMode, (mode) => {
  if (mode !== 'has') { windTurbinePoints.value = []; windOutOfRangeList.value = []; renderWindPointsOnMap() }
})
watch(() => form.boosterMode, (mode) => {
  if (mode !== 'has') { boosterPoints.value = [createBoosterPoint()]; boosterOutOfRangeList.value = []; renderBoosterOnMap() }
})

// 从「导入数据」切到「手动录入」时，把 closure 转成 center
watch(boosterEntryMode, (mode) => {
  if (mode === 'manual') {
    boosterPoints.value = boosterPoints.value.map(p => ({
      lng: p.lng || '',
      lat: p.lat || '',
      isBest: Number(p.isBest || 0),
      placement: 'center',
      geometry: null,
    }))
    if (!boosterPoints.value.length) boosterPoints.value = [createBoosterPoint()]
    activeBoosterIndex.value = 0
    renderBoosterOnMap()
    checkBoosterPointsInRange()
  }
})

watch(() => resolveMapInstance(props.mapRef), (mapInstance) => { if (mapInstance) bindSiteRangeDrawEvents() }, { immediate: true })

onMounted(() => {
  bindSiteRangeDrawEvents()
  loadProjectStages()

  // ★ 改动：编辑模式回显；创建模式保持"打开即开始绘制"
  if (props.mode === 'edit' && props.project) {
    initFromProject(props.project)
  } else if (form.siteRangeMode === 'draw') {
    nextTick(() => startPolygonDrawing())
  }
})

onUnmounted(() => {
  if (boosterInputTimer) clearTimeout(boosterInputTimer)
  unbindDrawCreate?.()
  removeLayers([WIND_LAYER_IN, WIND_LAYER_OUT, BOOSTER_POINT_LAYER, BOOSTER_AREA_LAYER, SITE_RANGE_LAYER])
})

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

// ★ 改动：更安全的 id 生成
function genId() {
  try { return crypto.randomUUID() }
  catch { return `f-${Date.now()}-${Math.random().toString(16).slice(2, 10)}` }
}

function buildFileCollection() {
  const list = []
  if (siteRangeFileDto.value) list.push({ fileBusinessType: '场区范围', fileId: genId(), fileName: siteRangeFileDto.value.fileName, filePath: siteRangeFileDto.value.filePath || siteRangeFileDto.value.objectKey, fileSuffix: siteRangeFileDto.value.fileSuffix })
  if (windTurbineFileDto.value) list.push({ fileBusinessType: '风机点位', fileId: genId(), fileName: windTurbineFileDto.value.fileName, filePath: windTurbineFileDto.value.filePath || windTurbineFileDto.value.objectKey, fileSuffix: windTurbineFileDto.value.fileSuffix })
  if (boosterFileDto.value) list.push({ fileBusinessType: '升压站点位', fileId: genId(), fileName: boosterFileDto.value.fileName, filePath: boosterFileDto.value.filePath || boosterFileDto.value.objectKey, fileSuffix: boosterFileDto.value.fileSuffix })
  return list
}

// ★ 改动：编辑保存时合并原有文件
function mergeFileCollection(original, newFiles) {
  const out = []
  const seen = new Set()
  const newBizTypes = new Set(newFiles.map((f) => f.fileBusinessType))
  for (const f of original || []) {
    if (f.fileBusinessType && newBizTypes.has(f.fileBusinessType)) continue
    const key = f.fileId || f.filePath || `${f.fileBusinessType}-${f.fileName}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(f)
  }
  for (const f of newFiles) {
    const key = f.fileId || f.filePath || `${f.fileBusinessType}-${f.fileName}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(f)
  }
  return out
}

// ★ 改动：回显
function initFromProject(project) {
  if (!project) return

  // ---- 基本信息 ----
  form.itemType = project.itemType || 'FD'
  form.projectCode = project.projectCode || ''
  form.projectName = project.projectName || ''
  form.projectStage = project.projectStage || ''
  form.notes = project.notes || ''

  // ---- 场区范围（coordinate: [{longitude, latitude, regionCode}]）----
  const coords = (project.coordinate || [])
    .map((p) => ({ lng: Number(p.longitude ?? p.lng), lat: Number(p.latitude ?? p.lat) }))
    .filter((p) => Number.isFinite(p.lng) && Number.isFinite(p.lat))
  if (coords.length >= 3) {
    siteRangePoints.value = coords
    form.siteRangeMode = 'draw'
  }

  // ---- 风机（windTurbinePoints: [{longitude, latitude, isReserve}]）----
  const wind = (project.windTurbinePoints || [])
    .map((p) => ({
      lng: Number(p.longitude ?? p.lng),
      lat: Number(p.latitude ?? p.lat),
      isAlternative: Number(p.isReserve ?? p.isAlternative ?? 0),
    }))
    .filter((p) => Number.isFinite(p.lng) && Number.isFinite(p.lat))
  if (wind.length) {
    windTurbinePoints.value = wind
    form.windTurbineMode = 'has'
  }

  // ---- 升压站（boosterStationLocations: [{lng, lat, isBest}]，兼容 closure/geometry）----
  const booster = (project.boosterStationLocations || [])
    .map((p) => ({
      lng: Number(p.lng),
      lat: Number(p.lat),
      isBest: Number(p.isBest ?? 0),
      placement: p.placement === 'closure' ? 'closure' : 'center',
      geometry: p.geometry || null,
    }))
    .filter((p) => Number.isFinite(p.lng) && Number.isFinite(p.lat))
  if (booster.length) {
    boosterPoints.value = booster
    form.boosterMode = 'has'
    boosterEntryMode.value = 'manual'
    activeBoosterIndex.value = 0
  }

  // ---- 接入站 ----
  if (project.accessSubstationName) {
    form.accessMode = 'has'
    form.accessName = project.accessSubstationName || ''
    const acc = (project.accessSubstationPoints || [])[0]
    if (acc) {
      form.accessLng = acc.lng != null ? String(acc.lng) : ''
      form.accessLat = acc.lat != null ? String(acc.lat) : ''
    }
    form.sendOutType = Number(project.sendOutType ?? 1)
  } else {
    form.accessMode = 'none'
  }

  // ---- 原始文件集合（编辑保存时合并）----
  originalFileCollection.value = Array.isArray(project.fileCollection)
    ? project.fileCollection.map((f) => ({ ...f }))
    : []

  // ---- 地图渲染 ----
  nextTick(() => {
    renderSiteRangeOnMap()
    checkWindPointsInRange()
    checkBoosterPointsInRange()
    renderBoosterOnMap()
    bringCustomLayersToFront()
  })
}

// ★ 改动：统一 payload 构造
function buildPayload(region, isEdit) {
  const regionPayload = {
    province: String(region.provinceCode || '').trim(),
    city: String(region.cityCode || '').trim(),
    district: String(region.districtCode || '').trim(),
    provinceName: String(region.provinceName || '').trim(),
    cityName: String(region.cityName || '').trim(),
    districtName: String(region.districtName || '').trim(),
    address: String(region.address || '').trim(),
  }

  const newFiles = buildFileCollection()
  const fileCollection = isEdit
    ? mergeFileCollection(originalFileCollection.value, newFiles)
    : newFiles

  const payload = {
    itemType: form.itemType,
    projectCode: form.projectCode.trim(),
    projectName: form.projectName.trim(),
    projectStage: form.projectStage,

    // 编辑接口 AiProjectUpdateByUserReqVO 示例传名称；create 保持原编码 + name 字段
    province: isEdit ? regionPayload.provinceName : regionPayload.province,
    city:     isEdit ? regionPayload.cityName     : regionPayload.city,
    district: isEdit ? regionPayload.districtName : regionPayload.district,
    address:  regionPayload.address,

    coordinate: siteRangePoints.value.map((p) => ({
      longitude: String(p.lng),
      latitude: String(p.lat),
      regionCode: Number(region.regionCode) || Number(region.cityCode) || null,
    })),

    windTurbinePoints: form.windTurbineMode === 'has'
      ? windTurbinePoints.value.map((p) => ({
          longitude: Number(p.lng),
          latitude: Number(p.lat),
          isReserve: Number(p.isAlternative || 0),
        }))
      : [],

    boosterStationLocations: form.boosterMode === 'has'
      ? boosterPoints.value.map((p) => {
          const base = { lng: Number(p.lng), lat: Number(p.lat), isBest: Number(p.isBest || 0) }
          if (p.placement === 'closure' && p.geometry) {
            return { ...base, geometry: p.geometry, placement: 'closure' }
          }
          return base
        })
      : [],

    accessSubstationName: form.accessMode === 'has' ? form.accessName.trim() : null,
    accessSubstationPoints: form.accessMode === 'has'
      ? [{ lng: Number(form.accessLng), lat: Number(form.accessLat) }]
      : [],
    sendOutType: form.accessMode === 'has' ? Number(form.sendOutType) : null,

    fileCollection,
    notes: form.notes,
  }

  if (!isEdit) {
    payload.province_name = regionPayload.provinceName
    payload.city_name = regionPayload.cityName
    payload.district_name = regionPayload.districtName
  }

  return payload
}

async function handleSave() {
  const errorMsg = validate()
  if (errorMsg) { ElMessage.warning(errorMsg); return }
  submitting.value = true
  try {
    const region = await resolveRegionByPoints(siteRangePoints.value)
    if (!region.provinceCode || !region.cityCode) throw new Error('无法识别省、市行政区划编码')

    const isEdit = isEditMode.value
    const payload = buildPayload(region, isEdit)

    if (isEdit) {
      const id = props.project?.id
      if (!id) throw new Error('缺少项目ID，无法保存')
      const res = await api.updateSXProject(id, payload)
      if (res?.code !== 200) throw new Error(res?.msg || '保存失败')
      ElMessage.success('保存成功')
      emit('saved', { id, payload })
    } else {
      await api.createProject(payload)
      ElMessage.success('项目创建成功')
      emit('saved', payload)
    }
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

:deep(.el-form-item) { margin-bottom: 20px; }
:deep(.el-form-item__label) { color: #606266; padding-right: 12px; font-size: 13px; line-height: 32px; }
:deep(.el-form-item__content) { flex: 1; display: block; }

.cp-full-width { width: 100%; margin-top: 8px; }
.cp-tip { margin-top: 4px; color: #a0a5ad; font-size: 12px; line-height: 1.6; }
.cp-tip-success { color: #24b26b; }
.cp-tip-error { color: #f56c6c; }
.cp-link { color: #1677ff; cursor: pointer; }
.cp-point-toolbar { display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap; }

.booster-toolbar { display: flex; align-items: center; gap: 6px; flex-wrap: nowrap; margin-bottom: 8px; }
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

.booster-coord-list { display: flex; flex-direction: column; gap: 6px; margin-top: 8px; }
.booster-coord-row {
  display: flex; align-items: center; gap: 8px;
  padding: 4px 6px; border: 1px solid transparent; border-radius: 4px;
  cursor: pointer;
}
.booster-coord-row.active { border-color: #1677ff; background: #f0f7ff; }
.booster-coord-index {
  flex-shrink: 0; width: 18px; height: 18px; line-height: 18px;
  text-align: center; font-size: 11px; color: #fff;
  background: #1677ff; border-radius: 50%;
}
.booster-coord-row .el-input { flex: 1; }
.booster-remove { flex-shrink: 0; color: #f56c6c; cursor: pointer; }

.cp-subfield-row { display: flex; align-items: flex-start; margin-bottom: 12px; }
.cp-subfield-row:last-child { margin-bottom: 0; }
.cp-subfield-label {
  width: 110px; flex-shrink: 0; color: #606266; font-size: 13px; line-height: 32px;
  text-align: right; padding-right: 12px; box-sizing: border-box;
}
.cp-inline-row { flex: 1; display: flex; gap: 8px; }
.cp-inline-row .el-input { flex: 1; }

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