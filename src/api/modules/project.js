import { publicService4,publicService5 } from '@/api/base';

// ==============================layer=====================================

// 创建项目
export async function createProject(data) {
    return await publicService4.post('/ai/api/aiProject/create',data);
}


// 获取项目列表
export async function getPageList(data) {
    return await publicService4.post(`/ai/api/aiProject/page`,data);
}


// // 删除项目列表
// export async function getPageList(data) {
//     return await publicService4.post(`/ai/api/aiProject/page`,data);
// }
// 获取项目阶段列表
export async function getStageList() {
    return await publicService4.get('/ai/api/aiProject/stage-list');
}




// 生成保存风电项目
export async function saveUpdateProject(data) {
    return await publicService5.post(`/web/shanxi/project/save_update_project`,data);
}

