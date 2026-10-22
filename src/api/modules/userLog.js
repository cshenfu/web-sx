import { publicService } from '@/api/base';
// 用户日志——下载、打印、预览操作
export async function postLog(data) {
    return await publicService.get('/web/log/previewDownloadPrintLog', data);
}
