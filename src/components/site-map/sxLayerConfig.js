import { createDefaultConfig, HD_IMAGERY_LAYER_ID } from '@whln/layer-control'

export const TDT_ANNOTATION_LAYER_ID = 'tdt-annotation'
export const SX_OVERLAY_ANCHOR_ID = 'sx-overlay-anchor'

// ============================================================
// 服务基础地址
// ============================================================

const NEW_GIS_BASE_URL = 'https://gis.wh-ge.com/sx-map-service'
const NEW_STAC_BASE_URL = NEW_GIS_BASE_URL
const NEW_TITILER_BASE_URL = NEW_GIS_BASE_URL

// 占位符 → 真实地址
// 注意：不含 {powerInfraUrl}。电网由 options.powerInfraUrl 显式注入，
// 不注入时保留占位符并 warn，避免被错误替换成 sx-map-service。
const PLACEHOLDER_MAP = {
  '{mapServiceBaseUrl}': NEW_GIS_BASE_URL,
  '{stacBaseUrl}':       NEW_STAC_BASE_URL,
  '{titilerBaseUrl}':    NEW_TITILER_BASE_URL,
}

const PLACEHOLDER_REGEX_MAP = Object.keys(PLACEHOLDER_MAP).reduce((acc, ph) => {
  acc[ph] = new RegExp(ph.replace(/[{}]/g, '\\$&'), 'g')
  return acc
}, {})

// 完全跳过通用占位符替换的图层 id
// - collection-line：url 是 {powerInfraUrl}，由 applyPowerInfraUrl 单独处理
const SKIP_OVERRIDE_IDS = new Set([
  'collection-line',
])

// ============================================================
// 主入口
// ============================================================

/**
 * 生成陕西宿主图层配置
 *
 * @param {object} [options]
 * @param {string} [options.powerInfraUrl] 电网（power-infra）服务地址
 * @returns {object} createDefaultConfig() 的返回值
 */
export function createSxLayerConfig(options = {}) {
  const config = createDefaultConfig()

  // 1. 追加天地图注记
  config.layers[TDT_ANNOTATION_LAYER_ID] = buildTdtAnnotationLayer()
  insertAnnotationInTransport(config)

  // 2. 批量替换占位符（跳过电网）
  overrideAllLayerSources(config)

  // 3. 电网单独处理
  if (options.powerInfraUrl) {
    applyPowerInfraUrl(config, options.powerInfraUrl)
  } else {
    warnPowerInfraUrlMissing(config)
  }

  return config
}

// ============================================================
// 占位符替换
// ============================================================

function overrideAllLayerSources(config) {
  if (!config?.layers) return

  Object.keys(config.layers).forEach((id) => {
    if (SKIP_OVERRIDE_IDS.has(id)) return

    const layer = config.layers[id]
    if (!layer) return

    if (layer.source && typeof layer.source.url === 'string') {
      layer.source.url = replacePlaceholders(layer.source.url)
    }
    if (layer.source && Array.isArray(layer.source.tiles)) {
      layer.source.tiles = layer.source.tiles.map(replacePlaceholders)
    }
    if (!layer.source && typeof layer.url === 'string') {
      layer.url = replacePlaceholders(layer.url)
    }
  })
}

function replacePlaceholders(url) {
  if (typeof url !== 'string') return url
  let result = url
  Object.entries(PLACEHOLDER_MAP).forEach(([ph, real]) => {
    result = result.replace(PLACEHOLDER_REGEX_MAP[ph], real)
  })
  return result
}

// ============================================================
// 电网（power-infra）
// ============================================================

/**
 * 把 collection-line 的 {powerInfraUrl} 替换成真实地址。
 *
 * @param {object} config
 * @param {string} powerInfraUrl
 * @returns {void}
 */
function applyPowerInfraUrl(config, powerInfraUrl) {
  const layer = config?.layers?.['collection-line']
  if (!layer?.source) return
  if (typeof layer.source.url === 'string') {
    layer.source.url = layer.source.url.split('{powerInfraUrl}').join(powerInfraUrl)
  }
}

/**
 * 电网地址未注入时提醒：{powerInfraUrl} 残留会导致 power-infra 源不可用。
 *
 * @param {object} config
 * @returns {void}
 */
function warnPowerInfraUrlMissing(config) {
  const url = config?.layers?.['collection-line']?.source?.url
  if (typeof url === 'string' && url.includes('{powerInfraUrl}')) {
    console.warn(
      '[sxLayerConfig] collection-line 的 {powerInfraUrl} 未注入，' +
      '请在 createSxLayerConfig({ powerInfraUrl }) 或业务层补上。',
    )
  }
}

// ============================================================
// 天地图注记
// ============================================================

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