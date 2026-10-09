import { ElMessage } from 'element-plus'
import { requestConfig } from './base';
import { refreshToken, isRefreshRequest } from './modules/refreshToken';
import router from '@/router/index.js';
// import { logger } from '@/utils/logger/logger';
// import { userStore } from '@/utils/store/module/userStore';

export async function requestInterceptor(config) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = sessionStorage.getItem('accessToken') || '';

    if (config.data instanceof FormData) {
        // 清除所有层级的 Content-Type，让浏览器自动添加带 boundary 的值
        delete config.headers['Content-Type'];
        delete config.headers['content-type'];
        if (config.headers.common) delete config.headers.common['Content-Type'];
        if (config.headers.post)   delete config.headers.post['Content-Type'];
    } else {
        config.headers['Content-Type'] = config.__isModifyHeader
            ? 'multipart/form-data'
            : 'application/json';
    }

    return config;
}
export async function responseInterceptor(response, val) {
    const url = response.config.baseURL + response.config.url;
    if (response.status === 200) {
        if (response.data.code === 401 && !isRefreshRequest(response.config)) {
            const isSuccess = await refreshToken();
            if (isSuccess) {
                
                response.config.headers['Authorization'] =
                    sessionStorage.getItem('accessToken') || '';
                const resp = val.request(response.config);
                return resp;
            } else {
                removeLoading();
                // console.log('没有登录，跳转到登录页');
                // 确实是没有登录
                router.push('/login');
            }
            return false;
        }
        if(response.data.code === 400 || response.data.code === 100300002 || response.data.code === 1002000002 || response.data.code === 1002000001 ) {
            return response.data;
        }
        if (!(response.data.code === 200 || response.data.code === 1 || response.data.code === 0)) {
            removeLoading();
            ElMessage.error(response.data.message || response.data.msg)
        }
        if (response.data.code == 401) {
            removeLoading();
            ElMessage.error('登录过期，请重新登录');
            setTimeout(() => {
                window.close();
            }, 2000);
        }
        return response.data;
    } else {
        removeLoading();
        if (response.status === 500) {
            ElMessage.error('服务异常');
        }
        if (response.status === 401) {
            return Promise.reject(new Error('Login Invalid'));
        } else {
            return Promise.reject(new Error('Network Error'));
        }
    }
}

// 处理接口报错loading效果不消失情况
const removeLoading = () => {
    const loading = document.querySelector('#__LOADING_PARENT__');
    if (!loading) return;
    loading.remove()
}

export function responseInterceptorRejected(err) {
    removeLoading();
    console.log('请求错误', err.config.__isRefreshToken);
    return Promise.reject(err);
}
