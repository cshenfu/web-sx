// src/views/dashboard/shared/mapConfig.js
import shaanxiBoundary from '@/assets/geojson/shanxi.json'
import { SX_OVERLAY_ANCHOR_ID } from '@/components/site-map/sxLayerConfig'

export { SX_OVERLAY_ANCHOR_ID }

export const emptyBaseStyle = {
  version: 8,
  sources: {
    'sx-overlay-anchor-src': {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    },
    // ★ 可选兜底底图：低清卫星（不需要登录的 Esri 示例）
    'sx-base-fallback': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      minzoom: 0,
      maxzoom: 6,   // 只用来垫底，不要和高清瓦片抢
      attribution: 'Esri',
    },
  },
  layers: [
    // 兜底底图放最底（在 background 之上，anchors 之下）
    {
      id: 'sx-base-fallback-layer',
      type: 'raster',
      source: 'sx-base-fallback',
      paint: { 'raster-opacity': 1, 'raster-fade-duration': 300 },
    },
    {
      id: 'sx-background',
      type: 'background',
      paint: { 'background-color': '#0a2540' },
    },
    {
      id: SX_OVERLAY_ANCHOR_ID,
      type: 'line',
      source: 'sx-overlay-anchor-src',
    },
  ],
}

export const satelliteStyle = emptyBaseStyle

export { shaanxiBoundary }

export const AREA_SELECT_LAYER_KEY = 'avoidance-polygon'
export const AREA_ZOOM_THRESHOLD = 8
export const PROVINCE_EXTRUSION_ID = 'shaanxi-extrusion'
export const UPDATED_BY = 'admin'
