export function isPolygonSelfIntersecting(polygon) {
    const n = polygon.length;
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            if (doLinesIntersect(polygon[i][0], polygon[i][1], polygon[(i + 1) % n][0], polygon[(i + 1) % n][1], polygon[j][0], polygon[j][1], polygon[(j + 1) % n][0], polygon[(j + 1) % n][1])) {
                return true;
            }
        }
    }
    return false;
}
 
function doLinesIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
    const denominator = ((y4 - y3) * (x2 - x1)) - ((x4 - x3) * (y2 - y1));
    if (denominator === 0) {
        return false; // 平行或共线
    }
    const t = (((x1 - x3) * (y2 - y1)) - ((y1 - y3) * (x2 - x1))) / denominator;
    const u = (((x3 - x1) * (y3 - y1)) + ((y1 - y3) * (x1 - x3))) / denominator;
    return (t >= 0 && t <= 1 && u >= 0 && u <= 1);
}