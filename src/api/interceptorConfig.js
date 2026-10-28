import { ElMessage } from 'element-plus'
import { refreshToken, isRefreshRequest } from './modules/refreshToken';
import router from '@/router/index.js';

// ─────────────────────────────────────────────
// 登录态处理工具
// ─────────────────────────────────────────────
let isRedirectingToLogin = false;

function isLoginApi(url = '') {
    return url.includes('/system/auth/login') || url.includes('/user/login');
}

function clearAuthStorage() {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('accessTokenExpiresAt');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('ossCredentials');
}

async function toLogin() {
    if (isRedirectingToLogin) return;
    const current = router.currentRoute.value;
    if (current.path === '/login') return;

    isRedirectingToLogin = true;
    clearAuthStorage();
    ElMessage.error('登录过期，请重新登录');   // ← 只在这里弹

    try {
        await router.replace({
            path: '/login',
            query: { redirect: current.fullPath },
        });
    } finally {
        isRedirectingToLogin = false;
    }
}

// ─────────────────────────────────────────────
// 请求拦截器
// ─────────────────────────────────────────────
export async function requestInterceptor(config) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = sessionStorage.getItem('accessToken') || '';

    if (config.data instanceof FormData) {
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

// ─────────────────────────────────────────────
// 响应拦截器（仅 HTTP 2xx 会进来）
// ─────────────────────────────────────────────
export async function responseInterceptor(response, val) {
    const config = response.config || {};
    const url = config.url || '';
    const code = Number(response.data?.code);

    // 登录接口本身不做刷新/跳转，交给 Login.vue 处理
    if (isLoginApi(url)) {
        return response.data;
    }

    // 业务码 401：先尝试刷新，失败再跳登录
   if (code === 401) {
    if (!isRefreshRequest(config)) {
        const isSuccess = await refreshToken();
        if (isSuccess) {
            config.headers['Authorization'] =
                sessionStorage.getItem('accessToken') || '';
            return val.request(config);
        }
    }
    await toLogin();
    return Promise.reject(new Error('Login Expired'));
}

    // 业务自定义错误码，原样返回，由业务处理
    if (
        code === 400 ||
        code === 100300002 ||
        code === 1002000002 ||
        code === 1002000001
    ) {
        return response.data;
    }

    if (!(code === 200 || code === 1 || code === 0)) {
        removeLoading();
        ElMessage.error(response.data.message || response.data.msg);
    }

    return response.data;
}

// 处理接口报错 loading 不消失
const removeLoading = () => {
    const loading = document.querySelector('#__LOADING_PARENT__');
    if (!loading) return;
    loading.remove();
};

// ─────────────────────────────────────────────
// 响应失败拦截器（HTTP 非 2xx 会进来）
// ─────────────────────────────────────────────
export function responseInterceptorRejected(err) {
    removeLoading();

    const status = err.response?.status;
    const url = err.response?.config?.url || err.config?.url || '';

    // HTTP 401 且不是登录接口，清登录态并跳登录
    if (status === 401 && !isLoginApi(url)) {
        toLogin();   // 不 await，避免阻塞 reject
    }

    return Promise.reject(err);
}