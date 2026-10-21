<!-- MapGL.vue -->
<template>
  <div ref="mapContainer" class="map-container" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'

import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'

if (typeof maplibregl.setWorkerUrl === 'function') {
  maplibregl.setWorkerUrl(workerUrl)
}
if (typeof window !== 'undefined' && !window.mapboxgl) {
  window.mapboxgl = maplibregl
}

const emit = defineEmits([
  'ready',
  'draw-update',
  'draw-create',
  'draw-delete',
  'box-select',
  'point-drag'
])

const props = defineProps({
  style: {
    type: [String, Object],
    default: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  },
  center: { type: Array, default: () => [0, 20] },
  zoom: { type: Number, default: 1.5 },
})

const mapContainer = ref(null)
let map = null
let draw = null
const hoverHandlers = new Map()
const addedLayers = new Set()
const lastHighlightBySource = new Map()
const clickHandlers = new Map()
const imageCache = new Map()

// ★ 交互状态
let draggingFeatureId = null
let isBoxSelecting = false
let boxStartPoint = null
const boxOverlayId = 'box-select-overlay'

// ★ 标签随 3D 顶面抬升
let labelLiftCfg = null // { layerIds, height, followLayer }
let labelLiftBound = false

// ★ 用于区分点击和拖拽
let mousedownPoint = null
let mousedownFeatureId = null


const drawStyles = [
  {
    id: 'gl-draw-polygon-fill-inactive', type: 'fill',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
    paint: { 'fill-color': '#2A9FFF', 'fill-outline-color': '#2A9FFF', 'fill-opacity': 0 },
  },
  {
    id: 'gl-draw-polygon-fill-active', type: 'fill',
    filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
    paint: { 'fill-color': '#2A9FFF', 'fill-outline-color': '#2A9FFF', 'fill-opacity': 0 },
  },
  {
    id: 'gl-draw-polygon-stroke-inactive', type: 'line',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': '#2A9FFF', 'line-width': 2 },
  },
  {
    id: 'gl-draw-polygon-stroke-active', type: 'line',
    filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': '#FFD700', 'line-dasharray': [0.2, 2], 'line-width': 2 },
  },
  {
    id: 'gl-draw-polygon-and-line-vertex-halo-active', type: 'circle',
    filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
    paint: { 'circle-radius': 8, 'circle-color': '#FFFFFF' },
  },
  {
    id: 'gl-draw-polygon-and-line-vertex-active', type: 'circle',
    filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
    paint: { 'circle-radius': 5, 'circle-color': '#2A9FFF' },
  },
  {
    id: 'gl-draw-polygon-midpoint', type: 'circle',
    filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'midpoint']],
    paint: { 'circle-radius': 3, 'circle-color': '#FFD700' },
  },
  {
    id: 'gl-draw-point-inactive', type: 'circle',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Point'], ['==', 'meta', 'feature']],
    paint: { 'circle-radius': 7, 'circle-color': '#22c55e', 'circle-stroke-color': '#fff', 'circle-stroke-width': 2 },
  },
  {
    id: 'gl-draw-point-active', type: 'circle',
    filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Point'], ['!=', 'meta', 'midpoint']],
    paint: { 'circle-radius': 9, 'circle-color': '#FFD700', 'circle-stroke-color': '#fff', 'circle-stroke-width': 2 },
  },
]

onMounted(() => {
  // 已去掉 projection: 'globe'，省级 3D 地图用墨卡托投影
  map = new maplibregl.Map({
    container: mapContainer.value,
    style: props.style,
    center: props.center,
    zoom: props.zoom,
  })

  map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right')

  draw = new MapboxDraw({
    displayControlsDefault: false,
    userProperties: true,
    styles: drawStyles,
  })
  map.addControl(draw, 'top-left')

  map.on('draw.update', (e) => {
    handleDrawUpdate(e)
    emit('draw-update', e.features)
  })
  map.on('draw.create', (e) => emit('draw-create', e.features))
  map.on('draw.delete', (e) => emit('draw-delete', e.features))

  bindPointInteraction()
  bindBoxSelect()

  map.on('load', () => {
    // 柔和的顶光，让挤出体侧面有明暗
    try {
      map.setLight({ anchor: 'viewport', color: '#ffffff', intensity: 0.4, position: [1.15, 200, 45] })
    } catch (e) { /* 低版本不支持则忽略 */ }
    flyToShaanxi()
    emit('ready')
  })
})

onUnmounted(() => {
  for (const [layerId, handler] of hoverHandlers) {
    map?.off('mousemove', handler.targetLayer, handler.onMove)
    map?.off('mouseleave', handler.targetLayer, handler.onLeave)
    hoverHandlers.delete(layerId)
  }
  for (const [layerId, list] of clickHandlers) {
    for (const h of list) map?.off('click', layerId, h)
  }
  clickHandlers.clear()
  imageCache.clear()

  map?.off('move', syncLabelLift)
  map?.off('draw.update', handleDrawUpdate)
  map?.remove()
  map = null
  draw = null
})

// ======================== 交互相关 ========================
function bringDrawPointsToTop() {
  if (!map) return
  const layersToTop = ['gl-draw-point-inactive', 'gl-draw-point-active']
  layersToTop.forEach(layerId => {
    if (map.getLayer(layerId)) map.moveLayer(layerId)
  })
}

function bindPointInteraction() {
  if (!map) return
  const pointLayers = ['gl-draw-point-inactive', 'gl-draw-point-active']
  const safeQueryFeatures = (point) => {
    const existingLayers = pointLayers.filter(l => map.getLayer(l))
    if (!existingLayers.length) return []
    return map.queryRenderedFeatures(point, { layers: existingLayers })
  }

  map.on('mousemove', (e) => {
    if (isBoxSelecting || draggingFeatureId) return
    const features = safeQueryFeatures(e.point)
    if (features.length) map.getCanvas().style.cursor = 'pointer'
    else map.getCanvas().style.cursor = ''
  })

  map.on('mousedown', (e) => {
    if (isBoxSelecting) return
    if (e.originalEvent.button !== 0) return
    const features = safeQueryFeatures(e.point)
    if (!features.length) {
      mousedownPoint = e.point
      mousedownFeatureId = null
      return
    }
    mousedownPoint = e.point
    mousedownFeatureId = features[0].id || features[0].properties?.id
    e.preventDefault()
  })
}

function bindBoxSelect() {
  if (!map) return
  map.on('mousedown', (e) => {
    if (!isBoxSelecting) return
    if (e.originalEvent.button !== 0) return
    const pointFeatures = map.queryRenderedFeatures(e.point, { layers: ['gl-draw-point-inactive', 'gl-draw-point-active'] })
    if (pointFeatures.length) return
    boxStartPoint = e.point
    map.dragPan.disable()

    if (!map.getSource(boxOverlayId)) {
      map.addSource(boxOverlayId, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
      map.addLayer({ id: boxOverlayId, type: 'fill', source: boxOverlayId, paint: { 'fill-color': '#2A9FFF', 'fill-opacity': 0.15 } })
      map.addLayer({ id: `${boxOverlayId}-line`, type: 'line', source: boxOverlayId, paint: { 'line-color': '#2A9FFF', 'line-width': 1.5, 'line-dasharray': [2, 2] } })
    }
  })

  map.on('mousemove', (e) => {
    if (!isBoxSelecting || !boxStartPoint) return
    const currentPoint = e.point
    const minX = Math.min(boxStartPoint.x, currentPoint.x)
    const minY = Math.min(boxStartPoint.y, currentPoint.y)
    const maxX = Math.max(boxStartPoint.x, currentPoint.x)
    const maxY = Math.max(boxStartPoint.y, currentPoint.y)
    const p1 = map.unproject([minX, minY])
    const p2 = map.unproject([maxX, maxY])
    const coords = [[p1.lng, p1.lat], [p2.lng, p1.lat], [p2.lng, p2.lat], [p1.lng, p2.lat], [p1.lng, p1.lat]]
    const geojson = { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'Polygon', coordinates: [coords] }, properties: {} }] }
    if (map.getSource(boxOverlayId)) map.getSource(boxOverlayId).setData(geojson)
  })

  map.on('mouseup', (e) => {
    if (!isBoxSelecting || !boxStartPoint) return
    const currentPoint = e.point
    const minX = Math.min(boxStartPoint.x, currentPoint.x)
    const minY = Math.min(boxStartPoint.y, currentPoint.y)
    const maxX = Math.max(boxStartPoint.x, currentPoint.x)
    const maxY = Math.max(boxStartPoint.y, currentPoint.y)
    if (maxX - minX > 5 || maxY - minY > 5) {
      const selected = map.queryRenderedFeatures([[minX, minY], [maxX, maxY]], { layers: ['gl-draw-point-inactive', 'gl-draw-point-active'] })
      const ids = selected.map(f => f.id || f.properties?.id).filter(id => id != null)
      emit('box-select', ids)
    }
    boxStartPoint = null
    map.dragPan.enable()
    if (map.getSource(boxOverlayId)) map.getSource(boxOverlayId).setData({ type: 'FeatureCollection', features: [] })
  })
}

function startBoxSelect() {
  isBoxSelecting = true
  map.getCanvas().style.cursor = 'crosshair'
  if (draw) draw.changeMode('simple_select')
}

function stopBoxSelect() {
  isBoxSelecting = false
  boxStartPoint = null
  map.dragPan.enable()
  map.getCanvas().style.cursor = ''
  if (map && map.getSource(boxOverlayId)) map.getSource(boxOverlayId).setData({ type: 'FeatureCollection', features: [] })
}

// ======================== 内置方法 ========================
function flyToShaanxi() {
  map?.flyTo({ center: [108.9, 35.2], zoom: 6.5, pitch: 50, bearing: 0, duration: 3000, essential: true })
}

function handleDrawUpdate(event) {}

function loadEditableAreas(featureCollection) { if (draw && featureCollection?.features?.length) draw.add(featureCollection) }
function clearEditableAreas() { draw?.deleteAll() }
function getEditableAreas() { return draw?.getAll() || null }
function cloneGeojson(geojson) { return JSON.parse(JSON.stringify(geojson)) }

function ensureFeatureIds(geojson) {
  geojson.features.forEach((feature, index) => {
    feature.properties = feature.properties || {}
    if (feature.id === undefined || feature.id === null) feature.id = feature.properties.id ?? index
    if (feature.properties.id === undefined || feature.properties.id === null) feature.properties.id = feature.id
  })
}

function addPolygon({ id, geojson, color = '#4fc3ff', opacity = 0.7, outlineColor = '#4fc3ff', outlineWidth = 1.5 }) {
  if (!map) return
  if (map.getSource(id)) {
    map.getSource(id).setData(geojson)
    if (map.getLayer(`${id}-fill`)) {
      map.setPaintProperty(`${id}-fill`, 'fill-color', color)
      map.setPaintProperty(`${id}-fill`, 'fill-opacity', opacity)
    }
    if (map.getLayer(`${id}-outline`)) {
      map.setPaintProperty(`${id}-outline`, 'line-color', outlineColor)
      map.setPaintProperty(`${id}-outline`, 'line-width', outlineWidth)
    }
    return
  }
  map.addSource(id, { type: 'geojson', data: geojson })
  map.addLayer({ id: `${id}-fill`, type: 'fill', source: id, paint: { 'fill-color': color, 'fill-opacity': opacity } })
  map.addLayer({ id: `${id}-outline`, type: 'line', source: id, paint: { 'line-color': outlineColor, 'line-width': outlineWidth } })
  addedLayers.add(`${id}-fill`)
  addedLayers.add(`${id}-outline`)
}

function addFillLayer({ id, geojson, fillColor = '#4fc3ff', fillOpacity = 0.5, outlineColor = '#4fc3ff', outlineWidth = 1 }) {
  if (!map) return
  if (map.getSource(id)) {
    map.getSource(id).setData(geojson)
    if (map.getLayer(`${id}-fill`)) {
      map.setPaintProperty(`${id}-fill`, 'fill-color', fillColor)
      map.setPaintProperty(`${id}-fill`, 'fill-opacity', fillOpacity)
    }
    if (map.getLayer(`${id}-outline`)) {
      map.setPaintProperty(`${id}-outline`, 'line-color', outlineColor)
      map.setPaintProperty(`${id}-outline`, 'line-width', outlineWidth)
    }
    return
  }
  map.addSource(id, { type: 'geojson', data: geojson })
  map.addLayer({ id: `${id}-fill`, type: 'fill', source: id, paint: { 'fill-color': fillColor, 'fill-opacity': fillOpacity } })
  map.addLayer({ id: `${id}-outline`, type: 'line', source: id, layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': outlineColor, 'line-width': outlineWidth } })
  addedLayers.add(`${id}-fill`)
  addedLayers.add(`${id}-outline`)
}

function addMaskLayer({ id, geojson, color = '#000000', opacity = 0, fadeDuration = 300 }) {
  if (!map) return false
  if (map.getSource(id)) {
    map.getSource(id).setData(geojson)
    if (map.getLayer(id)) map.setPaintProperty(id, 'fill-color', color)
    return true
  }
  map.addSource(id, { type: 'geojson', data: geojson })
  map.addLayer({
    id, type: 'fill', source: id,
    paint: { 'fill-color': color, 'fill-opacity': opacity, 'fill-opacity-transition': { duration: fadeDuration, delay: 0 } },
  })
  addedLayers.add(id)
  return true
}

function setMaskOpacity(id, opacity) {
  if (!map || !map.getLayer(id)) return
  map.setPaintProperty(id, 'fill-opacity', opacity)
}

function bringMaskToTop(id) {
  if (!map || !map.getLayer(id)) return
  const layers = map.getStyle()?.layers || []
  if (!layers.length) return
  const top = layers[layers.length - 1]
  if (top.id !== id) map.moveLayer(id)
}

function hasMaskLayer(id) { return !!(map && map.getLayer(id)) }
function removeMaskLayer(id) {
  if (!map) return
  if (map.getLayer(id)) map.removeLayer(id)
  if (map.getSource(id)) map.removeSource(id)
  addedLayers.delete(id)
}

function addSymbolLayer({ id, geojson, layout = {}, paint = {} }) {
  if (!map) return
  if (!map.getSource(id)) map.addSource(id, { type: 'geojson', data: geojson })
  else map.getSource(id).setData(geojson)
  if (map.getLayer(id)) return
  map.addLayer({ id, type: 'symbol', source: id, layout, paint })
  addedLayers.add(id)
}

function createColorExpression(opts) {
  const { heightField, heightMultiplier, defaultHeight, colorField, colorStops, colorMap, defaultColor, highlightColor } = opts
  let colorExpression = defaultColor
  if (colorField && Array.isArray(colorStops) && colorStops.length) {
    colorExpression = ['coalesce', ['interpolate', ['linear'], ['get', colorField], ...colorStops.flat()], defaultColor]
  } else if (colorMap && Object.keys(colorMap).length) {
    const cases = []
    for (const [name, color] of Object.entries(colorMap)) cases.push(name, color)
    cases.push(defaultColor)
    colorExpression = ['match', ['get', 'name'], ...cases]
  } else if (colorField) {
    colorExpression = ['coalesce', ['get', colorField], defaultColor]
  }
  const heightExpression = heightField ? ['*', ['coalesce', ['get', heightField], 0], heightMultiplier] : defaultHeight
  return {
    color: ['case', ['boolean', ['feature-state', 'hover'], false], highlightColor, colorExpression],
    height: heightExpression,
  }
}

// 标签只能贴在地面，按「顶面高度 × 当前俯仰角」实时算出需要抬升的像素
function syncLabelLift() {
  if (!map || !labelLiftCfg) return
  const { layerIds, height, followLayer } = labelLiftCfg
  const active = height > 0 && (!followLayer || map.getLayer(followLayer))
  let px = 0
  if (active) {
    const mpp = 78271.517 * Math.cos((35.2 * Math.PI) / 180) / Math.pow(2, map.getZoom())
    px = (height / mpp) * Math.sin((map.getPitch() * Math.PI) / 180)
  }
  layerIds.forEach((lid) => { if (map.getLayer(lid)) map.setPaintProperty(lid, 'text-translate', [0, -px]) })
}

// 把每个市的边界生成"细条"多边形（宽度单位：米），用 fill-extrusion 立在顶面高度上
function buildBorderGeoJSON(geojson, widthM) {
  const h = widthM / 2 / 111320 // 半宽，单位：纬度(度)
  const features = []
  const pushRing = (ring, pid) => {
    for (let i = 0; i < ring.length - 1; i++) {
      const a = ring[i], b = ring[i + 1]
      const cos = Math.cos(((a[1] + b[1]) / 2) * Math.PI / 180) || 1
      const ax = a[0] * cos, ay = a[1], bx = b[0] * cos, by = b[1]
      const dx = bx - ax, dy = by - ay
      const len = Math.hypot(dx, dy)
      if (!len) continue
      const ux = dx / len, uy = dy / len
      const nx = -uy, ny = ux
      // 两端各延长半宽，避免拐角处出现缺口
      const sx = ax - ux * h, sy = ay - uy * h
      const ex = bx + ux * h, ey = by + uy * h
      const pts = [
        [sx + nx * h, sy + ny * h], [ex + nx * h, ey + ny * h],
        [ex - nx * h, ey - ny * h], [sx - nx * h, sy - ny * h],
      ].map(([x, y]) => [x / cos, y])
      pts.push(pts[0])
      features.push({ type: 'Feature', properties: { pid }, geometry: { type: 'Polygon', coordinates: [pts] } })
    }
  }
  for (const f of geojson.features) {
    const pid = f.id ?? f.properties?.id
    const g = f.geometry
    if (!g) continue
    const polys = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : []
    for (const poly of polys) for (const ring of poly) pushRing(ring, pid)
  }
  return { type: 'FeatureCollection', features }
}

function addExtrusion(opts) {
  const {
    id, geojson, heightField = null, heightMultiplier = 1, defaultHeight = 180000,
    colorField = null, colorStops = null, colorMap = null, defaultColor = '#2A9FFF',
    highlightColor = '#FFD700', opacity = 0.9, enableHover = true, useEventLayer = true,
    lineColor = 'transparent', hoverLineColor = '#FFFFFF',
    borderWidth = 1000,    // 边界细条宽度(米)
    borderHeight = 120,    // 边界细条凸出顶面的高度(米)
    sideColors = null,     // 侧面渐变色，自下而上
    topThickness = 300     // 顶面薄片厚度(米)，只有它会变悬停色
  } = opts

  if (!map || !geojson?.features) return
  const mapData = cloneGeojson(geojson)
  ensureFeatureIds(mapData)

  const expressions = createColorExpression({ heightField, heightMultiplier, defaultHeight, colorField, colorStops, colorMap, defaultColor, highlightColor })

  if (!map.getSource(id)) map.addSource(id, { type: 'geojson', data: mapData })
  else map.getSource(id).setData(mapData)

  // ---- 侧面渐变：多层等高带，先于顶面添加 ----
  const useSides = Array.isArray(sideColors) && sideColors.length > 0 && !heightField
  const topBase = useSides ? defaultHeight - topThickness : 0
  if (useSides) {
    const bandH = topBase / sideColors.length
    sideColors.forEach((c, i) => {
      const sideId = `${id}-side-${i}`
      const paint = {
        'fill-extrusion-color': c,
        'fill-extrusion-base': i * bandH,
        'fill-extrusion-height': (i + 1) * bandH,
        'fill-extrusion-opacity': 1,
        'fill-extrusion-vertical-gradient': false,
      }
      if (!map.getLayer(sideId)) {
        map.addLayer({ id: sideId, type: 'fill-extrusion', source: id, paint })
        addedLayers.add(sideId)
      } else {
        Object.entries(paint).forEach(([k, v]) => map.setPaintProperty(sideId, k, v))
      }
    })
  }

  // ---- 顶面 ----
  const topPaint = {
    'fill-extrusion-color': expressions.color,
    'fill-extrusion-height': expressions.height,
    'fill-extrusion-base': topBase,
    'fill-extrusion-opacity': opacity,
  }
  if (!map.getLayer(id)) {
    map.addLayer({ id, type: 'fill-extrusion', source: id, paint: topPaint })
    addedLayers.add(id)
  } else {
    Object.entries(topPaint).forEach(([k, v]) => map.setPaintProperty(id, k, v))
  }

  // ---- 边界：真 3D 细条，与顶面同高，视角变化不会错位 ----
  const borderId = `${id}-border`
  const borderTop = defaultHeight
  const borderPaint = {
    'fill-extrusion-color': ['case', ['boolean', ['feature-state', 'hover'], false], hoverLineColor, lineColor],
    'fill-extrusion-base': borderTop,
    // 悬停的边界略高一点，盖过相邻城市共用的那条边，避免闪烁
    'fill-extrusion-height': ['case', ['boolean', ['feature-state', 'hover'], false], borderTop + borderHeight + 40, borderTop + borderHeight],
    'fill-extrusion-opacity': 1,
    'fill-extrusion-vertical-gradient': false,
  }
  const borderData = buildBorderGeoJSON(mapData, borderWidth)
  if (!map.getSource(borderId)) map.addSource(borderId, { type: 'geojson', data: borderData, promoteId: 'pid' })
  else map.getSource(borderId).setData(borderData)
  if (!map.getLayer(borderId)) {
    map.addLayer({ id: borderId, type: 'fill-extrusion', source: borderId, paint: borderPaint })
    addedLayers.add(borderId)
  } else {
    Object.entries(borderPaint).forEach(([k, v]) => map.setPaintProperty(borderId, k, v))
  }

  syncLabelLift() // 省级 3D 图层出现/更新后，同步标签抬升

  // ---- 事件层 ----
  const eventLayerId = `${id}-event`
  if (useEventLayer) {
    if (map.getLayer(eventLayerId)) map.removeLayer(eventLayerId)
    map.addLayer({ id: eventLayerId, type: 'fill', source: id, paint: { 'fill-color': '#ffffff', 'fill-opacity': 0 } })
    addedLayers.add(eventLayerId)
  }

  // ---- hover ----
  if (enableHover) {
    const targetLayer = useEventLayer ? eventLayerId : id
    unbindHover(id)

    let hoveredId = null
    const borderSrc = `${id}-border`
    const setHover = (fid, val) => {
      map.setFeatureState({ source: id, id: fid }, { hover: val })
      if (map.getSource(borderSrc)) map.setFeatureState({ source: borderSrc, id: fid }, { hover: val })
    }
    const onMove = (event) => {
      const features = map.queryRenderedFeatures(event.point, { layers: [targetLayer] })
      if (features.length) {
        map.getCanvas().style.cursor = 'pointer'
        const feature = features[0]
        const featureId = feature.id ?? feature.properties?.id

        if (hoveredId !== featureId) {
          if (hoveredId !== null) setHover(hoveredId, false)
          setHover(featureId, true)
          hoveredId = featureId
        }
      } else {
        map.getCanvas().style.cursor = ''
        if (hoveredId !== null) {
          setHover(hoveredId, false)
          hoveredId = null
        }
      }
    }

    const onLeave = () => {
      map.getCanvas().style.cursor = ''
      if (hoveredId !== null) {
        setHover(hoveredId, false)
        hoveredId = null
      }
    }

    map.on('mousemove', targetLayer, onMove)
    map.on('mouseleave', targetLayer, onLeave)
    hoverHandlers.set(id, { onMove, onLeave, targetLayer })
  }
}

function unbindHover(id) {
  if (!hoverHandlers.has(id)) return
  const old = hoverHandlers.get(id)
  map?.off('mousemove', old.targetLayer, old.onMove)
  map?.off('mouseleave', old.targetLayer, old.onLeave)
  hoverHandlers.delete(id)
}

function clearHighlight(sourceId) {
  const previousId = lastHighlightBySource.get(sourceId)
  if (previousId === undefined) return
  map?.setFeatureState({ source: sourceId, id: previousId }, { highlight: false })
  lastHighlightBySource.delete(sourceId)
}

function centroidOfFeature(feature) {
  const geom = feature?.geometry
  if (!geom) return null
  const rings = []
  if (geom.type === 'Polygon') { if (geom.coordinates?.[0]) rings.push(geom.coordinates[0]) }
  else if (geom.type === 'MultiPolygon') { for (const poly of geom.coordinates || []) { if (poly?.[0]) rings.push(poly[0]) } }
  else { return null }
  if (!rings.length) return null
  let sx = 0, sy = 0, n = 0
  for (const ring of rings) {
    for (const pt of ring) {
      const lng = Number(pt?.[0]), lat = Number(pt?.[1])
      if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue
      sx += lng; sy += lat; n += 1
    }
  }
  return n ? [sx / n, sy / n] : null
}

function addCentroidLabels(opts) {
  const { id, geojson, labelConfig = null, labelField = 'name', subLabelField = null, textColor = '#FFFFFF', textSize = 14, subTextSize = 10, textOffset = [0, 0], haloColor = '#000000', haloWidth = 1,
    height = 0, followLayer = null } = opts // height: 需要抬升到的顶面高度(米)；followLayer: 该图层存在时才抬升
  if (!map || !geojson?.features) return
  const points = {
    type: 'FeatureCollection',
    features: geojson.features.map((f) => {
      const coordinates = centroidOfFeature(f)
      return coordinates ? { type: 'Feature', geometry: { type: 'Point', coordinates }, properties: { ...(f.properties || {}) } } : null
    }).filter(Boolean),
  }
  const sourceId = `${id}-points`
  if (!map.getSource(sourceId)) map.addSource(sourceId, { type: 'geojson', data: points })
  else map.getSource(sourceId).setData(points)

  const oldLayers = Array.from(addedLayers).filter((layerId) => layerId.startsWith(`${id}-`))
  oldLayers.forEach((layerId) => { if (map.getLayer(layerId)) map.removeLayer(layerId); addedLayers.delete(layerId) })

  const configs = labelConfig || [
    { field: labelField, size: textSize, color: textColor, offset: textOffset, haloColor, haloWidth },
    ...(subLabelField ? [{ field: subLabelField, size: subTextSize, color: '#A9DFFF', offset: [textOffset[0], textOffset[1] + 1.1], haloColor, haloWidth }] : []),
  ]

  configs.forEach((config, index) => {
    const layerId = `${id}-line-${index}`
    map.addLayer({
      id: layerId, type: 'symbol', source: sourceId,
      layout: { 'text-field': getTextExpression(config), 'text-size': config.size ?? textSize, 'text-offset': config.offset ?? [0, 0], 'text-allow-overlap': false, 'text-ignore-placement': false, 'text-anchor': 'center' },
      paint: { 'text-color': config.color ?? textColor, 'text-halo-color': config.haloColor ?? haloColor, 'text-halo-width': config.haloWidth ?? haloWidth, 'text-translate': [0, 0], 'text-translate-anchor': 'viewport' },
    })
    addedLayers.add(layerId)
  })

  labelLiftCfg = { layerIds: configs.map((_, i) => `${id}-line-${i}`), height, followLayer }
  if (!labelLiftBound) { map.on('move', syncLabelLift); labelLiftBound = true }
  syncLabelLift()
}

function getTextExpression(config) {
  if (config.text !== undefined && config.text !== null) return config.text
  if (!config.field) return ''
  let exp = ['coalesce', ['get', config.field], '']
  if (config.prefix) exp = ['concat', config.prefix, exp]
  if (config.suffix) exp = ['concat', exp, config.suffix]
  return exp
}

function addLine({ id, geojson, color = '#ffcc00', width = 2, dashArray = null }) {
  if (!map) return
  if (map.getSource(id)) { map.getSource(id).setData(geojson); return }
  map.addSource(id, { type: 'geojson', data: geojson })
  map.addLayer({ id, type: 'line', source: id, paint: { 'line-color': color, 'line-width': width, ...(dashArray ? { 'line-dasharray': dashArray } : {}) } })
  addedLayers.add(id)
}

function addPoints({ id, geojson, color = '#ff5500', radius = 6 }) {
  if (!map) return
  if (map.getSource(id)) { map.getSource(id).setData(geojson); return }
  map.addSource(id, { type: 'geojson', data: geojson })
  map.addLayer({ id, type: 'circle', source: id, paint: { 'circle-color': color, 'circle-radius': radius, 'circle-stroke-width': 1.5, 'circle-stroke-color': '#fff' } })
  addedLayers.add(id)
}

function addLabels({ id, geojson, textField = 'name', textColor = '#fff', textSize = 12 }) {
  if (!map) return
  if (!map.getSource(id)) map.addSource(id, { type: 'geojson', data: geojson })
  else { map.getSource(id).setData(geojson); return }
  map.addLayer({ id, type: 'symbol', source: id, layout: { 'text-field': ['coalesce', ['get', textField], ''], 'text-size': textSize, 'text-allow-overlap': false }, paint: { 'text-color': textColor, 'text-halo-color': '#000', 'text-halo-width': 1 } })
  addedLayers.add(id)
}

async function ensureImage(iconId, iconUrl, timeout = 8000) {
  if (!map || !iconId || !iconUrl) throw new Error(`ensureImage 参数不合法`)
  if (map.hasImage(iconId)) return iconId
  if (imageCache.has(iconId)) return imageCache.get(iconId)

  const promise = (async () => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)
    try {
      const resp = await fetch(iconUrl, { signal: controller.signal })
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
      const bitmap = await createImageBitmap(await resp.blob())
      if (map && !map.hasImage(iconId)) map.addImage(iconId, bitmap)
      return iconId
    } finally { clearTimeout(timer) }
  })().catch((err) => { imageCache.delete(iconId); throw err })

  imageCache.set(iconId, promise)
  return promise
}

async function addImagePoints({ id, geojson, iconId, iconUrl, iconSize = 0.5, iconAnchor = 'center', allowOverlap = true, textField = null, textSize = 11, textColor = '#ffffff', textHaloColor = '#000000', textHaloWidth = 1, textOffset = [0, 1.4] }) {
  if (!map || !geojson?.features) return
  if (iconUrl) await ensureImage(iconId, iconUrl)

  if (!map.getSource(id)) map.addSource(id, { type: 'geojson', data: geojson })
  else map.getSource(id).setData(geojson)
  if (map.getLayer(id)) return

  const layout = { 'icon-image': iconId, 'icon-size': iconSize, 'icon-anchor': iconAnchor, 'icon-allow-overlap': allowOverlap, 'icon-ignore-placement': allowOverlap }
  const paint = {}
  if (textField) {
    layout['text-field'] = ['coalesce', ['get', textField], '']
    layout['text-size'] = textSize
    layout['text-offset'] = textOffset
    layout['text-anchor'] = 'top'
    layout['text-allow-overlap'] = allowOverlap
    paint['text-color'] = textColor
    paint['text-halo-color'] = textHaloColor
    paint['text-halo-width'] = textHaloWidth
  }
  map.addLayer({ id, type: 'symbol', source: id, layout, paint })
  addedLayers.add(id)
}

function removeLayer(id) {
  if (!map) return
  unbindHover(id); clearHighlight(id)
  const toRemove = Array.from(addedLayers).filter((lId) => lId === id || lId.startsWith(`${id}-`))
  toRemove.forEach((lId) => { if (map.getLayer(lId)) map.removeLayer(lId); addedLayers.delete(lId) })
  ;[id, `${id}-points`, `${id}-border`].forEach((sId) => { if (map.getSource(sId)) map.removeSource(sId) })
}

function onClick(layerId, callback) {
  if (!map) return
  const handler = (event) => {
    const features = map.queryRenderedFeatures(event.point, { layers: [layerId] })
    if (features.length) callback(features[0], event)
  }
  map.on('click', layerId, handler)
  const list = clickHandlers.get(layerId) || []
  list.push(handler)
  clickHandlers.set(layerId, list)
}

function offClick(layerId) {
  const list = clickHandlers.get(layerId)
  if (!list || !map) return
  for (const h of list) map.off('click', layerId, h)
  clickHandlers.delete(layerId)
}

defineExpose({
  flyToShaanxi, addPolygon, addFillLayer, addSymbolLayer, addExtrusion, addCentroidLabels, addLine, addPoints, addLabels, addImagePoints, ensureImage, removeLayer, onClick, offClick, loadEditableAreas, clearEditableAreas, getEditableAreas, addMaskLayer, setMaskOpacity, bringMaskToTop, hasMaskLayer, removeMaskLayer, getMap: () => map, getDraw: () => draw, startBoxSelect, stopBoxSelect, bringDrawPointsToTop,
})
</script>

<style scoped>
.map-container { position: absolute; inset: 0; width: 100%; height: 100%; }
:deep(.maplibregl-ctrl-top-right) { display: none; }
:deep(.maplibregl-ctrl-bottom-right) { display: none; }
</style>