import { publicService } from '@/api/base';
// 太阳能资源列表
export async function getSolarEnergyList(data) {
    return await publicService.get(`/admin-api/basic/solarEnergy/page`,data);
}
// 新增太阳能资源
export async function addSolarEnergy(data) {
    return await publicService.post(`/admin-api/basic/solarEnergy/create`,data);
}
// 获取太阳能资源详情
export async function getSolarEnergyDetail(id) {
    return await publicService.get(`/admin-api/basic/solarEnergy/get/${id}`);
}
// 更新太阳能资源
export async function updateSolarEnergy(data) {
    return await publicService.put(`/admin-api/basic/solarEnergy/update`,data);
}
// 删除太阳能资源
export async function deleteSolarEnergy(id) {
    return await publicService.del(`/admin-api/basic/solarEnergy/delete/${id}`);
}