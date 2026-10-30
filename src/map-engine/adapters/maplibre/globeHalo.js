/**
 * 地球外层光晕和星空。画在 globe 透明外围后方，视觉对齐 whln-web-edit。
 * 星图只生成一次，转动时平移贴图；无彗星、无常驻动画循环。
 */

const STYLE_ID = 'eng-globe-halo-style';
const MAP_CLASS = 'eng-globe-halo-map';
const SPACE_COLOR = '#0c1b33';
const HALO_COLOR = '#4d9fe6';
const HALO_EXTENT = 2.8;
const HALO_OPACITY = 1;
const HALO_SAMPLES = 12;
const BACKING_SCALE = 0.5;
const STAR_AREA = 1600;

/** @type {Array<[number, number, number]>} [offset, alpha, shade] */
const HALO_STOPS = [
    [0.0, 1.0, 0.7],
    [0.03, 0.6, 0.32],
    [0.08, 0.35, 0.0],
    [0.18, 0.15, -0.2],
    [0.35, 0.06, -0.4],
    [0.6, 0.02, -0.55],
    [1.0, 0.0, -0.7],
];

/**
 * 当前是否为地球投影。
 *
 * @param {import('maplibre-gl').Map} map 地图
 * @returns {boolean} globe 时为 true
 */
function isGlobe(map) {
    try {
        return map.getProjection?.()?.type === 'globe';
    } catch {
        return false;
    }
}

/**
 * 解析颜色。
 *
 * @param {string} hex 十六进制
 * @returns {{r: number, g: number, b: number}} RGB
 */
function parseHex(hex) {
    const raw = String(hex || '').trim().replace(/^#/, '');
    const value = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw;
    if (!/^[0-9a-fA-F]{6}$/.test(value)) {
        return { r: 77, g: 159, b: 230 };
    }
    return {
        r: parseInt(value.slice(0, 2), 16),
        g: parseInt(value.slice(2, 4), 16),
        b: parseInt(value.slice(4, 6), 16),
    };
}

/**
 * 按 shade 提亮或压暗。
 *
 * @param {{r: number, g: number, b: number}} rgb 原色
 * @param {number} shade 正为提亮、负为压暗
 * @returns {{r: number, g: number, b: number}} 结果
 */
function shadeRgb({ r, g, b }, shade) {
    const target = shade >= 0 ? 255 : 0;
    const t = Math.min(1, Math.abs(shade));
    return {
        r: Math.round(r + (target - r) * t),
        g: Math.round(g + (target - g) * t),
        b: Math.round(b + (target - b) * t),
    };
}

/**
 * 估算球体在屏幕上的圆盘。
 *
 * @param {import('maplibre-gl').Map} map 地图
 * @returns {{x: number, y: number, radius: number}} 圆盘
 */
function globeDisc(map) {
    const center = map.getCenter();
    const points = [];
    for (let i = 0; i < HALO_SAMPLES; i++) {
        const point = projectLimb(map, center, (i / HALO_SAMPLES) * Math.PI * 2);
        if (point) {
            points.push(point);
        }
    }
    if (points.length < 3) {
        return discFallback(map, center);
    }
    return discFromPoints(points);
}

/**
 * 把球体边缘一个方位投到屏幕。
 *
 * @param {import('maplibre-gl').Map} map 地图
 * @param {{lng: number, lat: number}} center 视点中心
 * @param {number} bearing 方位角弧度
 * @returns {{x: number, y: number}|null} 屏幕点
 */
function projectLimb(map, center, bearing) {
    const lngRad = (center.lng * Math.PI) / 180;
    const latRad = (center.lat * Math.PI) / 180;
    const dist = Math.PI / 2;
    const sampleLat = Math.asin(
        Math.sin(latRad) * Math.cos(dist)
        + Math.cos(latRad) * Math.sin(dist) * Math.cos(bearing),
    );
    const sampleLng = lngRad + Math.atan2(
        Math.sin(bearing) * Math.sin(dist) * Math.cos(latRad),
        Math.cos(dist) - Math.sin(latRad) * Math.sin(sampleLat),
    );
    const point = map.project([(sampleLng * 180) / Math.PI, (sampleLat * 180) / Math.PI]);
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) {
        return null;
    }
    return point;
}

/**
 * 用采样点包围盒得到圆盘。
 *
 * @param {{x: number, y: number}[]} points 屏幕点
 * @returns {{x: number, y: number, radius: number}} 圆盘
 */
function discFromPoints(points) {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    points.forEach((point) => {
        minX = Math.min(minX, point.x);
        maxX = Math.max(maxX, point.x);
        minY = Math.min(minY, point.y);
        maxY = Math.max(maxY, point.y);
    });
    return {
        x: (minX + maxX) / 2,
        y: (minY + maxY) / 2,
        radius: Math.max(maxX - minX, maxY - minY) / 2,
    };
}

/**
 * 采样不足时的回退圆盘。
 *
 * @param {import('maplibre-gl').Map} map 地图
 * @param {{lng: number, lat: number}} center 视点中心
 * @returns {{x: number, y: number, radius: number}} 圆盘
 */
function discFallback(map, center) {
    const mid = map.project(center);
    const edge = map.project([center.lng + 90, 0]);
    return {
        x: mid.x,
        y: mid.y,
        radius: Math.max(Math.hypot(mid.x - edge.x, mid.y - edge.y), 1),
    };
}

class GlobeHalo {
    /**
     * @param {import('maplibre-gl').Map} map 地图
     */
    constructor(map) {
        this.map = map;
        this.mapCanvas = map.getCanvas();
        this.mapRoot = this.mapCanvas.closest('.maplibregl-map');
        this.container = map.getCanvasContainer();
        this.prevCanvasZ = this.mapCanvas.style.zIndex;
        this.prevContainerZ = this.container.style.zIndex;
        this.canvas = this._createCanvas();
        this.ctx = this.canvas.getContext('2d');
        this.width = 0;
        this.height = 0;
        this.starfield = null;
        this.starOrigin = { lng: 0, lat: 0 };
        this.rafId = 0;
        this.destroyed = false;
        this._onResize = this._onResize.bind(this);
        this._onMove = this._schedulePaint.bind(this);
        this._paint = this._paint.bind(this);
        this._mount();
    }

    /**
     * 卸下画布和监听。
     *
     * @returns {void}
     */
    destroy() {
        this.destroyed = true;
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = 0;
        }
        this.map.off('resize', this._onResize);
        this.map.off('move', this._onMove);
        this.map.off('projectiontransition', this._onMove);
        this.mapCanvas.style.zIndex = this.prevCanvasZ;
        this.container.style.zIndex = this.prevContainerZ;
        this.mapRoot?.classList.remove(MAP_CLASS);
        this.canvas.remove();
        this.starfield = null;
    }

    /**
     * 挂到地图下方并画第一帧。
     *
     * @returns {void}
     */
    _mount() {
        this._ensureStyle();
        this.container.appendChild(this.canvas);
        this.mapRoot?.classList.add(MAP_CLASS);
        if (this.mapRoot) {
            this.mapRoot.style.background = SPACE_COLOR;
        }
        this.container.style.zIndex = '0';
        this.mapCanvas.style.zIndex = '4';
        this.map.on('resize', this._onResize);
        this.map.on('move', this._onMove);
        this.map.on('projectiontransition', this._onMove);
        this._onResize();
    }

    /**
     * 创建半分辨率叠加画布，光晕本身是软边，降低像素负担。
     *
     * @returns {HTMLCanvasElement} 画布
     */
    _createCanvas() {
        const canvas = document.createElement('canvas');
        canvas.className = 'eng-globe-halo-canvas';
        canvas.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:0';
        return canvas;
    }

    /**
     * 地球 canvas 高于光晕。
     *
     * @returns {void}
     */
    _ensureStyle() {
        if (document.getElementById(STYLE_ID)) {
            return;
        }
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = [
            `.${MAP_CLASS}{background:${SPACE_COLOR}}`,
            `.${MAP_CLASS} .maplibregl-canvas-container{z-index:0;isolation:isolate}`,
        ].join('');
        document.head.appendChild(style);
    }

    /**
     * 同步画布尺寸。
     *
     * @returns {void}
     */
    _onResize() {
        this.width = this.mapCanvas.clientWidth;
        this.height = this.mapCanvas.clientHeight;
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;
        this.canvas.width = Math.max(1, Math.round(this.width * BACKING_SCALE));
        this.canvas.height = Math.max(1, Math.round(this.height * BACKING_SCALE));
        this.ctx?.setTransform(BACKING_SCALE, 0, 0, BACKING_SCALE, 0, 0);
        this.starfield = null;
        this._paint();
    }

    /**
     * 同一帧只排一次绘制。
     *
     * @returns {void}
     */
    _schedulePaint() {
        if (this.destroyed || this.rafId) {
            return;
        }
        this.rafId = requestAnimationFrame(this._paint);
    }

    /**
     * 按当前球体位置画星空和外层光晕。
     *
     * @returns {void}
     */
        /**
     * 按当前球体位置画星空和外层光晕。
     *
     * @returns {void}
     */
    _paint() {
        this.rafId = 0;
        const ctx = this.ctx;
        if (!ctx || this.destroyed || this.width <= 0) {
            return;
        }
        ctx.clearRect(0, 0, this.width, this.height);
        if (!isGlobe(this.map)) {
            return;
        }
        
        // 1. 星空照常绘制（星空平移是没有问题的，极地也能看到星空）
        this._blitStars(ctx);

        // ★ 2. 新增极点保护：纬度大于 80° 时，不画光晕，防止半径爆炸刷白全屏
        const center = this.map.getCenter();
        if (Math.abs(center.lat) > 80) {
            return; 
        }

        const disc = globeDisc(this.map);
        if (disc.radius >= 5) {
            this._fillHalo(ctx, disc);
        }
    }

    /**
     * 生成一次星图纹理。
     *
     * @returns {void}
     */
    _ensureStarfield() {
        if (this.starfield) {
            return;
        }
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return;
        }
        const count = Math.round((this.width * this.height) / STAR_AREA);
        for (let i = 0; i < count; i++) {
            paintStar(ctx, this.width, this.height);
        }
        const center = this.map.getCenter();
        this.starOrigin = { lng: center.lng, lat: center.lat };
        this.starfield = canvas;
    }

    /**
     * 按经纬度平移星图，做出缓慢视差。
     *
     * @param {CanvasRenderingContext2D} ctx 上下文
     * @returns {void}
     */
    _blitStars(ctx) {
        this._ensureStarfield();
        if (!this.starfield) {
            return;
        }
        const center = this.map.getCenter();
        const shiftX = ((center.lng - this.starOrigin.lng) / 360) * this.width;
        const shiftY = ((center.lat - this.starOrigin.lat) / 180) * this.height;
        const x = ((shiftX % this.width) + this.width) % this.width;
        const y = ((shiftY % this.height) + this.height) % this.height;
        ctx.drawImage(this.starfield, x, y, this.width, this.height);
        ctx.drawImage(this.starfield, x - this.width, y, this.width, this.height);
        ctx.drawImage(this.starfield, x, y - this.height, this.width, this.height);
        ctx.drawImage(this.starfield, x - this.width, y - this.height, this.width, this.height);
    }

    /**
     * 径向光晕，色带与编辑端一致。
     *
     * @param {CanvasRenderingContext2D} ctx 上下文
     * @param {{x: number, y: number, radius: number}} disc 球体圆盘
     * @returns {void}
     */
    _fillHalo(ctx, disc) {
        const outer = disc.radius * HALO_EXTENT;
        const base = parseHex(HALO_COLOR);
        const gradient = ctx.createRadialGradient(
            disc.x, disc.y, disc.radius, disc.x, disc.y, outer,
        );
        HALO_STOPS.forEach(([stop, alpha, shade]) => {
            gradient.addColorStop(stop, toRgba(shadeRgb(base, shade), alpha * HALO_OPACITY));
        });
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(disc.x, disc.y, outer, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

/**
 * 把 RGB 和透明度收成 css 颜色。
 *
 * @param {{r: number, g: number, b: number}} rgb 颜色
 * @param {number} alpha 透明度
 * @returns {string} rgba()
 */
function toRgba({ r, g, b }, alpha) {
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * 画一颗星。
 *
 * @param {CanvasRenderingContext2D} ctx 上下文
 * @param {number} width 场宽
 * @param {number} height 场高
 * @returns {void}
 */
function paintStar(ctx, width, height) {
    const size = Math.random() * 1.2 + 0.2;
    const alpha = Math.random() * 0.55 + 0.18;
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.beginPath();
    ctx.arc(Math.random() * width, Math.random() * height, size, 0, Math.PI * 2);
    ctx.fill();
}

export { GlobeHalo };
