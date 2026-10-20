// js/parseCoordinateFile.js
// 在你现成的 parseKml / parseKmz / parseXlsx / autoParseFile 基础上，
// 统一转换成场区范围 / 风机点位需要的 { lng, lat } 数组。
//
// ⚠️ 请把下面这行 import 路径改成你实际存放解析函数的路径
import { parseKml, parseKmz, parseXlsx } from '@/utils/parseCoordinate'

// 假设：ovkml 是天地图/自研格式的 kml 变种，结构与标准 kml 一致，
// 复用 parseKml 的 DOM 解析逻辑即可。如果实际格式不同，请单独实现 parseOvkml。
async function parseOvkml(file) {
  return parseKml(file)
}

function getExt(file) {
  return file.name.split('.').pop().toLowerCase()
}

// xlsx 表头做模糊匹配：兼容中文/英文列名
const LNG_KEYS = ['经度', 'lng', 'longitude', 'lon']
const LAT_KEYS = ['纬度', 'lat', 'latitude']
const ALT_KEYS = ['是否备选', 'isAlternative', '备选']

function matchKey(headers, candidates) {
  const lowerHeaders = headers.map((h) => String(h).trim().toLowerCase())
  for (const candidate of candidates) {
    const idx = lowerHeaders.indexOf(candidate.toLowerCase())
    if (idx !== -1) return headers[idx]
  }
  return null
}

/**
 * 把 parseXlsx 返回的 rows 转成 [{lng, lat, isAlternative}]
 */
function xlsxRowsToPoints(xlsxResult) {
  const { headers, rows } = xlsxResult
  const lngKey = matchKey(headers, LNG_KEYS)
  const latKey = matchKey(headers, LAT_KEYS)
  const altKey = matchKey(headers, ALT_KEYS)

  if (!lngKey || !latKey) {
    throw new Error('xlsx 文件缺少经度/纬度列，请使用提供的模板')
  }

  return rows
    .map((row) => ({
      lng: Number(row[lngKey]),
      lat: Number(row[latKey]),
      isAlternative: altKey ? (Number(row[altKey]) ? 1 : 0) : 0
    }))
    .filter((p) => !isNaN(p.lng) && !isNaN(p.lat))
}

/**
 * 从 kml/kmz 解析结果里取第一个多边形的外环坐标（场区范围用）
 */
function kmlResultToPolygonPoints(kmlResult) {
  const polygon = kmlResult.polygons?.[0]
  if (!polygon) {
    throw new Error('文件中未找到面（Polygon）数据，请检查场区范围文件')
  }
  return polygon.coordinates.map((c) => ({ lng: c.lng, lat: c.lat }))
}

/**
 * 从 kml/kmz 解析结果里取所有点（风机点位用）
 */
function kmlResultToPoints(kmlResult) {
  return (kmlResult.points || []).map((p) => ({
    lng: p.coordinates.lng,
    lat: p.coordinates.lat,
    isAlternative: 0
  }))
}

async function parseByExt(file) {
  const ext = getExt(file)
  if (ext === 'kml') return { ext, data: await parseKml(file) }
  if (ext === 'kmz') return { ext, data: await parseKmz(file) }
  if (ext === 'ovkml') return { ext, data: await parseOvkml(file) }
  if (ext === 'xlsx') return { ext, data: await parseXlsx(file) }
  throw new Error(`不支持的文件格式：.${ext}`)
}

/**
 * 解析“场区范围”上传文件，返回 [{lng, lat}] 多边形坐标点（按文件中原始顺序）
 * @param {File} file
 */
export async function parseSiteRangeFile(file) {
  const { ext, data } = await parseByExt(file)
  if (ext === 'xlsx') {
    return xlsxRowsToPoints(data).map(({ lng, lat }) => ({ lng, lat }))
  }
  return kmlResultToPolygonPoints(data)
}

/**
 * 解析“风机点位”上传文件，返回 [{lng, lat, isAlternative}]
 * @param {File} file
 */
export async function parseWindTurbineFile(file) {
  const { ext, data } = await parseByExt(file)
  if (ext === 'xlsx') {
    return xlsxRowsToPoints(data)
  }
  return kmlResultToPoints(data)
}


/**
 * 解析“升压站”上传文件，返回结构化结果，由调用方决定渲染成面还是点
 * 返回：
 *   { type: 'polygon', rings: number[][][] }  // 面
 *   { type: 'points',  points: {lng,lat}[] }   // 点
 */
export async function parseBoosterFile(file) {
  const { ext, data } = await parseByExt(file)

  if (ext === 'xlsx') {
    const pts = xlsxRowsToPoints(data)
    if (!pts.length) throw new Error('文件内无坐标数据')
    return { type: 'points', points: pts }
  }

  // kml / kmz / ovkml：优先面，其次点
  const polygons = data?.polygons || []
  if (polygons.length) {
    const ring = polygons[0].coordinates
      .map((c) => [Number(c.lng), Number(c.lat)])
      .filter(([lng, lat]) => Number.isFinite(lng) && Number.isFinite(lat))
    if (ring.length >= 3) return { type: 'polygon', rings: [ring] }
  }

  const pts = (data?.points || [])
    .map((p) => {
      const c = p?.coordinates ?? p
      const lng = Number(c?.lng ?? c?.longitude)
      const lat = Number(c?.lat ?? c?.latitude)
      return Number.isFinite(lng) && Number.isFinite(lat) ? { lng, lat } : null
    })
    .filter(Boolean)
  if (pts.length) return { type: 'points', points: pts }

  throw new Error('文件内无坐标数据')
}