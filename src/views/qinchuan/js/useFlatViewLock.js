// src/components/site-map/js/useFlatViewLock.js
export function useFlatViewLock(mapRef) {
  let locked = false
  let enforcing = false

  function getMap() {
    const ref = mapRef?.value
    if (!ref) return null
    return typeof ref.getMap === 'function' ? ref.getMap() : null
  }

  function enforce() {
    const map = getMap()
    if (!map || !locked || enforcing) return
    if (map.getPitch() === 0 && map.getBearing() === 0) return
    enforcing = true
    map.jumpTo({ pitch: 0, bearing: 0 })
    enforcing = false
  }

  function lock() {
    const map = getMap()
    if (!map || locked) return
    locked = true
    try {
      map.dragRotate?.disable?.()
      map.touchZoomRotate?.disableRotation?.()
      map.keyboard?.disableRotation?.()
      map.setMaxPitch?.(0)
    } catch (err) { console.warn('[flat-view] 锁定失败:', err) }

    if (map.getPitch() !== 0 || map.getBearing() !== 0) {
      map.jumpTo({ pitch: 0, bearing: 0 })
    }
    map.on('pitch', enforce)
    map.on('rotate', enforce)
  }

  function unlock() {
    const map = getMap()
    if (!map || !locked) return
    locked = false
    try {
      map.dragRotate?.enable?.()
      map.touchZoomRotate?.enableRotation?.()
      map.keyboard?.enableRotation?.()
      map.setMaxPitch?.(60)
    } catch (err) { console.warn('[flat-view] 解锁失败:', err) }
    map.off('pitch', enforce)
    map.off('rotate', enforce)
  }

  return { lock, unlock, isLocked: () => locked }
}