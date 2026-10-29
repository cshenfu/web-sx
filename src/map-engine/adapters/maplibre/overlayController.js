/** GeoJSON 覆盖物：标记、范围面、测量图形。 */

import { LABEL_FONT } from './vendor.js';

const EMPTY = { type: 'FeatureCollection', features: [] };

/**
 * 一组覆盖物的图层 id。
 *
 * @param {string} group 组名
 * @returns {object} source 与各图层 id
 */
function idsFor(group) {
    return {
        sourceId: `eng-o-${group}-src`,
        fillId: `eng-o-${group}-fill`,
        lineId: `eng-o-${group}-line`,
        circleId: `eng-o-${group}-circle`,
        iconId: `eng-o-${group}-icon`,
        labelId: `eng-o-${group}-label`,
        imageId: `eng-o-${group}-image`,
    };
}

/**
 * 点图层过滤：顶点圆点。
 *
 * @returns {unknown[]} MapLibre filter
 */
function vertexFilter() {
    return ['all', ['==', ['geometry-type'], 'Point'], ['==', ['get', 'role'], 'vertex']];
}

/**
 * 文字图层过滤。
 *
 * @returns {unknown[]} MapLibre filter
 */
function labelFilter() {
    return ['all', ['==', ['geometry-type'], 'Point'], ['has', 'label']];
}

/**
 * 图标图层过滤。
 *
 * @returns {unknown[]} MapLibre filter
 */
function iconFilter() {
    return ['all', ['==', ['geometry-type'], 'Point'], ['==', ['get', 'role'], 'icon']];
}

/**
 * 添加面、线和顶点圆。
 *
 * @param {import('maplibre-gl').Map} map 地图
 * @param {object} ids 图层 id
 * @returns {void}
 */
function addShapeLayers(map, ids) {
    map.addLayer({
        id: ids.fillId,
        type: 'fill',
        source: ids.sourceId,
        filter: ['==', ['geometry-type'], 'Polygon'],
        paint: { 'fill-color': '#FFD700', 'fill-opacity': 0.05 },
    });
    map.addLayer({
        id: ids.lineId,
        type: 'line',
        source: ids.sourceId,
        filter: ['any',
            ['==', ['geometry-type'], 'LineString'],
            ['==', ['geometry-type'], 'Polygon'],
        ],
        paint: { 'line-color': '#FFD700', 'line-width': 2 },
    });
    map.addLayer({
        id: ids.circleId,
        type: 'circle',
        source: ids.sourceId,
        filter: vertexFilter(),
        paint: {
            'circle-color': '#F5DEB3',
            'circle-radius': 5,
            'circle-stroke-width': 1,
        },
    });
}

/**
 * 添加文字标注。图标图层在图片加载后再创建。
 *
 * @param {import('maplibre-gl').Map} map 地图
 * @param {object} ids 图层 id
 * @returns {void}
 */
function addSymbolLayers(map, ids) {
    map.addLayer({
        id: ids.labelId,
        type: 'symbol',
        source: ids.sourceId,
        filter: labelFilter(),
        layout: {
            'text-field': ['get', 'label'],
            'text-font': LABEL_FONT,
            'text-size': 14,
            'text-anchor': 'center',
            'text-allow-overlap': true,
            'text-offset': [0, -1.2],
        },
        paint: {
            'text-color': '#FFFFFF',
            'text-halo-color': '#000000',
            'text-halo-width': 1,
        },
    });
}

/**
 * 创建一组覆盖物图层。
 *
 * @param {import('maplibre-gl').Map} map 地图
 * @param {string} group 组名
 * @returns {object} 该组 id
 */
function ensureGroup(map, group) {
    const ids = idsFor(group);
    if (map.getSource(ids.sourceId)) {
        return ids;
    }
    map.addSource(ids.sourceId, { type: 'geojson', data: EMPTY });
    addShapeLayers(map, ids);
    addSymbolLayers(map, ids);
    return ids;
}

/**
 * 把样式写到已有图层上。
 *
 * @param {import('maplibre-gl').Map} map 地图
 * @param {object} ids 图层 id
 * @param {object} style 覆盖物样式
 * @returns {void}
 */
function applyPaint(map, ids, style) {
    if (style.fillColor) {
        map.setPaintProperty(ids.fillId, 'fill-color', style.fillColor);
    }
    if (style.fillOpacity != null) {
        map.setPaintProperty(ids.fillId, 'fill-opacity', style.fillOpacity);
    }
    if (style.lineColor) {
        map.setPaintProperty(ids.lineId, 'line-color', style.lineColor);
    }
    if (style.lineWidth != null) {
        map.setPaintProperty(ids.lineId, 'line-width', style.lineWidth);
    }
    if (style.circleColor) {
        map.setPaintProperty(ids.circleId, 'circle-color', style.circleColor);
    }
    if (style.circleRadius != null) {
        map.setPaintProperty(ids.circleId, 'circle-radius', style.circleRadius);
    }
    if (style.circleStrokeColor) {
        map.setPaintProperty(ids.circleId, 'circle-stroke-color', style.circleStrokeColor);
    }
    if (style.circleStrokeWidth != null) {
        map.setPaintProperty(ids.circleId, 'circle-stroke-width', style.circleStrokeWidth);
    }
    if (style.textColor) {
        map.setPaintProperty(ids.labelId, 'text-color', style.textColor);
    }
    if (style.textHaloColor) {
        map.setPaintProperty(ids.labelId, 'text-halo-color', style.textHaloColor);
    }
    if (style.textHaloWidth != null) {
        map.setPaintProperty(ids.labelId, 'text-halo-width', style.textHaloWidth);
    }
    if (style.iconAnchor && map.getLayer(ids.iconId)) {
        map.setLayoutProperty(ids.iconId, 'icon-anchor', style.iconAnchor);
    }
    if (style.iconSize != null && map.getLayer(ids.iconId)) {
        map.setLayoutProperty(ids.iconId, 'icon-size', style.iconSize);
    }
}

/**
 * 图片就绪后添加图标图层。
 *
 * @param {import('maplibre-gl').Map} map 地图
 * @param {object} ids 图层 id
 * @returns {void}
 */
function addIconLayer(map, ids) {
    if (map.getLayer(ids.iconId)) {
        map.setLayoutProperty(ids.iconId, 'icon-image', ids.imageId);
        return;
    }
    map.addLayer({
        id: ids.iconId,
        type: 'symbol',
        source: ids.sourceId,
        filter: iconFilter(),
        layout: {
            'icon-image': ids.imageId,
            'icon-size': 0.5,
            'icon-anchor': 'bottom',
            'icon-allow-overlap': true,
        },
    });
}

/**
 * 加载图标并挂到符号图层。
 *
 * @param {import('maplibre-gl').Map} map 地图
 * @param {object} ids 图层 id
 * @param {string} url 图标地址
 * @returns {Promise<void>}
 */
function ensureIcon(map, ids, url) {
    if (map.hasImage(ids.imageId)) {
        addIconLayer(map, ids);
        return Promise.resolve();
    }
    return map.loadImage(url).then((image) => {
        if (!map.hasImage(ids.imageId)) {
            map.addImage(ids.imageId, image.data);
        }
        addIconLayer(map, ids);
    });
}

/**
 * 创建覆盖物控制器。
 *
 * @param {import('maplibre-gl').Map} map 地图
 * @returns {{setOverlay: Function, clear: Function}} 控制器
 */
export function createOverlayController(map) {
    return {
        setOverlay(group, geojson, style = {}) {
            const ids = ensureGroup(map, group);
            applyPaint(map, ids, style);
            if (style.iconUrl) {
                ensureIcon(map, ids, style.iconUrl).then(() => {
                    applyPaint(map, ids, style);
                }).catch((error) => {
                    console.warn('地图图标加载失败', error);
                });
            }
            const source = map.getSource(ids.sourceId);
            if (source) {
                source.setData(geojson || EMPTY);
            }
        },
        clear(group) {
            const ids = idsFor(group);
            const source = map.getSource(ids.sourceId);
            if (source) {
                source.setData(EMPTY);
            }
        },
    };
}
