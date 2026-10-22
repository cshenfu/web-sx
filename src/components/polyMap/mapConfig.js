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
  },
  layers: [
    {
      id: 'sx-background',
      type: 'background',
      paint: { 'background-color': '#0b1e3a' },
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
