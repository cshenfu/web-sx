<template>
    <!-- 土建数据 -->
    <div class="civil-engineering">
        <header class="resource-management-header">升压站面积</header>
        <TableList
            :tableData="dataList"
            :bordered="true"
            :isShowPage="false"
            :tableColumn="BOOSTER_STATION_CLOUMN"
        >
            <template #quantity="{ record }">
                <template v-if="record['name'] == '面积'">
                    <a-input-number
                        placeholder="自动计算"
                        v-model:value="record['quantity']"
                        disabled
                        :controls="false"
                        style="width: 100%; font-size: 12px"
                    ></a-input-number>
                </template>
                <template v-else>
                    <a-input-number
                        placeholder="请输入"
                        v-model:value="record['quantity']"
                        @input="isChange = 1"
                        @blur="computedArea"
                        :controls="false"
                        style="width: 100%; font-size: 12px"
                    ></a-input-number>
                </template>
            </template>
        </TableList>
        <header class="resource-management-header" style="margin-top: 24px">工程量表</header>
        <div class="tab-list">
            <a-tabs v-model:activeKey="activeKey" type="card">
                <a-tab-pane key="1" tab="风机基础工程量表">
                    <TableList
                        :tableData="fanDataList"
                        :bordered="true"
                        :isShowPage="false"
                        :tableColumn="ENGINEERING_CLOUMN"
                    >
                        <template #quantity="{ record }">
                            <a-input-number
                                v-if="isLeafNode(record['serialNumber'], boosterDataList)"
                                placeholder="请输入"
                                v-model:value="record['quantity']"
                                :controls="false"
                                style="width: 100%; font-size: 12px"
                                @input="isFanDataChange = 1"
                            ></a-input-number>
                        </template>
                        <template #remark="{ record }">
                            <a-input
                                v-if="isLeafNode(record['serialNumber'], boosterDataList)"
                                placeholder="请输入"
                                v-model:value="record['remark']"
                                style="width: 100%; font-size: 12px"
                                @input="isFanDataChange = 1"
                            ></a-input>
                        </template>
                    </TableList>
                </a-tab-pane>
                <a-tab-pane key="2" tab="箱变基础工程量表">
                    <TableList
                        :tableData="boxDataList"
                        :bordered="true"
                        :isShowPage="false"
                        :tableColumn="ENGINEERING_CLOUMN"
                    >
                        <template #quantity="{ record }">
                            <a-input-number
                                v-if="isLeafNode(record['serialNumber'], boosterDataList)"
                                placeholder="请输入"
                                v-model:value="record['quantity']"
                                :controls="false"
                                style="width: 100%; font-size: 12px"
                                @input="isBoxDataChange = 1"
                            ></a-input-number>
                        </template>
                        <template #remark="{ record }">
                            <a-input
                                v-if="isLeafNode(record['serialNumber'], boosterDataList)"
                                placeholder="请输入"
                                v-model:value="record['remark']"
                                style="width: 100%; font-size: 12px"
                                @input="isBoxDataChange = 1"
                            ></a-input>
                        </template>
                    </TableList>
                </a-tab-pane>
                <a-tab-pane key="3" tab="升压站工程量表">
                    <TableList
                        :tableData="boosterDataList"
                        :bordered="true"
                        :isShowPage="false"
                        :tableColumn="ENGINEERING_CLOUMN"
                    >
                        <template #quantity="{ record }">
                            <a-input-number
                                v-if="isLeafNode(record['serialNumber'], boosterDataList)"
                                placeholder="请输入"
                                v-model:value="record['quantity']"
                                :controls="false"
                                style="width: 100%; font-size: 12px"
                                @input="isBoosterDataChange = 1"
                            ></a-input-number>
                        </template>
                        <template #remark="{ record }">
                            <a-input
                                v-if="isLeafNode(record['serialNumber'], boosterDataList)"
                                placeholder="请输入"
                                v-model:value="record['remark']"
                                style="width: 100%; font-size: 12px"
                                @input="isBoosterDataChange = 1"
                            ></a-input>
                        </template>
                    </TableList>
                </a-tab-pane>
            </a-tabs>
        </div>
    </div>
</template>
<script setup>
    import { ref, onBeforeMount, watch } from 'vue';
    import TableList from '@/components/tableList/TableList.vue';
    import { ENGINEERING_CLOUMN, BOOSTER_STATION_CLOUMN } from './CivilEngineering';
    import { message } from 'ant-design-vue';
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
    const activeKey = ref('1');
    const originList = ref([]);
    const isChange = ref(0);
    const isFanDataChange = ref(0);
    const isBoxDataChange = ref(0);
    const isBoosterDataChange = ref(0);
    const dataList = ref([
        {
            name: '总长',
            unit: 'm',
            quality: 12,
            adjustNum: null,
            adjustRemark: null,
        },
        {
            name: '总宽',
            unit: 'm',
            quality: 12,
            adjustNum: null,
            adjustRemark: null,
        },
        {
            name: '面积',
            unit: '㎡',
            quality: '--',
            adjustNum: null,
            adjustRemark: null,
        },
    ]);
    const fanDataList = ref([]);
    const boxDataList = ref([]);
    const boosterDataList = ref([]);

    // 判断是否是最下一级
    const isLeafNode = (serialNumber, list) => {
  // 1. 过滤非数字序号（中文一二三四/空值），直接不显示输入框
  if (!serialNumber || isNaN(Number(serialNumber.replace(/\./g, '')))) {
    return false;
  }

  // 2. 提取列表中所有有效数字序号（排除中文/空值）
  const validSerialNumbers = list
    .map(item => item.serialNumber)
    .filter(sn => sn && !isNaN(Number(sn.replace(/\./g, ''))));

  // 3. 边界条件：无有效序号 或 只有当前序号自己 → 显示输入框
  if (validSerialNumbers.length === 0) return false;
  if (validSerialNumbers.length === 1) return true;

  // 4. 核心逻辑：判断当前序号是否有子节点（是否是其他序号的前缀）
  // 例如：判断1.1是否有子节点 → 检查是否存在1.1.xxx的序号
  const hasChildNode = validSerialNumbers.some(sn => {
    // 排除自己，且sn以当前序号为前缀，且层级比当前序号深
    return sn !== serialNumber && 
           sn.startsWith(`${serialNumber}.`) && 
           sn.split('.').length > serialNumber.split('.').length;
  });

  // 5. 没有子节点 → 就是叶子节点（显示输入框）
  return !hasChildNode;
};
    // 提取字符串中的数字
    const extractDecimalFromString = (str) => {
        // 正则表达式匹配数字（包括小数）
        // const decimalRegex = /-?\d+\.\d+/g;
        const decimalRegex = /-?\d+(?:\.\d+)?/g;
        const matches = str.match(decimalRegex);
        // 如果没有匹配到，返回null或空数组
        if (!matches) return null;
        // 返回匹配到的所有小数（数组形式）
        return Number(matches[0]); // 转换为数字类型
    };
    const computedArea = () => {
        if (dataList.value[0]['quantity'] && dataList.value[1]['quantity']) {
            dataList.value[2]['quantity'] =
                dataList.value[0]['quantity'] * dataList.value[1]['quantity'];
        }
    };
    onBeforeMount(() => {
        console.log('dataList', '土建');
    });
    watch(
        () => props.resourceData,
        (val) => {
            if (val.length) {
                originList.value = JSON.parse(JSON.stringify(val));
                // 处理长宽数据
                const dataOriginList = JSON.parse(
                    JSON.stringify(val.filter((item) => item.dataType == 13)),
                );
                if (dataOriginList.length && dataOriginList[0]['jsonList']) {
                    const length =
                        extractDecimalFromString(
                            dataOriginList[0]['jsonList'].split('x')[0].trim(),
                        ) || '';
                    const width =
                        extractDecimalFromString(
                            dataOriginList[0]['jsonList'].split('x')[1].trim(),
                        ) || '';
                    dataList.value[0]['quantity'] = length;
                    dataList.value[1]['quantity'] = width;
                    dataList.value[2]['quantity'] = length * width;
                }
                // 风机基础工程量建表
                const fanDataOriginList = val.filter((item) => item.dataType == 10);
                if (fanDataOriginList.length && fanDataOriginList[0]['jsonList']) {
                    fanDataList.value = JSON.parse(fanDataOriginList[0]['jsonList']) || [];
                    if (fanDataList.value.length) {
                        // 去除第一条数据（假表头）
                        fanDataList.value.shift();
                    }
                }
                // 箱基础工程量建表
                const boxDataOriginList = val.filter((item) => item.dataType == 11);
                if (boxDataOriginList.length && boxDataOriginList[0]['jsonList']) {
                    boxDataList.value = JSON.parse(boxDataOriginList[0]['jsonList']) || [];
                    if (boxDataList.value.length) {
                        // 去除第一条数据（假表头）
                        boxDataList.value.shift();
                    }
                }
                // 提升基础工程量建表
                const boosterDataOriginList = val.filter((item) => item.dataType == 12);
                if (boosterDataOriginList.length && boosterDataOriginList[0]['jsonList']) {
                    boosterDataList.value = JSON.parse(boosterDataOriginList[0]['jsonList']) || [];
                    if (boosterDataList.value.length) {
                        // 去除第一条数据（假表头）
                        boosterDataList.value.shift();
                    }
                }

                // dataList.value = val[0].dataList;
                // fanDataList.value = val[1].dataList;
                // boxDataList.value = val[2].dataList;
                // boosterDataList.value = val[3].dataList;
            }
        },
        {
            immediate: true,
            deep: true,
        },
    );
    // 处理数据格式给后端传
    const postData = () => {
        // 处理长宽数据
        if (!(dataList.value[0]['quantity'] && dataList.value[1]['quantity'])) {
            message.error('请完整填写升压站长宽数据！');
            return false;
        }
        const obj = {
            isChange: isChange.value,
            dataClassify: 1,
            dataType: 13,
            dataJson: `长${dataList.value[0]['quantity']} x 宽${dataList.value[1]['quantity']}m`,
            projectId: props.projectId,
        };
        // 处理风机、箱变、升压站数据
        const tableColumnData = {
            serialNumber: '序号',
            projectName: '工程项目及名称',
            unit: '单位',
            quantity: '数量',
            remark: '备注',
        };
        const fanData = JSON.parse(JSON.stringify(fanDataList.value));
        fanData.unshift(tableColumnData);
        const boxData = JSON.parse(JSON.stringify(boxDataList.value));
        boxData.unshift(tableColumnData);
        const boosterData = JSON.parse(JSON.stringify(boosterDataList.value));
        boosterData.unshift(tableColumnData);
        const fanObj = {
            isChange: isFanDataChange.value,
            dataClassify: 1,
            dataType: 10,
            dataJson: JSON.stringify(fanData),
            projectId: props.projectId,
        };
        const boxObj = {
            isChange: isBoxDataChange.value,
            dataClassify: 1,
            dataType: 11,
            dataJson: JSON.stringify(boxData),
            projectId: props.projectId,
        };
        const boosterObj = {
            isChange: isBoosterDataChange.value,
            dataClassify: 1,
            dataType: 12,
            dataJson: JSON.stringify(boosterData),
            projectId: props.projectId,
        };
        console.log('长宽数据', obj);
        console.log('风机数据', fanObj);
        console.log('箱变数据', boxObj);
        console.log('升压站数据', boosterObj);
        return [obj, fanObj, boxObj, boosterObj];
    };
    defineExpose({
        postData,
    });
</script>
<style scoped lang="scss">
    @import './ResourceManage.scss';
    :deep(.tab-list .ant-table-tbody tr:nth-child(1)) {
        background: red !important;
    }
</style>
