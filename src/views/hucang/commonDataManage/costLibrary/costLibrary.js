import { Label } from "@icon-park/vue-next";

// 建筑工程单价
const COST_TABLE_LIST_CLOUMN_PRO_UNIT= [
    {
        title: '编号', 
        dataIndex: 'value1',
    },
    {
        title: '类型',
        scopedSlots: 'value2',
    },
    {
        title: '名称',
        scopedSlots: 'value3',
    },
    {
        title: '单位',
        scopedSlots: 'value4',
    },
    {
        title: '单价/元',
        scopedSlots: 'value5',
    },
    {
        title: '最小值',
        dataIndex: 'createTime',
    },
    {
        title: '最大值',
        dataIndex: 'createTime',
    },
    {
        title: '操作',
        scopedSlots: 'operation',
        fixed: 'right',
    },
];
// 设备及安装工程单价
const COST_TABLE_LIST_CLOUMN_DEVICE_UNIT= [
    {
        title: '编号', 
        width:120,
        dataIndex: 'value1',
    },
    {
        title: '类型',
        width: 180,
        scopedSlots: 'value2',
    },
    {
        title: '名称',
        width: 140,
        scopedSlots: 'value3',
    },
    {
        title: '单位',
        width: 100,
        scopedSlots: 'value4',
    },
    {
        title: '设备费',
        width: 100,
        scopedSlots: 'value5',
    },
    {
        title: '安装费',
        width: 100,
        scopedSlots: 'value5',
    },
    {
        title: '装置性材料费',
        width: 160,
        dataIndex: 'createTime',
    },
    {
        title: '甲供装置性材料费',
        width: 160,
        dataIndex: 'createTime',
    },
    {
        title: '操作',
        scopedSlots: 'operation',
        width:160,
        fixed: 'right',
    },
];
// 其他单价
const COST_TABLE_LIST_CLOUMN_OTHER_UNIT= [
    {
        title: '编号', 
        width:120,
        dataIndex: 'value1',
    },
    {
        title: '类型',
        width: 180,
        scopedSlots: 'value2',
    },
    {
        title: '名称',
        width: 140,
        scopedSlots: 'value3',
    },
    {
        title: '单位',
        width: 100,
        scopedSlots: 'value4',
    },
    {
        title: '单价/元',
        width: 100,
        scopedSlots: 'value5',
    },
    {
        title: '最小值',
        width: 100,
        scopedSlots: 'value5',
    },
    {
        title: '最大值',
        width: 160,
        dataIndex: 'createTime',
    },
    {
        title: '操作',
        scopedSlots: 'operation',
        width:160,
        fixed: 'right',
    },
];
// 施工辅助单价
const COST_TABLE_LIST_CLOUMN_AUXILIARY_UNIT= [
    {
        title: '编号', 
        width:120,
        dataIndex: 'value1',
    },
    {
        title: '类型',
        width: 180,
        scopedSlots: 'value2',
    },
    {
        title: '名称',
        width: 140,
        scopedSlots: 'value3',
    },
    {
        title: '单位',
        width: 100,
        scopedSlots: 'value4',
    },
    {
        title: '单价/元',
        width: 100,
        scopedSlots: 'value5',
    },
    {
        title: '最小值',
        width: 100,
        scopedSlots: 'value5',
    },
    {
        title: '最大值',
        width: 160,
        dataIndex: 'createTime',
    },
    {
        title: '操作',
        scopedSlots: 'operation',
        width:160,
        fixed: 'right',
    },
];
// 通用价格字典
const COST_TABLE_LIST_CLOUMN_COMMON_PRICE= [
    {
        title: '类型',
        width: 180,
        dataIndex: 'type',
    },
    {
        title: '编码', 
        width: 140,
        dataIndex: 'code',
    },
    {
        title: '名称',
        width: 140,
        dataIndex: 'name',
    },
    {
        title: '单位',
        width: 100,
        dataIndex: 'unit',
    },
    {
        title: '默认值',
        width: 100,
        dataIndex: 'defaultValue',
    },
    {
        title: '最大值',
        width: 160,
        dataIndex: 'maxValue',
    },
    {
        title: '最小值',
        width: 100,
        dataIndex: 'minValue',
    },
    {
        title: '更新日期',
        width: 150,
        dataIndex: 'updateTimeStr',
    },

    {
        title: '操作',
        scopedSlots: 'operation',
        width:160,
        fixed: 'right',
    },
];
// 通用数据字典
const COST_TABLE_LIST_CLOUMN_COMMON_DATA= [
    {
        title: '名称',
        width: 140,
        scopedSlots: 'value3',
    },
    {
        title: '单位',
        width: 100,
        scopedSlots: 'value4',
    },
    {
        title: '默认数值',
        width: 100,
        scopedSlots: 'value5',
    },
    {
        title: '最小值',
        width: 100,
        scopedSlots: 'value5',
    },
    {
        title: '最大值',
        width: 160,
        dataIndex: 'createTime',
    },
    {
        title: '操作',
        scopedSlots: 'operation',
        width:160,
        fixed: 'right',
    },
];
// 一键优化费用项
const COST_TABLE_LIST_CLOUMN_PRICE = [
    {
        title: '编号', 
        width:120,
        dataIndex: 'value1',
    },
    {
        title: '来源',
        width: 180,
        scopedSlots: 'value2',
    },
    {
        title: '项目/费用名称',
        width: 140,
        scopedSlots: 'value3',
    },
    {
        title: '单位',
        width: 100,
        scopedSlots: 'value4',
    },
    {
        title: '单价/元/数值',
        width: 100,
        scopedSlots: 'value5',
    },
    {
        title: '最小值',
        width: 160,
        dataIndex: 'createTime',
    },
    {
        title: '最大值',
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
const TYPE_OPTIONS = [
    {
        label:'通用',
        value: '通用'
    },
    {
        label:'风电',
        value: '风电'
    },
    {
        label:'光伏',
        value: '光伏'
    },
]
export{
    COST_TABLE_LIST_CLOUMN_PRICE,
    COST_TABLE_LIST_CLOUMN_COMMON_DATA,
    COST_TABLE_LIST_CLOUMN_COMMON_PRICE,
    COST_TABLE_LIST_CLOUMN_AUXILIARY_UNIT,
    COST_TABLE_LIST_CLOUMN_OTHER_UNIT,
    COST_TABLE_LIST_CLOUMN_DEVICE_UNIT,
    COST_TABLE_LIST_CLOUMN_PRO_UNIT,
    TYPE_OPTIONS
}