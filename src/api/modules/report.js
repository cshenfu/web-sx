import { publicService4,publicService5 } from '@/api/base';

// ==============================layer=====================================

// 请示文件
export async function createQXReport(data) {
    return await publicService4.post('/ai/api/aiProject/create',data);
}