import { attachLayerControl } from '@whln/layer-control'
import {
  createSxLayerConfig,
  SX_OVERLAY_ANCHOR_ID,
  TDT_ANNOTATION_LAYER_ID,
} from './sxLayerConfig'

const TIANDITU_KEY = '429657aadca28e2e467243852a0b388d'
const HIDE_STYLE_ID = 'sx-hide-whln-lc'
const ANNOTATION_MAP_LAYER_ID = `eng-r-${TDT_ANNOTATION_LAYER_ID}-0`
const BENEATH_PREFIXES = [
  'eng-r-tdt-imagery-',
  'eng-r-hd-imagery-',
  `eng-r-${TDT_ANNOTATION_LAYER_ID}-`,
]

// ============================================================
// WMTS 地址生成
// ============================================================
const SX_MAP_WMTS_BASE =
  'https://gis.wh-ge.com/sx-map-service/prod/gwc/service/wmts'

const WMTS_FORMAT_VECTOR = 'application/vnd.mapbox-vector-tile'
const WMTS_FORMAT_RASTER = 'image/png'

/**
 * 生成 GeoServer GWC WMTS 地址
 *
 * @param {string} layerName GeoServer 图层名（prod: 之后的部分）
 * @param {string} [format]  瓦片格式，默认 vector tile
 * @returns {string} 完整 URL
 */
function buildWmtsUrl(layerName, format = WMTS_FORMAT_VECTOR) {
  return (
    `${SX_MAP_WMTS_BASE}?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0` +
    `&LAYER=prod:${layerName}` +
    `&STYLE=` +
    `&TILEMATRIX=EPSG:900913:{z}` +
    `&TILEMATRIXSET=EPSG:900913` +
    `&FORMAT=${format}` +
    `&TILECOL={x}&TILEROW={y}`
  )
}

// ============================================================
// 需要替换为 WMTS 的图层 id 白名单
// ============================================================
// id 直接当 LAYER 名；下面 override 表里的是例外。
// 待你确认的图层（forest/farmland/grassland/pv-station/wind-farm/collection-line）
// 确认后加进这个 Set 即可，不动其它代码。

const WMTS_LAYER_IDS = new Set([
  'buildings-2025',       // 建筑物体
  'water',                // 水域
  'reserve',              // 自然保护区
  'mining',               // 矿区
  'cemetery',             // 坟地
  'scenic',               // 景区
  'road-network',         // 路网 → 见 override
  'railway',              // 铁路
  'residential-2025',     // 居民地（原 buildings-2025 冲突，需同步改面板 id）
  'rivers',               // 水系
  'substation',           // 变电站
])

// id → LAYER 名 的例外表（默认 id 即 LAYER 名）
const WMTS_LAYER_NAME_OVERRIDE = {
  'road-network': 'base_roads',
}

// 某些图层如果不是 vector tile，在这里指定格式
const WMTS_FORMAT_OVERRIDE = {
  // 'hd-imagery': WMTS_FORMAT_RASTER,
}

// ============================================================
// 主入口
// ============================================================

/**
 * 挂陕西宿主图层引擎：空底图锚点、藏插件面板、注记压在影像之上。
 *
 * @param {import('maplibre-gl').Map} map MapLibre 实例
 * @param {object} [options] 选项
 * @param {string[]} [options.initialVisibleIds] 进页可见的 whln 图层 id
 * @returns {object} 插件句柄
 */
export function attachSxLayers(map, options = {}) {
  hideWhlnLcUi()
  const initialVisibleIds = options.initialVisibleIds || []

  // 1. 生成默认配置
  const config = createSxLayerConfig()

  // 2. ★ 唯一的地址替换点
  applyCustomLayerUrls(config)

  // 3. 挂载
  const plugin = attachLayerControl(map, {
    beforeId: SX_OVERLAY_ANCHOR_ID,
    placement: 'control',
    position: 'bottom-left',
    showLayerDetail: false,
    config,
    endpoints: { tiandituKey: TIANDITU_KEY },
    initialVisibleIds,
  })

  wrapSetVisibleIds(map, plugin)
  // 再调一次确保走 wrapped 版本，触发 raiseTdtAnnotation
  plugin.setVisibleIds(initialVisibleIds)
  return plugin
}

// ============================================================
// 内部工具
// ============================================================

/**
 * 遍历 config.layers，命中 WMTS_LAYER_IDS 的图层把 source.url 换成 WMTS 地址。
 * 默认 LAYER 名 = 图层 id，例外见 WMTS_LAYER_NAME_OVERRIDE。
 *
 * @param {object} config createSxLayerConfig() 的返回值
 * @returns {void}
 */
function applyCustomLayerUrls(config) {
  if (!config?.layers) return
console.log('wind-resource url :', config.layers['wind-resource']?.source?.url)
console.log('solar-resource url:', config.layers['solar-resource']?.source?.url)
  Object.keys(config.layers).forEach((layerId) => {
    if (!WMTS_LAYER_IDS.has(layerId)) return

    const layer = config.layers[layerId]
    if (!layer?.source) return

    const layerName = WMTS_LAYER_NAME_OVERRIDE[layerId] || layerId
    const format = WMTS_FORMAT_OVERRIDE[layerId] || WMTS_FORMAT_VECTOR
    const url = buildWmtsUrl(layerName, format)

    const source = layer.source
    if (Array.isArray(source.tiles)) {
      source.tiles = [url]
    } else if (typeof source.url === 'string') {
      source.url = url
    } else if (typeof layer.url === 'string') {
      layer.url = url
    }
  })
}

/**
 * 用 CSS 隐藏插件自带面板，避免 MutationObserver 删节点前闪一下。
 *
 * @returns {void}
 */
function hideWhlnLcUi() {
  if (document.getElementById(HIDE_STYLE_ID)) return
  const style = document.createElement('style')
  style.id = HIDE_STYLE_ID
  style.textContent = '.whln-lc { display: none !important; }'
  document.head.appendChild(style)
}

/**
 * 每次 setVisibleIds 完成后把注记抬到两套影像之上、地物之下。
 *
 * @param {import('maplibre-gl').Map} map 地图
 * @param {object} plugin 插件句柄
 * @returns {void}
 */
function wrapSetVisibleIds(map, plugin) {
  const original = plugin.setVisibleIds.bind(plugin)
  plugin.setVisibleIds = (ids) => {
    const result = original(ids)
    if (result && typeof result.then === 'function') {
      return result.then((failed) => {
        raiseTdtAnnotation(map, plugin.getVisibleIds())
        return failed
      })
    }
    raiseTdtAnnotation(map, plugin.getVisibleIds())
    return result
  }
}

/**
 * 注记 moveLayer 到第一条非 beneath GIS 层之前；没有地物时压在锚点下。
 *
 * @param {import('maplibre-gl').Map} map 地图
 * @param {string[]} visibleIds 当前可见图层 id
 * @returns {void}
 */
function raiseTdtAnnotation(map, visibleIds) {
  if (!map || !visibleIds?.includes(TDT_ANNOTATION_LAYER_ID)) return
  if (!map.getLayer(ANNOTATION_MAP_LAYER_ID)) return
  const beforeId = firstNonBeneathGisLayerId(map) || SX_OVERLAY_ANCHOR_ID
  if (beforeId && map.getLayer(beforeId) && beforeId !== ANNOTATION_MAP_LAYER_ID) {
    map.moveLayer(ANNOTATION_MAP_LAYER_ID, beforeId)
  }
}

/**
 * 自下而上找第一条非影像/注记的插件图层，作为注记的 beforeId。
 *
 * @param {import('maplibre-gl').Map} map 地图
 * @returns {string|undefined} 图层 id
 */
function firstNonBeneathGisLayerId(map) {
  const layers = map.getStyle()?.layers || []
  const found = layers.find((layer) => {
    const id = layer.id
    return (
      id.startsWith('eng-r-') &&
      !BENEATH_PREFIXES.some((prefix) => id.startsWith(prefix))
    )
  })
  return found?.id
}