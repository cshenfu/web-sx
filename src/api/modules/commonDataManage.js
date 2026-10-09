import { publicService } from '@/api/base';
// 测风塔数据列表
export async function getWindTowerList(data) {
    return await publicService.get('/admin-api/wind/wind-tower/page', data);
}
// 新增测风塔数据
export async function addWindTower(data) {
    return await publicService.post('/admin-api/wind/wind-tower/create', data,{__isModifyHeader:true});
}
// 删除测风塔数据
export async function deleteWindTower(id) {
    return await publicService.del(`/admin-api/wind/wind-tower/delete/${id}`);
}
// 核对测风塔数据详情
export async function checkWindTowerDetail(id) {
    return await publicService.get(`/admin-api/wind/wind-tower/collate-detail/${id}`);
}
//核对确认
export async function submitCheckWindTower(data) {
    return await publicService.put('/admin-api/wind/wind-tower/update', data);
}
// 测风塔详情
export async function getWindTowerDetail(id) {
    return await publicService.get(`/admin-api/wind/wind-tower/detail/${id}`);
}
// 电网现状列表
export async function getGridList(data) {
    return await publicService.post('/admin-api/basic/power-grid-current/page', data);
}
// 新增电网现状
export async function addGrid(data) {
    return await publicService.post('/admin-api/basic/power-grid-current/saveCurrentGrid', data);
}
// 新增电网现状-校验拐点坐标
export async function checkPointsExcel(data) {
    return await publicService.post('/admin-api/basic/geology/checkPointsExcel', data, {__isModifyHeader:true});
}
// 禁用电网
export async function disableGrid(data) {
    return await publicService.post(`/admin-api/basic/power-grid-current/updateGridStatus`,data);
}
// 电网详情
export async function getGridDetail(id) {
    return await publicService.get(`/admin-api/basic/power-grid-current/info/${id}`);
}

// 更新电网现状
export async function updateGrid(data) {
    return await publicService.post('/admin-api/basic/power-grid-current/updateCurrentGrid', data);
}
// 导入气候数据
export async function importClimateData(data) {
    return await publicService.post('/climate/temperature/import', data, {__isModifyHeader:true});
}
// 光伏逆变器列表
export async function getInverterList(data) {
    return await publicService.post('/admin-api/basic/pv/inverterDevice/list/page', data);
}
// 光伏逆变器详情
export async function getInverterDetail(id) {
    return await publicService.get(`/admin-api/basic/pv/inverterDevice/get/${id}`);
}
// 光伏逆变器删除
export async function deleteInverter(id) {
    return await publicService.get(`/admin-api/basic/pv/inverterDevice/delete/${id}`);
}
// 光伏逆变器导入
export async function importInverter(data) {
    return await publicService.post('/admin-api/basic/pv/inverterDevice/import', data, {__isModifyHeader:true});
}
// 光伏组件列表
export async function getPvComponentList(data) {    
    return await publicService.post('/admin-api/basic/pv/moduleDevice/list/page', data);
}
// 光伏组件详情
export async function getPvComponentDetail(id) {
    return await publicService.get(`/admin-api/basic/pv/moduleDevice/get/${id}`);
}
// 光伏组件删除
export async function deletePvComponent(id) {
    return await publicService.del(`/admin-api/basic/pv/moduleDevice/delete/${id}`)
}
// 光伏组件查询条件字典
export async function getPvComponentCondition() {
    return await publicService.get('/admin-api/basic/pv/moduleDevice/getCondition');
}
// 光伏组件导入
export async function importModuleDevice(data){
    return await publicService.post('/admin-api/basic/pv/moduleDevice/import',data,{__isModifyHeader:true});
}
// 光伏组件上传图图片
export async function uploadPvComponentImg(data) {
    return await publicService.post('/admin-api/basic/pv/moduleDevice/updatePicUrl', data);
}
// 查询条件字典
export async function getDictionaryList() {
    return await publicService.get('/admin-api/basic/pv/inverterDevice/getCondition');
}