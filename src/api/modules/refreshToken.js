import { publicService } from '@/api/base';

let promise = null;

async function doRefresh() {
    try {
        const resp = await publicService.get(
            '/admin-api/system/auth/refresh-token',
            { refreshToken: sessionStorage.getItem('refreshToken') },
            { __isRefreshToken: true }
        );

        // 刷新接口返回非成功码，视为刷新失败
        if (!resp || resp.code !== 200 || !resp.data?.accessToken) {
            return false;
        }

        sessionStorage.setItem('accessToken', resp.data.accessToken);
        sessionStorage.setItem('refreshToken', resp.data.refreshToken || '');

        // 同步过期时间，避免路由守卫误判
        if (resp.data.expiresIn) {
            sessionStorage.setItem(
                'accessTokenExpiresAt',
                String(Date.now() + Number(resp.data.expiresIn) * 1000)
            );
        } else if (resp.data.expiresAt) {
            const ts = new Date(resp.data.expiresAt).getTime();
            if (Number.isFinite(ts)) {
                sessionStorage.setItem('accessTokenExpiresAt', String(ts));
            }
        }

        return true;
    } catch (e) {
        // 刷新接口 HTTP 401 / 网络异常，统一返回 false
        console.warn('refreshToken failed:', e);
        return false;
    }
}

export function refreshToken() {
    if (promise) return promise;

    promise = doRefresh().finally(() => {
        promise = null;
    });

    return promise;
}

export function isRefreshRequest(config) {
    return !!config?.__isRefreshToken;
}