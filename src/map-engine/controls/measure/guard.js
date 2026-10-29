/**
 * 将测量要素从编辑 EventBus 中剥离，避免标注/补标把测距/测面/画圆当成业务几何。
 */

import { MEASURE_USER_PROP } from './constants.js';
import { getMeasureController } from './session.js';

/**
 * 判断要素是否为测量几何。
 *
 * @param {object|null|undefined} feature GeoJSON Feature
 * @returns {boolean}
 */
export function isMeasureFeature(feature) {
    return Boolean(feature?.properties?.[MEASURE_USER_PROP]);
}

/**
 * 过滤测量相关的 draw 事件 payload。测量进行中整批抑制（此时可能尚未打标）。
 *
 * @param {object|null|undefined} payload draw 事件对象
 * @returns {object|null} 可转发给编辑总线的 payload；应丢弃时返回 null
 */
export function filterMeasurePayload(payload) {
    if (getMeasureController()?.isActive()) {
        return null;
    }
    if (!payload || !Array.isArray(payload.features)) {
        return payload;
    }
    const rest = payload.features.filter((feature) => !isMeasureFeature(feature));
    if (rest.length === payload.features.length) {
        return payload;
    }
    if (rest.length === 0) {
        return null;
    }
    return { ...payload, features: rest };
}
