/**
 * 地球投影下 lng/lat 很难完全相等，原生 draw_polygon / draw_line_string
 * 的「再点同一坐标结束」经常失效。双击（detail === 2）直接闭合。
 */

/**
 * 包装 Draw 线/面模式，使双击结束绘制。
 *
 * @param {object} baseMode Draw.modes.draw_polygon 或 draw_line_string
 * @param {'polygon'|'line'} kind 几何族
 * @returns {object} 包装后的模式
 */
export function finishOnDoubleClick(baseMode, kind) {
    if (!baseMode || typeof baseMode.onClick !== 'function') {
        return baseMode;
    }
    const minPos = kind === 'line' ? 2 : 3;
    return {
        ...baseMode,
        onClick(state, event) {
            if (shouldFinish(state, event, kind, minPos)) {
                return this.changeMode('simple_select', {
                    featureIds: [featureId(state, kind)],
                });
            }
            return baseMode.onClick.call(this, state, event);
        },
        onTap(state, event) {
            return this.onClick(state, event);
        },
    };
}

/**
 * 是否应按双击结束当前草稿。
 *
 * @param {object} state Draw 模式 state
 * @param {object} event Draw click 事件
 * @param {'polygon'|'line'} kind 几何族
 * @param {number} minPos 最少已落点数
 * @returns {boolean} 应结束
 */
function shouldFinish(state, event, kind, minPos) {
    const detail = event?.originalEvent?.detail;
    const pos = Number(state?.currentVertexPosition) || 0;
    const id = featureId(state, kind);
    return detail === 2 && pos >= minPos && Boolean(id);
}

/**
 * 当前草稿要素 id。
 *
 * @param {object} state Draw 模式 state
 * @param {'polygon'|'line'} kind 几何族
 * @returns {string|undefined} 要素 id
 */
function featureId(state, kind) {
    if (kind === 'line') {
        return state?.line?.id;
    }
    return state?.polygon?.id;
}
