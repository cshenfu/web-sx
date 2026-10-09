// 雷暴
const thunderDetail= {
    infoList: [
        {
            title: '所属区域',
            fields: 'areaName',
        },
        // {
        //     title: '数据类型',
        //     fields: 'dataTypeStr',
        // },
        {
            title: '雷暴日',
            fields: 'thunderstormDays',
        },
        {
            title: '区域等级',
            fields: 'areaLevel',
        },
       
    ],
    fileList: [
        {
            title: '数据来源',
            type: 'file',
            fields: 'remark',
        },
        {
            title: '雷暴分布图',
            type: 'img',
            fields: 'mapImage',
        },
    ],
}
// 酸雨
const acidRainDetail= {
    infoList: [
        {
            title: '所属区域',
            fields: 'areaName',
        },
        // {
        //     title: '数据类型',
        //     fields: 'dataTypeStr',
        // },
        {
            title: '样本数',
            fields: 'precipitationSamplesNum',
        },
        {
            title: 'pH<5.6样本数',
            fields: 'ph56SamplesNum',
        },
        {
            title: '降雨pH均值',
            fields: 'minAcidRainValue',
            fieldsSecond: 'maxAcidRainValue',
        },
    ],
    fileList: [
        {
            title: '数据来源',
            type: 'file',
            fields: 'remark',
        },
        {
            title: '酸雨分布图',
            type: 'img',
            fields: 'mapImage',
        },
    ],
}
// 温度
const temperatureDetail =  {
    infoList: [
        {
            title: '所属区域',
            fields: 'areaName',
        },
        // {
        //     title: '数据类型',
        //     fields: 'dataTypeStr',
        // },
        {
            title: '冬季通风室外计算温度',
            fields: 'winterIndoorTemperature',
        },
        {
            title: '冬季采暖室外计算温度',
            fields: 'winterOutdoorTemperature',
        },
        {
            title: '夏季通风室外计算温度',
            fields: 'summerOutdoorTemperature',
        },
        {
            title: '夏季空调室外计算干球温度',
            fields: 'summerIndoorTemperature',
        },
        {
            title: '历年极端最高气温',
            fields: 'highExtremeTemperature',
        },
        {
            title: '极端最低气温',
            fields: 'lowExtremeTemperature',
        },
        {
            title: '多年平均气温',
            fields: 'avgTemperature',
        },
    ],
    fileList: [
        {
            title: '数据来源',
            type: 'file',
            fields: 'remark',
        },
        {
            title: '气温分布图',
            type: 'img',
            fields: 'mapImage',
        },
    ],
}
// 风压
const  windPressureDetail = {
    infoList: [
        // {
        //     title: '数据类型',
        //     fields: 'dataTypeStr',
        // },
        {
            title: 'n=10',
            fields: 'n10',
        },
        {
            title: 'n=50',
            fields: 'n50',
        },
        {
            title: 'n=100',
            fields: 'n100',
        }
    ],
    fileList: [
        {
            title: '数据来源',
            type: 'file',
            fields: 'remark',
        }
    ],
}
// 雪压
const snowPressureDetail = {
    infoList: [
        {
            title: '所属区域',
            fields: 'areaName',
        },
        // {
        //     title: '数据类型',
        //     fields: 'dataTypeStr',
        // },
        {
            title: 'n=10',
            fields: 'n10',
        },
        {
            title: 'n=50',
            fields: 'n50',
        },
        {
            title: 'n=100',
            fields: 'n100',
        }
    ],
    fileList: [
        {
            title: '数据来源',
            type: 'file',
            fields: 'remark',
        }
    ],
}
// 降水
const rainFallDetail = {
    infoList: [
        {
            title: '所属区域',
            fields: 'areaNameStr',
        },
        // {
        //     title: '数据类型',
        //     fields: 'dataTypeStr',
        // },
        {
            title: '降水量mm',
            fields: 'rainfall',
        },
    ],
    fileList: [
        {
            title: '数据来源',
            type: 'file',
            fields: 'remarks',
        }
    ],
}
// 沙暴日
const sandStormDetail = {
    infoList: [
        {
            title: '所属区域',
            fields: 'areaNameStr',
        },
        // {
        //     title: '数据类型',
        //     fields: 'dataTypeStr',
        // },
        {
            title: '沙暴日',
            fields: 'day',
        },
    ],
    fileList: [
        {
            title: '数据来源',
            type: 'file',
            fields: 'remarks',
        }
    ],
}
// 风速度
const windSpeedDetail = {
    infoList: [
        {
            title: '所属区域',
            fields: 'areaNameStr',
        },
        // {
        //     title: '数据类型',
        //     fields: 'dataTypeStr',
        // },
        {
            title: '平均风速m/s',
            fields: 'avgWindSpeed',
        },
        {
            title: '最大风速m/s',
            fields: 'maxWindSpeed',
        },
    ],
    fileList: [
        {
            title: '数据来源',
            type: 'file',
            fields: 'remarks',
        }
    ],
}
// 冰雹
const hailDetail = {
    infoList: [
        {
            title: '所属区域',
            fields: 'areaNameStr',
        },
        // {
        //     title: '数据类型',
        //     fields: 'dataTypeStr',
        // },
        {
            title: '冰雹',
            fields: 'day',
        },
    ],
    fileList: [
        {
            title: '数据来源',
            type: 'file',
            fields: 'remarks',
        }
    ],
}
// 所有tabs选项
const PLAIN_OPTIONS = [
    {
        label: '雷暴',
        value: 1,
    },
    // {
    //     label: '覆冰',
    //     value: 2,
    // },
    {
        label: '酸雨',
        value: 2,
    },
    {
        label: '温度',
        value: 3,
    },
    {
        label: '风压',
        value: 4,
    },
    {
        label: '雪压',
        value: 5,
    },
    {
        label: '降水',
        value: 6,
    },
    {
        label: '沙尘暴',
        value: 7,
    },
    {
        label: '风速',
        value: 8,
    },
    {
        label: '冰雹',
        value: 9,
    },
]
export {
    thunderDetail,
    acidRainDetail,
    temperatureDetail,
    windPressureDetail,
    PLAIN_OPTIONS,
    snowPressureDetail,
    rainFallDetail,
    sandStormDetail,
    windSpeedDetail,
    hailDetail

}