import { publicService3 } from '@/api/base';
// 第三步参数默认值获取
export async function getThreeStepParam(data) {
    return await publicService3.post('/web/pv/project/getThreeStepSunParam?projectId=' + data);
    // return await publicService3.get('/web/project/getThreeStepParam/' + data);
}
// 第三步动态参数默认值获取
export async function getThreeStepDynamicParam(projectType, projectId) {
    return await publicService3.get('/web/project/detail/step3-default-param_v2/' + projectId + '/' + projectType);
}
// 第三步用户调整值获取
export async function getUserThreeStepParam(data) {
    // return await publicService3.post('/web/project/getThreeStepParam', data);
    return await publicService3.get('/web/project/detail/step3-user-param/' + data);
}
// // 提交第三步参数表单数据
// export async function submitThreeStepParam(data) {
//     return await publicService3.post('/web/project/saveOrUpdateProject', data);
// }
// 提交手机号
export async function submitPhone(data) {
    return await publicService3.put('/web/pv/project/update/phone', data);
}
// 项目状态
export async function getProjectStatus(data) {
    return await publicService3.get(`/web/pv/project/status/${data}`);
}
// 提交版本信息
export async function submitVersion(data) {
    return await publicService3.post('/web/pv/project/updateProjectVersionById', data);
}