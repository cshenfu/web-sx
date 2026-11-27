/**
 * 测距 / 测面 / 画圆 / 清除：独立于地图引擎的 IControl 工具组。
 */

import './measure-controls.css';

export class MeasureControl {
    /**
     * @param {object} handlers 按钮回调
     * @param {() => void} handlers.onLength 测距
     * @param {() => void} handlers.onArea 测面
     * @param {() => void} [handlers.onCircle] 画圆测半径；缺省则不显示画圆按钮
     * @param {() => void} handlers.onClear 清除测量
     * @param {boolean} [handlers.showCircle=true] 是否显示画圆
     */
    constructor(handlers) {
        this._handlers = handlers;
        this._showCircle = handlers.showCircle !== false && typeof handlers.onCircle === 'function';
        /** @type {HTMLDivElement|null} */
        this._container = null;
        /** @type {HTMLButtonElement|null} */
        this._lengthBtn = null;
        /** @type {HTMLButtonElement|null} */
        this._areaBtn = null;
        /** @type {HTMLButtonElement|null} */
        this._circleBtn = null;
    }

    /**
     * 挂载控件。
     *
     * @param {import('maplibre-gl').Map} _map 地图实例（IControl 约定入参）
     * @returns {HTMLElement} 控件根节点
     */
    onAdd(_map) {
        this._container = document.createElement('div');
        this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group map-measure-controls';
        this._lengthBtn = this._createButton(
            'map-measure-length',
            '测量长度（单击添加测量点，双击结束；再次点击退出）',
            () => this._handlers.onLength(),
        );
        this._container.append(this._lengthBtn);
        this.setActiveTool(null);
        return this._container;
    }

    /**
     * 卸载控件。
     *
     * @returns {void}
     */
    onRemove() {
        this._container?.remove();
        this._container = null;
        this._lengthBtn = null;
        this._areaBtn = null;
        this._circleBtn = null;
    }

    /**
     * 同步测距/测面/画圆按钮激活态。
     *
     * @param {'length'|'area'|'circle'|null} tool 当前工具
     * @returns {void}
     */
    setActiveTool(tool) {
        this._syncButton(this._lengthBtn, tool === 'length');
        this._syncButton(this._areaBtn, tool === 'area');
        this._syncButton(this._circleBtn, tool === 'circle');
    }

    /**
     * 创建图标按钮。
     *
     * @param {string} className 图标类名
     * @param {string} title 提示与无障碍文案
     * @param {() => void} onClick 点击回调
     * @returns {HTMLButtonElement}
     */
    _createButton(className, title, onClick) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = className;
        button.title = title;
        button.setAttribute('aria-label', title);
        button.addEventListener('mousedown', (event) => {
            event.stopPropagation();
        });
        button.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            onClick();
        });
        return button;
    }

    /**
     * 更新单个开关按钮的 pressed / active。
     *
     * @param {HTMLButtonElement|null} button 按钮
     * @param {boolean} active 是否激活
     * @returns {void}
     */
    _syncButton(button, active) {
        if (!button) {
            return;
        }
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
    }
}
