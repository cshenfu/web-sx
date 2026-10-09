import axios from 'axios';

import {
    requestInterceptor,
    responseInterceptor,
    responseInterceptorRejected,
} from './interceptorConfig';

//--todo为测试临时加的代码
//const token=window.localStorage['token'];

export class ServiceModule {
    constructor(url) {
        const axiosInstance = axios.create({
            timeout: 1000 * 60 * 20,
            baseURL: url,
            headers: {
                'Content-Type': 'application/json;charset=utf8',
            },
        });
        axiosInstance.interceptors.request.use(requestInterceptor);

        axiosInstance.interceptors.response.use((e)=>responseInterceptor(e,axiosInstance), (e)=>responseInterceptorRejected(e,axiosInstance));

        this.#_Service = axiosInstance;
    }

    #_Service;

    get Service() {
        return this.#_Service;
    }

    set Service(value) {
        this.#_Service = value;
    }

    get(url, data, config) {
        //--todo为测试临时加的代码
/*        let headers={
            satoken: token,
        }
        console.log(headers);*/
        return this.#_Service.request({
            url,
            method: 'get',
            params: data,
            //headers,
            ...config,
        });
    }

    post(url, data, config) {
        let headers = {};
        return this.#_Service.request({
            url,
            data,
            method: 'post',
            headers,
            ...config,
        });
    }

    put(url, data, config) {
        let headers = {};

        return this.#_Service.request({
            url,
            data,
            method: 'put',
            headers,
            ...config,
        });
    }

    del(url, data, config) {
        let headers = {};

        return this.#_Service.request({
            url,
            data,
            method: 'delete',
            headers,
            ...config,
        });
    }

    patch(url, data, config) {
        let headers = {};

        return this.#_Service.request({
            url,
            data,
            method: 'patch',
            headers,
            ...config,
        });
    }
}
