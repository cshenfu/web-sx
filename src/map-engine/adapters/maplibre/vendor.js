/**
 * MapLibre GL JS 6 的唯一引入点。
 * 其他模块禁止 import maplibre-gl。
 */

import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './query-cursor.css';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

maplibregl.setWorkerUrl(workerUrl);

export { maplibregl };

/** 与 whln-web-edit 相同的字形服务，测量标注使用 Noto Sans Regular。 */
export const GLYPHS = 'https://nexus.wh-ge.com/maplibre-fonts/{fontstack}/{range}.pbf';

export const LABEL_FONT = ['Noto Sans Regular'];

/** 栅格层插到该层之前，覆盖物画在它上面。 */
export const OVERLAY_ANCHOR = 'eng-overlay-anchor';
