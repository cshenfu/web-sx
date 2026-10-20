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

// 导入 Worker 文件，Vite 会将其打包并返回正确的 URL
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'

// 在创建任何地图实例之前，设置 Worker URL
if (typeof maplibregl.setWorkerUrl === 'function') {
  maplibregl.setWorkerUrl(workerUrl)
}
if (typeof window !== 'undefined' && !window.mapboxgl) {
  window.mapboxgl = maplibregl
}

const emit = defineEmits(['ready', 'draw-update', 'draw-create', 'draw-delete'])

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

const drawStyles = [
  {
    id: 'gl-draw-polygon-fill-inactive', type: 'fill',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
    paint: { 'fill-color': '#2A9FFF', 'fill-outline-color': '#2A9FFF', 'fill-opacity': 0.35 },
  },
  {
    id: 'gl-draw-polygon-fill-active', type: 'fill',
    filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
    paint: { 'fill-color': '#2A9FFF', 'fill-outline-color': '#2A9FFF', 'fill-opacity': 0.45 },
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
    paint: { 'circle-radius': 5, 'circle-color': '#22c55e', 'circle-stroke-color': '#fff', 'circle-stroke-width': 1.5 },
  },
  {
    id: 'gl-draw-point-active', type: 'circle',
    filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Point'], ['!=', 'meta', 'midpoint']],
    paint: { 'circle-radius': 6, 'circle-color': '#FFD700', 'circle-stroke-color': '#fff', 'circle-stroke-width': 1.5 },
  },
]

onMounted(() => {
  map = new maplibregl.Map({
    container: mapContainer.value,
    style: props.style,
    center: props.center,
    zoom: props.zoom,
    projection: 'globe',
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

  map.on('load', () => {
    if (typeof map.setProjection === 'function') {
      map.setProjection({ type: 'globe' })
    }
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

  map?.off('draw.update', handleDrawUpdate)
  map?.remove()
  map = null
  draw = null
})

function flyToShaanxi() {
  map?.flyTo({
    center: [108.9, 35.2],
    zoom: 6.5,
    pitch: 45,
    bearing: 0,
    duration: 3000,
    essential: true,
  })
}

function handleDrawUpdate(event) {
  if (!event?.features?.length) return
  event.features.forEach((feature) => {
    console.log(`区域 ${feature.id} 坐标已更新:`, feature.geometry.coordinates)
  })
}

function loadEditableAreas(featureCollection) {
  if (!draw) return
  draw.deleteAll()
  if (featureCollection?.features?.length) {
    draw.add(featureCollection)
  }
}
function clearEditableAreas() { draw?.deleteAll() }
function getEditableAreas() { return draw?.getAll() || null }

function cloneGeojson(geojson) { return JSON.parse(JSON.stringify(geojson)) }

function ensureFeatureIds(geojson) {
  geojson.features.forEach((feature, index) => {
    feature.properties = feature.properties || {}
    if (feature.id === undefined || feature.id === null) {
      feature.id = feature.properties.id ?? index
    }
    if (feature.properties.id === undefined || feature.properties.id === null) {
      feature.properties.id = feature.id
    }
  })
}

function addPolygon({ id, geojson, color = '#4fc3ff', opacity = 0.7, outlineColor = '#4fc3ff' }) {
  if (!map) return
  if (map.getSource(id)) {
    map.getSource(id).setData(geojson)
    if (map.getLayer(`${id}-fill`)) {
      map.setPaintProperty(`${id}-fill`, 'fill-color', color)
      map.setPaintProperty(`${id}-fill`, 'fill-opacity', opacity)
    }
    if (map.getLayer(`${id}-outline`)) {
      map.setPaintProperty(`${id}-outline`, 'line-color', outlineColor)
    }
    return
  }
  map.addSource(id, { type: 'geojson', data: geojson })
  map.addLayer({
    id: `${id}-fill`, type: 'fill', source: id,
    paint: { 'fill-color': color, 'fill-opacity': opacity },
  })
  map.addLayer({
    id: `${id}-outline`, type: 'line', source: id,
    paint: { 'line-color': outlineColor, 'line-width': 1.5 },
  })
  addedLayers.add(`${id}-fill`)
  addedLayers.add(`${id}-outline`)
}

function addFillLayer({
  id,
  geojson,
  fillColor = '#4fc3ff',
  fillOpacity = 0.5,
  outlineColor = '#4fc3ff',
  outlineWidth = 1,
}) {
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
  map.addLayer({
    id: `${id}-fill`, type: 'fill', source: id,
    paint: { 'fill-color': fillColor, 'fill-opacity': fillOpacity },
  })
  map.addLayer({
    id: `${id}-outline`, type: 'line', source: id,
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': outlineColor, 'line-width': outlineWidth },
  })
  addedLayers.add(`${id}-fill`)
  addedLayers.add(`${id}-outline`)
}

// ========================================================
// ★ 遮罩图层（反遮罩 / 带洞 fill，支持透明度渐变）
// ========================================================
function addMaskLayer({
  id,
  geojson,
  color = '#000000',
  opacity = 0,
  fadeDuration = 300,
}) {
  if (!map) return false
  if (map.getSource(id)) {
    map.getSource(id).setData(geojson)
    if (map.getLayer(id)) {
      map.setPaintProperty(id, 'fill-color', color)
    }
    return true
  }
  map.addSource(id, { type: 'geojson', data: geojson })
  map.addLayer({
    id,
    type: 'fill',
    source: id,
    paint: {
      'fill-color': color,
      'fill-opacity': opacity,
      'fill-opacity-transition': { duration: fadeDuration, delay: 0 },
    },
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

function hasMaskLayer(id) {
  return !!(map && map.getLayer(id))
}

function removeMaskLayer(id) {
  if (!map) return
  if (map.getLayer(id)) map.removeLayer(id)
  if (map.getSource(id)) map.removeSource(id)
  addedLayers.delete(id)
}

function addSymbolLayer({ id, geojson, layout = {}, paint = {} }) {
  if (!map) return
  if (!map.getSource(id)) {
    map.addSource(id, { type: 'geojson', data: geojson })
  } else {
    map.getSource(id).setData(geojson)
  }
  if (map.getLayer(id)) return
  map.addLayer({ id, type: 'symbol', source: id, layout, paint })
  addedLayers.add(id)
}

function createColorExpression(opts) {
  const {
    heightField, heightMultiplier, defaultHeight,
    colorField, colorStops, colorMap, defaultColor, highlightColor,
  } = opts
  let colorExpression = defaultColor
  if (colorField && Array.isArray(colorStops) && colorStops.length) {
    const stops = colorStops.flat()
    colorExpression = ['coalesce', ['interpolate', ['linear'], ['get', colorField], ...stops], defaultColor]
  } else if (colorMap && Object.keys(colorMap).length) {
    const cases = []
    for (const [name, color] of Object.entries(colorMap)) cases.push(name, color)
    cases.push(defaultColor)
    colorExpression = ['match', ['get', 'name'], ...cases]
  } else if (colorField) {
    colorExpression = ['coalesce', ['get', colorField], defaultColor]
  }
  const heightExpression = heightField
    ? ['*', ['coalesce', ['get', heightField], 0], heightMultiplier]
    : defaultHeight
  return {
    color: ['case', ['boolean', ['feature-state', 'highlight'], false], highlightColor, colorExpression],
    height: heightExpression,
  }
}

function addExtrusion(opts) {
  const {
    id, geojson, heightField = null, heightMultiplier = 1, defaultHeight = 180000,
    colorField = null, colorStops = null, colorMap = null,
    defaultColor = '#2A9FFF', highlightColor = '#FFD700',
    opacity = 0.9, enableHover = true, useEventLayer = true,
  } = opts
  if (!map || !geojson?.features) return

  const mapData = cloneGeojson(geojson)
  ensureFeatureIds(mapData)

  const expressions = createColorExpression({
    heightField, heightMultiplier, defaultHeight,
    colorField, colorStops, colorMap, defaultColor, highlightColor,
  })

  if (!map.getSource(id)) {
    map.addSource(id, { type: 'geojson', data: mapData })
  } else {
    map.getSource(id).setData(mapData)
  }

  if (!map.getLayer(id)) {
    map.addLayer({
      id, type: 'fill-extrusion', source: id,
      paint: {
        'fill-extrusion-color': expressions.color,
        'fill-extrusion-height': expressions.height,
        'fill-extrusion-base': 0,
        'fill-extrusion-opacity': opacity,
      },
    })
    addedLayers.add(id)
  } else {
    map.setPaintProperty(id, 'fill-extrusion-color', expressions.color)
    map.setPaintProperty(id, 'fill-extrusion-height', expressions.height)
    map.setPaintProperty(id, 'fill-extrusion-opacity', opacity)
  }

  const eventLayerId = `${id}-event`
  if (useEventLayer) {
    if (map.getLayer(eventLayerId)) map.removeLayer(eventLayerId)
    map.addLayer({
      id: eventLayerId, type: 'fill', source: id,
      paint: { 'fill-color': '#ffffff', 'fill-opacity': 0 },
    })
    addedLayers.add(eventLayerId)
  }

  if (enableHover) {
    const targetLayer = useEventLayer ? eventLayerId : id
    unbindHover(id)
    bindHover(id, targetLayer)
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

function bindHover(sourceId, targetLayer) {
  const onMove = (event) => {
    if (!map) return
    const features = map.queryRenderedFeatures(event.point, { layers: [targetLayer] })
    if (!features.length) {
      clearHighlight(sourceId)
      map.getCanvas().style.cursor = ''
      return
    }
    const feature = features[0]
    const featureId = feature.id ?? feature.properties?.id
    if (featureId === undefined || featureId === null) return
    const previousId = lastHighlightBySource.get(sourceId)
    if (previousId !== undefined && previousId !== featureId) {
      map.setFeatureState({ source: sourceId, id: previousId }, { highlight: false })
    }
    map.setFeatureState({ source: sourceId, id: featureId }, { highlight: true })
    lastHighlightBySource.set(sourceId, featureId)
    map.getCanvas().style.cursor = 'pointer'
  }
  const onLeave = () => {
    clearHighlight(sourceId)
    if (map) map.getCanvas().style.cursor = ''
  }
  map.on('mousemove', targetLayer, onMove)
  map.on('mouseleave', targetLayer, onLeave)
  hoverHandlers.set(sourceId, { onMove, onLeave, targetLayer })
}

function centroidOfFeature(feature) {
  const geom = feature?.geometry
  if (!geom) return null

  const rings = []
  if (geom.type === 'Polygon') {
    if (geom.coordinates?.[0]) rings.push(geom.coordinates[0])
  } else if (geom.type === 'MultiPolygon') {
    for (const poly of geom.coordinates || []) {
      if (poly?.[0]) rings.push(poly[0])
    }
  } else {
    return null
  }
  if (!rings.length) return null

  let sx = 0, sy = 0, n = 0
  for (const ring of rings) {
    for (const pt of ring) {
      const lng = Number(pt?.[0])
      const lat = Number(pt?.[1])
      if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue
      sx += lng; sy += lat; n += 1
    }
  }
  if (!n) return null
  return [sx / n, sy / n]
}

function addCentroidLabels(opts) {
  const {
    id, geojson, labelConfig = null, labelField = 'name', subLabelField = null,
    textColor = '#FFFFFF', textSize = 14, subTextSize = 10,
    textOffset = [0, 0], haloColor = '#000000', haloWidth = 1,
  } = opts
  if (!map || !geojson?.features) return

  const points = {
    type: 'FeatureCollection',
    features: geojson.features
      .map((feature) => {
        const coordinates = centroidOfFeature(feature)
        if (!coordinates) return null
        return {
          type: 'Feature',
          geometry: { type: 'Point', coordinates },
          properties: { ...(feature.properties || {}) },
        }
      })
      .filter(Boolean),
  }

  const sourceId = `${id}-points`
  if (!map.getSource(sourceId)) map.addSource(sourceId, { type: 'geojson', data: points })
  else map.getSource(sourceId).setData(points)

  const oldLayers = Array.from(addedLayers).filter((layerId) => layerId.startsWith(`${id}-`))
  oldLayers.forEach((layerId) => {
    if (map.getLayer(layerId)) map.removeLayer(layerId)
    addedLayers.delete(layerId)
  })

  const configs = labelConfig || [
    { field: labelField, size: textSize, color: textColor, offset: textOffset, haloColor, haloWidth },
    ...(subLabelField
      ? [{ field: subLabelField, size: subTextSize, color: '#A9DFFF', offset: [textOffset[0], textOffset[1] + 1.1], haloColor, haloWidth }]
      : []),
  ]

  configs.forEach((config, index) => {
    const layerId = `${id}-line-${index}`
    const textField = getTextExpression(config)
    map.addLayer({
      id: layerId, type: 'symbol', source: sourceId,
      layout: {
        'text-field': textField,
        'text-size': config.size ?? textSize,
        'text-offset': config.offset ?? [0, 0],
        'text-allow-overlap': false,
        'text-ignore-placement': false,
        'text-anchor': 'center',
      },
      paint: {
        'text-color': config.color ?? textColor,
        'text-halo-color': config.haloColor ?? haloColor,
        'text-halo-width': config.haloWidth ?? haloWidth,
      },
    })
    addedLayers.add(layerId)
  })
}

function getTextExpression(config) {
  if (config.text !== undefined && config.text !== null) return config.text
  if (!config.field) return ''
  let expression = ['coalesce', ['get', config.field], '']
  if (config.prefix) expression = ['concat', config.prefix, expression]
  if (config.suffix) expression = ['concat', expression, config.suffix]
  return expression
}

function addLine({ id, geojson, color = '#ffcc00', width = 2, dashArray = null }) {
  if (!map) return
  if (map.getSource(id)) { map.getSource(id).setData(geojson); return }
  map.addSource(id, { type: 'geojson', data: geojson })
  map.addLayer({
    id, type: 'line', source: id,
    paint: {
      'line-color': color, 'line-width': width,
      ...(dashArray ? { 'line-dasharray': dashArray } : {}),
    },
  })
  addedLayers.add(id)
}

function addPoints({ id, geojson, color = '#ff5500', radius = 6 }) {
  if (!map) return
  if (map.getSource(id)) { map.getSource(id).setData(geojson); return }
  map.addSource(id, { type: 'geojson', data: geojson })
  map.addLayer({
    id, type: 'circle', source: id,
    paint: {
      'circle-color': color,
      'circle-radius': radius,
      'circle-stroke-width': 1.5,
      'circle-stroke-color': '#fff',
    },
  })
  addedLayers.add(id)
}

function addLabels({ id, geojson, textField = 'name', textColor = '#fff', textSize = 12 }) {
  if (!map) return
  if (!map.getSource(id)) {
    map.addSource(id, { type: 'geojson', data: geojson })
  } else {
    map.getSource(id).setData(geojson)
    return
  }
  map.addLayer({
    id, type: 'symbol', source: id,
    layout: {
      'text-field': ['coalesce', ['get', textField], ''],
      'text-size': textSize,
      'text-allow-overlap': false,
    },
    paint: { 'text-color': textColor, 'text-halo-color': '#000', 'text-halo-width': 1 },
  })
  addedLayers.add(id)
}

async function ensureImage(iconId, iconUrl, timeout = 8000) {
  if (!map || !iconId || !iconUrl) {
    throw new Error(`ensureImage 参数不合法: iconId=${iconId}, iconUrl=${iconUrl}`)
  }
  if (map.hasImage(iconId)) return iconId
  if (imageCache.has(iconId)) return imageCache.get(iconId)

  const promise = (async () => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)
    try {
      const resp = await fetch(iconUrl, { signal: controller.signal })
      if (!resp.ok) throw new Error(`HTTP ${resp.status} — ${iconUrl}`)
      const blob = await resp.blob()
      const bitmap = await createImageBitmap(blob)
      if (map && !map.hasImage(iconId)) map.addImage(iconId, bitmap)
      console.log('[MapGL] 图标注册成功:', iconId)
      return iconId
    } finally {
      clearTimeout(timer)
    }
  })().catch((err) => {
    console.error('[MapGL] ensureImage 失败:', iconUrl, err?.message || err)
    imageCache.delete(iconId)
    throw err
  })

  imageCache.set(iconId, promise)
  return promise
}

async function addImagePoints({
  id,
  geojson,
  iconId,
  iconUrl,
  iconSize = 0.5,
  iconAnchor = 'center',
  allowOverlap = true,
  textField = null,
  textSize = 11,
  textColor = '#ffffff',
  textHaloColor = '#000000',
  textHaloWidth = 1,
  textOffset = [0, 1.4],
}) {
  if (!map || !geojson?.features) return

  if (iconUrl) {
    await ensureImage(iconId, iconUrl)
  }

  if (!map.getSource(id)) map.addSource(id, { type: 'geojson', data: geojson })
  else map.getSource(id).setData(geojson)

  if (map.getLayer(id)) return

  const layout = {
    'icon-image': iconId,
    'icon-size': iconSize,
    'icon-anchor': iconAnchor,
    'icon-allow-overlap': allowOverlap,
    'icon-ignore-placement': allowOverlap,
  }
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
  unbindHover(id)
  clearHighlight(id)
  const toRemove = Array.from(addedLayers).filter(
    (layerId) => layerId === id || layerId.startsWith(`${id}-`)
  )
  toRemove.forEach((layerId) => {
    if (map.getLayer(layerId)) map.removeLayer(layerId)
    addedLayers.delete(layerId)
  })
  const sourceIds = [id, `${id}-points`]
  sourceIds.forEach((sourceId) => {
    if (map.getSource(sourceId)) map.removeSource(sourceId)
  })
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
  flyToShaanxi,
  addPolygon,
  addFillLayer,
  addSymbolLayer,
  addExtrusion,
  addCentroidLabels,
  addLine,
  addPoints,
  addLabels,
  addImagePoints,
  ensureImage,
  removeLayer,
  onClick,
  offClick,
  loadEditableAreas,
  clearEditableAreas,
  getEditableAreas,
  // ★ 遮罩相关
  addMaskLayer,
  setMaskOpacity,
  bringMaskToTop,
  hasMaskLayer,
  removeMaskLayer,
  getMap: () => map,
  getDraw: () => draw,
})
</script>

<style scoped>
.map-container {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

:deep(.maplibregl-ctrl-top-right){
  display: none;
}

:deep(.maplibregl-ctrl-bottom-right){
  display: none;
}
</style>