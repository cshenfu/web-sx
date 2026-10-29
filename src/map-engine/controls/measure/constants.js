/**
 * 地图测量工具常量。
 */

/** 写入 draw Feature.properties，用于与编辑要素隔离 */
export const MEASURE_USER_PROP = '_whlnMeasure';

/** 测距 / 测面 / 画圆工具名 */
export const MEASURE_TOOLS = {
    LENGTH: 'length',
    AREA: 'area',
    CIRCLE: 'circle',
};

/** 画圆时写入的半径（米）与圆心，供标注使用 */
export const MEASURE_RADIUS_M_PROP = '_whlnRadiusM';
export const MEASURE_CENTER_LNG_PROP = '_whlnCenterLng';
export const MEASURE_CENTER_LAT_PROP = '_whlnCenterLat';

/** 测量标注 GeoJSON source / symbol layer */
export const MEASURE_LABEL_SOURCE = 'whln-measure-labels';
export const MEASURE_LABEL_LAYER = 'whln-measure-labels-layer';

/** 与行政区标注一致，内网 maplibre-fonts 支持 CJK */
export const MEASURE_LABEL_FONT = ['Noto Sans Regular'];
