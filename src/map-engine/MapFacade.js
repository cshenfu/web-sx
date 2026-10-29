/** 业务唯一依赖的地图门面。不暴露 MapLibre 实例。 */

import { RANGE_OVERLIMIT_PROP, RANGE_ROLE } from './controls/draw/constants.js';
import { MapViewControls } from './controls/view/index.js';
import {
    destroyMeasureModule,
    DrawAdapter,
    initMeasureModule,
    MEASURE_TOOLS,
} from './controls/measure/index.js';
import { DRAW_MODES } from './controls/measure/drawModes.js';
import { formatScale } from './services/geodesic.js';
import { POLYGON_STYLE, markerStyle } from './services/overlayStyles.js';

const CLICK_FLY_SECONDS = 2.5;
const CLICK_MIN_HEIGHT = 1000;

/**
 * 定位点要素。
 *
 * @param {number} lng 经度
 * @param {number} lat 纬度
 * @returns {object} FeatureCollection
 */
function markerCollection(lng, lat) {
    return {
        type: 'FeatureCollection',
        features: [{
            type: 'Feature',
            properties: { role: 'icon' },
            geometry: { type: 'Point', coordinates: [lng, lat] },
        }],
    };
}

class MapFacade {
    /**
     * @param {object} port 地图端口
     * @param {object} [options] 标记图标、提示回调与控件开关
     */
    constructor(port, options = {}) {
        this._port = port;
        this._options = options;
        this._listeners = {
            click: new Set(),
            pointermove: new Set(),
            scale: new Set(),
            viewchange: new Set(),
            range: new Set(),
        };
        this._viewControl = null;
        this._drawAdapter = null;
        this._measureController = null;
        this._mapControlsInstalled = false;
        this._scaleFrame = 0;
        this._bindPort();
    }

    /**
     * 初始化底层地图；默认同时挂上视图 / 测量控件。
     *
     * @param {HTMLElement|string} container 容器
     * @returns {Promise<void>}
     */
    init(container) {
        return this._port.init(container, this._options.map || {}).then(() => {
            if (!this._options.deferControls) {
                return this.installMapControls();
            }
        });
    }

    /**
     * 挂上全景 / 2D·3D 与测距控件。deferControls 时由宿主在 layer-control 之后调用。
     *
     * @returns {Promise<void>}
     */
    async installMapControls() {
        if (this._mapControlsInstalled) {
            return;
        }
        await this._installControls();
        this._mapControlsInstalled = true;
    }

    /**
     * 订阅门面事件。测量进行中不向外抛 click。
     *
     * @param {'click'|'pointermove'|'scale'|'viewchange'|'range'} type 事件名
     * @param {Function} handler 处理函数
     * @returns {Function} 取消函数
     */
    on(type, handler) {
        const set = this._listeners[type];
        if (!set) {
            return () => {};
        }
        set.add(handler);
        return () => set.delete(handler);
    }

    /**
     * 飞到经纬度。height 为离椭球米制高度。
     *
     * @param {number} lng 经度
     * @param {number} lat 纬度
     * @param {number} height 高度，单位米
     * @param {object} [options] duration 秒，keepOrientation
     * @returns {void}
     */
    flyToLngLatHeight(lng, lat, height, options = {}) {
        this._port.flyTo({
            lng,
            lat,
            height,
            duration: options.duration ?? 1.5,
            keepOrientation: options.keepOrientation !== false,
        });
    }

    /**
     * 缩放到经纬度范围。
     *
     * @param {object|[number, number, number, number]|number[][]} bounds 范围
     * @param {object} [options] padding / duration / maxZoom
     * @returns {void}
     */
    fitLngLatBounds(bounds, options = {}) {
        this._port.fitBounds?.(bounds, options);
    }

    /**
     * 点击后的安全飞行：不低于 1000 米，也不从极高空直接扎到地面。
     *
     * @param {number} lng 经度
     * @param {number} lat 纬度
     * @returns {Promise<void>}
     */
    async flyToGround(lng, lat) {
        const elevation = await this._port.sampleElevation(lng, lat);
        const camera = this._port.getCamera();
        const ground = Number.isFinite(elevation) ? elevation : 0;
        const current = camera && camera.height > 10000 ? 10000 : (camera?.height || 0);
        const height = Math.max(current, ground + CLICK_MIN_HEIGHT, CLICK_MIN_HEIGHT);
        this._port.flyTo({
            lng,
            lat,
            height,
            duration: CLICK_FLY_SECONDS,
            keepOrientation: true,
        });
    }

    /**
     * 替换定位点。
     *
     * @param {number} lng 经度
     * @param {number} lat 纬度
     * @returns {void}
     */
    setMarker(lng, lat) {
        const icon = this._options.markerIcon;
        this._port.setOverlay('marker', markerCollection(lng, lat), markerStyle(icon));
    }

    /**
     * 替换范围面。
     *
     * @param {object} featureCollection GeoJSON FeatureCollection
     * @returns {void}
     */
    setPolygons(featureCollection) {
        this._port.setOverlay('polygon', featureCollection, POLYGON_STYLE);
    }

    /**
     * 开始测距或测面。line 为折线，polygon 为面。
     *
     * @param {'line'|'polygon'|'length'|'area'|'circle'} mode 测量类型
     * @returns {void}
     */
    startMeasure(mode) {
        const tool = resolveMeasureTool(mode);
        if (!tool || !this._measureController) {
            return;
        }
        this._measureController.enter(tool);
    }

    /**
     * 切换测距 / 测面 / 画圆。再点一次同一工具则退出。
     *
     * @param {'length'|'area'|'circle'} tool 工具
     * @returns {void}
     */
    toggleMeasure(tool) {
        if (!this._measureController) {
            return;
        }
        if (tool === MEASURE_TOOLS.LENGTH) {
            this._measureController.toggleLength();
            return;
        }
        if (tool === MEASURE_TOOLS.AREA) {
            this._measureController.toggleArea();
            return;
        }
        if (tool === MEASURE_TOOLS.CIRCLE) {
            this._measureController.toggleCircle();
        }
    }

    /**
     * 清除全部测量图形。
     *
     * @returns {void}
     */
    clearMeasure() {
        this._measureController?.clear();
    }

    /**
     * 当前是否正在测量。
     *
     * @returns {boolean}
     */
    isMeasuring() {
        return Boolean(this._measureController?.isActive());
    }

    /**
     * 当前是否正在画矩形或多边形。
     *
     * @returns {boolean}
     */
    isRangeDrawing() {
        const mode = this._drawAdapter?.getMode?.();
        return mode === DRAW_MODES.DRAW_RECTANGLE || mode === DRAW_MODES.DRAW_POLYGON;
    }

    /**
     * 开始圈选。rectangle 为对角矩形，polygon 为多边形。
     *
     * @param {'rectangle'|'polygon'} tool 工具
     * @returns {void}
     */
    startRangeDraw(tool) {
        if (!this._drawAdapter) {
            return;
        }
        this._drawAdapter.deleteAll();
        const mode = tool === 'rectangle'
            ? DRAW_MODES.DRAW_RECTANGLE
            : DRAW_MODES.DRAW_POLYGON;
        this._drawAdapter.changeMode(mode);
        this._emitRange();
    }

    /**
     * 再点一次同一工具则退出；否则清掉旧面并开新工具。
     *
     * @param {'rectangle'|'polygon'} tool 工具
     * @returns {boolean} true 表示进入绘制
     */
    toggleRangeDraw(tool) {
        if (!this._drawAdapter) {
            return false;
        }
        const mode = this._drawAdapter.getMode();
        const target = tool === 'rectangle'
            ? DRAW_MODES.DRAW_RECTANGLE
            : DRAW_MODES.DRAW_POLYGON;
        if (mode === target) {
            this._drawAdapter.trash();
            this._drawAdapter.changeMode(DRAW_MODES.SIMPLE_SELECT);
            this._emitRange();
            return false;
        }
        this.startRangeDraw(tool);
        return true;
    }

    /**
     * 清除圈选面并退出绘制。
     *
     * @returns {void}
     */
    clearRangeDraw() {
        if (!this._drawAdapter) {
            return;
        }
        this._drawAdapter.deleteAll();
        this._drawAdapter.changeMode(DRAW_MODES.SIMPLE_SELECT);
        this._emitRange();
    }

    /**
     * 当前圈选 Polygon。没有则 null。
     *
     * @returns {object|null} GeoJSON Feature
     */
    getRangePolygon() {
        const features = this._drawAdapter?.getAll?.()?.features || [];
        return features.find((item) => item.geometry?.type === 'Polygon') || null;
    }

    /**
     * 用已有 Polygon 替换当前圈选，并通知页面。
     *
     * @param {object} feature GeoJSON Polygon Feature
     * @returns {object|null} 写入后的圈选面
     */
    setRangePolygon(feature) {
        if (!this._drawAdapter || !feature) {
            return null;
        }
        this._drawAdapter.changeMode(DRAW_MODES.SIMPLE_SELECT);
        this._drawAdapter.deleteAll();
        const ids = this._drawAdapter.add(feature) || [];
        const id = ids[0];
        if (id) {
            this._stampImportedRange(id);
        }
        this._emitRange();
        return this.getRangePolygon();
    }

    /**
     * 导入面打标并进入顶点编辑。不依赖 draw.create 是否触发。
     *
     * @param {string} id 要素 id
     * @returns {void}
     */
    _stampImportedRange(id) {
        this._drawAdapter.setFeatureProperty(id, 'role', RANGE_ROLE);
        this._keepOnlyFeature(id);
        if (this._drawAdapter.getMode() === DRAW_MODES.DIRECT_SELECT) {
            return;
        }
        this._drawAdapter.changeMode(DRAW_MODES.DIRECT_SELECT, {
            featureId: id,
            featureIds: [id],
        });
    }

    /**
     * 超限时把圈选面标红。
     *
     * @param {boolean} overlimit 是否超限
     * @returns {void}
     */
    setRangeOverlimit(overlimit) {
        const feature = this.getRangePolygon();
        if (!feature || !this._drawAdapter) {
            return;
        }
        const flag = overlimit ? 'true' : 'false';
        this._drawAdapter.setFeatureProperty(feature.id, RANGE_OVERLIMIT_PROP, flag);
    }

    /**
     * 新增或替换图层。
     *
     * @param {object} descriptor 图层描述
     * @returns {void}
     */
    upsertLayer(descriptor) {
        this._port.upsertLayer(descriptor);
    }

    /**
     * 设置图层显隐。
     *
     * @param {string} id 图层 id
     * @param {boolean} visible 是否显示
     * @returns {void}
     */
    setLayerVisible(id, visible) {
        this._port.setLayerVisible(id, visible);
    }

    /**
     * 在栅格之间把图层置顶。
     *
     * @param {string} id 图层 id
     * @returns {void}
     */
    raiseLayer(id) {
        this._port.raiseLayer(id);
    }

    /**
     * 开关三维地形网格。
     *
     * @param {object|null} spec raster-dem 描述；null 表示关闭
     * @returns {void}
     */
    setTerrain(spec) {
        this._port.setTerrain(spec);
    }

    /**
     * 开关可查询十字准星。打开风资源图层后调用。
     *
     * @param {boolean} queryable 可查询时为 true
     * @returns {void}
     */
    setQueryableCursor(queryable) {
        this._port.setQueryableCursor?.(queryable);
    }

    /**
     * 重算尺寸。
     *
     * @returns {void}
     */
    resize() {
        this._port.resize();
    }

    /**
     * 取出底层 MapLibre 实例，供地物叠加插件挂载。业务页不要直接调。
     *
     * @returns {import('maplibre-gl').Map|null} 地图实例
     */
    getNativeMap() {
        return this._port.getMap?.() || null;
    }

    /**
     * 取出内部 MapboxDraw，供矢量编辑与测量共用同一实例。
     *
     * @returns {object|null} 原生 Draw
     */
    getDraw() {
        return this._drawAdapter?.getNative?.() || null;
    }

    /**
     * 退出测量绘制，保留已完成的测量几何。不要 deleteAll。
     *
     * @returns {void}
     */
    stopMeasure() {
        this._measureController?.deactivate({ resetMode: true });
    }

    /**
     * 销毁地图。
     *
     * @returns {void}
     */
    destroy() {
        if (this._scaleFrame) {
            cancelAnimationFrame(this._scaleFrame);
        }
        destroyMeasureModule();
        this._measureController = null;
        this._drawAdapter?.destroy();
        this._drawAdapter = null;
        this._removeViewControl();
        this._port.destroy();
    }

    /**
     * 把端口事件分到测量或对外监听。
     *
     * @returns {void}
     */
    _bindPort() {
        this._port.on('click', (point) => this._onClick(point));
        this._port.on('pointermove', (point) => this._emit('pointermove', point));
        this._port.on('viewchange', () => this._scheduleView());
    }

    /**
     * 挂上全景/2D·3D 与 maplibre-gl-draw 测量。
     *
     * @returns {Promise<void>}
     */
    async _installControls() {
        const flags = this._options.controls || {};
        if (flags.view !== false) {
            this._viewControl = this._createViewControl(flags.view);
            this._port.addControl?.(this._viewControl, 'top-right');
        }
        if (flags.measure !== false || flags.rangeDraw) {
            await this._installDraw(flags.measure !== false, Boolean(flags.rangeDraw));
        }
    }

    /**
     * 创建视图控件。
     *
     * @param {object|boolean} [viewOptions] 视图控件配置
     * @returns {MapViewControls}
     */
    _createViewControl(viewOptions) {
        const home = this._port.getHomeView?.() || { center: [105, 35], zoom: 2.3 };
        const extra = viewOptions && typeof viewOptions === 'object' ? viewOptions : {};
        const terrainMeshSpec = this._options.terrainMeshSpec;
        return new MapViewControls({
            center: extra.center || home.center,
            zoom: extra.zoom ?? home.zoom,
            compare: extra.compare === true,
            quadCompare: extra.quadCompare !== false,
            onToggleCompare: extra.onToggleCompare,
            onWarn: this._options.onWarn,
            onDimensionChange: terrainMeshSpec
                ? (enable3D) => {
                    this.setTerrain(enable3D ? terrainMeshSpec : null);
                }
                : undefined,
        });
    }

    /**
     * 挂载 draw；可选测量工具条。rangeDraw 时使用金色圈选样式。
     *
     * @param {boolean} withMeasure 是否挂测距工具条
     * @param {boolean} rangeDraw 是否用于地形图圈选
     * @returns {Promise<void>}
     */
    async _installDraw(withMeasure, rangeDraw) {
        const map = this._port.getMap?.();
        if (!map) {
            this._options.onWarn?.('当前地图引擎不支持绘制控件');
            return;
        }
        const engine = { getMap: () => this._port.getMap?.() || null };
        this._drawAdapter = new DrawAdapter(engine, { rangeTheme: rangeDraw });
        try {
            await this._drawAdapter.mount();
        } catch (error) {
            const text = error instanceof Error ? error.message : String(error);
            this._options.onWarn?.(`绘制组件加载失败: ${text}`);
            this._drawAdapter = null;
            return;
        }
        if (rangeDraw) {
            this._bindRangeDrawEvents();
        }
        if (!withMeasure) {
            return;
        }
        this._measureController = initMeasureModule({
            engine,
            drawAdapter: this._drawAdapter,
            onInfo: this._options.onInfo,
        });
    }

    /**
     * 订阅 draw 事件并转成 range。
     *
     * @returns {void}
     */
    _bindRangeDrawEvents() {
        const names = ['create', 'update', 'delete', 'modechange'];
        names.forEach((name) => {
            this._drawAdapter.on(name, (event) => this._onRangeDrawEvent(name, event));
        });
    }

    /**
     * 圈选完成或编辑后打标并通知页面。
     *
     * @param {string} name draw 事件名
     * @param {object} event 事件
     * @returns {void}
     */
    _onRangeDrawEvent(name, event) {
        if (name === 'create') {
            this._stampRangeRole(event);
            this._keepOnlyFeature(event.features?.[0]?.id);
            this._selectCreated(event);
        }
        this._emitRange();
    }

    /**
     * 只保留当前圈选面，避免多边形完成后又开一份草稿。
     *
     * @param {string|undefined} keepId 要保留的要素 id
     * @returns {void}
     */
    _keepOnlyFeature(keepId) {
        if (!keepId || !this._drawAdapter) {
            return;
        }
        const extras = (this._drawAdapter.getAll()?.features || [])
            .map((item) => item.id)
            .filter((fid) => fid && fid !== keepId);
        if (extras.length) {
            this._drawAdapter.delete(extras);
        }
    }

    /**
     * 圈选完成后进入顶点编辑（矩形模式可能已在 DIRECT_SELECT）。
     *
     * @param {object} event draw.create 事件
     * @returns {void}
     */
    _selectCreated(event) {
        const id = event.features?.[0]?.id;
        if (!id) {
            return;
        }
        window.setTimeout(() => {
            if (!this._drawAdapter) {
                return;
            }
            this._keepOnlyFeature(id);
            if (this._drawAdapter.getMode() === DRAW_MODES.DIRECT_SELECT) {
                this._emitRange();
                return;
            }
            this._drawAdapter.changeMode(DRAW_MODES.DIRECT_SELECT, {
                featureId: id,
                featureIds: [id],
            });
        }, 0);
    }

    /**
     * 给新圈选面打上 topo-range 标记。
     *
     * @param {object} event draw.create 事件
     * @returns {void}
     */
    _stampRangeRole(event) {
        const feature = event.features?.[0];
        if (!feature?.id || !this._drawAdapter) {
            return;
        }
        this._drawAdapter.setFeatureProperty(feature.id, 'role', RANGE_ROLE);
    }

    /**
     * 抛出当前圈选面与绘制态。
     *
     * @returns {void}
     */
    _emitRange() {
        const mode = this._drawAdapter?.getMode?.() || '';
        this._emit('range', {
            feature: this.getRangePolygon(),
            drawing: this.isRangeDrawing(),
            tool: rangeToolFromMode(mode),
        });
    }

    /**
     * 卸下视图控件。
     *
     * @returns {void}
     */
    _removeViewControl() {
        if (this._viewControl) {
            this._port.removeControl?.(this._viewControl);
            this._viewControl = null;
        }
    }

    /**
     * 点击：测量中交给 draw，不向外抛。
     *
     * @param {{lng: number, lat: number}} point 经纬度
     * @returns {void}
     */
    _onClick(point) {
        if (this.isMeasuring() || this.isRangeDrawing()) {
            return;
        }
        this._emit('click', point);
    }

    /**
     * 视野变化时更新比例尺。
     *
     * @returns {void}
     */
    _scheduleView() {
        if (this._scaleFrame) {
            return;
        }
        this._scaleFrame = requestAnimationFrame(() => {
            this._scaleFrame = 0;
            this._emit('scale', this._readScale());
            this._emit('viewchange', this._port.getBounds());
        });
    }

    /**
     * 用屏幕左右缘的地面距离计算比例尺。
     *
     * @returns {string} 比例尺文字
     */
    _readScale() {
        const size = this._port.getCanvasSize();
        if (!size.width) {
            return '--km';
        }
        const left = this._port.unproject(0, size.height / 2);
        const right = this._port.unproject(size.width, size.height / 2);
        return formatScale(left, right, size.width);
    }

    /**
     * 通知外部监听。
     *
     * @param {string} type 事件名
     * @param {object|string|null} payload 载荷
     * @returns {void}
     */
    _emit(type, payload) {
        this._listeners[type].forEach((handler) => handler(payload));
    }
}

/**
 * 把 draw 模式映射到圈选工具名。
 *
 * @param {string} mode draw 模式
 * @returns {'rectangle'|'polygon'|null} 工具
 */
function rangeToolFromMode(mode) {
    if (mode === DRAW_MODES.DRAW_RECTANGLE) {
        return 'rectangle';
    }
    if (mode === DRAW_MODES.DRAW_POLYGON) {
        return 'polygon';
    }
    return null;
}

/**
 * 把旧 API 的 line/polygon 映射到测量工具名。
 *
 * @param {string} mode 入参
 * @returns {'length'|'area'|'circle'|null} 工具
 */
function resolveMeasureTool(mode) {
    if (mode === 'polygon' || mode === MEASURE_TOOLS.AREA) {
        return MEASURE_TOOLS.AREA;
    }
    if (mode === 'circle' || mode === MEASURE_TOOLS.CIRCLE) {
        return MEASURE_TOOLS.CIRCLE;
    }
    if (mode === 'line' || mode === 'Polyline' || mode === MEASURE_TOOLS.LENGTH) {
        return MEASURE_TOOLS.LENGTH;
    }
    return null;
}

export { MapFacade };
