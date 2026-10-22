
import { publicService } from '@/api/base';
// 获取项目列表
export async function getProjectList(data) {
    return await publicService.post('/web/project/list/page', data);
}
// 获取项目列表（光伏）
export async function getLightProjectList(data) {
    return await publicService.post('/web/pv/project/list/page', data);
}
// 获取历史版本列表
export async function getHistoryList(data) {
    return await publicService.post('/web/project/history/page', data);
}
// 一键优化
export async function optimize(data) {
    return await publicService.post('/web/project/update/yield-rate', data);
}
// 删除项目
export async function detaleProject (data) {
    return await publicService.del(`/web/project/delete/${data}`);
} 
// 删除项目（光伏）
export async function detaleLightProject (data) {
    return await publicService.del(`/web/pv/project/deleteByProjectId/${data}`);
}
// 获取一键优化项目参数
export async function getYieldByProjectId(data) {
    return await publicService.get(`/web/project/optimize/getYieldByProjectId/`, data);
}
// 保存一键优化项目参数
export async function saveYieldByProjectId(data) {
    return await publicService.post('/web/project/optimize/one_click_optimization_save', data);
}
// 获取数据统计
export async function getDataStatistics(data) {
    return await publicService.get(`/web/project/count/${data}`);
}
// 获取数据统计(光伏)
export async function getDataLightStatistics(data) {
    // return await publicService.get(`/web/pv/project/count/${data}`);
    return await publicService.get(`/web/pv/project/count`);
}
// 校验调整项目是否需要扣减套餐次数(适用于风电可研和项目建议书)
export async function checkAdjustProjectIsDeductTimes(projectId) {
    return await publicService.get(`/web/project/queryIsDeductTimesByAdjustProjectId?projectId=${projectId}`);
}
// 校验调整项目是否需要扣减套餐次数(适用于自动布机)
export async function checkAdjustProjectIsDeductTimesByAuto(data) {
    return await publicService.post(`/web/project/auto/checkTriggerDeductionAutoProject`, data);
}