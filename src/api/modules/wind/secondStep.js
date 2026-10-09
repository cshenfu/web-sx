import { publicService3 } from '@/api/base';
// 校验测风塔文件数据
export async function checkWindTowerFileData(data) {
    return await publicService3.post('/web/project/checkWindFileData', data,{__isModifyHeader:true});
}
// 校验测风塔csv文件格式数据
export async function checkWindTowerFileCsvData(data) {
    return await publicService3.post('/web/project/checkWindCsvFileData', data,{__isModifyHeader:true});
}
// 校验中尺度文件数据
export async function checkWindMesoscaleFileData(data) {
    return await publicService3.post('/web/check/checkMesoscaleFileData', data,{__isModifyHeader:true});
}
// 校验中尺度、测风塔与场区的关系
export async function checkMesoscaleAndWindTowerAndRegion(data) {
    return await publicService3.post('/web/check/mesoscale-region-tower-data', data);
}
// 校验半径
export async function checkRadius(data) {
    return await publicService3.post('/web/project/checkRadius', data);
}
// 校验气候文件
export async function checkClimateFile(data) {
    return await publicService3.post('/web/project/file/check-weather', data);
}
// 校验开关站和接入站和风机点位的直线距离接口
export async function checkAccessAndBooster(data) {
    return await publicService3.post('/web/project/checkStepTwo', data);
}
// 提交地形图解析后的数据接口
export async function postTerrainData(data) {
    return await publicService3.post('/web/project/topographicShpData/updateOrSave', data);
}
// 获取地形图解析后的数据接口
export async function getTerrainData(data) {
    return await publicService3.get('/web/project/topographicShpData/queryShpDataByProjectId', data);
}