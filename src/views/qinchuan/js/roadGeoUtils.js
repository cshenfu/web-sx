/**
 * 道路及 35kV 线路 GeoJSON 转换工具。
 *
 * 这里仅负责接口响应解包和数据格式转换；地图实例、图层生命周期、
 * hover 交互及缓存仍由页面各自管理。
 */

export function unwrapRoadResponse(response) {
  let value = response
  for (let i = 0; i < 4; i += 1) {
    if (
      value &&
      typeof value === 'object' &&
      value.data != null &&
      !Object.prototype.hasOwnProperty.call(value, 'roadMap') &&
      !Object.prototype.hasOwnProperty.call(value, 'line') &&
      !Object.prototype.hasOwnProperty.call(value, 'CNKJ')
    ) {
      value = value.data
      continue
    }
    break
  }
  return value
}

export function toMapCoordinate(point) {
  const lng = Number(Array.isArray(point) ? point[0] : (point?.lon ?? point?.lng ?? point?.longitude))
  const lat = Number(Array.isArray(point) ? point[1] : (point?.lat ?? point?.latitude))
  return Number.isFinite(lng) && Number.isFinite(lat) ? [lng, lat] : null
}

function pushLineFeatures(target, rows, baseProps) {
  if (!Array.isArray(rows) || rows.length === 0) return 0
  const groups = Array.isArray(rows[0]) ? rows : [rows]
  let count = 0

  groups.forEach((group) => {
    if (!Array.isArray(group)) return
    const coordinates = group.map(toMapCoordinate).filter(Boolean)
    if (coordinates.length < 2) return

    target.push({
      type: 'Feature',
      properties: { ...baseProps },
      geometry: { type: 'LineString', coordinates },
    })
    count += 1
  })

  return count
}

/**
 * @param {object} data 道路/线路接口响应（已解包或原始响应均可）
 * @param {object} options
 * @param {boolean} options.extendedLoopPaths 是否兼容 loops 的额外嵌套路径
 * @param {boolean} options.includeLegacyLoopFallback 是否在缺少 mapGeoJson 时使用 cablepoletower
 */
export function buildRoadLineFeatures(data, options = {}) {
  const {
    extendedLoopPaths = false,
    includeLegacyLoopFallback = false,
  } = options
  const roadFeatures = []
  const lineFeatures = []

  const roadMap = data?.roadMap ?? data?.data?.roadMap ?? {}
  for (const type of ['CNKJ', 'CNXJ', 'JZXJ']) {
    pushLineFeatures(
      roadFeatures,
      roadMap?.[type]?.roadpoint,
      { category: 'road', sourceType: type, label: '道路' }
    )
  }

  const line35Kv =
    data?.line35Kv ??
    data?.line35KV ??
    data?.data?.line35Kv ??
    data?.data?.line35KV ??
    null

  const mapGeoJson =
    line35Kv?.mapGeoJson ??
    line35Kv?.mapGeojson ??
    line35Kv?.mapGeoJSON ??
    data?.mapGeoJson ??
    null

  const loops = extendedLoopPaths
    ? (line35Kv?.loops ?? line35Kv?.line?.loops ?? data?.loops ?? data?.line?.loops ?? [])
    : (line35Kv?.line?.loops ?? data?.line?.loops ?? [])

  const loopMeta = new Map()
  if (Array.isArray(loops)) {
    loops.forEach((loop, index) => {
      const name = loop?.loopname || String(index + 1)
      loopMeta.set(String(name), {
        fanCount: Number(loop?.fan) || (loop?.fanidarr?.length ?? 0),
        loopLength: loop?.looplength || '',
      })
    })
  }

  if (mapGeoJson?.features?.length) {
    const sorted = [...mapGeoJson.features].sort((a, b) => {
      const ai = Number(a?.properties?.edge_index)
      const bi = Number(b?.properties?.edge_index)
      if (Number.isFinite(ai) && Number.isFinite(bi)) return ai - bi
      return 0
    })

    sorted.forEach((feature) => {
      const geometry = feature?.geometry
      if (!geometry) return

      const properties = feature?.properties || {}
      const loopName = properties.loopname || ''
      const metadata = loopMeta.get(String(loopName)) || {}
      const lengthM = Number(properties.length_m) || 0
      const loopLength = lengthM > 0
        ? (lengthM / 1000).toFixed(2)
        : (metadata.loopLength || '')
      const lineTypeText =
        properties.type === 'underground' ? '地埋'
          : properties.type === 'trunk' ? '主干'
            : properties.type === 'branch' ? '分支'
              : ''

      const coordinateGroups =
        geometry.type === 'LineString'
          ? [geometry.coordinates]
          : geometry.type === 'MultiLineString'
            ? (geometry.coordinates || [])
            : []

      coordinateGroups.forEach((group) => {
        const coordinates = (group || []).map(toMapCoordinate).filter(Boolean)
        if (coordinates.length < 2) return

        lineFeatures.push({
          type: 'Feature',
          properties: {
            category: 'line',
            loopIndex: properties.edge_index ?? null,
            loopName,
            lineType: properties.type || '',
            lineTypeText,
            segmentName: properties.name || '',
            loopLength,
            fanCount: metadata.fanCount || 0,
            label: loopName ? `35kV 线路 ${loopName}` : `35kV 线路 ${properties.name || ''}`,
          },
          geometry: { type: 'LineString', coordinates },
        })
      })
    })
  } else if (includeLegacyLoopFallback && Array.isArray(loops)) {
    loops.forEach((loop, loopIndex) => {
      const loopName = loop?.loopname || String(loopIndex + 1)
      pushLineFeatures(
        lineFeatures,
        loop?.cablepoletower,
        {
          category: 'line',
          loopIndex,
          loopName,
          loopLength: loop?.looplength || '',
          fanCount: Number(loop?.fan) || (loop?.fanidarr?.length ?? 0),
          label: `35kV 线路 ${loopName}`,
        }
      )
    })
  }

  return { roadFeatures, lineFeatures }
}
