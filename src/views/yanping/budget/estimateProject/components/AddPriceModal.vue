<template>
    <div class="import-file-modal">
        <tips-modal :width="'900px'" title="新增数据" :tipType="'success'" :okText="'保存'"
            v-model:openTipsModal="openTipsImportFileModal" @handleChangeFileModal="handleChangeClose">
            <template #customTitle>{{ tipTitle }}</template>
            <template #contentBody>
                <div class="adjust-data-content">
                    <a-descriptions :column="1" :colon="false">
                        <a-descriptions-item>
                            <template #label>
                                <span class="adjust-data-content-label">所选分类<span
                                        class="required-label">*</span>:</span>
                            </template>
                            {{ addPriceData.selectPricetName }}
                        </a-descriptions-item>
                        <a-descriptions-item>
                            <template #label>
                                <span class="adjust-data-content-label">调整类型:</span>
                            </template>
                            <a-radio-group v-model:value="addPriceData.geneCodeType" name="radioGroup">
                                <a-radio :disabled="item.disabled" :value="item.value" v-for="item in ADD_CODE_OPTIONS"
                                    :key="item.value" @change="changeType(item)">{{ item.label }}</a-radio>
                            </a-radio-group>
                        </a-descriptions-item>
                    </a-descriptions>
                </div>
                <!-- 通用表格 -->
                <div class="add-table">
                    <a-table :dataSource="addPriceData.dataInfo" :columns="addColumns" bordered :pagination="false">
                        <template #headerCell="{ column }">
                            <p class="self_table_title">{{ column.title }} <span v-if="column.required">*</span></p>
                        </template>
                        <template #bodyCell="{ column, record, index }">
                            <div class="cell-wrapper" :style="{ height: 'auto' }">
                                <a-input :maxlength="column.maxlength" :disabled="column.isdisabled"
                                    v-if="column.formTypes === 'input'" :placeholder="column.placeholder"
                                    v-model:value="record[column.dataIndex]" :class="{
                                        'error-input': hasError(index, column.dataIndex),
                                    }" />
                                <a-input-number style="width: 130px" :min="column.min" :precision="column.precision"
                                    :disabled="column.isdisabled" v-if="column.formTypes === 'inputNumber'"
                                    :placeholder="column.placeholder" v-model:value="record[column.dataIndex]" :class="{
                                        'error-input': hasError(index, column.dataIndex),
                                    }" />
                                <a-select :disabled="!column.required" style="width: 130px"
                                    :placeholder="column.placeholder" v-if="column.formTypes === 'select'"
                                    :status="hasError(index, column.dataIndex) ? 'error' : ''" :options="column.options"
                                    v-model:value="record[column.dataIndex]">
                                </a-select>
                                <div v-if="hasError(index, column.dataIndex)" class="error-tip">
                                    {{ getFieldErrorMessage(index, column.dataIndex) }}
                                </div>
                                <span v-if="column.formTypes === 'fixedName'">{{
                                    record[column.dataIndex]
                                    }}</span>
                            </div>
                            <template v-if="column.dataIndex === 'operationDelete'">
                                <iconpark-icon v-if="addPriceData.dataInfo.length > 1" @click="onDelete(index)"
                                    :size="16" class="del-cell" name="shanjian"></iconpark-icon>
                            </template>
                        </template>
                    </a-table>
                    <span class="editable-add-btn" @click="handleAdd">
                        <iconpark-icon name="tianjia"></iconpark-icon>
                        添加行
                    </span>
                </div>

            </template>
        </tips-modal>
    </div>
</template>

<script setup>
import { ref, reactive, toRefs, onBeforeMount, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TipsModal from '@/components/tipsDialog/TipsModal.vue';
import { ADD_CODE_OPTIONS } from '../budget'
const props = defineProps({
    addPriceFlg: {
        type: Boolean,
        default: false,
    },
    selectPricetName: {
        type: String,
    },
    columns: {
        type: Array,
    },
    tipTitle: {
        type: String,
        default: '新增数据',
    },
    noRequiredArr: {
        type: Array,
    },
});
const emits = defineEmits(['update:addPriceFlg', 'getAddPriceData']);

const columnOperation = {
    title: '',
    width: 50,
    dataIndex: 'operationDelete',
    align: 'center',
    fixed: 'right',
};
const openTipsImportFileModal = ref(props.addPriceFlg);
// 新增数据
const addPriceData = ref({
    selectPricetName: '',
    geneCodeType: 1,
    dataInfo: [],
});
// 表头
const addColumns = ref([]);
// 表格字段合集
let dataIndexObject = {};
// 校验数据是否完整
const errorState = ref({
    visible: false,
    errors: [],
});

// 更改类型
const changeType = (e) => {
    console.log('改变类型', e);
    changeColumns(e.value);
    // Todo去掉已经添加的数据中的编号
    addPriceData.value.dataInfo.forEach((m) => {
        m.unitPriceCode = ''
    })

};
//变更表格中的必填项
const changeColumns = (val) => {
    if ((props.noRequiredArr && props.noRequiredArr.length > 0)) {
        addColumns.value.forEach((item) => {
            if (props.noRequiredArr.includes(item.dataIndex)) {
                item.isdisabled = val == 1 ? true : false;
                item.required = val !== 1 ? true : false;
            }

        })
    }
}
// 校验每一项数据的每一项是否填写以及必填逻辑
const validateFormState = () => {
    let errors = [];
    // 校验子级表格数据 dataInfo
    addPriceData.value.dataInfo.forEach((childItem, childIndex) => {
        const sectionName = `第${childIndex + 1}行`;
        Object.entries(childItem).forEach(([key, value]) => {
            const column = addColumns.value.find((c) => c.dataIndex === key);
            const isRequired = column?.required !== false;
            if (isRequired && (value === undefined || value === null || value === '')) {
                errors.push({
                    title: '字段未填写',
                    location: sectionName,
                    description: `${column?.title || key} 为空`,
                    // expected: `请输入${column?.title || key}`,
                    expected: `${column?.placeholder}`,
                    field: key,
                });
            }
        });
    });
    // 更新错误状态
    errorState.value = {
        visible: errors.length > 0,
        errors,
    };
    console.log('报错提示', errorState.value);

    return errors;
};

// 提示错误
const hasError = (childIdx, field) => {
    const sectionName = `第${childIdx + 1}行`;
    return errorState.value.errors.some(
        (err) => err.location === sectionName && err.field === field,
    );
};
// 提示错误信息
const getFieldErrorMessage = (childIdx, field) => {
    const sectionName = `第${childIdx + 1}行`;

    const err = errorState.value.errors.find(
        (e) => e.location === sectionName && e.field === field,
    );
    return err?.expected || '该字段有误';
};
// 添加数据
const handleAdd = () => {
    validateFormState()
    if (!(errorState.value.errors.length > 0)) {
        addPriceData.value.dataInfo.push(dataIndexObject)
    }
    // addPriceData.value.dataInfo.push({ ...dataIndexObject })
    let isHasOperation = addColumns.value.filter((item) => item.dataIndex === 'operationDelete');
    if (!isHasOperation.length) {
        addColumns.value.push(columnOperation);
    }
};
const onDelete = (index) => {
    addPriceData.value.dataInfo.splice(index, 1);
    validateFormState()
    // 删除最后一项
    if (addPriceData.value.dataInfo.length === 1) {
        addColumns.value.pop();
    }
};
const handleChangeClose = (val) => {
    if (val) {
        validateFormState()
        if (!(errorState.value.errors.length > 0)) {
            emits('getAddPriceData', addPriceData.value)
            emits('update:addPriceFlg', false);
        }
    } else {
        emits('update:addPriceFlg', false);
    }
};
watch([() => props.addPriceFlg], ([valFlg, oldFlg]) => {
    openTipsImportFileModal.value = valFlg;
});
onBeforeMount(() => {
    addPriceData.value.selectPricetName = props.selectPricetName;
    addColumns.value = [...props.columns];
    dataIndexObject = Object.fromEntries(props.columns.map((col) => [col.dataIndex, null]));
    addPriceData.value.dataInfo.push({ ...dataIndexObject })
});
onMounted(() => {
    // 初始化表格的表头
    changeColumns(addPriceData.value.geneCodeType);
});
</script>
<style scoped lang="scss">
.adjust-data-content {
    margin: 20px;

    .user-tabs {
        width: 100%;
    }

    :deep(.table-lists) {
        width: 90%;
        overflow: hidden;
        overflow-x: auto;
    }

    .adjust-data-content-label {
        width: 120px;
        font-size: 14px;
        font-weight: bold;

        .required-label {
            color: red;
        }
    }

    .adjust-data-content-tip {
        font-size: 12px;
        color: #a8adbe;
    }

    .special-item {
        visibility: hidden;
    }

    .adjust-data-content-uoload {
        display: flex;
    }

    .export-data {
        color: #036b64;
        cursor: pointer;
        // margin-bottom: 10px;
        margin-right: 20px;
        font-size: 14px;
    }

    .content-add-upload {
        :deep(.ant-upload.ant-upload-select) {
            width: 100%;
            height: 20px !important;

            :deep(.ant-upload) {
                height: 100% !important;
            }
        }
    }

    .tuning-tip {
        display: flex;
        padding: 8px 0 5px 0;
        background: #fef1df;
        border-radius: 4px;
        margin-bottom: 20px;

        .success {
            color: #fe830f;
            margin: 0 9px 0 12px;
        }

        .tuning-tip-title {
            font-size: 14px;
            color: #21263f;
            line-height: 22px;
        }
    }

    .tuning-example {
        font-size: 14px;
        color: #363b4d;
        line-height: 12px;
        margin-top: 20px;

        span {
            color: #036b64;
            cursor: pointer;
        }
    }

    .file-list {
        display: flex;
        align-items: center;

        span {
            margin: 0 5px;
        }

        .file-del-icon {
            cursor: pointer;
            visibility: hidden;
        }

        &:hover {
            .file-del-icon {
                visibility: visible;
            }
        }
    }

    .content-add-tip {
        color: #ff3e3e;
        font-size: 12px;
    }

    .problem-list {
        margin-top: 20px;

        li {
            width: 409px;
            // height: 40px;
            background: #ffffff;
            border-radius: 4px;
            border: 1px solid #e5e5e5;
            padding: 10px 16px;
            font-size: 12px;
            color: #363b4d;
            line-height: 14px;
        }
    }

    .data-type {
        span {
            font-size: 14px;
            font-family:
                PingFangSC,
                PingFang SC;
            color: #5c6170;
            margin-right: 16px;
        }
    }
}

.shanjian-icon {
    font-size: 16px;
    position: absolute;
    top: 30px;
    right: -40px;
    transform: translate(-50%, -50%);
    cursor: pointer;
}

.self_table_title {
    span {
        color: red;
    }
}

.error-input {
    border-color: #ff4d4f !important;
}

.error-tip {
    color: #ff4d4f;
    font-size: 12px;
    line-height: 12px;
    margin-top: 5px;
}

.add-table {

    overflow: hidden;

    :deep(.editable-add-btn) {
        cursor: pointer;
        float: right;
        width: 100px;
        justify-content: flex-end;
        display: flex;
        align-items: center;
        margin: 10px 0;

        iconpark-icon {
            margin-right: 5px;
        }
    }

    .del-cell {
        cursor: pointer;
    }

}
</style>
