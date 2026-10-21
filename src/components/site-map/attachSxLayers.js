import { attachLayerControl } from '@whln/layer-control'
import { createSxLayerConfig, SX_OVERLAY_ANCHOR_ID, TDT_ANNOTATION_LAYER_ID } from './sxLayerConfig'

const TIANDITU_KEY = '429657aadca28e2e467243852a0b388d'
const HIDE_STYLE_ID = 'sx-hide-whln-lc'
const ANNOTATION_MAP_LAYER_ID = `eng-r-${TDT_ANNOTATION_LAYER_ID}-0`
const BENEATH_PREFIXES = [
  'eng-r-tdt-imagery-',
  'eng-r-hd-imagery-',
  `eng-r-${TDT_ANNOTATION_LAYER_ID}-`,
]

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
  const plugin = attachLayerControl(map, {
    beforeId: SX_OVERLAY_ANCHOR_ID,
    placement: 'control',
    position: 'bottom-left',
    showLayerDetail: false,
    config: createSxLayerConfig(),
    endpoints: {
      tiandituKey: TIANDITU_KEY,
    },
    initialVisibleIds,
  })
  wrapSetVisibleIds(map, plugin)
  plugin.setVisibleIds(initialVisibleIds)
  return plugin
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
    return id.startsWith('eng-r-') && !BENEATH_PREFIXES.some((prefix) => id.startsWith(prefix))
  })
  return found?.id
}
