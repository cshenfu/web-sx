import { publicService } from '@/api/base';
// 根据用户信息查询服务是否生效
export async function checkPackageEffective(data) {
    return await publicService.post('/web/package/checkPackageEffectiveByUserId', data);
}
// 套餐详情
export async function getPackageDetailInfo(data) {
    return await publicService.post('/web/package/getCompanyPackage', data);
}
// 套餐明细分页列表
export async function getPackageDetail(data) {
    return await publicService.post('/web/package/getCompanyPackageDetail', data);
}
// 套餐订单分页列表
export async function getPackageOrder(data) {
    return await publicService.post('/web/package/getCompanyPackageOrder', data);
}
// 查询用户所有的套餐
export async function getAllPackage() {
    return await publicService.get('/web/package/queryPackageTypeByUserId');
}