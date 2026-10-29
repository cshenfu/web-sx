/** 覆盖物默认样式。业务不直接依赖这些颜色常量以外的引擎字段。 */

export const POLYGON_STYLE = {
    fillColor: '#FFD700',
    fillOpacity: 0.05,
    lineColor: '#FFD700',
    lineWidth: 2,
};

export const MEASURE_STYLE = {
    fillColor: '#3bb2d0',
    fillOpacity: 0.1,
    lineColor: '#3bb2d0',
    lineWidth: 2,
    circleColor: '#ffffff',
    circleRadius: 4,
    circleStrokeColor: '#3bb2d0',
    circleStrokeWidth: 2,
    textColor: '#c2410c',
    textHaloColor: '#ffffff',
    textHaloWidth: 1.5,
};

/**
 * 定位点样式。
 *
 * @param {string} iconUrl 图标地址
 * @returns {object} 覆盖物样式
 */
export function markerStyle(iconUrl) {
    return {
        iconUrl,
        iconSize: 0.5,
        iconAnchor: 'bottom',
    };
}
