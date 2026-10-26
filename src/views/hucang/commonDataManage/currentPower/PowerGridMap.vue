<template>
  <div class="power-grid-page">
    <MapGL ref="mapRef" :style="satelliteStyle" @ready="onMapReady" />
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import MapGL from '@/components/MapGL.vue'
import { satelliteStyle } from '@/views/qinchuan/js/mapConfig'
import { attachSxLayers } from '@/components/site-map/attachSxLayers'
import { loadShaanxiProvince, loadShaanxiCities } from '@/utils/shaanxiBoundary'

// ⚠️ 电网（power-infra）服务地址，必须填。
// 留空时 attachSxLayers 会在控制台 warn，且电网图层加载不出来。
const POWER_INFRA_URL = ''

const mapRef = ref(null)
let whlnPlugin = null

// ============================================================
// 边界数据（WFS 加载，带本地兜底）
// ============================================================
// 在 onMounted 就开始加载，MapGL 初始化期间并行拉数据；
// onMapReady 里如果还没就绪会 await 同一个 Promise。
let provincePromise = null
let citiesPromise = null

function ensureProvince() {
  if (!provincePromise) {
    provincePromise = loadShaanxiProvince().catch((err) => {
      console.error('[power-grid] 陕西省界加载失败:', err)
      return null
    })
  }
  return provincePromise
}

function ensureCities() {
  if (!citiesPromise) {
    citiesPromise = loadShaanxiCities().catch((err) => {
      console.error('[power-grid] 陕西省市界加载失败:', err)
      return null
    })
  }
  return citiesPromise
}

// ============================================================
// 陕西省遮罩（世界外圈 + 陕西省内洞）
// ============================================================
const MASK_LAYER_ID = 'shaanxi-mask'
const MASK_SOURCE_ID = 'shaanxi-mask-src'
const MASK_COLOR = '#0b1e3a'

function ensureClosed(ring) {
  if (!ring || ring.length < 3) return ring
  const f = ring[0]
  const l = ring[ring.length - 1]
  return f[0] === l[0] && f[1] === l[1] ? ring : [...ring, [f[0], f[1]]]
}

function ringSignedArea(ring) {
  if (!ring || ring.length < 3) return 0
  let a = 0
  for (let i = 0; i < ring.length - 1; i++) {
    a += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1]
  }
  return a / 2
}

function ensureOuterCCW(ring) {
  const r = ensureClosed(ring)
  return ringSignedArea(r) >= 0 ? r : r.slice().reverse()
}

function ensureHoleCW(ring) {
  const r = ensureClosed(ring)
  return ringSignedArea(r) <= 0 ? r : r.slice().reverse()
}

const WORLD_OUTER = ensureOuterCCW([
  [-180, -85], [180, -85], [180, 85], [-180, 85], [-180, -85],
])

function buildMaskGeoJSON(boundary) {
  const holes = []
  for (const f of boundary?.features || []) {
    const g = f?.geometry
    if (!g) continue
    const polys =
      g.type === 'Polygon' ? [g.coordinates]
      : g.type === 'MultiPolygon' ? g.coordinates
      : []
    for (const poly of polys) {
      if (poly?.[0] && poly[0].length >= 4) holes.push(ensureHoleCW(poly[0]))
    }
  }
  if (!holes.length) return { type: 'FeatureCollection', features: [] }
  return {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      properties: {},
      geometry: { type: 'Polygon', coordinates: [WORLD_OUTER, ...holes] },
    }],
  }
}

async function ensureMask() {
  const map = mapRef.value?.getMap?.()
  if (!map) return

  const boundary = await ensureProvince()
  if (!boundary) return

  const data = buildMaskGeoJSON(boundary)
  if (!data.features.length) return

  if (!map.getSource(MASK_SOURCE_ID)) {
    map.addSource(MASK_SOURCE_ID, { type: 'geojson', data })
  }
  if (!map.getLayer(MASK_LAYER_ID)) {
    map.addLayer({
      id: MASK_LAYER_ID,
      type: 'fill',
      source: MASK_SOURCE_ID,
      paint: {
        'fill-color': MASK_COLOR,
        'fill-opacity': 1,
      },
    })
  }
  map.moveLayer(MASK_LAYER_ID)
}

// ============================================================
// 陕西省市界
// ============================================================
const CITY_BOUNDARY_LAYER_ID = 'city-boundary'
const CITY_BOUNDARY_SOURCE_ID = 'city-boundary-src'

async function ensureCityBoundary() {
  const map = mapRef.value?.getMap?.()
  if (!map) return

  const cities = await ensureCities()
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
        'line-color': '#60a5fa',
        'line-width': 1.5,
        'line-opacity': 0.9,
      },
    })
  }
}

// ============================================================
// 主流程
// ============================================================
function raiseMask() {
  const map = mapRef.value?.getMap?.()
  if (map?.getLayer(MASK_LAYER_ID)) map.moveLayer(MASK_LAYER_ID)
}

async function onMapReady() {
  const map = mapRef.value?.getMap?.()
  if (!map) return

  // 1. 遮罩 + 市界（内部各自 await 边界数据）
  await Promise.all([ensureMask(), ensureCityBoundary()])

  // 2. 挂载电网图层
  try {
    whlnPlugin = attachSxLayers(map, {
      initialVisibleIds: ['collection-line'],
      powerInfraUrl: POWER_INFRA_URL,
    })
  } catch (err) {
    console.warn('[power-grid] 图层挂载失败:', err)
  }

  // 3. 保持遮罩在最上层
  map.on('styledata', raiseMask)
}

onMounted(() => {
  // 提前拉取，和 MapGL 初始化并行
  void ensureProvince()
  void ensureCities()
})

onBeforeUnmount(() => {
  whlnPlugin?.destroy?.()
  whlnPlugin = null

  const map = mapRef.value?.getMap?.()
  if (map) map.off('styledata', raiseMask)

  provincePromise = null
  citiesPromise = null
})
</script>

<style scoped>
.power-grid-page {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #f5f7fa;
}
</style>