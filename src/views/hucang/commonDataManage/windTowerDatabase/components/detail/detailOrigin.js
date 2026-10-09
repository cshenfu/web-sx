const BASICS_DETAIL = [{
    title: '测风塔编号',
    dataIndex: 'windTowerCode',
    align: 'center'
}, {
    title: '经纬度',
    scopedSlots: 'lngAndlat',
    align: 'center'
}, {
    title: '海拔（m）',
    dataIndex: 'elevation',
    align: 'center'
}, {
    title: '测风周期',
    scopedSlots: 'startTimeAndEndTime',
    align: 'center'
}, {
    title: '各层测风仪器',
    scopedSlots: 'windTypeList',
    align: 'center',
    width: 296
}, {
    title: '应测数据/条',
    dataIndex: 'rawIdealRow',
    align: 'center'
},{
    title: '实测数据/条',
    dataIndex: 'rawRealRow',
    align: 'center'
}]

export {
    BASICS_DETAIL
}