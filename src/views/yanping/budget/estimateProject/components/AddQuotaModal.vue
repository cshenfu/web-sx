<template>
    <div class="add-qt-content">
        <tips-modal :width="'900px'" :title="title" :tipType="'success'" :okText="'保存'" class="add-qt-modal"
            v-model:openTipsModal="openTipsImportFileModal" @handleChangeFileModal="handleChangeClose">
            <template #contentBody>
                <a-form class="sort-form" ref="formRef" :model="formData" :rules="rules" label-align="left"
                    :labelCol="labelCol">
                    <!-- 基本信息 -->
                    <div class="basic-section">
                        <h4 class="content-title">
                            <img src="@/assets/img/user/detail-title.png" alt="" />
                            基本信息
                        </h4>
                        <a-row :gutter="16">
                            <a-col :span="12">
                                <a-form-item label="定额名称" :name="['basic', 'quotaName']">
                                    <a-input v-model:value="formData.basic.quotaName" placeholder="请输入定额名称" />
                                </a-form-item>
                            </a-col>
                            <a-col :span="12">
                                <a-form-item label="定额编号" :name="['basic', 'quotaCode']">
                                    <a-input v-model:value="formData.basic.quotaCode" placeholder="请输入定额编号" />
                                </a-form-item>
                            </a-col>
                        </a-row>
                        <a-row :gutter="16">
                            <a-col :span="12">
                                <a-form-item label="计量数量" :name="['basic', 'quantity']">
                                    <a-input-number v-model:value="formData.basic.quantity" style="width: 100%"
                                        placeholder="请输入计量数量" :min="0" />
                                </a-form-item>
                            </a-col>
                            <a-col :span="12">
                                <a-form-item label="计量单位" :name="['basic', 'unit']">
                                    <a-row :gutter="16">
                                        <a-col :span="24">
                                            <a-select v-model:value="formData.basic.unit" placeholder="请选择计量单位"
                                                :options="UNIT_OPTIONS"
                                                :getPopupContainer="trigger => trigger.parentNode" />
                                        </a-col>
                                        <!-- <a-col :span="12">
                                            <a-form-item-rest>
                                                <a-input v-model:value="formData.basic.measureUnitMemo"
                                                    placeholder="请输入计量单位说明" />
                                            </a-form-item-rest>
                                        </a-col> -->
                                    </a-row>
                                </a-form-item>
                            </a-col>
                        </a-row>
                        <a-row :gutter="16">
                            <a-col :span="24">
                                <a-form-item label="工作内容" :name="['basic', 'workContent']">
                                    <a-textarea v-model:value="formData.basic.workContent" placeholder="请输入工作内容"
                                        :rows="3" />
                                </a-form-item>
                            </a-col>
                            <a-col :span="24">
                                <a-form-item label="适用范围" :name="['basic', 'scopeMethod']">
                                    <a-textarea v-model:value="formData.basic.scopeMethod" placeholder="请输入适用范围"
                                        :rows="2" />
                                </a-form-item>
                            </a-col>
                        </a-row>

                        <a-row :gutter="16">
                            <a-col :span="24">
                                <a-form-item label="备注" :name="['basic', 'remarks']">
                                    <a-textarea v-model:value="formData.basic.remarks" placeholder="请输入备注" :rows="2" />
                                </a-form-item>
                            </a-col>
                        </a-row>
                    </div>
                    <!-- 清单信息 -->
                    <div class="list-section">
                        <h4 class="content-title">
                            <img src="@/assets/img/user/detail-title.png" alt="" />
                            清单信息
                        </h4>
                        <div class="list-category">
                            <a-form-item label="" :name="['list', 'labor']">
                                <div class="category-header">
                                    <span>人工</span>
                                    <span class="editable-add-btn" @click="handleAddRow('labor')">
                                        <iconpark-icon name="tianjia"></iconpark-icon>
                                        添加行
                                    </span>
                                </div>
                                <a-form-item-rest>
                                    <a-table :data-source="formData.list.labor" :columns="tableColumns" bordered
                                        :pagination="false" v-if="formData.list.labor.length">
                                        <template #bodyCell="{ column, record, index }">
                                            <a-input-number style="width: 130px" :min="column.min"
                                                :precision="column.precision" :disabled="column.isdisabled"
                                                v-if="column.dataIndex === 'quantity'" :placeholder="column.placeholder"
                                                v-model:value="record[column.dataIndex]" />
                                            <template
                                                v-if="column.dataIndex === 'operationDelete' && formData.list.labor.length > 1">
                                                <iconpark-icon v-if="formData.list.labor.length > 1"
                                                    @click="handleDeleteRow('labor', index)" :size="16" class="del-cell"
                                                    name="shanjian"></iconpark-icon>
                                            </template>
                                        </template>
                                    </a-table>
                                </a-form-item-rest>

                            </a-form-item>
                        </div>
                        <!-- 设备材料清单 -->
                        <div class="list-category">
                            <a-form-item label="" :name="['list', 'equipment']">
                                <div class="category-header">
                                    <span>设备材料</span>
                                    <span class="editable-add-btn" @click="handleAddRow('equipment')">
                                        <iconpark-icon name="tianjia"></iconpark-icon>
                                        添加行
                                    </span>
                                </div>
                                <a-form-item-rest>
                                    <a-table :data-source="formData.list.equipment" :columns="tableColumns" bordered
                                        :pagination="false" v-if="formData.list.equipment.length">
                                        <template #bodyCell="{ column, record, index }">
                                            <a-input-number style="width: 130px" :min="column.min"
                                                :precision="column.precision" :disabled="column.isdisabled"
                                                v-if="column.dataIndex === 'quantity'" :placeholder="column.placeholder"
                                                v-model:value="record[column.dataIndex]" />
                                            <template
                                                v-if="column.dataIndex === 'operationDelete' && formData.list.equipment.length > 1">
                                                <iconpark-icon v-if="formData.list.equipment.length > 1"
                                                    @click="handleDeleteRow('equipment', index)" :size="16"
                                                    class="del-cell" name="shanjian"></iconpark-icon>
                                            </template>
                                        </template>
                                    </a-table>
                                </a-form-item-rest>

                            </a-form-item>
                        </div>
                        <!-- 机械清单 -->
                        <div class="list-category">
                            <a-form-item label="" :name="['list', 'mechanical']">
                                <div class="category-header">
                                    <span>机械</span>
                                    <span class="editable-add-btn" @click="handleAddRow('mechanical')">
                                        <iconpark-icon name="tianjia"></iconpark-icon>
                                        添加行
                                    </span>
                                </div>
                                <a-form-item-rest>
                                    <a-table :data-source="formData.list.mechanical" :columns="tableColumns" bordered
                                        :pagination="false" v-if="formData.list.mechanical.length">
                                        <template #bodyCell="{ column, record, index }">
                                            <a-input-number style="width: 130px" :min="column.min"
                                                :precision="column.precision" :disabled="column.isdisabled"
                                                v-if="column.dataIndex === 'quantity'" :placeholder="column.placeholder"
                                                v-model:value="record[column.dataIndex]" />
                                            <template
                                                v-if="column.dataIndex === 'operationDelete' && formData.list.mechanical.length > 1">
                                                <iconpark-icon v-if="formData.list.mechanical.length > 1"
                                                    @click="handleDeleteRow('mechanical', index)" :size="16"
                                                    class="del-cell" name="shanjian"></iconpark-icon>
                                            </template>
                                        </template>
                                    </a-table>
                                </a-form-item-rest>
                            </a-form-item>
                        </div>
                    </div>
                    <!-- 系数设置 -->
                    <div class="coefficient-section">
                        <h4 class="content-title">
                            <img src="@/assets/img/user/detail-title.png" alt="" />
                            系数设置
                        </h4>
                        <div class="radio-group">
                            <a-radio-group v-model:value="formData.coefficient.isSetFactor">
                                <a-radio :value="false">无</a-radio>
                                <a-radio :value="true">设置</a-radio>
                            </a-radio-group>
                        </div>
                        <template v-if="formData.coefficient.isSetFactor">
                            <a-table :data-source="formData.coefficient.quotaFactorReqList" bordered
                                :pagination="false">
                                <a-table-column title="系数条件">
                                    <template #default="{ record, index }">
                                        <a-form-item
                                            :name="['coefficient', 'quotaFactorReqList', index, 'factorCondition']"
                                            :rules="[{ required: true, message: '请输入系数条件' }]">
                                            <a-input v-model:value="record.factorCondition" placeholder="请输入系数条件" />
                                        </a-form-item>
                                    </template>
                                </a-table-column>

                                <a-table-column title="人工调整系数">
                                    <template #default="{ record, index }">
                                        <a-form-item
                                            :name="['coefficient', 'quotaFactorReqList', index, 'manualAdjustFactor']"
                                            :rules="laborRatioRules">
                                            <a-input-number v-model:value="record.manualAdjustFactor" :min="0"
                                                :step="0.1" placeholder="0.0" />
                                        </a-form-item>
                                    </template>
                                </a-table-column>

                                <a-table-column title="机械调整系数">
                                    <template #default="{ record, index }">
                                        <a-form-item
                                            :name="['coefficient', 'quotaFactorReqList', index, 'machineryAdjustFactor']"
                                            :rules="machineRatioRules">
                                            <a-input-number v-model:value="record.machineryAdjustFactor" :min="0"
                                                :step="0.1" placeholder="0.0" />
                                        </a-form-item>
                                    </template>
                                </a-table-column>

                                <a-table-column title="材料调整系数">
                                    <template #default="{ record, index }">
                                        <a-form-item
                                            :name="['coefficient', 'quotaFactorReqList', index, 'materialAdjustFactor']"
                                            :rules="materialRatioRules">
                                            <a-input-number v-model:value="record.materialAdjustFactor" :min="0"
                                                :step="0.1" placeholder="0.0" />
                                        </a-form-item>
                                    </template>
                                </a-table-column>

                                <a-table-column title="" align="center">
                                    <template #default="{ index }">
                                        <iconpark-icon v-if="formData.coefficient.quotaFactorReqList.length > 1"
                                            @click="handleDeleteCoefficientRow(index)" :size="16" class="del-cell"
                                            name="shanjian" />
                                    </template>
                                </a-table-column>
                            </a-table>
                            <div class="category-footer">
                                <span class="editable-add-btn" @click="handleAddCoefficientRow()">
                                    <iconpark-icon name="tianjia"></iconpark-icon>
                                    添加行
                                </span>
                            </div>
                        </template>

                    </div>
                </a-form>
            </template>
        </tips-modal>
        <tips-modal class="add-expense-modal" :width="'980px'" :title="'添加费用项'" :tipType="'success'" :okText="'保存'"
            v-model:openTipsModal="openTipsExpenseModal" @handleChangeFileModal="handleChangeExpenseClose">
            <template #contentBody>
                <div class="expense-content">
                    <div class="expense-content-left">
                        <p class="expense-title">{{ openTipsExpenseTitle }}</p>
                        <div class="content-left">
                            <a-tree class="tree-list-self" showLine v-model:selectedKeys="selectedKeys"
                                :tree-data="treeDataSource" :defaultExpandedKeys="defaultExpandedKeys"
                                @select="onSelect">
                            </a-tree>
                            <div class="expand-item">
                                <a-checkbox-group v-model:value="selectExpenseItem" style="width: 100%">
                                    <a-row>
                                        <a-col :span="24" v-for="(item, index) in expenseItemData">
                                            <a-checkbox :disabled="item.disabled" :value="item.unitPriceCode"
                                                @change="(e) => handleChange(e, item)">
                                                <template v-if="item.model">
                                                    {{ item.model }} /
                                                </template>
                                                {{ item.unitPriceName }}</a-checkbox>
                                        </a-col>
                                    </a-row>
                                </a-checkbox-group>
                            </div>
                        </div>

                    </div>
                    <div class="expense-content-right">
                        <ul class="expense-right-title">
                            <li>已选</li>
                            <li @click="deleteItem(-1)">清空已选</li>
                        </ul>
                        <ul class="select-list">
                            <li v-for="(item, index) in selecctExpenseComplete" :key="index">
                                <span>{{ item.categoryName }}/{{ item.unitPriceName }}</span>
                                <iconpark-icon name="shanchu" size="14" class="upload-shanchu"
                                    @click="deleteItem(index)"></iconpark-icon>
                            </li>
                        </ul>
                    </div>
                </div>
            </template>
        </tips-modal>
    </div>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted } from 'vue';
import TipsModal from '@/components/tipsDialog/TipsModal.vue';
import TreeList from './TreeList.vue';
import { UNIT_OPTIONS, ADD_QUOTA_LIST_HEADER } from '../budget'
import { useRoute } from 'vue-router';
import { message, Upload } from 'ant-design-vue';
import {
    getBasicPriceCategoryTree,
    getBasePriceList
} from '@/api/modules/sourceData/budgetManagement';
const route = useRoute();

const props = defineProps({
    addQuotaFlag: {
        type: Boolean,
        default: false,
    },
    labelCol: {
        type: Object,
        default: () => ({ style: { width: '100px' } }),
    },
    editDataId: {
        type: Object,
        default: () => { },
    }
});
const fieldNames = {
    children: 'children',
    title: 'unitPriceCategoryName',
    key: 'id',
};
const emits = defineEmits(['update:addQuotaFlag', 'getAddQuotaData']);
const openTipsExpenseModal = ref(false) // 添加费用项
const openTipsExpenseTitle = ref('') // 添加费用项
const openTipsExpenseType = ref(null) // 添加费用项类型
const treeDataSource = ref([]) // 费用项树数据
const selectedKeys = ref([]);// 树选中项
const selectedKeysNode = ref(null);// 树选中项的节点信息
const defaultExpandedKeys = ref([]); // 树默认展开项
const selectExpenseItem = ref([])// 选中的费用项
const expenseItemMap = ref(new Map());// 使用Map建立值到完整数据的索引
const selectedItemsMap = reactive(new Map());// 使用 Map 存储选中项
const expenseItemData = ref([]) // 费用项options


// 表单数据
const formData = reactive({
    basic: {
        quotaName: '',   // 定额名称
        quotaCode: '',   // 定额编号
        quantity: null, // 计量数量
        unit: null, // 计量单位
        measureUnitMemo: '',//单位说明
        workContent: '', // 工作内容
        scopeMethod: '',       // 适用范围
        remarks: '',      // 备注
    },
    list: {
        labor: [],      // 人工清单
        equipment: [],  // 设备材料清单
        mechanical: [], // 机械清单
    },
    coefficient: {
        isSetFactor: false, // 'false'：无系数；'true'：自定义系数
        quotaFactorReqList: [
            {
                factorCondition: '',      // 系数条件（输入框）
                manualAdjustFactor: 1.0,   // 人工调整系数（数字框）
                machineryAdjustFactor: 1.0, // 机械调整系数（数字框）
                materialAdjustFactor: 1.0 // 材料调整系数（数字框）
            }
        ]
    }
});

const validateFieldsNumber = (type) => {
    return (rule, value) => {
        const originValue = Object.values(formData.list).flat(Infinity);
        if (!originValue || originValue.length === 0) {
            return Promise.reject(`人工、材料、机械至少添加一行数据`);
        }
        const invalidRow = originValue.find(item => {
            const quantity = item.quantity;
            return (
                quantity === undefined || // 字段不存在
                quantity === null ||      // 字段为 null
                quantity === '' ||        // 字段为空字符串
                isNaN(Number(quantity)) // 字段不是数字
            );
        });
        if (invalidRow) return Promise.reject('每行数量必填');
        return Promise.resolve();
    }
}

const title = ref('新增数据')
const openTipsImportFileModal = ref(props.addQuotaFlag);
const formRef = ref(null);
const tableColumns = reactive([...ADD_QUOTA_LIST_HEADER])



// 系数规则复用
const laborRatioRules = [
    { required: true, message: '人工调整系数必填' },
    { type: 'number', message: '必须为有效数字' },
    { validator: (_, value) => value >= 0 ? Promise.resolve() : Promise.reject('不能为负数') }
];
const machineRatioRules = [
    { required: true, message: '机械调整系数必填' },
    { type: 'number', message: '必须为有效数字' },
    { validator: (_, value) => value >= 0 ? Promise.resolve() : Promise.reject('不能为负数') }
];

const materialRatioRules = [
    { required: true, message: '材料调整系数必填' },
    { type: 'number', message: '必须为有效数字' },
    { validator: (_, value) => value >= 0 ? Promise.resolve() : Promise.reject('不能为负数') }
];
const rules = reactive({
    basic: {
        quotaName: [
            { required: true, message: '请输入定额名称', trigger: 'blur' }
        ],
        quotaCode: [
            { required: true, message: '请输入定额编号', trigger: 'blur' }
        ],
        quantity: [
            { required: true, message: '请输入计量数量', trigger: 'blur' },
            { type: 'number', message: '计量数量必须为数字', trigger: 'blur' }
        ],
        unit: [
            { required: true, message: '请选择计量单位', trigger: 'change' }
        ],
        workContent: [
            { required: true, message: '请输入工作内容', trigger: 'blur' }
        ],
    },
    list: {
        labor: [{
            validator: validateFieldsNumber('人工'),
            trigger: 'change',
        }],
        equipment: [{
            validator: validateFieldsNumber('设备材料'),
            trigger: 'change',
        }],
        mechanical: [{
            validator: validateFieldsNumber('机械'),
            trigger: 'change',
        }]
    }

});
// 校验系数表格数据：每行至少有一个系数不等于1
const validateCoefficients = (quotaFactorReqList) => {
    if (!formData.coefficient.isSetFactor) return true
    return quotaFactorReqList.every(row => {
        return row.manualAdjustFactor !== 1 ||
            row.machineryAdjustFactor !== 1 ||
            row.materialAdjustFactor !== 1;
    });
};

// 提交处理
const handleChangeClose = async (val) => {
    if (val) {
        try {
            // 表单校验
            await formRef.value.validateFields();
            if (!validateCoefficients(formData.coefficient.quotaFactorReqList)) {
                message.error('每行数据必须至少有一个系数（人工、机械或材料）不等于1！');
                return;
            }
            // emits('update:addQuotaFlag', false);
            // 后端处理ID异常，需要前端提交前删除处理
            for (const key in formData['list']) {
                if (Object.hasOwnProperty.call(formData['list'], key)) {
                    const element = formData['list'][key];
                    element.forEach(item => {
                        delete item.id
                        item.unitPriceCategoryName = selectedKeysNode.value?.node?.unitPriceCategoryName || '';
                    });
                }
            }
            emits('getAddQuotaData', formData);
            console.log('表单校验成功', formData);
            // 这里可以添加表单提交逻辑
        } catch (error) {
            console.log('表单校验错误:', error);
        }
    } else {
        emits('update:addQuotaFlag', false);
    }
};
// 添加行（自动填充分类名称）
const handleAddRow = async (category) => {
    openTipsExpenseType.value = category
    if (formData.list[category].length > 0) {
        // Todo编辑需要调用全部树，同时更改选中状态
        formData.list[category].forEach((item) => {
            selectedItemsMap.set(item.unitPriceCode, {
                ...item,
                // category: selectedKeysNode.value?.node?.unitPriceCategoryName || '',
            });
        })
        expenseItemData.value = handleExpenseItemOptions(formData.list[category], formData.list[category])
        selectExpenseItem.value = formData.list[category].map((m) => m.unitPriceCode)
    } else {
        // 弹窗关闭，恢复到默认值
        resetExpenseModalState()
    }
    openTipsExpenseTitle.value = category == 'labor' ? '人工' : category == 'equipment' ? '设备材料' : '机械'
    openTipsExpenseModal.value = true
    await getTreeData(category)
};

// 删除行
const handleDeleteRow = (category, index) => {
    formData.list[category].splice(index, 1);
};
// 添加系数行
const handleAddCoefficientRow = () => {
    formData.coefficient.quotaFactorReqList.push({
        factorCondition: '',
        manualAdjustFactor: 1.0,
        machineryAdjustFactor: 1.0,
        materialAdjustFactor: 1.0,
    })
};

// 删除系数行
const handleDeleteCoefficientRow = (index) => {
    if (formData.coefficient.quotaFactorReqList.length > 1) {
        formData.coefficient.quotaFactorReqList.splice(index, 1);
    } else {
        console.log('至少保留一行系数配置');
    }
};
// 选择费用项弹窗
const handleChangeExpenseClose = (val) => {
    if (val) {
        openTipsExpenseModal.value = false;
        if (openTipsExpenseType.value && selecctExpenseComplete.value.length) {
            const category = openTipsExpenseType.value;
            console.log('选择的费用项', selecctExpenseComplete.value);
            const newItems = selecctExpenseComplete.value.map(item => ({
                ...item,
                quantity: item.quantity || 0, // 默认数量
                unitPriceFirstCategory: openTipsExpenseType.value === 'labor' ? 'P0001' : openTipsExpenseType.value === 'equipment' ? 'P0002' : 'P0005'
            }));
            console.log('新数据', newItems);

            // 合并到表单数据中
            // formData.list[category] = [...formData.list[category], ...newItems];
            formData.list[category] = [...newItems];

        }

    } else {
        openTipsExpenseModal.value = false;

    }
    // selectedItemsMap.clear();
    // 弹窗关闭，恢复到默认值
    resetExpenseModalState()
}
// 重置弹窗状态
const resetExpenseModalState = () => {
    openTipsExpenseTitle.value = '';
    // openTipsExpenseType.value = null;
    treeDataSource.value = [];
    selectedKeys.value = [];
    selectedKeysNode.value = null;
    defaultExpandedKeys.value = [];
    selectExpenseItem.value = [];
    selectedItemsMap.clear();
    expenseItemData.value = [];
};

const onSelect = (key, e) => {
    selectedKeys.value = key;
    selectedKeysNode.value = e
    // console.log(selectedKeys.value, 'onSelect', e);
    getTableData(e.node.itemTypeCode)
};
// 计算属性：转换为数组供视图使用
const selecctExpenseComplete = computed(() => {
    return Array.from(selectedItemsMap.values());
});

// 更新索引映射
const updateItemMap = () => {
    const map = new Map();
    expenseItemData.value.forEach(item => {
        // Todo需要更改字段值，可能不是value
        map.set(item.value, item);
    });
    expenseItemMap.value = map;
};
// 初始化索引
updateItemMap();
// 处理复选框变化
const handleChange = (e, item) => {
    const checked = e.target.checked;
    if (checked) {
        if (!selectedItemsMap.has(item.unitPriceCode)) {
            selectedItemsMap.set(item.unitPriceCode, {
                ...item,
                // category: selectedKeysNode.value?.node?.unitPriceCategoryName || '',
            });
        }
    } else {
        selectedItemsMap.delete(item.unitPriceCode);
    }

};
// 删除按钮
const deleteItem = (index) => {
    if (index === -1) {
        selectedItemsMap.clear();
        selectExpenseItem.value = [];
        return;
    }
    const selectedArray = Array.from(selectedItemsMap.values());
    const itemToDelete = selectedArray[index];
    const itemValue = itemToDelete?.unitPriceCode;
    if (selectedItemsMap.has(itemValue)) {
        selectedItemsMap.delete(itemValue);
    }

    selectExpenseItem.value = selectExpenseItem.value.filter(
        value => value !== itemValue
    );
    if (selectedItemsMap.size === 0) {
        selectedKeys.value = [];
    }
};
// 合并默认配置和自定义配置
const normalizeNode = (node, fields) => {
    return {
        ...node,
        title: node[fields.title],
        key: node[fields.key],
        children: node[fields.children]?.map(child =>
            normalizeNode(child, fields) // 递归处理子节点
        )
    }
}
// 获取左侧树的数据
const getTreeData = async (category) => {
    try {
        let quotaCatalogId = route.query.id;
        let itemTypeCode = category === 'labor' ? 'P0001' : category === 'equipment' ? 'P0002' : 'P0005'
        const res = await getBasicPriceCategoryTree(quotaCatalogId, itemTypeCode);
        if (res.code == 200 && res.data?.length > 0) {
            treeDataSource.value = res.data.map(node =>
                normalizeNode(node, fieldNames)
            )
            defaultExpandedKeys.value = treeDataSource.value && treeDataSource.value.length > 0 ? [treeDataSource.value[0].id] : []
        } else {
            treeDataSource.value = [];
        }
    } catch (error) {
        console.log('获取左侧树报错了', error);
    }
};
const getTableData = (val) => {
    getBasePriceList({
        itemTypeCode: val,
        quotaCatalogId: Number(route.query.id),
        platformType:2
    })
        .then((res) => {
            if (res.code == 200) {
                expenseItemData.value = handleExpenseItemOptions(formData.list[openTipsExpenseType.value], res.data)
                expenseItemData.value.forEach((m) => {
                    m.categoryName = m.category ? m.category : selectedKeysNode.value?.node?.unitPriceCategoryName
                })
            } else {
                expenseItemData.value = [];
            }
        })
        .catch((err) => {
            console.log('报错了', err);

        })
};
// 处理费用是否可以选中，要跟进form中list中所对应字段分类的数据已存在的，expenseItemData中的数据需要禁用
const handleExpenseItemOptions = (data, options) => {
    const existingCategories = new Set(
        data.map(item => item.unitPriceCode)
    );
    let result = options.map(item => ({
        ...item,
        disabled: existingCategories.has(item.unitPriceCode)
    }));
    return result
}
// 监听expenseItemData变化，更新索引
watch(expenseItemData, () => {
    updateItemMap();
});

// 监听props变化
watch(() => props.addQuotaFlag, (newVal) => {
    openTipsImportFileModal.value = newVal;
});
onMounted(() => {
    if (props.editDataId) {
        // 解构 props.editDataId
        const {
            id,
            categoryId,
            quotaCatalogId,
            quantity,
            quotaCode,
            quotaName,
            remarks,
            scopeMethod,
            unit,
            workContent,
            isSetFactor,
            quotaPriceDetailVOList,
            quotaFactorVOList
        } = { ...props.editDataId };
        // 根据 unitPriceFirstCategory 分类数据
        const categorizedData = {
            labor: [],
            equipment: [],
            mechanical: []
        };
        if (quotaPriceDetailVOList) {
            quotaPriceDetailVOList.forEach(item => {
                const mappedList = item.priceDetailVOList?.map(m => ({
                    ...m,
                })) || [];

                switch (item.unitPriceFirstCategory) {
                    case "P0001":
                        categorizedData.labor = mappedList;
                        break;
                    case "P0002":
                        categorizedData.equipment = mappedList;
                        break;
                    case "P0005":
                        categorizedData.mechanical = mappedList;
                        break;
                    default:
                        break;
                }
            });
        }
        // 直接合并到 formData 的对应字段
        Object.assign(formData, {
            basic: {
                ...formData.basic,
                id,
                categoryId,
                quotaCatalogId,
                quotaName,
                quotaCode,
                quantity,
                unit,
                workContent,
                scopeMethod,
                remarks
            },
            coefficient: {
                ...formData.coefficient,
                isSetFactor: isSetFactor ? isSetFactor : false,
                quotaFactorReqList: quotaFactorVOList || []
            },
            list: categorizedData
        });
        console.log('对象数据', formData);

    }
})

</script>

<style scoped lang='scss'>
.add-qt-content {
    .sort-form {
        padding: 0 20px;
        height: calc(100vh - 300px);
        overflow-y: auto;
    }

    .content-title {
        color: #3d435d;
        display: flex;
        align-items: center;
        margin: 20px 0;
        font-size: 16px;
        font-weight: 600;

        img {
            height: 14px;
            margin-right: 8px;
        }

        button {
            margin-left: auto;
            display: flex;
            align-items: center;
        }
    }

    .ant-form-item {
        margin-bottom: 16px;
    }

    .ant-input,
    .ant-select-selector,
    .ant-input-number {
        border-radius: 4px;
    }

    .ant-textarea {
        border-radius: 4px;
        resize: vertical;
    }

    .list-category {
        margin-bottom: 30px;

        .category-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            background-color: #036b64;
            color: #fff;
            border-radius: 6px;
            opacity: 0.7;
            padding: 0 15px;

            .ant-btn {
                padding: 0 16px;
            }
        }

    }

    .del-cell {
        cursor: pointer;
    }

    .category-footer {
        display: flex;
        justify-content: end;
    }

    :deep(.editable-add-btn) {
        cursor: pointer;
        width: 100px;
        justify-content: flex-end;
        display: flex;
        align-items: center;
        margin: 10px 0;

        iconpark-icon {
            margin-right: 5px;
        }
    }

    .expense-content {
        margin-top: 24px;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;

        .expense-content-left {
            width: 60%;

            .expense-title {
                padding: 4px 0;
                margin-bottom: 10px;
            }

            :deep(.tree-list-self) {
                width: 50%;
                padding: 15px !important;
                height: calc(60vh);
                overflow-y: auto;
                border: 1px solid #ccc;
            }

            :deep(.ant-tree-node-selected) {
                background-color: #E5F0EF;
                color: #036b64;
            }

            .content-left {
                display: flex;

                .expand-item {
                    width: 50%;
                    padding: 5px;
                    border: 1px solid #ccc;
                    border-left: none;
                    border-radius: 6px;
                    height: calc(60vh);
                    overflow-y: auto;
                }
            }
        }

        .expense-content-left,
        .expense-content-right {}

        .expense-content-right {
            width: 40%;
            flex: 1;
            margin-left: 20px;
            height: 100px;

            .expense-right-title {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 10px;

                li {
                    color: #036b64;

                    &:nth-child(2) {
                        cursor: pointer;
                        background-color: #036b64;
                        color: #fff;
                        padding: 4px 10px;
                        border-radius: 4px;
                    }
                }
            }

            .select-list {
                border: 1px solid #ccc;
                padding: 5px;
                height: calc(60vh);
                overflow-y: auto;

                li {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
            }
        }
    }

    .upload-shanchu {
        cursor: pointer;
    }
    :deep(.ant-table-cell) {
        padding: 8px;
    }
    :deep(.ant-input-number) {
        font-size: 12px;
    }
}
</style>