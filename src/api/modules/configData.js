import { publicService4 } from '@/api/base'

// ========================================================
// 通用配置表 API
// 用于项目各阶段的"文件类型"配置，例如"必要支持文件""其他材料"
// 以及上会流程的二级业务（如"to新能源公司""to陕西公司"）等
// ========================================================

// --------------------------------------------------------
// 1. 获取适用阶段列表
//    GET /api/configData/listStage
//    返回：树形根节点（阶段列表），id 用于 batchCreate 时的 parentId
// --------------------------------------------------------
export async function getStageList() {
  return await publicService4.get('/api/configData/listStage')
}

// --------------------------------------------------------
// 2. 根据 parentId 获取数据
//    GET /api/configData/listByParentId/{parentId}
//    parentId 可以是阶段 id（拿一级类型），也可以是一级类型 id（拿二级业务）
// --------------------------------------------------------
export async function listByParentId(parentId) {
  return await publicService4.get(`/api/configData/listByParentId/${parentId}`)
}

// --------------------------------------------------------
// 3. 批量添加文件分类（适用阶段下添加类型）
//    POST /api/configData/batchCreate
//    body: { notes, stageList: [{ id, name, stage }], typeList: [{ name, detailName, sortOrder }] }
// --------------------------------------------------------
export async function batchCreateConfig(data) {
  return await publicService4.post('/api/configData/batchCreate', data)
}

// --------------------------------------------------------
// 4. 创建通用配置表
//    POST /api/configData/create
//    body: ConfigData
// --------------------------------------------------------
export async function createConfig(data) {
  return await publicService4.post('/api/configData/create', data)
}

// --------------------------------------------------------
// 5. 更新通用配置表
//    PUT /api/configData/update
//    body: ConfigData
// --------------------------------------------------------
export async function updateConfig(data) {
  return await publicService4.put('/api/configData/update', data)
}

// --------------------------------------------------------
// 6. 删除通用配置表
//    DELETE /api/configData/delete?id=xx
// --------------------------------------------------------
export async function delConfig({ id }) {
  return await publicService4.del(`/api/configData/delete?id=${id}`)
}

// --------------------------------------------------------
// 7. 获取通用配置表详情
//    GET /api/configData/get?id=xx
// --------------------------------------------------------
export async function getConfigDetail(id) {
  return await publicService4.get('/api/configData/get', { id })
}

// --------------------------------------------------------
// 8. 获取通用配置列表（不分页）
//    GET /api/configData/listConfigData
//    params: { bizScenarioType?, detailName?, id?, name?, parentId? }
// --------------------------------------------------------
export async function listConfigData(params) {
  return await publicService4.get('/api/configData/listConfigData', params)
}

// --------------------------------------------------------
// 9. 分页查询通用配置表
//    GET /api/configData/page
//    params: { pageNo, pageSize, bizScenarioType?, detailName?, id?, name?, notes?, parentId?, sortOrder? }
// --------------------------------------------------------
export async function pageConfigData(params) {
  return await publicService4.get('/api/configData/page', params)
}