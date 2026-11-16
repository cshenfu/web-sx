import { computed, ref } from 'vue'

const PROJECT_SLOTS = ['focused', 'selected', 'action', 'geometry']

function sameProject(a, b) {
  return a?.id != null && b?.id != null && String(a.id) === String(b.id)
}

/**
 * 页面级项目上下文。
 * 不同槽位保留不同业务语义：地图聚焦、详情选中、操作目标、几何编辑目标。
 * 它们可以指向同一个项目，但不强行合并成一个状态，避免改变现有交互流程。
 */
export function useProjectContext() {
  const focusedProject = ref(null)
  const selectedProject = ref(null)
  const actionProject = ref(null)
  const geometryProject = ref(null)

  const activeProject = computed(() => (
    actionProject.value
    || selectedProject.value
    || focusedProject.value
    || geometryProject.value
    || null
  ))

  function setProject(slot, project) {
    if (!PROJECT_SLOTS.includes(slot)) return
    const target = {
      focused: focusedProject,
      selected: selectedProject,
      action: actionProject,
      geometry: geometryProject,
    }[slot]
    target.value = project || null
  }

  function syncProject(project, slots = PROJECT_SLOTS) {
    if (project?.id == null) return
    const targets = {
      focused: focusedProject,
      selected: selectedProject,
      action: actionProject,
      geometry: geometryProject,
    }
    slots.forEach((slot) => {
      const target = targets[slot]
      if (target && sameProject(target.value, project)) {
        target.value = project
      }
    })
  }

  function clearProject(projectId, slots = PROJECT_SLOTS) {
    if (projectId == null) return
    const targets = {
      focused: focusedProject,
      selected: selectedProject,
      action: actionProject,
      geometry: geometryProject,
    }
    slots.forEach((slot) => {
      const target = targets[slot]
      if (target && String(target.value?.id ?? '') === String(projectId)) {
        target.value = null
      }
    })
  }

  return {
    focusedProject,
    selectedProject,
    actionProject,
    geometryProject,
    activeProject,
    setProject,
    syncProject,
    clearProject,
  }
}
