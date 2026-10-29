/**
 * 对角两点画矩形：屏幕轴对齐，四角反投影为经纬度 Polygon。
 */

import { doubleClickZoom } from '../measure/doubleClickZoom.js';
import { DRAW_MODES } from '../measure/drawModes.js';
import { RANGE_ROLE } from './constants.js';

const MIN_PIXEL = 8;

/**
 * 创建带圈选标记的空 Polygon 草稿。
 *
 * @param {object} modeCtx draw 模式上下文（this）
 * @returns {object} draw Feature
 */
function createRectDraft(modeCtx) {
    const rect = modeCtx.newFeature({
        type: 'Feature',
        properties: { role: RANGE_ROLE },
        geometry: { type: 'Polygon', coordinates: [[]] },
    });
    modeCtx.addFeature(rect);
    return rect;
}

/**
 * 把屏幕轴对齐矩形的四角写成闭合环。
 *
 * @param {import('maplibre-gl').Map} map 地图
 * @param {{lng: number, lat: number}} start 起点
 * @param {{lng: number, lat: number}} end 对角点
 * @returns {number[][]|null} 闭合环；过小则 null
 */
function screenRectRing(map, start, end) {
    const p1 = map.project(start);
    const p2 = map.project(end);
    if (Math.abs(p1.x - p2.x) < MIN_PIXEL || Math.abs(p1.y - p2.y) < MIN_PIXEL) {
        return null;
    }
    const minX = Math.min(p1.x, p2.x);
    const maxX = Math.max(p1.x, p2.x);
    const minY = Math.min(p1.y, p2.y);
    const maxY = Math.max(p1.y, p2.y);
    const corners = [
        map.unproject([minX, minY]),
        map.unproject([maxX, minY]),
        map.unproject([maxX, maxY]),
        map.unproject([minX, maxY]),
    ];
    const ring = corners.map((point) => [point.lng, point.lat]);
    ring.push(ring[0]);
    return ring;
}

/**
 * 把环写进草稿要素。
 *
 * @param {object} rect draw Polygon Feature
 * @param {number[][]} ring 闭合环
 * @returns {void}
 */
function applyRing(rect, ring) {
    for (let i = 0; i < ring.length; i += 1) {
        rect.updateCoordinate(`0.${i}`, ring[i][0], ring[i][1]);
    }
    rect.setProperty('role', RANGE_ROLE);
}

/**
 * 闭合矩形并退出绘制。direct_select 需要 featureId（单数）。
 *
 * @param {object} modeCtx draw 模式上下文（this）
 * @param {object} state 模式状态
 * @param {{lng: number, lat: number}} end 对角点
 * @returns {boolean} 已完成则为 true
 */
function finishRectangle(modeCtx, state, end) {
    if (!state.start || state.done) {
        return false;
    }
    const ring = screenRectRing(modeCtx.map, state.start, end);
    if (!ring) {
        return false;
    }
    applyRing(state.rect, ring);
    state.done = true;
    modeCtx.updateUIClasses({ mouse: 'pointer' });
    modeCtx.changeMode(DRAW_MODES.SIMPLE_SELECT, {
        featureIds: [state.rect.id],
    });
    return true;
}

/**
 * 事件里的经纬度。
 *
 * @param {object} e 地图事件
 * @returns {{lng: number, lat: number}}
 */
function eventPoint(e) {
    return { lng: e.lngLat.lng, lat: e.lngLat.lat };
}

const DrawRectangle = {
    /**
     * 进入画矩形模式。
     *
     * @returns {{rect: object, start: object|null, done: boolean}} 模式状态
     */
    onSetup() {
        const rect = createRectDraft(this);
        this.clearSelectedFeatures();
        doubleClickZoom.disable(this);
        this.updateUIClasses({ mouse: 'add' });
        this.setActionableState({ trash: true });
        return { rect, start: null, done: false };
    },

    /**
     * 触摸：等价于移动预览 + 点击落点。
     *
     * @param {object} state 模式状态
     * @param {object} e 地图事件
     * @returns {void}
     */
    onTap(state, e) {
        if (state.start) {
            this.onMouseMove(state, e);
        }
        this.onClick(state, e);
    },

    /**
     * 点击：第一次定点，第二次完成矩形。
     *
     * @param {object} state 模式状态
     * @param {object} e 地图点击事件（含 lngLat）
     * @returns {void}
     */
    onClick(state, e) {
        const point = eventPoint(e);
        if (!state.start) {
            state.start = point;
            return;
        }
        finishRectangle(this, state, point);
    },

    /**
     * 点在预览面上时仍按完成处理。
     *
     * @param {object} state 模式状态
     * @param {object} e 地图事件
     * @returns {void}
     */
    clickOnFeature(state, e) {
        this.onClick(state, e);
    },

    /**
     * 空白处点击与 onClick 相同。
     *
     * @param {object} state 模式状态
     * @param {object} e 地图事件
     * @returns {void}
     */
    clickAnywhere(state, e) {
        this.onClick(state, e);
    },

    /**
     * 按下作为起点，支持拖拽画矩形。
     *
     * @param {object} state 模式状态
     * @param {object} e 地图事件
     * @returns {void}
     */
    onMouseDown(state, e) {
        if (!state.start) {
            state.start = eventPoint(e);
        }
    },

    /**
     * 松开时若已经够大则完成。
     *
     * @param {object} state 模式状态
     * @param {object} e 地图事件
     * @returns {void}
     */
    onMouseUp(state, e) {
        finishRectangle(this, state, eventPoint(e));
    },

    /**
     * 拖拽时同步预览。
     *
     * @param {object} state 模式状态
     * @param {object} e 地图事件
     * @returns {void}
     */
    onDrag(state, e) {
        this.onMouseMove(state, e);
    },

    /**
     * 鼠标移动时按对角更新矩形预览。
     *
     * @param {object} state 模式状态
     * @param {object} e 地图移动事件（含 lngLat）
     * @returns {void}
     */
    onMouseMove(state, e) {
        if (!state.start) {
            return;
        }
        const end = { lng: e.lngLat.lng, lat: e.lngLat.lat };
        const ring = screenRectRing(this.map, state.start, end);
        if (ring) {
            applyRing(state.rect, ring);
        }
    },

    /**
     * Esc 取消当前草稿并退出。
     *
     * @param {object} state 模式状态
     * @param {KeyboardEvent} e 键盘事件
     * @returns {void}
     */
    onKeyUp(state, e) {
        if (e.keyCode === 27 || e.key === 'Escape') {
            this.deleteFeature([state.rect.id], { silent: true });
            this.changeMode(DRAW_MODES.SIMPLE_SELECT);
        }
    },

    /**
     * 离开模式：恢复双击缩放并触发 create 或清理无效要素。
     *
     * @param {object} state 模式状态
     * @returns {void}
     */
    onStop(state) {
        doubleClickZoom.enable(this);
        this.updateUIClasses({ mouse: 'none' });
        this.activateUIButton();
        if (this.getFeature(state.rect.id) === undefined) {
            return;
        }
        if (state.rect.isValid()) {
            this.map.fire('draw.create', { features: [state.rect.toGeoJSON()] });
            return;
        }
        this.deleteFeature([state.rect.id], { silent: true });
        this.changeMode(DRAW_MODES.SIMPLE_SELECT, {}, { silent: true });
    },

    /**
     * 控制矩形在绘制过程中的显示。
     *
     * @param {object} state 模式状态
     * @param {object} geojson 待展示的 GeoJSON
     * @param {Function} display draw 内部渲染回调
     * @returns {void}
     */
    toDisplayFeatures(state, geojson, display) {
        const isActive = geojson.properties.id === state.rect.id;
        geojson.properties.active = isActive ? 'true' : 'false';
        if (!isActive) {
            display(geojson);
            return;
        }
        if (state.start) {
            display(geojson);
        }
    },

    /**
     * Trash：删除草稿并回到选择模式。
     *
     * @param {object} state 模式状态
     * @returns {void}
     */
    onTrash(state) {
        this.deleteFeature([state.rect.id], { silent: true });
        this.changeMode(DRAW_MODES.SIMPLE_SELECT);
    },
};

export { DrawRectangle };
export default DrawRectangle;
