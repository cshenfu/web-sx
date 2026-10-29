/** 中键拖拽平移。MapLibre 6 的 dragPan 只认左键，这里补上中键。 */

const LEFT_BUTTON = 0;
const MIDDLE_BUTTON = 1;
const CAPTURE = { capture: true };

/** MouseEvent.button → MouseEvent.buttons 位。中键官方状态机未收录。 */
const BUTTON_FLAGS = {
    0: 1,
    1: 4,
    2: 2,
};

/**
 * 左键（无 Ctrl）或中键是否应开始平移。
 *
 * @param {MouseEvent} event 鼠标按下事件
 * @returns {boolean} 应开始平移时为 true
 */
function isPanStart(event) {
    return (event.button === LEFT_BUTTON && !event.ctrlKey)
        || event.button === MIDDLE_BUTTON;
}

/**
 * 起始键是否仍按住。
 *
 * @param {MouseEvent} event 鼠标移动事件
 * @param {number|undefined} button 起始键 MouseEvent.button
 * @returns {boolean} 仍按住时为 true
 */
function isButtonHeld(event, button) {
    const flag = BUTTON_FLAGS[button];
    if (flag == null) {
        return false;
    }
    return event.buttons === undefined || (event.buttons & flag) === flag;
}

/**
 * 取出 dragPan 内部的鼠标状态机。
 *
 * @param {import('maplibre-gl').Map} map 地图
 * @returns {object|null} 状态机；结构变化时为 null
 */
function mousePanStateManager(map) {
    return map?.dragPan?._mousePan?._moveStateManager ?? null;
}

/**
 * 让官方 dragPan 同时接受中键，平移手感与左键一致。
 *
 * @param {import('maplibre-gl').Map} map 地图
 * @returns {boolean} 补丁成功时为 true
 */
function patchOfficialDragPan(map) {
    const manager = mousePanStateManager(map);
    if (!manager) {
        return false;
    }
    manager._correctEvent = isPanStart;
    manager.isValidMoveEvent = function isValidMoveEvent(event) {
        return isButtonHeld(event, this._eventButton);
    };
    return true;
}

/**
 * 阻止中键触发浏览器自动滚动。
 *
 * @param {MouseEvent} event 鼠标事件
 * @returns {void}
 */
function preventMiddleAutoscroll(event) {
    if (event.button === MIDDLE_BUTTON) {
        event.preventDefault();
    }
}

/**
 * 用 panBy 实现中键平移（官方 handler 补丁失败时）。
 *
 * @param {import('maplibre-gl').Map} map 地图
 * @returns {() => void} 取消绑定
 */
function bindPanByFallback(map) {
    const drag = { active: false, x: 0, y: 0 };
    const canvas = map.getCanvas();

    function onDown(event) {
        if (event.button !== MIDDLE_BUTTON) {
            return;
        }
        drag.active = true;
        drag.x = event.clientX;
        drag.y = event.clientY;
        map.stop();
    }

    function onMove(event) {
        if (!drag.active) {
            return;
        }
        const dx = event.clientX - drag.x;
        const dy = event.clientY - drag.y;
        drag.x = event.clientX;
        drag.y = event.clientY;
        map.panBy([-dx, -dy], { animate: false });
    }

    function onUp(event) {
        if (event.button === MIDDLE_BUTTON) {
            drag.active = false;
        }
    }

    canvas.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
        canvas.removeEventListener('mousedown', onDown);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        drag.active = false;
    };
}

/**
 * 启用中键拖拽平移，并挡住浏览器中键自动滚动。
 *
 * @param {import('maplibre-gl').Map} map 地图
 * @returns {() => void} 取消绑定
 */
export function bindMiddleButtonPan(map) {
    const el = map.getCanvasContainer();
    const patched = patchOfficialDragPan(map);
    el.addEventListener('mousedown', preventMiddleAutoscroll, CAPTURE);
    el.addEventListener('auxclick', preventMiddleAutoscroll, CAPTURE);
    const unbindFallback = patched ? null : bindPanByFallback(map);
    return () => {
        el.removeEventListener('mousedown', preventMiddleAutoscroll, CAPTURE);
        el.removeEventListener('auxclick', preventMiddleAutoscroll, CAPTURE);
        unbindFallback?.();
    };
}
