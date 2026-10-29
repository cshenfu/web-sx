/** 相机高度（米）与 MapLibre zoom 的换算，只在适配器内使用。 */

const CIRCUMFERENCE = 40075016.68557849;
const TILE_SIZE = 512;
const HALF_FOV_TAN = Math.tan((60 * Math.PI) / 360);
/** 与 MapLibre 样式规范一致，避免换算把飞行目标钳在地图 maxZoom 之下。 */
const STYLE_MAX_ZOOM = 24;

/**
 * 把离椭球高度换成 zoom。按 60° 视场估算。
 *
 * @param {number} heightMeters 相机高度，单位米
 * @param {number} latitude 纬度
 * @param {number} canvasHeight 画布高度，单位像素
 * @returns {number} zoom
 */
export function heightToZoom(heightMeters, latitude, canvasHeight) {
    const height = Math.max(Number(heightMeters) || 1, 1);
    const canvas = Math.max(canvasHeight || 800, 1);
    const metersPerPixel = (2 * height * HALF_FOV_TAN) / canvas;
    const equator = (Math.cos((latitude * Math.PI) / 180) * CIRCUMFERENCE) / TILE_SIZE;
    const zoom = Math.log2(equator / metersPerPixel);
    return Math.min(STYLE_MAX_ZOOM, Math.max(0, zoom));
}

/**
 * 把 zoom 换回离椭球高度。
 *
 * @param {number} zoom 当前缩放
 * @param {number} latitude 纬度
 * @param {number} canvasHeight 画布高度，单位像素
 * @returns {number} 高度，单位米
 */
export function zoomToHeight(zoom, latitude, canvasHeight) {
    const canvas = Math.max(canvasHeight || 800, 1);
    const equator = (Math.cos((latitude * Math.PI) / 180) * CIRCUMFERENCE) / TILE_SIZE;
    const metersPerPixel = equator / 2 ** zoom;
    return (metersPerPixel * canvas) / (2 * HALF_FOV_TAN);
}
