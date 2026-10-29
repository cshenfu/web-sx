/** 与引擎无关的球面距离、中点、面积和比例尺。 */

const EARTH_RADIUS = 6378137;

/**
 * 角度转弧度。
 *
 * @param {number} degrees 角度
 * @returns {number} 弧度
 */
function toRadians(degrees) {
    return (degrees * Math.PI) / 180;
}

/**
 * 两点地表距离。
 *
 * @param {{lng: number, lat: number}} start 起点
 * @param {{lng: number, lat: number}} end 终点
 * @returns {number} 距离，单位米
 */
export function distanceMeters(start, end) {
    const lat1 = toRadians(start.lat);
    const lat2 = toRadians(end.lat);
    const dLat = lat2 - lat1;
    const dLng = toRadians(end.lng - start.lng);
    const a = Math.sin(dLat / 2) ** 2
        + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * EARTH_RADIUS * Math.asin(Math.min(1, Math.sqrt(a)));
}

/**
 * 大圆中点。
 *
 * @param {{lng: number, lat: number}} start 起点
 * @param {{lng: number, lat: number}} end 终点
 * @returns {{lng: number, lat: number}} 中点
 */
export function midpoint(start, end) {
    const lat1 = toRadians(start.lat);
    const lng1 = toRadians(start.lng);
    const lat2 = toRadians(end.lat);
    const dLng = toRadians(end.lng - start.lng);
    const bx = Math.cos(lat2) * Math.cos(dLng);
    const by = Math.cos(lat2) * Math.sin(dLng);
    const lat = Math.atan2(
        Math.sin(lat1) + Math.sin(lat2),
        Math.sqrt((Math.cos(lat1) + bx) ** 2 + by ** 2),
    );
    const lng = lng1 + Math.atan2(by, Math.cos(lat1) + bx);
    return { lng: (lng * 180) / Math.PI, lat: (lat * 180) / Math.PI };
}

/**
 * 从一点沿大圆前进一段距离。
 *
 * @param {{lng: number, lat: number}} from 起点
 * @param {number} distanceM 距离，单位米
 * @param {number} bearingDeg 方位角，正北顺时针，单位度
 * @returns {{lng: number, lat: number}} 终点
 */
export function destination(from, distanceM, bearingDeg) {
    const lat1 = toRadians(from.lat);
    const lng1 = toRadians(from.lng);
    const dist = Number(distanceM) / EARTH_RADIUS;
    const brng = toRadians(bearingDeg);
    const lat2 = Math.asin(
        Math.sin(lat1) * Math.cos(dist)
        + Math.cos(lat1) * Math.sin(dist) * Math.cos(brng),
    );
    const lng2 = lng1 + Math.atan2(
        Math.sin(brng) * Math.sin(dist) * Math.cos(lat1),
        Math.cos(dist) - Math.sin(lat1) * Math.sin(lat2),
    );
    return {
        lng: ((lng2 / Math.PI) * 180 + 540) % 360 - 180,
        lat: (lat2 / Math.PI) * 180,
    };
}

/**
 * 生成测地线圆的闭合环。
 *
 * @param {{lng: number, lat: number}} center 圆心
 * @param {number} radiusM 半径，单位米
 * @param {number} [steps=64] 圆周分段数
 * @returns {{lng: number, lat: number}[]} 闭合环（末点等于首点）
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
 * 简单球面多边形面积。
 *
 * @param {{lng: number, lat: number}[]} points 顶点，至少 3 个
 * @returns {number} 面积，单位平方米
 */
export function areaSquareMeters(points) {
    if (!points || points.length < 3) {
        return 0;
    }
    let total = 0;
    for (let index = 0; index < points.length; index += 1) {
        const start = points[index];
        const end = points[(index + 1) % points.length];
        const delta = toRadians(end.lng - start.lng);
        const latTerm = 2 + Math.sin(toRadians(start.lat)) + Math.sin(toRadians(end.lat));
        total += delta * latTerm;
    }
    return Math.abs((total * EARTH_RADIUS * EARTH_RADIUS) / 2);
}

/**
 * 按现网口径把屏幕横向地面距离写成比例尺文字。
 *
 * @param {{lng: number, lat: number}|null} left 屏幕左缘中点
 * @param {{lng: number, lat: number}|null} right 屏幕右缘中点
 * @param {number} width 画布宽度，单位像素
 * @returns {string} 如 `12.30km`、`350.00m` 或 `--km`
 */
export function formatScale(left, right, width) {
    if (!left || !right || !width) {
        return '--km';
    }
    const resolution = distanceMeters(left, right) / width;
    if (!Number.isFinite(resolution) || resolution <= 0) {
        return '--km';
    }
    const scale = resolution * 96;
    if (scale < 1000) {
        return `${scale.toFixed(2)}m`;
    }
    return `${(scale / 1000).toFixed(2)}km`;
}
