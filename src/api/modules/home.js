import { publicService4 } from '@/api/base';



// 添加条目（文件-外部库引用）


export async function getHomePageData(data) {
    return await publicService4.post('/api/homepage', data);
}