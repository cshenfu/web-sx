/** 地图引擎对外出口。默认接 MapLibre GL JS 6。 */

import { MapLibreAdapter } from './adapters/maplibre/MapLibreAdapter.js';
import { MapFacade } from './MapFacade.js';

export { MapViewControls, MeasureControl } from './controls/index.js';
export { MEASURE_TOOLS } from './controls/measure/index.js';

/**
 * 创建地图门面。传入 port 时可替换引擎，业务代码不用改。
 *
 * @param {object} [options] markerIcon、onWarn、onInfo、map、port、controls、deferControls
 * @returns {MapFacade} 门面
 */
export function createMapFacade(options = {}) {
    const port = options.port || new MapLibreAdapter();
    return new MapFacade(port, options);
}
