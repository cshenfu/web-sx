import { getEnvUrl } from './config';
import { ServiceModule } from './ServiceModel';
import { assign } from 'lodash';

export let requestConfig = {
    token: '',
    role: '',
    taskId: '',
};

export function setToken(token) {
    requestConfig.token = token;
}

export function setReqConfig(config) {
    requestConfig = assign(requestConfig, config);
}

const envUrl = getEnvUrl();
console.log('base.ts:22 ==> envUrl-->', envUrl);

/**
 * 公共服务
 */
 export const publicService = new ServiceModule(envUrl.publicServiceUrl);
 export const publicService2 = new ServiceModule(envUrl.publicServiceUrl2);
 export const publicService3 = new ServiceModule(envUrl.publicServiceUrl3);
 export const publicService4 = new ServiceModule(envUrl.publicServiceUrl4);
 export const publicService5 = new ServiceModule(envUrl.publicServiceUrl5);
 export const publicService6 = new ServiceModule(envUrl.publicServiceUrl6);

export const get = publicService.get.bind(publicService);

export const post = publicService.post.bind(publicService);

export const put = publicService.put.bind(publicService);

export const del = publicService.del.bind(publicService);
