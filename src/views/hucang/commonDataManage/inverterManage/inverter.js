const INVERTER_TABLE_LIST_CLOUMN= [
    {
        title: '逆变器编号', 
        width:120,
        dataIndex: 'inverterCode',
    },
    {
        title: '逆变器型号',
        width: 120,
        dataIndex: 'model',
    },
    {
        title: '制造商',
        width: 100,
        dataIndex: 'manufacturer',
    },
    {
        title: '设备类型',
        width: 100,
        dataIndex: 'inverterTypeStr',
    },
    {
        title: '设备容量（kW）',
        width: 160,
        dataIndex: 'capacity',
    },
    {
        title: '价格（元/kW）',
        width: 160,
        dataIndex: 'unitPrice',
    },
    {
        title: '设备尺寸（mm）',
        width: 160,
        dataIndex: 'dimensions',
    },
    {
        title: '重量（kg）',
        width: 120,
        dataIndex: 'weight',
    },
    {
        title: '相对湿度',
        width: 100,
        dataIndex: 'relativeHumidity',
    },
    {
        title: '防护等级',
        width: 100,
        dataIndex: 'protectionLevel',
    },
    {
        title: '工作温度范围（℃）',
        width: 170,
        dataIndex: 'operatingTempRange',
    },
    {
        title: '最高工作海拔（m）',
        width: 170,
        dataIndex: 'maxOperatingAltitude',
    },
    {
        title: '工作湿度范围（%）',
        width: 160,
        dataIndex: 'workingHumidityRange',
    },
    {
        title: '冷却方式',
        width: 120,
        dataIndex: 'coolingMethod',
    },
    {
        title: '拓扑',
        width: 80,
        dataIndex: 'topology',
    },
    {
        title: '输入端子',
        width: 150,
        dataIndex: 'inputTerminals',
    },
    {
        title: '输出端子',
        width: 150,
        dataIndex: 'outputTerminals',
    },
    {
        title: '最大效率（%）',
        width: 140,
        dataIndex: 'maxEfficiency',
    },
    {
        title: '中国效率（%）',
        width: 140,
        dataIndex: 'chinaEfficiency',
    },
    {
        title: '最大输入电压（V）',
        width: 180,
        dataIndex: 'maxInputVoltage',
    },
    {
        title: '最小输入电压/启动电压（V）',
        width: 130,
        dataIndex: 'minInputVoltage',
    },
    {
        title: 'MPPT电压范围（V）',
        width: 170,
        dataIndex: 'mpptVoltageRange',
    },
    {
        title: '满载MPPT最大功率跟踪范围(V)',
        width: 160,
        dataIndex: 'fullLoadMpptRange',
    },
    {
        title: '额定输入电压（V）',
        width: 160,
        dataIndex: 'ratedInputVoltage',
    },
    {
        title: '输入端子最大允许电流（A）',
        width: 140,
        dataIndex: 'inputTerminalMaxCurrent',
        selfHeader:'selfName'
    },
    {
        title: 'MPPT数量（个）',
        width: 160,
        dataIndex: 'mpptCount',
    },
    {
        title: '每路MPPT最大输入组串数（个）',
        width: 150,
        dataIndex: 'maxInputSeriesCount',
    },
    {
        title: '最大输入电流（A）',
        width: 160,
        dataIndex: 'maxInputCurrent',
    },
    {
        title: '最大直流短路电流(A)',
        width: 120,
        dataIndex: 'maxDcShortCircuitCurrent',
    },
    {
        title: '额定输出功率（kW）',
        width: 120,
        dataIndex: 'ratedOutputPower',
    },
    {
        title: '最大输出功率（kW）',
        width: 120,
        dataIndex: 'maxOutputPower',
    },  
    {
        title: '额定输出电压（V）',
        width: 120,
        dataIndex: 'ratedOutputVoltage',
    },   
    {
        title: '功率因数',
        width: 120,
        dataIndex: 'powerFactor',
    },   
    {
        title: '输出电压频率（Hz）',
        width: 120,
        dataIndex: 'outputVoltageFrequency',
    },   
    {
        title: '额定输出电流(A)',
        width: 120,
        dataIndex: 'ratedOutputCurrent',
    },   
    {
        title: '最大输出电流(A)',
        width: 120,
        dataIndex: 'maxOutputCurrent',
    },   
    {
        title: '总电流波形畸变率（%）',
        width: 120,
        dataIndex: 'totalHarmonicDistortion',
    },   
    {
        title: '最大视在功率（kW）',
        width: 120,
        dataIndex: 'maxOutputApparentPower',
    },   
    {
        title: '电网电压范围（V））',
        width: 120,
        dataIndex: 'gridVoltageRange',
    },
    {
        title: '电网频率范围（Hz）',
        width: 120,
        dataIndex: 'gridFrequencyRange',
    },
    {
        title: '直流分量（%）',
        width: 120,
        dataIndex: 'dcComponent',
    },
    {
        title: '功率因数可调范围',
        width: 120,
        dataIndex: 'powerFactorAdjustableRange',
    },
    {
        title: '馈电相数/输出端相数',
        width: 120,
        dataIndex: 'feedingPhaseCount',
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
        width:90,
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
// 功率详情表格列
const POWER_DETAIL_TABLE_LIST_CLOUMN = [
    {
        title: '最大效率（%）',
        dataIndex: 'maxEfficiency',
    },
    {
        title: '中国效率（%）',
        // width: 160,
        dataIndex: 'chinaEfficiency',
    },
]
// 输入参数表格列
const INPUT_PARAMETER_TABLE_LIST_CLOUMN = [
    {
        title: '最小输入电压/启动电压（V）',
        // width: 160,
        dataIndex: 'minInputVoltage',
    },
    {
        title: 'MPPT电压范围（MPPT最大功率点跟踪范围）（V）',
        // width: 160,
        dataIndex: 'mpptVoltageRange',
    },
    {
        title: '满载MPPT最大功率点跟踪范围（V）',
        // width: 160,
        dataIndex: 'fullLoadMpptRange',
    },
    {
        title: '最大输入电压（V）',
        // width: 160,
        dataIndex: 'maxInputVoltage',
    },
    {
        title: '额定输入电压（V）',
        // width: 160,
        dataIndex: 'ratedInputVoltage',
    },
    {
        title: '输入端子最大允许电流（A）',
        // width: 160,
        dataIndex: 'inputTerminalMaxCurrent',
    },
    {
        title: 'MPPT数量',
        // width: 160,
        dataIndex: 'mpptCount',
    },
    {
        title: '每路MPPT最大输入组串数（输入路数）',
        // width: 160,
        dataIndex: 'maxInputSeriesCount',
    },
    {
        title: '最大输入电流（A）',
        // width: 160,
        dataIndex: 'maxInputCurrent',
    },
    {
        title: '最大直流短路电流（A）',
        // width: 160,
        dataIndex: 'maxDcShortCircuitCurrent',
    }
]
// 输出参数表格列
const OUTPUT_PARAMETER_TABLE_LIST_CLOUMN = [
    {
        title: '额定输出功率（kW）',
        dataIndex: 'ratedOutputPower',
    },
    {
        title: '最大输出功率（kW）',
        dataIndex: 'maxOutputPower',
    },
    {
        title: '功率因数（%）',
        dataIndex: 'powerFactor',
    },
    {
        title: '输出电压频率（Hz）',
        dataIndex: 'outputVoltageFrequency',
    },
    {
        title: '额定输出电流（A）',
        dataIndex: 'ratedOutputCurrent',
    },
    {
        title: '最大输出电流（A）',
        dataIndex: 'maxOutputCurrent',
    },
    {
        title: '最大输出实载功率（kW）',
        dataIndex: 'maxOutputPower',
    },
    {
        title: '电网电压范围（V）',
        dataIndex: 'gridVoltageRange',
    },
    {
        title: '电网频率范围（Hz）',
        dataIndex: 'gridFrequencyRange',
    },
    {
        title: '直流分量（%）',
        dataIndex: 'dcComponent',
    },
    {
        title: '功率因数可调范围',
        dataIndex: 'powerFactorAdjustableRange',
    },
    {
        title: '馈电相数/输出端相数',
        dataIndex: 'feedingPhaseCount',
    },
    {
        title: '总电流波形畸变率（%）',
        dataIndex: 'totalHarmonicDistortion',
    }
]
const GENERAL_TABLE_LIST_CLOUMN = [
    {
        title: '设备尺寸（mm）',
        dataIndex: 'dimensions',
    },
    {
        title: '重量（kg）',
        dataIndex: 'weight',
    },
    {
        title: '工作温度范围（℃）',
        dataIndex: 'operatingTempRange',
    },
    {
        title: '防护等级',
        dataIndex: 'protectionLevel',
    },
    {
        title: '最高工作海拔（m）',
        dataIndex: 'maxOperatingAltitude',
    },
    {
        title: '工作湿度范围（%）',
        dataIndex: 'workingHumidityRange',
    },
    {
        title: '冷却方式',
        dataIndex: 'coolingMethod',
    },
    {
        title: '相对湿度',
        dataIndex: 'relativeHumidity',
    },
    {
        title: '拓扑',
        dataIndex: 'topology',
    },
    {
        title: '输入端子',
        dataIndex: 'inputTerminals',
    },
    {
        title: '输出端子',
        dataIndex: 'outputTerminals',
    },
]
// 设备类型
const EQUIPMENT_TYPE_OPTIONS= [
    {
        label:'组串式',
        value: 1
    },

    {
        label:'集中式',
        value: 2
    },
]

export {
    INVERTER_TABLE_LIST_CLOUMN,
    POWER_DETAIL_TABLE_LIST_CLOUMN,
    INPUT_PARAMETER_TABLE_LIST_CLOUMN,
    OUTPUT_PARAMETER_TABLE_LIST_CLOUMN,
    GENERAL_TABLE_LIST_CLOUMN,
    PROJECT_DETAIL_LOG,
    EQUIPMENT_TYPE_OPTIONS
}