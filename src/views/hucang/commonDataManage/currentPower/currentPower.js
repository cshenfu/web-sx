const POWER_TABLE_LIST_CLOUMN= [
    {
        title: '数据编号', 
        width:120,
        dataIndex: 'powerGridCode',
    },
    {
        title: '所属区域',
        width: 180,
        scopedSlots: 'areaData',
    },
    {
        title: '关联项目编号',
        width: 140,
        scopedSlots: 'projectCodes',
    },
    {
        title: '数据状态',
        width: 100,
        scopedSlots: 'statusName',
    },
    {
        title: '拐点坐标',
        width: 100,
        scopedSlots: 'isLocations',
    },
    {
        title: '电网现状',
        width: 100,
        scopedSlots: 'isCurrentPowerGrid',
    },
    {
        title: '电力发展',
        width: 100,
        scopedSlots: 'isNeedPrediction',
    },
    // {
    //     title: '电源现状',
    //     width:100,
    //     scopedSlots: 'isCurrentPowerSupply',
    // },
    // {
    //     title: '用电量及负荷发展水平',
    //     width: 200,
    //     scopedSlots: 'isElectricityConsumptionDevLevel',
    // },
    // {
    //     title: '与周边电网联系',
    //     width: 140,
    //     scopedSlots: 'isPowerGridSurroundRela',
    // },
    // {
    //     title: '500kV电网存在问题',
    //     width: 160,
    //     scopedSlots: 'isV500PowerGridProblem',
    // },
    {
        title: '附件',
        width: 120,
        scopedSlots: 'filePath',
    },
    {
        title: '更新时间',
        width: 160,
        dataIndex: 'createTime',
    },
    {
        title: '操作',
        scopedSlots: 'operation',
        width:160,
        fixed: 'right',
    },
]
const USER_DETAIL_LOG = [{
    title: '操作时间',
    dataIndex: 'handleTime'
}, {
    title: '操作人',
    dataIndex: 'handleUser'
}, {
    title: '操作类型',
    scopedSlots: 'handleType'
}, {
    title: '操作内容',
    dataIndex: 'handleCont'
}, {
    title: '备注',
    dataIndex: 'remark'
}, {
    title: '附件',
    scopedSlots: 'attachments'
}]
// 省市区对应的数据序号
const AREA_NUMBER = {
    'current': {
        1:'${4.3.1}',
        2:'${4.3.2}',
        3:'${4.3.3}'
    },
    'development': {
        1:'${4.4.1}',
        2:'${4.4.2}',
        3:'${4.4.3}'
    }
}
export{
    POWER_TABLE_LIST_CLOUMN,
    USER_DETAIL_LOG,
    AREA_NUMBER
}