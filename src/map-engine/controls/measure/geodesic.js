/**
 * 测地线长度 / 球面面积（不引入 Turf，算法与 turf.length / turf.area 对齐）。
 */

/** @turf/distance 默认地球半径（米） */
const EARTH_RADIUS_M = 6371008.8;
/** WGS84 赤道半径，turf.area / geojson-area 使用 */
const WGS84_RADIUS_M = 6378137;
const DEG = Math.PI / 180;

/**
 * 两点大圆距离。
 *
 * @param {number[]} from [lng, lat]
 * @param {number[]} to [lng, lat]
 * @returns {number} 距离，单位米；非法坐标返回 0
 */
export function haversineMeters(from, to) {
    const lng1 = Number(from?.[0]);
    const lat1 = Number(from?.[1]);
    const lng2 = Number(to?.[0]);
    const lat2 = Number(to?.[1]);
    if (![lng1, lat1, lng2, lat2].every(Number.isFinite)) {
        return 0;
    }
    const dLat = (lat2 - lat1) * DEG;
    const dLng = (lng2 - lng1) * DEG;
    const a = Math.sin(dLat / 2) ** 2
        + Math.cos(lat1 * DEG) * Math.cos(lat2 * DEG) * Math.sin(dLng / 2) ** 2;
    return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(a)));
}

/**
 * 从一点沿大圆前进一段距离。
 *
 * @param {number[]} from 起点 [lng, lat]
 * @param {number} distanceM 距离，单位米
 * @param {number} bearingDeg 方位角，正北顺时针，单位度
 * @returns {number[]} 终点 [lng, lat]
 */
export function destination(from, distanceM, bearingDeg) {
    const lat1 = Number(from?.[1]) * DEG;
    const lng1 = Number(from?.[0]) * DEG;
    const dist = Number(distanceM) / EARTH_RADIUS_M;
    const brng = Number(bearingDeg) * DEG;
    const lat2 = Math.asin(
        Math.sin(lat1) * Math.cos(dist)
        + Math.cos(lat1) * Math.sin(dist) * Math.cos(brng),
    );
    const lng2 = lng1 + Math.atan2(
        Math.sin(brng) * Math.sin(dist) * Math.cos(lat1),
        Math.cos(dist) - Math.sin(lat1) * Math.sin(lat2),
    );
    return [((lng2 / DEG + 540) % 360) - 180, lat2 / DEG];
}

/**
 * 生成测地线圆的闭合环。
 *
 * @param {number[]} center 圆心 [lng, lat]
 * @param {number} radiusM 半径，单位米
 * @param {number} [steps=64] 圆周分段数
 * @returns {number[][]} 闭合环坐标
 */
export function geodesicCircleRing(center, radiusM, steps = 64) {
    const ring = [];
    const n = Math.max(8, Number(steps) || 64);
    for (let i = 0; i < n; i += 1) {
        ring.push(destination(center, radiusM, (360 * i) / n));
    }
    ring.push(ring[0]);
    return ring;
}

/**
 * 由圆周顶点估算半径（质心到首点的大圆距离）。
 *
 * @param {number[][]} ring 外环坐标
 * @returns {number} 半径，单位米
 */
export function circleRadiusMeters(ring) {
    const verts = uniqueRingVerts(ring);
    if (verts.length < 3) {
        return 0;
    }
    let lng = 0;
    let lat = 0;
    for (const coord of verts) {
        lng += coord[0];
        lat += coord[1];
    }
    const n = verts.length;
    return haversineMeters([lng / n, lat / n], verts[0]);
}

/**
 * 去掉闭合重复点后的环顶点。
 *
 * @param {number[][]} ring 经纬度环
 * @returns {number[][]} 顶点列表
 */
function uniqueRingVerts(ring) {
    if (!Array.isArray(ring) || ring.length < 2) {
        return [];
    }
    const first = ring[0];
    const last = ring[ring.length - 1];
    const closed = first[0] === last[0] && first[1] === last[1];
    return closed ? ring.slice(0, -1) : ring;
}

/**
 * 折线测地线长度。
 *
 * @param {number[][]} coords 顶点 [lng, lat][]
 * @returns {number} 长度，单位米
 */
export function lineLengthMeters(coords) {
    if (!Array.isArray(coords) || coords.length < 2) {
        return 0;
    }
    let sum = 0;
    for (let i = 1; i < coords.length; i += 1) {
        sum += haversineMeters(coords[i - 1], coords[i]);
    }
    return sum;
}

/**
 * 多边形球面面积（外环减内环）。
 *
 * @param {number[][][]} rings GeoJSON Polygon coordinates
 * @returns {number} 面积，单位平方米
 */
export function polygonAreaMeters2(rings) {
    if (!Array.isArray(rings) || rings.length === 0) {
        return 0;
    }
    let area = Math.abs(ringAreaMeters2(rings[0]));
    for (let i = 1; i < rings.length; i += 1) {
        area -= Math.abs(ringAreaMeters2(rings[i]));
    }
    return Math.max(0, area);
}

/**
 * 将长度格式化为米或千米。
 *
 * @param {number} meters 长度（米）
 * @returns {string} 带单位的文本
 */
export function formatLength(meters) {
    const value = Number(meters);
    if (!Number.isFinite(value) || value <= 0) {
        return '';
    }
    if (value >= 1000) {
        return `${formatNumber(value / 1000)} km`;
    }
    return `${formatNumber(value)} m`;
}

/**
 * 将面积格式化为平方米、公顷或平方千米。
 *
 * @param {number} meters2 面积（平方米）
 * @returns {string} 带单位的文本
 */
export function formatArea(meters2) {
    const value = Number(meters2);
    if (!Number.isFinite(value) || value <= 0) {
        return '';
    }
    if (value >= 1e6) {
        return `${formatNumber(value / 1e6)} km²`;
    }
    if (value >= 1e4) {
        return `${formatNumber(value / 1e4)} ha`;
    }
    return `${formatNumber(value)} m²`;
}

/**
 * 按中文区域格式化数字。
 *
 * @param {number} value 数值
 * @returns {string} 最多两位小数
 */
function formatNumber(value) {
    return value.toLocaleString('zh-CN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
}

/**
 * 闭合环的球面有符号面积（turf.area / geojson-area）。
 *
 * @param {number[][]} ring 经纬度环
 * @returns {number} 有符号面积，单位平方米
 */
function ringAreaMeters2(ring) {
    const coords = closeRing(ring);
    const len = coords.length;
    if (len < 4) {
        return 0;
    }
    let area = 0;
    for (let i = 0; i < len; i += 1) {
        const p1 = coords[i === len - 2 ? len - 2 : i === len - 1 ? len - 1 : i];
        const p2 = coords[i === len - 2 ? len - 1 : i === len - 1 ? 0 : i + 1];
        const p3 = coords[i === len - 2 ? 0 : i === len - 1 ? 1 : i + 2];
        area += (p3[0] * DEG - p1[0] * DEG) * Math.sin(p2[1] * DEG);
    }
    return area * WGS84_RADIUS_M * WGS84_RADIUS_M / 2;
}

/**
 * 若首尾点不同则追加起点，得到闭合环。
 *
 * @param {number[][]} ring 经纬度环
 * @returns {number[][]} 闭合环（可能为新数组）
 */
function closeRing(ring) {
    if (!Array.isArray(ring) || ring.length < 2) {
        return ring || [];
    }
    const first = ring[0];
    const last = ring[ring.length - 1];
    if (first[0] === last[0] && first[1] === last[1]) {
        return ring;
    }
    return ring.concat([first]);
}
