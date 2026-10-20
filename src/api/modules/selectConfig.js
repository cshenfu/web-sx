import { publicService4 } from '@/api/base';

//获取最新配置。
export async function getLastConfig() {
    return await publicService4.get('/api/siteSelectionConfig/getLastConfig');
}

//选址配置分页查询
export async function pageListConfig(data) {
    return await publicService4.get('/api/calculationTask/page',data);
}

//获取项目列表
export async function updateCalculateStatus(projectId,data) {
    const fd = new FormData()
    fd.append('isReturnProject', data.isReturnProject)
    return await publicService4.put(`/ai/api/aiProject/updateCalculateStatus/${projectId}`,fd);
}



//更新.
export async function updateConfig(data) {
    return await publicService4.put('/api/siteSelectionConfig/update', data);
}


//取消计算任务
export async function cancelTask(taskId) {
    return await publicService4.post(`/api/calculationTask/cancel/${taskId}`);
}

//省市容量下钻统计。
export async function provinceViewData(data) {
    return await publicService4.post('/ai/api/aiProject/statistics/province-view', data);
}

//多维概览统计 (区域+阶段+项目类型)。
export async function overViewData(data) {
    return await publicService4.post('/ai/api/aiProject/statistics/overview', data);
}


//更新场区范围，风机升压站。
export async function upDataLayer(taskId,data) {
    return await publicService4.put(`/ai/api/aiProject/updateCoordinate/${taskId}`,data);
}


//更新核查信息
export async function updateInfo(data) {
    return await publicService4.put(`/ai/api/aiProject/update-verify-info`,data);
}


//开始计算
export async function calculationTask(code) {
    return await publicService4.post(`/api/calculationTask/create?calculationAreaCode=${code}`);
}