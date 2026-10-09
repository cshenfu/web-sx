import { getProvince, getCertificate } from '@/api/modules/public';
import { getTempDownloadUrl } from '@/api/modules/public';
// 数据范围
const RANGE_TYPE_PROVINCE = [
    {
        label: '全部维度',
        value: 0,
    },
    {
        label: '省数据',
        value: 1,
    },
    {
        label: '市数据',
        value: 2,
    },
    {
        label: '区数据',
        value: 3,
    },
];
// 用户数据状态
const USER_COMMON_DATA_STATUS = [
    {
        label: '系统解析',
        value: 1,
        className: 'bind-icon',
    },
    {
        label: '已核对',
        value: 2,
        className: 'pending-icon',
    },
    {
        label: '解析失败',
        value: 3,
        className: 'finish-icon',
    },
];
// 公共数据状态
const PUBLIC_COMMON_STATUS = [
    {
        label: '已开放',
        value: 0,
        className: 'pending-icon',
    },
    {
        label: '已禁用',
        value: 1,
        className: 'finish-icon',
    },
];
const cityClomun = {
    title: '所属',
    width: 120,
    scopedSlots: 'provinceName',
};
// 去掉对象中值为空的属性
const removeEmpty = (obj) => {
    for (var i in obj) {
        if (obj[i] === null || obj[i] === undefined || obj[i] === '') {
            delete obj[i];
        }
    }
    return obj;
};
// 根据searchKey.rangeType获取相对应的省的数据、省市的数据、省市区的数据
const filterAreaInfo = (type, val) => {
    let result = [];
    switch (type) {
        case 0:
            result = val;
            break;
        case 1:
            result = val.map((item) => {
                return {
                    ...item,
                    subList: null,
                };
            });
            break;
        case 2:
            result = val.map((item) => {
                return {
                    ...item,
                    subList: item.subList.map((secondItem) => {
                        return {
                            ...secondItem,
                            subList: null,
                        };
                    }),
                };
            });
            break;
        case 3:
            result = val;
    }
    return result;
};
// 获取省市区数据
const getAreaInfo = async () => {
    let result = [];
    try {
        const res = await getProvince();
        if (res.code === 200) {
            result = res.data?.subList;
        }
    } catch (e) {
        console.log(e);
    }
    return result;
};
// 处理富文本编辑其中的图片路径，长路径转为短路径--- Todo需要更改
const processRichText = (html) => {
    const regex = /oss-cn-beijing\/(.*?)\?/;
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const images = doc.querySelectorAll('img');
    images.forEach((img) => {
        const originalUrl = img.getAttribute('src');
        const matchResult = originalUrl.match(regex);
        const newUrl = (matchResult && matchResult[1]) || ''; // 替换后的 URL 或路径
        img.setAttribute('src', newUrl);
    });
    return doc.body.innerHTML;
};
// 转化上传文件中的url
const changeEditorUrl = (type, obj) => {
    let data = { ...obj };
    type.forEach((item) => {
        if (obj[item]) {
            data[item] = processRichText(obj[item]);
        }
    });
    return data;
};
// 下载文件
const downLoadFile = async (path) => {
    if (path.startsWith('https://')) {
        window.open(path);
        return;
    }
    let data = `objectKey=${path}`;
    try {
        let res = await getTempDownloadUrl(data);
        if (res.code === 200 && res.data) {
            window.open(res.data, '_blank');
        }
    } catch (err) {}
};
export {
    RANGE_TYPE_PROVINCE,
    USER_COMMON_DATA_STATUS,
    PUBLIC_COMMON_STATUS,
    cityClomun,
    removeEmpty,
    filterAreaInfo,
    getAreaInfo,
    processRichText,
    changeEditorUrl,
    downLoadFile,
};
