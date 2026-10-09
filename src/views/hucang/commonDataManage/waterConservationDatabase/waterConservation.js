const WATER_CONSERATION_TABLE_LIST_CLOUMN= [
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
        title: '自然环境',
        width: 100,
        scopedSlots: 'isCurrentPowerGrid',
    },
    {
        title: '水环境',
        width: 100,
        scopedSlots: 'isNeedPrediction',
    },
    {
        title: '环境空气、声环境',
        width:200,
        scopedSlots: 'isCurrentPowerSupply',
    },
    {
        title: '社会环境',
        width: 100,
        scopedSlots: 'isElectricityConsumptionDevLevel',
    },
    {
        title: '生态环境',
        width: 140,
        scopedSlots: 'isPowerGridSurroundRela',
    },
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
export{
    WATER_CONSERATION_TABLE_LIST_CLOUMN,
    USER_DETAIL_LOG,
}