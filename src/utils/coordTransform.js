// utils/coordTransform.js
// 坐标类型识别 + CGCS2000 3度带投影 → 经纬度 自动转换
//
// 规则（与模板文档一致）：
//   - X/Y 在经纬度范围内          → 视为地理坐标，原样返回
//   - X 为 8 位带号坐标（38xxxxxx）→ 视为 CGCS2000 3度带投影，自动转经纬度
//   - X 为 6 位无带号坐标          → 按模板要求拒绝，抛出明确错误

import proj4 from 'proj4'

// CGCS2000 地理坐标系
proj4.defs('EPSG:4490', '+proj=longlat +ellps=GRS80 +no_defs +type=crs')

// 动态注册 CGCS2000 3度带 zone
// 中央经线 = zone * 3；假东 = zone * 1_000_000 + 500_000
function getCgcs2000ZoneProj(zone) {
  const name = `CGCS2000-ZONE-${zone}`
  const centralMeridian = zone * 3
  const falseEasting = zone * 1_000_000 + 500_000
  proj4.defs(
    name,
    `+proj=tmerc +lat_0=0 +lon_0=${centralMeridian} +k=1 ` +
    `+x_0=${falseEasting} +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs`
  )
  return name
}

/**
 * 判断 (x, y) 是否为投影坐标
 * 经纬度范围：|x| <= 180，|y| <= 90；超出即为投影
 */
export function isProjectedCoord(x, y) {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return false
  if (Math.abs(x) > 180 || Math.abs(y) > 90) return true
  // 两个值都 > 90（中国经纬度经度约 73~135、纬度约 16~53，不会同时 > 90）
  if (Math.abs(x) > 90 && Math.abs(y) > 90) return true
  return false
}

/**
 * 单个投影点 → { lng, lat }
 * @param {number} x 东向（带号形式 8 位）
 * @param {number} y 北向
 */
export function projectToLngLat(x, y) {
  const absX = Math.abs(x)

  // 8 位带号坐标：38xxxxxx.xxx
  if (absX >= 10_000_000 && absX < 100_000_000) {
    const zone = Math.floor(absX / 1_000_000) // 38501606 → 38
    if (zone < 25 || zone > 45) {
      throw new Error(
        `X 坐标 "${x}" 带号 ${zone} 超出中国 CGCS2000 3度带范围（25~45），请检查数据`
      )
    }
    const proj = getCgcs2000ZoneProj(zone)
    const [lng, lat] = proj4(proj, 'EPSG:4490', [Number(x), Number(y)])
    return { lng, lat, zone }
  }

  // 6 位（或 5 位）无带号坐标：按模板要求拒绝
  if (absX >= 10_000 && absX < 10_000_000) {
    const digits = Math.floor(Math.log10(absX)) + 1
    throw new Error(
      `X 坐标 "${x}" 为 ${digits} 位，缺少带号。` +
      `模板要求 X 为 8 位带号坐标（如 38501606.934），请补充带号后重试。`
    )
  }

  throw new Error(`X 坐标 "${x}" 无法识别，请检查数据格式`)
}

/**
 * 一组点 → 统一为 { lng, lat }
 * - 类型判定：取第一个有效点
 * - 投影坐标整组转换；经纬度整组原样
 * - 单点失败即抛错（不静默丢点，避免用户拿半成品）
 */
export function normalizeCoords(points, { fieldName = '坐标' } = {}) {
  if (!Array.isArray(points) || !points.length) return points

  const first = points[0]
  const x0 = Number(first.lng ?? first.longitude)
  const y0 = Number(first.lat ?? first.latitude)

  if (!isProjectedCoord(x0, y0)) {
    return points.map((p) => ({
      ...p,
      lng: Number(p.lng ?? p.longitude),
      lat: Number(p.lat ?? p.latitude),
    }))
  }

  const result = []
  const errors = []
  for (let i = 0; i < points.length; i++) {
    const p = points[i]
    const x = Number(p.lng ?? p.longitude)
    const y = Number(p.lat ?? p.latitude)
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue
    try {
      const { lng, lat } = projectToLngLat(x, y)
      result.push({ ...p, lng, lat })
    } catch (err) {
      errors.push(`第 ${i + 1} 个点：${err.message}`)
    }
  }

  if (errors.length) {
    throw new Error(`${fieldName}坐标转换失败：\n${errors.join('\n')}`)
  }
  return result
}