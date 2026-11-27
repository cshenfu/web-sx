/**
 * 测量用 maplibre-gl-draw 适配器（不显示原生编辑按钮）。
 * 加载策略与 whln-web-edit 相同：优先全局 MapboxDraw，否则动态 import ESM。
 */

import { DrawOrientedRectangle } from '@whln/vector-edit';
import { DrawRectangle } from '../draw/DrawRectangle.js';
import { finishOnDoubleClick } from '../draw/finishOnDoubleClick.js';
import { withRangeDrawStyles } from '../draw/rangeStyles.js';
import { DrawCircle } from './DrawCircle.js';
import { DRAW_MODES } from './drawModes.js';

const DRAW_ESM_URL = 'https://nexus.wh-ge.com/repository/raw-group-jsdelivr/npm/maplibre-gl-draw@1.6.9/dist/mapbox-gl-draw.js';
const DRAW_CSS_URL = 'https://nexus.wh-ge.com/repository/raw-group-jsdelivr/npm/maplibre-gl-draw@1.6.9/dist/mapbox-gl-draw.css';

/** @type {typeof MapboxDraw|null} */
let cachedDrawClass = null;

/**
 * 注入 draw 样式表（与编辑端 index.html 同源）。
 *
 * @returns {void}
 */
function ensureDrawCss() {
    if (document.getElementById('maplibre-gl-draw-css')) {
        return;
    }
    const link = document.createElement('link');
    link.id = 'maplibre-gl-draw-css';
    link.rel = 'stylesheet';
    link.href = DRAW_CSS_URL;
    document.head.appendChild(link);
}

/**
 * 修正 MapLibre 与 mapbox-gl-draw 的控件类名差异。
 *
 * @param {typeof MapboxDraw} DrawClass Draw 构造函数
 * @returns {void}
 */
function applyMapLibreCompat(DrawClass) {
    if (!DrawClass?.constants?.classes) {
        return;
    }
    const { classes } = DrawClass.constants;
    classes.CONTROL_BASE = 'maplibregl-ctrl';
    classes.CONTROL_PREFIX = 'maplibregl-ctrl-';
    classes.CONTROL_GROUP = 'maplibregl-ctrl-group';
    if ('CANVAS' in classes) {
        classes.CANVAS = 'maplibregl-canvas';
    }
}

/**
 * 放大顶点/手柄视觉半径，便于命中。
 *
 * @param {object[]} styles draw 默认样式表
 * @returns {object[]} 调整后的样式
 */
function withLargerVertexHandles(styles) {
    if (!Array.isArray(styles)) {
        return styles;
    }
    return styles.map((style) => {
        const id = String(style?.id || '');
        if (!id.includes('vertex') || style?.paint?.['circle-radius'] == null) {
            return style;
        }
        const radius = Number(style.paint['circle-radius']);
        if (!Number.isFinite(radius)) {
            return style;
        }
        const bump = id.includes('halo') ? 4 : 3;
        return {
            ...style,
            paint: {
                ...style.paint,
                'circle-radius': radius + bump,
            },
        };
    });
}

/**
 * 加载 Draw 构造函数（UMD 全局或 ESM 动态导入）。
 *
 * @returns {Promise<typeof MapboxDraw>}
 */
async function loadDrawClass() {
    if (cachedDrawClass) {
        return cachedDrawClass;
    }
    let DrawClass = typeof window !== 'undefined' && window.MapboxDraw
        ? window.MapboxDraw
        : null;
    if (!DrawClass) {
        const mod = await import(/* @vite-ignore */ DRAW_ESM_URL);
        DrawClass = mod.default;
    }
    if (!DrawClass) {
        throw new Error('maplibre-gl-draw 加载失败');
    }
    applyMapLibreCompat(DrawClass);
    cachedDrawClass = DrawClass;
    return DrawClass;
}

export class DrawAdapter {
    /**
     * @param {{getMap: () => import('maplibre-gl').Map|null}} engine 地图引擎
     * @param {object} [options] 配置
     * @param {string} [options.controlPosition='top-right'] 控件位置
     */
    constructor(engine, options = {}) {
        this._engine = engine;
        this._options = options;
        this._draw = null;
        /** @type {Map<string, Set<Function>>} */
        this._listeners = new Map();
        this._mounted = false;
        /** @type {((event: KeyboardEvent) => void)|null} */
        this._escHandler = null;
    }

    /**
     * 挂载 draw 控件到地图（隐藏原生按钮，仅供测量复用）。
     *
     * @returns {Promise<void>}
     */
    async mount() {
        if (this._mounted) {
            return;
        }
        const map = this._engine.getMap();
        if (!map) {
            throw new Error('地图未初始化，无法挂载 draw 控件');
        }
        ensureDrawCss();
        const DrawClass = this._options.DrawClass || await loadDrawClass();
        applyMapLibreCompat(DrawClass);
        this._draw = this._createDraw(DrawClass);
        map.addControl(this._draw, this._options.controlPosition || 'top-right');
        this._hideEmptyNativeGroup(map);
        this._bindDrawEvents(map);
        this._bindEscape();
        this.bringLayersToFront();
        this._mounted = true;
    }

    /**
     * 创建 draw 实例：注册画圆 / 圈选矩形 / 三点旋转矩形，关掉原生工具条。
     *
     * @param {typeof MapboxDraw} DrawClass 构造函数
     * @returns {object} draw 实例
     */
    _createDraw(DrawClass) {
        const modes = {
            ...DrawClass.modes,
            [DRAW_MODES.DRAW_CIRCLE]: DrawCircle,
            [DRAW_MODES.DRAW_RECTANGLE]: DrawRectangle,
            [DRAW_MODES.DRAW_ORIENTED_RECTANGLE]: DrawOrientedRectangle,
            [DRAW_MODES.DRAW_POLYGON]: finishOnDoubleClick(
                DrawClass.modes.draw_polygon, 'polygon',
            ),
            [DRAW_MODES.DRAW_LINE_STRING]: finishOnDoubleClick(
                DrawClass.modes.draw_line_string, 'line',
            ),
        };
        const baseStyles = DrawClass.lib?.theme || DrawClass.styles;
        let styles = Array.isArray(baseStyles) ? withLargerVertexHandles(baseStyles) : null;
        if (styles && this._options.rangeTheme) {
            styles = withRangeDrawStyles(styles);
        }
        return new DrawClass({
            keybindings: true,
            touchEnabled: true,
            boxSelect: false,
            clickBuffer: 14,
            touchBuffer: 28,
            displayControlsDefault: false,
            controls: {
                point: false,
                line_string: false,
                polygon: false,
                trash: false,
                combine_features: false,
                uncombine_features: false,
            },
            modes,
            defaultMode: DRAW_MODES.SIMPLE_SELECT,
            userProperties: true,
            suppressAPIEvents: false,
            ...(styles ? { styles } : {}),
        });
    }

    /**
     * 原生按钮全关时仍可能留下空控件组，藏掉以免占位。
     *
     * @param {import('maplibre-gl').Map} map 地图
     * @returns {void}
     */
    _hideEmptyNativeGroup(map) {
        map.getContainer().querySelectorAll('.maplibregl-ctrl-group').forEach((group) => {
            if (!group.querySelector('button')) {
                group.style.display = 'none';
            }
        });
    }

    /**
     * Esc 取消当前草稿（draw 原生键事件只绑在地图容器上）。
     *
     * @returns {void}
     */
    _bindEscape() {
        this._escHandler = (event) => {
            if (event.key !== 'Escape' || event.defaultPrevented) {
                return;
            }
            if (!this._draw) {
                return;
            }
            const mode = this._draw.getMode();
            const drawing = new Set([
                DRAW_MODES.DRAW_LINE_STRING,
                DRAW_MODES.DRAW_POLYGON,
                DRAW_MODES.DRAW_CIRCLE,
                DRAW_MODES.DRAW_RECTANGLE,
                DRAW_MODES.DRAW_ORIENTED_RECTANGLE,
            ]);
            if (!drawing.has(mode)) {
                return;
            }
            this._draw.trash();
            event.preventDefault();
        };
        document.addEventListener('keydown', this._escHandler);
    }

    /**
     * 将全部 gl-draw 图层移到最顶。
     *
     * @returns {void}
     */
    bringLayersToFront() {
        const map = this._engine.getMap();
        const layers = map?.getStyle()?.layers;
        if (!layers?.length) {
            return;
        }
        for (const layer of layers) {
            if (typeof layer.id === 'string' && layer.id.startsWith('gl-draw')) {
                map.moveLayer(layer.id);
            }
        }
    }

    /**
     * 绑定 draw 原生事件并转发。
     *
     * @param {import('maplibre-gl').Map} map 地图
     * @returns {void}
     */
    _bindDrawEvents(map) {
        const events = ['create', 'delete', 'update', 'modechange', 'render'];
        for (const name of events) {
            map.on(`draw.${name}`, (event) => {
                const set = this._listeners.get(name);
                if (!set) {
                    return;
                }
                set.forEach((fn) => fn(event));
            });
        }
    }

    /**
     * 订阅 draw 原生事件。
     *
     * @param {string} event 事件名
     * @param {Function} handler 处理函数
     * @returns {Function} 取消订阅函数
     */
    on(event, handler) {
        if (!this._listeners.has(event)) {
            this._listeners.set(event, new Set());
        }
        this._listeners.get(event).add(handler);
        return () => this._listeners.get(event)?.delete(handler);
    }

    /**
     * 获取全部要素。
     *
     * @returns {object} GeoJSON FeatureCollection
     */
    getAll() {
        this._ensureDraw();
        return this._draw.getAll();
    }

    /**
     * 写入 GeoJSON Feature 或 FeatureCollection。
     *
     * @param {object} geojson GeoJSON
     * @returns {string[]} 新要素 id
     */
    add(geojson) {
        this._ensureDraw();
        return this._draw.add(geojson);
    }

    /**
     * 获取当前绘制模式。
     *
     * @returns {string}
     */
    getMode() {
        this._ensureDraw();
        return this._draw.getMode();
    }

    /**
     * 返回内部 MapboxDraw，供矢量编辑插件注入同一实例。
     *
     * @returns {object|null} 原生 Draw
     */
    getNative() {
        return this._draw;
    }

    /**
     * 设置要素属性。
     *
     * @param {string} featureId 要素 id
     * @param {string} property 属性名
     * @param {*} value 属性值
     * @returns {DrawAdapter}
     */
    setFeatureProperty(featureId, property, value) {
        this._ensureDraw();
        this._draw.setFeatureProperty(featureId, property, value);
        return this;
    }

    /**
     * 切换绘制模式。
     *
     * @param {string} mode 模式名
     * @param {object} [modeOptions] 模式参数
     * @returns {DrawAdapter}
     */
    changeMode(mode, modeOptions) {
        this._ensureDraw();
        this._draw.changeMode(mode, modeOptions);
        return this;
    }

    /**
     * 按 id 删除要素。
     *
     * @param {string|string[]} ids 要素 id
     * @returns {DrawAdapter}
     */
    delete(ids) {
        this._ensureDraw();
        this._draw.delete(ids);
        return this;
    }

    /**
     * 取消当前草稿或删除选中。
     *
     * @returns {DrawAdapter}
     */
    trash() {
        this._ensureDraw();
        this._draw.trash();
        return this;
    }

    /**
     * 删除全部要素。
     *
     * @returns {DrawAdapter}
     */
    deleteAll() {
        this._ensureDraw();
        if (typeof this._draw.deleteAll === 'function') {
            this._draw.deleteAll();
            return this;
        }
        const ids = this.getAll().features.map((item) => item.id);
        if (ids.length) {
            this._draw.delete(ids);
        }
        return this;
    }

    /**
     * 卸载 draw 控件。
     *
     * @returns {void}
     */
    destroy() {
        if (this._escHandler) {
            document.removeEventListener('keydown', this._escHandler);
            this._escHandler = null;
        }
        const map = this._engine.getMap();
        if (map && this._draw) {
            try {
                map.removeControl(this._draw);
            } catch {
                // 地图销毁时控件可能已随容器移除
            }
        }
        this._draw = null;
        this._listeners.clear();
        this._mounted = false;
    }

    /**
     * 确保 draw 已挂载。
     *
     * @returns {void}
     */
    _ensureDraw() {
        if (!this._draw) {
            throw new Error('DrawAdapter 未挂载，请先调用 mount()');
        }
    }
}
