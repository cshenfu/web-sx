/**
 * 测量控制器：复用 DrawAdapter 画线/面/圆，标注长度、面积与半径。
 */

import {
    MEASURE_LABEL_FONT,
    MEASURE_LABEL_LAYER,
    MEASURE_LABEL_SOURCE,
    MEASURE_TOOLS,
    MEASURE_USER_PROP,
} from './constants.js';
import { DRAW_MODES } from './drawModes.js';
import { isMeasureFeature } from './guard.js';
import { buildMeasureLabels } from './labels.js';
import { MeasureControl } from './MeasureControl.js';

const EMPTY_FC = { type: 'FeatureCollection', features: [] };

export class MeasureController {
    /**
     * @param {object} options 依赖
     * @param {{getMap: () => import('maplibre-gl').Map|null}} options.engine 地图引擎
     * @param {import('./DrawAdapter.js').DrawAdapter} options.drawAdapter Draw 适配器
     * @param {import('@platform/query/featureQuery.js').FeatureQuery} [options.featureQuery] 要素查询
     * @param {(text: string) => void} [options.onInfo] 操作提示
     */
    constructor(options) {
        this._engine = options.engine;
        this._draw = options.drawAdapter;
        this._featureQuery = options.featureQuery || null;
        this._onInfo = options.onInfo || null;
        /** @type {import('maplibre-gl').Map|null} */
        this._map = null;
        /** @type {MeasureControl|null} */
        this._control = null;
        /** @type {'length'|'area'|'circle'|null} */
        this._tool = null;
        /** @type {string|null} */
        this._draftId = null;
        this._reentering = false;
        this._entering = false;
        this._ignoreSimpleSelect = false;
        this._raf = 0;
        /** @type {Function[]} */
        this._unsubscribers = [];
        /** @type {((event: Event) => void)|null} */
        this._drawToolbarClick = null;
        this._onStyleData = () => {
            this._recreateLabelsIfMissing();
        };
    }

    /**
     * 挂载独立工具组并订阅 draw 事件。
     *
     * @returns {void}
     */
    init() {
        const map = this._engine.getMap();
        if (!map || this._control) {
            return;
        }
        this._map = map;
        this._control = new MeasureControl({
            onLength: () => this.toggleLength(),
            onArea: () => this.toggleArea(),
            onCircle: () => this.toggleCircle(),
            onClear: () => this.clear(),
        });
        map.addControl(this._control, 'top-right');
        this._bindDrawEvents();
        this._bindDrawToolbar(map);
        this._ensureLabelLayer();
        map.on('styledata', this._onStyleData);
    }

    /**
     * 当前是否处于测距、测面或画圆。
     *
     * @returns {boolean}
     */
    isActive() {
        return this._tool != null;
    }

    /**
     * 当前测量工具。
     *
     * @returns {'length'|'area'|'circle'|null}
     */
    getTool() {
        return this._tool;
    }

    /**
     * 切换测距。
     *
     * @returns {void}
     */
    toggleLength() {
        if (this._tool === MEASURE_TOOLS.LENGTH) {
            this.deactivate({ resetMode: true });
            return;
        }
        this.enter(MEASURE_TOOLS.LENGTH);
    }

    /**
     * 切换测面。
     *
     * @returns {void}
     */
    toggleArea() {
        if (this._tool === MEASURE_TOOLS.AREA) {
            this.deactivate({ resetMode: true });
            return;
        }
        this.enter(MEASURE_TOOLS.AREA);
    }

    /**
     * 切换画圆测半径。
     *
     * @returns {void}
     */
    toggleCircle() {
        if (this._tool === MEASURE_TOOLS.CIRCLE) {
            this.deactivate({ resetMode: true });
            return;
        }
        this.enter(MEASURE_TOOLS.CIRCLE);
    }

    /**
     * 进入测距、测面或画圆，并开始绘制。
     *
     * @param {'length'|'area'|'circle'} tool 工具
     * @returns {void}
     */
    enter(tool) {
        this._entering = true;
        this._disableInterferingTools();
        this._pauseQuery();
        this._cancelDraft();
        this._tool = tool;
        this._control?.setActiveTool(tool);
        this._continueDrawing();
        this._entering = false;
        this._setCanvasCursor('crosshair');
        this._draw.bringLayersToFront?.();
        this._notify(this._hintForTool(tool));
    }

    /**
     * 弹出操作提示。优先用注入回调，兼容 window.showMessage。
     *
     * @param {string} text 文案
     * @returns {void}
     */
    _notify(text) {
        if (this._onInfo) {
            this._onInfo(text);
            return;
        }
        window.showMessage?.(text, 2500);
    }

    /**
     * 进入测量工具时的操作提示。
     *
     * @param {'length'|'area'|'circle'} tool 工具
     * @returns {string} 提示文案
     */
    _hintForTool(tool) {
        if (tool === MEASURE_TOOLS.LENGTH) {
            return '测距：单击加点，双击结束；Esc 退出';
        }
        if (tool === MEASURE_TOOLS.AREA) {
            return '测面：单击加点，双击闭合；Esc 退出';
        }
        return '画圆：单击圆心，再单击确定半径；Esc 退出';
    }

    /**
     * 退出测量绘制并清除本次测量产生的全部几何与标注。
     *
     * @param {object} [options] 选项
     * @param {boolean} [options.resetMode=false] 是否回到 simple_select
     * @returns {void}
     */
    deactivate(options = {}) {
        const resetMode = options.resetMode === true;
        this._tool = null;
        this._draftId = null;
        this._ignoreSimpleSelect = false;
        this._control?.setActiveTool(null);
        this._setCanvasCursor('');
        const measureIds = this._listMeasureIds();
        if (measureIds.length) this._draw.delete(measureIds);
        this._draftId = null;
        if (resetMode && this._draw.getMode() !== DRAW_MODES.SIMPLE_SELECT) {
            this._draw.changeMode(DRAW_MODES.SIMPLE_SELECT);
        }
        this._scheduleLabels();
    }

    /**
     * 只删除测量要素（含当前草稿），不影响标注编辑几何。
     *
     * @returns {void}
     */
    clear() {
        const ids = this._listMeasureIds();
        if (ids.length) {
            this._draw.delete(ids);
        }
        this._draftId = null;
        if (this._tool) {
            this._continueDrawing();
        }
        this._scheduleLabels();
    }

    /**
     * 卸载控件与监听。
     *
     * @returns {void}
     */
    destroy() {
        if (this._raf) {
            cancelAnimationFrame(this._raf);
            this._raf = 0;
        }
        for (const unsub of this._unsubscribers) {
            unsub();
        }
        this._unsubscribers = [];
        if (this._drawToolbarClick) {
            this._map?.getContainer()
                .querySelector('.mapbox-gl-draw_ctrl-draw-btn')
                ?.parentElement
                ?.removeEventListener('click', this._drawToolbarClick, true);
            this._drawToolbarClick = null;
        }
        this._map?.off('styledata', this._onStyleData);
        if (this._map && this._control) {
            this._map.removeControl(this._control);
        }
        this._removeLabelLayer();
        this._control = null;
        this._map = null;
        this._tool = null;
    }

    /**
     * 订阅 draw 增删改与绘制过程刷新。
     *
     * @returns {void}
     */
    _bindDrawEvents() {
        this._unsubscribers.push(
            this._draw.on('create', (payload) => this._onCreate(payload)),
            this._draw.on('update', () => this._scheduleLabels()),
            this._draw.on('delete', () => this._scheduleLabels()),
            this._draw.on('render', () => this._scheduleLabels()),
            this._draw.on('modechange', (payload) => this._onModeChange(payload)),
        );
    }

    /**
     * 点击编辑工具组时退出测量，避免与点/线/面/矩形编辑混用。
     *
     * @param {import('maplibre-gl').Map} map 地图
     * @returns {void}
     */
    _bindDrawToolbar(map) {
        const group = map.getContainer()
            .querySelector('.mapbox-gl-draw_ctrl-draw-btn')
            ?.parentElement;
        if (!group) {
            return;
        }
        this._drawToolbarClick = () => {
            if (this._tool) {
                this.deactivate({ resetMode: false });
            }
        };
        group.addEventListener('click', this._drawToolbarClick, true);
    }

    /**
     * 测量完成：打标并继续同一工具，便于连续测多条。
     *
     * @param {object} payload draw.create payload
     * @returns {void}
     */
    _onCreate(payload) {
        if (!this._tool) {
            return;
        }
        const features = Array.isArray(payload?.features) ? payload.features : [];
        for (const feature of features) {
            if (feature?.id) {
                this._draw.setFeatureProperty(feature.id, MEASURE_USER_PROP, this._tool);
            }
        }
        this._draftId = null;
        this._ignoreSimpleSelect = true;
        this._scheduleLabels();
        window.setTimeout(() => {
            this._ignoreSimpleSelect = false;
            if (this._tool) {
                this._continueDrawing();
            }
        }, 0);
    }

    /**
     * 绘制模式被其它工具抢走或 Esc 取消时，退出测量按钮态。
     *
     * @param {object} payload draw.modechange payload
     * @returns {void}
     */
    _onModeChange(payload) {
        if (this._reentering || this._entering || !this._tool) {
            return;
        }
        const mode = payload?.mode || '';
        const expected = this._modeForTool(this._tool);
        if (mode === expected || mode === DRAW_MODES.DIRECT_SELECT) {
            return;
        }
        if (mode === DRAW_MODES.SIMPLE_SELECT && this._ignoreSimpleSelect) {
            return;
        }
        this.deactivate({ resetMode: false });
    }

    /**
     * 取消当前绘制草稿（不删除已完成的测量要素）。
     *
     * @returns {void}
     */
    _cancelDraft() {
        const drawing = new Set([
            DRAW_MODES.DRAW_POINT,
            DRAW_MODES.DRAW_LINE_STRING,
            DRAW_MODES.DRAW_POLYGON,
            DRAW_MODES.DRAW_RECTANGLE,
            DRAW_MODES.DRAW_CIRCLE,
        ]);
        if (drawing.has(this._draw.getMode())) {
            this._draw.trash();
        }
        this._draftId = null;
    }

    /**
     * 进入对应 draw 模式，并记住本轮草稿 id。
     *
     * @returns {void}
     */
    _continueDrawing() {
        const mode = this._modeForTool(this._tool);
        if (!mode) {
            return;
        }
        this._reentering = true;
        const before = new Set(this._listFeatureIds());
        this._draw.changeMode(mode);
        this._draftId = this._listFeatureIds().find((id) => !before.has(id)) ?? null;
        this._reentering = false;
        if (this._draftId && this._tool) {
            this._draw.setFeatureProperty(this._draftId, MEASURE_USER_PROP, this._tool);
        }
    }

    /**
     * 工具到 draw 模式。
     *
     * @param {'length'|'area'|'circle'|null} tool 工具
     * @returns {string|null} draw 模式名
     */
    _modeForTool(tool) {
        if (tool === MEASURE_TOOLS.LENGTH) {
            return DRAW_MODES.DRAW_LINE_STRING;
        }
        if (tool === MEASURE_TOOLS.AREA) {
            return DRAW_MODES.DRAW_POLYGON;
        }
        if (tool === MEASURE_TOOLS.CIRCLE) {
            return DRAW_MODES.DRAW_CIRCLE;
        }
        return null;
    }

    /**
     * 退出会抢地图点击的其它工具。
     *
     * @returns {void}
     */
    _disableInterferingTools() {
        window.getTurbineMoveController?.()?.exit?.();
        window.getTurbineAddController?.()?.exit?.();
        window.getTurbineAttrQueryController?.()?.exit?.();
        window.getInterpretDetectSelectController?.()?.exit?.();
        window.getTrainBboxPanel?.()?.stopContinuousDraw?.();
    }

    /**
     * 测量时关闭要素查询，避免点击加点同时弹出属性。
     *
     * @returns {void}
     */
    _pauseQuery() {
        if (!this._featureQuery?.isEnabled?.()) {
            return;
        }
        this._featureQuery.disable();
        document.getElementById('queryButton')?.classList.remove('active');
    }

    /**
     * 当前全部 draw 要素 id。
     *
     * @returns {string[]}
     */
    _listFeatureIds() {
        return this._draw.getAll().features.map((f) => f.id).filter(Boolean);
    }

    /**
     * 测量要素与当前草稿 id。
     *
     * @returns {string[]}
     */
    _listMeasureIds() {
        const ids = [];
        for (const feature of this._draw.getAll().features) {
            if (feature.id && (isMeasureFeature(feature) || feature.id === this._draftId)) {
                ids.push(feature.id);
            }
        }
        return ids;
    }

    /**
     * 合并到下一帧刷新标注，避免 draw.render 过于频繁。
     *
     * @returns {void}
     */
    _scheduleLabels() {
        if (this._raf) {
            return;
        }
        this._raf = requestAnimationFrame(() => {
            this._raf = 0;
            this._refreshLabels();
        });
    }

    /**
     * 把已打标几何和当前草稿写成标注图层。
     *
     * @returns {void}
     */
    _refreshLabels() {
        this._ensureLabelLayer();
        const source = this._map?.getSource(MEASURE_LABEL_SOURCE);
        if (!source || typeof source.setData !== 'function') {
            return;
        }
        source.setData(buildMeasureLabels(this._collectLabelFeatures()));
    }

    /**
     * 收集需要标注的要素：已打标 + 测量中的草稿。
     *
     * @returns {object[]}
     */
    _collectLabelFeatures() {
        const out = [];
        for (const feature of this._draw.getAll().features) {
            if (isMeasureFeature(feature) || feature.id === this._draftId) {
                out.push(feature);
            }
        }
        return out;
    }

    /**
     * 底图切换后若标注层丢失则重建；已存在时不要再 moveLayer，避免 styledata 死循环。
     *
     * @returns {void}
     */
    _recreateLabelsIfMissing() {
        const map = this._map;
        if (!map) {
            return;
        }
        const existed = Boolean(map.getLayer(MEASURE_LABEL_LAYER));
        this._ensureLabelLayer();
        if (!existed && map.getLayer(MEASURE_LABEL_LAYER)) {
            this._scheduleLabels();
        }
    }

    /**
     * 测量时使用十字光标，退出时恢复。
     *
     * @param {string} cursor CSS cursor，空字符串表示恢复默认
     * @returns {void}
     */
    _setCanvasCursor(cursor) {
        const canvas = this._map?.getCanvas?.();
        if (canvas) {
            canvas.style.cursor = cursor;
        }
    }

    /**
     * 确保标注 source / layer 存在（底图切换后需重建）。
     *
     * @returns {void}
     */
    _ensureLabelLayer() {
        const map = this._map;
        if (!map) {
            return;
        }
        if (!map.getSource(MEASURE_LABEL_SOURCE)) {
            try {
                map.addSource(MEASURE_LABEL_SOURCE, { type: 'geojson', data: EMPTY_FC });
            } catch (error) {
                console.warn('测量标注数据源创建失败', error);
                return;
            }
        }
        if (map.getLayer(MEASURE_LABEL_LAYER)) {
            return;
        }
        try {
            map.addLayer(this._labelLayerSpec());
        } catch (error) {
            console.warn('测量标注图层创建失败', error);
            return;
        }
        if (map.getLayer(MEASURE_LABEL_LAYER)) {
            map.moveLayer(MEASURE_LABEL_LAYER);
        }
    }

    /**
     * 标注图层样式。
     *
     * @returns {object} MapLibre layer spec
     */
    _labelLayerSpec() {
        return {
            id: MEASURE_LABEL_LAYER,
            type: 'symbol',
            source: MEASURE_LABEL_SOURCE,
            layout: {
                'text-field': ['get', 'measurement'],
                'text-font': MEASURE_LABEL_FONT,
                'text-size': 13,
                'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
                'text-radial-offset': 0.6,
                'text-allow-overlap': true,
            },
            paint: {
                'text-color': '#c2410c',
                'text-halo-color': '#fff',
                'text-halo-width': 1.5,
            },
        };
    }

    /**
     * 移除标注图层与数据源。
     *
     * @returns {void}
     */
    _removeLabelLayer() {
        if (!this._map) {
            return;
        }
        if (this._map.getLayer(MEASURE_LABEL_LAYER)) {
            this._map.removeLayer(MEASURE_LABEL_LAYER);
        }
        if (this._map.getSource(MEASURE_LABEL_SOURCE)) {
            this._map.removeSource(MEASURE_LABEL_SOURCE);
        }
    }
}
