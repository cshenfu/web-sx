const PHOTOVOLTAIC_TABLE_LIST_CLOUMN= [
    {
        title: '组件编号', 
        width:120,
        dataIndex: 'moduleCode',
    },
    {
        title: '组件型号',
        width: 120,
        dataIndex: 'moduleModel',
    },
    {
        title: '制造商',
        width: 100,
        dataIndex: 'manufacturer',
    },
    {
        title: '价格(元/kW)',
        width: 120,
        dataIndex: 'price',
    },
    {
        title: '组件类型',
        width: 100,
        dataIndex: 'componentTypeStr',
    },
    {
        title: '组件结构图',
        width: 120,
        scopedSlots: 'structuralDiagramComponents',
    },
    {
        title: '组件特性曲线图',
        width: 140,
        scopedSlots: 'componentCharacteristicCurveDiagram',
    },
    {
        title: '组件容量 (Wp)',
        width: 100,
        dataIndex: 'capacity',
    },
    {
        title: '组件尺寸（mm）',
        width: 100,
        dataIndex: 'dimensions',
    },
    {
        title: '电池片数量(片)',
        width: 120,
        dataIndex: 'cellCountData',
    },
    {
        title: '组件重量(kg)',
        width: 100,
        dataIndex: 'weight',
    },
    {
        title: '首年功率衰减（%）',
        width: 120,
        dataIndex: 'firstYearDegradation',
    },
    {
        title: '逐年衰减（%）',
        width: 100,
        dataIndex: 'annualDegradation',
    },
    {
        title: '最大功率（Wp）',
        width: 100,
        dataIndex: 'maxPower',
    },
    {
        title: '开路电压 (V)',
        width: 100,
        dataIndex: 'openCircuitVoltage',
    },
    {
        title: '短路电流 (A)',
        width: 100,
        dataIndex: 'shortCircuitCurrent',
    },
    {
        title: '峰值功率电压（V）',
        width: 120,
        dataIndex: 'peakPowerVoltage',
    },
    {
        title: '组件效率（%）',
        width: 100,
        dataIndex: 'efficiency',
    },
    {
        title: '工作温度（℃）',
        width: 100,
        dataIndex: 'operatingTemperature',
    },
    {
        title: '开路电压和短路电流公差（%）',
        width: 190,
        dataIndex: 'voltageCurrentTolerance',
    },
    {
        title: '最大保险丝额定电流（A）',
        width: 170,
        dataIndex: 'maxFuseCurrent',
    },
    {
        title: '最大系统电压（V）',
        width: 120,
        dataIndex: 'maxSystemVoltage',
    },
    {
        title: '安全防护等级',
        width: 120,
        dataIndex: 'safetyProtectionLevel',
    },
    {
        title: '标称工作温度（℃） ',
        width: 120,
        dataIndex: 'nominalWorkingTemperature',
    },
    {
        title: '双面因子（%）',
        width: 100,
        dataIndex: 'bifacialFactor',
    },
    {
        title: '防火等级',
        width: 100,
        dataIndex: 'fireRating',
    },
    {
        title: '短路电流温度系数（%）',
        width: 150,
        dataIndex: 'shortCircuitCurrentTempCoeff',
    },
    {
        title: '开路电压温度系数（%）',
        width: 150,
        dataIndex: 'openCircuitVoltageTempCoeff',
    },
    {
        title: '峰值功率温度系数（%）',
        width: 160,
        dataIndex: 'peakPowerTempCoeff',
    },
    {
        title: '创建时间',
        width: 120,
        dataIndex: 'createTime',
    },
    {
        title: '更新时间',
        width: 120,
        dataIndex: 'updateTime',
    },
    {
        title: '操作',
        scopedSlots: 'operation',
        width: 150,
        fixed: 'right',
    },
]
const PROJECT_DETAIL_LOG = [{
    title: '操作时间',
    dataIndex: 'handleTime'
}, {
    title: '操作人',
    dataIndex: 'handleUser'
}, {
    title: '操作类型',
    dataIndex: 'handleType'
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
// 常规参数
const GENERAL_TABLE_LIST_CLOUMN =  [
    {
        title: '组件尺寸（mm）',
        dataIndex: 'dimensions',
    },
    {
        title: '电池片数量',
        dataIndex: 'cellCountData',
    },
    {
        title: '重量（kg）',
        dataIndex: 'weight',
    },

]
const PERFORMANCE_PARAMETER_TABLE_LIST_CLOUMN =[
    {
        title: '最大功率 (Wp)',
        dataIndex: 'maxPower',
    },
    {
        title: '峰值功率电压 (V)',
        dataIndex: 'peakPowerVoltage',
    },
    {
        title: '峰值功率电流 (A)',
        dataIndex: 'peakPowerCurrent',
    },
    {
        title: '开路电压 (V)',
        dataIndex: 'openCircuitVoltage',
    },
    {
        title: '短路电流 (A)',
        dataIndex: 'shortCircuitCurrent',
    },
    {
        title: '组件效率（%）',
        dataIndex: 'efficiency',
    },
    {
        title: '首年衰减率（%）',
        dataIndex: 'firstYearDegradation',
    },
    {
        title: '逐年衰减（%）',
        dataIndex: 'annualDegradation',
    },
]
const TEMPERATURE_COEFFICIENT_TABLE_LIST_CLOUMN = [
    {
        title: '短路电流温度系数（%）',
        dataIndex: 'shortCircuitCurrentTempCoeff',
    },
    {
        title: '开路电压温度系数（%）',
        dataIndex: 'openCircuitVoltageTempCoeff',
    },
    {
        title: '峰值功率温度系数（%）',
        dataIndex: 'peakPowerTempCoeff',
    },
]
// 工作参数 
const WORKING_CONDITION_TABLE_LIST_CLOUMN = [
    {
        title: '工作温度（℃）',
        dataIndex: 'operatingTemperature',
    },
    {
        title: '开路电压和短路电流公差(%)',
        dataIndex: 'voltageCurrentTolerance',
    },
    {
        title: '最大保险丝额定电流(A)',
        dataIndex: 'maxFuseCurrent',
    },
    {
        title: '安全防护等级',
        dataIndex: 'safetyProtectionLevel',
    },
    {
        title: '最大系统电压（V）',
        dataIndex: 'maxSystemVoltage',
    },
    {
        title: '标称工作温度（℃）',
        dataIndex: 'nominalWorkingTemperature',
    },
    {
        title: '双面因子（%）',
        dataIndex: 'bifacialFactor',
    },
    {
        title: '组件防火等级',
        dataIndex: 'fireRating',
    },
]

export {
    PHOTOVOLTAIC_TABLE_LIST_CLOUMN,
    PERFORMANCE_PARAMETER_TABLE_LIST_CLOUMN,
    GENERAL_TABLE_LIST_CLOUMN,
    TEMPERATURE_COEFFICIENT_TABLE_LIST_CLOUMN,
    WORKING_CONDITION_TABLE_LIST_CLOUMN,
    PROJECT_DETAIL_LOG,
}