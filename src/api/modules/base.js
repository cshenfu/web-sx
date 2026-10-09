
import { publicService } from '@/api/base';
// 获取全国地址信息
export async function getProvince() {
    return await publicService.get('/web/area/totalArea');
}
// 获取OBS临时token
export async function getObsToken() {
    return await publicService.get('/web/obs/temporary/token');
}
// 查询用户客户经理
export async function getCustomer() {
    return await publicService.get('/web/company/customer/manager');
}
// 生成objectKey
export async function createObjectKey(data) {
    return await publicService.get('/web/obs/gen/object-key',data);
}
// 通过objectKey生成临时上传地址
export async function getTempUrl(data) {
    return await publicService.post('/web/obs/create/temp-url', data);
}
// 获取临时obs token凭证
export async function getCertificate(data) {
    return await publicService.get('/admin-api/basic/obs/get/temp-certificate',data);
}
// 加密狗验证签名
export async function verifySign(data) {
    return await publicService.post('/web/user/verify-sign',data);
}
// 大地坐标转换成十进制经纬度
export async function coverPoints(data) {
    return await publicService.post('/web/project/coverPoints',data);
}
// 通过objectKey获取临时访问地址
export async function getTempUrlByObjectKey(data) {
    return await publicService.get('/web/obs/get/temp-url',data);
}
// 字典接口
export async function getDictionary(data) {
    return await publicService.get('/web/dict/getDictValueByDictType',data);
}
// 校验气候文件
export async function checkClimateFile(data) {
    return await publicService.post('/web/project/file/check-weather', data);
}
// 获取暂停运行服务周期
export async function getPauseRunCycle() {
    return await publicService.get('/web/tool/getStopErp');
}
