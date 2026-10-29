/**
 * 地图视图控件（MapLibre IControl）。
 * 提供恢复全景、恢复正北、2D/3D 切换、地球投影，以及可选的分屏比对按钮。
 * 不依赖具体业务，任意 MapLibre 地图均可 addControl。
 */

import './map-view-controls.css';

/** 与 2D/3D 按钮一致：俯仰超过该值视为 3D，并挂载地形。 */
const PITCH_3D_DEGREES = 1;

export class MapViewControls {
    /**
     * @param {object} [options] 控件配置
     * @param {[number, number]} [options.center] 全景复位中心 [lng, lat]
     * @param {number} [options.zoom] 全景复位缩放
     * @param {boolean} [options.compare=false] 是否显示二分屏按钮
     * @param {boolean} [options.quadCompare=true] 是否显示四分屏按钮
     * @param {(mode: 'dual'|'quad') => (void|Promise<void>)} [options.onToggleCompare]
     * @param {(text: string) => void} [options.onWarn] 提示回调
     * @param {(enable3D: boolean) => void} [options.onDimensionChange] 2D/3D 切换时回调，enable3D 为 true 表示进入 3D
     */
    constructor(options = {}) {
        this._center = options.center || [105, 35];
        this._zoom = options.zoom ?? 2.3;
        this._showCompare = options.compare === true;
        this._showQuadCompare = options.quadCompare !== false;
        this._onToggleCompare = options.onToggleCompare;
        this._onWarn = options.onWarn;
        this._onDimensionChange = options.onDimensionChange;
        /** @type {boolean} 当前是否已按 3D 挂上地形，避免 pitch 事件重复回调 */
        this._dimensionTerrainOn = false;
        /** @type {import('maplibre-gl').Map|null} */
        this._map = null;
        /** @type {HTMLDivElement|null} */
        this._container = null;
        /** @type {HTMLButtonElement|null} */
        this._dimensionButton = null;
        /** @type {HTMLButtonElement|null} */
        this._globeButton = null;
        /** @type {HTMLButtonElement|null} */
        this._compareButton = null;
        /** @type {HTMLButtonElement|null} */
        this._quadCompareButton = null;
        this._handlePitch = () => {
            this._updateDimensionButton();
            this._syncDimensionTerrain();
        };
        this._handleProjection = this._updateGlobeButton.bind(this);
        this._handleCompareChanged = (event) => {
            const mode = event.detail?.mode;
            this._updateCompareButton(mode === 'dual');
            this._updateQuadCompareButton(mode === 'quad');
        };
    }

    /**
     * 将控件挂载到地图。
     *
     * @param {import('maplibre-gl').Map} map MapLibre 地图实例
     * @returns {HTMLDivElement} 控件容器
     */
    onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group map-view-controls';
        this._dimensionButton = this._createButton(
            'map-dimension-toggle',
            '切换到3D视图',
            () => this._toggleDimension(),
        );
        this._globeButton = this._createButton(
            'map-globe-toggle',
            '开启地球投影',
            () => this._toggleGlobe(),
        );
        this._container.append(
            this._createButton('map-view-reset', '恢复全景视图', () => this._resetFullView()),
            this._createButton('map-north-reset', '恢复地图到正北方向', () => this._resetNorth()),
            this._dimensionButton,
            this._globeButton,
        );
        this._appendCompareButtons();
        map.on('pitch', this._handlePitch);
        map.on('projectiontransition', this._handleProjection);
        map.on('styledata', this._handleProjection);
        window.addEventListener('mapCompareChanged', this._handleCompareChanged);
        this._updateDimensionButton();
        this._updateGlobeButton();
        this._dimensionTerrainOn = this._is3DView();
        if (this._onDimensionChange && this._dimensionTerrainOn) {
            this._onDimensionChange(true);
        }
        this._syncCompareFromManager();
        return this._container;
    }

    /**
     * 从地图移除控件。地球投影开启时先切回墨卡托。
     *
     * @returns {void}
     */
    onRemove() {
        if (this._isGlobeEnabled()) {
            this._setGlobeEnabled(false);
        }
        this._map?.off('pitch', this._handlePitch);
        this._map?.off('projectiontransition', this._handleProjection);
        this._map?.off('styledata', this._handleProjection);
        window.removeEventListener('mapCompareChanged', this._handleCompareChanged);
        this._container?.remove();
        this._container = null;
        this._dimensionButton = null;
        this._globeButton = null;
        this._compareButton = null;
        this._quadCompareButton = null;
        this._map = null;
    }

    /**
     * 按配置追加分屏按钮。
     *
     * @returns {void}
     */
    _appendCompareButtons() {
        if (this._showCompare) {
            this._compareButton = this._createButton(
                'map-compare-toggle',
                '分屏比对（天地图）',
                () => {
                    void this._toggleCompare('dual');
                },
            );
            this._container.append(this._compareButton);
        }
        if (this._showQuadCompare) {
            this._quadCompareButton = this._createButton(
                'map-quad-compare-toggle',
                '四分屏比对（天地图/百度/高德）',
                () => {
                    void this._toggleCompare('quad');
                },
            );
            this._container.append(this._quadCompareButton);
        }
    }

    /**
     * 用当前比对管理器同步按钮态。
     *
     * @returns {void}
     */
    _syncCompareFromManager() {
        const manager = window.getCompareMapManager?.();
        this._updateCompareButton(Boolean(manager?.isDualActive?.()));
        this._updateQuadCompareButton(Boolean(manager?.isQuadActive?.()));
    }

    /**
     * 创建视图操作按钮。
     *
     * @param {string} className 按钮图标类名
     * @param {string} title 按钮标题和无障碍标签
     * @param {() => void} onClick 点击回调
     * @returns {HTMLButtonElement} 创建完成的按钮
     */
    _createButton(className, title, onClick) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = className;
        button.title = title;
        button.setAttribute('aria-label', title);
        button.addEventListener('click', onClick);
        return button;
    }

    /**
     * 恢复配置中的初始中心和缩放级别，保留当前朝向。
     *
     * @returns {void}
     */
    _resetFullView() {
        this._map?.easeTo({
            center: this._center,
            zoom: this._zoom,
            duration: 800,
        });
    }

    /**
     * 将地图方位角恢复为正北，保留当前中心和缩放级别。
     *
     * @returns {void}
     */
    _resetNorth() {
        this._map?.easeTo({
            bearing: 0,
            duration: 500,
        });
    }

    /**
     * 在俯视 2D 和倾斜 3D 视图之间切换。
     *
     * @returns {void}
     */
    _toggleDimension() {
        if (!this._map) {
            return;
        }
        const enable3D = !this._is3DView();
        this._dimensionTerrainOn = enable3D;
        this._onDimensionChange?.(enable3D);
        this._map.easeTo({
            pitch: enable3D ? 60 : 0,
            duration: 700,
        });
    }

    /**
     * 当前俯仰是否视为 3D 视图。
     *
     * @returns {boolean} pitch 大于阈值时为 true
     */
    _is3DView() {
        return (this._map?.getPitch() ?? 0) > PITCH_3D_DEGREES;
    }

    /**
     * 手势倾斜与 2D/3D 按钮联动：进入 3D 挂地形，回到 2D 卸下。
     *
     * @returns {void}
     */
    _syncDimensionTerrain() {
        if (!this._onDimensionChange) {
            return;
        }
        const is3D = this._is3DView();
        if (is3D === this._dimensionTerrainOn) {
            return;
        }
        this._dimensionTerrainOn = is3D;
        this._onDimensionChange(is3D);
    }

    /**
     * 当前是否处于地球投影。
     *
     * @returns {boolean} true 表示 projection 为 globe
     */
    _isGlobeEnabled() {
        return this._map?.getProjection?.()?.type === 'globe';
    }

    /**
     * 开启或关闭地球投影。
     *
     * @param {boolean} enabled 是否开启地球投影
     * @returns {void}
     */
    _setGlobeEnabled(enabled) {
        if (!this._map?.setProjection) {
            return;
        }
        this._map.setProjection({ type: enabled ? 'globe' : 'mercator' });
        this._updateGlobeButton();
    }

    /**
     * 在 mercator 与 globe 投影之间切换。
     *
     * @returns {void}
     */
    _toggleGlobe() {
        this._setGlobeEnabled(!this._isGlobeEnabled());
    }

    /**
     * 根据当前投影更新地球按钮的激活态与提示文案。
     *
     * @returns {void}
     */
    _updateGlobeButton() {
        if (!this._globeButton) {
            return;
        }
        const enabled = this._isGlobeEnabled();
        const title = enabled ? '关闭地球投影' : '开启地球投影';
        this._globeButton.classList.toggle('is-active', enabled);
        this._globeButton.title = title;
        this._globeButton.setAttribute('aria-label', title);
        this._globeButton.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    }

    /**
     * 根据当前俯仰角更新切换按钮的文字和操作提示。
     *
     * @returns {void}
     */
    _updateDimensionButton() {
        if (!this._map || !this._dimensionButton) {
            return;
        }
        const is3D = this._is3DView();
        const targetDimension = is3D ? '2D' : '3D';
        const title = `切换到${targetDimension}视图`;
        this._dimensionButton.textContent = targetDimension;
        this._dimensionButton.title = title;
        this._dimensionButton.setAttribute('aria-label', title);
    }

    /**
     * 开关分屏比对。优先走注入回调，其次兼容 window.getCompareMapManager。
     *
     * @param {'dual'|'quad'} mode 二分屏或四分屏
     * @returns {Promise<void>}
     */
    async _toggleCompare(mode) {
        if (this._onToggleCompare) {
            try {
                await this._onToggleCompare(mode);
            } catch (error) {
                this._warnCompare(mode, error);
            }
            return;
        }
        const manager = window.getCompareMapManager?.();
        if (!manager) {
            this._onWarn?.('分屏比对尚未接入');
            return;
        }
        try {
            if (mode === 'quad') {
                await manager.toggleQuad();
                return;
            }
            await manager.toggle();
        } catch (error) {
            this._warnCompare(mode, error);
        }
    }

    /**
     * 分屏切换失败时提示。
     *
     * @param {'dual'|'quad'} mode 模式
     * @param {unknown} error 错误
     * @returns {void}
     */
    _warnCompare(mode, error) {
        const label = mode === 'quad' ? '四分屏比对' : '分屏比对';
        console.error(`${label}切换失败:`, error);
        const message = error instanceof Error ? error.message : String(error || '');
        this._onWarn?.(`${label}失败: ${message}`);
    }

    /**
     * 更新二分屏按钮的激活态与提示文案。
     *
     * @param {boolean} active 是否处于二分屏状态
     * @returns {void}
     */
    _updateCompareButton(active) {
        if (!this._compareButton) {
            return;
        }
        const title = active ? '关闭分屏比对' : '分屏比对（天地图）';
        this._compareButton.classList.toggle('is-active', active);
        this._compareButton.title = title;
        this._compareButton.setAttribute('aria-label', title);
        this._compareButton.setAttribute('aria-pressed', active ? 'true' : 'false');
    }

    /**
     * 更新四分屏按钮的激活态与提示文案。
     *
     * @param {boolean} active 是否处于四分屏状态
     * @returns {void}
     */
    _updateQuadCompareButton(active) {
        if (!this._quadCompareButton) {
            return;
        }
        const title = active ? '关闭四分屏比对' : '四分屏比对（天地图/百度/高德）';
        this._quadCompareButton.classList.toggle('is-active', active);
        this._quadCompareButton.title = title;
        this._quadCompareButton.setAttribute('aria-label', title);
        this._quadCompareButton.setAttribute('aria-pressed', active ? 'true' : 'false');
    }
}
