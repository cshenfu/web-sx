// src/views/dashboard/shared/mapConfig.js
import shaanxiBoundary from '@/assets/geojson/shanxi.json'

export const mapTilerKey = import.meta.env.VITE_MAPTILER_KEY || 'HsnG823RN0nfHHfNnNGp'
export const satelliteStyle = `https://api.maptiler.com/maps/satellite/style.json?key=${mapTilerKey}`

export { shaanxiBoundary }

export const AREA_SELECT_LAYER_KEY = 'avoidance-polygon'
export const AREA_ZOOM_THRESHOLD = 8
export const PROVINCE_EXTRUSION_ID = 'shaanxi-extrusion'
export const UPDATED_BY = 'admin'