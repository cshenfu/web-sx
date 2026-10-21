import { createDefaultConfig, HD_IMAGERY_LAYER_ID } from '@whln/layer-control'

export const TDT_ANNOTATION_LAYER_ID = 'tdt-annotation'
export const SX_OVERLAY_ANCHOR_ID = 'sx-overlay-anchor'

/**
 * 在包默认目录上追加天地图注记，插在高清影像之后。
 *
 * @returns {{groups: object[], layers: Record<string, object>}} 宿主图层配置
 */
export function createSxLayerConfig() {
  const config = createDefaultConfig()
  config.layers[TDT_ANNOTATION_LAYER_ID] = buildTdtAnnotationLayer()
  insertAnnotationInTransport(config)
  return config
}

/**
 * 天地图注记 WMTS，拼址与包内影像相同，仅图层改为 cia。
 *
 * @returns {object} 图层定义
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
 * 把注记插到 transport 组高清影像之后，保证 beneath 栈里注记在上。
 *
 * @param {{groups: object[]}} config 默认配置
 * @returns {void}
 */
function insertAnnotationInTransport(config) {
  const transport = config.groups.find((g) => g.id === 'transport')
  const hdAt = transport.layers.indexOf(HD_IMAGERY_LAYER_ID)
  transport.layers.splice(hdAt + 1, 0, TDT_ANNOTATION_LAYER_ID)
}
