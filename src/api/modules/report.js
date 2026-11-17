import { publicService4,publicService5 } from '@/api/base';

// ==============================layer=====================================

// 请示文件
export async function createQXReport(data) {
    return await publicService4.post('/ai/sx-report/request-document/params',data);
}


// 立项申请报告
export async function createLXReport(data) {
    return await publicService4.post('/ai/sx-report/initiation/params',data);
}

// 投审会
export async function createTSHReport(data) {
    return await publicService4.post('/ai/sx-report/meeting-notice/params',data);
}


// 承诺书
export async function createCNSReport(data) {
    return await publicService4.post('/api/commitment/report/calc',data);
}


// 投资决策
export async function createTZJCReport(data) {
    return await publicService4.post('/api/investDecision/report/calc',data);
}



// 竞配文件
export async function createJPReport(data) {
    return await publicService4.post('/api/competAllocat/report/calc',data);
}



// 创建智能评审报告关联
export async function createZNPSReport(data) {
    return await publicService4.post('/api/reviewRelation/create',data);
}

// 删除智能评审报告关联
export async function deleteZNPSReport(id) {
    return await publicService4.post(`/api/reviewRelation/delete/${id}`);
}


// 根据智能评审ID获取智能评审报告关联详情
export async function getZNPSReport(id) {
    return await publicService4.get(`/api/reviewRelation/get/${id}`);
}

// 分页查询智能评审报告
export async function getZNPSPage(data) {
    return await publicService4.post('/api/reviewRelation/page',data);
}


// 分页查询智能评审报告
export async function getCompanyData(id) {
    return await publicService4.post(`/api/shanxi/report/enterprise-info/calc?enterpriseId=${id}`);
}


// 项目评审参数获取
export async function getZNPSReportData(data) {
    return await publicService4.get(`/api/reviewRelation/get/${id}`);
}