import {
    publicService
} from '@/api/base';
// 地质数据列表
export async function getGeologyList(data) {
    return await publicService.post('/admin-api/basic/geology/page', data);
}
// 地质数据详情(new)
export async function getGeologyDetail(data) {
    return await publicService.get('/admin-api/basic/geology/info/' + data);
}
// 新增地质数据
export async function createGeology(data) {
    return await publicService.post('/admin-api/basic/geology/saveGeology', data);
}
// 新增地质文件数据
export async function submitFileGeology(data) {
    return await publicService.post('/admin-api/basic/geology/saveGeologyFile', data);
}
// 更新地质数据
export async function updateGeology(data) {
    return await publicService.post('/admin-api/basic/geology/updateGeology', data);
}
// 当前城市级别是否包含数据 (废弃)
// export async function isHaveDataByAreaLevel(data) {
//     return await publicService.get('/admin-api/basic/geology/isHaveDataByAreaLevel', data);
// }
// 删除地质数据
export async function deleteGeology(data) {
    return await publicService.get('/admin-api/basic/geology/deleteGeology', data);
}
// 更新地质现状态
export async function updateGeologyDisable(data) {
    return await publicService.post('/admin-api/basic/geology/updateGeologyDisable', data);
}
// 更新地质数据单状态
export async function updateGeologyStatus(data) {
    return await publicService.post('/admin-api/basic/geology/update/geology/status', data);
}
// 用户地质数据发送计算
export async function calculateGeologyStatus(data) {
    return await publicService.get('/admin-api/basic/geology/geologyCalculationOperation', data);
}
// 修改地勘地形数据引用状态
export async function updateGeologyCite(data) {
    return await publicService.post('/admin-api/basic/geology/updateGeologyCite', data);
}
// 复制地质数据（公共）
export async function copyGeologyData(data) {
    return await publicService.post('/admin-api/basic/geology/copyGeology', data);
}