import { ossClientInfo } from '@/assets/js/static';
// 风电定额表头
const WIND_BUDGET_HEADER = [
    {
        title: '定额目录',
        dataIndex: 'quotaCatalog',
    },
    {
        title: '年份',
        dataIndex: 'year',
    },

    {
        title: '操作',
        scopedSlots: 'operation',
        width: 160,
        fixed: 'right',
    },
];
// 取费管理表头
const FEE_MANAGEMENT_HEADER = [
    {
        title: '取费列表',
        dataIndex: 'feeVersion',
    },
    {
        title: '年份',
        dataIndex: 'year',
    },
    {
        title: '操作',
        scopedSlots: 'operation',
        width: 160,
        fixed: 'right',
    },
];
// 取费管理-取费详情
const FEE_MANAGEMENT_LIST = [
    {
        title: '名称',
        dataIndex: 'feeDataName',
    },
    {
        title: '人工系数',
        dataIndex: 'manualFactor',
    },
    {
        title: '材料系数',
        dataIndex: 'materialFactor',
    },
    {
        title: '机械系数',
        dataIndex: 'machineryFactor',
    },
];
// 全国材料单价库
const NATION_MATERUAL_PRICE = [
    {
        title: '平台编码',
        dataIndex: 'unitPriceCode',
    },
    {
        title: '名称',
        dataIndex: 'unitPriceName',
    },
    {
        title: '型号',
        dataIndex: 'model',
    },
    {
        title: '单位',
        dataIndex: 'unit',
    },
    {
        title: '单价（元）',
        dataIndex: 'unitPrice',
    },
    {
        title: '操作',
        scopedSlots: 'operationBtn',
    },
];
// 取费管理-取费详情
const FEE_MANAGEMENT_DETAIL = [
    {
        title: '编号',
        dataIndex: 'detailCode',
        width: 100
    },
    {
        title: '名称',
        dataIndex: 'detailName',
    },
    {
        title: '计算基数',
        dataIndex: 'manualFactor',
    },
    {
        title: '费率',
        dataIndex: 'rate',
    },
];
// 人员定额表头
const PERSON_PRICE_TABLE_HEADER = [
    {
        title: '备注',
        dataIndex: 'remarks',
    },
];
// 其他相同的备注
const OTHER_SOURCE_HEADER = [
    {
        title: '数据来源',
        dataIndex: 'scopeMethod',
    },
];
//  通用型号
const COMMON_PRICE_HEADER = [
    {
        title: '型号',
        dataIndex: 'model',
    },
];
// 机械类别
const MECHANICAL_PRICE_HEADER = [
    {
        title: '类别',
        dataIndex: 'category',
    },
];
// 操作按钮
const OPERATION_HEADER = [
    {
        title: '操作',
        scopedSlots: 'operationBtn',
    },
];
// 通用表头
const GENERAL_TABLE_HEADER = [
    {
        title: '编码',
        dataIndex: 'unitPriceCode',
    },
    {
        title: '名称',
        dataIndex: 'unitPriceName',
    },
    {
        title: '单位',
        dataIndex: 'unit',
    },
    {
        title: '数量',
        dataIndex: 'quantity',
    },
    {
        title: '单价（元）',
        dataIndex: 'unitPrice',
    },
];
// 清单信息表头
const INV_LISTHEADER = [
    {
        title: '编号',
        dataIndex: 'unitPriceCode',
    },
    {
        title: '名称',
        dataIndex: 'unitPriceName',
    },
    {
        title: '费用类型',
        dataIndex: 'priceTypeName',
    },
    {
        title: '型号',
        dataIndex: 'model',
    },
    {
        title: '单位',
        dataIndex: 'unit',
    },
    {
        title: '单价(元)',
        dataIndex: 'quotaUnitPrice',
    },
    {
        title: '数量',
        dataIndex: 'quantity',
    },
    {
        title: '小计（元）',
        dataIndex: 'subtotal',
    },
];
// 单价基本信息
const PRICE_BASE_INFO = [
    // format: (v) => Number(v).toFixed(2)
    { label: '费用编码', field: 'unitPriceCode', span: 1 },
    { label: '费用名称', field: 'unitPriceName', span: 1 },
    { label: '计量单位', field: 'unit', span: 1 },
    { label: '型号', field: 'model', span: 1 },
    {
        label: '类别',
        field: 'category',
        span: 1,
    },
    {
        label: '数量',
        field: 'quantity',
        span: 1,
    },
    {
        label: '一类费用（元）',
        field: 'firstTotal',
        span: 1,
    },
    {
        label: '二类费用（元）',
        field: 'secondTotal',
        span: 1,
    },
    {
        label: '单价',
        field: 'unitPrice',
        span: 1,
    },
    {
        label: '备注',
        field: 'remarks',
        span: 3,
    },
    {
        label: '来源',
        field: 'scopeMethod',
        span: 3,
    },
];
// 清单信息表头
const QUOTA_LIST_HEADER = [
    {
        title: '编号',
        dataIndex: 'unitPriceCode',
    },
    {
        title: '名称',
        dataIndex: 'unitPriceName',
    },
    {
        title: '费用类型',
        dataIndex: 'priceType',
    },
    {
        title: '型号',
        dataIndex: 'model',
    },
    {
        title: '单位',
        dataIndex: 'unit',
    },
    {
        title: '单价(元)',
        dataIndex: 'quotaUnitPrice',
    },
    {
        title: '数量',
        dataIndex: 'quantity',
    },
    {
        title: '小计（元）',
        dataIndex: 'subtotal',
    },
];
//  定额基本信息
const QUOTA_BASE_INFO = [
    { label: '定额编号', field: 'quotaCode', span: 3 },
    { label: '定额名称', field: 'quotaName', span: 3 },
    { label: '计量单位', field: 'unit', span: 3 },
    { label: '计量数量', field: 'quantity', format: (v) => Number(v).toFixed(1), span: 3 },
    {
        label: '适用范围',
        field: 'scopeMethod',
        isLongText: false, // 长文本
        placeholder: '--', // 占位符
        span: 3,
    },
    {
        label: '工作内容',
        field: 'workContent',
        isLongText: false,
        placeholder: '--',
        span: 3,
    },
    {
        label: '备注',
        field: 'remarks',
        isLongText: false,
        placeholder: '无',
        span: 3,
    },
];
// 定额详细列表
const QUOTA_DETAIL_CLOUMN = [
    {
        title: '定额编码',
        dataIndex: 'quotaCode',
    },
    {
        title: '定额名称',
        dataIndex: 'quotaName',
    },
    {
        title: '计量单位',
        dataIndex: 'unit',
    },
    {
        title: '计量数量',
        dataIndex: 'quantity',
    },
    {
        title: '操作',
        scopedSlots: 'operation',
        width: 160,
        fixed: 'right',
    },
];
// 模版链接
const TEMPLATE_LINK = {
    wind: {
        price: `https://whln-prod-public.${ossClientInfo.endPointShort}/template/%E5%9F%BA%E7%A1%80%E5%8D%95%E4%BB%B7%E5%AF%BC%E5%85%A5%E6%A8%A1%E6%9D%BF.xlsx`,
        quota: `https://whln-prod-public.${ossClientInfo.endPointShort}/template/%E5%AE%9A%E9%A2%9D%E5%AF%BC%E5%85%A5%E6%A8%A1%E6%9D%BF.xlsx`,
    },
};
/**
 * 预处理树形数据，构建id到节点的映射（优化查询性能）
 * @param {Array} treeData - 原始树形数据
 * @returns {Map} - key为节点id，value为节点对象的Map
 */
const buildNodeMap = (treeData) => {
    const nodeMap = new Map();
    // 递归遍历所有节点，存入Map
    function traverse(nodes) {
        if (!nodes || !Array.isArray(nodes)) return;
        for (const node of nodes) {
            nodeMap.set(node.id, node);
            traverse(node.children);
        }
    }
    traverse(treeData);
    return nodeMap;
};

/**
 * 根据选中的id和预处理的nodeMap，快速获取所有父级层级关系
 * @param {Map} nodeMap - 预处理的id→节点映射
 * @param {number} selectedId - 选中的节点id
 * @returns {Array} - 从根节点到选中节点的父级数组（按层级从高到低）
 */
const getParentHierarchyOptimized = (nodeMap, selectedId) => {
    const hierarchy = [];
    let currentNode = nodeMap.get(selectedId);

    if (!currentNode) return hierarchy;
    while (currentNode) {
        hierarchy.unshift({
            ...currentNode,
        });
        currentNode = currentNode.parentId !== null ? nodeMap.get(currentNode.parentId) : null;
    }

    return hierarchy;
};
// 单位
const UNIT_OPTIONS = [
    { label: 'm', value: 'm' },
    { label: 'm²', value: 'm²' },
    { label: 'm³', value: 'm³' },
    { label: '台班', value: '台班' },
    { label: '台', value: '台' },
    { label: '工日', value: '工日' },
    { label: '工时', value: '工时' },
    { label: 't', value: 't' },
    { label: 'kg', value: 'kg' },
    { label: 'kWh', value: 'kWh' },
    { label: '件', value: '件' },
    { label: '副', value: '副' },
    { label: '张', value: '张' },
    { label: '元', value: '元' },
    {
        label: '100m', value: '100m'
    }
];

// 新增人工单价
const LABOR_UNIT_PRICE = [
    {
        title: '编号',
        dataIndex: 'unitPriceCode',
        placeholder: '请输入编号',
        isdisabled: true,
        required: false,
        formTypes: 'input',
        width: 120,
    },

    {
        title: '名称',
        dataIndex: 'unitPriceName',
        placeholder: '请输入名称',
        required: true,
        maxlength: 50,
        formTypes: 'input',
        width: 120,
    },
    {
        title: '单位',
        dataIndex: 'unit',
        placeholder: '请选择单位',
        required: true,
        formTypes: 'select',
        options: [...UNIT_OPTIONS],
        width: 120,
    },
    {
        title: '单价（元）',
        dataIndex: 'unitPrice',
        placeholder: '请输入单价',
        required: true,
        formTypes: 'inputNumber',
        precision: 3,
        min: 0,
        width: 120,
    },
];
// 材料单价
const MATERIALS_UNIT_PRICE = [
    {
        title: '编号',
        dataIndex: 'unitPriceCode',
        placeholder: '请输入编号',
        required: false,
        isdisabled: true,
        formTypes: 'input',
        width: 120,
    },

    {
        title: '名称',
        dataIndex: 'unitPriceName',
        placeholder: '请输入名称',
        required: true,
        maxlength: 50,
        formTypes: 'input',
        width: 120,
    },
    {
        title: '型号',
        dataIndex: 'model',
        placeholder: '请输入型号',
        required: false,
        formTypes: 'input',
        width: 120,
    },
    {
        title: '单位',
        dataIndex: 'unit',
        placeholder: '请选择单位',
        required: true,
        formTypes: 'select',
        options: [...UNIT_OPTIONS],
        width: 120,
    },
    {
        title: '单价（元）',
        dataIndex: 'unitPrice',
        placeholder: '请输入单价',
        required: true,
        formTypes: 'inputNumber',
        precision: 3,
        min: 0,
        width: 120,
    },
];
// 编号的options
const ADD_CODE_OPTIONS = [
    {
        label: '自动生成',
        value: 1,
    },
    {
        label: '手动填写',
        value: 2,
    },
];
// 编辑是表单-人工单价
const EDIT_LABOR_UNIT_PRICE = [
    {
        type: 'a-input',
        name: '名称',
        dataIndex: 'unitPriceName',
        placeholder: '请输入名称',
        rules: [{ required: true, message: '请输入名称', trigger: 'blur' }],
    },
    {
        type: 'a-select',
        name: '计量单位',
        dataIndex: 'unit',
        options: [...UNIT_OPTIONS],
        placeholder: '请选择计量单位',
        rules: [{ required: true, message: '请选择计量单位', trigger: 'blur' }],
    },
    {
        type: 'a-input-number',
        name: '单价',
        dataIndex: 'unitPrice',
        min: 0,
        precision: 3,
        placeholder: '请输入单价',
        rules: [{ required: true, message: '请输入单价', trigger: 'blur' }],
    },
];
// 编辑是表单-材料单价
const EDIT_MATERIAL_UNIT_PRICE = [
    {
        type: 'a-input',
        name: '名称',
        dataIndex: 'unitPriceName',
        placeholder: '请输入名称',
        rules: [{ required: true, message: '请输入名称', trigger: 'blur' }],
    },
    {
        type: 'a-input',
        name: '型号',
        dataIndex: 'model',
        placeholder: '请输入型号',
        rules: [{ required: false, message: '请输入型号', trigger: 'blur' }],
    },
    {
        type: 'a-select',
        name: '计量单位',
        dataIndex: 'unit',
        options: [...UNIT_OPTIONS],
        placeholder: '请选择计量单位',
        rules: [{ required: true, message: '请选择计量单位', trigger: 'blur' }],
    },
    {
        type: 'a-input-number',
        name: '单价',
        dataIndex: 'unitPrice',
        min: 0,
        precision: 3,
        placeholder: '请输入单价',
        rules: [{ required: true, message: '请输入单价', trigger: 'blur' }],
    },
];
// 编辑时表单-名称
const EDIT_NAME_FORM = [
    {
        type: 'a-input',
        name: '名称',
        dataIndex: 'title',
        placeholder: '请输入名称',
        rules: [{ required: true, message: '请输入名称', trigger: 'blur' }],
    },
];
// 编辑时全国材料单价
const EDIT_NATIONAL_MATERIAL_FORM = [
    ...EDIT_MATERIAL_UNIT_PRICE,
    {
        type: 'a-input',
        name: '来源',
        dataIndex: 'source',
        placeholder: '请输入来源',
        rules: [{ required: true, message: '请输入来源', trigger: 'blur' }],
    },
];
// 编辑时表单-子类
const ADD_CHILDREN_FORM = [
    {
        type: 'a-input',
        name: '类名称',
        dataIndex: 'className',
        placeholder: '请输入类名称',
        rules: [{ required: true, message: '请输入类名称', trigger: 'blur' }],
    },
];
// 新增定额-清单信息表头
const ADD_QUOTA_LIST_HEADER = [
    {
        title: '名称',
        dataIndex: 'unitPriceName',
        align: 'center',
    },
    {
        title: '型号',
        dataIndex: 'model',
        align: 'center',
    },
    {
        title: '单位',
        dataIndex: 'unit',
        align: 'center',
    },
    {
        title: '单价（元）',
        dataIndex: 'unitPrice',
        align: 'center',
    },
    {
        title: '数量',
        dataIndex: 'quantity',
        placeholder: '请输入数量',
        min: 0,
        precision: 3,
        align: 'center',
    },
    {
        title: '',
        dataIndex: 'operationDelete',
        align: 'center',
    },
];

// 定额详细列表-系数设置
const SETTINGS_TABLE_COLUMN = [
    {
        title: '系数条件',
        dataIndex: 'factorCondition',
        width: 300,
    },
    {
        title: '人工调整系数',
        dataIndex: 'manualAdjustFactor',
    },
    {
        title: '机械调整系数',
        dataIndex: 'machineryAdjustFactor',
    },
    {
        title: '材料调整系数',
        dataIndex: 'materialAdjustFactor',
    },
];
// 概算模版
const TEMPLATE_LIST_HEADER = [
    {
        title: '项目类型',
        scopedSlots: 'projectType',
    },
    {
        title: '项目名称',
        dataIndex: 'projectName',
    },
    {
        title: '使用定额',
        dataIndex: 'quotaCatalog',
    },
    {
        title: '取费标准',
        dataIndex: 'feeVersion',
    },
    {
        title: '标记',
        dataIndex: 'tag',
    },
    {
        title: '更新时间',
        scopedSlots: 'updateTime',
    },
    {
        title: '操作',
        scopedSlots: 'operation',
        width: 160,
        fixed: 'right',
    },
];
// 编辑时表单-模版
const EDIT_TEMPLATE_LIST_FORM = [
    {
        type: 'a-radio-group',
        name: '模板类型',
        dataIndex: 'projectType',
        options: [{ label: '风电', value: 1 }, { label: '光伏', value: 2 }],
        placeholder: '请选择模板类型',
        rules: [{ required: true, message: '请选择模板类型', trigger: 'blur' }],
    },
    {
        type: 'a-input',
        name: '模板名称',
        dataIndex: 'projectName',
        placeholder: '请输入模板名称',
        rules: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
    },
    {
        type: 'a-select',
        name: '定额库',
        dataIndex: 'quotaCatalogId',
        options: [],
        placeholder: '请选择定额库',
        rules: [{ required: true, message: '请选择定额库', trigger: 'blur' }],
    },
    {
        type: 'a-select',
        name: '取费',
        dataIndex: 'feeManageId',
        options: [],
        placeholder: '请选择取费',
        rules: [{ required: true, message: '请选择取费', trigger: 'blur' }],
    },
    {
        type: 'a-input',
        name: '标记',
        dataIndex: 'tag',
        placeholder: '请输入标记',
        rules: [{ required: false, message: '请选择取费', trigger: 'blur' }],
    },
];
// 复制模版
const COPY_TEMPLATE_LIST_FORM = [
    {
        type: 'a-input',
        name: '模板名称',
        dataIndex: 'projectName',
        placeholder: '请输入模板名称',
        rules: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
    },
    {
        type: 'a-input',
        name: '标记',
        dataIndex: 'tag',
        placeholder: '请输入标记',
        rules: [{ required: false, message: '请选择取费', trigger: 'blur' }],
    },
];
// 施工辅助工程---建筑工程 共用
const CONSTRUCTION_AUXILIARY_WORKS = [
    {
        title: '编号',
        dataIndex: 'barrelSeq',
        type: 'text',
    },
    {
        title: '名称',
        dataIndex: 'name',
        placeholder: '请输入名称',
        type: 'input',
    },
    {
        title: '单位',
        dataIndex: 'unit',
        placeholder: '请输入单位',
        type: 'input',
        width: 200,
    },
    {
        title: '数量',
        dataIndex: 'num',
        placeholder: '请输入数量',
        type: 'input',
        width: 200,
    },
    {
        title: '单价/元',
        dataIndex: 'price',
        placeholder: '请输入单价/元',
        type: 'input',
        width: 200,
    },
    {
        title: '合计/万元',
        dataIndex: 'total',
        placeholder: '请输入合计/万元',
        type: 'text',
        width: 200,
    },
    {
        title: '单价编号',
        dataIndex: 'priceNo',
        placeholder: '请输入单价编号',
        type: 'input',
        width: 200,
    },
    {
        title: '定额编号',
        dataIndex: 'code',
        placeholder: '请输入定额编号',
        type: 'input',
        width: 200,
    },
    {
        title: '备注',
        dataIndex: 'remark',
        placeholder: '请输入备注',
        type: 'input',
        width: 200,
    },
    {
        title: '标记',
        dataIndex: 'mark',
        placeholder: '请输入标记',
        type: 'input',
        width: 200,
    },
];
// 设备及安装工程
const EQUIPMENT_AND_INSTALLATION_WORKS = [
    {
        title: '编号',
        dataIndex: 'barrelSeq',
        type: 'text',
    },
    {
        title: '名称',
        dataIndex: 'name',
        placeholder: '请输入名称',
        type: 'input',
    },
    {
        title: '单位',
        dataIndex: 'unit',
        placeholder: '请输入单位',
        type: 'input',
        width: 200,
    },
    {
        title: '数量',
        dataIndex: 'num',
        placeholder: '请输入数量',
        type: 'input',
        width: 200,
    },
    {
        title: '单价/元',
        // dataIndex: 'price',
        // placeholder: '请输入单价/元',
        // type: 'input',
        children: [
            {
                title: '设备费',
                dataIndex: 'num',
                placeholder: '请输入设备费',
                type: 'input',
                width: 200,
            },
            {
                title: '设备费',
                dataIndex: 'num',
                placeholder: '请输入设备费',
                type: 'input',
                width: 200,
            },
            {
                title: '装置性材料费',
                dataIndex: 'num',
                placeholder: '请输入装置性材料费',
                type: 'input',
                width: 200,
            },
            {
                title: '甲供装置性材料费',
                dataIndex: 'num',
                placeholder: '请输入甲供装置性材料费',
                type: 'input',
                width: 200,
            },
            
        ],
    },
    {
        title: '合计/万元',
        children:[
            {
                title: '设备费',
                dataIndex: 'num',
                placeholder: '请输入设备费',
                type: 'input',
                width: 200,
            },
            {
                title: '安装费',
                dataIndex: 'num',
                placeholder: '请输入安装费',
                type: 'input',
                width: 200,
            },
            {
                title: '装置性材料费',
                dataIndex: 'num',
                placeholder: '请输入装置性材料费',
                type: 'input',
                width: 200,
            },
            {
                title: '甲供装置性材料费',
                dataIndex: 'num',
                placeholder: '请输入甲供装置性材料费',
                type: 'input',
                width: 200,
            },
        ]
    },
    {
        title: '合计/万元',
        dataIndex: 'total',
        placeholder: '请输入合计/万元',
        type: 'text',
        width: 200,
    },
    {
        title: '备注',
        dataIndex: 'remark',
        placeholder: '请输入备注',
        type: 'input',
        width: 200,
    },
    {
        title: '标记',
        dataIndex: 'mark',
        placeholder: '请输入标记',
        type: 'input',
        width: 200,
    },
];

// 其他费用
const OTHER_EXPENSES =  [
    {
        title: '编号',
        dataIndex: 'barrelSeq',
        type: 'text',
    },
    {
        title: '工程或费用名称',
        dataIndex: 'name',
        placeholder: '请输入工程或费用名称',
        type: 'input',
    },
    {
        title: '单位',
        dataIndex: 'unit',
        placeholder: '请输入单位',
        type: 'input',
        width: 200,
    },
    {
        title: '计算方式',
        dataIndex: 'num',
        placeholder: '请输入计算方式',
        type: 'input',
        width: 200,
    },
    {
        title: '费率(%)/数量',
        dataIndex: 'price',
        placeholder: '请输入费率(%)/数量',
        type: 'input',
        width: 200,
    },
    {
        title: '计算基数(万元)/单价(元)',
        dataIndex: 'total',
        placeholder: '请输入计算基数(万元)/单价(元)',
        type: 'input',
        width: 200,
    },
    {
        title: '合计/万元',
        dataIndex: 'priceNo',
        placeholder: '请输入合计/万元',
        type: 'text',
        width: 200,
    },
    {
        title: '自动计算',
        dataIndex: 'code1',
        placeholder: '请选择自动计算',
        type: 'checkbox',
        width: 200,
    },
    {
        title: '备注',
        dataIndex: 'remark',
        placeholder: '请输入备注',
        type: 'input',
        width: 200,
    },
    {
        title: '标记',
        dataIndex: 'mark',
        placeholder: '请输入标记',
        type: 'input',
        width: 200,
    },
];

export {
    WIND_BUDGET_HEADER,
    PERSON_PRICE_TABLE_HEADER,
    GENERAL_TABLE_HEADER,
    OTHER_SOURCE_HEADER,
    INV_LISTHEADER,
    QUOTA_DETAIL_CLOUMN,
    MECHANICAL_PRICE_HEADER,
    PRICE_BASE_INFO,
    QUOTA_BASE_INFO,
    TEMPLATE_LINK,
    COMMON_PRICE_HEADER,
    QUOTA_LIST_HEADER,
    buildNodeMap,
    getParentHierarchyOptimized,
    LABOR_UNIT_PRICE,
    MATERIALS_UNIT_PRICE,
    ADD_CODE_OPTIONS,
    UNIT_OPTIONS,
    OPERATION_HEADER,
    EDIT_LABOR_UNIT_PRICE,
    EDIT_MATERIAL_UNIT_PRICE,
    EDIT_NAME_FORM,
    ADD_CHILDREN_FORM,
    ADD_QUOTA_LIST_HEADER,
    SETTINGS_TABLE_COLUMN,
    FEE_MANAGEMENT_HEADER,
    FEE_MANAGEMENT_DETAIL,
    FEE_MANAGEMENT_LIST,
    NATION_MATERUAL_PRICE,
    EDIT_NATIONAL_MATERIAL_FORM,
    TEMPLATE_LIST_HEADER,
    EDIT_TEMPLATE_LIST_FORM,
    COPY_TEMPLATE_LIST_FORM,
    CONSTRUCTION_AUXILIARY_WORKS,
    EQUIPMENT_AND_INSTALLATION_WORKS,
    OTHER_EXPENSES
};
