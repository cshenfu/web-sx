import { publicService4 } from '@/api/base';



// 添加条目（文件-外部库引用）


export async function addItem(data) {
    return await publicService4.post('/ai/api/aiProjectGeologyInfo/addItem', data);
}


// 为已有测风塔文件追加图片

export async function addItemImg(data) {
    return await publicService4.post('/ai/api/aiProjectGeologyInfo/addTowerImages', data); 
}



// 删除条目

export async function delItem(id) {
    return await publicService4.del(`/ai/api/aiProjectGeologyInfo/delete?id=${id}`); 
}



// 查询文件类型标签列表(5个固定标签)

export async function getTagList(dataCategory) {
    return await publicService4.get(`/ai/api/aiProjectGeologyInfo/listFileTypeTags?dataCategory=${dataCategory}`); 
}


// 按项目查询全部板块

export async function getDataById(aiProjectId) {
    return await publicService4.get(`/ai/api/aiProjectGeologyInfo/listGroupedByProject?aiProjectId=${aiProjectId}`); 
}



// 触发解析

export async function startParse(id) {
    return await publicService4.post(`/ai/api/aiProjectGeologyInfo/startParse?id=${id}`); 
}


// 根据条目ID更新文件存储路径

export async function updateFilePath(id,filePath) {
    return await publicService4.post(`/ai/api/aiProjectGeologyInfo/startParse?id=${id}&filePath=${filePath}`); 
}