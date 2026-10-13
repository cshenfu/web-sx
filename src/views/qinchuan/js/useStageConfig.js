import * as configApi from '@/api/modules/configData'

// 阶段编码 → configData 里的 name 映射
const STAGE_CODE_TO_NAME = {
  PROJECT_RESERVE: '项目储备',
  PROJECT_INITIATION: '项目立项',
  FEASIBILITY_REVIEW: '可研审查',
  INVESTMENT_DECISION: '投资决策',
}

let stageListCache = null

export function useStageConfig() {
  async function getStageList() {
    if (stageListCache) return stageListCache
    const res = await configApi.getStageList()
    stageListCache = res?.data || []
    return stageListCache
  }

  async function getStageIdByCode(stageCode) {
    const list = await getStageList()
    const targetName = STAGE_CODE_TO_NAME[stageCode]
    if (!targetName) return null
    return list.find(s => s.name === targetName)?.id ?? null
  }

  async function getFileItemsByStageId(stageId) {
    if (!stageId) return []
    const res = await configApi.listByParentId(stageId)
    return res?.data || []
  }

  return { getStageList, getStageIdByCode, getFileItemsByStageId }
}