const ELECTRICAL_TABLE_LIST_CLOUMN = [{
    title: '数据编号',
    dataIndex: 'geologyCode',
    width: 120,
    selfHeader:'selfName',
    fixed: 'left'
}, {
    title: '所属区域',
    width: 100,
    dataIndex: 'provinceName'
}, {
    title: '数据来源',
    width: 100,
    dataIndex: 'progressNumber'
}, {
    title: '关联项目编号',
    width: 130,
    scopedSlots: 'status'
},{
    title: '数据状态',
    width: 150,
    scopedSlots: 'isHaveLocationFile'
}, {
    title: '经纬度',
    width: 150,
    scopedSlots: 'isHaveTopographicFile'
}, {
    title: '海拔/m',
    width: 120,
    scopedSlots: 'isHaveRoughnessFile'
}, {
    title: '测风周期',
    width: 120,
    scopedSlots: 'isHaveGeologyRockSoils'
}, {
    title: '层数/最高层',
    width: 150,
    scopedSlots: 'isHaveRegionalGeologyInfo'
}, {
    title: '总数据/条',
    width: 150,
    scopedSlots: 'isHaveRegionalGeologyInfo'
},{
    title: '是否已插补',
    width: 150,
    scopedSlots: 'isHaveRegionalGeologyInfo'
},{
    title: '风速高度层',
    width: 150,
    scopedSlots: 'isHaveRegionalGeologyInfo'
},{
    title: '方差风速',
    width: 150,
    scopedSlots: 'isHaveRegionalGeologyInfo'
},{
    title: '温度层',
    width: 150,
    scopedSlots: 'isHaveRegionalGeologyInfo'
},{
    title: '压强',
    width: 150,
    scopedSlots: 'isHaveRegionalGeologyInfo'
},{
    title: '风向',
    width: 150,
    scopedSlots: 'isHaveRegionalGeologyInfo'
},{
    title: '附件',
    width: 150,
    scopedSlots: 'isHaveRegionalGeologyInfo'
},{
    title: '更新时间',
    width: 150,
    scopedSlots: 'updateTime'
}, {
    title: '操作',
    width: 120,
    scopedSlots: 'operation',
    fixed: 'right'
}]

export {
    ELECTRICAL_TABLE_LIST_CLOUMN
}