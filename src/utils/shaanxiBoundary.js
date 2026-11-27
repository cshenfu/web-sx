// src/utils/shaanxiBoundary.js

const WFS_BASE =
  'https://gis.wh-ge.com/sx-map-service/prod/ows' +
  '?service=WFS&version=1.1.0&request=GetFeature' +
  '&typeName=prod:base_boundary&outputFormat=application/json'

// 模块级内存缓存：同一会话内只请求一次
let provincePromise = null
let citiesPromise = null
let countiesPromise = null

function buildUrl(cql) {
  return `${WFS_BASE}&CQL_FILTER=${encodeURIComponent(cql)}`
}

async function fetchGeoJSON(url, label) {
  if (label === 'counties') {
    console.info('[county] 开始请求陕西区县 WFS:', url)
  }
  const resp = await fetch(url)
  if (label === 'counties') {
    console.info('[county] WFS 响应状态:', resp.status, resp.ok)
  }
  if (!resp.ok) throw new Error(`[${label}] WFS HTTP ${resp.status}`)
  const geojson = await resp.json()
  if (label === 'counties') {
    const geometryTypes = [...new Set((geojson?.features || []).map((feature) => feature?.geometry?.type).filter(Boolean))]
    console.info('[county] WFS 数据解析完成:', {
      type: geojson?.type,
      featureCount: geojson?.features?.length || 0,
      geometryTypes,
    })
  }
  if (geojson?.type !== 'FeatureCollection' || !geojson.features?.length) {
    throw new Error(`[${label}] WFS 返回空或格式异常`)
  }
  return geojson
}

/** 陕西省省界（1 个 Feature） */
export function loadShaanxiProvince() {
  if (!provincePromise) {
    provincePromise = fetchGeoJSON(buildUrl("code='610000'"), 'province')
      .catch((err) => { provincePromise = null; throw err })
  }
  return provincePromise
}

/** 陕西全部市界（预期 10 个 Feature） */
export function loadShaanxiCities() {
  if (!citiesPromise) {
    citiesPromise = fetchGeoJSON(buildUrl("level='city'"), 'cities')
      .catch((err) => { citiesPromise = null; throw err })
  }
  return citiesPromise
}


/** 陕西全部县级行政区边界 */
export function loadShaanxiCounties() {
  if (!countiesPromise) {
    countiesPromise = fetchGeoJSON(buildUrl("level='county'"), 'counties')
      .catch((err) => { countiesPromise = null; throw err })
  }
  return countiesPromise
}

/** 按需：单个市界（比如只关心西安） */
export function loadCityByCode(code) {
  return fetchGeoJSON(buildUrl(`code='${code}'`), `city-${code}`)
}