import { publicService4,publicService5 } from '@/api/base';

// ==============================layer=====================================

// 请示文件
export async function createQXReport(data) {
    return await publicService4.post('/ai/sx-report/request-document/params',data);
}


// 立项申请报告
export async function createLXReport(data) {
    return await publicService4.post('/ai/sx-report/initiation/params',data);
}