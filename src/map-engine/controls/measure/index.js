/**
 * 地图测量（测距 / 测面 / 画圆）模块入口。
 * 复刻 whln-web-edit：maplibre-gl-draw 画几何，独立工具条 + 标注层。
 */

import { MeasureController } from './MeasureController.js';
import { setMeasureController } from './session.js';

export { MEASURE_TOOLS, MEASURE_USER_PROP } from './constants.js';
export { DrawAdapter } from './DrawAdapter.js';
export { getMeasureController } from './session.js';
export { isMeasureFeature, filterMeasurePayload } from './guard.js';
export { MeasureController } from './MeasureController.js';
export { MeasureControl } from './MeasureControl.js';

/** @type {MeasureController|null} */
let instance = null;

/**
 * 初始化测量工具组（独立于 draw 原生编辑按钮）。
 *
 * @param {object} options 依赖
 * @param {{getMap: () => import('maplibre-gl').Map|null}} options.engine 地图引擎
 * @param {import('./DrawAdapter.js').DrawAdapter} options.drawAdapter Draw 适配器
 * @param {(text: string) => void} [options.onInfo] 操作提示
 * @returns {MeasureController} 测量控制器
 */
export function initMeasureModule(options) {
    if (instance) {
        return instance;
    }
    instance = new MeasureController(options);
    instance.init();
    setMeasureController(instance);
    window.getMeasureController = () => instance;
    return instance;
}

/**
 * 卸载测量模块。
 *
 * @returns {void}
 */
export function destroyMeasureModule() {
    instance?.destroy();
    instance = null;
    setMeasureController(null);
    if (window.getMeasureController) {
        delete window.getMeasureController;
    }
}
