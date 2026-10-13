import { publicService } from '@/api/base';
// 概算模板列表
export async function getEstimateProjectList(data) {
    return await publicService.post(`/admin-api/est/estimateTemplate/list/page`, data);
}
// 概算模板详情
export async function getEstimateProjectDetail(id) {
    return await publicService.get(`/admin-api/est/estimateTemplate/getEstimateTemplateDetail/${id}`);
}
// 概算模板新增-编辑-复制
export async function createEstimateProject(data) {
    return await publicService.post(`/admin-api/est/estimateTemplate/createOrUpdate`, data);
}
// 概算模板删除
export async function deleteEstimateProject(id) {
    return await publicService.post(`/admin-api/est/estimateTemplate/delete/${id}`);
}
// 施工服务工程树结构数据
export async function getConstructionServiceTree(estimateTemplateId) {
    return await publicService.get(`/admin-api/est/constructionAuxiliary/getConstructionAuxiliaryTree/${estimateTemplateId}`);
}
// 保存施工服务工程树结构数据
export async function saveConstructionServiceTree(data) {
    return await publicService.post(`/admin-api/est/constructionAuxiliary/saveConstructionAuxiliaryTree`, data);
}
// 设备及安装树结构数据
export async function getDeviceInstallTree(estimateTemplateId) {
    return await publicService.get(`/admin-api/est/equipmentInstall/getEquipmentInstallTree/${estimateTemplateId}`);
}
// 保存设备及安装树结构数据
export async function saveDeviceInstallTree(data) {
    return await publicService.post(`/admin-api/est/equipmentInstall/saveEquipmentInstallTree`, data);
}
// 建筑工程树结构数据
export async function getConstructionTree(estimateTemplateId) {
    return await publicService.get(`/admin-api/est/buildEngineer/getBuildEngineerTree/${estimateTemplateId}`);
}
// 保存建筑工程树结构数据
export async function saveConstructionTree(data) {
    return await publicService.post(`/admin-api/est/buildEngineer/saveBuildEngineerTree`, data);
}
// 其他费用树结构数据
export async function getOtherCostTree(estimateTemplateId) {
    return await publicService.get(`/admin-api/est/otherFee/getOtherFeeTree/${estimateTemplateId}`);
}
// 保存其他费用树结构数据
export async function saveOtherCostTree(data) {
    return await publicService.post(`/admin-api/est/otherFee/saveOtherFeeTree`, data);
}


// 添加定额时候查询是否存在替换项
export async function getReplaceItem(quotaCatalogId, quotaCode) {
    return await publicService.get(`/admin-api/est/quota-price/getQuotaSwapPriceByQuotaCode/${quotaCatalogId}/${quotaCode}`);
}
// 根据定额编码查询所有的单价
export async function getQuotaPriceByCode(quotaCatalogId, quotaCode) {
    return await publicService.get(`/admin-api/est/quota-price/getEstimatePriceByQuotaCode/${quotaCatalogId}/${quotaCode}`);
}
// 根据费用id和定额code查询单个定额的单价
export async function getQuotaPriceByQuotaCode(quotaCatalogId,estimateItemId,itemType, quotaCode) {
    return await publicService.get(`/admin-api/est/quota-price/getEstimatePriceByEstimateItemId/${quotaCatalogId}/${estimateItemId}/${itemType}/${quotaCode}`);
}





// =====================================概算项目相关===========================================


// 创建概算项目
export async function createProject(data) {
    return await publicService.post(`/admin-api/est/estimate-project/create`, data);
}

// 更新项目
export async function updateProject(data) {
    return await publicService.post(`/admin-api/est/estimate-project/update`, data);
}



// 获取价格库年和季度数据
export async function getMaterialPrice(platformType=2) {
    return await publicService.get(`/admin-api/est/nationalUnitMaterialPrice/year-quarter-linkage/${platformType}`);
}

// 根据id获取项目详情
export async function getProjectDetailById(id) {
    return await publicService.get(`/admin-api/est/estimate-project/estProject/${id}`);
}

// 根据id获取项目编辑详情
export async function getProjectDetailByIdEdit(id) {
    return await publicService.get(`/admin-api/est/estimate-project/estProjectEdit/${id}`);
}



// 建筑工程按行编辑
export async function editBuildEngineer(data) {
    return await publicService.post(`/admin-api/est/buildEngineer/editBuildEngineer`, data);
}


// 建筑工程添加定额
export async function addBuildEngineerQuota(data) {
    return await publicService.post(`/admin-api/est/buildEngineer/addBuildEngineerQuota`, data);
}

// 建筑工程删除定额
export async function removeBuildEngineerQuota(data) {
    return await publicService.post(`/admin-api/est/buildEngineer/removeBuildEngineerQuota`, data);
}


// 施工辅助工程按行编辑
export async function editConAuxiliary(data) {
    return await publicService.post(`/admin-api/est/constructionAuxiliary/editConAuxiliary`, data);
}


// 施工辅助工程添加定额
export async function addConAuxiliaryQuota(data) {
    return await publicService.post(`/admin-api/est/constructionAuxiliary/addConAuxiliaryQuota`, data);
}

// 施工辅助工程删除定额
export async function removeConAuxiliaryQuota(data) {
    return await publicService.post(`/admin-api/est/constructionAuxiliary/removeConAuxiliaryQuota`, data);
}

// 设备安装工程按行编辑
export async function editEquipInstall(data) {
    return await publicService.post(`/admin-api/est/equipmentInstall/editEquipInstall`, data);
}


// 设备安装工程添加定额
export async function addEquipInstallQuota(data) {
    return await publicService.post(`/admin-api/est/equipmentInstall/addEquipInstallQuota`, data);
}

// 设备安装工程删除定额
export async function removeEquipInstallQuota(data) {
    return await publicService.post(`/admin-api/est/equipmentInstall/removeEquipInstallQuota`, data);
}


// 其他费用按行编辑
export async function editOtherFee(data) {
    return await publicService.post(`/admin-api/est/otherFee/editOtherFee`, data);
}



// 计算费用
export async function comprehensiveEstimateData(id) {
    return await publicService.post(`/admin-api/est/estimate-calculate/comprehensiveEstimateData/${id}`);
}

// 单价数据复制
export async function copyPrice() {
    return await publicService.post(`/admin-api/est/copy/price/platform-to-user`);
}


// 计算其他费用前置接口
export async function getOtherPrice(id) {
    return await publicService.post(`/admin-api/est/estimate-calculate/prepareOtherFeeCalculat/${id}`);
}


// 编辑费用项定额
export async function editQuota(data) {
    return await publicService.post(`/admin-api/est/calculatFactor/editQuotaCalculatFactor`,data);
}

// 编辑自动计算单价自动清空定额
// 编辑费用项定额
export async function clearQuota(data) {
    return await publicService.post(`/admin-api/est/estimate-project/auto/clearQuotas`,data);
}

// 重新生成报告
export async function againGeneReport(estProjectId) {
    return await publicService.post(`/admin-api/est/estimate-project/againGeneReport/${estProjectId}`);
}