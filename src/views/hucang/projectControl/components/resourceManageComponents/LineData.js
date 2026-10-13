// 调整线路数据
const ADJUST_LINE_CLOUMN = [
    {
        title: '回路编号', 
        width:80,
        dataIndex: 'number',
    },
    {
        title: '关联风机编号（以“、”隔开）', 
        width:120,
        scopedSlots: 'fanNumber',
    },
    {
        title: '容量/MW', 
        width:120,
        scopedSlots: 'value1',
    },
    {
        title: '线路长度/km', 
        width:120,
        scopedSlots: 'value2',
    }
]


// 导、地线材料量表
const LINE_MATERIAL_CLOUMN = [{
    title: '名称', 
    width:90,
    dataIndex: 'name',
},
{
    title: '型号', 
    width:80,
    dataIndex: 'model',
},
{
    title: '重量/单位（kg）', 
    width:120,
    dataIndex: 'weightPerUnit',
},
{
    title: '重量/总计（t）', 
    width:120,
    scopedSlots: 'totalWeight',
},
{
    title: '长度km/数量', 
    width:120,
    scopedSlots: 'quantity',
}]

// 绝缘子、主要金具及其他材料量表
const INSULATION_LINE_CLOUMN = [
{
    title: '名称', 
    width:120,
    dataIndex: 'name',
},
{
    title: '型号', 
    width:120,
    dataIndex: 'model',
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
}]

// 结构部分材料表
const STRUCTURE_MATERIAL_CLOUMN = [
    {
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
        title: '数量', 
        width:120,
        scopedSlots: 'total',
    }]
// 电缆土建量表
const CABLE_MATERIAL_CLOUMN = [
    {
        title: '名称', 
        width:120,
        dataIndex: 'name',
    },
    {
        title: '型号', 
        width:120,
        dataIndex: 'model',
    },
    {
        title: '单位', 
        width:120,
        dataIndex: 'unit',
    },
    {
        title: '数量', 
        width:120,
        scopedSlots: 'total',
    }]
// 电缆土建量表
const CABLE_LAYING_MATERIAL_CLOUMN = [
    {
        title: '名称', 
        width:120,
        dataIndex: 'name',
    },
    {
        title: '型号', 
        width:120,
        dataIndex: 'model',
    },
    {
        title: '单位', 
        width:120,
        dataIndex: 'unit',
    },
    {
        title: '数量', 
        width:120,
        scopedSlots: 'total',
    },{
        title: '备注', 
        width:120,
        dataIndex: 'remark',
    }]
export {
    ADJUST_LINE_CLOUMN,
    LINE_MATERIAL_CLOUMN,
    INSULATION_LINE_CLOUMN,
    STRUCTURE_MATERIAL_CLOUMN,
    CABLE_MATERIAL_CLOUMN,
    CABLE_LAYING_MATERIAL_CLOUMN
}