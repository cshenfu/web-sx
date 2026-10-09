const THUNDER_TABLE_LIST_CLOUMN = [
    {
        title: '所属区域',
        width: 150,
        dataIndex: 'areaName',
    },
    // {
    //     title: '数据类型',
    //     width: 150,
    //     dataIndex: 'dataTypeStr',
    // },
    {
        title: '雷暴日',
        width: 180,
        dataIndex: 'thunderstormDays',
    },
    {
        title: '更新时间',
        width: 180,
        scopedSlots: 'updateTime',
    },
    {
        title: '操作',
        scopedSlots: 'operation',
        width: 136,
        fixed: 'right',
    },
];
const CING_TABLE_LIST_CLOUMN = [
    {
        title: '所属区域',
        width: 150,
        dataIndex: 'areaName',
    },
    // {
    //     title: '市总量/覆盖量/覆盖率',
    //     width: 180,
    //     scopedSlots: 'value4',
    // },
    // {
    //     title: '区总量/覆盖量/覆盖率',
    //     width: 180,
    //     scopedSlots: 'value5',
    // },
    // {
    //     title: '数据类型',
    //     width: 150,
    //     dataIndex: 'dataTypeStr',
    // },
    {
        title: '数据文件',
        width: 150,
        scopedSlots: 'value7',
    },
    {
        title: '覆冰厚度',
        width: 150,
        scopedSlots: 'value7',
    },
    {
        title: '更新时间',
        width: 150,
        scopedSlots: 'updateTime',
    },
    {
        title: '操作',
        scopedSlots: 'operation',
        width: 136,
        fixed: 'right',
    },
];
const ACID_RAIN_TABLE_LIST_CLOUMN = [
    {
        title: '所属区域',
        width: 150,
        dataIndex: 'areaName',
    },
    // {
    //     title: '数据类型',
    //     width: 150,
    //     dataIndex: 'dataTypeStr',
    // },
    // {
    //     title: '降雨pH均值',
    //     width: 150,
    //     scopedSlots: 'ph56SamplesNum',
    // },
    {
        title: 'ph<5.6样本数',
        width: 150,
        dataIndex: 'ph56SamplesNum',
    },
    {
        title: '更新时间',
        width: 150,
        scopedSlots: 'updateTime',
    },
    {
        title: '操作',
        scopedSlots: 'operation',
        width: 136,
        fixed: 'right',
    },
];
const TEMPERATURE_RAIN_TABLE_LIST_CLOUMN = [
    {
        title: '所属区域',
        width: 120,
        dataIndex: 'areaName',
    },
    // {
    //     title: '数据类型',
    //     width: 100,
    //     dataIndex: 'dataTypeStr',
    // },
    {
        title: '冬季通风室外计算温度',
        width: 180,
        dataIndex: 'winterOutdoorTemperature',
    },
    {
        title: '冬季采暖室外计算温度',
        width: 180,
        dataIndex: 'winterIndoorTemperature',
    },
    {
        title: '夏季通风室外计算温度',
        width: 180,
        dataIndex: 'summerOutdoorTemperature',
    },
    {
        title: '夏季空调室外计算干球温度',
        width: 210,
        dataIndex: 'summerIndoorTemperature',
    },
    {
        title: '历年极端最高气温',
        width: 150,
        dataIndex: 'highExtremeTemperature',
    },
    {
        title: '极端最低气温',
        width: 150,
        dataIndex: 'lowExtremeTemperature',
    },
    {
        title: '多年平均气温',
        width: 150,
        dataIndex: 'avgTemperature',
    },
    {
        title: '更新时间',
        width: 150,
        scopedSlots: 'updateTime',
    },
    {
        title: '操作',
        scopedSlots: 'operation',
        width: 136,
        fixed: 'right',
    },
];
const WIND_PRESSURE_TABLE_LIST_CLOUMN = [
    {
        title: '所属区域',
        width: 120,
        dataIndex: 'areaName',
    },
    // {
    //     title: '数据类型',
    //     width: 120,
    //     dataIndex: 'dataTypeStr',
    // },
    {
        title: 'n=10',
        width: 120,
        dataIndex: 'n10',
    },
    {
        title: 'n=50',
        width: 120,
        dataIndex: 'n50',
    },
    {
        title: 'n=100',
        width: 120,
        dataIndex: 'n100',
    },
    {
        title: '更新时间',
        width: 120,
        scopedSlots: 'updateTime',
    },
    {
        title: '操作',
        scopedSlots: 'operation',
        width: 136,
        fixed: 'right',
    }
]
// 雪压
const SNOW_PRESSURE_TABLE_LIST_CLOUMN =[
    {
        title: '所属区域',
        width: 120,
        dataIndex: 'areaName',
    },
    // {
    //     title: '数据类型',
    //     width: 120,
    //     dataIndex: 'dataTypeStr',
    // },
    {
        title: 'n=10',
        width: 120,
        dataIndex: 'n10',
    },
    {
        title: 'n=50',
        width: 120,
        dataIndex: 'n50',
    },
    {
        title: 'n=100',
        width: 120,
        dataIndex: 'n100',
    },
    {
        title: '更新时间',
        width: 120,
        scopedSlots: 'updateTime',
    },
    {
        title: '操作',
        scopedSlots: 'operation',
        width: 136,
        fixed: 'right',
    }
]
// 降水
const RAIN_FALL_TABLE_LIST_CLOUMN =[
    {
        title: '所属区域',
        width: 120,
        dataIndex: 'areaNameStr',
    },
    // {
    //     title: '数据类型',
    //     width: 120,
    //     dataIndex: 'dataTypeStr',
    // },
    {
        title: '降水量mm',
        width: 120,
        dataIndex: 'rainfall',
    },

    {
        title: '更新时间',
        width: 120,
        scopedSlots: 'updateTime',
    },
    {
        title: '操作',
        scopedSlots: 'operation',
        width: 136,
    }
]
// 沙尘暴
const DUST_STORM_TABLE_LIST_CLOUMN =[
    {
        title: '所属区域',
        width: 120,
        dataIndex: 'areaNameStr',
    },
    // {
    //     title: '数据类型',
    //     width: 120,
    //     dataIndex: 'dataTypeStr',
    // },
    {
        title: '沙尘暴日',
        width: 120,
        dataIndex: 'day',
    },

    {
        title: '更新时间',
        width: 120,
        scopedSlots: 'updateTime',
    },
    {
        title: '操作',
        scopedSlots: 'operation',
        width: 136,
    }
]
// 风速
const WIND_SPEED_TABLE_LIST_CLOUMN = [
    {
        title: '所属区域',
        width: 120,
        dataIndex: 'areaNameStr',
    },
    // {
    //     title: '数据类型',
    //     width: 120,
    //     dataIndex: 'dataTypeStr',
    // },
    {
        title: '平均风速m/s',
        width: 120,
        dataIndex: 'avgWindSpeed',
    },
    {
        title: '最大风速m/s',
        width: 120,
        dataIndex: 'maxWindSpeed',
    },
    {
        title: '更新时间',
        width: 120,
        scopedSlots: 'updateTime',
    },
    {
        title: '操作',
        scopedSlots: 'operation',
        width: 136,
    }
]
// 冰雹
const HAIL_TABLE_LIST_CLOUMN =[
    {
        title: '所属区域',
        width: 120,
        dataIndex: 'areaNameStr',
    },
    // {
    //     title: '数据类型',
    //     width: 120,
    //     dataIndex: 'dataTypeStr',
    // },
    {
        title: '冰雹日数',
        width: 120,
        dataIndex: 'day',
    },

    {
        title: '更新时间',
        width: 120,
        scopedSlots: 'updateTime',
    },
    {
        title: '操作',
        scopedSlots: 'operation',
        width: 136,
    }
]
export {
    THUNDER_TABLE_LIST_CLOUMN,
    CING_TABLE_LIST_CLOUMN,
    ACID_RAIN_TABLE_LIST_CLOUMN,
    TEMPERATURE_RAIN_TABLE_LIST_CLOUMN,
    WIND_PRESSURE_TABLE_LIST_CLOUMN,
    SNOW_PRESSURE_TABLE_LIST_CLOUMN,
    RAIN_FALL_TABLE_LIST_CLOUMN,
    DUST_STORM_TABLE_LIST_CLOUMN,
    WIND_SPEED_TABLE_LIST_CLOUMN,
    HAIL_TABLE_LIST_CLOUMN
};
