/**
 * 测量控制器单例引用，避免 EditController 与 MeasureController 循环依赖。
 */

/** @type {import('./MeasureController.js').MeasureController|null} */
let measureController = null;

/**
 * 登记当前测量控制器。
 *
 * @param {import('./MeasureController.js').MeasureController|null} controller 实例
 * @returns {void}
 */
export function setMeasureController(controller) {
    measureController = controller;
}

/**
 * 获取当前测量控制器。
 *
 * @returns {import('./MeasureController.js').MeasureController|null}
 */
export function getMeasureController() {
    return measureController;
}
