import { useOssUpload } from '@/components/ossClient/index';
let obsUpload = useOssUpload();
const editorFormatPath = (innerHtmls) => {
    // 富文本里面图片长路经转短路径
    if (!innerHtmls) {
        return '';
    }
    const ele = new DOMParser().parseFromString(innerHtmls, 'text/html');
    const imgs = (ele.getElementsByTagName('img'));
    for (let index = 0; index < imgs.length; index++) {
        const element = imgs[index];
        const src = element.getAttribute('src');
        if (src) {
            let formatSrc = '';
            if (src.includes(':443/')) {
                formatSrc = src.split(':443/')[1].split('?')[0];
            } else {
                formatSrc = src.split('.com/')[1].split('?')[0];
            }
            element.src = formatSrc;
        }
    }
    const htmls = ele.body.innerHTML;
    return htmls;
}
const editorFormatFullPath = async(innerHtmls) => {
    // 富文本短连接换成长连接
    if (!innerHtmls) {
        return '';
    }
    const ele = new DOMParser().parseFromString(innerHtmls, 'text/html');
    const imgs = (ele.body.getElementsByTagName('img'));
    for (let index = 0; index < imgs.length; index++) {
        const element = imgs[index];
        let src = element.getAttribute('src');
        if (src) {
            src = decodeURIComponent(src);
            console.log(src);
            if (!src.includes(':443/') && !src.includes('.com/')) {
                await obsUpload.getFileUrl(src);
                element.src = obsUpload.urlPath.value;
            } else {
                // if (src.includes('.com/')) {
                //     await obsUpload.getFileUrl(src.split('?')[0].split('.com/')[1])
                //     element.src = obsUpload.urlPath.value;
                // } else {
                //     await obsUpload.getFileUrl(src.split('?')[0].split(':443/')[1])
                //     element.src = obsUpload.urlPath.value;
                // }
                element.src = src.split('?')[0];
            }
        }
    }
    const htmls = ele.body.innerHTML;
    return htmls;
}
export{
    editorFormatPath,
    editorFormatFullPath
}