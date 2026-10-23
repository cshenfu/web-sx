// src/components/site-map/iconSize.js
const MPP_AT_Z0 = 156543.03392 // Web Mercator zoom 0 赤道每像素米数

/**
 * 图标代表固定世界高度（米），屏幕像素随 zoom 按 2^z 增大。
 * 返回 MapLibre 可直接使用的 icon-size 表达式。
 */
export function buildIconSizeByWorldHeight({
  worldHeight = 500,       // 图标代表的世界高度（米）
  latitude = 35,           // 参考纬度（陕西省约 35°）
  imagePixelHeight = 100,  // 图标 PNG 原始像素高度
  zoomRange = [4, 20],
  minPx = 10,              // 太小看不见时兜底
  maxPx = 140,             // 太大遮挡地图时兜底
} = {}) {
  const cosLat = Math.cos((latitude * Math.PI) / 180)
  const rawPx = (z) => worldHeight / (MPP_AT_Z0 * cosLat / Math.pow(2, z))
  const sizeAt = (z) => Math.max(minPx, Math.min(maxPx, rawPx(z))) / imagePixelHeight

  // 每 1 级 zoom 一个控制点，保证钳制后过渡自然
  const points = []
  for (let z = zoomRange[0]; z <= zoomRange[1]; z += 1) points.push(z, sizeAt(z))
  return ['interpolate', ['exponential', 2], ['zoom'], ...points]
}

// ============ 两个页面共用的预设 ============
// ⚠️ 按你项目里 fengji.png / syz.png 的真实像素高度改这里
const IMAGE_H = 100

export const ICON_SIZE_WIND = buildIconSizeByWorldHeight({
  worldHeight: 700,
  imagePixelHeight: IMAGE_H,
  zoomRange: [4, 20],
  minPx: 10,
  maxPx: 140,
})

export const ICON_SIZE_BOOSTER = buildIconSizeByWorldHeight({
  worldHeight: 1900,
  imagePixelHeight: IMAGE_H,
  zoomRange: [4, 20],
  minPx: 10,
  maxPx: 500,
})