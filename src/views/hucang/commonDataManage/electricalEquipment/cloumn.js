const ELECTRICAL_TABLE_LIST_CLOUMN = [{
    title: '设备编号',
    dataIndex: 'geologyCode',
    width: 120,
    selfHeader:'selfName',
    fixed: 'left'
}, {
    title: '型号',
    width: 100,
    dataIndex: 'provinceName'
}, {
    title: '类型',
    width: 100,
    dataIndex: 'progressNumber'
}, {
    title: '箱变容量(kW)',
    width: 130,
    scopedSlots: 'status'
},{
    title: '高压侧额定电压',
    width: 150,
    scopedSlots: 'isHaveLocationFile'
}, {
    title: '低压侧额定电压',
    width: 150,
    scopedSlots: 'isHaveTopographicFile'
}, {
    title: '短路阻抗',
    width: 120,
    scopedSlots: 'isHaveRoughnessFile'
}, {
    title: '连接组标号',
    width: 120,
    scopedSlots: 'isHaveGeologyRockSoils'
}, {
    title: '高低压侧配置说明',
    width: 150,
    scopedSlots: 'isHaveRegionalGeologyInfo'
}, {
    title: '创建时间',
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