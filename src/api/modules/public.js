import { publicService } from '@/api/base';
//获取全国地址信息
export async function getProvince() {
    return await publicService.get('/admin-api/basic/area/all/area');
}
// 生成文档随机唯一标识
export function uniqueIdentification() {
    const str = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    return String.prototype.toLocaleUpperCase.call(str);
}
// 获取OBS临时token
export async function getObsToken() {
    return await publicService.get('/web/obs/temporary/token');
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
// 获取临时下载地址
export async function getTempDownloadUrl(data) {
    return await publicService.get(`/admin-api/basic/obs/get/temp-url?${data}`);
}