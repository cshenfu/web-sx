// src/views/dashboard/shared/geoUtils.js

export function cloneValue(value) {
    return value === undefined || value === null
      ? value
      : JSON.parse(JSON.stringify(value))
  }
  
  export function centroidOfFeature(feature) {
    const { geometry } = feature || {}
    if (!geometry) return null
  
    let rings = []
    if (geometry.type === 'Polygon') {
      rings = geometry.coordinates?.[0] || []
    } else if (geometry.type === 'MultiPolygon') {
      rings = geometry.coordinates?.[0]?.[0] || []
    } else {
      return null
    }
    if (!rings.length) return null
  
    const totals = rings.reduce(
      (result, [lng, lat]) => ({ lng: result.lng + lng, lat: result.lat + lat }),
      { lng: 0, lat: 0 }
    )
    return [totals.lng / rings.length, totals.lat / rings.length]
  }
  
  export function computeBBox(features) {
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
  
    const extend = (lng, lat) => {
      if (lng < minX) minX = lng
      if (lng > maxX) maxX = lng
      if (lat < minY) minY = lat
      if (lat > maxY) maxY = lat
    }
  
    features.forEach((feature) => {
      const { geometry } = feature
      if (!geometry) return
      if (geometry.type === 'Polygon') {
        geometry.coordinates.forEach((ring) => ring.forEach(([lng, lat]) => extend(lng, lat)))
      } else if (geometry.type === 'MultiPolygon') {
        geometry.coordinates.forEach((polygon) =>
          polygon.forEach((ring) => ring.forEach(([lng, lat]) => extend(lng, lat)))
        )
      }
    })
  
    if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) {
      return null
    }
    return [minX, minY, maxX, maxY]
  }
  
  export function getFeatureGuid(feature) {
    return feature?.properties?.guid || feature?.id || ''
  }
  
  export function getFeatureAreaName(feature) {
    const properties = feature?.properties || {}
    return properties.name || properties.layerName || '未命名区域'
  }