import { publicService } from '@/api/base';
// 获取风电首页
export async function getSimpleCapacityList(userId) {
    return await publicService.get(`/web/project/home/page/${userId}`);
}
// 获取光伏首页
export async function getSimpleCapacityLightList(userId) {
    // return await publicService.get(`/web/project/home/page/${userId}`);
    return await publicService.get(`/web/pv/project/home/page/${userId}`);
}
// 获取首页项目列表是否发起调整检查操作
export async function getProjectListIsCheck(userId) {
    return await publicService.get(`/web/project/check/isMakeAdjust/${userId}`);
}