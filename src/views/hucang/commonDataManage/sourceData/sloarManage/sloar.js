const SLOAR_TABLE_LIST_CLOUMN= [
    {
        title: '所属区域',
        width: 180,
        dataIndex: 'areaNameStr',
    },
    {
        title: '太阳能资源数据',
        width: 100,
        scopedSlots: 'hasResourceData',
    },
    {
        title: '太阳能资源分布图',
        width: 100,
        scopedSlots: 'hasImg',
    },
    {
        title: '更新时间',
        width: 160,
        dataIndex: 'updateTime',
    },
    {
        title: '操作',
        scopedSlots: 'operation',
        width:160,
    },
]
export {
    SLOAR_TABLE_LIST_CLOUMN
}