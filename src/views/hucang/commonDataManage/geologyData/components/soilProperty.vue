<template>
    <div>
        <div class="soilProperty-component">
            <a-table :scroll="{ x: 3200 }" bordered :data-source="dataSource" :columns="columns" :pagination="false">
                <template v-slot:headerCell="{ title, column }">
                    <template v-if="title.split('|').length > 1">
                        <p class="custom-table-head">
                            <span><i style="color: #FF3E3E; margin-right: 3px; font-weight: lighter"
                                    v-if="title && column.required">
                                    *
                                </i>{{ title.split('|')[0] }}</span>
                            <span style="margin-top: -8px">{{ title.split('|')[1] }}</span>
                        </p>
                    </template>
                    <template v-else>
                        <i style="color: #FF3E3E; margin-right: 3px; font-weight: lighter"
                            v-if="title && column.required">
                            *
                        </i>
                        {{ title }}
                    </template>
                </template>
                <template #bodyCell="{ column, text, record, index }">
                    <template v-if="column.dataIndex === 'operationDelete'">
                        <iconpark-icon v-if="props.isEdit && dataSource.length > 1" @click="onDelete(index)" :size="16"
                            class="del-cell" name="shanjian"></iconpark-icon>
                    </template>
                    <template v-else>
                        <div class="editable-cell">
                            <div v-if="props.isEdit" class="editable-cell-input-wrapper">
                                <a-input v-if="column.isText" v-model:value="record[column.dataIndex]"
                                    @pressEnter="save(record.key)" />
                                <a-input-number v-else @pressEnter="save(record.key)" :controls="false"
                                    v-model:value="record[column.dataIndex]"></a-input-number>
                            </div>
                            <div v-else class="editable-cell-text-wrapper">
                                {{ record[column.dataIndex] }}
                            </div>
                        </div>
                    </template>
                </template>
            </a-table>
            <span v-if="props.isEdit" class="editable-add-btn" @click="handleAdd">
                <iconpark-icon name="tianjia"></iconpark-icon>
                添加行
            </span>
        </div>
        <!-- <div @click="formatGetData">检验</div> -->
        <div class="errorMsg" v-if="errorMsg">请完整输入特征数据，并保证承载力特征值不能为0</div>
    </div>
</template>
<script setup>
import { computed, reactive, ref, onBeforeMount, watch } from 'vue';
import { cloneDeep } from 'lodash-es';
const props = defineProps({
    isEdit: {
        type: Boolean,
        default: true,
    },
    detailData: {
        type: Array,
        default: () => [{}],
    }
});
const columns = ref([
    {
        title: '岩土名称',
        width: 120,
        dataIndex: 'name',
        align: 'center',
        required: true,
        isText: true,
    },
    {
        title: '厚度|(m)',
        width: 120,
        dataIndex: 'thickness',
        align: 'center',
        required: true,
    },
    // {
    //     title: '深度|(mm)',
    //     dataIndex: 'depth',
    //     align: 'center'
    // },
    {
        title: '重力密度|ρ(kN/cm3)',
        width: 120,
        dataIndex: 'gravityDensity',
        align: 'center',
        required: true,
    },
    {
        title: '压缩模量|Es(MPa)',
        width: 120,
        dataIndex: 'compressionModulus',
        align: 'center',
        required: true,
    },
    {
        title: '内聚力c|G(MPa)',
        width: 120,
        dataIndex: 'cohesion',
        align: 'center'
    },
    {
        title: '摩擦角|φ(°)',
        width: 120,
        dataIndex: 'angleFriction',
        align: 'center',
        required: true,
    },
    {
        title: '泊松比|υ',
        width: 120,
        dataIndex: 'poissonRatio',
        align: 'center',
    },
    // {
    //     title: '凝聚力|c (kPa)',
    //     dataIndex: 'operation',
    //     align: 'center'
    // },
    {
        title: '承载力特征值|fak(kPa)',
        width: 120,
        dataIndex: 'bearingCapacity',
        align: 'center',
        required: true,
    },
    {
        title: '宽度承载力修正系数|ηb',
        width: 120,
        dataIndex: 'widthBearCapacityCorrectionFactor',
        align: 'center',
    },
    {
        title: '深度承载力修正系数|ηd',
        width: 120,
        dataIndex: 'correctionFactorDeepBearCapacity',
        align: 'center',
    },
    {
        title: '地基抗震承载力修正系数ζa',
        width: 120,
        dataIndex: 'correctionSeismicBearCapacityFoundation',
        align: 'center',
    },
    {
        title: '桩侧阻力标准值|qsik(kPa)',
        width: 120,
        dataIndex: 'standardPileSideResistance',
        align: 'center',
    },
    {
        title: '桩端阻力标准值|qpk(kPa)',
        width: 120,
        dataIndex: 'standardPileEndResistance',
        align: 'center',
    },
    {
        title: '液化折减系数',
        width: 120,
        dataIndex: 'liquefactionFactor',
        align: 'center',
    },
    {
        title: '水平抗力比例系数m(kN/m4)',
        width: 120,
        dataIndex: 'horizontalResistanceRatioCoefficient',
        align: 'center',
    },
    {
        title: '抗拔系数',
        width: 120,
        dataIndex: 'pullOutCoefficient',
        align: 'center',
    },
    {
        title: '侧阻力尺寸效应系数',
        width: 130,
        dataIndex: 'sizeEffectCoefficientLateralResistance',
        align: 'center',
    },
    {
        title: '端阻力尺寸效应系数',
        width: 130,
        dataIndex: 'endEffectCoefficientLateralResistance',
        align: 'center',
    },
    {
        title: '负摩阻力系数',
        width: 120,
        dataIndex: 'negativeFrictionResistanceCoefficient',
        align: 'center',
    },

]);
const errorMsg = ref(false);

const columnOperation = {
    title: '',
    width: 50,
    dataIndex: 'operationDelete',
    align: 'center',
    fixed: 'right',
};
const customHeaderCell = (columns) => {
    // console.log(columns);
};
const dataSource = ref([
    {},
]);
watch(() => { props.detailData }, () => {
    dataSource.value = cloneDeep(props.detailData);
}, {
    deep: true,
    immediate: true
})
const count = computed(() => dataSource.value.length + 1);
const editableData = reactive({});
const edit = (key) => {
    editableData[key] = cloneDeep(dataSource.value.filter((item) => key === item.key)[0]);
};
const save = (key) => {
    Object.assign(dataSource.value.filter((item) => key === item.key)[0], editableData[key]);
    delete editableData[key];
};
const onDelete = (index) => {
    dataSource.value.splice(index, 1);
    // 删除最后一项
    if (dataSource.value.length === 1) {
        columns.value.pop();
    }
};
const handleAdd = () => {
    // 生成一个随机数作为key
    const newData = {
        name: '',
    };
    dataSource.value.push(newData);
    let isHasOperation = columns.value.filter((item) => item.dataIndex === 'operationDelete');
    if (!isHasOperation.length) {
        columns.value.push(columnOperation);
    }
};
onBeforeMount(() => {
    let isHasOperation = columns.value.filter((item) => item.dataIndex === 'operationDelete');
    if (!isHasOperation.length && props.isEdit) {
        columns.value.push(columnOperation);
    }
});
const formatGetData = () => {
    const formatResult = [];
    dataSource.value.forEach((item, itemIndex) => {
        const isEffective = columns.value.every(ele => {
            if (ele.required) {
                if (ele.dataIndex == 'bearingCapacity') {
                    // 承载力不能为0
                    if (item[ele.dataIndex]) {
                        return true;
                    } else {
                        item[ele.dataIndex] = null;
                        return false;
                    }
                } else {
                    return item[ele.dataIndex] || item[ele.dataIndex] == 0
                }
            } else {
                return true;
            }
        })
        isEffective && formatResult.push(item);
    });
    // console.log(dataSource.value);
    // console.log(formatResult);
    errorMsg.value = formatResult.length !== dataSource.value.length;
    return formatResult;
};
defineExpose({
    dataSource,
    formatGetData,
    errorMsg
});
</script>
<style lang="scss" scoped>
.soilProperty-component {
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

    :deep(.position-relative-cell) {
        position: relative;

        .del-cell {
            position: absolute;
            right: -50px;
            top: 0;
            margin-top: 8px;
            cursor: pointer;
        }
    }

    :deep(.ant-input-number-input) {
        font-size: 14px;
    }

    :deep(.ant-input-number) {
        width: 100%;
    }

}

.custom-table-head {
    display: flex;
    flex-direction: column;
    align-items: center;

    span {
        position: relative;
        // &:first-child {
        //     &::after {
        //         content: '*';
        //         color: red;
        //         position: absolute;
        //         left: -10px;
        //     }
        // }
    }
}

.errorMsg {
    font-size: 12px;
    color: #ff4d4f;
}
</style>
