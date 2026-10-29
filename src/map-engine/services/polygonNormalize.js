/** 把页面传入的坐标收成 GeoJSON 多边形，兼容区县坐标和一维环。 */

const EMPTY = { type: 'FeatureCollection', features: [] };

/**
 * 判断是否为经纬度点。
 *
 * @param {unknown} value 候选值
 * @returns {boolean} 是 [lng, lat] 时为 true
 */
function isLngLat(value) {
    if (!Array.isArray(value) || value.length < 2) {
        return false;
    }
    return Number.isFinite(Number(value[0])) && Number.isFinite(Number(value[1]));
}

/**
 * 判断是否为线性环。
 *
 * @param {unknown} value 候选值
 * @returns {boolean} 至少 3 个点时为 true
 */
function isRing(value) {
    return Array.isArray(value) && value.length >= 3 && isLngLat(value[0]);
}

/**
 * 判断是否为 Polygon coordinates。
 *
 * @param {unknown} value 候选值
 * @returns {boolean} 首元素是环时为 true
 */
function isPolygonCoords(value) {
    return Array.isArray(value) && value.length >= 1 && isRing(value[0]);
}

/**
 * 判断是否为 MultiPolygon coordinates。
 *
 * @param {unknown} value 候选值
 * @returns {boolean} 首元素是多边形时为 true
 */
function isMultiPolygonCoords(value) {
    return Array.isArray(value) && value.length >= 1 && isPolygonCoords(value[0]);
}

/**
 * 判断是否为压平后的 [lng, lat, lng, lat, ...]。
 *
 * @param {unknown} value 候选值
 * @returns {boolean} 偶数个数字且至少 3 点时为 true
 */
function isFlatRing(value) {
    if (!Array.isArray(value) || value.length < 6 || value.length % 2 !== 0) {
        return false;
    }
    return value.every((item) => Number.isFinite(Number(item)));
}

/**
 * 把一维数字配对成环。
 *
 * @param {number[]} flat [lng, lat, ...]
 * @returns {number[][]} 环
 */
function pairFlat(flat) {
    const ring = [];
    for (let index = 0; index < flat.length; index += 2) {
        ring.push([Number(flat[index]), Number(flat[index + 1])]);
    }
    return ring;
}

/**
 * 环未闭合时补上首点。
 *
 * @param {number[][]} ring 环
 * @returns {number[][]} 闭合环
 */
function closeRing(ring) {
    if (ring.length < 3) {
        return ring;
    }
    const first = ring[0];
    const last = ring[ring.length - 1];
    if (first[0] === last[0] && first[1] === last[1]) {
        return ring;
    }
    return [...ring, [first[0], first[1]]];
}

/**
 * 从多种入参里取出多边形列表。
 *
 * @param {unknown} input 页面传入的坐标
 * @returns {number[][][]} 每个元素是一个 Polygon 的 coordinates
 */
function readPolygons(input) {
    if (!Array.isArray(input) || !input.length) {
        return [];
    }
    if (isFlatRing(input)) {
        return [[pairFlat(input)]];
    }
    if (isMultiPolygonCoords(input)) {
        return input;
    }
    if (isPolygonCoords(input)) {
        return [input];
    }
    if (isRing(input)) {
        return [[input]];
    }
    return [];
}

/**
 * 收成要素集合。无法识别时返回空集合。
 *
 * @param {unknown} input 区县 coordinates 或一维环
 * @returns {object} GeoJSON FeatureCollection
 */
export function toPolygonFeatureCollection(input) {
    const features = readPolygons(input).map((rings) => ({
        type: 'Feature',
        properties: {},
        geometry: { type: 'Polygon', coordinates: rings.map(closeRing) },
    }));
    if (!features.length) {
        return EMPTY;
    }
    return { type: 'FeatureCollection', features };
}
