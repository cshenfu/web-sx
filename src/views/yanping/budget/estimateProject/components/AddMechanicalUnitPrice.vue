<template>
    <div class="add-mc-content">
        <tips-modal :width="'900px'" :title="title" :tipType="'success'" :okText="'保存'" class="add-mc-modal"
            v-model:openTipsModal="openTipsImportFileModal" @handleChangeFileModal="handleChangeClose">
            <template #contentBody>
                <a-form class="sort-form" ref="openFormRef" :model="openFormData" :labelCol="labelCol" :rules="rules"
                    labelAlign="left">
                    <a-form-item label="所属分类" name="selectPricetName">
                        <span>{{ openFormData.selectPricetName }}</span>
                    </a-form-item>
                    <a-form-item label="编号" name="geneCodeType">
                        <template v-if="!editDataId">
                            <a-row>
                                <a-col :span="24">
                                    <a-radio-group v-model:value="openFormData.geneCodeType" name="radioGroup">
                                        <a-radio :disabled="item.disabled" :value="item.value"
                                            v-for="item in ADD_CODE_OPTIONS" :key="item.value">{{ item.label
                                            }}</a-radio>
                                    </a-radio-group>
                                </a-col>
                            </a-row>
                            <a-row>
                                <a-col :span="24">
                                    <a-form-item-rest>
                                        <a-input v-if="openFormData.geneCodeType == 2" :placeholder="'请输入名称'"
                                            v-model:value="openFormData.unitPriceCode"
                                            style="width: 50%;margin-top: 10px;" />
                                    </a-form-item-rest>
                                </a-col>
                            </a-row>

                        </template>
                        <span v-else>{{ openFormData.code }}</span>
                    </a-form-item>
                    <a-form-item label="名称" name="unitPriceName">
                        <a-input :placeholder="'请输入名称'" v-model:value="openFormData.unitPriceName" style="width: 50%" />
                    </a-form-item>
                    <a-form-item label="计量单位" name="unit">
                        <a-select style="width: 50%" :placeholder="'请选择计量单位'" :options="UNIT_OPTIONS"
                            v-model:value="openFormData.unit">
                        </a-select>
                    </a-form-item>
                    <a-form-item label="型号" name="model">
                        <a-input :placeholder="'请输入型号'" v-model:value="openFormData.model" style="width: 50%" />
                    </a-form-item>
                    <a-form-item label="单价" name="unitPrice">
                        <a-input-number :placeholder="openFormData.isRelatePrice == 1 ? '自动计算' : '请输入'" :precision="4" :min="0" :controls="false"  :disabled="openFormData.isRelatePrice == 1" v-model:value="openFormData.unitPrice"
                            style="width: 50%" />
                    </a-form-item>
                    <a-form-item label="关联费用" name="relatePricelist">
                        <a-radio-group style="margin: 6px 0 16px 0;" v-model:value="openFormData.isRelatePrice" :options="relateOptions" />
                        <a-form-item-rest v-if="openFormData.isRelatePrice == 1">
                            <a-table :data-source="openFormData.relatePricelist" :columns="columns" bordered
                                :pagination="false" style="width: 100%;" :customRow="(record, index) => ({
                                    key: record.priceCode,
                                })">
                                <template #bodyCell="{ column, record, index }">
                                    <div class="cell-wrapper">
                                        <a-input-number v-if="column.dataIndex === 'priceQuantity'"
                                            v-model:value="record.priceQuantity" placeholder="请输入数量" :min="column.min"
                                            :precision="3" style="width: 120px" />
                                        <span v-else>{{ record[column.dataIndex] }}</span>
                                    </div>
                                </template>
                            </a-table>
                        </a-form-item-rest>

                    </a-form-item>
                </a-form>
            </template>
        </tips-modal>
    </div>
</template>

<script setup>
import { ref, reactive, watch, onBeforeMount, onMounted, watchEffect, computed, nextTick } from 'vue';
import TipsModal from '@/components/tipsDialog/TipsModal.vue';
import { ADD_CODE_OPTIONS, UNIT_OPTIONS } from '../budget'
import { useRoute } from 'vue-router';
const route = useRoute();
const isRules = ref(true);
const pricePlaceholder = ref('请输入');
const props = defineProps({
    addMechanicalUnitPriceFlg: {
        type: Boolean,
        default: false,
    },
    selectPricetName: {
        type: String,
    },
    editDataId: {
        type: Object,
        default: () => ({})
    }

});
const relateOptions = reactive([
    {
        label: '不关联',
        value: 2,
    },
    {
        label: '关联',
        value: 1,
    },
]);
const emits = defineEmits(['update:addMechanicalUnitPriceFlg', 'getAddMechanicalData']);
// 校验输入code的情况
const validatorCode = (rule, value, callback) => {
    return new Promise((resolve, reject) => {
        if ((openFormData.value.geneCodeType == 2) && !openFormData.value.unitPriceCode) {
            reject('请输入编号');
        } else {
            resolve();
        }
    });
}
// 校验表格中的数据
const validatorNumber = (rule, value, callback) => {
    return new Promise((resolve, reject) => {
        if (openFormData.value.isRelatePrice   == 2) {
            resolve();
        }
        const invalidItem = value.find(item => {
            const priceQuantity = item.priceQuantity;
            return (
                priceQuantity === null ||
                priceQuantity === undefined ||
                priceQuantity === '' ||
                isNaN(Number(priceQuantity)) ||
                Number(priceQuantity) < 0
            );
        });

        if (invalidItem) {
            reject('请为所有费用输入有效的数量');
        } else {
            resolve();
        }
    });
}
let RELATED_EXPENSES = [
    { type: '第一类费用', priceCode: 'JXQT0001', name: '折旧费', unit: '元', priceType: 1, },
    { type: '第一类费用', priceCode: 'JXQT0002', name: '设备修理费', unit: '元', priceType: 1 },
    { type: '第一类费用', priceCode: 'JXQT0003', name: '安装拆卸费', unit: '元', priceType: 1 },
    { type: '第二类费用', priceCode: 'RG0001', name: '高级技工', unit: '工日', priceType: 2 },
    { type: '第二类费用', priceCode: 'RG0002', name: '技工', unit: '工日', priceType: 2 },
    { type: '第二类费用', priceCode: 'CL0187', name: '汽油', unit: 'kg', priceType: 2 },
    { type: '第二类费用', priceCode: 'CL0019', name: '柴油', unit: 'kg', priceType: 2 },
    { type: '第二类费用', priceCode: 'ZHDJ0001', name: '电', unit: 'kWh', priceType: 2 },
    { type: '第二类费用', priceCode: 'SJ0001', name: '水', unit: 'm³', priceType: 2 },
    { type: '其他费用', priceCode: 'JXQT0008', name: '其他费用', unit: '元', priceType: 3 },
];
const columns = [
    {
        title: '费用类型', dataIndex: 'type', align: 'center', customCell: (_, index) => {
            return {
                rowSpan: nameRowSpan.value[index],
            };
        },
    },
    { title: '费用编号', dataIndex: 'priceCode', align: 'center' },
    { title: '费用名称', dataIndex: 'name', align: 'center' },
    { title: '单位', dataIndex: 'unit', align: 'center' },
    {
        title: '数量',
        dataIndex: 'priceQuantity',
        align: 'center',
        min: 0,
    },
];
const title = ref('新增数据')
const openTipsImportFileModal = ref(props.addMechanicalUnitPriceFlg);
const openFormRef = ref(null);
const openFormData = ref({
    selectPricetName: null,
    geneCodeType: 1,
    unitPriceCode: '',
    unitPriceName: '',
    unit: null,
    model: '',
    unitPrice: '',
    isRelatePrice: 2,
    relatePricelist: RELATED_EXPENSES.map(item => ({ ...item, priceQuantity: '' }))
})
const rules = ref({
    selectPricetName: [{ required: true, trigger: 'blur' }],
    geneCodeType: [{ required: true, trigger: 'blur', validator: validatorCode }],
    unitPriceName: [{ required: true, message: '请输入名称', trigger: 'blur' }],
    unit: [{ required: true, message: '请选择单位', trigger: 'blur' }],
    model: [{ required: false, message: '请输入型号', trigger: 'blur' }],
    relatePricelist: [{ required: true, trigger: ['blur'], validator: validatorNumber }],
    unitPrice: [{ required: isRules, trigger: ['blur'], message: '请输入单价' }]
})
// 计算合并规则
const computedRowSpan = (data, key) => {
    // console.log(data);
    const rowSpanData = Array(data.length).fill(1);
    let i = 0;
    while (i < data.length) {
        let count = 1;
        while (i + count < data.length && data[i][key] === data[i + count][key]) {
            rowSpanData[i + count] = 0;
            count++;
        }
        rowSpanData[i] = count;
        i += count;
    }
    return rowSpanData;
};
const nameRowSpan = ref([]);
nameRowSpan.value = computedRowSpan(
    openFormData.value.relatePricelist,
    'type',
);
const labelCol = {
    style: {
        width: '100px',
        marginRight: '6px',
    },
};
const handleChangeClose = async (val) => {
    if (val) {
        openFormRef.value.validateFields().then(() => {
            emits('getAddMechanicalData', openFormData.value)
            emits('update:addMechanicalUnitPriceFlg', false);
        }).catch((error) => {
            console.log('错误', error);
        })
    } else {
        emits('update:addMechanicalUnitPriceFlg', false);
    }
};
watch([() => props.addMechanicalUnitPriceFlg], ([valFlg, oldFlg]) => {
    openTipsImportFileModal.value = valFlg;
});

watch(() => openFormData.value.isRelatePrice, (val) => { 
    isRules.value = openFormData.value.isRelatePrice == 2;
    pricePlaceholder.value = openFormData.value.isRelatePrice == 1 ? '自动计算' : '请输入';
        openFormData.value.unitPrice = '';
})

onBeforeMount(() => {
    openFormData.value.selectPricetName = props.selectPricetName;
    console.log('props.editDataId', props.editDataId)
    if (props.editDataId) {
        title.value = '编辑数据'
        Object.assign(openFormData.value, props.editDataId);
        nextTick(() => {
            openFormData.value.unitPrice = props.editDataId.unitPrice || '';
        })
        // 根据后台返回结果重新构建表头结构
        if (props.editDataId?.relatePricelist?.length) {
            const priceTypeName = {
                1: '第一类费用',
                2: '第二类费用',
                3: '第三类费用',
                4: '其他费用',
            } 
            RELATED_EXPENSES = [];
            const relatePricelist = JSON.parse(JSON.stringify(props.editDataId.relatePricelist));
            relatePricelist.sort((a, b) => a.priceType - b.priceType);
            relatePricelist.forEach(item => { 
                const obj = { type: priceTypeName[item.priceType], priceCode: item['priceCode'], name: item['unitPriceName'], unit: item['unit'], priceType: item['priceType'] }
                RELATED_EXPENSES.push(obj);
            });
            openFormData.value.relatePricelist = RELATED_EXPENSES.map(item => ({ ...item, priceQuantity: '' }));
            nameRowSpan.value = computedRowSpan(
                openFormData.value.relatePricelist,
                'type',
            );
        }
        //  赋值表单数据
        let arr = RELATED_EXPENSES.map(item => ({ ...item, priceQuantity: '', id: null }))
        if (props.editDataId?.relatePricelist?.length) {
            openFormData.value.isRelatePrice = 1;
            isRules.value = false;
            pricePlaceholder.value = '自动计算';
            const priceMap = new Map();
            props.editDataId.relatePricelist.forEach(m => {
                priceMap.set(m.priceCode, {
                    id: m.id,
                    priceQuantity: m.priceQuantity
                });
            });

            // 更新数量值
            arr.forEach(item => {
                if (priceMap.has(item.priceCode)) {
                    const match = priceMap.get(item.priceCode);
                    item.id = match.id; // 设置关联ID
                    item.priceQuantity = match.priceQuantity;
                }
            });
        } else {
            openFormData.value.isRelatePrice = 2;
            isRules.value = true;
            pricePlaceholder.value = '请输入';
        }

        openFormData.value.relatePricelist = arr;
    }
})
onMounted(() => {
})
watchEffect(() => {
})

</script>
<style scoped lang='scss'>
.add-mc-content {
    .add-mc-modal {
        // height: 600px;
        // overflow: hidden;
        // :deep(.ant-modal) {
        //     height: 800px;
        //     overflow-y: auto;
        // }
    }
}
</style>