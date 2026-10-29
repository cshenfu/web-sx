/** MapLibre GL JS 6 适配器。原始地图实例不出本文件。 */

import { maplibregl, GLYPHS, OVERLAY_ANCHOR } from './vendor.js';
import { heightToZoom, zoomToHeight } from './camera.js';
import { createLayerController } from '@whln/layer-control';
import { createOverlayController } from './overlayController.js';
import { GlobeHalo } from './globeHalo.js';
import { bindMiddleButtonPan } from './middleButtonPan.js';

const EVENT_TYPES = ['click', 'pointermove', 'viewchange', 'contextmenu', 'dblclick'];

/**
 * 当前环境能否创建 WebGL2。MapLibre 6 必须有它。
 *
 * @returns {boolean} 可以创建时为 true
 */
function isWebGL2Available() {
    try {
        const canvas = document.createElement('canvas');
        return Boolean(canvas.getContext('webgl2'));
    } catch {
        return false;
    }
}

/**
 * 事件名到处理函数集合。
 *
 * @returns {Record<string, Set<Function>>} 监听表
 */
function createHandlerMap() {
    const handlers = {};
    EVENT_TYPES.forEach((type) => {
        handlers[type] = new Set();
    });
    return handlers;
}

/**
 * 从 MapLibre 事件取出经纬度。
 *
 * @param {object} event MapLibre 事件
 * @returns {{lng: number, lat: number}} 经纬度
 */
function toLngLat(event) {
    return { lng: event.lngLat.lng, lat: event.lngLat.lat };
}

/**
 * 地球自带 sky 只做很弱的贴边，外层光晕由 GlobeHalo 画在球外。
 *
 * @returns {object} MapLibre sky
 */
function globeSky() {
    return {
        'sky-color': '#0c1b33',
        'horizon-color': '#4d9fe6',
        'fog-color': '#0c1b33',
        'sky-horizon-blend': 0.5,
        'horizon-fog-blend': 0.4,
        'fog-ground-blend': 0.08,
        'atmosphere-blend': [
            'interpolate', ['linear'], ['zoom'],
            0, 0.25,
            6, 0.15,
            9, 0,
        ],
    };
}

/**
 * 组装 Map 构造参数。
 *
 * @param {HTMLElement|string} container 容器
 * @param {object} options 调用方选项
 * @returns {object} Map 构造参数
 */
function mapOptions(container, options) {
    return {
        container,
        style: {
            version: 8,
            sources: {},
            layers: [],
            glyphs: GLYPHS,
            projection: { type: 'globe' },
            sky: globeSky(),
        },
        center: options.center || [105, 35],
        zoom: options.zoom ?? 2.3,
        minZoom: options.minZoom ?? 0,
        maxZoom: options.maxZoom ?? 23,
        maxPitch: options.maxPitch ?? 70,
        aroundCenter: false,
        attributionControl: false,
        canvasContextAttributes: { antialias: true, alpha: true },
    };
}

/**
 * 空的 GeoJSON，用作覆盖物锚点。
 *
 * @returns {object} FeatureCollection
 */
function emptyCollection() {
    return { type: 'FeatureCollection', features: [] };
}

/**
 * 画布像素尺寸。
 *
 * @param {import('maplibre-gl').Map|null} map 地图
 * @returns {{width: number, height: number}} 尺寸
 */
function canvasSize(map) {
    const canvas = map?.getCanvas();
    return {
        width: canvas?.clientWidth || 0,
        height: canvas?.clientHeight || 0,
    };
}

/**
 * 把入参收成 west/south/east/north。
 *
 * @param {object|[number, number, number, number]|number[][]} bounds 范围
 * @returns {{west: number, south: number, east: number, north: number}|null} 矩形
 */
function toLngLatBox(bounds) {
    if (!bounds) {
        return null;
    }
    const box = Array.isArray(bounds) ? boxFromArray(bounds) : {
        west: Number(bounds.west),
        south: Number(bounds.south),
        east: Number(bounds.east),
        north: Number(bounds.north),
    };
    if (![box.west, box.south, box.east, box.north].every(Number.isFinite)) {
        return null;
    }
    if (box.west === box.east) {
        box.west -= 0.001;
        box.east += 0.001;
    }
    if (box.south === box.north) {
        box.south -= 0.001;
        box.north += 0.001;
    }
    return box;
}

/**
 * 数组形式的范围。
 *
 * @param {number[]|number[][]} bounds [[w,s],[e,n]] 或 [w,s,e,n]
 * @returns {{west: number, south: number, east: number, north: number}} 矩形
 */
function boxFromArray(bounds) {
    if (Array.isArray(bounds[0])) {
        return {
            west: Number(bounds[0][0]),
            south: Number(bounds[0][1]),
            east: Number(bounds[1][0]),
            north: Number(bounds[1][1]),
        };
    }
    return {
        west: Number(bounds[0]),
        south: Number(bounds[1]),
        east: Number(bounds[2]),
        north: Number(bounds[3]),
    };
}

/**
 * 读取相机。高度由 zoom 反算。
 *
 * @param {import('maplibre-gl').Map|null} map 地图
 * @returns {{lng: number, lat: number, height: number, heading: number, pitch: number}} 相机
 */
function readCamera(map) {
    const center = map.getCenter();
    const size = canvasSize(map);
    return {
        lng: center.lng,
        lat: center.lat,
        height: zoomToHeight(map.getZoom(), center.lat, size.height),
        heading: map.getBearing(),
        pitch: map.getPitch(),
    };
}

class MapLibreAdapter {
    constructor() {
        this._map = null;
        this._handlers = createHandlerMap();
        this._layers = null;
        this._overlays = null;
        this._observer = null;
        this._terrainOn = false;
        this._terrainSpec = null;
        this._halo = null;
        this._unbindMiddlePan = null;
        this._flying = false;
        this._flyToken = 0;
        this._preferredProjection = 'globe';
        this._ignoreProjectionPref = false;
        this._homeView = { center: [105, 35], zoom: 2.3 };
    }

    /**
     * 创建地图，样式加载完成后 resolve。
     *
     * @param {HTMLElement|string} container 容器
     * @param {object} [options] 初始中心与缩放
     * @returns {Promise<void>}
     */
    init(container, options = {}) {
        if (!isWebGL2Available()) {
            return Promise.reject(new Error(
                '当前浏览器不支持 WebGL2，无法使用 MapLibre GL JS 6。'
                + '请升级 Chrome / Edge / Firefox 近年版本，或检查 GPU/远程桌面策略。',
            ));
        }
        this._preferredProjection = options.projection === 'mercator' ? 'mercator' : 'globe';
        this._homeView = {
            center: options.center || [105, 35],
            zoom: options.zoom ?? 2.3,
        };
        return new Promise((resolve, reject) => {
            try {
                this._map = new maplibregl.Map(mapOptions(container, options));
                this._map.once('load', () => {
                    this._onLoad();
                    resolve();
                });
                this._map.on('error', (event) => {
                    const err = event?.error || event;
                    console.warn('MapLibre 错误:', err?.message || err);
                });
            } catch (error) {
                reject(error instanceof Error ? error : new Error(String(error)));
            }
        });
    }

    /**
     * 样式就绪后挂上锚点、图层控制器和交互限制。
     *
     * @returns {void}
     */
    _onLoad() {
        this._map.doubleClickZoom.disable();
        this._map.setMaxPitch(70);
        if (typeof this._map.setProjection === 'function') {
            this._map.setProjection({ type: 'globe' });
        }
        this._map.setSky(globeSky());
        this._map.addSource('eng-anchor-src', {
            type: 'geojson',
            data: emptyCollection(),
        });
        this._map.addLayer({
            id: OVERLAY_ANCHOR,
            type: 'line',
            source: 'eng-anchor-src',
        });
        this._layers = createLayerController(this._map, { beforeId: OVERLAY_ANCHOR });
        this._overlays = createOverlayController(this._map);
        this._halo = new GlobeHalo(this._map);
        this._unbindMiddlePan?.();
        this._unbindMiddlePan = bindMiddleButtonPan(this._map);
        this._bindEvents();
        this._watchResize();
        this._applyTerrain();
        this._emit('viewchange', this.getBounds());
    }

    /**
     * 把地图事件收成经纬度。
     *
     * @returns {void}
     */
    _bindEvents() {
        this._map.on('click', (event) => this._emit('click', toLngLat(event)));
        this._map.on('dblclick', (event) => {
            this._emit('dblclick', toLngLat(event));
        });
        this._map.on('mousemove', (event) => this._emit('pointermove', toLngLat(event)));
        this._map.on('move', () => {
            this._emit('viewchange', this.getBounds());
        });
        this._map.on('zoomend', () => this._applyTerrain());
        this._map.on('projectiontransition', () => this._rememberProjection());
        this._map.on('contextmenu', (event) => {
            event.originalEvent?.preventDefault();
            this._emit('contextmenu', toLngLat(event));
        });
    }

    /**
     * 记住用户投影偏好。地形强制墨卡托时不覆盖。
     *
     * @returns {void}
     */
    _rememberProjection() {
        if (this._ignoreProjectionPref || this._terrainOn) {
            return;
        }
        const type = this._map?.getProjection?.()?.type;
        if (type === 'globe' || type === 'mercator') {
            this._preferredProjection = type;
        }
    }

    /**
     * 容器尺寸变化时重算画布。
     *
     * @returns {void}
     */
    _watchResize() {
        const container = this._map.getContainer();
        if (!container || typeof ResizeObserver === 'undefined') {
            return;
        }
        this._observer = new ResizeObserver(() => this.resize());
        this._observer.observe(container);
    }

    /**
     * 通知已注册的监听。
     *
     * @param {string} type 事件名
     * @param {object|null} payload 载荷
     * @returns {void}
     */
    _emit(type, payload) {
        (this._handlers[type] || []).forEach((handler) => handler(payload));
    }

    /**
     * 注册监听。
     *
     * @param {string} type 事件名
     * @param {Function} handler 处理函数
     * @returns {Function} 取消函数
     */
    on(type, handler) {
        const set = this._handlers[type];
        if (!set) {
            return () => {};
        }
        set.add(handler);
        return () => set.delete(handler);
    }

    /**
     * 记下这次飞行。上一次飞行的结束事件不能把它清掉。
     *
     * @returns {void}
     */
    _beginFly() {
        this._flyToken = (this._flyToken || 0) + 1;
        const token = this._flyToken;
        this._flying = true;
        this._map.once('moveend', () => {
            if (token !== this._flyToken) {
                return;
            }
            this._flying = false;
            this._emit('viewchange', this.getBounds());
        });
    }

    /**
     * 飞到指定经纬度与高度。duration 单位为秒。
     *
     * @param {object} camera 相机参数
     * @returns {void}
     */
    flyTo(camera) {
        if (!this._map) {
            return;
        }
        const current = readCamera(this._map);
        const lat = camera.lat ?? current.lat;
        const size = canvasSize(this._map);
        const zoom = heightToZoom(camera.height ?? current.height, lat, size.height);
        this._beginFly();
        this._map.flyTo({
            center: [camera.lng ?? current.lng, lat],
            zoom,
            bearing: camera.keepOrientation ? current.heading : (camera.heading ?? 0),
            pitch: camera.keepOrientation ? current.pitch : (camera.pitch ?? 0),
            duration: (camera.duration ?? 1.5) * 1000,
            essential: true,
        });
    }

    /**
     * 缩放到经纬度外包矩形。
     *
     * @param {object|[number, number, number, number]|number[][]} bounds 范围
     * @param {object} [options] padding / duration（秒）/ maxZoom
     * @returns {void}
     */
    fitBounds(bounds, options = {}) {
        if (!this._map) {
            return;
        }
        const box = toLngLatBox(bounds);
        if (!box) {
            return;
        }
        this._beginFly();
        this._map.fitBounds(
            [[box.west, box.south], [box.east, box.north]],
            {
                padding: options.padding ?? { top: 72, right: 448, bottom: 96, left: 72 },
                duration: (options.duration ?? 1.2) * 1000,
                maxZoom: options.maxZoom ?? 16,
                pitch: 0,
                bearing: 0,
                essential: true,
            },
        );
    }

    /**
     * 当前相机。
     *
     * @returns {object|null} 相机；地图未就绪时为 null
     */
    getCamera() {
        if (!this._map) {
            return null;
        }
        return readCamera(this._map);
    }

    /**
     * 当前视野范围。
     *
     * @returns {{west: number, south: number, east: number, north: number}|null} 范围
     */
    getBounds() {
        if (!this._map) {
            return null;
        }
        try {
            const bounds = this._map.getBounds();
            if (!bounds) {
                return null;
            }
            return {
                west: bounds.getWest(),
                south: bounds.getSouth(),
                east: bounds.getEast(),
                north: bounds.getNorth(),
            };
        } catch {
            return null;
        }
    }

    /**
     * 画布尺寸。
     *
     * @returns {{width: number, height: number}} 像素尺寸
     */
    getCanvasSize() {
        return canvasSize(this._map);
    }

    /**
     * 屏幕坐标转经纬度。
     *
     * @param {number} x 横坐标
     * @param {number} y 纵坐标
     * @returns {{lng: number, lat: number}|null} 经纬度
     */
    unproject(x, y) {
        if (!this._map) {
            return null;
        }
        const lngLat = this._map.unproject([x, y]);
        if (!lngLat || !Number.isFinite(lngLat.lng) || !Number.isFinite(lngLat.lat)) {
            return null;
        }
        return { lng: lngLat.lng, lat: lngLat.lat };
    }

    /**
     * 限制继续拉近。meters 是最近相机高度，对应 maxZoom。
     *
     * @param {number} meters 最近距离，单位米
     * @returns {void}
     */
    setMinHeight(meters) {
        if (!this._map || this._flying) {
            return;
        }
        const center = this._map.getCenter();
        const size = canvasSize(this._map);
        const zoom = heightToZoom(meters, center.lat, size.height);
        this._map.setMaxZoom(zoom);
        if (this._map.getZoom() > zoom) {
            this._map.setZoom(zoom);
        }
    }

    /**
     * 相对正射的最大倾角。
     *
     * @param {number} degrees 度
     * @returns {void}
     */
    setMaxPitch(degrees) {
        this._map?.setMaxPitch(degrees);
    }

    /**
     * 底层 MapLibre 实例。仅供地图引擎内部控件（测量 draw）使用。
     *
     * @returns {import('maplibre-gl').Map|null} 地图
     */
    getMap() {
        return this._map;
    }

    /**
     * 挂载 MapLibre IControl。
     *
     * @param {object} control IControl
     * @param {string} [position='top-right'] 位置
     * @returns {void}
     */
    addControl(control, position = 'top-right') {
        this._map?.addControl(control, position);
    }

    /**
     * 移除 IControl。
     *
     * @param {object} control IControl
     * @returns {void}
     */
    removeControl(control) {
        if (!this._map || !control) {
            return;
        }
        try {
            this._map.removeControl(control);
        } catch {
            // 地图销毁时控件可能已随容器移除
        }
    }

    /**
     * 全景复位使用的初始中心与缩放。
     *
     * @returns {{center: [number, number], zoom: number}} 初始视野
     */
    getHomeView() {
        return this._homeView;
    }

    /**
     * 当前投影类型。
     *
     * @returns {'globe'|'mercator'} 投影
     */
    getProjection() {
        const type = this._map?.getProjection?.()?.type;
        return type === 'mercator' ? 'mercator' : 'globe';
    }

    /**
     * 设置投影，并记住用户偏好；关闭地形后按偏好恢复。
     *
     * @param {'globe'|'mercator'} type 投影类型
     * @returns {void}
     */
    setProjection(type) {
        const next = type === 'mercator' ? 'mercator' : 'globe';
        this._preferredProjection = next;
        this._applyProjection(next);
    }

    /**
     * 测量十字光标。空字符串表示恢复默认。
     *
     * @param {string} cursor CSS cursor
     * @returns {void}
     */
    setCanvasCursor(cursor) {
        const canvas = this._map?.getCanvas?.();
        if (canvas) {
            canvas.style.cursor = cursor || '';
        }
    }

    /**
     * 开关右键拖拽倾斜。测距时关掉，避免右键既结束测量又转相机。
     *
     * @param {boolean} enabled 允许倾斜时为 true
     * @returns {void}
     */
    setTiltEnabled(enabled) {
        if (!this._map?.dragRotate) {
            return;
        }
        if (enabled) {
            this._map.dragRotate.enable();
            return;
        }
        this._map.dragRotate.disable();
    }

    /**
     * 开关可查询十字准星。打开后覆盖默认抓手光标。
     *
     * @param {boolean} queryable 可查询时为 true
     * @returns {void}
     */
    setQueryableCursor(queryable) {
        const container = this._map?.getContainer();
        if (!container) {
            return;
        }
        container.classList.toggle('eng-queryable', Boolean(queryable));
    }

    /**
     * 新增或替换图层。
     *
     * @param {object} descriptor 图层描述
     * @returns {void}
     */
    upsertLayer(descriptor) {
        this._layers?.upsert(descriptor);
    }

    /**
     * 设置显隐。
     *
     * @param {string} id 图层 id
     * @param {boolean} visible 是否显示
     * @returns {void}
     */
    setLayerVisible(id, visible) {
        this._layers?.setVisible(id, visible);
    }

    /**
     * 设置透明度。
     *
     * @param {string} id 图层 id
     * @param {number} opacity 0 到 1
     * @returns {void}
     */
    setLayerOpacity(id, opacity) {
        this._layers?.setOpacity(id, opacity);
    }

    /**
     * 在栅格带内置顶。
     *
     * @param {string} id 图层 id
     * @returns {void}
     */
    raiseLayer(id) {
        this._layers?.raise(id);
    }

    /**
     * 移除图层。
     *
     * @param {string} id 图层 id
     * @returns {void}
     */
    removeLayer(id) {
        this._layers?.remove(id);
    }

    /**
     * 记下地形描述。实际挂载由当前 zoom 与 spec.minZoom 决定。
     *
     * @param {object|null} spec raster-dem 描述；null 表示关闭
     * @returns {void}
     */
    setTerrain(spec) {
        this._terrainSpec = spec || null;
        this._applyTerrain();
    }

    /**
     * 当前缩放是否达到挂载地形的层级。已挂上时放宽 0.5 级，避免临界抖动。
     *
     * @returns {boolean} 应当开启时为 true
     */
    _shouldEnableTerrain() {
        const spec = this._terrainSpec;
        if (!spec || !this._map) {
            return false;
        }
        const minZoom = Number.isFinite(spec.minZoom) ? spec.minZoom : 0;
        const zoom = this._map.getZoom();
        if (this._terrainOn) {
            return zoom >= minZoom - 0.5;
        }
        return zoom >= minZoom;
    }

    /**
     * 应用投影。关闭地球时去掉 sky，开启时补回。
     *
     * @param {'globe'|'mercator'} type 投影类型
     * @returns {void}
     */
    _applyProjection(type) {
        if (!this._map || typeof this._map.setProjection !== 'function') {
            return;
        }
        const current = this._map.getProjection?.()?.type;
        if (current === type) {
            return;
        }
        this._map.setProjection({ type });
        if (type === 'globe') {
            this._map.setSky(globeSky());
        }
    }

    /**
     * 地形开启时切到墨卡托。globe 与 terrain 同时开着时，栅格瓦片平移后常不更新。
     *
     * @param {boolean} terrainOn 是否正在使用三维地形
     * @returns {void}
     */
    _setProjectionForTerrain(terrainOn) {
        this._ignoreProjectionPref = true;
        this._applyProjection(terrainOn ? 'mercator' : this._preferredProjection);
        this._ignoreProjectionPref = false;
    }

    /**
     * 添加 raster-dem 源并打开地形网格。
     *
     * @returns {void}
     */
    _enableTerrain() {
        const spec = this._terrainSpec;
        if (!this._map || !spec || this._terrainOn) {
            return;
        }
        this._setProjectionForTerrain(true);
        if (!this._map.getSource('eng-terrain-dem')) {
            this._map.addSource('eng-terrain-dem', {
                type: 'raster-dem',
                url: spec.tilejsonUrl,
                encoding: spec.encoding || 'mapbox',
                tileSize: spec.tileSize || 256,
                minzoom: spec.minZoom ?? 0,
            });
        }
        this._map.setTerrain({
            source: 'eng-terrain-dem',
            exaggeration: spec.exaggeration ?? 1,
        });
        this._terrainOn = true;
    }

    /**
     * 卸下地形网格，并恢复地球投影。
     *
     * @returns {void}
     */
    _disableTerrain() {
        if (!this._map || !this._terrainOn) {
            return;
        }
        this._map.setTerrain(null);
        this._terrainOn = false;
        this._setProjectionForTerrain(false);
    }

    /**
     * 按缩放层级挂上或卸下地形。未达 minZoom 时不请求 DEM 瓦片。
     *
     * @returns {void}
     */
    _applyTerrain() {
        if (!this._map) {
            return;
        }
        if (this._shouldEnableTerrain()) {
            this._enableTerrain();
            return;
        }
        this._disableTerrain();
    }

    /**
     * 采样地面高程。
     *
     * @param {number} lng 经度
     * @param {number} lat 纬度
     * @returns {Promise<number|null>} 米；没有地形时为 null
     */
    sampleElevation(lng, lat) {
        if (!this._map || !this._terrainOn) {
            return Promise.resolve(null);
        }
        try {
            const value = this._map.queryTerrainElevation([lng, lat]);
            return Promise.resolve(Number.isFinite(value) ? value : null);
        } catch {
            return Promise.resolve(null);
        }
    }

    /**
     * 替换一组覆盖物。
     *
     * @param {string} group 组名
     * @param {object} geojson GeoJSON
     * @param {object} [style] 样式
     * @returns {void}
     */
    setOverlay(group, geojson, style) {
        this._overlays?.setOverlay(group, geojson, style);
    }

    /**
     * 清空一组覆盖物。
     *
     * @param {string} group 组名
     * @returns {void}
     */
    clearOverlay(group) {
        this._overlays?.clear(group);
    }

    /**
     * 重算尺寸。
     *
     * @returns {void}
     */
    resize() {
        this._map?.resize();
    }

    /**
     * 销毁地图并断开尺寸监听。
     *
     * @returns {void}
     */
    destroy() {
        this._observer?.disconnect();
        this._observer = null;
        this._layers = null;
        this._overlays = null;
        this._unbindMiddlePan?.();
        this._unbindMiddlePan = null;
        this._halo?.destroy();
        this._halo = null;
        this._terrainOn = false;
        this._terrainSpec = null;
        if (this._map) {
            this.setQueryableCursor(false);
            this._map.remove();
            this._map = null;
        }
    }
}

export { MapLibreAdapter };
