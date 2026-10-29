/**
 * maplibre-gl-draw 自定义画圆模式（测距半径）。
 * 首次点击定圆心，移动实时预览，再次点击完成，生成测地线圆 Polygon。
 */

import {
    MEASURE_CENTER_LAT_PROP,
    MEASURE_CENTER_LNG_PROP,
    MEASURE_RADIUS_M_PROP,
    MEASURE_TOOLS,
    MEASURE_USER_PROP,
} from './constants.js';
import { doubleClickZoom } from './doubleClickZoom.js';
import { DRAW_MODES } from './drawModes.js';
import { geodesicCircleRing, haversineMeters } from './geodesic.js';

/** 圆周离散点数（含闭合点由 geodesicCircleRing 追加） */
const CIRCLE_STEPS = 64;

/**
 * 创建空圆形 Polygon 草稿（预先打上测量标记，避免预览被当成测面）。
 *
 * @param {object} modeCtx draw 模式上下文（this）
 * @returns {object} draw Feature
 */
function createCircleDraft(modeCtx) {
    const circle = modeCtx.newFeature({
        type: 'Feature',
        properties: {
            [MEASURE_USER_PROP]: MEASURE_TOOLS.CIRCLE,
        },
        geometry: {
            type: 'Polygon',
            coordinates: [[]],
        },
    });
    modeCtx.addFeature(circle);
    return circle;
}

/**
 * 把圆心与半径写入要素，供测量标注读取。
 *
 * @param {object} circle draw Polygon Feature
 * @param {number[]} center 圆心 [lng, lat]
 * @param {number} radiusM 半径，单位米
 * @returns {void}
 */
function stampCircleMeasureProps(circle, center, radiusM) {
    circle.setProperty(MEASURE_USER_PROP, MEASURE_TOOLS.CIRCLE);
    circle.setProperty(MEASURE_RADIUS_M_PROP, radiusM);
    circle.setProperty(MEASURE_CENTER_LNG_PROP, center[0]);
    circle.setProperty(MEASURE_CENTER_LAT_PROP, center[1]);
}

/**
 * 按圆心与当前点更新圆周坐标。
 *
 * @param {object} circle draw Polygon Feature
 * @param {number[]} center 圆心 [lng, lat]
 * @param {number[]} edge 圆周上一点 [lng, lat]
 * @returns {number} 半径（米）；过小则返回 0
 */
function applyCircleRing(circle, center, edge) {
    const radiusM = haversineMeters(center, edge);
    if (radiusM <= 0) {
        return 0;
    }
    const ring = geodesicCircleRing(center, radiusM, CIRCLE_STEPS);
    for (let i = 0; i < ring.length; i += 1) {
        circle.updateCoordinate(`0.${i}`, ring[i][0], ring[i][1]);
    }
    stampCircleMeasureProps(circle, center, radiusM);
    return radiusM;
}

/**
 * 绘制过程中显示圆心到落点的半径线。
 *
 * @param {object} state 模式状态
 * @param {string} parentId 圆要素 id
 * @param {Function} display draw 内部渲染回调
 * @returns {void}
 */
function displayRadiusRay(state, parentId, display) {
    if (!state.center || !state.edge) {
        return;
    }
    display({
        type: 'Feature',
        properties: {
            id: `${parentId}-radius`,
            meta: 'feature',
            active: 'true',
        },
        geometry: {
            type: 'LineString',
            coordinates: [state.center, state.edge],
        },
    });
}

const DrawCircle = {
    /**
     * 进入画圆模式。
     *
     * @returns {{circle: object, center: number[]|null, edge: number[]|null}} 模式状态
     */
    onSetup() {
        const circle = createCircleDraft(this);
        this.clearSelectedFeatures();
        doubleClickZoom.disable(this);
        this.updateUIClasses({ mouse: 'add' });
        this.setActionableState({ trash: true });
        return { circle, center: null, edge: null };
    },

    /**
     * 触摸：等价于移动预览 + 点击落点。
     *
     * @param {object} state 模式状态
     * @param {object} e 地图事件
     * @returns {void}
     */
    onTap(state, e) {
        if (state.center) {
            this.onMouseMove(state, e);
        }
        this.onClick(state, e);
    },

    /**
     * 点击：第一次定圆心，第二次完成圆。
     *
     * @param {object} state 模式状态
     * @param {object} e 地图点击事件（含 lngLat）
     * @returns {void}
     */
    onClick(state, e) {
        const lng = e.lngLat.lng;
        const lat = e.lngLat.lat;
        if (!state.center) {
            state.center = [lng, lat];
            return;
        }
        if (state.center[0] === lng && state.center[1] === lat) {
            return;
        }
        state.edge = [lng, lat];
        const radiusM = applyCircleRing(state.circle, state.center, state.edge);
        if (radiusM <= 0) {
            return;
        }
        this.updateUIClasses({ mouse: 'pointer' });
        this.changeMode(DRAW_MODES.SIMPLE_SELECT, { featureIds: [state.circle.id] });
    },

    /**
     * 鼠标移动时按半径更新圆预览。
     *
     * @param {object} state 模式状态
     * @param {object} e 地图移动事件（含 lngLat）
     * @returns {void}
     */
    onMouseMove(state, e) {
        if (!state.center) {
            return;
        }
        state.edge = [e.lngLat.lng, e.lngLat.lat];
        applyCircleRing(state.circle, state.center, state.edge);
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
            this.deleteFeature([state.circle.id], { silent: true });
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
        if (this.getFeature(state.circle.id) === undefined) {
            return;
        }
        if (state.circle.isValid()) {
            this.map.fire('draw.create', {
                features: [state.circle.toGeoJSON()],
            });
            return;
        }
        this.deleteFeature([state.circle.id], { silent: true });
        this.changeMode(DRAW_MODES.SIMPLE_SELECT, {}, { silent: true });
    },

    /**
     * 控制圆在绘制过程中的显示。
     *
     * @param {object} state 模式状态
     * @param {object} geojson 待展示的 GeoJSON
     * @param {Function} display draw 内部渲染回调
     * @returns {void}
     */
    toDisplayFeatures(state, geojson, display) {
        const isActive = geojson.properties.id === state.circle.id;
        geojson.properties.active = isActive ? 'true' : 'false';
        if (!isActive) {
            display(geojson);
            return;
        }
        if (!state.center) {
            return;
        }
        display(geojson);
        displayRadiusRay(state, geojson.properties.id, display);
    },

    /**
     * Trash：删除草稿并回到选择模式。
     *
     * @param {object} state 模式状态
     * @returns {void}
     */
    onTrash(state) {
        this.deleteFeature([state.circle.id], { silent: true });
        this.changeMode(DRAW_MODES.SIMPLE_SELECT);
    },
};

export { DrawCircle };
export default DrawCircle;
