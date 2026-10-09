
import { publicService } from '@/api/base';
import { walk } from 'vue/compiler-sfc';
// 雷暴列表
export const getThunderstormList = async(params) => {
    return await publicService.get('/admin-api/basic/climate/thunderstorm/page', params);
}
// 雷暴详情
export const  getThunderstormDetail = async(id) => {
    return await publicService.get(`/admin-api/basic/climate/thunderstorm/get/${id}`);
}
// 新增雷暴
export async function addThunderstorm(data) {
    return await publicService.post('/admin-api/basic/climate/thunderstorm/create', data);
}
// 雷暴删除
export const  deleteThunderstorm = async(id) => {
    return await publicService.del(`/admin-api/basic/climate/thunderstorm/delete/${id}`)
}
// 更新雷暴
export async function updateThunderstorm(data) { 
    return await publicService.put('/admin-api/basic/climate/thunderstorm/update', data);
}
// 酸雨列表
export const getDryRainList = async(params) => {
    return await publicService.get('/admin-api/basic/climate/acid-rain/page', params);
}
// 酸雨详情
export const  getDryRainDetail = async(id) => {
    return await publicService.get(`/admin-api/basic/climate/acid-rain/get/${id}`);
}
// 酸雨新增
export const addDryRain = async(data) => {
    return await publicService.post('/admin-api/basic/climate/acid-rain/create', data);
}
// 酸雨更新
export const updateDryRain = async(data) => {
    return await publicService.put('/admin-api/basic/climate/acid-rain/update', data);
}
// 酸雨删除
export const deleteDryRain = async(id) => {
    return await publicService.del(`/admin-api/basic/climate/acid-rain/delete/${id}`)
}
// 酸雨批量导入
export const batchImportDryRain = async(id)=> {
    return await publicService.post('/basic/climate/acid-rain/import',data,{__isModifyHeader:true})
}
// 温度列表
export const getTemperatureList = async(params) => {
    return await publicService.get('/admin-api/basic/climate/temperature/page', params);
}
// 温度详情
export const getTemperatureDetail = async(id) => { 
    return await publicService.get(`/admin-api/basic/climate/temperature/get/${id}`);
}
// 温度新增
export const addTemperature = async(data) => {
    return await publicService.post('/admin-api/basic/climate/temperature/create', data);
}
// 温度删除
export const deleteTemperature = async(id) => {
    return await publicService.del(`/admin-api/basic/climate/temperature/delete/${id}`)
}
// 温度更新
export const updateTemperature = async(data) => {
    return await publicService.put('/admin-api/basic/climate/temperature/update', data);
}
// 温度批量导入
export const batchImportTemperature = async(data) => {
    return await publicService.post('/admin-api/basic/climate/temperature/importTemperature', data,{__isModifyHeader:true});
}
// 风压列表
export const getWindPressureList = async(params) => {
    return await publicService.get('/admin-api/basic/climate/wind-pressure/page', params);
}
// 新增风压
export async function addWindPressure(data) {
    return await publicService.post('/admin-api/basic/climate/wind-pressure/create', data);
}
// 风压更新
export async function updateWindPressure(data) {
    return await publicService.put('/admin-api/basic/climate/wind-pressure/update', data);
}
//  风压详情
export const getWindPressureDetail = async(id) => {
    return await publicService.get(`/admin-api/basic/climate/wind-pressure/get/${id}`);
}
// 风压删除
export const deleteWindPressure = async(id) => {
    return await publicService.del(`/admin-api/basic/climate/wind-pressure/delete/${id}`)
}
// 当前城市级别是否包含数据
export async function isHaveDataByAreaBizStatus(data) {
    return await publicService.get('/admin-api/basic/area/biz/status', data);
}
// 雪压列表
export const getSnowPressureList = async(params) => {
    return await publicService.get('/admin-api/basic/climate/snow-pressure/page', params);
}
// 新增雪压
export const addSnow = async (params) => {
    return await publicService.post('/admin-api/basic/climate/snow-pressure/create', params);
}
// 更新雪压
export const updateSnow = async(data) => {
    return await publicService.put('/admin-api/basic/climate/snow-pressure/update',data)
}
// 雪压详情
export const getSnowDetail = async(id)=>{
    return await publicService.get(`/admin-api/basic/climate/snow-pressure/get/${id}`);
}
// 删除雪压
export const deleteSnowPressure = async(id) => {
    return await publicService.del(`/admin-api/basic/climate/snow-pressure/delete/${id}`)
}
// 批量导入雪压
export const batchImportSnow = async(data) => {
    return await publicService.post('/admin-api/basic/climate/snow-pressure/temperature/import', data,{__isModifyHeader:true});
}
// 降水列表
export const getRainFallList = async(params) => {
    return await publicService.get('/admin-api/basic/climateRainfall/page', params);
}
// 新增降水
export const addRainFall = async(data) => {
    return await publicService.post('/admin-api/basic/climateRainfall/create', data);
}
// 更新降水量
export const updateRainFall = async(data) => {
    return await publicService.put('/admin-api/basic/climateRainfall/update',data)
}
// 降水详情
export const getRainFallDetail = async(id) => {
    return await publicService.get(`/admin-api/basic/climateRainfall/get/${id}`);
}
// 删除降水量
export const deleteRainFall = async(id) => {
    return await publicService.del(`/admin-api/basic/climateRainfall/delete/${id}`)
}
// 批量导入降水量
export const batchImportRainFall = async(data) => {
    return await publicService.post('/admin-api/basic/climateRainfall/temperature/import', data,{__isModifyHeader:true});
}
// 沙尘暴列表
export const getDustStormList = async(params) => {
    return await publicService.get('/admin-api/basic/climateSandStorm/page', params);
}
// 新增沙尘暴
export const addDustStorm = async(data) => {
    return await publicService.post('/admin-api/basic/climateSandStorm/create', data);
}
// 更新沙尘暴
export const updateDustStorm = async(data) => {
    return await publicService.put('/admin-api/basic/climateSandStorm/update',data)
}
// 沙尘暴详情
export const getDustDetail = async(id) => {
    return await publicService.get(`/admin-api/basic/climateSandStorm/get/${id}`)
}
// 删除沙尘暴
export const deleteDustStorm = async(id) => {
    return await publicService.del(`/admin-api/basic/climateSandStorm/delete/${id}`)
}
// 批量导入沙尘暴
export const batchImportDustStorm = async(data) => {
    return await publicService.post('/admin-api/basic/climateSandStorm/temperature/import', data,{__isModifyHeader:true});
}
// 风速度
export const getWindSpeedList = async(params) => {
    return await publicService.get('/admin-api/basic/climateWindSpeed/page', params);
}
// 新增风速度
export const addWindSpeed = async(data) => {
    return await publicService.post('/admin-api/basic/climateWindSpeed/create', data);
}
// 更新风速度
export const updateWindSpeed = async(data) => {
    return await publicService.put('/admin-api/basic/climateWindSpeed/update',data)
}
// 风速度详情
export const getWindSpeedDetail = async(id) => {
    return await publicService.get(`/admin-api/basic/climateWindSpeed/get/${id}`)
}
// 删除风速度
export const deleteWindSpeed = async(id)=> {
    return await publicService.del(`/admin-api/basic/climateWindSpeed/delete/${id}`)
}
// 批量导入风速度
export const batchImportWindSpeed = async(data) => {
    return await publicService.post('/admin-api/basic/climateWindSpeed/temperature/import', data,{__isModifyHeader:true})
}
// 冰雹列表
export const getHailList = async(params) => {
    return await publicService.get('/admin-api/basic/climateFog/page', params);
}
// 新增冰雹
export const addHail = async(data) => {
    return await publicService.post('/admin-api/basic/climateFog/create', data);
}
// 更新冰雹
export const updateHail = async(data) => {
    return await publicService.put('/admin-api/basic/climateFog/update',data)
}
// 冰雹详情
export const getHailDetail = async(id) => {
    return await publicService.get(`/admin-api/basic/climateFog/get/${id}`)
}
// 删除冰雹
export const deleteHail = async(id) => {
    return await publicService.del(`/admin-api/basic/climateFog/delete/${id}`)
}
// 批量导入冰雹
export const batchImportHail = async(data) => {
    return await publicService.post('/admin-api/basic/climateFog/import', data,{__isModifyHeader:true});
}