

const requestConfig = {
    development: {
        publicServiceUrl: 'https://testmapi.wh-ge.com/',
        publicServiceUrl2: 'https://test.wh-ge.com/',
        publicServiceUrl3: 'https://testapi.wh-ge.com/',
        publicServiceUrl4: 'http://172.16.14.71:10100/',
        publicServiceUrl5: 'http://172.16.14.71:10000/',
        // publicServiceUrl: 'http://120.46.205.206:10004/',
    },
    test: {
        publicServiceUrl: 'https://testmapi.wh-ge.com/',
        publicServiceUrl2: 'https://test.wh-ge.com/',
        publicServiceUrl3: 'https://testapi.wh-ge.com/',
        publicServiceUrl4: 'http://172.16.14.71:10100/',
        publicServiceUrl5: 'http://172.16.14.71:10000/',
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
    const env = process.env.NODE_ENV;

    console.log('config.ts:28 ==> env-->', env);

    return requestConfig[env];
}
