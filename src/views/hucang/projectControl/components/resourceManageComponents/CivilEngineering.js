// 升压站面积
const BOOSTER_STATION_CLOUMN = [{
    title: '名称', 
    width:120,
    dataIndex: 'name',
},
{
    title: '单位', 
    width:120,
    dataIndex: 'unit',
},
{
    title: '值', 
    width:120,
    scopedSlots: 'quantity',
}]

// 风机基础、箱变基础、升压站工程量表
const ENGINEERING_CLOUMN = [{
    title: '序号', 
    width:120,
    dataIndex: 'serialNumber',
},
{
    title: '工程项目及名称', 
    width:120,
    dataIndex: 'projectName',
},
{
    title: '单位', 
    width:120,
    dataIndex: 'unit',
},
{
    title: '数量', 
    width:120,
    scopedSlots: 'quantity',
},
// {
//     title: '调整数量', 
//     width:120,
//     scopedSlots: 'adjustNum',
// },
{
    title: '备注', 
    width:120,
    scopedSlots: 'remark',
},
// {
//     title: '调整备注', 
//     width:120,
//     scopedSlots: 'adjustRemark',
// }
]


export {
    BOOSTER_STATION_CLOUMN,
    ENGINEERING_CLOUMN
}