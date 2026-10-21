import {getProvince} from '@/api/modules/base';
import {PACKAGE_TYPE_TT} from '@/assets/js/static'
// 风电——AI测风塔分析表头
const MY_TABLE_LIST_CLOUMN = [
    {
        title: '数据发起下载时间',
        scopedSlots: 'createTime',
        width: 160,
    },
    {
        title: '数据类型',
        dataIndex: 'dataTypeString',
        width: 120,
    },
    {
        title: '经纬度',
        width: 170,
        scopedSlots: 'longitude',
    },
    {
        title: '所属位置',
        width: 200,
        dataIndex: 'address',
    },
    {
        title: '数据处理进度',
        width: 250,
        scopedSlots: 'projectStatus',
    },
    {
        title: '数据名称',
        width: 170,
        scopedSlots: 'fileName',
    },
    {
        title: '操作',
        scopedSlots: 'operation',
        width: 86,
        fixed: 'right',
    },
];
// 风电一键可研表头-我的项目(分散式)
const MY_TABLE_LIST_DISTRIBUTED_CLOUMN = [
    {
        title: '项目编号',
        dataIndex: 'projectCode',
        width: 150,
    },
    {
        title: '项目名称',
        width: 250,
        scopedSlots: 'projectName',
    },
    {
        title: '项目版本',
        width: 100,
        scopedSlots: 'historyCount',
    },
    {
        title: '项目区域',
        width: 200,
        scopedSlots: 'areaCode',
    },
    {
        title: '状态',
        width: 160,
        scopedSlots: 'projectStatus',
    },
    {
        title: '本期容量(MW)',
        width: 180,
        scopedSlots: 'onlyCapacity',
    },
    {
        title: '实际装机MW',
        width: 180,
        scopedSlots: 'installedCapacity',
    },
    {
        title: '机型/台数|MW/台',
        scopedSlots: 'deviceCapacity',
        width: 150,
        selfHeader: 'selfName',
    },
    {
        title: '年上网电量|万kW·h',
        scopedSlots: 'yearPower',
        width: 150,
        selfHeader: 'selfName2',
    },
    {
        title: '等效满负荷h',
        scopedSlots: 'fullLoadHours',
        width: 150,
        selfHeader: 'selfName3',
    },
    {
        title: '综合折减系数%',
        scopedSlots: 'correctionCoefficient',
        width: 150,
        selfHeader: 'selfName4',
    },
    {
        title: '总投资金额(万元)',
        width: 150,
        scopedSlots: 'totalInvestmentAmount',
    },
    {
        title: '项目资金比例(%)',
        width: 150,
        scopedSlots: 'fundingRatio',
    },
    {
        title: '资金本财务内部收益率(%)',
        width: 200,
        scopedSlots: 'internalRateReturnAfterTax',
    },
    {
        title: '项目投资财务内部收益率(%)(所得税前)',
        width: 200,
        scopedSlots: 'internalRateReturnBeforeTax',
    },
    {
        title: '版本说明',
        width: 200,
        scopedSlots: 'version',
    },
    {
        title: '计算完成',
        width: 170,
        scopedSlots: 'reportFinishTime',
    },
    {
        title: '创建时间',
        width: 170,
        scopedSlots: 'createTime',
    },
    {
        title: '操作',
        scopedSlots: 'operation',
        width: 116,
        fixed: 'right',
    },
];
// 风电一键可研表头-草稿（集中式）
const DRAFT_TABLE_LIST_CLOUMN = [
    {
        title: '项目编号',
        width: 200,
        dataIndex: 'projectCode',
    },
    {
        title: '项目名称',
        width: 300,
        scopedSlots: 'projectName',
    },
    // {
    //     title: '项目区域',
    //     width: 250,
    //     scopedSlots: 'areaCode',
    // },
    {
        title: '总容量/本期容量(MW)',
        width: 250,
        scopedSlots: 'capacity',
    },
    {
        title: '创建时间',
        scopedSlots: 'createTime',
    },
    {
        title: '操作',
        scopedSlots: 'operation',
        fixed: 'right',
    },
];
// 风电一键可研表头-草稿（分散式）
const DRAFT_TABLE_LIST_DISTRIBUTED_CLOUMN = [
    {
        title: '项目编号',
        width: 200,
        dataIndex: 'projectCode',
    },
    {
        title: '项目名称',
        width: 300,
        scopedSlots: 'projectName',
    },
    // {
    //     title: '项目区域',
    //     width: 250,
    //     scopedSlots: 'areaCode',
    // },
    {
        title: '本期容量(MW)',
        width: 250,
        scopedSlots: 'onlyCapacity',
    },
    {
        title: '创建时间',
        scopedSlots: 'createTime',
    },
    {
        title: '操作',
        scopedSlots: 'operation',
        fixed: 'right',
    },
];
// 风电AI找风资源表头-草稿
const DRAFT_AUTO_TABLE_LIST_CLOUMN = [
    {
        title: '项目编号',
        width: 200,
        dataIndex: 'projectCode',
        selfHeader: 'selfName',
    },
    {
        title: '项目名称',
        width: 250,
        scopedSlots: 'projectName',
    },
    // {
    //     title: '项目区域',
    //     width: 250,
    //     scopedSlots: 'areaCode',
    // },
    {
        title: '规划容量MW',
        width: 200,
        scopedSlots: 'capacity',
    },
    {
        title: '创建时间',
        scopedSlots: 'createTime',
    },
    {
        title: '操作',
        scopedSlots: 'operation',
        fixed: 'right',
    },
];
// 风电一键可研表头-历史版本(集中式)
const HISTORY_TABLE_LIST_CLOUMN = [
    {
        title: '项目编号',
        width: 150,
        dataIndex: 'projectCode',
    },
    {
        title: '项目名称',
        width: 250,
        dataIndex: 'projectName',
    },
    {
        title: '项目区域',
        scopedSlots: 'areaCode',
        width: 180
    },
    {
        title: '状态',
        scopedSlots: 'projectStatus',
        width: 160
    },
    {
        title: '总容量/本期容量(MW)',
        width: 180,
        scopedSlots: 'capacity',
    },
    {
        title: '实际装机MW',
        width: 180,
        scopedSlots: 'installedCapacity',
    },
    {
        title: '机型/台数|MW/台',
        scopedSlots: 'deviceCapacity',
        width: 150,
        selfHeader: 'deviceCapacity',
    },
    {
        title: '年上网电量|万kW·h',
        scopedSlots: 'yearPower',
        width: 150,
        selfHeader: 'yearPower',
    },
    {
        title: '等效满负荷h',
        scopedSlots: 'fullLoadHours',
        width: 150,
        selfHeader: 'fullLoadHours',
    },
    {
        title: '综合折减系数%',
        scopedSlots: 'correctionCoefficient',
        width: 150,
        selfHeader: 'correctionCoefficient',
    },
    {
        title: '总投资金额(万元)',
        scopedSlots: 'totalInvestmentAmount',
        width: 180
    },
    {
        title: '项目资金比例(%)',
        scopedSlots: 'fundingRatio',
        width: 160,
    },
    {
        title: '资金本财务内部收益率(%)',
        width: 200,
        scopedSlots: 'internalRateReturnAfterTax',
    },
    {
        title: '项目投资财务内部收益率(%)(所得税前)',
        width: 200,
        scopedSlots: 'internalRateReturnBeforeTax',
    },
    {
        title: '版本说明',
        width: 200,
        scopedSlots: 'version',
    },
    {
        title: '创建时间',
        scopedSlots: 'createTime',
        width: 200
    },
    {
        title: '操作',
        scopedSlots: 'operation',
        width: 116,
        fixed: 'right',
    },
];
// 风电一键可研表头-历史版本(分散式)
const HISTORY_TABLE_LIST_DISTRIBUTED_CLOUMN = [
    {
        title: '项目编号',
        width: 150,
        dataIndex: 'projectCode',
    },
    {
        title: '项目名称',
        width: 250,
        dataIndex: 'projectName',
    },
    {
        title: '项目区域',
        scopedSlots: 'areaCode',
        width: 180
    },
    {
        title: '状态',
        scopedSlots: 'projectStatus',
        width: 160
    },
    {
        title: '本期容量(MW)',
        width: 180,
        scopedSlots: 'onlyCapacity',
    },
    {
        title: '实际装机MW',
        width: 180,
        scopedSlots: 'installedCapacity',
    },
    {
        title: '机型/台数|MW/台',
        scopedSlots: 'deviceCapacity',
        width: 150,
        selfHeader: 'deviceCapacity',
    },
    {
        title: '年上网电量|万kW·h',
        scopedSlots: 'yearPower',
        width: 150,
        selfHeader: 'yearPower',
    },
    {
        title: '等效满负荷h',
        scopedSlots: 'fullLoadHours',
        width: 150,
        selfHeader: 'fullLoadHours',
    },
    {
        title: '综合折减系数%',
        scopedSlots: 'correctionCoefficient',
        width: 150,
        selfHeader: 'correctionCoefficient',
    },
    {
        title: '总投资金额(万元)',
        scopedSlots: 'totalInvestmentAmount',
        width: 180
    },
    {
        title: '项目资金比例(%)',
        scopedSlots: 'fundingRatio',
        width: 160,
    },
    {
        title: '资金本财务内部收益率(%)',
        width: 200,
        scopedSlots: 'internalRateReturnAfterTax',
    },
    {
        title: '项目投资财务内部收益率(%)(所得税前)',
        width: 200,
        scopedSlots: 'internalRateReturnBeforeTax',
    },
    {
        title: '版本说明',
        width: 200,
        scopedSlots: 'version',
    },
    {
        title: '创建时间',
        scopedSlots: 'createTime',
        width: 200
    },
    {
        title: '操作',
        scopedSlots: 'operation',
        width: 116,
        fixed: 'right',
    },
];
// 项目状态
const PROJECT_STATUS = [
    {
        label:'排队中',
        value: 2
    },
    {
        label:'计算中',
        value: 3
    },
    {
        label:'计算终止',
        value: 4
    },
    {
        label:'已完成',
        value: 5
    }
]
// 项目类型
const PROJECT_ITEMTYPE = [
    {
        label:'ERA5',
        value: 1
    }, {
        label: '气象精灵数据',
        value: 2
    }
]
// 风电AI找风资源列表表头-我的项目
const MY_AUTO_TABLE_LIST_CLOUMN = [
    {
        title: '项目编号',
        dataIndex: 'projectCode',
        width: 150,
    },
    {
        title: '项目名称',
        width: 200,
        scopedSlots: 'projectName',
    },
    {
        title: '项目版本',
        width: 100,
        scopedSlots: 'historyCount',
    },
    {
        title: '项目区域',
        width: 200,
        scopedSlots: 'areaCode',
    },
    {
        title: '状态',
        width: 160,
        scopedSlots: 'projectStatus',
    },
    {
        title: '规划容量MW',
        width: 180,
        scopedSlots: 'capacity',
    },
    {
        title: '实际装机MW',
        width: 180,
        scopedSlots: 'installedCapacity',
    },
    {
        title: '机型/台数|MW/台',
        scopedSlots: 'deviceCapacity',
        width: 150,
        selfHeader: 'deviceCapacity',
    },
    {
        title: '年上网电量|万kW·h',
        scopedSlots: 'yearPower',
        width: 150,
        selfHeader: 'yearPower',
    },
    {
        title: '等效满负荷h',
        scopedSlots: 'fullLoadHours',
        width: 150,
        selfHeader: 'fullLoadHours',
    },
    {
        title: '综合折减系数%',
        scopedSlots: 'correctionCoefficient',
        width: 150,
        selfHeader: 'correctionCoefficient',
    },
    {
        title: '版本说明',
        width: 200,
        scopedSlots: 'version',
    },
    
    {
        title: '计算完成',
        width: 170,
        scopedSlots: 'reportFinishTime',
    },
    {
        title: '创建时间',
        width: 170,
        scopedSlots: 'createTime',
    },
    {
        title: '操作',
        scopedSlots: 'operation',
        width: 116,
        fixed: 'right',
    },
];
// 风电AI找风资源历史版本列表表头-历史版本
const MY_AUTO_HISTORY_TABLE_LIST_CLOUMN = [
    {
        title: '项目编号',
        dataIndex: 'projectCode',
        width: 150,
    },
    {
        title: '项目名称',
        width: 200,
        scopedSlots: 'projectName',
    },
    {
        title: '项目区域',
        width: 200,
        scopedSlots: 'areaCode',
    },
    {
        title: '状态',
        width: 160,
        scopedSlots: 'projectStatus',
    },
    {
        title: '规划容量MW',
        width: 180,
        scopedSlots: 'capacity',
    },
    {
        title: '实际装机MW',
        width: 180,
        scopedSlots: 'installedCapacity',
    },
    {
        title: '机型/台数|MW/台',
        scopedSlots: 'deviceCapacity',
        width: 150,
        selfHeader: 'deviceCapacity',
    },
    {
        title: '年上网电量|万kW·h',
        scopedSlots: 'yearPower',
        width: 150,
        selfHeader: 'yearPower',
    },
    {
        title: '等效满负荷h',
        scopedSlots: 'fullLoadHours',
        width: 150,
        selfHeader: 'fullLoadHours',
    },
    {
        title: '综合折减系数%',
        scopedSlots: 'correctionCoefficient',
        width: 150,
        selfHeader: 'correctionCoefficient',
    },
    {
        title: '版本说明',
        width: 200,
        scopedSlots: 'version',
    },
    
    {
        title: '计算完成',
        width: 170,
        scopedSlots: 'reportFinishTime',
    },
    {
        title: '创建时间',
        width: 170,
        scopedSlots: 'createTime',
    },
    {
        title: '操作',
        scopedSlots: 'operation',
        width: 116,
        fixed: 'right',
    },
];
// 风电项目建议书列表表头-我的项目
const MY_TABLE_PROPOSAL_LIST_CLOUMN = [
    {
        title: '项目编号',
        dataIndex: 'projectCode',
        width: 150,
    },
    {
        title: '项目名称',
        width: 250,
        scopedSlots: 'projectName',
    },
    {
        title: '项目版本',
        width: 100,
        scopedSlots: 'historyCount',
    },
    {
        title: '项目区域',
        width: 200,
        scopedSlots: 'areaCode',
    },
    {
        title: '状态',
        width: 160,
        scopedSlots: 'projectStatus',
    },
    {
        title: '总容量/本期容量(MW)',
        width: 180,
        scopedSlots: 'capacity',
    },
    {
        title: '单位千瓦静态投资(元/kW)',
        width: 150,
        scopedSlots: 'unitStaticInvestment',
    },
    {
        title: '总投资金额(万元)',
        width: 150,
        scopedSlots: 'totalInvestmentAmount',
    },
    {
        title: '年上网电量|万kW·h',
        scopedSlots: 'yearPower',
        width: 150,
        selfHeader: 'selfName2',
    },
    {
        title: '等效满负荷h',
        scopedSlots: 'fullLoadHours',
        width: 150,
        selfHeader: 'selfName3',
    },
    {
        title: '资金比例(%)',
        width: 150,
        scopedSlots: 'fundingRatio',
    },
    {
        title: '资金本财务内部收益率(%)',
        width: 200,
        scopedSlots: 'internalRateReturnAfterTax',
    },
    {
        title: '项目投资财务内部收益率(%)(所得税前)',
        width: 200,
        scopedSlots: 'internalRateReturnBeforeTax',
    },
    {
        title: '版本说明',
        width: 200,
        scopedSlots: 'version',
    },
    
    {
        title: '计算完成',
        width: 170,
        scopedSlots: 'reportFinishTime',
    },
    {
        title: '创建时间',
        width: 170,
        scopedSlots: 'createTime',
    },
    {
        title: '操作',
        scopedSlots: 'operation',
        width: 116,
        fixed: 'right',
    },
];
// 风电项目建议书表头-草稿
const DRAFT_TABLE_PROPOSAL_LIST_CLOUMN = [
    {
        title: '项目编号',
        width: 200,
        dataIndex: 'projectCode',
    },
    {
        title: '项目名称',
        width: 300,
        scopedSlots: 'projectName',
    },
    // {
    //     title: '项目区域',
    //     width: 250,
    //     scopedSlots: 'areaCode',
    // },
    {
        title: '总容量/本期容量(MW)',
        width: 250,
        scopedSlots: 'capacity',
    },

    {
        title: '创建时间',
        scopedSlots: 'createTime',
    },
    {
        title: '操作',
        scopedSlots: 'operation',
        fixed: 'right',
    },
];
// 风电项目建议书表头-历史版本
const HISTORY_TABLE_PROPOSAL_LIST_CLOUMN = [
    {
        title: '项目编号',
        dataIndex: 'projectCode',
        width: 150,
    },
    {
        title: '项目名称',
        width: 250,
        scopedSlots: 'projectName',
    },
    // {
    //     title: '项目版本',
    //     width: 100,
    //     scopedSlots: 'historyCount',
    // },
    {
        title: '项目区域',
        width: 200,
        scopedSlots: 'areaCode',
    },
    {
        title: '状态',
        width: 160,
        scopedSlots: 'projectStatus',
    },
    {
        title: '总容量/本期容量(MW)',
        width: 180,
        scopedSlots: 'capacity',
    },
    {
        title: '单位千瓦静态投资(元/kW)',
        width: 150,
        scopedSlots: 'unitStaticInvestment',
    },
    {
        title: '总投资金额(万元)',
        width: 150,
        scopedSlots: 'totalInvestmentAmount',
    },
    {
        title: '年上网电量|万kW·h',
        scopedSlots: 'yearPower',
        width: 150,
        selfHeader: 'selfName2',
    },
    {
        title: '等效满负荷h',
        scopedSlots: 'fullLoadHours',
        width: 150,
        selfHeader: 'selfName3',
    },
    {
        title: '资金比例(%)',
        width: 150,
        scopedSlots: 'fundingRatio',
    },
    {
        title: '资金本财务内部收益率(%)',
        width: 200,
        scopedSlots: 'internalRateReturnAfterTax',
    },
    {
        title: '项目投资财务内部收益率(%)(所得税前)',
        width: 200,
        scopedSlots: 'internalRateReturnBeforeTax',
    },
    {
        title: '版本说明',
        width: 200,
        scopedSlots: 'version',
    },
    
    {
        title: '计算完成',
        width: 170,
        scopedSlots: 'reportFinishTime',
    },
    {
        title: '创建时间',
        width: 170,
        scopedSlots: 'createTime',
    },
    {
        title: '操作',
        scopedSlots: 'operation',
        width: 116,
        fixed: 'right',
    },
];
// 获取省市区数据
const getAreaData = async () => {
    let  areaData =[] 
   await getProvince().then(res => {
        if(res.code === 200){
            areaData = res.data
        }else{
            areaData = []
        }
   });
    
    return areaData;
};
// 去掉对象中值为空的属性
const removeEmpty = (obj) => {
    for (var i in obj) {
        if (obj[i] === null || obj[i] === undefined || obj[i] === '') {
            delete obj[i];
        }
    }
    return obj;
};
// 获取项目状态
const getProjectState = (val) => {
    let result = '';
    PROJECT_STATUS.forEach((item) => {
        if (item.value === val) {
            result = item.label;
        }
    });
    return result;
};
// 根据省市区code数组递归查出相对应的省市区名称
const getAreaName =  (codes, regions)=> { 
    if (codes.length === 0 || !codes[0]) {  
      return '--';  
    }
    const firstCode = codes[0];  
    const foundRegion = regions.find((region) => region.regionCode === firstCode);  
    
    if (!foundRegion) {  
     return '' 
    }  
    
    if (codes.length === 1) {  
      return foundRegion.regionName;  
    } else {  
      const childCodes = codes.slice(1);
      const childNames = getAreaName(childCodes, foundRegion.subList);
     return foundRegion.regionName + '/' + childNames;
    }
  }  
const applyConditionalStatus = (item, fields, condition) => {
    fields.forEach((field) => {
        item[field] = condition ? item[field] : '--';
    });
    return item;
};
export { 
    MY_TABLE_LIST_CLOUMN, 
    MY_TABLE_LIST_DISTRIBUTED_CLOUMN,
    DRAFT_TABLE_LIST_CLOUMN,
    DRAFT_TABLE_LIST_DISTRIBUTED_CLOUMN, 
    HISTORY_TABLE_LIST_CLOUMN,
    HISTORY_TABLE_LIST_DISTRIBUTED_CLOUMN,
    getAreaData,
    removeEmpty,
    getProjectState,
    getAreaName,
    PROJECT_STATUS,
    MY_AUTO_TABLE_LIST_CLOUMN,
    DRAFT_AUTO_TABLE_LIST_CLOUMN,
    MY_TABLE_PROPOSAL_LIST_CLOUMN,
    DRAFT_TABLE_PROPOSAL_LIST_CLOUMN,
    HISTORY_TABLE_PROPOSAL_LIST_CLOUMN,
    applyConditionalStatus,
    MY_AUTO_HISTORY_TABLE_LIST_CLOUMN,
    PROJECT_ITEMTYPE,
};
