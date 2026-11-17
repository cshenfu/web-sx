/**
 * 项目地图 GeoJSON 构建工具。
 *
 * 只处理项目数据到地图坐标/GeoJSON 的转换，不依赖 Vue 或地图实例，
 * Overview 与 SiteMapPage 共用，避免两套页面出现数据转换差异。
 */

export function getProjectCoords(project) {
  return (project?.coordinate || [])
    .map((coordinate) => [Number(coordinate.longitude), Number(coordinate.latitude)])
    .filter(([lng, lat]) => Number.isFinite(lng) && Number.isFinite(lat))
}

export function getProjectCentroid(project) {
  let coords = getProjectCoords(project)
  if (coords.length >= 2) {
    const [firstLng, firstLat] = coords[0]
    const [lastLng, lastLat] = coords[coords.length - 1]
    if (firstLng === lastLng && firstLat === lastLat) coords = coords.slice(0, -1)
  }
  if (!coords.length) return null

  let sumLng = 0
  let sumLat = 0
  for (const [lng, lat] of coords) {
    sumLng += lng
    sumLat += lat
  }
  return [sumLng / coords.length, sumLat / coords.length]
}

export function buildWindFC(project) {
  const normal = []
  const reserve = []

  for (const [index, point] of (project?.windTurbinePoints || []).entries()) {
    const lng = Number(point.longitude)
    const lat = Number(point.latitude)
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue

    const isReserve = Number(point.isReserve) === 1
    const feature = {
      type: 'Feature',
      properties: { projectId: project.id, index, isReserve: isReserve ? 1 : 0 },
      geometry: { type: 'Point', coordinates: [lng, lat] },
    }
    ;(isReserve ? reserve : normal).push(feature)
  }

  return {
    normal: { type: 'FeatureCollection', features: normal },
    reserve: { type: 'FeatureCollection', features: reserve },
  }
}

export function buildBoosterFC(project) {
  return {
    type: 'FeatureCollection',
    features: (project?.boosterStationLocations || [])
      .map((point, index) => {
        if (!(point.isBest === true || Number(point.isBest) === 1)) return null
        const lng = Number(point.lng)
        const lat = Number(point.lat)
        if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null

        return {
          type: 'Feature',
          properties: { projectId: project.id, index, isBest: true },
          geometry: { type: 'Point', coordinates: [lng, lat] },
        }
      })
      .filter(Boolean),
  }
}
