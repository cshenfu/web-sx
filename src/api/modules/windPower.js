import {
    publicService
} from '@/api/base';
// 风电设备列表
export async function getwindPowerList(data) {
    return await publicService.get('/admin-api/basic/device/list/page', data);
}
// 风电设备详情
export async function getwindPowerDetail(id) {
    return await publicService.get(`/admin-api/basic/device/detail/${id}`);
}
// 删除风电设备
export async function delwindPower(id) {
    return await publicService.del(`/admin-api/basic/device/delete/${id}`);
}
// 导入风机设备
export async function importwindPower(data) {
    return await publicService.post(`/admin-api/basic/device/import`, data, {__isModifyHeader:true});
}
// 复制数据
export async function copyUserWindData(data){
    return await publicService.put('/admin-api/basic/device/copy', data);
}
// 创建风机
export async function createWindDevice(data) {
    return await publicService.post('/admin-api/basic/device/create',data)
}

// 更显设备
export async function updateWindDevice(data) {
    return publicService.put('/admin-api/basic/device/update',data)
}
// 导出wtg文件
export async function exportWtgFile(id) {
    return publicService.get(`/admin-api/basic/device/export-wtg/${id}`)
    
}