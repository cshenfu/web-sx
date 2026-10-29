/** 天气首页图层 id 与 3D 地形网格。风/光/天地图由 layer-control 默认图层加载。 */

import {
    SOLAR_RESOURCE_LAYER_ID,
    WIND_RESOURCE_LAYER_ID,
} from '@whln/layer-control';

export const WIND_LAYER_ID = WIND_RESOURCE_LAYER_ID;
export const SOLAR_LAYER_ID = SOLAR_RESOURCE_LAYER_ID;
/** 开启「3D 地形」后 DEM 网格的最低缩放；未开开关时不挂载 raster-dem。 */
export const TERRAIN_MIN_ZOOM = 10;

/**
 * 全国 DEM 网格（rustfs raster-dem）。「3D 地形」开关只挂此源，不再请求 5443 彩色 DEM 瓦片。
 *
 * @returns {object} raster-dem 描述，含 minZoom
 */
export function terrainMeshSpec() {
    return {
        tilejsonUrl: 'https://gis-rustfs.wh-ge.com/terrain/china-dem/tilejson.json',
        encoding: 'mapbox',
        exaggeration: 1,
        tileSize: 256,
        minZoom: TERRAIN_MIN_ZOOM,
    };
}
