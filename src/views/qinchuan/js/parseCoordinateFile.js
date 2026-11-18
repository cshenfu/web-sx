// js/parseCoordinateFile.js
//
// 坐标文件统一入口：把 KML / KMZ / OVKML / XLSX / JSON 解析成
// 场区范围 / 风机点位 / 升压站 三类业务需要的结构。
//
// 依赖 @/utils/parseCoordinate 导出的 parseKml / parseKmz / parseXlsx
// （可选 parseOvkml / parseJson）；本文件对它们的返回结构做了兼容适配。

import * as coord from '@/utils/parseCoordinate'
import { normalizeCoords } from '@/utils/coordTransform'
const parseKmlImpl  = coord.parseKml
const parseKmzImpl  = coord.parseKmz
const parseXlsxImpl = coord.parseXlsx
// OVKML / JSON 属于可选解析能力；使用动态读取，避免 Rollup 对尚未实现的可选导出产生构建警告。
const parseOvkmlImpl = Reflect.get(coord, 'parseOvkml') || parseKmlImpl
const parseJsonImpl = Reflect.get(coord, 'parseJson')

/* ==================== 基础工具 ==================== */

function getExt(file) {
  const name = file?.name || ''
  if (!name) {
    const type = file?.type || ''
    if (/kml/i.test(type)) return 'kml'
    if (/kmz|zip/i.test(type)) return 'kmz'
    if (/spreadsheet|excel/i.test(type)) return 'xlsx'
    if (/json/i.test(type)) return 'json'
    throw new Error('无法判断文件格式，请检查文件名后缀')
  }
  const i = name.lastIndexOf('.')
  if (i < 0) throw new Error('文件缺少扩展名，无法判断格式')
  return name.slice(i + 1).toLowerCase()
}

function toNum(v) {
  if (v === null || v === undefined) return null
  if (typeof v === 'number') return Number.isFinite(v) ? v : null
  const s = String(v).trim()
  if (s === '') return null
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

/* ==================== KML 结果归一化 ==================== */

function normalizePoint(p) {
  if (!p) return null
  const c = p.coordinates ?? p
  const lng = toNum(c?.lng ?? c?.longitude)
  const lat = toNum(c?.lat ?? c?.latitude)
  if (lng === null || lat === null) return null
  return { name: p.name || '', coordinates: { lng, lat } }
}

function normalizePoints(list) {
  if (!Array.isArray(list)) return []
  return list.map(normalizePoint).filter(Boolean)
}

function normalizeRingFromObjects(ring) {
  if (!Array.isArray(ring)) return null
  const coords = ring
    .map((item) => {
      if (!item) return null
      const lng = toNum(item.lng ?? item.longitude)
      const lat = toNum(item.lat ?? item.latitude)
      return lng !== null && lat !== null ? { lng, lat } : null
    })
    .filter(Boolean)
  return coords.length >= 3 ? coords : null
}

function normalizePolygon(poly) {
  if (!poly) return null
  const coordinates = normalizeRingFromObjects(poly.coordinates)
  if (!coordinates) return null
  const holes = Array.isArray(poly.holes)
    ? poly.holes.map(normalizeRingFromObjects).filter(Boolean)
    : []
  return { name: poly.name || '', coordinates, holes }
}

function normalizePolygons(list) {
  if (!Array.isArray(list)) return []
  return list.map(normalizePolygon).filter(Boolean)
}

function normalizeLine(line) {
  if (!line || !Array.isArray(line.coordinates)) return null
  const coordinates = line.coordinates
    .map((item) => {
      const lng = toNum(item?.lng ?? item?.longitude ?? item?.[0])
      const lat = toNum(item?.lat ?? item?.latitude ?? item?.[1])
      return lng !== null && lat !== null ? { lng, lat } : null
    })
    .filter(Boolean)
  return coordinates.length >= 2 ? { name: line.name || '', coordinates } : null
}

function normalizeLines(list) {
  if (!Array.isArray(list)) return []
  return list.map(normalizeLine).filter(Boolean)
}

// formatKMLFileEvent 输出兜底适配
//   pointData:   [{ longitude, latitude }]      字符串 [lng,lat]
//   polygonData: [[[lat, lng], ...]]            字符串 [lat,lng] ⚠️ 反的
function normalizeFromFormatKmlEvent(raw) {
  const points = (raw.pointData || [])
    .map((p) => {
      const lng = toNum(p?.longitude ?? p?.lng)
      const lat = toNum(p?.latitude ?? p?.lat)
      return lng !== null && lat !== null ? { name: '', coordinates: { lng, lat } } : null
    })
    .filter(Boolean)

  const polygons = (raw.polygonData || [])
    .map((ring) => {
      if (!Array.isArray(ring)) return null
      const coordinates = ring
        .map((pair) => {
          if (!Array.isArray(pair) || pair.length < 2) return null
          // formatKMLFileEvent 的 polygonData 是 [lat, lng]，翻回 [lng, lat]
          const lng = toNum(pair[1])
          const lat = toNum(pair[0])
          return lng !== null && lat !== null ? { lng, lat } : null
        })
        .filter(Boolean)
      return coordinates.length >= 3 ? { name: '', coordinates, holes: [] } : null
    })
    .filter(Boolean)

  return { points, polygons, lines: [] }
}

function normalizeKmlResult(raw) {
  if (!raw || typeof raw !== 'object') return { points: [], polygons: [], lines: [] }
  // 老链路：formatKMLFileEvent 直接当 parseKml 用
  if (
    Array.isArray(raw.pointData) ||
    Array.isArray(raw.polygonData) ||
    Array.isArray(raw.lineData)
  ) {
    return normalizeFromFormatKmlEvent(raw)
  }
  // 标准链路：parseKml 输出 { points, polygons, lines }
  return {
    points: normalizePoints(raw.points),
    polygons: normalizePolygons(raw.polygons),
    lines: normalizeLines(raw.lines),
  }
}

/* ==================== xlsx 表头匹配 ==================== */

const LNG_ALIASES = [
  '经度', '经度/x', '经度x', '经度(°)', '经度（度）',
  'lng', 'lon', 'longitude', 'x', '东经', '位置经度', 'x坐标',
]
const LAT_ALIASES = [
  '纬度', '纬度/y', '纬度y', '纬度(°)', '纬度（度）',
  'lat', 'latitude', 'y', '北纬', '位置纬度', 'y坐标',
]
const ALT_ALIASES = [
  '是否备选', '备选', 'isalternative', 'alternate', 'reserve', '是否备用',
]

function normalizeHeader(h) {
  return String(h ?? '').trim().toLowerCase().replace(/\s+/g, '')
}

function stripUnit(h) {
  return String(h ?? '').replace(/[\(（].*?[\)）]/g, '').trim()
}

function matchKey(headers, candidates) {
  if (!Array.isArray(headers) || !headers.length) return null
  const norm = headers.map((h) => normalizeHeader(stripUnit(h)))
  const alias = candidates.map(normalizeHeader)

  // 1. 精确匹配
  for (let i = 0; i < norm.length; i++) {
    if (norm[i] && alias.includes(norm[i])) return headers[i]
  }
  // 2. 前后缀匹配（alias 长度 >= 2，避免 'x'/'y' 误匹配）
  for (let i = 0; i < norm.length; i++) {
    const h = norm[i]
    if (!h) continue
    if (alias.some((a) => a.length >= 2 && (h.startsWith(a) || h.endsWith(a)))) {
      return headers[i]
    }
  }
  // 3. 包含匹配（兜底）
  for (let i = 0; i < norm.length; i++) {
    const h = norm[i]
    if (!h) continue
    if (alias.some((a) => a.length >= 2 && h.includes(a))) return headers[i]
  }
  return null
}

function xlsxRowsToPoints(xlsxResult) {
  const { headers, rows, lngKey, latKey, altKey } = xlsxResult || {}
  // 兼容 parseXlsx 返回 lngKey/latKey（新版）和不返回（老版）
  const lngK = lngKey || matchKey(headers || [], LNG_ALIASES)
  const latK = latKey || matchKey(headers || [], LAT_ALIASES)
  const altK = altKey || matchKey(headers || [], ALT_ALIASES)

  if (!lngK || !latK) {
    throw new Error('xlsx 文件缺少经度/纬度列，请使用提供的模板')
  }

  return (rows || [])
    .map((row) => {
      const lng = toNum(row?.[lngK])
      const lat = toNum(row?.[latK])
      if (lng === null || lat === null) return null
      return {
        lng,
        lat,
        isAlternative: altK ? (toNum(row?.[altK]) ? 1 : 0) : 0,
      }
    })
    .filter(Boolean)
}

/* ==================== 按扩展名分派 ==================== */

async function parseByExt(file) {
  const ext = getExt(file)
  if (ext === 'kml') {
    if (typeof parseKmlImpl !== 'function') throw new Error('parseKml 未导出')
    return { ext, data: await parseKmlImpl(file) }
  }
  if (ext === 'kmz') {
    if (typeof parseKmzImpl !== 'function') throw new Error('parseKmz 未导出')
    return { ext, data: await parseKmzImpl(file) }
  }
  if (ext === 'ovkml') {
    if (typeof parseOvkmlImpl !== 'function') throw new Error('当前不支持 OVKML')
    return { ext, data: await parseOvkmlImpl(file) }
  }
  if (ext === 'json') {
    if (typeof parseJsonImpl !== 'function') throw new Error('当前不支持 JSON 格式')
    return { ext, data: await parseJsonImpl(file) }
  }
  if (ext === 'xlsx') {
    if (typeof parseXlsxImpl !== 'function') throw new Error('parseXlsx 未导出')
    return { ext, data: await parseXlsxImpl(file) }
  }
  throw new Error(`不支持的文件格式：.${ext}`)
}

/* ==================== 业务解析入口 ==================== */

/**
 * 场区范围：返回 [{ lng, lat }]
 */
export async function parseSiteRangeFile(file) {
  const { ext, data } = await parseByExt(file)

  let pts
  if (ext === 'xlsx') {
    pts = xlsxRowsToPoints(data).map(({ lng, lat }) => ({ lng, lat }))
  } else {
    const { polygons } = normalizeKmlResult(data)
    if (!polygons.length) {
      throw new Error('文件中未找到面（Polygon/闭环 LineString）数据，请检查场区范围文件')
    }
    if (polygons.length > 1) console.warn(`[场区] 文件含 ${polygons.length} 个面，取第一个`)
    pts = polygons[0].coordinates.map((c) => ({ lng: c.lng, lat: c.lat }))
  }

  // ✅ 统一坐标类型
  const normalized = normalizeCoords(pts, { fieldName: '场区范围' })

  if (normalized.length < 3) {
    throw new Error('场区范围坐标点不足 3 个，无法构成多边形')
  }
  return normalized
}

/**
 * 风机点位：返回 [{ lng, lat, isAlternative }]
 */
export async function parseWindTurbineFile(file) {
  const { ext, data } = await parseByExt(file)

  let pts
  if (ext === 'xlsx') {
    pts = xlsxRowsToPoints(data)
  } else {
    const { points } = normalizeKmlResult(data)
    pts = points.map((p) => ({
      lng: p.coordinates.lng,
      lat: p.coordinates.lat,
      isAlternative: 0,
    }))
  }

  // 👇 诊断 log
  console.log('[风机] 转换前', ext, pts.slice(0, 2))
  const result = normalizeCoords(pts, { fieldName: '风机点位' })
  console.log('[风机] 转换后', result.slice(0, 2))

  return result
}

/**
 * 升压站：返回
 *   { type: 'polygon', rings: [[[lng,lat], ...]] }
 *   { type: 'points',  points: [{lng,lat}] }
 */
export async function parseBoosterFile(file) {
  const { ext, data } = await parseByExt(file)

  if (ext === 'xlsx') {
    const pts = normalizeCoords(xlsxRowsToPoints(data), { fieldName: '升压站' })
    if (!pts.length) throw new Error('文件内无坐标数据')
    return { type: 'points', points: pts }
  }

  const { polygons, points } = normalizeKmlResult(data)

  if (polygons.length) {
    const rawRing = polygons[0].coordinates.map((c) => ({ lng: c.lng, lat: c.lat }))
    // ✅ 环也要统一坐标类型
    const ring = normalizeCoords(rawRing, { fieldName: '升压站范围' })
      .map((c) => [c.lng, c.lat])
    if (ring.length >= 3) return { type: 'polygon', rings: [ring] }
  }

  const pts = normalizeCoords(
    points.map((p) => ({ lng: p.coordinates.lng, lat: p.coordinates.lat })),
    { fieldName: '升压站' }
  )
  if (pts.length) return { type: 'points', points: pts }

  throw new Error('文件内无坐标数据')
}