// src/utils/gradientExtrusion.js
// 侧面厚度方向的颜色渐变：MapLibre 的 fill-extrusion-color 不支持按高度插值，
// 所以用「多层等高带」堆出渐变。调用方只给几个关键色，这里自动插值成 N 层。
//
// globe 投影下，相邻层如果严格首尾相接（base === 上一层的 height），
// 深度缓冲会让它们互相争夺同一深度值，渲染时逐帧交替胜出 → 视觉闪烁。
// 解决：每层按索引上浮一个微小 EPS（米），让深度顺序明确。
// EPS 在 20000 米高度、zoom 6.5 下约 0.001 像素，肉眼不可见。

function hexToRgb(hex) {
  const h = String(hex).replace('#', '')
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ]
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b]
    .map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0'))
    .join('')
}

function lerpColor(c1, c2, t) {
  const [r1, g1, b1] = hexToRgb(c1)
  const [r2, g2, b2] = hexToRgb(c2)
  return rgbToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t)
}

// colors: 从底到顶的关键色；t: 0(底) ~ 1(顶)
export function sampleGradient(colors, t) {
  if (!colors?.length) return '#000000'
  if (colors.length === 1) return colors[0]
  const segs = colors.length - 1
  const pos = Math.max(0, Math.min(1, t)) * segs
  const i = Math.min(Math.floor(pos), segs - 1)
  return lerpColor(colors[i], colors[i + 1], pos - i)
}

// 默认层数：globe 下 10 层足够平滑，24 层太密容易触发 z-fighting
const DEFAULT_BANDS = 10
// 默认每层上浮的米数（会被 topThickness / bandH 约束自动压小）
const DEFAULT_EPS_M = 1.5

/**
 * 给已有的 geojson source 添加侧面渐变层。
 * 调用前请确保 map.getSource(id) 已存在（组件里的 addExtrusion 已负责建 source）。
 *
 * @param {maplibregl.Map} map
 * @param {object} opts
 * @param {string}   opts.id            数据源 id（与主图层共用 source）
 * @param {number}   opts.defaultHeight 总高度(米)
 * @param {number}   opts.topThickness  顶面薄片厚度(米)，侧面渐变停在它下方
 * @param {string[]} opts.sideColors    从底到顶的关键色，2~4 个即可
 * @param {number}   [opts.bands]       层数，默认 10
 * @param {number}   [opts.eps]         每层上浮米数，默认 1.5，会自动压到安全范围
 * @param {number}   [opts.opacity]     侧面不透明度，默认 1（多层叠加时不要小于 1）
 * @returns {{ layerIds: string[], topBase: number }}
 */
export function addGradientExtrusion(map, opts) {
  const empty = { layerIds: [], topBase: 0 }
  if (!map) return empty

  const {
    id,
    defaultHeight = 180000,
    topThickness = 300,
    sideColors = [],
    bands,
    eps: epsOpt,
    opacity = 1,
  } = opts || {}

  if (!id || !map.getSource(id)) return empty
  if (!Array.isArray(sideColors) || sideColors.length === 0) return empty

  const topBase = defaultHeight - topThickness
  if (topBase <= 0) return empty

  const bandCount = Math.max(1, Math.floor(bands ?? DEFAULT_BANDS))
  const bandH = topBase / bandCount

  // EPS：让每层上浮 i*EPS，深度上明确错开
  // 约束 1：总上浮 (bandCount-1)*EPS 不超过 topThickness 的 80%，避免穿出顶面
  // 约束 2：EPS 相对 bandH 不可见（<= 1%）
  let eps = Number.isFinite(epsOpt) && epsOpt > 0 ? epsOpt : DEFAULT_EPS_M
  if (bandCount > 1) {
    const maxByGap = topThickness > 0 ? (topThickness * 0.8) / (bandCount - 1) : 0
    const maxByVisual = bandH * 0.01
    eps = Math.min(eps, maxByGap, maxByVisual)
  } else {
    eps = 0
  }
  if (!Number.isFinite(eps) || eps < 0) eps = 0

  const wanted = new Set()
  const layerIds = []

  for (let i = 0; i < bandCount; i++) {
    const t = (i + 0.5) / bandCount
    const color = sideColors.length >= 2
      ? sampleGradient(sideColors, t)
      : sideColors[0]

    const sideId = `${id}-side-${i}`
    wanted.add(sideId)

    const base = i * bandH + i * eps
    const height = (i + 1) * bandH + i * eps

    const paint = {
      'fill-extrusion-color': color,
      'fill-extrusion-base': base,
      'fill-extrusion-height': height,
      'fill-extrusion-opacity': opacity,
      // 关掉每层内部的光照垂直渐变，避免多层叠加后出现横向条带
      'fill-extrusion-vertical-gradient': false,
    }

    if (!map.getLayer(sideId)) {
      map.addLayer({ id: sideId, type: 'fill-extrusion', source: id, paint })
    } else {
      Object.entries(paint).forEach(([k, v]) => map.setPaintProperty(sideId, k, v))
    }
    layerIds.push(sideId)
  }

  // 层数变化时清理多余的旧层
  const styleLayers = map.getStyle()?.layers || []
  styleLayers.forEach((layer) => {
    if (layer.id.startsWith(`${id}-side-`) && !wanted.has(layer.id) && map.getLayer(layer.id)) {
      map.removeLayer(layer.id)
    }
  })

  return { layerIds, topBase }
}

/**
 * 独立清理：不依赖组件里的 addedLayers，按前缀 `${id}-side-` 删除所有侧面渐变层。
 * 如果组件 removeLayer 已经能清理（因为 layerIds 被加入 addedLayers），这个函数可不调用。
 */
export function removeGradientExtrusion(map, id) {
  if (!map || !id) return
  const styleLayers = map.getStyle()?.layers || []
  styleLayers.forEach((layer) => {
    if (layer.id.startsWith(`${id}-side-`) && map.getLayer(layer.id)) {
      map.removeLayer(layer.id)
    }
  })
}