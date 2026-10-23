<!-- MapGL.vue -->
<template>
  <div
    ref="mapContainer"
    class="map-container"
    :style="{ backgroundImage: `url(${bgImg})` }"
  />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'

import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import { addGradientExtrusion } from '@/utils/gradientExtrusion'

import bgImg from '@/assets/img/qinchuan/dashbord/bg.png'

if (typeof maplibregl.setWorkerUrl === 'function') {
  maplibregl.setWorkerUrl(workerUrl)
}
if (typeof window !== 'undefined' && !window.mapboxgl) {
  window.mapboxgl = maplibregl
}

const emit = defineEmits([
  'ready', 'draw-update', 'draw-create', 'draw-delete', 'box-select', 'point-drag', 'city-click',
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
const glowLineGeoJSONCache = new Map()

let draggingFeatureId = null
let isBoxSelecting = false
let boxStartPoint = null
const boxOverlayId = 'box-select-overlay'

let mousedownPoint = null
let mousedownFeatureId = null

// point-in-polygon 用
let cityBoundariesCache = null

// ★ 纯 HTML 城市标签
let labelsContainer = null
let cityLabels = []
let cityLabelMoveHandler = null

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
const baseDirectSelectMode = MapboxDraw.modes.direct_select

const vertexOnlyDirectSelectMode = {
  ...baseDirectSelectMode,
  onMouseDown(state, event) {
    if (event.featureTarget?.properties?.meta !== 'vertex') return
    return baseDirectSelectMode.onMouseDown.call(this, state, event)
  },
}

onMounted(() => {
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
    modes: {
      ...MapboxDraw.modes,
      vertex_only_direct_select: vertexOnlyDirectSelectMode,
    },
  })
  map.addControl(draw, 'top-left')

  map.on('draw.update', (e) => { handleDrawUpdate(e); emit('draw-update', e.features) })
  map.on('draw.create', (e) => emit('draw-create', e.features))
  map.on('draw.delete', (e) => emit('draw-delete', e.features))

  bindPointInteraction()
  bindBoxSelect()

  // 城市点击：point-in-polygon
  map.on('click', (e) => {
    if (!cityBoundariesCache) return
    const feature = findCityAtLngLat(e.lngLat)
    if (feature) emit('city-click', feature)
  })

  map.on('load', () => {
    map.setProjection({ type: 'globe' })

    try {
      const styleLayers = map.getStyle()?.layers || []
      styleLayers.forEach((layer) => {
        if (layer.type === 'background') map.setPaintProperty(layer.id, 'background-opacity', 0)
      })
    } catch (e) { /* 忽略 */ }

    try {
      map.setSky({
        'sky-color': 'rgba(0, 0, 0, 0)', 'horizon-color': 'rgba(0, 0, 0, 0)',
        'fog-color': 'rgba(0, 0, 0, 0)', 'sky-horizon-blend': 0.5,
        'horizon-fog-blend': 0.5, 'fog-ground-blend': 0.5,
      })
    } catch (e) { /* 忽略 */ }

    try {
      map.setLight({ anchor: 'viewport', color: '#ffffff', intensity: 0.4, position: [1.15, 200, 45] })
    } catch (e) { /* 忽略 */ }

    flyToShaanxi()
    emit('ready')
  })
})

onUnmounted(() => {
  for (const [layerId, handler] of hoverHandlers) {
    if (handler.onMouseMove) map?.off('mousemove', handler.onMouseMove)
    if (handler.onMouseLeave && map) map.getCanvas().removeEventListener('mouseleave', handler.onMouseLeave)
    hoverHandlers.delete(layerId)
  }
  for (const [layerId, list] of clickHandlers) {
    for (const h of list) map?.off('click', layerId, h)
  }
  clickHandlers.clear()
  imageCache.clear()
  glowLineGeoJSONCache.clear()

  if (labelsContainer) { labelsContainer.remove(); labelsContainer = null }
  cityLabels = []
  if (cityLabelMoveHandler && map) {
    map.off('move', cityLabelMoveHandler)
    map.off('render', cityLabelMoveHandler)
    cityLabelMoveHandler = null
  }
  cityBoundariesCache = null

  map?.off('draw.update', handleDrawUpdate)
  map?.remove()
  map = null
  draw = null
})

// ======================== point-in-polygon ========================
function buildCityBoundaries(geojson) {
  const cache = new Map()
  for (const f of geojson.features) {
    const name = f.properties?.name
    if (!name || !f.geometry) continue
    const rings = []
    let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity
    const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates]
      : f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : []
    for (const poly of polys) {
      for (let i = 0; i < poly.length; i++) {
        const ring = poly[i]
        rings.push({ coords: ring, isHole: i > 0 })
        for (const [lng, lat] of ring) {
          if (lng < minLng) minLng = lng
          if (lng > maxLng) maxLng = lng
          if (lat < minLat) minLat = lat
          if (lat > maxLat) maxLat = lat
        }
      }
    }
    cache.set(name, { rings, bbox: [minLng, minLat, maxLng, maxLat], feature: f })
  }
  return cache
}

function pointInRing(lng, lat, ring) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1]
    const xj = ring[j][0], yj = ring[j][1]
    const intersect = ((yi > lat) !== (yj > lat))
      && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi)
    if (intersect) inside = !inside
  }
  return inside
}

function findCityAtLngLat(lngLat) {
  if (!cityBoundariesCache) return null
  const { lng, lat } = lngLat
  for (const [, data] of cityBoundariesCache) {
    const [minLng, minLat, maxLng, maxLat] = data.bbox
    if (lng < minLng || lng > maxLng || lat < minLat || lat > maxLat) continue
    let hitOuter = false, hitHole = false
    for (const ring of data.rings) {
      if (pointInRing(lng, lat, ring.coords)) {
        if (ring.isHole) hitHole = true
        else hitOuter = true
      }
    }
    if (hitOuter && !hitHole) return data.feature
  }
  return null
}

// ======================== 交互 ========================
function bringDrawPointsToTop() {
  if (!map) return
  ;['gl-draw-point-inactive', 'gl-draw-point-active'].forEach(layerId => {
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
    map.getCanvas().style.cursor = features.length ? 'pointer' : ''
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

// ======================== 基础方法 ========================
function flyToShaanxi() {
  map?.flyTo({ center: [108.9, 35.2], zoom: 6.5, pitch: 50, bearing: 0, duration: 3000, essential: true })
}

function handleDrawUpdate(event) {}
function loadEditableAreas(fc) { if (draw && fc?.features?.length) draw.add(fc) }
function clearEditableAreas() { draw?.deleteAll() }
function getEditableAreas() { return draw?.getAll() || null }
function cloneGeojson(g) { return JSON.parse(JSON.stringify(g)) }

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
  if (layers[layers.length - 1].id !== id) map.moveLayer(id)
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
  const { heightField, heightMultiplier, defaultHeight, colorField, colorStops, colorMap, defaultColor } = opts
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
  return { color: colorExpression, height: heightExpression }
}
// 颜色插值工具
function hexToRgb(hex) {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')
}
function interpolateColors(colors, t) {
  if (!colors || !colors.length) return '#000000'
  if (colors.length === 1) return colors[0]
  const p = t * (colors.length - 1)
  const i = Math.floor(p)
  const f = p - i
  if (i >= colors.length - 1) return colors[colors.length - 1]
  const c1 = hexToRgb(colors[i])
  const c2 = hexToRgb(colors[i + 1])
  return rgbToHex(c1[0] + (c2[0] - c1[0]) * f, c1[1] + (c2[1] - c1[1]) * f, c1[2] + (c2[2] - c1[2]) * f)
}
// 边界细条 GeoJSON
function buildBorderGeoJSON(geojson, widthM) {
  const h = widthM / 2 / 111320
  const features = []

  function hashPid(pid) {
    const s = String(pid)
    let hh = 0
    for (let i = 0; i < s.length; i++) hh = (hh * 31 + s.charCodeAt(i)) | 0
    return Math.abs(hh) % 13
  }

  const pushRing = (ring, pid) => {
    const elevOffset = hashPid(pid) * 50
    for (let i = 0; i < ring.length - 1; i++) {
      const a = ring[i], b = ring[i + 1]
      const cos = Math.cos(((a[1] + b[1]) / 2) * Math.PI / 180) || 1
      const ax = a[0] * cos, ay = a[1], bx = b[0] * cos, by = b[1]
      const dx = bx - ax, dy = by - ay
      const len = Math.hypot(dx, dy)
      if (!len) continue
      const ux = dx / len, uy = dy / len
      const nx = -uy, ny = ux
      const sx = ax - ux * h, sy = ay - uy * h
      const ex = bx + ux * h, ey = by + uy * h
      const pts = [
        [sx + nx * h, sy + ny * h], [ex + nx * h, ey + ny * h],
        [ex - nx * h, ey - ny * h], [sx - nx * h, sy - ny * h],
      ].map(([x, y]) => [x / cos, y])
      pts.push(pts[0])
      features.push({
        type: 'Feature',
        properties: { pid, elevOffset },
        geometry: { type: 'Polygon', coordinates: [pts] },
      })
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

// ============================================================================
// addExtrusion：五层完全分离，彻底消除 z-fighting
//   侧面 band：0 ~ topBase-50（19650）
//   顶面     ：topBase-50 ~ defaultHeight（19650 ~ 20000）
//   边界     ：defaultHeight+50 ~ defaultHeight+50+borderHeight（20050 ~ 20170+offset）
//   hover    ：动态改顶面 color，无独立图层
// ============================================================================
function addExtrusion(opts) {
  const {
    id, geojson, heightField = null, heightMultiplier = 1, defaultHeight = 180000,
    colorField = null, colorStops = null, colorMap = null, defaultColor = '#8CCBF5',
    highlightColor = '#EFA83D', opacity = 1, enableHover = true,
    lineColor = 'transparent',
    borderWidth = 1000, borderHeight = 120,
    sideColors = null, sideBands = 10,
    topThickness = 300,
    useVerticalGradient = true,   // ★ 新增：默认走单层渐变，彻底无闪
  } = opts

  if (!map || !geojson?.features) return
  const mapData = cloneGeojson(geojson)
  ensureFeatureIds(mapData)

  cityBoundariesCache = buildCityBoundaries(mapData)

  const isDynamicHeight = !!heightField
  const expressions = createColorExpression({
    heightField, heightMultiplier, defaultHeight,
    colorField, colorStops, colorMap, defaultColor,
  })
  const baseColorExpr = JSON.parse(JSON.stringify(expressions.color))

  if (!map.getSource(id)) {
    map.addSource(id, { type: 'geojson', data: mapData, promoteId: 'id' })
  } else {
    map.getSource(id).setData(mapData)
  }

  // 清理旧 side 层
  const oldSideLayers = Array.from(addedLayers).filter(lId => lId.startsWith(`${id}-side-`))
  oldSideLayers.forEach((lid) => {
    if (map.getLayer(lid)) map.removeLayer(lid)
    addedLayers.delete(lid)
  })

  if (useVerticalGradient) {
    // ==========================================================================
    // ★ 方案 B：单层 fill-extrusion + vertical gradient
    //   - 只有一个 geometry，没有任何共面，拖动绝对不闪
    //   - 侧面颜色由 MapLibre 按光照自动计算，视觉接近 #0072FF → 白
    //   - 顶面是该 geometry 的顶面，颜色 = fill-extrusion-color
    // ==========================================================================
    const paint = {
      'fill-extrusion-color': baseColorExpr,
      'fill-extrusion-height': expressions.height,
      'fill-extrusion-base': 0,
      'fill-extrusion-opacity': opacity,
      'fill-extrusion-vertical-gradient': true,
    }
    if (!map.getLayer(id)) {
      map.addLayer({ id, type: 'fill-extrusion', source: id, paint })
      addedLayers.add(id)
    } else {
      Object.entries(paint).forEach(([k, v]) => map.setPaintProperty(id, k, v))
    }
  } else {
    // ==========================================================================
    // 方案 A：多 band 渐变（保留精确颜色，可能有轻微 z-fighting）
    // ==========================================================================
    const topBase = defaultHeight - topThickness
    const useSideColors = Array.isArray(sideColors) && sideColors.length > 0 && !heightField

    if (useSideColors) {
      const bandCount = sideBands || 10
      const bandHeight = topBase / bandCount
      for (let i = 0; i < bandCount; i++) {
        const base = i * bandHeight
        const height = (i + 1) * bandHeight
        const t = bandCount === 1 ? 0 : i / (bandCount - 1)
        const color = interpolateColors(sideColors, t)
        const lid = `${id}-side-${i}`
        if (map.getLayer(lid)) map.removeLayer(lid)
        map.addLayer({
          id: lid, type: 'fill-extrusion', source: id,
          paint: {
            'fill-extrusion-color': color,
            'fill-extrusion-base': base,
            'fill-extrusion-height': height,
            'fill-extrusion-opacity': 1,
            'fill-extrusion-vertical-gradient': false,
          },
        })
        addedLayers.add(lid)
      }
    }

    const topBaseExpr = isDynamicHeight
      ? ['-', expressions.height, topThickness]
      : topBase
    const topPaint = {
      'fill-extrusion-color': baseColorExpr,
      'fill-extrusion-height': expressions.height,
      'fill-extrusion-base': topBaseExpr,
      'fill-extrusion-opacity': opacity,
    }
    if (!map.getLayer(id)) {
      map.addLayer({ id, type: 'fill-extrusion', source: id, paint: topPaint })
      addedLayers.add(id)
    } else {
      Object.entries(topPaint).forEach(([k, v]) => map.setPaintProperty(id, k, v))
    }
  }

  // ---- 边界：抬到顶面之上，无重叠 ----
  const borderId = `${id}-border`
  const BORDER_LIFT = 50
  const borderBaseExpr = isDynamicHeight
    ? ['+', expressions.height, BORDER_LIFT]
    : defaultHeight + BORDER_LIFT
  const borderHeightExpr = isDynamicHeight
    ? ['+', expressions.height, BORDER_LIFT + borderHeight]
    : defaultHeight + BORDER_LIFT + borderHeight
  const elevOffsetExpr = ['coalesce', ['get', 'elevOffset'], 0]

  const borderPaint = {
    'fill-extrusion-color': lineColor,
    'fill-extrusion-base': ['+', borderBaseExpr, elevOffsetExpr],
    'fill-extrusion-height': ['+', borderHeightExpr, elevOffsetExpr],
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

  // ---- hover：直接改顶面颜色 ----
  if (enableHover) {
    unbindHover(id)
    let currentHoverName = null
    const setHoverCity = (name) => {
      if (name === currentHoverName) return
      currentHoverName = name
      if (name) {
        map.setPaintProperty(id, 'fill-extrusion-color',
          ['case', ['==', ['get', 'name'], name], highlightColor, baseColorExpr])
        map.getCanvas().style.cursor = 'pointer'
      } else {
        map.setPaintProperty(id, 'fill-extrusion-color', baseColorExpr)
        map.getCanvas().style.cursor = ''
      }
    }
    const onMouseMove = (e) => {
      const feature = findCityAtLngLat(e.lngLat)
      setHoverCity(feature?.properties?.name || null)
    }
    const onMouseLeave = () => setHoverCity(null)
    map.on('mousemove', onMouseMove)
    map.getCanvas().addEventListener('mouseleave', onMouseLeave)
    hoverHandlers.set(id, { onMouseMove, onMouseLeave, setHoverCity })
  }
}

function unbindHover(id) {
  if (!hoverHandlers.has(id)) return
  const old = hoverHandlers.get(id)
  if (old.onMouseMove) map?.off('mousemove', old.onMouseMove)
  if (old.onMouseLeave && map) map.getCanvas().removeEventListener('mouseleave', old.onMouseLeave)
  if (old.setHoverCity) old.setHoverCity(null)  // 恢复默认色
  if (map) map.getCanvas().style.cursor = ''
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
  else return null
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

// ============================================================================
// addCentroidLabels：纯 HTML 绝对定位层，不受 pitch 影响
// ============================================================================
function addCentroidLabels(opts) {
  const {
    id, geojson,
    labelField = 'name', subLabelField = null,
    textColor = '#FFFFFF', textSize = 14, subTextSize = 10,
    haloColor = '#000000', haloWidth = 1,
    height = 0,
  } = opts

  if (!map || !geojson?.features || !mapContainer.value) return

  // 清理旧
  if (labelsContainer) {
    labelsContainer.remove()
    labelsContainer = null
  }
  cityLabels = []
  if (cityLabelMoveHandler && map) {
    map.off('move', cityLabelMoveHandler)
    map.off('render', cityLabelMoveHandler)
    cityLabelMoveHandler = null
  }

  labelsContainer = document.createElement('div')
  labelsContainer.className = 'city-labels-overlay'
  labelsContainer.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:10;overflow:hidden;'
  mapContainer.value.appendChild(labelsContainer)

  for (const f of geojson.features) {
    const coords = centroidOfFeature(f)
    if (!coords) continue
    const name = f.properties?.[labelField]
    if (!name) continue
    const sub = subLabelField ? (f.properties?.[subLabelField] ?? '') : ''

    const el = document.createElement('div')
    el.style.cssText = `
      position: absolute;
      left: 0; top: 0;
      pointer-events: none;
      text-align: center;
      line-height: 1.2;
      white-space: nowrap;
      will-change: transform;
    `

    const nameEl = document.createElement('div')
    nameEl.textContent = name
    nameEl.style.cssText = `
      color: ${textColor};
      font-size: ${textSize}px;
      font-weight: 500;
      text-shadow: 0 0 ${haloWidth}px ${haloColor}, 0 0 ${haloWidth * 2}px ${haloColor};
    `
    el.appendChild(nameEl)

    if (sub !== '') {
      const subEl = document.createElement('div')
      subEl.textContent = sub
      subEl.style.cssText = `
        color: #A9DFFF;
        font-size: ${subTextSize}px;
        margin-top: 2px;
        text-shadow: 0 0 ${haloWidth}px ${haloColor}, 0 0 ${haloWidth * 2}px ${haloColor};
      `
      el.appendChild(subEl)
    }

    labelsContainer.appendChild(el)
    cityLabels.push({ el, lngLat: coords, height })
  }

  const updatePositions = () => {
    if (!map || !cityLabels.length) return
    const pitch = map.getPitch()
    const zoom = map.getZoom()
    const mpp = 78271.517 * Math.cos(35.2 * Math.PI / 180) / Math.pow(2, zoom)
    const sinPitch = Math.sin(pitch * Math.PI / 180)
    for (const m of cityLabels) {
      const p = map.project(m.lngLat)
      const liftPx = m.height > 0 ? (m.height / mpp) * sinPitch : 0
      m.el.style.transform = `translate(-50%, -50%) translate(${p.x}px, ${p.y - liftPx}px)`
    }
  }

  cityLabelMoveHandler = updatePositions
  map.on('move', updatePositions)
  map.on('render', updatePositions)
  updatePositions()
}

function addLine({ id, geojson, color = '#ffcc00', width = 2, dashArray = null }) {
  if (!map) return
  if (map.getSource(id)) { map.getSource(id).setData(geojson); return }
  map.addSource(id, { type: 'geojson', data: geojson })
  map.addLayer({ id, type: 'line', source: id, paint: { 'line-color': color, 'line-width': width, ...(dashArray ? { 'line-dasharray': dashArray } : {}) } })
  addedLayers.add(id)
}

function addGlowLine({ id, geojson, color = '#00e6c8', coreColor = '#65f8df', width = 1.5 }) {
  if (!map) return
  const existingSource = map.getSource(id)
  if (!existingSource) map.addSource(id, { type: 'geojson', data: geojson })
  else if (glowLineGeoJSONCache.get(id) !== geojson) existingSource.setData(geojson)
  glowLineGeoJSONCache.set(id, geojson)

  // 三层叠加：宽而淡的外晕、较窄的近光晕、半透明的青绿色核心线
  const layers = [
    { suffix: 'halo', lineColor: color, lineWidth: width * 7, lineOpacity: 0.08, lineBlur: 6 },
    { suffix: 'glow', lineColor: color, lineWidth: width * 3.2, lineOpacity: 0.18, lineBlur: 3 },
    { suffix: 'core', lineColor: coreColor, lineWidth: width, lineOpacity: 0.82, lineBlur: 0 },
  ]

  for (const layer of layers) {
    const layerId = `${id}-${layer.suffix}`
    const paint = {
      'line-color': layer.lineColor,
      'line-width': layer.lineWidth,
      'line-opacity': layer.lineOpacity,
      'line-blur': layer.lineBlur,
    }

    if (map.getLayer(layerId)) {
      for (const [property, value] of Object.entries(paint)) {
        map.setPaintProperty(layerId, property, value)
      }
    } else {
      map.addLayer({
        id: layerId,
        type: 'line',
        source: id,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint,
      })
    }
    addedLayers.add(layerId)
  }
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

// ★ removeLayer：先移除所有 layer，再移除 source；含 labels 清理
function removeLayer(id) {
  if (!map) return
  unbindHover(id)
  clearHighlight(id)

  // 清理 HTML 标签
  if (labelsContainer) {
    labelsContainer.remove()
    labelsContainer = null
  }
  cityLabels = []
  if (cityLabelMoveHandler && map) {
    map.off('move', cityLabelMoveHandler)
    map.off('render', cityLabelMoveHandler)
    cityLabelMoveHandler = null
  }

  // 收集所有需要移除的 layer（含 hover-layer 这类没有登记在 addedLayers 的）
  const toRemove = new Set()
  addedLayers.forEach((lId) => {
    if (lId === id || lId.startsWith(`${id}-`)) toRemove.add(lId)
  })
  // 从 style 里扫描兜底
  const styleLayers = map.getStyle()?.layers || []
  styleLayers.forEach((l) => {
    if (l.id === id || l.id.startsWith(`${id}-`)) toRemove.add(l.id)
  })

  toRemove.forEach((lId) => {
    if (map.getLayer(lId)) map.removeLayer(lId)
    addedLayers.delete(lId)
  })

  ;[id, `${id}-points`, `${id}-border`, `${id}-hover-source`].forEach((sId) => {
    if (map.getSource(sId)) map.removeSource(sId)
  })
  glowLineGeoJSONCache.delete(id)
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
  flyToShaanxi, addPolygon, addFillLayer, addSymbolLayer, addExtrusion, addCentroidLabels, addLine, addPoints, addLabels, addImagePoints, ensureImage, removeLayer, onClick, offClick, loadEditableAreas, clearEditableAreas, getEditableAreas, addMaskLayer, setMaskOpacity, bringMaskToTop, hasMaskLayer, removeMaskLayer, getMap: () => map, getDraw: () => draw, startBoxSelect, stopBoxSelect, bringDrawPointsToTop,addGlowLine,
  findCityAtLngLat: (lngLat) => findCityAtLngLat(lngLat),
})
</script>

<style scoped>
.map-container {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: transparent;
}
:deep(.maplibregl-ctrl-top-right) { display: none; }
:deep(.maplibregl-ctrl-bottom-right) { display: none; }
:deep(.maplibregl-canvas) { background: transparent !important; }
</style>