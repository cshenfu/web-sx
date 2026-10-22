// 气象精灵接口地址
import { publicService3 } from '@/api/base';
// 经纬度查询下载历史
export async function getHasDownloadHistory(data) {
    return await publicService3.post('/climate/downloadTask/downloadByLngLat', data);
}
// 创建下载任务
export async function postCreateDownloadTask(data) {
    return await publicService3.post(`/climate/downloadTask/startDownload`, data);
}
// 经纬度查高度和详细信息
export async function getHeightAndDetail(data) {
    return await publicService3.get('/climate/downloadTask/addressWindByLngLat', data);
} 
// 下载列表分页查询
export async function getProjectList(data) {
    return await publicService3.post('/climate/downloadTask/myDownloadPage', data);
}

// 下载文件
export async function getDownloadFile(id) {
    return await publicService3.get(`/climate/downloadTask/startDownloadById/${id}`);
}
