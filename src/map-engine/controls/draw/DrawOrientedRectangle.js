/**
 * 三点旋转矩形绘制模式。
 *
 * 第一点和第二点确定矩形底边，第三点确定矩形宽度与朝向。
 * 完全基于 MapLibre GL Draw 的模式 API，不依赖 @whln/vector-edit。
 */

import { doubleClickZoom } from '../measure/doubleClickZoom.js';
import { DRAW_MODES } from '../measure/drawModes.js';
import { RANGE_ROLE } from './constants.js';

const MIN_PIXEL = 8;

function createDraft(ctx) {
    const feature = ctx.newFeature({
        type: 'Feature',
        properties: { role: RANGE_ROLE },
        geometry: { type: 'Polygon', coordinates: [[]] },
    });
    ctx.addFeature(feature);
    return feature;
}

function toScreen(map, point) {
    return map.project([point.lng, point.lat]);
}

function buildRing(map, start, end, widthPoint) {
    if (!start || !end || !widthPoint) return null;

    const a = toScreen(map, start);
    const b = toScreen(map, end);
    const c = toScreen(map, widthPoint);

    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const length = Math.hypot(dx, dy);
    if (length < MIN_PIXEL) return null;

    // 将第三点投影到底边法线方向，得到有符号宽度。
    const offset = ((c.x - a.x) * -dy + (c.y - a.y) * dx) / length;
    if (Math.abs(offset) < MIN_PIXEL) return null;

    const nx = -dy / length;
    const ny = dx / length;
    const corners = [
        [a.x, a.y],
        [b.x, b.y],
        [b.x + nx * offset, b.y + ny * offset],
        [a.x + nx * offset, a.y + ny * offset],
    ];

    const ring = corners.map(([x, y]) => {
        const point = map.unproject([x, y]);
        return [point.lng, point.lat];
    });
    ring.push(ring[0]);
    return ring;
}

function applyRing(feature, ring) {
    ring.forEach((coordinate, index) => {
        feature.updateCoordinate(`0.${index}`, coordinate[0], coordinate[1]);
    });
    feature.setProperty('role', RANGE_ROLE);
}

function finish(ctx, state, widthPoint) {
    const ring = buildRing(ctx.map, state.start, state.end, widthPoint);
    if (!ring) return false;

    applyRing(state.feature, ring);
    state.done = true;
    ctx.updateUIClasses({ mouse: 'pointer' });
    ctx.changeMode(DRAW_MODES.SIMPLE_SELECT, {
        featureIds: [state.feature.id],
    });
    return true;
}

function eventPoint(event) {
    return { lng: event.lngLat.lng, lat: event.lngLat.lat };
}

const DrawOrientedRectangle = {
    onSetup() {
        const feature = createDraft(this);
        this.clearSelectedFeatures();
        doubleClickZoom.disable(this);
        this.updateUIClasses({ mouse: 'add' });
        this.setActionableState({ trash: true });
        return {
            feature,
            start: null,
            end: null,
            widthPoint: null,
            done: false,
        };
    },

    onClick(state, event) {
        if (state.done) return;
        const point = eventPoint(event);

        if (!state.start) {
            state.start = point;
            return;
        }

        if (!state.end) {
            state.end = point;
            return;
        }

        finish(this, state, point);
    },

    onTap(state, event) {
        if (state.end) this.onMouseMove(state, event);
        this.onClick(state, event);
    },

    clickOnFeature(state, event) {
        this.onClick(state, event);
    },

    clickAnywhere(state, event) {
        this.onClick(state, event);
    },

    onMouseMove(state, event) {
        if (!state.start || !state.end || state.done) return;
        const point = eventPoint(event);
        state.widthPoint = point;
        const ring = buildRing(this.map, state.start, state.end, point);
        if (ring) applyRing(state.feature, ring);
    },

    onKeyUp(state, event) {
        if (event.keyCode === 27 || event.key === 'Escape') {
            this.deleteFeature([state.feature.id], { silent: true });
            this.changeMode(DRAW_MODES.SIMPLE_SELECT);
        }
    },

    onStop(state) {
        doubleClickZoom.enable(this);
        this.updateUIClasses({ mouse: 'none' });
        this.activateUIButton();

        if (this.getFeature(state.feature.id) === undefined) return;
        if (state.feature.isValid()) {
            this.map.fire('draw.create', {
                features: [state.feature.toGeoJSON()],
            });
            return;
        }

        this.deleteFeature([state.feature.id], { silent: true });
        this.changeMode(DRAW_MODES.SIMPLE_SELECT, {}, { silent: true });
    },

    toDisplayFeatures(state, geojson, display) {
        const active = geojson.properties.id === state.feature.id;
        geojson.properties.active = active ? 'true' : 'false';
        if (!active || state.start) display(geojson);
    },

    onTrash(state) {
        this.deleteFeature([state.feature.id], { silent: true });
        this.changeMode(DRAW_MODES.SIMPLE_SELECT);
    },
};

export { DrawOrientedRectangle };
export default DrawOrientedRectangle;
