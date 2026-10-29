/** 圈选面金色；超限改为红色。 */

const GOLD = '#FFD700';
const RED = '#E34949';

/**
 * 把默认 polygon 填色/描边改成金色，并追加超限图层。
 *
 * @param {object[]} styles draw 默认样式表
 * @returns {object[]} 调整后的样式
 */
export function withRangeDrawStyles(styles) {
    if (!Array.isArray(styles)) {
        return styles;
    }
    const patched = styles.map((style) => patchPolygonPaint(style));
    patched.push(overlimitFill(), overlimitStroke());
    return patched;
}

/**
 * 金色化单条 polygon 样式。
 *
 * @param {object} style draw 样式
 * @returns {object} 新样式或原对象
 */
function patchPolygonPaint(style) {
    const id = String(style?.id || '');
    if (!id.includes('polygon') || !style.paint) {
        return style;
    }
    const paint = { ...style.paint };
    if (paint['fill-color']) {
        paint['fill-color'] = GOLD;
        paint['fill-opacity'] = 0.08;
    }
    if (paint['line-color']) {
        paint['line-color'] = GOLD;
    }
    return { ...style, paint };
}

/**
 * 超限填充。
 *
 * @returns {object} fill 图层
 */
function overlimitFill() {
    return {
        id: 'gl-draw-polygon-fill-overlimit',
        type: 'fill',
        filter: ['all', ['==', '$type', 'Polygon'], ['==', 'user_overlimit', 'true']],
        paint: { 'fill-color': RED, 'fill-opacity': 0.1 },
    };
}

/**
 * 超限描边。
 *
 * @returns {object} line 图层
 */
function overlimitStroke() {
    return {
        id: 'gl-draw-polygon-stroke-overlimit',
        type: 'line',
        filter: ['all', ['==', '$type', 'Polygon'], ['==', 'user_overlimit', 'true']],
        paint: { 'line-color': RED, 'line-width': 2 },
    };
}
