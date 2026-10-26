<template>
  <div class="avoidance-page">
    <MapGL ref="mapRef" :style="satelliteStyle" @ready="onMapReady" />

    <!-- 左下角信息弹窗 -->
    <div
      v-if="activeFeature && detailCard.visible"
      class="detail-card"
      :style="{ left: detailCard.x + 'px', top: detailCard.y + 'px' }"
    >
      <div class="detail-title">{{ activeFeature.attributes?.name || '未命名避让区' }}</div>
      <div class="detail-row">
        <span class="detail-label">类型</span>
        <span class="detail-value">{{ activeFeature.attributes?.type || '-' }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">负责人</span>
        <span class="detail-value">{{ activeFeature.attributes?.manager || '-' }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">创建时间</span>
        <span class="detail-value">{{ activeFeature.attributes?.createTime || '-' }}</span>
      </div>
    </div>

    <!-- 右侧列表面板 -->
    <AvoidanceListPanel
      v-model:collapsed="isListCollapsed"
      :list="rawAreaList"
      :active-guid="activeGuid"
      @select="handleSelectFromList"
      @fold-change="handlePanelFold"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, nextTick, computed } from 'vue'
import MapGL from '@/components/MapGL.vue'
import AvoidanceListPanel from './AvoidanceListPanel.vue'
import { satelliteStyle, shaanxiBoundary, AREA_SELECT_LAYER_KEY } from '@/views/qinchuan/js/mapConfig'
import { useProvinceAreaData } from '@/views/qinchuan/js/useProvinceAreaData'

// ==================== 数据 ====================
const mapRef = ref(null)
const mapReady = ref(false)
const isListCollapsed = ref(false)

// 获取避让面数据
const {
  provinceAreaGeoJSON,
  provinceAreaLoading,
  areaSelectResult,
  fetchAllProvinceAreaData
} = useProvinceAreaData(shaanxiBoundary, AREA_SELECT_LAYER_KEY)

// 原始数据列表，供右侧面板使用
const rawAreaList = computed(() => areaSelectResult.value?.list || [])

// 当前选中的要素
const activeGuid = ref(null)
const activeFeature = ref(null)

// 弹窗位置
const detailCard = reactive({ x: 0, y: 0, visible: false })

// ==================== 地图初始化 ====================
function onMapReady() {
  mapReady.value = true
  const map = mapRef.value.getMap()

  // 1. 绘制陕西省/市级边界轮廓（直接渲染，不需要再等 load 事件）
  mapRef.value.addPolygon({
    id: 'shaanxi-border',
    geojson: shaanxiBoundary,
    color: '#2A9FFF',       // 填充色（可以改成 transparent）
    opacity: 0.05,          // 很弱的填充色，不影响底图
    outlineColor: '#4fc3ff',// 边界线颜色
    outlineWidth: 2         // 边界线宽度
  })

  // 2. 添加城市名称标签
  mapRef.value.addCentroidLabels({
    id: 'shaanxi-labels',
    geojson: shaanxiBoundary,
    labelField: 'name',
    textColor: '#FFFFFF',
    textSize: 13,
    haloColor: '#000000',
    haloWidth: 1.5
  })

  // 3. 监听地图点击、移动事件
  map.on('click', handleMapClick)
  map.on('move', updateDetailCardPosition)
  map.on('zoom', updateDetailCardPosition)

  // 4. 拉取避让面数据
  fetchAllProvinceAreaData()
}

// ==================== 地图渲染避让面 ====================
watch(provinceAreaGeoJSON, (geojson) => {
  if (!mapReady.value || !geojson) return
  renderAvoidanceLayer(geojson)
})

function renderAvoidanceLayer(geojson) {
  const map = mapRef.value.getMap()
  const sourceId = 'avoidance-source'
  const layerIdFill = 'avoidance-fill'
  const layerIdLine = 'avoidance-line'

  // 给每个 feature 注入 guid 到 properties，确保 promoteId 可用
  const features = geojson.features.map((f) => ({
    ...f,
    properties: {
      ...f.properties,
      guid: f.id // useProvinceAreaData 里 id 就是 guid
    }
  }))
  const data = { type: 'FeatureCollection', features }

  if (map.getSource(sourceId)) {
    map.getSource(sourceId).setData(data)
  } else {
    map.addSource(sourceId, { type: 'geojson', data, promoteId: 'guid' })
    // 填充层
    map.addLayer({
      id: layerIdFill,
      type: 'fill',
      source: sourceId,
      paint: {
        'fill-color': '#8b5cf6', // 紫色填充
        'fill-opacity': 0.4
      }
    })
    // 描边层
    map.addLayer({
      id: layerIdLine,
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': '#a78bfa',
        'line-width': 1.5
      }
    })

    // 点击事件绑定到填充层
    map.on('click', layerIdFill, handlePolygonClick)
  }

  if (!features.length) {
    console.warn('当前范围内无避让区域数据')
  }
}

// ==================== 交互逻辑 ====================
// 点击地图上的面
function handlePolygonClick(e) {
  if (!e.features || !e.features.length) return
  const feature = e.features[0]
  const guid = feature.properties.guid
  const attrs = JSON.parse(JSON.stringify(feature.properties)) 

  // 高亮该面
  setHighlight(guid)
  activeGuid.value = guid
  activeFeature.value = { attributes: attrs, geometry: feature.geometry }

  // 更新弹窗位置
  updateDetailCardByFeature(feature)
}

// 从右侧列表点击
function handleSelectFromList(item) {
  const guid = item.guid
  const attrs = item.attributes || {}

  // 高亮
  setHighlight(guid)
  activeGuid.value = guid
  activeFeature.value = { attributes: attrs, geometry: item.geometry }

  // 飞到该面中心
  const centroid = getPolygonCentroid(item.geometry)
  if (centroid && mapRef.value) {
    mapRef.value.getMap().flyTo({
      center: centroid,
      zoom: 11,
      pitch: 0,
      duration: 1200
    })
    // 更新弹窗位置
    setTimeout(() => {
      updateDetailCardByCenter(centroid)
    }, 1200)
  }
}

// 点击空白取消
function handleMapClick(e) {
  const features = mapRef.value.getMap().queryRenderedFeatures(e.point, { layers: ['avoidance-fill'] })
  if (!features.length) {
    clearHighlight()
    activeGuid.value = null
    activeFeature.value = null
    detailCard.visible = false
  }
}

// 高亮逻辑（利用 feature-state）
function setHighlight(guid) {
  const map = mapRef.value.getMap()
  if (!map || !guid) return
  map.removeFeatureState({ source: 'avoidance-source' })
  map.setFeatureState({ source: 'avoidance-source', id: guid }, { selected: true })

  map.setPaintProperty('avoidance-fill', 'fill-color', [
    'case',
    ['boolean', ['feature-state', 'selected'], false],
    '#3b82f6', // 选中蓝
    '#8b5cf6'  // 默认紫
  ])
  map.setPaintProperty('avoidance-fill', 'fill-opacity', [
    'case',
    ['boolean', ['feature-state', 'selected'], false],
    0.6,
    0.4
  ])
  map.setPaintProperty('avoidance-line', 'line-color', [
    'case',
    ['boolean', ['feature-state', 'selected'], false],
    '#60a5fa',
    '#a78bfa'
  ])
  map.setPaintProperty('avoidance-line', 'line-width', [
    'case',
    ['boolean', ['feature-state', 'selected'], false],
    3,
    1.5
  ])
}

function clearHighlight() {
  const map = mapRef.value.getMap()
  if (!map) return
  map.removeFeatureState({ source: 'avoidance-source' })
}

// 更新弹窗位置
function updateDetailCardByFeature(feature) {
  const centroid = getPolygonCentroid(feature.geometry)
  if (!centroid) return
  updateDetailCardByCenter(centroid)
}

function updateDetailCardByCenter(center) {
  if (!mapRef.value) return
  const map = mapRef.value.getMap()
  const point = map.project(center)
  detailCard.x = point.x
  detailCard.y = point.y
  detailCard.visible = true
}

function updateDetailCardPosition() {
  if (!activeFeature.value || !detailCard.visible) return
  const centroid = getPolygonCentroid(activeFeature.value.geometry)
  if (!centroid) return
  updateDetailCardByCenter(centroid)
}

// 工具：计算多边形中心点
function getPolygonCentroid(geometry) {
  if (!geometry) return null
  const coords = geometry.type === 'Polygon'
    ? geometry.coordinates[0]
    : geometry.type === 'MultiPolygon'
      ? geometry.coordinates[0][0]
      : null
  if (!coords || !coords.length) return null
  let sx = 0, sy = 0
  coords.forEach(([x, y]) => { sx += x; sy += y })
  return [sx / coords.length, sy / coords.length]
}

// 折叠右侧面板时，重置地图尺寸
function handlePanelFold() {
  nextTick(() => {
    if (mapRef.value) mapRef.value.getMap()?.resize()
  })
}
</script>

<style scoped>
.avoidance-page {
  position: relative;
  width: 100%;
  height: calc(100vh - 56px); /* 假设顶部有公共 header */
  overflow: hidden;
  background: #03162e;
}

/* 左下角弹窗，位置与效果图类似 */
.detail-card {
  position: absolute;
  z-index: 30;
  width: 240px;
  padding: 12px 14px;
  color: #303133;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 6px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
  transform: translate(calc(-100% - 16px), 12px);
  pointer-events: none; /* 若需要弹窗内按钮可设为 auto */
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
  width: 60px;
  color: #909399;
}

.detail-value {
  flex: 1;
  color: #303133;
}
</style>