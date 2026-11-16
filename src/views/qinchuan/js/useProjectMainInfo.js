import { computed, ref, unref, watch } from 'vue'
import { getAiProjectData } from '@/api/modules/project'
import { buildMainInfoFromAi } from './aiProjectAdapter'

const EMPTY_MAIN_INFO = {
  timeline: [],
  metrics: [],
  planCards: [],
  subTabs: [],
}

function hasMainInfoShape(value) {
  return Boolean(
    value &&
    typeof value === 'object' &&
    (Array.isArray(value.timeline) ||
      Array.isArray(value.metrics) ||
      Array.isArray(value.planCards) ||
      Array.isArray(value.subTabs))
  )
}

/**
 * 统一两个项目详情面板的主要信息来源：
 * 1. 优先使用父级已组装好的 mainInfo；
 * 2. 列表数据尚未包含 mainInfo 时，按 AI 项目 ID 拉取详情并复用统一适配器。
 */
export function useProjectMainInfo(projectSource) {
  const loadedMainInfo = ref(null)
  const loading = ref(false)
  let requestVersion = 0

  const project = computed(() => unref(projectSource) || {})
  const projectId = computed(() => project.value.aiProjectId || project.value.id)

  const mainInfo = computed(() => {
    const provided = project.value.mainInfo
    if (hasMainInfoShape(provided)) return provided
    return loadedMainInfo.value || EMPTY_MAIN_INFO
  })

  watch(
    projectId,
    async (id) => {
      const version = ++requestVersion
      loadedMainInfo.value = null
      if (!id || hasMainInfoShape(project.value.mainInfo)) return

      loading.value = true
      try {
        const res = await getAiProjectData(id)
        if (version !== requestVersion) return
        if (res?.code === 200 && res.data) {
          loadedMainInfo.value = buildMainInfoFromAi(res.data)
        }
      } catch (error) {
        if (version === requestVersion) {
          console.error('[ProjectDetail] 加载主要信息失败:', error)
        }
      } finally {
        if (version === requestVersion) loading.value = false
      }
    },
    { immediate: true }
  )

  watch(
    () => project.value.mainInfo,
    (value) => {
      if (hasMainInfoShape(value)) loadedMainInfo.value = value
    }
  )

  return { mainInfo, loading }
}
