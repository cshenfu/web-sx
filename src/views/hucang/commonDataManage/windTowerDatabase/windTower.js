const WIND_TOWER_TABLE_LIST_CLOUMN= [
    {
        title: '数据编号', 
        width:120,
        dataIndex: 'windTowerCode',
        selfHeader:'selfName'
    },
    {
        title: '测风塔号', 
        width:120,
        dataIndex: 'windTowerSeq',
    },
    {
        title: '所属区域',
        width: 180,
        scopedSlots: 'areaData',
    },
    {
        title: '关联项目编号',
        width: 140,
        scopedSlots: 'projectCode',
    },
    {
        title: '数据状态',
        width: 100,
        scopedSlots: 'analysisStatus',
    },
    {
        title: '经纬度',
        width: 160,
        scopedSlots: 'latOrLng',
    },
    {
        title: '海拔/m',
        width: 100,
        scopedSlots: 'elevation',
    },
    {
        title: '测风周期',
        width:180,
        scopedSlots: 'rawTime',
    },
    {
        title: '层数/最高层',
        width: 150,
        scopedSlots: 'tierOrTopHeight',
    },
    {
        title: '总数据/条',
        width: 140,
        dataIndex: 'rawRealRow',
    },
    {
        title: '是否已插补',
        width: 160,
        scopedSlots: 'isRepair',
    },
    {
        title: '高度层',
        width: 160,
        scopedSlots: 'value12',
    },
    {
        title: '方差风速',
        width: 120,
        scopedSlots: 'isSd',
    },
    {
        title: '温度层',
        width: 120,
        scopedSlots: 'isTemperatureTier',
    },
    {
        title: '压强',
        width: 120,
        scopedSlots: 'isPressureTier',
    },
    {
        title: '风向',
        width: 120,
        scopedSlots: 'isDirectionTier',
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
    WIND_TOWER_TABLE_LIST_CLOUMN,
    USER_DETAIL_LOG
}