<template>
    <a-form
        ref="formStateSpeedRef"
        :model="formStateSpeed"
        name="windDeviceSpeedForm"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
    >
        <a-row :gutter="24">
            <a-col :span="8">
                <a-form-item
                    label="切入风速"
                    name="cutInWindSpeed"
                    :rules="[{ required: true, ElMessage: '请输入切入风速' }]"
                >
                    <a-input-number
                        v-model:value="formStateSpeed.cutInWindSpeed"
                        placeholder="请输入"
                        :min="1"
                        :max="6"
                        :precision="1"
                        style="width: 100%"
                        addon-after="m/s"
                        @change="changeSpeed"
                        @step="changeSpeed"
                    />
                </a-form-item>
            </a-col>
            <a-col :span="8">
                <a-form-item
                    label="切出风速"
                    name="cutoutWindSpeed"
                    :rules="[{ required: true, ElMessage: '请输入切出风速' }]"
                >
                    <a-input-number
                        v-model:value="formStateSpeed.cutoutWindSpeed"
                        placeholder="请输入"
                        :min="10"
                        :max="30"
                        :precision="1"
                        style="width: 100%"
                        addon-after="m/s"
                        @change="changeSpeed"
                        @step="changeSpeed"
                    />
                </a-form-item>
            </a-col>
            <a-col :span="8">
                <a-form-item
                    label="风速间隔"
                    name="wslnterval"
                    :rules="[{ required: true, ElMessage: '请选择风速间隔' }]"
                >
                    <a-select
                        @change="changeSpeed"
                        v-model:value="formStateSpeed.wslnterval"
                        placeholder="请选择"
                    >
                        <a-select-option :value="0.5">0.5m/s</a-select-option>
                        <a-select-option :value="1">1m/s</a-select-option>
                    </a-select>
                </a-form-item>
            </a-col>
        </a-row>
    </a-form>
    <div
        v-if="dynamicColumns.length"
        :class="
            isChangeColumn == 'vertical'
                ? 'vertical-table-wrapper'
                : 'vertical-table-wrapper-column'
        "
    >
        <!-- 左侧固定表头 -->
        <div :class="isChangeColumn == 'vertical' ? 'vertical-header' : 'vertical-header-column'">
            <div
                class="header-cell fixed-cell"
                :style="{
                    height: errorState.visible && isChangeColumn == 'vertical' ? '60px' : '70px',
                }"
                >风速 (m/s)</div
            >
            <div
                class="header-cell fixed-cell fixed-cell-required"
                :style="{
                    height: errorState.visible && isChangeColumn == 'vertical' ? '60px' : '70px',
                }"
                >功率 (kW)<span>*</span></div
            >
            <div
                class="header-cell fixed-cell fixed-cell-required"
                :style="{
                    height: errorState.visible && isChangeColumn == 'vertical' ? '60px' : '70px',
                }"
                >Ct <span>*</span></div
            >
        </div>

        <!-- 可滚动内容区域 -->
        <div
            :class="isChangeColumn == 'vertical' ? 'vertical-body' : 'vertical-body-column'"
            ref="tableBody"
            @scroll="handleScroll"
        >
            <!-- 动态列 - 使用虚拟滚动优化 -->
            <template v-for="(col, index) in dynamicColumns" :key="col.speed">
                <div
                    :class="
                        isChangeColumn == 'vertical' ? 'vertical-column' : 'vertical-column-line'
                    "
                >
                    <div
                        class="data-cell speed-cell"
                        :style="{ height: errorState.visible ? '60px' : '70px' }"
                    >
                        {{ col.speed }}
                    </div>
                    <div
                        class="data-cell data-cell-tip"
                        :style="{ height: errorState.visible ? '60px' : '70px' }"
                    >
                        <a-input-number
                            :style="{ width: isChangeColumn == 'vertical' ? 'auto' : '170px' }"
                            placeholder="请输入"
                            :min="1"
                            :max="100000"
                            @blur="col.power = truncateToTwoDecimals(col.power)"
                            @keyup.enter="col.power = truncateToTwoDecimals(col.power)"
                            v-model:value="col.power"
                            @paste="(e) => handlePaste(e, index, 'power')"
                            @focus="setActiveCell(index, 'power')"
                            :class="{
                                'error-input': hasError(index, 'power'),
                            }"
                        />
                        <div v-if="hasError(index, 'power')" class="error-tip">
                            {{ getErrorMessage(index, 'power') }}
                        </div>
                    </div>
                    <div
                        class="data-cell data-cell-tip"
                        :style="{ height: errorState.visible ? '60px' : '70px' }"
                    >
                        <a-input-number
                            :style="{ width: isChangeColumn == 'vertical' ? 'auto' : '170px' }"
                            placeholder="请输入"
                            v-model:value="col.thrust"
                            @paste="(e) => handlePaste(e, index, 'thrust')"
                            :min="0.0001"
                            :max="2"
                            :precision="4"
                            @focus="setActiveCell(index, 'thrust')"
                            :class="{
                                'error-input': hasError(index, 'thrust'),
                            }"
                        />
                        <div v-if="hasError(index, 'thrust')" class="error-tip">
                            {{ getErrorMessage(index, 'thrust') }}
                        </div>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup>
    import { ref, reactive, toRefs, onBeforeMount, onMounted, watchEffect, computed } from 'vue';
    import { ElMessage } from 'element-plus'
    import { debounce } from 'lodash-es';
    const props = defineProps({
        isChangeColumn: {
            type: String,
            default: 'column',
        },
    });

    // 表单元素
    const formStateSpeedRef = ref(null);
    // 风速表单
    const formStateSpeed = ref({
        cutInWindSpeed: '',
        cutoutWindSpeed: '',
        wslnterval: 0.5, // Todo 还需要重新修改
    });
    // 改变数值
    const changeSpeed = (e) => {
        console.log('打印一下数值', e);
        if (e) {
            generateColumns();
        } else {
            dynamicColumns.value = [];
        }
    };

    // 截断到2位小数，不四舍五入
    const truncateToTwoDecimals = (value) => {
        console.log('value', value);
        if (value == null || value === '' || isNaN(parseFloat(value))) return '';
        
        const numStr = value.toString();
        const [integerPart, decimalPart = ''] = numStr.split('.');

        // 3. 处理小数部分：只取前两位，不足则补0
        const truncatedDecimal = decimalPart.slice(0, 2).padEnd(2, '0');

        // 4. 拼接并转回数字
        const resultStr = `${integerPart}.${truncatedDecimal}`;
        return Number(resultStr);
    };

    // 表格相关
    const dynamicColumns = ref([]);
    const tableBody = ref(null);
    const scrollLeft = ref(0);

    // 当前活动单元格（用于高级粘贴）
    const activeCell = ref({ index: 0, field: 'power' });

    // 生成动态列
    const generateColumns = async () => {
        try {
            // 参数校验
            if (formStateSpeed.value.cutInWindSpeed > formStateSpeed.value.cutoutWindSpeed) return;
            //    ElMessage.error('起始值不能大于结束值');
            // 计算列数限制
            const maxColumns = 200;
            const calculatedColumns =
                Math.floor(
                    (formStateSpeed.value.cutoutWindSpeed - formStateSpeed.value.cutInWindSpeed) /
                        formStateSpeed.value.wslnterval,
                ) + 1;
            if (calculatedColumns > maxColumns) {
                ElMessage.error(`列数过多，最多支持 ${maxColumns} 列`);
            }

            // 生成新列数据
            const newColumns = [];
            let current = formStateSpeed.value.cutInWindSpeed;

            while (current <= formStateSpeed.value.cutoutWindSpeed) {
                const speed = parseFloat(current.toFixed(2));
                const existingCol = dynamicColumns.value.find((c) => c.speed === speed);

                newColumns.push({
                    speed,
                    power: existingCol?.power || '',
                    thrust: existingCol?.thrust || '',
                });

                current = parseFloat((current + formStateSpeed.value.wslnterval).toFixed(2));
            }

            dynamicColumns.value = newColumns;
            // ElMessage.success(`成功生成 ${newColumns.length} 列数据`);
        } catch (error) {
            if (!formStateSpeed.value.cutInWindSpeed || !formStateSpeed.value.cutoutWindSpeed) {
                ElMessage.error('请输入切入风速、切出风速');
            }
            console.error('生成列失败:', error);
        } finally {
        }
    };

    // 处理粘贴事件
    const handlePaste = (event, startIndex, fieldType) => {
        event.preventDefault();

        try {
            const clipboardData = event.clipboardData || window.clipboardData;
            const pastedData = clipboardData.getData('text');

            if (!pastedData.trim()) {
                ElMessage.error('粘贴内容为空');
            }

            // 解析数据
            const rows = parsePastedData(pastedData);
            if (props.isChangeColumn === 'vertical') {
                // 验证数据格式
                // let flag = validatePasteData(rows, fieldType);
                // if (flag) {
                //     ElMessage.error('功率/Ct列里面的数据不符合要求');
                //     return;
                // }
                // 更新数据
                upataVerticalData(rows, startIndex, fieldType);
                // ElMessage.success(`成功粘贴 ${rows.length} 行数据`);
            } else {
                // 验证数据格式
                // let flag = validateColumnPasteData(rows, fieldType);
                // if (flag) {
                //     ElMessage.error('功率/Ct列里面的数据不符合要求');
                //     return;
                // }
                updateColumnData(rows, startIndex);
                // ElMessage.success(`成功粘贴 ${rows.length} 行数据`);
            }
        } catch (error) {
            ElMessage.error(`粘贴失败: ${error.ElMessage}`);
            console.error('粘贴错误:', error);
        }
    };

    // 解析粘贴数据
    const parsePastedData = (data) => {
        return data
            .trim()
            .split(/\r\n|\n|\r/)
            .map((row) => row.split('\t').map((cell) => cell.trim()));
    };

    // 验证行粘贴数据
    const validatePasteData = (rows, fieldType) => {
        // 水平单行粘贴验证
        if (rows?.length > 2) {
            rows = rows.slice(0, 2);
            ElMessage.warning('粘贴行数超出现有数据行数，将截断至前2行）');
        }
        // 验证第一行是否全部符合isValid
        const firstRowValid = rows[0]?.every((value) => isValid(value)) ?? false;
        // 验证第二行是否全部符合isValidCt
        const secondRowValid = rows[1]?.every((value) => isValidCt(value)) ?? false;

        // 错误标志组合
        return !(firstRowValid && secondRowValid);
    };

    // 更新列数据
    const upataVerticalData = (rows, startIndex, fieldType) => {
        rows = rows.slice(0, 2);
        rows.forEach((row, rowOffset) => {
            const currentField =
                rowOffset === 0 ? fieldType : fieldType === 'power' ? 'thrust' : 'power';

            row.forEach((value, colOffset) => {
                const targetIndex = startIndex + colOffset;
                if (targetIndex < dynamicColumns.value.length) {
                    dynamicColumns.value[targetIndex][currentField] = value;
                }
            });
        });

        console.log('数据更新:');
    };
    // 验证列站贴数据
    const validateColumnPasteData = (rows) => {
        const isValidColumnCount = rows.every((row) => row.length === 2);
        if (!isValidColumnCount) {
            ElMessage.warning('每行只能粘贴两列数据,将截断至前2列');
        }
        if (rows.length > 1) {
            const isValidNumbers = rows.every(([power, thrust]) => {
                return isValid(power) && isValidCt(thrust);
            });
        }

        return isValidNumbers;
    };
    // 新增列模式数据更新方法
    const updateColumnData = (rows, startIndex) => {
        rows.forEach(([power, thrust], rowIndex) => {
            const targetIndex = startIndex + rowIndex;
            if (targetIndex < dynamicColumns.value.length) {
                dynamicColumns.value[targetIndex].power = power;
                dynamicColumns.value[targetIndex].thrust = thrust;
            }
        });
    };

    // 设置当前活动单元格
    const setActiveCell = (index, field) => {
        activeCell.value = { index, field };
    };

    // 处理滚动事件（虚拟滚动）
    const handleScroll = debounce(() => {
        if (tableBody.value) {
            scrollLeft.value = tableBody.value.scrollLeft;
        }
    }, 50);
    const errorState = ref({
        visible: false,
        errors: [],
    });
    // 验证功率：
    const isValid = (value) => {
        return (
            value !== '' &&
            /^(?:[1-9]\d{0,4}(?:\.\d{1,5})?|0(?:\.\d{1,5})?)$/.test(value) &&
            parseFloat(value) >= 0 &&
            parseFloat(value) <= 100000
        );
    };
    // 验证ct
    const isValidCt = (value) => {
        return (
            // value !== '' &&
            // /^(0(\.\d{1,4})?|1(\.0{1,4})?|2(\.0{1,4})?)$/.test(value) &&
            // parseFloat(value) >= 0 &&
            // parseFloat(value) <= 2
            value !== '' &&
            /^(?:[01](?:\.\d{1,4})?|2(?:\.0{1,4})?)$/.test(value)
        );
    };
    // 校验数据是否完整
    const checkDataRequried = () => {
        errorState.value.errors = [];
        formStateSpeedRef.value.validateFields().then(() => {
            dynamicColumns.value.forEach((col, index) => {
                if (!isValid(col.power)) {
                    errorState.value.errors.push({
                        type: 'power',
                        index,
                        ElMessage: `第${index + 1}列${getErrorMessage(index, 'power')}`,
                    });
                }
                if (!isValidCt(col.thrust)) {
                    errorState.value.errors.push({
                        type: 'thrust',
                        index,
                        ElMessage: `第${index + 1}列${getErrorMessage(index, 'thrust')}`,
                    });
                }
            });
        });
        return errorState.value;
    };
    const hasError = (index, field) => {
        return errorState.value.errors.some((err) => err.index === index && err.type === field);
    };

    const getErrorMessage = (index, field) => {
        const msg = field === 'power' ? '功率值' : 'Ct值';
        return `格式错误，${field === 'power' ? '0~100000，整数' : '0~2，4位小数点'}`;
    };
    const updateData = (val) => {
        formStateSpeed.value = Object.keys(formStateSpeed.value).reduce(
            (acc, key) => {
                if (val.allData.hasOwnProperty(key)) {
                    acc[key] = val.allData[key];
                }
                return acc;
            },
            { ...formStateSpeed.value },
        );
        dynamicColumns.value = val.powerThrustCurveList;
        console.log('power数据', formStateSpeed.value);
    };
    onBeforeMount(() => {
        // generateColumns();
    });
    onMounted(() => {});

    defineExpose({
        checkDataRequried,
        dynamicColumns,
        formStateSpeed,
        updateData,
    });
</script>
<style scoped lang="scss">
  @import '../addWindDevice.scss';
</style>
