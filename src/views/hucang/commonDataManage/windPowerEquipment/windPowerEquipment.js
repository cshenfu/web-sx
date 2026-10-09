const EQUIPMENT_TABLE_LIST_CLOUMN = [
    {
        title: '设备编号',
        width: 120,
        dataIndex: 'deviceCode',
        selfHeader: 'selfName',
    },
    {
        title: '风机型号/名称',
        width: 180,
        dataIndex: 'deviceModel',
    },
    {
        title: '制造商',
        width: 120,
        dataIndex: 'manufacturer',
    },
    {
        title: '类别(MW)',
        width: 100,
        dataIndex: 'deviceCapacity',
    },
    {
        title: '单价(元/kW)',
        width: 140,
        dataIndex: 'powerUnitPrice',
    },
    {
        title: '风机类型',
        width: 100,
        scopedSlots: 'deviceType',
    },
    {
        title: '认证级别',
        width: 100,
        dataIndex: 'authLevel',
    },
    {
        title: '功率调节类型',
        width: 160,
        dataIndex: 'powerType',
    },
    {
        title: '空气密度(kg/m³)',
        width: 160,
        dataIndex: 'airDensity',
    },
    {
        title: '功率曲线',
        width: 120,
        scopedSlots: 'devicePowerThrustCurveId',
    },
    {
        title: '叶轮直径(m)',
        width: 120,
        dataIndex: 'wheelDiameter',
    },
    {
        title: '轮毂高度(m)',
        width: 120,
        dataIndex: 'lowestHubHeight',
    },
    {
        title: '切入风速(m/s)',
        width: 130,
        dataIndex: 'cutInWindSpeed',
    },
    {
        title: '额定风速(m/s)',
        width: 130,
        dataIndex: 'ratedWindSpeed',
    },
    {
        title: '切出风速(m/s)',
        width: 130,
        dataIndex: 'cutoutWindSpeed',
    },
    {
        title: '安全风速(m/s)',
        width: 130,
        dataIndex: 'safeWindSpeed',
    },
    {
        title: '生存环境温度(°C)',
        width: 160,
        scopedSlots: 'maxLiveEnvTemperature',
    },
    {
        title: '运行环境温度(°C)',
        width: 160,
        scopedSlots: 'maxOperateTemperature',
    },
    // {
    //     title: '发电机型式',
    //     width: 120,
    //     dataIndex: 'deviceType',
    // },
    {
        title: '额定功率(kW)',
        width: 140,
        dataIndex: 'ratedPower',
    },
    {
        title: '额定电压(V)',
        width: 120,
        dataIndex: 'ratedVoltage',
    },
    {
        title: '额定频率(Hz)',
        width: 130,
        dataIndex: 'ratedFrequency',
    },
    // {
    //     title: '叶片+轮毂(kg)',
    //     width: 160,
    //     dataIndex: 'value12',
    // },
    // {
    //     title: '机舱重量(kg)',
    //     width: 120,
    //     dataIndex: 'value12',
    // },
    {
        title: '塔筒参数',
        width: 120,
        scopedSlots: 'deviceTowerBarrelId',
    },
    {
        title: '塔架底部荷载标准值',
        width: 120,
        scopedSlots: 'deviceTowerBottomLoadId',
    },

    {
        title: '创建时间',
        width: 160,
        scopedSlots: 'createTime',
    },
    {
        title: '操作',
        scopedSlots: 'operation',
        width: 120,
        fixed: 'right',
    },
];
const IMPELLER_INFORMATION_TABLE_LIST_CLOUMN = [
    {
        title: '叶片长度(m)',
        // width: 160,
        dataIndex: 'bladeLength',
    },
    {
        title: '叶轮直径(m)',
        // width: 160,
        dataIndex: 'wheelDiameter',
    },
    {
        title: '轮毂高度(m)',
        // width: 160,
        dataIndex: 'hubHeight',
    },
    {
        title: '切入风速(m/s)',
        // width: 160,
        dataIndex: 'cutInWindSpeed',
    },
    {
        title: '额定风速(m/s)',
        // width: 160,
        dataIndex: 'ratedWindSpeed',
    },
    {
        title: '切出风速(m/s)',
        // width: 160,
        dataIndex: 'cutoutWindSpeed',
    },
    {
        title: '安全风速(m/s)',
        // width: 160,
        dataIndex: 'safeWindSpeed',
    },
];
const GENERATOR_INFORMATION_TABLE_LIST_CLOUMN = [
    // {
    //     title: '发电机型式',
    //     dataIndex: 'deviceModel',
    // },
    {
        title: '额定功率(kW)',
        dataIndex: 'ratedPower',
    },
    {
        title: '额定电压(V)',
        dataIndex: 'ratedVoltage',
    },
    {
        title: '额定频率(Hz)',
        dataIndex: 'ratedFrequency',
    },
];
const TEMPERATURE_TABLE_LIST_CLOUMN = [
    {
        title: '生存环境温度(°C)',
        scopedSlots: 'maxLiveEnvTemperature',
        width: 160,
    },
    {
        title: '运行环境温度(°C)',
        scopedSlots: 'maxOperateTemperature',
    },
];
const WEIGHT_INFORMATION_TABLE_LIST_CLOUMN = [
    {
        title: '叶片+轮毂(kg)',
        dataIndex: 'value1',
    },
    {
        title: '机舱重量(kg)',
        dataIndex: 'value1',
    },
];
const TOWER_INFORMATION_TABLE_LIST_CLOUMN = [
    {
        title: '部件',
        scopedSlots: 'barrelSeq',
    },
    {
        title: '重量(kg)',
        dataIndex: 'weight',
    },
    {
        title: '塔筒材料',
        dataIndex: 'material',
    },
    {
        title: '塔筒壁厚度（mm）',
        dataIndex: 'tmm',
    },
    {
        title: '塔筒高度(m)',
        dataIndex: 'barrelHeight',
    },
    {
        title: '中心位置(m)',
        dataIndex: 'centerPosition',
    },
    {
        title: '底外径(m)',
        dataIndex: 'dxMm',
    },
    // {
    //     title: '重心处外径(m)',
    //     dataIndex: 'outsideDiameter',
    // },
    // {
    //     title: '重心处内径(m)',
    //     dataIndex: 'insideDiameter',
    // },
    {
        title: '顶外径(m)',
        dataIndex: 'dsMm',
    },
];
const PROJECT_DETAIL_LOG = [
    {
        title: '操作时间',
        dataIndex: 'handleTime',
    },
    {
        title: '操作人',
        dataIndex: 'handleUser',
    },
    {
        title: '操作类型',
        dataIndex: 'handleType',
    },
    {
        title: '操作内容',
        dataIndex: 'handleCont',
    },
    {
        title: '备注',
        dataIndex: 'remark',
    },
    {
        title: '附件',
        scopedSlots: 'attachments',
    },
];
// 用户风机数据
const USER_EQUIPMENT_TABLE_LIST_CLOUMN = [
    {
        title: '所属账号',
        width: 120,
        dataIndex: 'userName',
    },
];
// 功率调节
const POWER_REGULATION = [
    {
        label: '变桨',
        value: 1,
    },
    {
        label: '变速变桨',
        value: 2,
    },
];
const WIND_DEVICE_TABLE_LIST_CLOUMN = [
    {
        title: '编号',
        width: 120,
        dataIndex: 'deviceCode',
        selfHeader: 'selfName',
    },
    {
        title: '型号名称',
        width: 180,
        dataIndex: 'deviceModel',
    },
    {
        title: '制造厂家',
        width: 120,
        dataIndex: 'manufacturer',
    },
    {
        title: '容量(MW)',
        width: 100,
        dataIndex: 'deviceCapacity',
    },
    {
        title: '额定功率(kW)',
        width: 140,
        dataIndex: 'ratedPower',
    },
    {
        title: '叶轮直径(m)',
        width: 120,
        dataIndex: 'wheelDiameter',
    },
    {
        title: 'IEC等级',
        width: 120,
        dataIndex: 'authLevel',
    },
    {
        title: '功率曲线',
        width: 120,
        scopedSlots: 'devicePowerThrustCurveId', // 自定义的，后端未返
    },
    {
        title: '推力系数',
        width: 100,
        scopedSlots: 'thrustCoeffcicent', // 自定义的，后端未返
    },
    {
        title: '发电机类型',
        width: 120,
        dataIndex: 'powerType',
    },
    {
        title: '额定电压(V)',
        width: 120,
        dataIndex: 'ratedVoltage',
    },
    {
        title: '额定频率(Hz)',
        width: 130,
        dataIndex: 'ratedFrequency',
    },
    {
        title: '塔架荷载',
        width: 120,
        scopedSlots: 'towerLoadStatus',
    },
    {
        title: '塔筒重量',
        width: 120,
        scopedSlots: 'towerWeightStatus',
    },

    {
        title: '操作',
        scopedSlots: 'operation',
        width: 120,
        fixed: 'right',
    },
];
// 发电机类型
const GETDEVICETYPE = {
    1: '直驱',
    2: '双馈',
    3: '中速永磁',
};
// 发电机类型
const GENERATOR_TYPE = [
    {
        label: '直驱',
        value: 1,
    },
    {
        label: '双馈',
        value: 2,
    },
    {
        label: '中速永磁',
        value: 3,
    },
    {
        label: '半直驱',
        value: 4,
    },
];
// 塔筒材料
const TOWER_MATERIAL = [
    {
        label: 'Q355',
        value: 'Q355',
    },
    {
        label: 'C80',
        value: 'C80',
    },
];
// 动态校验规则的字段数组
const REQUIRED_FIELDS = [
    {
        filed: 'material',
        type: 'select',
    },
    {
        filed: 'tmm',
        type: 'input',
    },
];
// 新增风机重量
const WIND_WEIGHT = [
    {
        title: '节数',
        dataIndex: 'barrelSeq',
        width: 130,
        required: false,
        formTypes: 'fixedName',
    },
    {
        title: '重量(kg)',
        dataIndex: 'weight',
        placeholderRequired: '请输入重量(kg)',
        placeholder: '系统自动计算',
        required: false,
        formTypes: 'input',
        width: 160,
    },
    {
        title: '塔筒材料',
        dataIndex: 'material',
        placeholder: '请选择塔筒材料',
        required: false,
        formTypes: 'select',
        options: [...TOWER_MATERIAL],
        width: 170,
    },
    {
        title: '塔筒壁厚度（mm）',
        dataIndex: 'tmm',
        placeholder: '请输入塔筒壁厚度',
        required: true,
        formTypes: 'input',
        width: 200,
    },
    {
        title: '塔筒高度(m)',
        dataIndex: 'barrelHeight',
        placeholder: '请输入塔筒高度(m)',
        required: true,
        formTypes: 'input',
        width: 200,
    },
    {
        title: '中心位置(m)',
        dataIndex: 'centerPosition',
        placeholder: '请输入中心位置(m)',
        required: true,
        formTypes: 'input',
        width: 200,
    },
    {
        title: '底外径(m)',
        dataIndex: 'dxMm',
        placeholder: '请输入重心处外径(m)',
        required: true,
        formTypes: 'input',
        width: 200,
    },
    {
        title: '顶外径(m)',
        dataIndex: 'dsMm',
        placeholder: '请输入重心处内径(m)',
        required: true,
        formTypes: 'input',
        width: 200,
    },
];
// 新增塔筒荷载
const LOAD_COLUMN = [
    {
        title: '荷载类型',
        dataIndex: 'towerLoadType',
        width: 200,
        formTypes: 'fixedName',
        required: false,
    },
    {
        title: 'Fx或Fr(kN)',
        dataIndex: 'fxFr',
        width: 200,
        placeholder: '请输入Fx或Fr(kN)',
        formTypes: 'input',
        required: true,
    },
    {
        title: 'Fy(kN)',
        dataIndex: 'fy',
        width: 200,
        placeholder: '请输入Fy(kN)',
        formTypes: 'input',
        required: true,
    },
    {
        title: 'Fz(kN)',
        dataIndex: 'fz',
        width: 200,
        placeholder: '请输入Fz(kN)',
        formTypes: 'input',
        required: true,
    },

    {
        title: 'Mx或Mr(kNm)',
        dataIndex: 'mxMr',
        width: 200,
        placeholder: '请输入Mx或Mr(kNm)',
        formTypes: 'input',
        required: true,
    },
    {
        title: 'My(kNm)',
        dataIndex: 'my',
        width: 200,
        placeholder: '请输入My(kNm)',
        formTypes: 'input',
        required: true,
    },
    {
        title: 'Mz(kNm)',
        dataIndex: 'mz',
        width: 200,
        placeholder: '请输入Mz(kNm)',
        formTypes: 'input',
        required: true,
    },
];
// 映射字段
const LOAD_TYPE_MAP = {
    正常运行荷载工况: 1,
    极端荷载工况: 2,
    '疲劳荷载工况（上限）': 5,
    '疲劳荷载工况（下限）': 6,
};
// ICE等级
const ICEOPTIONS = [
    {
        label: 'IEC I',
        value: 'IEC I',
    },
    {
        label: 'IEC II',
        value: 'IEC II',
    },
    {
        label: 'IEC III',
        value: 'IEC III',
    },
    {
        label: 'IEC S',
        value: 'IEC S',
    },
];
export {
    EQUIPMENT_TABLE_LIST_CLOUMN,
    IMPELLER_INFORMATION_TABLE_LIST_CLOUMN,
    GENERATOR_INFORMATION_TABLE_LIST_CLOUMN,
    TEMPERATURE_TABLE_LIST_CLOUMN,
    WEIGHT_INFORMATION_TABLE_LIST_CLOUMN,
    TOWER_INFORMATION_TABLE_LIST_CLOUMN,
    PROJECT_DETAIL_LOG,
    USER_EQUIPMENT_TABLE_LIST_CLOUMN,
    POWER_REGULATION,
    WIND_DEVICE_TABLE_LIST_CLOUMN,
    GETDEVICETYPE,
    GENERATOR_TYPE,
    WIND_WEIGHT,
    LOAD_COLUMN,
    LOAD_TYPE_MAP,
    ICEOPTIONS,
    REQUIRED_FIELDS,
};
