import { createDefaultConfig, HD_IMAGERY_LAYER_ID } from '@whln/layer-control'

export const TDT_ANNOTATION_LAYER_ID = 'tdt-annotation'
export const SX_OVERLAY_ANCHOR_ID = 'sx-overlay-anchor'

// ============================================================
// 服务基础地址
// ============================================================

// 通用 GIS 服务：建筑物 / 水域 / 路网 / 铁路 等 11 个
const NEW_GIS_BASE_URL = 'https://gis.wh-ge.com/sx-map-service'

// STAC 服务：风资源图谱
// ⚠️ 改成老项目里 wind-resource 实际用的 STAC 地址；
//    如果它确实走 sx-map-service 的 wind workspace，保持等于 NEW_GIS_BASE_URL
const NEW_STAC_BASE_URL = NEW_GIS_BASE_URL

// TiTiler 服务：光资源图谱
// ⚠️ 改成老项目里 solar-resource 实际用的 TiTiler 地址；
//    如果它确实走 sx-map-service 的 ghi workspace，保持等于 NEW_GIS_BASE_URL
const NEW_TITILER_BASE_URL = NEW_GIS_BASE_URL

// 占位符 → 真实地址
const PLACEHOLDER_MAP = {
  '{mapServiceBaseUrl}': NEW_GIS_BASE_URL,
  '{powerInfraUrl}':     NEW_GIS_BASE_URL,
  '{stacBaseUrl}':       NEW_STAC_BASE_URL,
  '{titilerBaseUrl}':    NEW_TITILER_BASE_URL,
}

// 占位符正则缓存（避免每次 new RegExp）
const PLACEHOLDER_REGEX_MAP = Object.keys(PLACEHOLDER_MAP).reduce((acc, ph) => {
  acc[ph] = new RegExp(ph.replace(/[{}]/g, '\\$&'), 'g')
  return acc
}, {})

// 完全跳过硬替换的图层 id（按需加）
// 用途：某些图层的地址由业务层或插件 endpoints 注入，不希望这里动它
const SKIP_OVERRIDE_IDS = new Set([
  // 'wind-resource',
  // 'solar-resource',
])

// ============================================================
// 主入口
// ============================================================

/**
 * 生成陕西宿主图层配置
 *
 * @returns {object} createDefaultConfig() 的返回值（已替换占位符）
 */
export function createSxLayerConfig() {
  const config = createDefaultConfig()

  // 1. 追加天地图注记
  config.layers[TDT_ANNOTATION_LAYER_ID] = buildTdtAnnotationLayer()
  insertAnnotationInTransport(config)

  // 2. 批量替换占位符
  overrideAllLayerSources(config)

  return config
}

// ============================================================
// 占位符替换
// ============================================================

/**
 * 批量替换 config 中所有图层 source 的占位符。
 * 支持 source.url 字符串、source.tiles 数组、layer.url 兜底。
 *
 * @param {object} config createDefaultConfig() 的返回值
 * @returns {void}
 */
function overrideAllLayerSources(config) {
  if (!config?.layers) return

  Object.keys(config.layers).forEach((id) => {
    if (SKIP_OVERRIDE_IDS.has(id)) return

    const layer = config.layers[id]
    if (!layer) return

    // ① source.url 字符串
    if (layer.source && typeof layer.source.url === 'string') {
      layer.source.url = replacePlaceholders(layer.source.url)
    }

    // ② source.tiles 数组
    if (layer.source && Array.isArray(layer.source.tiles)) {
      layer.source.tiles = layer.source.tiles.map(replacePlaceholders)
    }

    // ③ 兜底：没有 source，直接挂 layer.url
    if (!layer.source && typeof layer.url === 'string') {
      layer.url = replacePlaceholders(layer.url)
    }
  })
}

/**
 * 替换单个 URL 中的全部占位符
 *
 * @param {string} url
 * @returns {string}
 */
function replacePlaceholders(url) {
  if (typeof url !== 'string') return url
  let result = url
  Object.entries(PLACEHOLDER_MAP).forEach(([ph, real]) => {
    result = result.replace(PLACEHOLDER_REGEX_MAP[ph], real)
  })
  return result
}

// ============================================================
// 天地图注记
// ============================================================

/**
 * 天地图注记 WMTS
 */
function buildTdtAnnotationLayer() {
  return {
    name: '天地图注记',
    group: 'transport',
    enabled: true,
    defaultVisible: false,
    kind: 'fill',
    style: { fill: '#94a3b8', opacity: 1 },
    source: {
      type: 'wmts',
      url: 'https://t{s}.tianditu.gov.cn/cia_w/wmts',
      layer: 'cia',
      style: 'default',
      format: 'tiles',
      tileMatrixSetID: 'w',
      tilingScheme: 'webMercator',
      tileMatrix: '{z}',
      subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
      extraParams: { tk: '{tiandituKey}' },
      beneath: true,
      minimumLevel: 0,
      maximumLevel: 18,
    },
  }
}

/**
 * 把注记插到 transport 组高清影像之后
 *
 * @param {object} config
 * @returns {void}
 */
function insertAnnotationInTransport(config) {
  const transport = config.groups.find((g) => g.id === 'transport')
  if (!transport) return
  const hdAt = transport.layers.indexOf(HD_IMAGERY_LAYER_ID)
  transport.layers.splice(
    hdAt === -1 ? transport.layers.length : hdAt + 1,
    0,
    TDT_ANNOTATION_LAYER_ID,
  )
}