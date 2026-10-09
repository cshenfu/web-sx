import { publicService2 } from '@/api/base';

// ==============================layer=====================================

// 刷新图层目录
export async function reloadLayerList() {
    return await publicService2.post('/whln-gis-api/edit/catalog/reload');
}



// 列出图层
export async function showLayerList() {
    return await publicService2.get('/whln-gis-api/edit/layers');
}


// 获取图层元数据
export async function getLayerDataByLayerKey(layerKey) {
    return await publicService2.get(`/whln-gis-api/edit/layers/${layerKey}`);
}


// ==============================feature=====================================


// 获取图层元数据
export async function getFeatureById(layerKey,guid) {
    return await publicService2.get(`/whln-gis-api/edit/layers/${layerKey}/features/${guid}`);
}


// 更新要素
export async function updateFeatureById(layerKey,guid,data) {
    return await publicService2.put(`/whln-gis-api/edit/layers/${layerKey}/features/${guid}`,data);
}



// 新增要素
export async function addFeatureById(layerKey,data) {
    return await publicService2.post(`/whln-gis-api/edit/layers/${layerKey}/features`,data);
}


// 新增要素
export async function deletFeatureById(layerKey,data) {
    return await publicService2.del(`/whln-gis-api/edit/layers/${layerKey}/features`,data);
}




// 区域空间查询
export async function areaSelectByKey(layerKey,data) {
    return await publicService2.post(`/whln-gis-api/edit/layers/${layerKey}/features/query`,data);
}
