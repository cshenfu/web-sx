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

const BASE_URL = 'https://gis.wh-ge.com/sx-map-service'

// ============================================================
// 图层 source 覆盖（在 createSxLayerConfig 之后执行）
// ============================================================
//
// - wind-resource / solar-resource：path 与默认一致，只改 layer 名和切片方案
// - wind-farm：默认走根路径 postgis:base_wind_turbine，改为 prod:base_wind_turbine
// - 其余图层由 sxLayerConfig 的 {mapServiceBaseUrl} 替换完成，不在此处理

const SOURCE_PATCH_OVERRIDE = {
  'wind-resource': {
    layer: 'wind:sx-windspeed',
    tileMatrixSetID: 'EPSG:900913',
    tilingScheme: 'webMercator',
  },
  'solar-resource': {
    layer: 'ghi:sx-ghi',
    tileMatrixSetID: 'EPSG:900913',
    tilingScheme: 'webMercator',
  },
  'wind-farm': {
    url:
      `${BASE_URL}/prod/gwc/service/wmts?` +
      'SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0' +
      '&LAYER=prod%3Abase_wind_turbine&STYLE=' +
      '&TILEMATRIXSET=EPSG%3A900913' +
      '&FORMAT=application%2Fvnd.mapbox-vector-tile' +
      '&TILEMATRIX=EPSG%3A900913%3A{z}&TILEROW={y}&TILECOL={x}',
  },
}

// ============================================================
// 主入口
// ============================================================

/**
 * 挂陕西宿主图层引擎。
 *
 * @param {import('maplibre-gl').Map} map
 * @param {object} [options]
 * @param {string[]} [options.initialVisibleIds] 进页可见 id（可为混合，非 whln 会被过滤）
 * @param {string} [options.powerInfraUrl] 电网服务地址
 * @returns {object} 插件句柄
 */
export function attachSxLayers(map, options = {}) {
  hideWhlnLcUi()

  // 1. 生成配置（含占位符替换 + 电网处理）
  const config = createSxLayerConfig({ powerInfraUrl: options.powerInfraUrl })

  // 2. source 级覆盖（风/光/已建风场）
  applySourcePatches(config)

  // 3. 过滤 initialVisibleIds：只保留 config 里存在的 id，
  //    避免 project/custom/terrain 等非 whln id 被插件误存
  const initialVisibleIds = (options.initialVisibleIds || [])
    .filter((id) => config.layers[id])

  // 4. 挂载
  const plugin = attachLayerControl(map, {
    beforeId: SX_OVERLAY_ANCHOR_ID,
    placement: 'control',
    position: 'bottom-left',
    showLayerDetail: false,
    config,
    endpoints: { tiandituKey: TIANDITU_KEY },
    initialVisibleIds,
  })

  // 5. 接管 setVisibleIds
  wrapSetVisibleIds(map, plugin)

  // 6. 首帧兜底：setVisibleIds 可能被幂等短路，注记需要等 idle 后再抬一次
  const raiseOnce = () => raiseTdtAnnotation(map, plugin.getVisibleIds())
  if (map.isStyleLoaded && map.isStyleLoaded()) {
    raiseOnce()
  } else {
    map.once('idle', raiseOnce)
  }

  return plugin
}

// ============================================================
// source 覆盖
// ============================================================

/**
 * 对指定图层 source 做字段级 patch。
 *
 * @param {object} config
 * @returns {void}
 */
function applySourcePatches(config) {
  if (!config?.layers) return
  Object.keys(SOURCE_PATCH_OVERRIDE).forEach((id) => {
    const layer = config.layers[id]
    if (!layer?.source) return
    Object.assign(layer.source, SOURCE_PATCH_OVERRIDE[id])
  })
}

// ============================================================
// 内部工具
// ============================================================

function hideWhlnLcUi() {
  if (document.getElementById(HIDE_STYLE_ID)) return
  const style = document.createElement('style')
  style.id = HIDE_STYLE_ID
  style.textContent = '.whln-lc { display: none !important; }'
  document.head.appendChild(style)
}

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

function raiseTdtAnnotation(map, visibleIds) {
  if (!map || !visibleIds?.includes(TDT_ANNOTATION_LAYER_ID)) return
  if (!map.getLayer(ANNOTATION_MAP_LAYER_ID)) return
  const beforeId = firstNonBeneathGisLayerId(map) || SX_OVERLAY_ANCHOR_ID
  if (beforeId && map.getLayer(beforeId) && beforeId !== ANNOTATION_MAP_LAYER_ID) {
    map.moveLayer(ANNOTATION_MAP_LAYER_ID, beforeId)
  }
}

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