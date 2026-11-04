import { publicService4 } from '@/api/base';

// ==================== 企业基本信息管理 ====================

// 创建企业基本信息
export async function createCompanyBasicInfo(data) {
    return await publicService4.post('/api/companyBasicInfo/create', data);
}

// 根据企业ID删除基本信息
export async function deleteCompanyBasicInfoByCompanyId(companyId) {
    return await publicService4.post(`/api/companyBasicInfo/delete/${companyId}`);
}

// 根据基本信息ID删除企业基本信息
export async function deleteCompanyBasicInfo(id) {
    return await publicService4.post(`/api/companyBasicInfo/delete/${id}`);
}

// 根据基本信息ID获取企业基本信息详情
export async function getCompanyBasicInfo(id) {
    return await publicService4.get(`/api/companyBasicInfo/get/${id}`);
}

// 根据企业ID获取企业基本信息详情
export async function getCompanyBasicInfoByCompanyId(companyId) {
    return await publicService4.get(`/api/companyBasicInfo/getByCompanyId/${companyId}`);
}

// 分页查询企业基本信息
export async function pageCompanyBasicInfo(data) {
    return await publicService4.get('/api/companyBasicInfo/page', data);
}

// 更新企业基本信息
export async function updateCompanyBasicInfo(data) {
    return await publicService4.post('/api/companyBasicInfo/update', data);
}


// ==================== 企业文件管理 ====================

// 新增企业文件
export async function addCompanyFile(data) {
    return await publicService4.post('/api/companyFile/add', data);
}

// 根据文件ID删除企业文件
export async function deleteCompanyFile(id) {
    return await publicService4.post(`/api/companyFile/delete/${id}`);
}

// 查询企业文件详情
export async function getCompanyFile(id) {
    return await publicService4.get(`/api/companyFile/get/${id}`);
}

// 查询企业文件列表
export async function getCompanyFileList(params) {
    return await publicService4.get('/api/companyFile/list', params);
}

// 修改企业文件信息
export async function updateCompanyFile(data) {
    return await publicService4.post('/api/companyFile/update', data);
}


// ==================== 企业项目业绩管理 ====================

// 创建项目业绩
export async function createProjectPerformance(data) {
    return await publicService4.post('/api/projectPerformance/create', data);
}

// 删除项目业绩
export async function deleteProjectPerformance(id) {
    return await publicService4.post(`/api/projectPerformance/delete/${id}`);
}

// 根据企业ID删除所有项目业绩
export async function deleteProjectPerformanceByCompanyId(companyId) {
    return await publicService4.post(`/api/projectPerformance/deleteByCompanyId/${companyId}`);
}

// 根据ID获取项目业绩详情
export async function getProjectPerformance(id) {
    return await publicService4.get(`/api/projectPerformance/get/${id}`);
}

// 根据企业ID获取项目业绩列表
export async function getProjectPerformanceList(companyId) {
    return await publicService4.get(`/api/projectPerformance/listByCompanyId/${companyId}`);
}

// 分页查询项目业绩
export async function pageProjectPerformance(data) {
    return await publicService4.get('/api/projectPerformance/page', data);
}

// 更新项目业绩
export async function updateProjectPerformance(data) {
    return await publicService4.post('/api/projectPerformance/update', data);
}


// ==================== 技术能力管理 ====================

// 批量创建技术能力
export async function batchCreateTechResearch(data) {
    return await publicService4.post('/api/tech/research/batchCreate', data);
}

// 创建技术能力
export async function createTechResearch(data) {
    return await publicService4.post('/api/tech/research/create', data);
}

// 删除技术能力
export async function deleteTechResearch(id) {
    return await publicService4.post(`/api/tech/research/delete/${id}`);
}

// 根据企业ID删除所有技术能力
export async function deleteTechResearchByCompanyId(companyId) {
    return await publicService4.post(`/api/tech/research/deleteByCompanyId/${companyId}`);
}

// 根据ID获取技术能力详情
export async function getTechResearch(id) {
    return await publicService4.get(`/api/tech/research/get/${id}`);
}

// 根据企业ID获取技术能力列表
export async function getTechResearchList(companyId) {
    return await publicService4.get(`/api/tech/research/listByCompanyId/${companyId}`);
}

// 分页查询技术能力
export async function pageTechResearch(data) {
    return await publicService4.get('/api/tech/research/page', data);
}

// 更新技术能力
export async function updateTechResearch(data) {
    return await publicService4.post('/api/tech/research/update', data);
}


// ==================== 申报情况管理 ====================

// 批量创建申报情况
export async function batchCreateDeclaration(data) {
    return await publicService4.post('/api/declarationSituation/batchCreate', data);
}

// 创建申报情况
export async function createDeclaration(data) {
    return await publicService4.post('/api/declarationSituation/create', data);
}

// 删除申报情况
export async function deleteDeclaration(id) {
    return await publicService4.post(`/api/declarationSituation/delete/${id}`);
}

// 根据企业ID删除所有申报情况
export async function deleteDeclarationByCompanyId(companyId) {
    return await publicService4.post(`/api/declarationSituation/deleteByCompanyId/${companyId}`);
}

// 根据ID获取申报情况详情
export async function getDeclaration(id) {
    return await publicService4.get(`/api/declarationSituation/get/${id}`);
}

// 根据企业ID获取申报情况列表
export async function getDeclarationList(companyId) {
    return await publicService4.get(`/api/declarationSituation/listByCompanyId/${companyId}`);
}

// 根据企业ID和申报级别获取申报情况列表
export async function getDeclarationListByLevel(params) {
    // params: { companyId, level }
    return await publicService4.get('/api/declarationSituation/listByCompanyIdAndLevel', params);
}

// 分页查询申报情况
export async function pageDeclaration(data) {
    return await publicService4.get('/api/declarationSituation/page', data);
}

// 按年份汇总申报情况
export async function summaryDeclarationByYear(params) {
    // params: { companyId, level }
    return await publicService4.get('/api/declarationSituation/summaryByYear', params);
}

// 获取企业某级别下所有申报年份
export async function getDeclarationYears(params) {
    // params: { companyId, level }
    return await publicService4.get('/api/declarationSituation/years', params);
}

// 更新申报情况
export async function updateDeclaration(data) {
    return await publicService4.post('/api/declarationSituation/update', data);
}


// ==================== 财务审计信息管理 ====================

// 批量创建财务审计信息
export async function batchCreateFinancialAudit(data) {
    return await publicService4.post('/api/financialAudit/batchCreate', data);
}

// 创建财务审计信息
export async function createFinancialAudit(data) {
    return await publicService4.post('/api/financialAudit/create', data);
}

// 删除财务审计信息
export async function deleteFinancialAudit(id) {
    return await publicService4.post(`/api/financialAudit/delete/${id}`);
}

// 根据企业ID删除所有财务审计信息
export async function deleteFinancialAuditByCompanyId(companyId) {
    return await publicService4.post(`/api/financialAudit/deleteByCompanyId/${companyId}`);
}

// 根据ID获取财务审计信息详情
export async function getFinancialAudit(id) {
    return await publicService4.get(`/api/financialAudit/get/${id}`);
}

// 根据企业ID和财务年份获取财务审计信息
export async function getFinancialAuditByYear(params) {
    // params: { companyId, financialYear }
    return await publicService4.get('/api/financialAudit/getByCompanyIdAndYear', params);
}

// 根据企业ID获取财务审计信息列表
export async function getFinancialAuditList(companyId) {
    return await publicService4.get(`/api/financialAudit/listByCompanyId/${companyId}`);
}

// 分页查询财务审计信息
export async function pageFinancialAudit(data) {
    return await publicService4.get('/api/financialAudit/page', data);
}

// 更新财务审计信息
export async function updateFinancialAudit(data) {
    return await publicService4.post('/api/financialAudit/update', data);
}