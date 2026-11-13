// src/views/dashboard/shared/mapConfig.js
import shaanxiBoundary from '@/assets/geojson/shanxi.json'
import { SX_OVERLAY_ANCHOR_ID } from '@/components/site-map/sxLayerConfig'

export { SX_OVERLAY_ANCHOR_ID }

// 在环境变量中配置 VITE_TIANDITU_TK
const tiandituKey = import.meta.env.VITE_TIANDITU_TK

const tiandituImageTileTemplate =
  `https://t5.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=429657aadca28e2e467243852a0b388d`

export const emptyBaseStyle = {
  version: 8,

  sources: {
    // 永驻全球低清底图：只请求并放大 z0 全球瓦片
    'sx-world-preview-src': {
      type: 'raster',
      tiles: [tiandituImageTileTemplate],
      tileSize: 256,
      minzoom: 3,
      maxzoom: 3,
      attribution: '天地图',
    },

    // 正常分辨率的卫星影像
    'sx-base-imagery-src': {
      type: 'raster',
      tiles: [tiandituImageTileTemplate],
      tileSize: 256,
      minzoom: 0,
      maxzoom: 18,
      attribution: '天地图',
    },

    'sx-overlay-anchor-src': {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
    },
  },

  layers: [
    {
      id: 'sx-background',
      type: 'background',
      paint: {
        'background-color': '#0a2540',
      },
    },
    {
  id: 'sx-world-preview-layer',
  type: 'raster',
  source: 'sx-world-preview-src',
  layout: { visibility: 'none' },          // ★ 加这行
  paint: { 'raster-resampling': 'linear' },
},
    {
      id: 'sx-base-imagery-layer',
      type: 'raster',
      source: 'sx-base-imagery-src',
       layout: { visibility: 'none' },  
      paint: {
        'raster-resampling': 'linear',
        'raster-fade-duration': 200,
      },
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
export const AREA_ZOOM_THRESHOLD = 7
export const PROVINCE_EXTRUSION_ID = 'shaanxi-extrusion'
export const UPDATED_BY = 'admin'