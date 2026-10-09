import { publicService } from '@/api/base';
import { DataArrival } from '@icon-park/vue-next';
// 登录系统
export async function login(data) {
    return await publicService.post('/admin-api/system/auth/login', data);
}
// 登出系统
export async function logout() {
    return await publicService.get('/web/user/logout');
}
// 个人用户扫码登录
export async function personalLogin(data) {
    return await publicService.get('/web/user/user_personal_login', data);
}
// 个人用户，查询当前手机号是否已经被注册过
export async function checkPersonalPhone(data) {
    return await publicService.get('/web/user/company/checkPhone', data);
}
// 个人用户，发送绑定手机号短信验证码
export async function sendPersonalPhoneCode(data) {
    return await publicService.get('/web/user/send_verify_code_to_register', data);
}
// 个人用户，校验验证码与绑定手机号并注册登录
export async function registerPersonalPhone(data) {
    return await publicService.post('/web/user/verify_code_2_register_user', data);
}
// 获取微信授权标识
export async function getWxAuthCode(data) {
    return await publicService.get('/web/user/user_wechat_auth', data);
}