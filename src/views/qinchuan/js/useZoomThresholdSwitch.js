// src/views/dashboard/shared/useZoomThresholdSwitch.js
import { ref } from 'vue'
import { AREA_ZOOM_THRESHOLD } from './mapConfig'

/**
 * 通用地图缩放阈值切换器：达到 zoomThreshold 时进入"区域视图"，低于时退出。
 * - onAboveThreshold / onBelowThreshold：每次 zoom 事件都会执行（用于兜底渲染，比如图层丢了要重画）
 * - onEnter / onExit：只在跨越阈值的那一刻执行一次（用于加载/清理区域数据、重置选中状态等）
 *
 * 首页（挤出图层 ⇄ 可编辑区域）与智能选址页（默认视图 ⇄ 只读区域视图）
 * 都是同一种"低于阈值显示 A、达到阈值显示 B"的模式，因此抽成通用 composable。
 */
export function useZoomThresholdSwitch({
  mapRef,
  zoomThreshold = AREA_ZOOM_THRESHOLD,
  onEnter,
  onExit,
  onAboveThreshold,
  onBelowThreshold,
}) {
  const isAreaView = ref(false)
  let zoomHandler = null

  function syncByZoom() {
    const map = mapRef.value?.getMap()
    if (!map) return

    const shouldShowAreaView = map.getZoom() >= zoomThreshold

    if (shouldShowAreaView) {
      onAboveThreshold?.()
      if (!isAreaView.value) {
        isAreaView.value = true
        onEnter?.()
      }
    } else {
      onBelowThreshold?.()
      if (isAreaView.value) {
        isAreaView.value = false
        onExit?.()
      }
    }
  }

  function bindZoomListener() {
    const map = mapRef.value?.getMap()
    if (!map) return
    if (zoomHandler) map.off('zoom', zoomHandler)
    zoomHandler = () => syncByZoom()
    map.on('zoom', zoomHandler)
  }

  function unbindZoomListener() {
    const map = mapRef.value?.getMap()
    if (map && zoomHandler) map.off('zoom', zoomHandler)
    zoomHandler = null
  }

  return { isAreaView, syncByZoom, bindZoomListener, unbindZoomListener }
}