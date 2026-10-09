
import { publicService } from '@/api/base';
let promise;
export  async function refreshToken (){
    if(promise) {
        return promise
    }
    promise = new Promise(async(resolve)=> {
        // console.log('刷新token')
        const resp =  await publicService.get('/admin-api/system/auth/refresh-token', {
            refreshToken: sessionStorage.getItem('refreshToken'),
        },{__isRefreshToken:true});
        console.log('刷新token',resp);
        
        sessionStorage.setItem('accessToken',resp.data?.accessToken)
        sessionStorage.setItem('refreshToken',resp.data?.refreshToken)
        resolve(resp.code==200)
    })
    promise.finally(()=>promise = null)
    return promise
}
export function isRefreshRequest(config) {
    return !!config.__isRefreshToken
}