import { publicService3 } from '@/api/base';
// 生成文档随机唯一标识
export function uniqueIdentification() {
    const str = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    return String.prototype.toLocaleUpperCase.call(str);
}
// 检测场区坐标文件格式是否合格
export async function checkAreaPointData(data) {
    return await publicService3.post('/web/project/importPointsExcel', data, {__isModifyHeader:true});
}
// 检测风机坐标是否在场区范围内(formdata格式文件需要更改header请求头)
export async function checkPointInArea(data) {
    return await publicService3.post('/web/project/importDevicePointsExcel', data, {__isModifyHeader:true});
}
// 保存更新表单数据
export async function saveFormData(data) {
    return await publicService3.post('/web/pv/project/proposal/saveProjectProposal', data);

}
// 项目调整保存或更新
export async function updateFormData(data) {
    // return await publicService3.post('/web/project/proposal/update', data);
    return await publicService3.post('/web/pv/project/proposal/updateProposalProject', data);
}
// 根据项目ID进行项目回显
 export async function selectProjectInfoById(data) {
    // return await publicService3.post('/web/project/selectProjectInfoById', data);
    return await publicService3.post('/web/pv/project/selectSunProjectById?projectId=' + data);
}
// 获取第二步默认参数
export async function getStepParam(data) {
    return await publicService3.post('/web/pv/project/proposal/getTwoStepDefaultPvProposalParam?projectId=' + data);
}