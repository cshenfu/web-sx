import {getTempDownloadUrl} from '@/api/modules/public';
import Operation from 'ant-design-vue/es/transfer/operation';
import { values } from 'lodash';
// 风电项目-列表表头
const PROJECT_TABLE_LIST_CLOUMN= [
    {
        title: '计算ID', 
        width:120,
        dataIndex: 'startCalculateSort',
    },
    {
        title: '项目编号', 
        width:120,
        scopedSlots: 'projectCode',
        selfHeader:'selfName'
    },
    {
        title: '项目类型', 
        width: 120,
        dataIndex: 'itemTypeStr',
    },
    {
        title: '客户名称',
        width:160,
        dataIndex: 'companyName',
    },
    {
        title: '项目区域',
        width: 160,
        scopedSlots: 'provinceName',
    },
    {
        title: '项目名称',
        width: 260,
        dataIndex: 'projectName',
    },
    {
        title: '计算节点',
        width: 100,
        scopedSlots: 'projectNode',
    },
    {
        title: '状态',
        width:110,
        scopedSlots: 'projectStatus',
    },
    {
        title: '队列顺序',
        width: 100,
        dataIndex: 'queueIndex',
    },
    {
        title: '原因',
        width:150,
        scopedSlots: 'reason',
    },
    {
        title: '当前已耗时',
        width:110,
        dataIndex: 'currentCostTime',
    },
    {
        title: '累计耗时',
        width:100,
        dataIndex: 'totalCostTime',
    },
    {
        title: '删除状态',
        width:100,
        scopedSlots: 'isDel',
    },
    {
        title: '场区覆盖面积',
        width:146,
        dataIndex: 'coverArea',
    },
    {
        title: '总容量/本期容量(MW)',
        width:146,
        scopedSlots: 'totalProjectCapacity',
    },
    {
        title: '创建时间',
        width:146,
        scopedSlots: 'createTime',
    },
    {
        title: '完成时间',
        width:146,
        scopedSlots: 'finishTime',
    },
    {
        title: '操作',
        scopedSlots: 'operation',
        width:164,
        fixed: 'right',
    },
]
// // 风电项目-列表表头
const PENDING_PROJECT_TABLE_LIST_CLOUMN= [
    {
        title: '项目编号', 
        scopedSlots: 'projectCode',
        selfHeader:'selfName'
    },
    {
        title: '项目类型', 
        dataIndex: 'itemTypeStr',
    },
    {
        title: '客户名称',
        dataIndex: 'companyName',
    },
    {
        title: '项目区域',
        scopedSlots: 'provinceName',
    },
    {
        title: '项目名称',
        dataIndex: 'projectName',
    },
    {
        title: '完成时间',
        scopedSlots: 'finishTime',
    },
    {
        title: '操作',
        scopedSlots: 'operation',
        width:164,
        fixed: 'right',
    },
]
// 风电项目-调整数据表头
const ADJUST_DATA_TABLE_LIST_CLOUMN = [
    {
        title: '标签',
        width:100,
        dataIndex: 'label',
    },
    {
        title: 'X',
        width:100,
        dataIndex: 'x',
    },
    {
        title: 'Y',
        width:100,
        dataIndex: 'y',
    },
    {
        title: 'Z',
        width:100,
        dataIndex: 'z',
    },
    {
        title: '能量密度|(W/m²)',
        width:120,
        dataIndex: 'energyDensity',
        selfHeader:'selfName'
    },
    {
        title: '理论发电量|（MWh/a）',
        dataIndex: 'theoryPower',
        width:120,
        selfHeader:'selfName'
    },
    {
        title: '考虑尾流发电量|（MWh/a）',
        dataIndex: 'powerWithWake',
        width:140,
        selfHeader:'selfName'
    },
    {
        title: '年上网电量|(万kW·h)',
        dataIndex: 'yearPower',
        width:120,
        selfHeader:'selfName'
    },
    {
        title: '满发小时数 | (h)',
        dataIndex: 'fullPowerHours',
        width:120,
        selfHeader:'selfName'
    },
    {
        title: '平均风速|(m/s)',
        dataIndex: 'avgWindSpeed',
        width:120,
        selfHeader:'selfName'
    },
    {
        title: '尾流折减率|（%）',
        dataIndex: 'rateWithWake',
        width:120,
        selfHeader:'selfName'
    },
    {
        title: '空气密度|（kg/m³）',
        width:120,
        dataIndex: 'airDensity',
        selfHeader:'selfName'
    },
]
// 风电项目-调整过程数据表头
const ADJUST_PROCESS_TABLE_LIST_CLOUMN = [
    {
        title: '数据项',
        dataIndex: 'name'
    },
    {
        title: '单位',
        dataIndex: 'unit'
    },
    {
        title: '当前数值',
        dataIndex: 'currentValue'
    },
    {
        title: '调整值',
        scopedSlots: 'adjustValue'
    },
]
//光伏项目-列表表头
const LIGHT_TABLE_LIST_CLOUMN = [
    {
        title: '项目编号', 
        width:120,
        scopedSlots: 'projectCode',
        selfHeader:'selfName'
    },
    {
        title: '项目类型', 
        width: 120,
        dataIndex: 'itemTypeStr',
    },
    {
        title: '客户名称',
        width:160,
        dataIndex: 'companyName',
    },
    {
        title: '项目区域',
        width: 160,
        scopedSlots: 'provinceName',
    },
    {
        title: '项目名称',
        width: 260,
        dataIndex: 'projectName',
    },
    {
        title: '计算节点',
        width: 100,
        scopedSlots: 'projectNode',
    },
    {
        title: '状态',
        width:110,
        scopedSlots: 'projectStatus',
    },
    {
        title: '队列顺序',
        width: 100,
        dataIndex: 'queueIndex',
    },
    {
        title: '原因',
        width:150,
        scopedSlots: 'reason',
    },
    {
        title: '当前已耗时',
        width:110,
        dataIndex: 'currentCostTime',
    },
    {
        title: '累计耗时',
        width:100,
        dataIndex: 'totalCostTime',
    },
    {
        title: '场区半径/km',
        width:146,
        dataIndex: 'coverArea',
    },
    {
        title: '总容量/本期容量(MW)',
        width:146,
        scopedSlots: 'totalProjectCapacity',
    },
    {
        title: '创建时间',
        width:146,
        scopedSlots: 'createTime',
    },
    {
        title: '完成时间',
        width:146,
        scopedSlots: 'finishTime',
    },
    {
        title: '操作',
        scopedSlots: 'operation',
        width:164,
        fixed: 'right',
    },
]
// 调整类型
const ADJUST_TYPE_OPTIONS = [
    {
        label:'统一系数',
        // disabled: true,
        type: 'public',
        value: 1,
    },
    {
        label:'过程数据',
        // disabled:true,
        type: 'public',
        value: 2
    },
    {
        label:'成果数据',
        disabled:false,
        value: 3,
        type: 'auto'
    }
]
// 队列管理列表
const QUEUE_MANAGE_LIST = [
    {
        title: '环境', 
        dataIndex: 'envSelf',
    },
    {
        title: '项目编号', 
        dataIndex: 'projectCode',
    },
    {
        title: '项目ID',
        dataIndex: 'projectId',
    },
    {
        title: '当前状态',
        scopedSlots: 'status',
    },
    {
        title: '任务创建时间',
        dataIndex: 'createTimeSelf',
    },
    {
        title: '操作',
        scopedSlots: 'operation',
        width:164,
        fixed: 'right',
    }

]
// 队列管理状态
const QUEUE_MANAGE_STATUS = [
    {
        label:'已发送',
        value: 1,
        classNames: 'pending-icon'
    },
    {
        label:'排队中',
        value: 2,
        classNames: 'bind-icon'
    },
    {
        label:'已取消',
        value: 3,
        classNames: ''
    }
]
const WINDNODEDATA = [
    {
        label: '中尺度数据获取',
        value: '1',
    },
    {
        label: '百科数据生成',
        value: '2',
    },
    {
        label: '中尺度数据解析',
        value: '3',
    },
    {
        label: '测风塔数据插补订正',
        value: '4',
    },
    {
        label: '地勘报告数据解析',
        value: '5',
    },
    {
        label: '地质数据核对',
        value: '6',
    },
    {
        label: '流场模拟计算',
        value: '7',
    },
    {
        label: '发电量计算',
        value: '8',
    },    
    {
        label: '道路自动设计',
        value: '9',
    },
    {
        label: '线路自动设计',
        value: '10',
    },    
    {
        label: '风机基础智能设计',
        value: '11',
    },
    {
        label: '技术经济智能概算',
        value: '12',
    },
    {
        label: '财务智能评价',
        value: '13',
    },
    {
        label: '测风塔数据分析',
        value: '14',
    },
    {
        label: '文档生成',
        value: '15',
    }
]
const LIGHTNODEDATA = [
    {
        label: '地址数据解析',
        value: '1',
    },
    {
        label: '数据库气候数据解析',
        value: '2',
    },
    {
        label: 'solargis数据解析',
        value: '3',
    },
    {
        label: 'Meteonorm数据解析',
        value: '4',
    },
    {
        label: 'NASA数据解析',
        value: '5',
    },
    {
        label: '发电量计算',
        value: '8',
    },    
    {
        label: '升压站选址',
        value: '9',
    },
    {
        label: '道路线路设计',
        value: '10',
    },    
    {
        label: '土建基础设计',
        value: '11',
    },
    {
        label: '技经智能概算',
        value: '12',
    },
    {
        label: '财务智能评价',
        value: '13',
    },
    {
        label: '文档生成',
        value: '15',
    }
]
// 回显图片接口
const getTowerImg = async (path) => {
    let result =''
    let data = `objectKey=${path}`
    try {
        let res = await getTempDownloadUrl(data)
        if(res.code ===200 && res.data) {
            result = res.data
        }
    } catch (error) {
        console.log('获取图片失败',error);
    }
    return result
}
const FILE_MAP_TYPE= {
    0: {
        'word报告': ['doc', 'docx'],
        'PDF报告': ['pdf'],
    },
    2: ["pdf"],
    3: ['xls', 'xlsx'],
    4: {
        '财务评价xlsx': ['xls', 'xlsx'],
        '财务评价doc': ['doc', 'docx'],
    },
    5: ['doc', 'docx'],
    6: ['pdf'],
};
export{
    PROJECT_TABLE_LIST_CLOUMN,
    getTowerImg,
    ADJUST_DATA_TABLE_LIST_CLOUMN,
    LIGHT_TABLE_LIST_CLOUMN,
    ADJUST_TYPE_OPTIONS,
    ADJUST_PROCESS_TABLE_LIST_CLOUMN,
    PENDING_PROJECT_TABLE_LIST_CLOUMN,
    LIGHTNODEDATA,
    WINDNODEDATA,
    QUEUE_MANAGE_LIST,
    QUEUE_MANAGE_STATUS,
    FILE_MAP_TYPE
}