/**
 * 包装 Draw 线/面模式，使真实鼠标双击可以结束绘制。
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
            // 保留 Draw 原生触摸处理，避免把 touch tap 伪装成鼠标 click。
            if (typeof baseMode.onTap === 'function') {
                return baseMode.onTap.call(this, state, event);
            }
            return this.onClick(state, event);
        },
    };
}

/**
 * 仅真实鼠标双击且已达到最少顶点数时结束草稿。
 *
 * @param {object} state Draw 模式 state
 * @param {object} event Draw click 事件
 * @param {'polygon'|'line'} kind 几何族
 * @param {number} minPos 最少已落点数
 * @returns {boolean} 应结束
 */
function shouldFinish(state, event, kind, minPos) {
    const originalEvent = event?.originalEvent;
    const pos = Number(state?.currentVertexPosition) || 0;
    const id = featureId(state, kind);
    if (
        originalEvent?.type !== 'click'
        || originalEvent?.button !== 0
        || originalEvent?.detail !== 2
        || pos < minPos
        || !id
    ) {
        if (originalEvent?.type === 'click' && originalEvent?.button === 0) {
            rememberClick(state, originalEvent);
        }
        return false;
    }

    const previous = state.__measureLastClick;
    const current = clickPosition(originalEvent);
    const isSamePosition = previous && current
        && Math.hypot(current.x - previous.x, current.y - previous.y) <= 6;

    if (isSamePosition) {
        state.__measureLastClick = null;
        return true;
    }

    // click.detail 也会因短时间内点击不同位置而递增，不能仅凭 detail=2 结束绘制。
    rememberClick(state, originalEvent);
    return false;
}

/**
 * 记录上一次鼠标点击位置，避免把不同位置的连续加点误判为双击。
 *
 * @param {object} state Draw 模式 state
 * @param {MouseEvent} event 原始鼠标事件
 * @returns {void}
 */
function rememberClick(state, event) {
    const position = clickPosition(event);
    state.__measureLastClick = position;
}

/**
 * 读取浏览器视口坐标。
 *
 * @param {MouseEvent} event 原始鼠标事件
 * @returns {{x:number,y:number}|null} 点击坐标
 */
function clickPosition(event) {
    const x = Number(event?.clientX);
    const y = Number(event?.clientY);
    return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
}

/**
 * 当前草稿要素 id。
 *
 * @param {object} state Draw 模式 state
 * @param {'polygon'|'line'} kind 几何族
 * @returns {string|undefined} 要素 id
 */
function featureId(state, kind) {
    return kind === 'line' ? state?.line?.id : state?.polygon?.id;
}
