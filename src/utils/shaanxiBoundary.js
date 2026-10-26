// src/utils/shaanxiBoundary.js

const WFS_BASE =
  'https://gis.wh-ge.com/sx-map-service/prod/ows' +
  '?service=WFS&version=1.1.0&request=GetFeature' +
  '&typeName=prod:base_boundary&outputFormat=application/json'

// 模块级内存缓存：同一会话内只请求一次
let provincePromise = null
let citiesPromise = null

function buildUrl(cql) {
  return `${WFS_BASE}&CQL_FILTER=${encodeURIComponent(cql)}`
}

async function fetchGeoJSON(url, label) {
  const resp = await fetch(url)
  if (!resp.ok) throw new Error(`[${label}] WFS HTTP ${resp.status}`)
  const geojson = await resp.json()
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

/** 按需：单个市界（比如只关心西安） */
export function loadCityByCode(code) {
  return fetchGeoJSON(buildUrl(`code='${code}'`), `city-${code}`)
}