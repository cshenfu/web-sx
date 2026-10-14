// src/views/dashboard/shared/mapConfig.js
import shaanxiBoundary from '@/assets/geojson/shanxi.json'

// ────────────────────────────────────────────────
// 天地图底图（替代 MapTiler）
// ────────────────────────────────────────────────
const TIANDITU_KEY = import.meta.env.VITE_TIANDITU_KEY || '429657aadca28e2e467243852a0b388d'

// 天地图官方 8 个子域名
const TDT_SUBDOMAINS = ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7']

function buildTdtTiles(type) {
  return TDT_SUBDOMAINS.map(
    (sub) =>
      `https://${sub}.tianditu.gov.cn/DataServer?T=${type}&x={x}&y={y}&l={z}&tk=${TIANDITU_KEY}`
  )
}

export const satelliteStyle = {
  version: 8,
  sources: {
    // 卫星影像底图（Web Mercator）
    'tdt-satellite': {
      type: 'raster',
      tiles: buildTdtTiles('img_w'),
      tileSize: 256,
      minzoom: 1,
      maxzoom: 18,
      attribution: '© 天地图'
    },
    // 中文注记（地名、道路）
    'tdt-annotation': {
      type: 'raster',
      tiles: buildTdtTiles('cia_w'),
      tileSize: 256,
      minzoom: 1,
      maxzoom: 18
    }
  },
  layers: [
    {
      id: 'tdt-satellite-layer',
      type: 'raster',
      source: 'tdt-satellite',
      minzoom: 0,
      maxzoom: 18
    },
    {
      id: 'tdt-annotation-layer',
      type: 'raster',
      source: 'tdt-annotation',
      minzoom: 0,
      maxzoom: 18
    }
  ]
}

// ────────────────────────────────────────────────
// 以下常量保持原样
// ────────────────────────────────────────────────
export { shaanxiBoundary }

export const AREA_SELECT_LAYER_KEY = 'avoidance-polygon'
export const AREA_ZOOM_THRESHOLD = 8
export const PROVINCE_EXTRUSION_ID = 'shaanxi-extrusion'
export const UPDATED_BY = 'admin'