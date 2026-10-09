<template>
    <div class="wind-weight">
        <div class="wind-weight-header">
            <a-radio-group
                @change="changeIsWindWeight"
                v-model:value="isWindWeight"
                :options="windWeightOptions"
            />
            <span @click="addWeight">+添加轮毂高度</span>
            <!-- <span @click="addWeight">+添加轮毂高度</span> -->
        </div>
        <template v-if="isWindWeight">
            <div class="add-wind-table" v-for="(item, parentIndex) in formState" :key="parentIndex">
                <ul class="add-wind-table-ul">
                    <li>
                        <span>轮毂高度 </span>
                        <a-select
                            @change="(e) => changHeight(e, parentIndex)"
                            style="width: 250px"
                            v-model:value="item.hubHeight"
                            placeholder="请选择"
                            :options="heightOptions"
                            :getPopupContainer="(trigger) => trigger.parentNode"
                        >
                        </a-select>
                    </li>
                    <li v-if="windType == 'weight'">
                        <span>塔筒节数 </span>
                        <a-select
                            @change="(e, option) => changeTowerNum(e, option, parentIndex)"
                            style="width: 250px"
                            v-model:value="item.num"
                            placeholder="请选择"
                            :options="getTowerNum(item)"
                            :getPopupContainer="(trigger) => trigger.parentNode"
                        >
                        </a-select>
                    </li>
                </ul>
                <iconpark-icon
                    v-if="formState.length > 1"
                    name="shanjian"
                    class="shanjian-icon"
                    @click="deleteData(parentIndex)"
                ></iconpark-icon>
                <a-table
                    v-memo="[item.dataInfo.length, item.columns.length]"
                    :dataSource="item.dataInfo"
                    :columns="item.columns"
                    bordered
                    size="small"
                    :pagination="false"
                >
                    <template #headerCell="{ column }">
                        <p class="self_table_title"
                            >{{ column.title }} <span v-if="column.required">*</span></p
                        >
                    </template>
                    <template #bodyCell="{ column, record, index }">
                        <div class="cell-wrapper" :style="{ height: 'auto' }">
                            <a-input
                                :disabled="changeDisabled(column, record, index, item, parentIndex)"
                                v-if="column.formTypes === 'input'"
                                :placeholder="
                                    column.placeholderRequired && index == 0
                                        ? column.placeholderRequired
                                        : column.placeholder
                                "
                                v-model:value="record[column.dataIndex]"
                                @paste="handlePaste($event, parentIndex, index, column.dataIndex)"
                                :class="{
                                    'error-input': hasError(parentIndex, index, column.dataIndex),
                                }"
                            />
                            <a-select
                                :disabled="changeDisabled(column, record, index, item, parentIndex)"
                                style="width: 130px"
                                :placeholder="column.placeholder"
                                v-if="column.formTypes === 'select'"
                                :status="
                                    hasError(parentIndex, index, column.dataIndex) ? 'error' : ''
                                "
                                :options="column.options"
                                v-model:value="record[column.dataIndex]"
                            >
                            </a-select>
                            <div
                                v-if="hasError(parentIndex, index, column.dataIndex)"
                                class="error-tip"
                            >
                                <!-- {{ column.placeholder || '该字段必填' }} -->
                                {{ getFieldErrorMessage(parentIndex, index, column.dataIndex) }}
                            </div>
                            <span v-if="column.formTypes === 'fixedName'">{{
                                record[column.dataIndex]
                            }}</span>
                        </div>
                    </template>
                </a-table>
            </div>
        </template>
        <p class="add-empty-memo">说明：未填写时，系统会自动引用平台数据库较接近的风机数据</p>
    </div>
</template>

<script setup>
    import { ref, reactive, toRefs, onBeforeMount, onMounted, watchEffect, computed } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import { ElMessage } from 'element-plus'
    import { options } from 'less';
    const props = defineProps({
        columns: {
            type: Array,
            default: [],
        },
        windType: {
            type: String,
        },
        filedsData: {
            type: Array,
            default: [],
        },
    });
    const windWeightOptions = [
        {
            label: '暂无',
            value: 0,
        },
        {
            label: '有',
            value: 1,
        },
    ];
    const heightOptions = ref([
        {
            label: '115m',
            value: 115,
            disabled: false,
        },
        {
            label: '120m',
            value: 120,
            disabled: false,
        },
        {
            label: '125m',
            value: 125,
            disabled: false,
        },
        {
            label: '130m',
            value: 130,
            disabled: false,
        },
        {
            label: '135m',
            value: 135,
            disabled: false,
        },
        {
            label: '140m',
            value: 140,
            disabled: false,
        },
        {
            label: '160m',
            value: 160,
            disabled: false,
        },
        {
            label: '180m',
            value: 180,
            disabled: false,
        },
    ]);
    // 计算塔筒节数
    const getTowerNum = (e) => {
        let towerNum = e.hubHeight <= 140 ? 10 : 60;
        let arr = [];
        for (let i = 5; i <= towerNum; i++) {
            arr.push({
                label: `${i}节`,
                value: i,
            });
        }
        return arr;
    };
    // 表格字段合集
    const dataIndexObject = ref({});
    const formState = ref([
        {
            hubHeight: 115,
            num: 5,
            dataInfo: [],
            columns: [],
        },
    ]);
    // 校验数据是否完整
    const errorState = ref({
        visible: false,
        errors: [],
    });

    const isWindWeight = ref(0);
    // 选择是否有数据
    const changeIsWindWeight = (e) => {
        if (!e.target.value) {
            formState.value = [
                {
                    hubHeight: 115,
                    num: 5,
                    dataInfo: [],
                    columns: [],
                },
            ];
        } else {
            fillData();
        }
    };
    // 高度调整逻辑
    const changHeight = (e, index) => {
        // 调整必填项
        updateColumns(formState.value[index]);
        // 更新可用的高度
        updateHeightOptions();
        // 初始化材料跟塔筒厚度
        restWeightData(index);
    };
    // 改变塔筒
    const changeTowerNum = (e, options, index) => {
        console.log(index, '塔筒节数', e);
        fillData(index);
    };
    // 删除数据
    const deleteData = (parentIndex) => {
        formState.value.splice(parentIndex, 1);
        updateHeightOptions(); // 删除后更新选项状态
    };
    const route = useRoute();
    // 增加数据
    const addWeight = () => {
        if (!isWindWeight.value) return;
        // 前置验证
        errorState.value = {
            visible: false,
            errors: [],
        };
        validateFormState();
        if (errorState.value.errors.length > 0) return;
        updateHeightOptions();
        // 获取所有已选的高度值
        const selectedLevels = new Set(formState.value.map((item) => item.hubHeight));

        // 计算未选的高度选项
        const availableHeights = heightOptions.value
            .filter((opt) => !selectedLevels.has(opt.value))
            .map((opt) => opt.value);
        if (availableHeights.length === 0) {
            ElMessage.warning('所有可选高度均已添加');
            return;
        }

        // 添加第一个可用高度
        formState.value.push({
            hubHeight: availableHeights[0],
            num: 5,
            dataInfo: [],
            columns: [],
        });
        initColumns();
        fillData();
    };
    // 校验是否还有可用的高度
    const updateHeightOptions = () => {
        const selectedHeights = new Set(formState.value.map((item) => item.hubHeight));
        heightOptions.value = heightOptions.value.map((opt) => ({
            ...opt,
            disabled: selectedHeights.has(opt.value),
        }));
    };
    // 校验每一项数据的每一项是否填写以及必填逻辑
    const validateFormState = () => {
        let errors = [];
        if (!isWindWeight.value) return errors;
        formState.value.forEach((parentItem, parentIndex) => {
            const valName = `风机${parentIndex + 1}`;

            // 校验子级表格数据 dataInfo
            parentItem.dataInfo.forEach((childItem, childIndex) => {
                const sectionName = `${valName} - 第${childIndex + 1}节`;

                Object.entries(childItem).forEach(([key, value]) => {
                    const column = parentItem.columns.find((c) => c.dataIndex === key);
                    const isRequired = column?.required !== false;

                    if (isRequired && (value === undefined || value === null || value === '')) {
                        errors.push({
                            title: '字段未填写',
                            location: sectionName,
                            description: `${column?.title || key} 为空`,
                            expected: `请输入${column?.title || key}`,
                            field: key,
                        });
                    }
                });
            });
        });

        // 附加塔筒重量类校验（材料、厚度等）
        if (errors.length === 0 && props.windType === 'weight') {
            const towerErrors = validateTowerForm();
            errors.push(...towerErrors);
        }

        // 更新错误状态
        errorState.value = {
            visible: errors.length > 0,
            errors,
        };
        return errors;
    };
    const hasError = (parentIdx, childIdx, field) => {
        const valName = `风机${parentIdx + 1}`;
        const sectionName = `${valName} - 第${childIdx + 1}节`;
        let result = errorState.value.errors.some(
            (err) => err.location === sectionName && err.field === field,
        );
        return result;
    };
    const getFieldErrorMessage = (parentIdx, childIdx, field) => {
        const valName = `风机${parentIdx + 1}`;
        const sectionName = `${valName} - 第${childIdx + 1}节`;

        const err = errorState.value.errors.find(
            (e) => e.location === sectionName && e.field === field,
        );
        return err?.expected || '该字段有误';
    };

    // 粘贴
    const handlePaste = (event, parentIndex, startRowIndex, startColKey) => {
        event.preventDefault();
        try {
            const clipboardData = event.clipboardData || window.clipboardData;
            const pastedData = clipboardData.getData('text');

            // 解析粘贴数据
            const rows = pastedData
                .trim()
                .split(/\r\n|\n|\r/)
                .map((row) => row.split('\t'));

            // 空内容校验
            if (rows.length === 0 || rows[0].length === 0) {
                ElMessage.warning('粘贴内容为空');
                return;
            }

            // 获取可编辑列配置
            const colKeys = props.columns.filter((col) => col.required).map((col) => col.dataIndex);

            const startColIndex = colKeys.indexOf(startColKey);

            // 列起始位置校验
            if (startColIndex === -1) {
                ElMessage.error('当前列不可编辑');
                return;
            }

            // 列数一致性校验
            const expectedColCount = rows[0].length;
            const isConsistent = rows.every((row) => row.length === expectedColCount);
            if (!isConsistent) {
                ElMessage.error('粘贴数据的列数不一致');
                return;
            }

            // 可用列数校验
            const availableCols = colKeys.length - startColIndex;
            if (expectedColCount > availableCols) {
                ElMessage.error(`超出可粘贴列数限制，最大允许 ${availableCols} 列`);
                return;
            }

            // 行数限制校验（可选）
            const maxAllowedRows = 100; // 根据需求配置
            if (rows.length > maxAllowedRows) {
                ElMessage.error(`超过最大允许粘贴行数（${maxAllowedRows}）`);
                return;
            }
            const existingRowCount = formState.value[parentIndex].dataInfo.length;
            const endRowIndex = startRowIndex + rows.length - 1;
            if (endRowIndex >= existingRowCount) {
                ElMessage.warning(
                    `粘贴行数超出现有数据行数，将截断至 ${existingRowCount - startRowIndex} 行`,
                );
                rows.length = existingRowCount - startRowIndex;
            }
            rows.forEach((row, rowOffset) => {
                const currentRowIndex = startRowIndex + rowOffset;
                if (currentRowIndex < existingRowCount) {
                    row.forEach((value, colOffset) => {
                        const currentColIndex = startColIndex + colOffset;
                        const colKey = colKeys[currentColIndex];

                        if (colKey) {
                            formState.value[parentIndex].dataInfo[currentRowIndex][colKey] = value;
                        }
                    });
                }
            });
        } catch (error) {
            console.log('粘贴报错', error);

            ElMessage.error('粘贴失败: ' + error.ElMessage);
        }
    };
    // 重置各种数据
    const restWeightData = (index) => {
        if (props.windType === 'weight') {
            // console.log('数据呢', formState.value[index]);

            formState.value[index].dataInfo.forEach((m, cIndex) => {
                if (formState.value[index]['hubHeight'] <= 140 || cIndex == 0) {
                    m.material = 'Q355';
                    m.tmm = 33;
                }
            });
        }
    };
    // 创建创建新的数据项
    const createNewDataItem = (index, currentData) => {
        // 使用对象扩展而不是JSON解析，性能更好
        const newItem = { ...dataIndexObject.value };

        // 设置桶序列号
        newItem.barrelSeq = index === 0 ? '风机机舱+叶轮' : `${index}节`;

        // 根据轮毂高度设置材质和厚度
        if (currentData.hubHeight <= 140 || index == 0) {
            newItem.material = 'Q355';
            newItem.tmm = 33;
        } else {
            newItem.material = undefined;
            newItem.tmm = undefined;
        }

        return newItem;
    };
    // 填充荷载数据
    const fillLoadData = (dataInfoIndex) => {
        const keArr = {
            0: '正常运行荷载工况',
            1: '极端荷载工况',
            2: '疲劳荷载工况（上限）',
            3: '疲劳荷载工况（下限）',
        };

        // 清空现有数据
        formState.value[dataInfoIndex].dataInfo = [];

        // 创建4种荷载工况
        for (let i = 0; i < 4; i++) {
            const newItem = { ...dataIndexObject.value };
            newItem.towerLoadType = keArr[i];
            formState.value[dataInfoIndex].dataInfo.push(newItem);
            formState.value[dataInfoIndex].columns = JSON.parse(JSON.stringify(props.columns));
        }
    };
    // 填充重量数据
    const fillWeightData = (dataInfoIndex) => {
        const currentData = formState.value[dataInfoIndex];
        // 计算需要的数据项数量
        const requiredItems = currentData.num + 1;
        const currentItems = currentData.dataInfo.length;
        const diff = requiredItems - currentItems;
        if (currentItems === 0) {
            for (let i = 0; i <= currentData.num; i++) {
                currentData.dataInfo.push(createNewDataItem(i, currentData));
            }
            return;
        }

        // 添加缺少的项
        if (diff > 0) {
            const startIndex = currentItems;
            for (let i = 0; i < diff; i++) {
                currentData.dataInfo.push(createNewDataItem(startIndex + i, currentData));
            }
        }
        // 删除多余的项
        else if (diff < 0) {
            currentData.dataInfo.splice(currentData.num + 1, -diff);
        }
    };
    // 填充数据
    const fillData = (index) => {
        try {
            const dataInfoIndex = index ?? formState.value.length - 1;

            if (props.windType === 'weight') {
                fillWeightData(dataInfoIndex);
            } else {
                fillLoadData(dataInfoIndex);
            }

            // console.log('formState:', formState.value);
        } catch (error) {
            console.error('填充数据时出错:', error);
        }
    };
    // 更新数据
    const updateData = (val) => {
      isWindWeight.value = val.length > 0 ? 1 : 0;
        let obj = [
            {
                hubHeight: 115,
                num: 5,
                dataInfo: [],
            },
        ];
        if (val && val.length > 0) {
            val.forEach((m) => {
                m.columns = JSON.parse(JSON.stringify(props.columns));
                // 兼容之前的数据格式
                m.dataInfo.forEach((n) => {
                    n.material = n.material ? n.material : 'Q355';
                    n.tmm = n.tmm ? n.tmm : '33';
                });
            });
        }
        formState.value = val && val.length > 0 ? val : [...obj];
        // 针对每一项增加columns
        formState.value.forEach((m) => {
            // 根据轮毂高度更新必填状态
            if (props.filedsData.length && val && val.length > 0) {
                updateColumns(m);
            }
        });

        updateHeightOptions();
    };
    // 初始化是否禁用
    const changeDisabled = (column, record, index, partent, parentIndex) => {
        // console.log(partent,parentIndex,'我就是看看', column.dataIndex, record, index);
        if (column.dataIndex == 'weight' && index !== 0) {
            return true;
        }
        if (partent.hubHeight > 140) {
            if (
                (column.dataIndex == 'tmm' && index == 0) ||
                (column.dataIndex == 'material' && index == 0)
            ) {
                return true;
            }
        }
        if (partent.hubHeight <= 140) {
            if (column.dataIndex == 'tmm' || column.dataIndex == 'material') {
                return true;
            }
        }
        return false;
    };
    // 初始化列配置
    const initColumns = () => {
        formState.value.forEach((val) => {
            val.columns = JSON.parse(JSON.stringify(props.columns));
            // 根据轮毂高度更新必填状态
            if (props.filedsData.length) {
                updateColumns(val);
            }
        });
        // dataIndexObject.value = props.columns.reduce((acc, column) => {
        //     acc[column.dataIndex] = '';
        //     return acc;
        // }, {});
        dataIndexObject.value = Object.fromEntries(props.columns.map((col) => [col.dataIndex, '']));
    };
    // 根据formState.value中的轮毂高度，如果大于140时，formState.value中对应项中的columns字段中的部分值需要更改成必填的
    const updateColumns = (val) => {
        const isHighTower = val.hubHeight > 140;
        val.columns.forEach((col) => {
            const matchedField = props.filedsData.find((item) => item.filed === col.dataIndex);
            if (matchedField) {
                col.required = isHighTower;
            }
        });
    };

    // 其他校验规则
    const validateTowerForm = () => {
        // 重置错误状态
        errorState.value = {
            visible: false,
            errors: [],
        };

        let errors = [];

        formState.value.forEach((val, valIndex) => {
            const isHighTower = val.hubHeight > 140;
            const valName = `风机${valIndex + 1}`;

            // 校验塔筒节数据
            val.dataInfo.forEach((row, rowIndex) => {
                const sectionName = `${valName} - ${`第${rowIndex + 1}节`}`;
                // 校验重量
                if (
                    rowIndex == 0 &&
                    (row.weight === undefined || row.weight === null || row.weight === '')
                ) {
                    const column = val.columns.find((c) => c.dataIndex === 'weight');
                    errors.push({
                        title: '字段未填写',
                        location: sectionName,
                        description: `${column?.title} 为空`,
                        expected: `请输入${column?.title}`,
                        field: 'weight',
                    });
                }

                // 轮毂高度 >140m 时的校验
                if (isHighTower) {
                    // 校验材料必填
                    if (!row.material) {
                        errors.push({
                            title: '材料缺失',
                            location: sectionName,
                            description: '未填写塔筒材料',
                            expected: '轮毂高度 >140m 时必须填写材料',
                            field: 'material',
                        });
                    }

                    const tmmRaw = row.tmm;

                    if (!tmmRaw && tmmRaw !== 0) {
                        errors.push({
                            title: '壁厚缺失',
                            location: sectionName,
                            description: '未填写塔筒壁厚',
                            expected: '轮毂高度 >140m 时必须填写壁厚',
                            field: 'tmm',
                        });
                    } else {
                        const tmm = parseFloat(tmmRaw);
                        if (isNaN(tmm)) {
                            errors.push({
                                title: '壁厚格式错误',
                                location: sectionName,
                                description: `壁厚值: ${tmmRaw}`,
                                expected: '必须为有效数字',
                                field: 'tmm',
                            });
                        } else if (tmm < 10 || tmm > 1000) {
                            errors.push({
                                title: '壁厚超出范围',
                                location: sectionName,
                                description: `壁厚值: ${tmm} mm`,
                                expected: '壁厚必须在 10mm 到 1000mm 之间',
                                field: 'tmm',
                            });
                        }
                    }
                }
            });

            // 材料分布校验（仅对轮毂高度 >140m 的风机）
            if (isHighTower && val.dataInfo.length > 0) {
                validateMaterialDistribution(val, valIndex, errors);
            }
        });
        return errors;
    };

    // 校验材料分布规则
    const validateMaterialDistribution = (val, valIndex, errors) => {
        const valName = `风机${valIndex + 1}`;
        const dataList = val.dataInfo;

        if (dataList.length <= 1) return;

        // 从第二节开始
        const sectionMaterials = dataList.slice(1).map((item) => item.material);

        // 1. 如果全部一致，全部报错
        const uniqueMaterials = [...new Set(sectionMaterials)];
        if (uniqueMaterials.length === 1) {
            sectionMaterials.forEach((mat, i) => {
                errors.push({
                    title: '材料分布错误',
                    location: `${valName} - 第${i + 2}节`,
                    description: `全部使用相同材料 ${mat}`,
                    expected: '需包含一次材料变化（Q355→C80 或 C80→Q355）',
                    field: 'material',
                });
            });
            return;
        }

        // 2. 找出第一个变化点
        let firstChangeIdx = -1;
        for (let i = 1; i < sectionMaterials.length; i++) {
            if (sectionMaterials[i] !== sectionMaterials[i - 1]) {
                firstChangeIdx = i;
                break;
            }
        }
        if (firstChangeIdx === -1) return;

        // 3. 设定从首次变化之后，材料应为 sectionMaterials[firstChangeIdx]
        const expectedMaterial = sectionMaterials[firstChangeIdx];

        for (let i = firstChangeIdx; i < sectionMaterials.length; i++) {
            if (sectionMaterials[i] !== expectedMaterial) {
                errors.push({
                    title: '变化后材料不一致',
                    location: `${valName} - 第${i + 2}节`,
                    description: `应为 ${expectedMaterial}，实际为 ${sectionMaterials[i]}`,
                    expected: '材料变化后所有节段应保持一致',
                    field: 'material',
                });
            }
        }
    };

    onBeforeMount(() => {
        initColumns();
    });
    onMounted(() => {
        if (!route.query.type) {
            if (isWindWeight.value) {
                fillData();
            }
        } else {
            // 编辑；编辑时更新数据
        }
    });
    // 暴露给父组件
    defineExpose({ formState, validateFormState, updateData });
</script>
<style scoped lang="scss">
    .wind-weight {
        .wind-weight-header {
            span {
                color: #036b64;
                font-weight: bold;
                cursor: pointer;
            }
        }
        .add-wind-table {
            width: calc(80% - 30px);
            margin-top: 20px;
            position: relative;
            .add-wind-table-ul {
                display: flex;
                background: #f2f7f7;
                height: 60px;

                li {
                    display: flex;
                    justify-content: center; // 水平居中
                    align-items: center; // 垂直居中
                    margin: 0 20px;
                    span {
                        margin-right: 15px;
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
        }
        .add-empty-memo {
            margin-top: 20px;
            color: rgba(187, 187, 187, 1);
            font-size: 14px;
        }
        .cell-wrapper {
            position: relative;
            // height: 50px;
        }
        .error-input {
            border-color: #ff4d4f !important;
        }
        .error-tip {
            color: #ff4d4f;
            font-size: 12px;
            line-height: 12px;
            margin-top: 5px;
            // position: absolute;
            // bottom: -18px;
            // left: 0;
        }
    }
</style>
