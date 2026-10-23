

const requestConfig = {
    development: {
        publicServiceUrl: 'https://testmapi.wh-ge.com/',
        publicServiceUrl2: 'https://test.wh-ge.com/',
        publicServiceUrl3: 'https://testapi.wh-ge.com/',
        publicServiceUrl4: 'http://172.16.14.71:10100/',
        publicServiceUrl5: 'http://172.16.14.71:10000/',
        publicServiceUrl6: 'http://172.16.14.71:9996//',
        // publicServiceUrl: 'http://120.46.205.206:10004/',
    },
    test: {
        publicServiceUrl: 'https://testmapi.wh-ge.com/',
        publicServiceUrl2: 'https://test.wh-ge.com/',
        publicServiceUrl3: 'https://testapi.wh-ge.com/',
        publicServiceUrl4: 'http://172.16.14.71:10100/',
        publicServiceUrl5: 'http://172.16.14.71:10000/',
        publicServiceUrl6: 'http://172.16.14.71:9996//',
    },
    production: {
        publicServiceUrl: 'https://mapi.wh-ge.com/',
        publicServiceUrl3: 'https://api.wh-ge.com/',
    },
    'k8s-test': {
        publicServiceUrl: 'https://devk8sapi.enableai.cn',
    },
};

export function getEnvUrl() {
    // 1. 读取环境，如果拿不到就默认 'development'
    const env = process.env.NODE_ENV || 'development';
    console.log('config.ts:28 ==> env-->', env);

    // 2. 如果匹配不到，强制返回 development 的配置，防止报错白屏
    return requestConfig[env] || requestConfig['development'];
}