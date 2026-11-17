import { onScopeDispose } from 'vue'

const DEFAULT_HIDE_DELAY = 800

/**
 * Shared hover-card lifecycle for map project previews.
 * The page owns the hovered project ref; this composable owns only its timer.
 */
export function useProjectHover(hoveredProject, hideDelay = DEFAULT_HIDE_DELAY) {
  let hideTimer = null

  function clearHoverHideTimer() {
    if (hideTimer) {
      clearTimeout(hideTimer)
      hideTimer = null
    }
  }

  function clearHoverState() {
    clearHoverHideTimer()
    hoveredProject.value = null
  }

  function scheduleHoverHide() {
    clearHoverHideTimer()
    hideTimer = setTimeout(() => {
      hoveredProject.value = null
      hideTimer = null
    }, hideDelay)
  }

  function onHoverCardEnter() {
    clearHoverHideTimer()
  }

  function onHoverCardLeave() {
    scheduleHoverHide()
  }

  onScopeDispose(clearHoverHideTimer)

  return {
    clearHoverHideTimer,
    clearHoverState,
    scheduleHoverHide,
    onHoverCardEnter,
    onHoverCardLeave,
  }
}
