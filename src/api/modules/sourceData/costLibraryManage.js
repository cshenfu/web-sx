import { publicService } from '@/api/base';
// 新增造价基本数据
export async function addProjectCost (data) {
    return publicService.post('/admin-api/basic/projectCost/create',data)
}
// 更新造价数据列表
export async function updateProjectCost (data) {
    return publicService.put('/admin-api/basic/projectCost/update',data)
}
// 获取造价库列表
export async function getProjectCost (data) {
    return publicService.get('/admin-api/basic/projectCost/page',data)
}
// 获取造价库详情
export async function getProjectCostDetail (id) {
    return publicService.get('/admin-api/basic/projectCost/get/'+id)
}