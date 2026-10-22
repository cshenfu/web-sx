<template>
    <div class="maplibre-map-template">
        <div id="mapContainer"></div>
        <slot></slot>
    </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch, nextTick } from 'vue';
import * as maplibregl from 'maplibre-gl'; 

// 解决 Worker 报错
import { setWorkerUrl } from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
setWorkerUrl(maplibreWorkerUrl);

import 'maplibre-gl/dist/maplibre-gl.css';
import pointIcon from '@/assets/img/mapIcon/pointIcon.png';
import { ElMessage } from 'element-plus';
import isInChina from '@/utils/checkPointInChinaMainland';

import { satelliteStyle } from './mapConfig'; 
import { attachSxLayers } from '@/components/site-map/attachSxLayers';
import { WHLN_LAYER_IDS, DEFAULT_VISIBLE } from '@/components/site-map/layerPanelConfig';

const props = defineProps({
    roadKey: { type: Boolean, default: false },
    resourceMapKey: { type: Boolean, default: false },
    terrainMapKey: { type: Boolean, default: false },
    ghiMapKey: { type: Boolean, default: false },
});

const emits = defineEmits(['toPostLngLat', 'updateCesiumMapScale', 'getWeatherData']);

let map = null;
let whlnPlugin = null; 

let currentMarker = null;
let measurePoints = [];
let isDrawing = ref(false);

const onInitMap = () => {
    const finalStyle = {
        version: 8,
        projection: { type: 'globe' },
        sources: { ...(satelliteStyle.sources || {}) },
        layers: [ ...(satelliteStyle.layers || {}) ]
    };

    map = new maplibregl.Map({
        container: 'mapContainer',
        style: finalStyle,
        center: [104.195397, 35.86166],
        zoom: 1.5,
        pitch: 0,
        bearing: 0,
        attributionControl: false,
        maxZoom: 18,
        minZoom: 0,
        projection: 'globe'
    });

    map.doubleClickZoom.disable();

    map.on('style.load', () => {
        if (map.setSky) {
            map.setSky({
                'sky-color': '#199EF3',
                'sky-horizon-blend': 0.5,
                'horizon-color': '#ffffff',
                'horizon-fog-blend': 0.5,
                'fog-color': '#000000',
                'fog-ground-blend': 0.5
            });
        }
    });

    map.on('load', () => {
        addBusinessLayers();
        try {
            whlnPlugin = attachSxLayers(map, { 
                initialVisibleIds: DEFAULT_VISIBLE.filter(id => WHLN_LAYER_IDS.includes(id))
            });
        } catch (err) {
            console.warn('[whln] 图层控制挂载失败:', err);
        }
    });

    bindMapEvents();
    map.on('move', () => calculateScale());
    map.on('moveend', () => calculateScale());
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 100, unit: 'metric' }), 'bottom-left');
};

const addBusinessLayers = () => {
    if (!map) return;
    map.addSource('wind-res', {
        type: 'raster',
        tiles: ['https://gis.wh-ge.com/whln-map-service/wind/gwc/service/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=wind:speed&STYLE=&TILEMATRIXSET=EPSG:4326&FORMAT=image/png&TILEMATRIX=EPSG:4326:{z}&TILEROW={y}&TILECOL={x}'],
        tileSize: 256,
    });
    map.addLayer({ id: 'layer-wind-res', type: 'raster', source: 'wind-res', layout: { visibility: 'none' }, paint: { 'raster-opacity': 0.6 } });

    map.addSource('ghi-res', {
        type: 'raster',
        tiles: ['https://gis.wh-ge.com/whln-map-service/ghi/gwc/service/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ghi:china-ghi&STYLE=&TILEMATRIXSET=EPSG:4326&FORMAT=image/png&TILEMATRIX=EPSG:4326:{z}&TILEROW={y}&TILECOL={x}'],
        tileSize: 256,
    });
    map.addLayer({ id: 'layer-ghi-res', type: 'raster', source: 'ghi-res', layout: { visibility: 'none' }, paint: { 'raster-opacity': 0.6 } });

    map.addSource('road-net', { type: 'raster', tiles: ['https://gis.wh-ge.com/data/gaode/{z}/{x}/{y}.png'], tileSize: 256 });
    map.addLayer({ id: 'layer-road-net', type: 'raster', source: 'road-net', layout: { visibility: 'none' } });

    map.addSource('dem', { type: 'raster', tiles: ['https://gis.wh-ge.com/data/dem/{z}/{x}/{y}.png'], tileSize: 256 });
    map.addLayer({ id: 'layer-dem', type: 'raster', source: 'dem', layout: { visibility: 'none' } });
};

const updateWhlnLayers = (ids) => {
    if (!map) return;
    const layerMap = {
        'wind-resource': 'layer-wind-res',
        'solar-resource': 'layer-ghi-res',
        'road-network': 'layer-road-net',
        'terrain-3d': 'layer-dem',
    };
    Object.keys(layerMap).forEach(key => {
        const layerId = layerMap[key];
        const isVisible = ids.includes(key);
        if (layerId && map.getLayer(layerId)) {
            map.setLayoutProperty(layerId, 'visibility', isVisible ? 'visible' : 'none');
        }
    });
    if (whlnPlugin) {
        const pluginIds = ids.filter(id => WHLN_LAYER_IDS.includes(id) && !layerMap[id]);
        whlnPlugin.setVisibleIds?.(pluginIds);
    }
};

const syncLayersByProps = () => {
    const ids = [];
    if (props.resourceMapKey) ids.push('wind-resource');
    if (props.ghiMapKey) ids.push('solar-resource');
    if (props.roadKey) ids.push('road-network');
    if (props.terrainMapKey) ids.push('terrain-3d');
    updateWhlnLayers(ids);
};

watch(() => [props.resourceMapKey, props.roadKey, props.terrainMapKey, props.ghiMapKey], () => { syncLayersByProps(); }, { deep: true });

// 👇 【修复 1】给 mousemove 加节流，防止疯狂更新导致崩溃
let lastMoveTime = 0;
const bindMapEvents = () => {
    map.on('click', async (e) => {
        if (isDrawing.value) return;
        const lng = e.lngLat.lng;
        const lat = e.lngLat.lat;
        if (!isInChina(lng, lat)) {
            ElMessage.error('暂不支持该区域数据查询！');
            return;
        }
        addSurfacePoint(lng, lat);
        emits('toPostLngLat', { lng, lat });
    });

    map.on('mousemove', (e) => {
        if (isDrawing.value) return;
        const now = Date.now();
        if (now - lastMoveTime < 100) return; // 100ms 节流
        lastMoveTime = now;
        emits('toPostLngLat', { lng: e.lngLat.lng, lat: e.lngLat.lat, isMove: true });
    });
};

const addSurfacePoint = (lng, lat) => {
    if (currentMarker) currentMarker.remove();
    const el = document.createElement('div');
    el.className = 'custom-marker';
    el.style.backgroundImage = `url(${pointIcon})`;
    el.style.width = '24px'; el.style.height = '24px';
    el.style.backgroundSize = 'contain'; el.style.backgroundRepeat = 'no-repeat';
    el.style.cursor = 'pointer';

    currentMarker = new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat([lng, lat]).addTo(map);
    map.flyTo({ center: [lng, lat], zoom: 12, essential: true, duration: 1500 });
};

const calculateScale = () => {
    if (!map) return;
    const y = map.getContainer().clientHeight / 2;
    const left = map.unproject([0, y]);
    const right = map.unproject([100, y]);
    const scale = left.distanceTo(right) / 100;
    if (scale < 1) emits('updateCesiumMapScale', (scale * 100).toFixed(2) + 'm');
    else if (scale < 1000) emits('updateCesiumMapScale', scale.toFixed(2) + 'm');
    else emits('updateCesiumMapScale', (scale / 1000).toFixed(2) + 'km');
};

const flyToCenter = (point) => {
    if (!map) return;
    const { x, y, z } = point;
    let zoomLevel = 12;
    if (z) { if (z > 100000) zoomLevel = 5; else if (z > 50000) zoomLevel = 7; else if (z > 20000) zoomLevel = 9; else if (z > 10000) zoomLevel = 10; else zoomLevel = 13; }
    map.flyTo({ center: [Number(x), Number(y)], zoom: zoomLevel, essential: true, duration: 1500 });
    addSurfacePoint(Number(x), Number(y));
};

// 👇 【修复 2】极其健壮的坐标转换，自动兼容 [lng,lat] 和 [[lng,lat]] 以及更深层
const addPolygonData = (polygonData) => {
    if (!map) return;
    
    let coordinates = [];

    // 情况 1: [[lng, lat], [lng, lat]]
    if (Array.isArray(polygonData[0]?.[0]) && typeof polygonData[0][0][0] === 'number') {
        coordinates = [polygonData];
    } 
    // 情况 2: [[[lng, lat], [lng, lat]]] （已经是多边形环）
    else if (Array.isArray(polygonData[0]?.[0]?.[0]) && typeof polygonData[0][0][0][0] === 'number') {
        coordinates = polygonData;
    }
    // 情况 3: [lng, lat, lng, lat] 平铺数组
    else if (typeof polygonData[0] === 'number') {
        const ring = [];
        for (let i = 0; i < polygonData.length; i += 2) {
            ring.push([polygonData[i], polygonData[i+1]]);
        }
        coordinates = [ring];
    }

    if (!coordinates.length) return;

    // 确保多边形首尾闭合
    const closedCoordinates = coordinates.map(ring => {
        if (ring.length > 0) {
            const first = ring[0];
            const last = ring[ring.length - 1];
            if (first[0] !== last[0] || first[1] !== last[1]) {
                return [...ring, first];
            }
        }
        return ring;
    });

    const geojson = {
        type: 'FeatureCollection',
        features: [{ type: 'Feature', geometry: { type: 'Polygon', coordinates: closedCoordinates }, properties: {} }]
    };

    if (!map.getSource('draw-polygon')) {
        map.addSource('draw-polygon', { type: 'geojson', data: geojson });
        map.addLayer({ id: 'draw-polygon-layer', type: 'fill', source: 'draw-polygon', paint: { 'fill-color': '#F5DEB3', 'fill-opacity': 0.4 } });
        map.addLayer({ id: 'draw-polygon-outline', type: 'line', source: 'draw-polygon', paint: { 'line-color': '#F5DEB3', 'line-width': 2 } });
    } else {
        map.getSource('draw-polygon').setData(geojson);
    }
};

const changeMapMode = (index) => {};

const drawLineMeasureGraphics = (type) => {
    if (isDrawing.value) return;
    isDrawing.value = true;
    measurePoints = [];
    map.getContainer().style.cursor = 'crosshair';
    if (!map.getSource('draw-line')) {
        map.addSource('draw-line', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
        map.addLayer({ id: 'draw-line-layer', type: 'line', source: 'draw-line', paint: { 'line-color': '#F5DEB3', 'line-width': 3 } });
    }
    const onDrawClick = (e) => {
        const coords = [e.lngLat.lng, e.lngLat.lat];
        measurePoints.push(coords);
        const el = document.createElement('div');
        el.style.width = '6px'; el.style.height = '6px';
        el.style.backgroundColor = '#F5DEB3'; el.style.borderRadius = '50%';
        new maplibregl.Marker({ element: el }).setLngLat(coords).addTo(map);
        if (type === 'Polyline' && measurePoints.length > 1) {
            map.getSource('draw-line').setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: measurePoints } });
        }
    };
    map.on('click', onDrawClick);
    const onRightClick = (e) => {
        e.preventDefault();
        isDrawing.value = false;
        map.getContainer().style.cursor = '';
        map.off('click', onDrawClick);
        map.off('contextmenu', onRightClick);
        measurePoints = [];
    };
    map.on('contextmenu', onRightClick);
};

defineExpose({ flyToCenter, addPolygonData, changeMapMode, drawLineMeasureGraphics, updateWhlnLayers });

onMounted(() => { nextTick(() => onInitMap()); });
onUnmounted(() => {
    if (whlnPlugin) { whlnPlugin.destroy?.(); whlnPlugin = null; }
    if (map) { map.remove(); map = null; }
});
</script>

<style lang="scss" scoped>
.maplibre-map-template {
    position: relative;
    height: 100%;
    width: 100%;
    background: #0b1e3a;
    #mapContainer { width: 100%; height: 100%; }
}
</style>