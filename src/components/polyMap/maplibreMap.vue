<template>
  <div class="maplibre-map-template">
    <div ref="mapContainerRef" class="map-container"></div>
    <slot />
  </div>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import * as maplibregl from 'maplibre-gl'
import { setWorkerUrl } from 'maplibre-gl'
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'

import 'maplibre-gl/dist/maplibre-gl.css'
import pointIcon from '@/assets/img/mapIcon/pointIcon.png'
import { ElMessage } from 'element-plus'
import isInChina from '@/utils/checkPointInChinaMainland'

import { satelliteStyle, SX_OVERLAY_ANCHOR_ID } from './mapConfig'
import { attachSxLayers } from '@/components/site-map/attachSxLayers'
import { WHLN_LAYER_IDS } from '@/components/site-map/layerPanelConfig'

setWorkerUrl(maplibreWorkerUrl)

const props = defineProps({
  // 风资源按钮
  resourceMapKey: { type: Boolean, default: false },
  // 光资源按钮
  ghiMapKey: { type: Boolean, default: false },
  // 路网按钮
  roadKey: { type: Boolean, default: false },
  // 普通地形栅格预览按钮；不启用高程
  terrainMapKey: { type: Boolean, default: false },
})

const emits = defineEmits([
  'toPostLngLat',
  'updateCesiumMapScale',
  'getWeatherData',
])

const mapContainerRef = ref(null)

let map = null
let whlnPlugin = null
let currentMarker = null
let measurePoints = []
const isDrawing = ref(false)

let lastMoveTime = 0

const BASE_LAYER_ID = 'hd-imagery'

const WIND_SOURCE_ID = 'wind-res'
const WIND_LAYER_ID = 'layer-wind-res'

const SOLAR_SOURCE_ID = 'ghi-res'
const SOLAR_LAYER_ID = 'layer-ghi-res'

const TERRAIN_SOURCE_ID = 'dem'
const TERRAIN_LAYER_ID = 'layer-dem'

const WIND_TILES =
  'https://gis.wh-ge.com/sx-map-service/wind/gwc/service/wmts?layer=wind:sx-windspeed&style=&tilematrixset=EPSG:900913&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/png&TileMatrix=EPSG:900913:{z}&TileCol={x}&TileRow={y}'

const SOLAR_TILES =
  'https://gis.wh-ge.com/sx-map-service/ghi/gwc/service/wmts?layer=ghi:sx-ghi&style=&tilematrixset=EPSG:900913&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/png&TileMatrix=EPSG:900913:{z}&TileCol={x}&TileRow={y}'

// 普通 PNG 栅格预览，不是 raster-dem，不会改变地图高程。
const TERRAIN_TILES =
  'https://gis-rustfs.wh-ge.com/terrain/china-dem/{z}/{x}/{y}.png'

function createMapStyle() {
  return {
    version: 8,
    projection: { type: 'globe' },
    sources: { ...(satelliteStyle.sources || {}) },
    layers: [...(satelliteStyle.layers || [])],
  }
}

function onInitMap() {
  if (!mapContainerRef.value) return

  map = new maplibregl.Map({
    container: mapContainerRef.value,
    style: createMapStyle(),
    center: [104.195397, 35.86166],
    zoom: 1.5,
    pitch: 0,
    bearing: 0,
    attributionControl: false,
    maxZoom: 18,
    minZoom: 0,
    projection: 'globe',
  })

  map.doubleClickZoom.disable()

  map.on('style.load', () => {
    if (map?.setSky) {
      map.setSky({
        'sky-color': '#199EF3',
        'sky-horizon-blend': 0.5,
        'horizon-color': '#ffffff',
        'horizon-fog-blend': 0.5,
        'fog-color': '#000000',
        'fog-ground-blend': 0.5,
      })
    }
  })

  map.on('load', onMapLoad)

  bindMapEvents()

  map.on('move', calculateScale)
  map.on('moveend', calculateScale)
  map.addControl(
    new maplibregl.ScaleControl({ maxWidth: 100, unit: 'metric' }),
    'bottom-left',
  )
}


const TDT_ANNOTATION_PREFIX = 'eng-r-tdt-annotation-'
const TDT_IMAGERY_PREFIX = 'eng-r-hd-imagery-'
const HD_IMAGERY_PREFIX = 'eng-r-hd-imagery-'

function getRasterOverlayBeforeId() {
  const layers = map?.getStyle()?.layers || []

  // 有天地图注记时，把业务栅格放在注记下方，
  // 保持地名文字仍可见。
  const annotationLayer = layers.find((layer) =>
    layer.id.startsWith(TDT_ANNOTATION_PREFIX),
  )
  if (annotationLayer) return annotationLayer.id

  // 没有注记时，放在第一条矢量业务层之前，
  // 这样栅格在天地图影像上方、路网等矢量层下方。
  const firstVectorOverlay = layers.find((layer) => {
    if (!layer.id.startsWith('eng-r-')) return false

    return ![
      TDT_IMAGERY_PREFIX,
      HD_IMAGERY_PREFIX,
      TDT_ANNOTATION_PREFIX,
    ].some((prefix) => layer.id.startsWith(prefix))
  })

  if (firstVectorOverlay) return firstVectorOverlay.id
  if (map?.getLayer(SX_OVERLAY_ANCHOR_ID)) return SX_OVERLAY_ANCHOR_ID

  return undefined
}

function moveRasterOverlaysAboveTdt() {
  if (!map) return

  const beforeId = getRasterOverlayBeforeId()
  const rasterLayerIds = [
    WIND_LAYER_ID,
    SOLAR_LAYER_ID,
    TERRAIN_LAYER_ID,
  ]

  for (const layerId of rasterLayerIds) {
    if (!map.getLayer(layerId)) continue

    if (beforeId && beforeId !== layerId) {
      map.moveLayer(layerId, beforeId)
    } else {
      // 找不到锚点时移到最上层，至少确保不被底图盖住。
      map.moveLayer(layerId)
    }
  }
}

function onMapLoad() {
  if (!map) return

  try {
    // 天地图影像是固定底图，初始化时始终可见。
    whlnPlugin = attachSxLayers(map, {
      initialVisibleIds: [BASE_LAYER_ID],
    })
  } catch (err) {
    console.warn('[whln] 图层控制挂载失败:', err)
  }

  addBusinessLayers()
  syncLayersByProps()
}

function addRasterOverlay(sourceId, layerId, tiles, opacity = 0.65) {
  if (!map) return

  if (!map.getSource(sourceId)) {
    map.addSource(sourceId, {
      type: 'raster',
      tiles: [tiles],
      tileSize: 256,
    })
  }

  if (!map.getLayer(layerId)) {
    const layer = {
      id: layerId,
      type: 'raster',
      source: sourceId,
      layout: { visibility: 'none' },
      paint: {
        'raster-opacity': opacity,
        'raster-fade-duration': 0,
      },
    }

    // 在空底图中，插件锚点位于天地图底图上方；
    // 将栅格覆盖层放到锚点之前，叠在天地图影像之上。
    if (map.getLayer(SX_OVERLAY_ANCHOR_ID)) {
      map.addLayer(layer, SX_OVERLAY_ANCHOR_ID)
    } else {
      map.addLayer(layer)
    }
  }
}

function addBusinessLayers() {
  if (!map) return

  // PNG 栅格覆盖层：按钮初始为 false，因此这些图层初始隐藏。
  addRasterOverlay(WIND_SOURCE_ID, WIND_LAYER_ID, WIND_TILES, 0.55)
  addRasterOverlay(SOLAR_SOURCE_ID, SOLAR_LAYER_ID, SOLAR_TILES, 0.55)
  addRasterOverlay(TERRAIN_SOURCE_ID, TERRAIN_LAYER_ID, TERRAIN_TILES, 0.65)

  // 路网不在这里创建栅格源。
  // 它由 attachSxLayers 中 road-network 的矢量 WMTS 配置创建。
}

function setLayerVisibility(layerId, visible) {
  if (!map?.getLayer(layerId)) return

  map.setLayoutProperty(
    layerId,
    'visibility',
    visible ? 'visible' : 'none',
  )
}

function updateWhlnLayers(ids = []) {
  if (!map) return

  const selectedIds = new Set(ids)
  const pluginIds = ['hd-imagery']

  if (selectedIds.has('road-network')) {
    pluginIds.push('road-network')
  }

  const validPluginIds = pluginIds.filter((id) =>
    WHLN_LAYER_IDS.includes(id),
  )

  let result

  if (whlnPlugin) {
    result = whlnPlugin.setVisibleIds?.(validPluginIds)
  }

  setLayerVisibility(WIND_LAYER_ID, selectedIds.has('wind-resource'))
  setLayerVisibility(SOLAR_LAYER_ID, selectedIds.has('solar-resource'))
  setLayerVisibility(TERRAIN_LAYER_ID, selectedIds.has('terrain-3d'))

  const reorder = () => {
    requestAnimationFrame(moveRasterOverlaysAboveTdt)
  }

  // 插件可能异步调整图层顺序；等它完成后再把栅格放回正确位置。
  if (result && typeof result.then === 'function') {
    result.then(reorder, reorder)
  } else {
    reorder()
  }
}

function syncLayersByProps() {
  const ids = []

  if (props.resourceMapKey) ids.push('wind-resource')
  if (props.ghiMapKey) ids.push('solar-resource')
  if (props.roadKey) ids.push('road-network')
  if (props.terrainMapKey) ids.push('terrain-3d')

  updateWhlnLayers(ids)
}

watch(
  () => [
    props.resourceMapKey,
    props.ghiMapKey,
    props.roadKey,
    props.terrainMapKey,
  ],
  syncLayersByProps,
)

function bindMapEvents() {
  if (!map) return

  map.on('click', async (event) => {
    if (isDrawing.value) return

    const { lng, lat } = event.lngLat

    let isInsideChina = false
    try {
      isInsideChina = await isInChina(lng, lat)
    } catch (error) {
      console.error('[map] 中国边界数据加载失败:', error)
      ElMessage.error('区域边界数据加载失败，请稍后重试！')
      return
    }

    if (!isInsideChina) {
      ElMessage.error('暂不支持该区域数据查询！')
      return
    }

    addSurfacePoint(lng, lat)
    emits('toPostLngLat', { lng, lat })
  })

  map.on('mousemove', (event) => {
    if (isDrawing.value) return

    const now = Date.now()
    if (now - lastMoveTime < 100) return
    lastMoveTime = now

    emits('toPostLngLat', {
      lng: event.lngLat.lng,
      lat: event.lngLat.lat,
      isMove: true,
    })
  })
}

function addSurfacePoint(lng, lat) {
  if (!map) return

  currentMarker?.remove()

  const element = document.createElement('div')
  element.className = 'custom-marker'
  element.style.backgroundImage = `url(${pointIcon})`
  element.style.width = '24px'
  element.style.height = '24px'
  element.style.backgroundSize = 'contain'
  element.style.backgroundRepeat = 'no-repeat'
  element.style.cursor = 'pointer'

  currentMarker = new maplibregl.Marker({
    element,
    anchor: 'bottom',
  })
    .setLngLat([lng, lat])
    .addTo(map)

  map.flyTo({
    center: [lng, lat],
    zoom: 12,
    essential: true,
    duration: 1500,
  })
}

function calculateScale() {
  if (!map) return

  const y = map.getContainer().clientHeight / 2
  const left = map.unproject([0, y])
  const right = map.unproject([100, y])
  const scale = left.distanceTo(right) / 100

  if (scale < 1) {
    emits('updateCesiumMapScale', `${(scale * 100).toFixed(2)}m`)
  } else if (scale < 1000) {
    emits('updateCesiumMapScale', `${scale.toFixed(2)}m`)
  } else {
    emits('updateCesiumMapScale', `${(scale / 1000).toFixed(2)}km`)
  }
}

function flyToCenter(point) {
  if (!map || !point) return

  const { x, y, z } = point
  let zoomLevel = 12

  if (z) {
    if (z > 100000) zoomLevel = 5
    else if (z > 50000) zoomLevel = 7
    else if (z > 20000) zoomLevel = 9
    else if (z > 10000) zoomLevel = 10
    else zoomLevel = 13
  }

  const lng = Number(x)
  const lat = Number(y)

  map.flyTo({
    center: [lng, lat],
    zoom: zoomLevel,
    essential: true,
    duration: 1500,
  })

  addSurfacePoint(lng, lat)
}

function normalizePolygonCoordinates(polygonData) {
  if (!Array.isArray(polygonData) || polygonData.length === 0) return []

  // 支持 [lng, lat, lng, lat, ...]
  if (typeof polygonData[0] === 'number') {
    const ring = []
    for (let i = 0; i + 1 < polygonData.length; i += 2) {
      ring.push([Number(polygonData[i]), Number(polygonData[i + 1])])
    }
    return ring.length ? [ring] : []
  }

  const isPosition = (value) =>
    Array.isArray(value) &&
    value.length >= 2 &&
    typeof value[0] === 'number' &&
    typeof value[1] === 'number'

  // 支持 [[lng, lat], ...]，即一个闭合环。
  if (isPosition(polygonData[0])) {
    return [polygonData]
  }

  // 支持 [[[lng, lat], ...], ...]，即一个或多个环。
  if (Array.isArray(polygonData[0]) && isPosition(polygonData[0][0])) {
    return polygonData
  }

  // 支持更深一层的 Polygon 坐标：[[[[lng, lat], ...]]]
  if (
    Array.isArray(polygonData[0]) &&
    Array.isArray(polygonData[0][0]) &&
    isPosition(polygonData[0][0][0])
  ) {
    return polygonData[0]
  }

  return []
}

function addPolygonData(polygonData) {
  if (!map) return

  const coordinates = normalizePolygonCoordinates(polygonData)
  if (!coordinates.length) return

  const closedCoordinates = coordinates.map((ring) => {
    if (!ring.length) return ring

    const first = ring[0]
    const last = ring[ring.length - 1]
    const isClosed = first[0] === last[0] && first[1] === last[1]

    return isClosed ? ring : [...ring, first]
  })

  const geojson = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: closedCoordinates,
        },
        properties: {},
      },
    ],
  }

  if (!map.getSource('draw-polygon')) {
    map.addSource('draw-polygon', {
      type: 'geojson',
      data: geojson,
    })

    map.addLayer({
      id: 'draw-polygon-layer',
      type: 'fill',
      source: 'draw-polygon',
      paint: {
        'fill-color': '#F5DEB3',
        'fill-opacity': 0.4,
      },
    })

    map.addLayer({
      id: 'draw-polygon-outline',
      type: 'line',
      source: 'draw-polygon',
      paint: {
        'line-color': '#F5DEB3',
        'line-width': 2,
      },
    })
  } else {
    map.getSource('draw-polygon').setData(geojson)
  }
}

function changeMapMode() {
  // 保留原组件 API；当前没有额外地图模式需要切换。
}

function drawLineMeasureGraphics(type) {
  if (!map || isDrawing.value) return

  isDrawing.value = true
  measurePoints = []
  map.getContainer().style.cursor = 'crosshair'

  if (!map.getSource('draw-line')) {
    map.addSource('draw-line', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
    })

    map.addLayer({
      id: 'draw-line-layer',
      type: 'line',
      source: 'draw-line',
      paint: {
        'line-color': '#F5DEB3',
        'line-width': 3,
      },
    })
  }

  const onDrawClick = (event) => {
    const coords = [event.lngLat.lng, event.lngLat.lat]
    measurePoints.push(coords)

    const element = document.createElement('div')
    element.style.width = '6px'
    element.style.height = '6px'
    element.style.backgroundColor = '#F5DEB3'
    element.style.borderRadius = '50%'

    new maplibregl.Marker({ element })
      .setLngLat(coords)
      .addTo(map)

    if (type === 'Polyline' && measurePoints.length > 1) {
      map.getSource('draw-line').setData({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: measurePoints,
        },
      })
    }
  }

  const onRightClick = (event) => {
    event.preventDefault()
    isDrawing.value = false
    map.getContainer().style.cursor = ''
    map.off('click', onDrawClick)
    map.off('contextmenu', onRightClick)
    measurePoints = []
  }

  map.on('click', onDrawClick)
  map.on('contextmenu', onRightClick)
}

defineExpose({
  flyToCenter,
  addPolygonData,
  changeMapMode,
  drawLineMeasureGraphics,
  updateWhlnLayers,
})

onMounted(async () => {
  await nextTick()
  onInitMap()
})

onUnmounted(() => {
  if (whlnPlugin) {
    whlnPlugin.destroy?.()
    whlnPlugin = null
  }

  if (currentMarker) {
    currentMarker.remove()
    currentMarker = null
  }

  if (map) {
    map.remove()
    map = null
  }
})
</script>

<style lang="scss" scoped>
.maplibre-map-template {
  position: relative;
  width: 100%;
  height: 100%;
  background: #0b1e3a;

  .map-container {
    width: 100%;
    height: 100%;
  }
}

:deep(.custom-marker) {
  background-position: center;
}
</style>