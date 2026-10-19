import { publicService2 } from '@/api/base';

// =====================分页查询项目列表=======================
export async function getProjectList(data) {
    return await publicService2.post('/admin-api/fin/finance-project/page', data);
}

// =====================根据业务项目ID查询项目详情=======================
export async function getProjectIfnoById(projectId) {
    return await publicService2.get(`/admin-api/fin/finance-project/project-id/${projectId}`);
}
// =====================保存活更新财务项目=======================
export async function saveFinanceProject(data) {
    return await publicService2.post('/admin-api/fin/finance-project/saveOrUpdate', data);
}
// =====================根据主键ID查询项目详情=======================
export async function getProjectIfnoByProjectid(projectId) {
    return await publicService2.get(`/admin-api/fin/finance-project/${projectId}`);
}
// =====================删除财务项目=======================
export async function deletProjectById(projectId) {
    return await publicService2.del(`/admin-api/fin/finance-project/${projectId}`);
}

// 计算

export async function comprehensiveFinanceData(projectId) {
    return await publicService2.post(`/admin-api/fin/finance-calculate/comprehensiveFinanceData/${projectId}`);
}


// 获取造假库默认值
export async function getDefaultPricValue() {
    return await publicService2.get(`/admin-api/fin/finance-project/getProjectCostDefaultValue`);
}


// 可研财务调整创建项目
export async function createProjectByProjectId(data) {
    return await publicService2.post(`/admin-api/fin/finance-project/reportFinAdjust`,data);
}

// 重新生成报告
export async function againGeneReport(estProjectId) {
    return await publicService2.post(`/admin-api/fin/finance-project/againFinGeneReport/${estProjectId}`);
}









