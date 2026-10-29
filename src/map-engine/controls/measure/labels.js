/**
 * 由测量几何生成标注点 FeatureCollection。
 */

import {
    circleRadiusMeters,
    formatArea,
    formatLength,
    lineLengthMeters,
    polygonAreaMeters2,
} from './geodesic.js';
import {
    MEASURE_CENTER_LAT_PROP,
    MEASURE_CENTER_LNG_PROP,
    MEASURE_RADIUS_M_PROP,
    MEASURE_TOOLS,
    MEASURE_USER_PROP,
} from './constants.js';

/**
 * 根据当前测量要素生成标注。
 *
 * @param {object[]} features GeoJSON Feature 列表
 * @returns {object} FeatureCollection，properties.measurement 为展示文本
 */
export function buildMeasureLabels(features) {
    const labels = [];
    for (const feature of features) {
        const type = feature?.geometry?.type;
        const kind = feature?.properties?.[MEASURE_USER_PROP];
        if (kind === MEASURE_TOOLS.CIRCLE && type === 'Polygon') {
            pushCircleLabel(labels, feature);
        } else if (type === 'LineString') {
            pushLineLabels(labels, feature.geometry.coordinates);
        } else if (type === 'Polygon') {
            pushPolygonLabel(labels, feature.geometry.coordinates);
        }
    }
    return { type: 'FeatureCollection', features: labels };
}

/**
 * 折线：每段中点标段长；多段时在终点标合计。
 *
 * @param {object[]} labels 输出数组
 * @param {number[][]} coords 折线坐标
 * @returns {void}
 */
function pushLineLabels(labels, coords) {
    if (!Array.isArray(coords) || coords.length < 2) {
        return;
    }
    for (let i = 1; i < coords.length; i += 1) {
        const text = formatLength(lineLengthMeters([coords[i - 1], coords[i]]));
        if (!text) {
            continue;
        }
        labels.push(pointFeature(midpoint(coords[i - 1], coords[i]), text));
    }
    if (coords.length < 3) {
        return;
    }
    const total = formatLength(lineLengthMeters(coords));
    if (total) {
        labels.push(pointFeature(coords[coords.length - 1], `合计 ${total}`));
    }
}

/**
 * 圆：圆心标半径。
 *
 * @param {object[]} labels 输出数组
 * @param {object} feature 圆 Polygon Feature
 * @returns {void}
 */
function pushCircleLabel(labels, feature) {
    const ring = feature.geometry?.coordinates?.[0];
    const radiusText = formatLength(circleRadiusOf(feature, ring));
    if (!radiusText) {
        return;
    }
    const center = circleCenterOf(feature, ring);
    if (center) {
        labels.push(pointFeature(center, `半径 ${radiusText}`));
    }
}

/**
 * 读取画圆半径：优先用落点时写入的测地线半径。
 *
 * @param {object} feature 圆 Polygon Feature
 * @param {number[][]} ring 外环
 * @returns {number} 半径，单位米
 */
function circleRadiusOf(feature, ring) {
    const stored = Number(feature.properties?.[MEASURE_RADIUS_M_PROP]);
    if (Number.isFinite(stored) && stored > 0) {
        return stored;
    }
    return circleRadiusMeters(ring);
}

/**
 * 读取圆心：有完整环时用顶点平均（拖动后面跟随）；否则用落点圆心。
 *
 * @param {object} feature 圆 Polygon Feature
 * @param {number[][]} ring 外环
 * @returns {number[]|null} [lng, lat]
 */
function circleCenterOf(feature, ring) {
    if (Array.isArray(ring) && ring.length >= 4) {
        return ringCentroid(ring);
    }
    const lng = Number(feature.properties?.[MEASURE_CENTER_LNG_PROP]);
    const lat = Number(feature.properties?.[MEASURE_CENTER_LAT_PROP]);
    if (Number.isFinite(lng) && Number.isFinite(lat)) {
        return [lng, lat];
    }
    return null;
}

/**
 * 多边形：外环质心标面积。
 *
 * @param {object[]} labels 输出数组
 * @param {number[][][]} rings Polygon coordinates
 * @returns {void}
 */
function pushPolygonLabel(labels, rings) {
    const ring = rings?.[0];
    if (!Array.isArray(ring) || ring.length < 3) {
        return;
    }
    const text = formatArea(polygonAreaMeters2(rings));
    if (!text) {
        return;
    }
    const center = ringCentroid(ring);
    if (center) {
        labels.push(pointFeature(center, text));
    }
}

/**
 * 构造标注点要素。
 *
 * @param {number[]} coordinates [lng, lat]
 * @param {string} measurement 展示文本
 * @returns {object} GeoJSON Point Feature
 */
function pointFeature(coordinates, measurement) {
    return {
        type: 'Feature',
        properties: { measurement },
        geometry: { type: 'Point', coordinates },
    };
}

/**
 * 两点经纬度中点（标注用，非测地线中点）。
 *
 * @param {number[]} a [lng, lat]
 * @param {number[]} b [lng, lat]
 * @returns {number[]} [lng, lat]
 */
function midpoint(a, b) {
    return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}

/**
 * 外环顶点平均（去掉闭合重复点）。
 *
 * @param {number[][]} ring 外环
 * @returns {number[]|null} [lng, lat]
 */
function ringCentroid(ring) {
    const last = ring[ring.length - 1];
    const first = ring[0];
    const closed = first[0] === last[0] && first[1] === last[1];
    const verts = closed ? ring.slice(0, -1) : ring;
    if (verts.length === 0) {
        return null;
    }
    let lng = 0;
    let lat = 0;
    let n = 0;
    for (const coord of verts) {
        const x = Number(coord?.[0]);
        const y = Number(coord?.[1]);
        if (!Number.isFinite(x) || !Number.isFinite(y)) {
            continue;
        }
        lng += x;
        lat += y;
        n += 1;
    }
    return n === 0 ? null : [lng / n, lat / n];
}
