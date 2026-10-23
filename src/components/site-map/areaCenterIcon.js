// src/components/site-map/areaCenterIcon.js
export const AREA_CENTER_REF_ZOOM = 16
export const AREA_CENTER_REF_ZOOM_SCALE = Math.pow(2, AREA_CENTER_REF_ZOOM)

const ICON_SIZE = 0.8

const iconNaturalWidthCache = new Map()

/** 读取图标自然像素宽（用于把"目标像素宽"换算成 icon-size 倍数） */
export function getIconNaturalWidth(url, fallback = 128) {
  if (!url) return Promise.resolve(fallback)
  if (iconNaturalWidthCache.has(url)) return Promise.resolve(iconNaturalWidthCache.get(url))
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const w = img.naturalWidth || fallback
      iconNaturalWidthCache.set(url, w)
      resolve(w)
    }
    img.onerror = () => {
      iconNaturalWidthCache.set(url, fallback)
      resolve(fallback)
    }
    img.src = url
  })
}

/** [lng,lat][] → [[minLng,minLat],[maxLng,maxLat]] */
export function getCoordsBounds(coords) {
  if (!Array.isArray(coords) || !coords.length) return null
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity
  for (const pt of coords) {
    const lng = Number(pt?.[0]), lat = Number(pt?.[1])
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue
    if (lng < minLng) minLng = lng
    if (lng > maxLng) maxLng = lng
    if (lat < minLat) minLat = lat
    if (lat > maxLat) maxLat = lat
  }
  if (!Number.isFinite(minLng)) return null
  return [[minLng, minLat], [maxLng, maxLat]]
}

/** 计算 zoom=REF 时图标应显示的 size（倍数），使图标 ≈ 场区 bbox 短边的 fillRatio */
export function calcIconSizeAtRef(bounds, iconNaturalWidth, fillRatio = 0.85, refZoom = AREA_CENTER_REF_ZOOM) {
  if (!bounds || !iconNaturalWidth) return 0.4
  const [[minLng, minLat], [maxLng, maxLat]] = bounds
  const worldPx = 256 * Math.pow(2, refZoom)
  const lngPx = Math.abs(maxLng - minLng) / 360 * worldPx
  const yMin = Math.log(Math.tan(Math.PI / 4 + minLat * Math.PI / 360))
  const yMax = Math.log(Math.tan(Math.PI / 4 + maxLat * Math.PI / 360))
  const latPx = Math.abs(yMax - yMin) / (2 * Math.PI) * worldPx
  const targetPx = Math.max(0, Math.min(lngPx, latPx)) * ICON_SIZE
  if (!targetPx) return 0.4
  const size = 50
  return Math.max(0.01, Math.min(size, 100))
}

/** 生成随 zoom 指数缩放的 icon-size 表达式，读 feature 上的 sizeProperty */
export function buildIconSizeExpression(sizeProperty = 'sizeAtRef', refZoom = AREA_CENTER_REF_ZOOM) {
  const scale = Math.pow(2, refZoom)
  return [
    'interpolate', ['exponential', 2], ['zoom'],
    0, ['*', ['get', sizeProperty], 1 / scale],
    refZoom, ['get', sizeProperty],
  ]
}