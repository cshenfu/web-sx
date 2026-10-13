<template>
    <div class="road-data-template">
        <header class="resource-management-header">线路数据</header>
        <div>
            <p class="sub-title">>>>原数据：</p>
            <div class="origin-data-content">
                <p>线路铺设方式： {{ boxLoopsType == 1 ? '架空线路' : '电缆铺设' }}</p>
                <p>回路数： {{ boxLoopsData.length }}</p>
                <p v-for="item in boxLoopsData">{{ item }}</p>
            </div>
            <p class="sub-title">>>>调整数据：</p>
            <div class="adjust-data-content">
                <p>
                    <span>线路铺设方式</span>
                    <a-select
                        v-model:value="boxLoopsType"
                        style="width: 215px"
                        placeholder="请选择"
                        :disabled="true"
                        :options="[
                            {
                                value: 1,
                                label: '架空线路',
                            },
                            {
                                value: 2,
                                label: '电缆铺设',
                            },
                        ]"
                        @change="handleChange"
                    ></a-select>
                </p>
                <p>
                    <span>回路数</span>
                    <a-input-number
                        :controls="false"
                        v-model:value="lineNumber"
                        @blur="lineNumberChangeEvent"
                        placeholder="请输入"
                        min="1"
                        max="10"
                        addon-after="回"
                    ></a-input-number>
                </p>
                <TableList
                    :tableData="lineListData"
                    :bordered="true"
                    :isShowPage="false"
                    :tableColumn="ADJUST_LINE_CLOUMN"
                >
                    <template #fanNumber="{ record }">
                        <a-input
                            placeholder="请输入"
                            v-model:value="record['fanNumber']"
                            style="width: 100%; font-size: 12px"
                        ></a-input>
                    </template>
                    <template #value1="{ record }">
                        <a-input-number
                            placeholder="请输入"
                            v-model:value="record['value1']"
                            :controls="false"
                            style="width: 100%; font-size: 12px"
                        ></a-input-number>
                    </template>
                    <template #value2="{ record }">
                        <a-input
                            placeholder="请输入"
                            v-model:value="record['value2']"
                            style="width: 100%; font-size: 12px"
                        ></a-input>
                    </template>
                </TableList>
            </div>
        </div>
        <header class="resource-management-header">集电线路工程量表</header>
        <a-tabs v-model:activeKey="activeKey" type="card">
            <template v-if="boxLoopsType == 1">
                <a-tab-pane key="1" tab="导、地线材料量表">
                    <TableList
                        :tableData="wireMaterialDataList"
                        :bordered="true"
                        :isShowPage="false"
                        :tableColumn="LINE_MATERIAL_CLOUMN"
                    >
                        <template #totalWeight="{ record }">
                            <a-input-number
                                placeholder="请输入"
                                v-model:value="record['totalWeight']"
                                :controls="false"
                                :disabled="true"
                                style="width: 100%; font-size: 12px"
                                @input="isWireMaterialChange = 1"
                            ></a-input-number>
                        </template>
                        <template #quantity="{ record }">
                            <a-input-number
                                placeholder="请输入"
                                v-model:value="record['quantity']"
                                :controls="false"
                                style="width: 100%; font-size: 12px"
                                @input="isWireMaterialChange = 1"
                                @blur="computedTotalWeight(record)"
                            ></a-input-number>
                        </template>
                    </TableList>
                </a-tab-pane>
                <a-tab-pane key="2" tab="绝缘子、主要金具及其它材料量表">
                    <TableList
                        :tableData="hardwareMaterialDataList"
                        :bordered="true"
                        :isShowPage="false"
                        :tableColumn="INSULATION_LINE_CLOUMN"
                    >
                        <template #quantity="{ record }">
                            <a-input-number
                                placeholder="请输入"
                                v-model:value="record['quantity']"
                                :controls="false"
                                style="width: 100%; font-size: 12px"
                                @input="isHardwareMaterialChange = 1"
                            ></a-input-number>
                        </template>
                    </TableList>
                </a-tab-pane>
                <a-tab-pane key="3" tab="结构部分材料表">
                    <TableList
                        :tableData="structureMaterialDataList"
                        :bordered="true"
                        :isShowPage="false"
                        :tableColumn="STRUCTURE_MATERIAL_CLOUMN"
                    >
                        <template #total="{ record }">
                            <a-input-number
                                placeholder="请输入"
                                v-model:value="record['total']"
                                :controls="false"
                                style="width: 100%; font-size: 12px"
                                @input="isStructureMaterialChange = 1"
                            ></a-input-number>
                        </template>
                    </TableList>
                </a-tab-pane>
                <a-tab-pane key="4" tab="电缆土建量表">
                    <TableList
                        :tableData="cableMaterialDataList"
                        :bordered="true"
                        :isShowPage="false"
                        :tableColumn="CABLE_MATERIAL_CLOUMN"
                    >
                        <template #total="{ record }">
                            <a-input-number
                                placeholder="请输入"
                                v-model:value="record['total']"
                                :controls="false"
                                style="width: 100%; font-size: 12px"
                                @input="isCableMaterialChange = 1"
                            ></a-input-number>
                        </template>
                    </TableList>
                </a-tab-pane>
            </template>
            <a-tab-pane key="5" tab="电缆铺设工程量表" v-else>
                <TableList
                    :tableData="cableMaterialDataList"
                    :bordered="true"
                    :isShowPage="false"
                    :tableColumn="CABLE_LAYING_MATERIAL_CLOUMN"
                >
                    <template #total="{ record }">
                        <a-input-number
                            placeholder="请输入"
                            v-model:value="record['total']"
                            :controls="false"
                            style="width: 100%; font-size: 12px"
                            @input="isCableLayingMaterialChange = 1"
                        ></a-input-number>
                    </template>
                </TableList>
            </a-tab-pane>
        </a-tabs>
    </div>
</template>
<script setup>
    import { ref, watch } from 'vue';
    import TableList from '@/components/tableList/TableList.vue';
    import {
        ADJUST_LINE_CLOUMN,
        LINE_MATERIAL_CLOUMN,
        INSULATION_LINE_CLOUMN,
        STRUCTURE_MATERIAL_CLOUMN,
        CABLE_MATERIAL_CLOUMN,
        CABLE_LAYING_MATERIAL_CLOUMN,
    } from './LineData.js';
    import { message } from 'ant-design-vue';
    const brString = '\r\t\t\t\t\t\t\t\t\t';
    const props = defineProps({
        resourceData: {
            type: Array,
            default: () => [],
        },
        projectId: {
            type: String,
            default: '',
        },
    });
    const boxLoopsType = ref(1);
    const boxLoopsDesc = ref('');
    const boxLoopsData = ref([]);
    const fanData = ref([]);
    const kVNumber = ref('');
    const activeKey = ref('1');
    // 导地线材料
    const wireMaterialDataList = ref([]);
    // 绝缘子材料
    const hardwareMaterialDataList = ref([]);
    // 结构部分材料
    const structureMaterialDataList = ref([]);
    // 电缆土建材料
    const cableMaterialDataList = ref([]);
    // 电缆铺设材料
    const cableLayingMaterialDataList = ref([]);

    const isWireMaterialChange = ref(0);
    const isHardwareMaterialChange = ref(0);
    const isStructureMaterialChange = ref(0);
    const isCableMaterialChange = ref(0);
    const isCableLayingMaterialChange = ref(0);
    const lineNumber = ref('');
    const layWay = ref(null);
    const numberList = ['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ', 'Ⅵ', 'Ⅶ', 'Ⅷ', 'Ⅸ', 'Ⅹ'];
    const lineListData = ref([]);
    const lineNumberChangeEvent = () => {
        if (!lineNumber.value) {
            return false;
        }
        if (lineListData.value.length < lineNumber.value) {
            for (let index = lineListData.value.length; index < lineNumber.value; index++) {
                const obj = {
                    number: numberList[index],
                    fanNumber: '',
                    value1: '',
                    value2: '',
                };
                lineListData.value.push(obj);
            }
        } else if (lineListData.value.length > lineNumber.value) {
            lineListData.value.splice(lineNumber.value);
        }
    };
    // 过滤出kV数值
    const extractKVNumbers = (str) => {
        // 匹配"kV"开头 + 数字 + "kV"的模式
        const regex = /\d+kV/g;
        const matches = str.match(regex);
        return matches; // 无匹配时返回空数组
    };
    // 过滤出所有的风机
    const extractXZNumbers = (str) => {
        // 匹配"XZ"开头 + 数字 + "#"的模式
        const regex = /XZ\d+#/g;
        const matches = str.match(regex);
        return matches; // 无匹配时返回空数组
    };
    // 计算导线重量总计
    const computedTotalWeight = (record) => {
        if (record['name'] == '导线') {
            record['totalWeight'] = record['quantity'] * record['weightPerUnit'] * 3 * 1.1 * (record['model'].includes('双回') ? 2 : 1) / 1000;
            record['totalWeight'] = record['totalWeight'].toFixed(1)
        }
    }
    watch(
        () => props.resourceData,
        (val) => {
            if (props.resourceData.length) {
                const data = props.resourceData;
                console.log('线路数据', data);
                // 处理回路数据
                const boxLoopsOriginData = data.filter((item) => item.dataType == 5);
                if (boxLoopsOriginData.length > 0 && boxLoopsOriginData[0]['jsonList']) {
                    boxLoopsDesc.value = boxLoopsOriginData[0]['jsonList'];
                    boxLoopsType.value = boxLoopsDesc.value.includes('架空线路') ? 1 : 2;
                    activeKey.value = boxLoopsType.value == 1 ? '1' : '5';
                    const loopsDesc = boxLoopsOriginData[0]['jsonList']
                        .replace(/\r\t\t\t\t\t\t\t\t\t/g, '<hr />')
                        .trim();
                    const loopsData = loopsDesc.split('<hr />');
                    console.log(loopsData);
                    loopsData.length > 1 && loopsData.shift();
                    boxLoopsData.value = JSON.parse(JSON.stringify(loopsData)) || [];
                    fanData.value = extractXZNumbers(loopsDesc) || [];
                    kVNumber.value = extractKVNumbers(loopsDesc)
                        ? extractKVNumbers(loopsDesc)[0]
                        : '';
                }
                if (boxLoopsType.value == 1) {
                    // 架空线路
                    // 处理导地线数据
                    const wireMaterialOriginData = data.filter((item) => item.dataType == 1);
                    if (wireMaterialOriginData.length && wireMaterialOriginData[0]['jsonList']) {
                        wireMaterialDataList.value =
                            JSON.parse(wireMaterialOriginData[0]['jsonList']) || [];
                        if (wireMaterialDataList.value.length) {
                            // 去除第一条数据（假表头）
                            wireMaterialDataList.value.shift();
                        }
                    }
                    // 处理绝缘子数据
                    const hardwareMaterialOriginData = data.filter((item) => item.dataType == 2);
                    if (
                        hardwareMaterialOriginData.length &&
                        hardwareMaterialOriginData[0]['jsonList']
                    ) {
                        hardwareMaterialDataList.value =
                            JSON.parse(hardwareMaterialOriginData[0]['jsonList']) || [];
                        if (hardwareMaterialDataList.value.length) {
                            // 删除第一条数据（假表头）
                            hardwareMaterialDataList.value.shift();
                        }
                    }
                    // 处理结构部分数据
                    const structureMaterialOriginData = data.filter((item) => item.dataType == 3);
                    if (
                        structureMaterialOriginData.length &&
                        structureMaterialOriginData[0]['jsonList']
                    ) {
                        structureMaterialDataList.value =
                            JSON.parse(structureMaterialOriginData[0]['jsonList']) || [];
                        if (structureMaterialDataList.value.length) {
                            // 删除第一条数据（假表头）
                            structureMaterialDataList.value.shift();
                        }
                    }
                    // 处理电缆数据
                    const cableMaterialOriginData = data.filter((item) => item.dataType == 4);
                    if (cableMaterialOriginData.length && cableMaterialOriginData[0]['jsonList']) {
                        cableMaterialDataList.value =
                            JSON.parse(cableMaterialOriginData[0]['jsonList']) || [];
                        if (cableMaterialDataList.value.length) {
                            // 删除第一条数据（假表头）
                            cableMaterialDataList.value.shift();
                        }
                    }
                } else {
                    // 电缆铺设
                    // 处理电缆铺设数据
                    const cableLayingMaterialOriginData = data.filter((item) => item.dataType == 6);
                    if (
                        cableLayingMaterialOriginData.length &&
                        cableLayingMaterialOriginData[0]['jsonList']
                    ) {
                        cableLayingMaterialDataList.value =
                            JSON.parse(cableLayingMaterialOriginData[0]['jsonList']) || [];
                        if (cableLayingMaterialDataList.value.length) {
                            // 删除第一条数据（假表头）
                            cableLayingMaterialDataList.value.shift();
                        }
                    }
                }
            }
        },
        {
            immediate: true,
            deep: true,
        },
    );
    const checkNewLoopsData = () => {
        let key = true;
        // 判断是否存在空对象
        const hasEmptyObject = (arr) => {
            const isEmptyValue = (val) => val === null || val === undefined || val === '';
            return arr.some((obj) => Object.values(obj).some(isEmptyValue));
        };
        const isEmpty = hasEmptyObject(lineListData.value);
        if (isEmpty) {
            message.error('请填写完整数据！');
            key = false;
        }
        // 判断调整的风机编号和原有的编号是否全部包含
        let newFanData = [];
        lineListData.value.forEach((item) => {
            const fanItem = item.fanNumber ? item.fanNumber.trim().split('、') : [];
            newFanData = [...newFanData, ...fanItem];
        });
        newFanData = [...new Set(newFanData)];
        const areArraysEqual = (arr1, arr2) => {
            // 长度不同直接返回false
            if (arr1.length !== arr2.length) return false;

            // 创建频率计数器
            const frequencyMap = new Map();

            // 统计arr1的元素频率
            for (const item of arr1) {
                frequencyMap.set(item, (frequencyMap.get(item) || 0) + 1);
            }

            // 验证arr2的元素是否匹配
            for (const item of arr2) {
                if (!frequencyMap.has(item)) return false;
                const count = frequencyMap.get(item);
                if (count <= 0) return false;
                frequencyMap.set(item, count - 1);
            }

            // 确保所有计数归零
            return [...frequencyMap.values()].every((count) => count === 0);
        };
        if (!areArraysEqual(newFanData, fanData.value)) {
            message.error('请检查各回路是否存在重复的风机编号或遗漏的风机编号！');
            key = false;
        }
        return key;
    };
    const postData = () => {
        // 处理回路数据
        const lineLoopsObj = {
            dataClassify: 3,
            dataType: 5,
            isChange: 0,
            projectId: props.projectId,
            dataJson: '',
        };
        if (lineNumber.value) {
            // 调整过回路数据，需要验证和处理
            let dataStr = `${lineNumber.value}回${kVNumber.value}集电线路，分别为`;
            let loopsStr = '';
            let loopsItemStr = '';
            if (checkNewLoopsData()) {
                lineListData.value.forEach((item, itemIndex) => {
                    loopsStr += item.number + '/';
                    loopsItemStr +=
                        `${item.number}回集电线路连接：${item.fanNumber}，${item.fanNumber.split('、').length}台风机，输出容量${item.value1}MW，${boxLoopsType.value == 1 ? '架空线路' : '电缆铺设'}长度约${item.value2}km；` +
                        (itemIndex !== lineListData.value.length - 1 ? brString : '');
                });
            } else {
                return
            }
            dataStr += loopsStr + '回，其中：' + brString + loopsItemStr;
            lineLoopsObj.isChange = 1;
            lineLoopsObj.dataJson = dataStr;
        } else {
            // 没有调整过，还用原来的数据
            lineLoopsObj.dataJson = boxLoopsDesc.value;
        }
        console.log(lineLoopsObj);
        if (boxLoopsType.value == 1) {
            // 处理导地线材料数据
            const wireMaterialTabelColumnsData = {
                serialNumber: '序号',
                name: '名称',
                model: '型号',
                weightPerUnit: '重量/单位(kg)',
                totalWeight: '重量/总计(t)',
                quantity: '数量',
            };
            const wireMaterialData = JSON.parse(JSON.stringify(wireMaterialDataList.value));
            wireMaterialData.unshift(wireMaterialTabelColumnsData);
            const wireMaterialObj = {
                dataClassify: 3,
                dataType: 1,
                isChange: isWireMaterialChange.value,
                projectId: props.projectId,
                dataJson: JSON.stringify(wireMaterialData),
            };
            // 处理绝缘子材料数据
            const hardwareMaterialTabelColumnsData = {
                serialNumber: '序号',
                name: '名称',
                model: '型号',
                unit: '单位',
                quantity: '数量',
                remark: '备注',
            };
            const hardwareMaterialData = JSON.parse(JSON.stringify(hardwareMaterialDataList.value));
            hardwareMaterialData.unshift(hardwareMaterialTabelColumnsData);
            const hardwareMaterialObj = {
                dataClassify: 3,
                dataType: 2,
                isChange: isHardwareMaterialChange.value,
                projectId: props.projectId,
                dataJson: JSON.stringify(hardwareMaterialData),
            };
            // 处理结构材料数据
            const structureMaterialTabelColumnsData = {
                serialNumber: '序号',
                name: '名称',
                unit: '单位',
                total: '合计',
                remark: '备注',
            };
            const structureMaterialData = JSON.parse(
                JSON.stringify(structureMaterialDataList.value),
            );
            structureMaterialData.unshift(structureMaterialTabelColumnsData);
            const structureMaterialObj = {
                dataClassify: 3,
                dataType: 3,
                isChange: isStructureMaterialChange.value,
                projectId: props.projectId,
                dataJson: JSON.stringify(structureMaterialData),
            };
            // 处理电缆土建数据
            const cableMaterialTabelColumnsData = {
                serialNumber: '序号',
                name: '名称',
                model: '型号',
                unit: '单位',
                total: '合计',
                remark: '备注',
            };
            const cableMaterialData = JSON.parse(JSON.stringify(cableMaterialDataList.value));
            cableMaterialData.unshift(cableMaterialTabelColumnsData);
            const cableMaterialObj = {
                dataClassify: 3,
                dataType: 4,
                isChange: isCableMaterialChange.value,
                projectId: props.projectId,
                dataJson: JSON.stringify(cableMaterialData),
            };
            console.log(
                lineLoopsObj,
                wireMaterialObj,
                hardwareMaterialObj,
                structureMaterialObj,
                cableMaterialObj,
            );
            return [
                lineLoopsObj,
                wireMaterialObj,
                hardwareMaterialObj,
                structureMaterialObj,
                cableMaterialObj,
            ];
        } else {
            // 电缆铺设
            const cableLayingMaterialTabelColumnsData = {
                serialNumber: '序号',
                name: '名称',
                model: '型号',
                unit: '单位',
                total: '数量',
                remark: '备注',
            };
            const cableLayingMaterialData = JSON.parse(
                JSON.stringify(cableLayingMaterialDataList.value),
            );
            cableLayingMaterialData.unshift(cableLayingMaterialTabelColumnsData);
            const cableLayingMaterialObj = {
                dataClassify: 3,
                dataType: 6,
                isChange: isCableMaterialChange.value,
                projectId: props.projectId,
                dataJson: JSON.stringify(cableLayingMaterialData),
            };
            return [lineLoopsObj, cableLayingMaterialObj];
        }
    };
    defineExpose({
        postData,
    });
</script>
<style scoped lang="scss">
    @import './ResourceManage.scss';
    .sub-title {
        font-weight: 500;
        font-size: 12px;
        margin-bottom: 8px;
    }
    .origin-data-content {
        background-color: #f7f7f8;
        padding: 8px 16px;
        color: #666;
        margin-bottom: 16px;
        p {
            margin: 8px 0;
            font-size: 12px;
        }
    }
    .adjust-data-content {
        background-color: #f7f7f8;
        padding: 8px 16px 16px 16px;
        color: #666;
        margin-bottom: 16px;
        p {
            margin: 8px 0;
            font-size: 12px;
            display: flex;
            align-items: center;
            span {
                flex: none;
                width: 85px;
                text-align: right;
                padding-right: 12px;
                color: #333;
            }
        }
    }
    :deep(.ant-table-header > table > thead > tr > th) {
        font-size: 12px;
    }
</style>
