import { publicService4 } from '@/api/base'; // 根据你项目的 axios 实例调整

// ==================== 通用配置表（字典管理） ====================

// 批量添加文件分类 (适用阶段下添加类型)
export async function batchCreateConfigData(data) {
    return await publicService4.post('/api/configData/batchCreate', data);
}

// 创建通用配置表
export async function createConfigData(data) {
    return await publicService4.post('/api/configData/create', data);
}

// 删除通用配置表 (注意这里是 DELETE 请求，参数拼接在 URL 上)
export async function deleteConfigData(id) {
    return await publicService4.del(`/api/configData/delete?id=${id}`);
}

// 获取通用配置表详情
export async function getConfigData(id) {
    return await publicService4.get(`/api/configData/get?id=${id}`);
}

// 根据 parentId 获取数据 (常用于级联、树形子节点)
export async function getConfigDataByParentId(parentId) {
    return await publicService4.get(`/api/configData/listByParentId/${parentId}`);
}

// 获取通用配置列表 (支持多条件查询)
export async function getConfigDataList(params) {
    // params: { bizScenarioType, detailName, id, name, parentId }
    return await publicService4.get('/api/configData/listConfigData', params);
}

// 获取适用阶段列表
export async function getConfigDataStages() {
    return await publicService4.get('/api/configData/listStage');
}

// 分页查询通用配置表
export async function pageConfigData(params) {
    // params: { pageNo, pageSize, bizScenarioType, detailName, name, ... }
    return await publicService4.get('/api/configData/page', params);
}

// 更新通用配置表 (注意这里是 PUT 请求)
export async function updateConfigData(data) {
    return await publicService4.put('/api/configData/update', data);
}