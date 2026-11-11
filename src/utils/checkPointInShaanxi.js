/**
 * 陕西省边界包含判断
 * 数据源: utils/shaanxiBoundary.js -> loadShaanxiProvince() (WFS)
 */
import { loadShaanxiProvince } from '@/utils/shaanxiBoundary'

let POLYGONS = null
let BBOXES = null
let loadPromise = null

function normalizePolygons(geojson) {
  const features =
    geojson.type === 'FeatureCollection'
      ? geojson.features
      : [geojson.type === 'Feature' ? geojson : { type: 'Feature', geometry: geojson }]

  const polygons = []
  for (const feature of features) {
    const geometry = feature?.geometry
    if (!geometry) continue
    if (geometry.type === 'Polygon') polygons.push(geometry.coordinates)
    else if (geometry.type === 'MultiPolygon') polygons.push(...geometry.coordinates)
  }
  return polygons
}

function bboxOf(polygon) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const [x, y] of polygon[0]) {
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }
  return [minX, minY, maxX, maxY]
}

function pointInRing(lng, lat, ring) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1]
    const xj = ring[j][0], yj = ring[j][1]
    const intersect =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

function looksLikeLngLat(polygons) {
  const first = polygons[0]?.[0]?.[0]
  if (!first) return false
  const [x, y] = first
  return Math.abs(x) <= 180 && Math.abs(y) <= 90
}

// ============ 调试打印 ============
const TAG = '[shaanxi-boundary]'

function debugLogRaw(geojson) {
  console.group(`${TAG} ① WFS 原始返回`)
  console.log('type:', geojson?.type)
  console.log('features.length:', geojson?.features?.length)

  const feature = geojson?.features?.[0]
  if (!feature) {
    console.warn('features 为空!')
    console.groupEnd()
    return
  }

  console.log('feature.properties:', feature.properties)
  console.log('feature.geometry.type:', feature.geometry?.type)

  const gtype = feature.geometry?.type
  if (gtype === 'Polygon') {
    console.log('外环点数:', feature.geometry.coordinates[0]?.length)
    console.log('外环前 3 个点:', feature.geometry.coordinates[0]?.slice(0, 3))
    console.log('外环后 3 个点:', feature.geometry.coordinates[0]?.slice(-3))
  } else if (gtype === 'MultiPolygon') {
    console.log('子多边形个数:', feature.geometry.coordinates.length)
    feature.geometry.coordinates.forEach((poly, i) => {
      console.log(`  [poly ${i}] 外环点数:`, poly[0]?.length)
      console.log(`  [poly ${i}] 外环前 3 点:`, poly[0]?.slice(0, 3))
      console.log(`  [poly ${i}] 外环后 3 点:`, poly[0]?.slice(-3))
    })
  }

  // 首点坐标范围检测
  const firstPoint =
    gtype === 'Polygon'
      ? feature.geometry.coordinates[0]?.[0]
      : feature.geometry.coordinates?.[0]?.[0]?.[0]

  console.log('首点坐标:', firstPoint)

  if (Array.isArray(firstPoint)) {
    const [x, y] = firstPoint
    if (Math.abs(x) <= 180 && Math.abs(y) <= 90) {
      console.log('✅ 坐标系判断: 经纬度 (WGS84/4326)，可直接使用')
    } else {
      console.warn(
        '❌ 坐标系判断: 疑似投影坐标! x=' + x + ', y=' + y +
        ' → 请在 WFS URL 加 &srsName=EPSG:4326',
      )
    }
  }

  console.groupEnd()
}

function debugLogNormalized(polygons, bboxes) {
  console.group(`${TAG} ② 归一化结果`)
  console.log('多边形总数:', polygons.length)

  polygons.forEach((poly, i) => {
    const [outer, ...holes] = poly
    console.log(
      `[poly ${i}] 外环点数: ${outer.length}, 内环(洞)数: ${holes.length}, bbox:`,
      bboxes[i],
    )
  })

  console.groupEnd()
}

function debugLogSampleChecks() {
  console.group(`${TAG} ③ 抽样点判断`)

  const samples = [
    { name: '西安钟楼',    lng: 108.9423, lat: 34.2610, expect: true  },
    { name: '北京天安门',  lng: 116.3975, lat: 39.9087, expect: false },
    { name: '陕西最北(府谷)', lng: 111.07,  lat: 39.58,  expect: true  },
    { name: '陕西最南(镇坪)', lng: 109.55,  lat: 31.75,  expect: true  },
    { name: '陕西最东(府谷)', lng: 111.24,  lat: 39.35,  expect: true  },
    { name: '陕西最西(略阳)', lng: 105.85,  lat: 33.35,  expect: true  },
  ]

  let pass = 0
  samples.forEach((s) => {
    const result = isInShaanxi(s.lng, s.lat)
    const ok = result === s.expect
    if (ok) pass++
    console.log(
      `${ok ? '✅' : '❌'} ${s.name} [${s.lng}, ${s.lat}] →`,
      result, `(预期 ${s.expect})`,
    )
  })

  console.log(`抽样通过: ${pass}/${samples.length}`)
  console.groupEnd()
}
// ============ 调试打印 end ============


export function preloadShaanxiBoundary() {
  if (loadPromise) return loadPromise

  loadPromise = loadShaanxiProvince()
    .then((geojson) => {
      // ① 先看原始返回
      debugLogRaw(geojson)

      const polygons = normalizePolygons(geojson)
      if (!polygons.length) {
        throw new Error('省界数据为空')
      }
      if (!looksLikeLngLat(polygons)) {
        throw new Error(
          '省界坐标疑似投影坐标，请在 WFS URL 加 srsName=EPSG:4326',
        )
      }

      POLYGONS = polygons
      BBOXES = POLYGONS.map(bboxOf)

      // ② 归一化结果
      debugLogNormalized(POLYGONS, BBOXES)

      // ③ 抽样验证（关键：能一眼看出边界判断对不对）
      debugLogSampleChecks()

      return true
    })
    .catch((err) => {
      loadPromise = null
      console.error(`${TAG} 加载失败:`, err)
      throw err
    })

  return loadPromise
}

export function isBoundaryReady() {
  return POLYGONS !== null
}

export function isInShaanxi(lng, lat) {
  const x = Number(lng)
  const y = Number(lat)
  if (!Number.isFinite(x) || !Number.isFinite(y)) return false
  if (!POLYGONS) return false

  for (let i = 0; i < POLYGONS.length; i++) {
    const [minX, minY, maxX, maxY] = BBOXES[i]
    if (x < minX || x > maxX || y < minY || y > maxY) continue

    const [outerRing, ...holes] = POLYGONS[i]
    if (!pointInRing(x, y, outerRing)) continue
    if (holes.some((hole) => pointInRing(x, y, hole))) continue

    return true
  }
  return false
}