<template>
    <div class="replace-price-flex">
        <ul class="replace-price-list">
            <li
                @click="changeMenu(item, itemIndex)"
                v-for="(item, itemIndex) in replacePriceList"
                :class="itemIndex == activeIndex ? 'active' : ''"
            >
                {{ item.label }}
            </li>
        </ul>
        <div>
            <a-table
                v-if="replacePriceList.length"
                :rowKey="replacePriceList[activeIndex]['rowKey']"
                :customRow="customRow"
                :scroll="{ y: 550 }"
                :row-selection="{
                    selectedRowKeys: replacePriceList[activeIndex]['selectedRowKeys'],
                    type: 'radio',
                    onSelect: onSelectChange,
                }"
                :pagination="false"
                :columns="
                    replacePriceList[activeIndex]['unitPriceFirstCategory'] == 'P0002'
                        ? PRICE_CLOUMN
                        : QUOTA_CLOUMN
                "
                :data-source="replacePriceList[activeIndex]['data']"
            >
                <template #bodyCell="{ column, text, record }">
                    <template v-if="column.dataIndex === 'unit'">
                        <div style="padding: 12px 0">{{ record[column.dataIndex] }}</div>
                    </template>
                    <template
                        v-if="
                            column.dataIndex === 'quotaCode' || column.dataIndex === 'unitPriceCode'
                        "
                    >
                        <div>{{ record['quotaCode'] || record['unitPriceCode'] }}</div>
                    </template>
                    <template
                        v-if="
                            column.dataIndex === 'quotaName' || column.dataIndex === 'unitPriceName'
                        "
                    >
                        <div>{{ record['quotaName'] || record['unitPriceName'] }}</div>
                    </template>
                </template>
            </a-table>
        </div>
    </div>
</template>
<style scoped lang="scss">
    .replace-price-flex {
        margin: 16px 0;
        display: flex;
        .replace-price-list {
            flex: none;
            width: 160px;
            padding: 12px 16px;
            background: #f2f7f7;
            margin-right: 24px;
            li {
                margin-bottom: 16px;
                cursor: pointer;
                &.active {
                    color: #036b64;
                    font-weight: 500;
                }
            }
        }
        > div {
            flex: 1;
        }
        :deep(.ant-table-wrapper .ant-table-tbody > tr.ant-table-row-selected > td) {
            background: #e5f0ef;
            color: #036b64;
            font-weight: 500;
        }
    }
</style>
<script setup>
    import { ref, watch } from 'vue';
    import { getQuotaList, getBasePriceList } from '@/api/modules/sourceData/budgetManagement.js';
    import { useRoute } from 'vue-router';
    import { message } from 'ant-design-vue';
    const route = useRoute();
    const props = defineProps({
        resourceData: {
            type: Object,
            default: () => {
                return null;
            },
        },
    });
    const activeIndex = ref(0);
    const customRow = (record) => {
        return {
            onClick: () => {
                onSelectChange(record);
            },
        };
    };
    const changeMenu = (item, index) => {
        activeIndex.value = index;
    };
    const QUOTA_CLOUMN = [
        {
            title: '编号',
            dataIndex: 'quotaCode',
            width: 80,
        },
        {
            title: '名称',
            dataIndex: 'quotaName',
            width: 120,
        },
        {
            title: '型号',
            dataIndex: 'model',
            width: 120,
        },
        {
            title: '计量单位',
            dataIndex: 'unit',
            width: 120,
        },
    ];
    const PRICE_CLOUMN = [
        {
            title: '编号',
            dataIndex: 'unitPriceCode',
            width: 80,
        },
        {
            title: '名称',
            dataIndex: 'unitPriceName',
            width: 120,
        },
        {
            title: '型号',
            dataIndex: 'model',
            width: 120,
        },
        {
            title: '计量单位',
            dataIndex: 'unit',
            width: 120,
        },
    ];
    // 选中数据ID集合
    // const replacePriceList = ref([
    //     {
    //         id: 1,
    //         label: '选择混凝土',
    //         data: [{
    //             id: 1,
    //             quotaCode: 'xs1241',
    //             quotaName: '细砂',
    //             model: '1.5-2.0',
    //             unit: 'm³',
    //         }, {
    //             id: 2,
    //             quotaCode: 'xs1242',
    //             quotaName: '细砂',
    //             model: '1.5-2.0',
    //             unit: 'm³',
    //         }, {
    //             id: 3,
    //             quotaCode: 'xs1243',
    //             quotaName: '细砂',
    //             model: '1.5-2.0',
    //             unit: 'm³',
    //         }],
    //         selectedRowKeys: [],
    //         selectedRowData: [],
    //     },
    //     {
    //         id: 2,
    //         label: '选择水泥砂浆',
    //         data: [],
    //         selectedRowKeys: [],
    //         selectedRowData: [],
    //     },
    // ]);
    const replacePriceList = ref([]);
    const delPriceList = ref([]);
    const addQuotaList = ref([]);
    const onSelectChange = (record) => {
        console.log(record);
        replacePriceList.value[activeIndex.value]['selectedRowKeys'] = [
            record.unitPriceCode || record.quotaCode,
        ];
        replacePriceList.value[activeIndex.value]['selectedRowData'] = [record];
        console.log(replacePriceList.value);
    };
    // 格式化处理
    const formatResourceData = async () => {

        const uniqueObjects = (arr) => {
          const arrs =  [...new Map(arr.map(item => [item.unitPriceCode, item])).values()]
          return arrs
        }

        console.log(props.resourceData);
        if (props.resourceData.quotaPriceList && props.resourceData.quotaPriceList.length) {
            for (let i = 0; i < props.resourceData.quotaPriceList.length; i++) {
                const ele = props.resourceData.quotaPriceList[i];

                let res = null;
                if (ele.unitPriceFirstCategory == 'P0005') {
                    // 机械 固定P0005 （含混凝土拌制、混凝土运输需要调表70，含有石渣运输需要调表59）
                    let itemTypeCode = 'AB0070';
                    if (
                        ele.unitPriceName.indexOf('混凝土拌制') > -1 ||
                        ele.unitPriceName.indexOf('混凝土运输') > -1
                    ) {
                        itemTypeCode = 'AB0070';
                    } else if (ele.unitPriceName.indexOf('石渣运输') > -1) {
                        itemTypeCode = 'AB0059';
                    }
                    res = await getQuotaList({
                        itemTypeCode: itemTypeCode,
                        quotaCatalogId: route.query.quotaCatalogId,
                        quotaName: '',
                        quotaCode: '',
                        platformType:2
                    });
                } else if (ele.unitPriceFirstCategory == 'P0002') {
                    // 材料 固定P0002 （使用单价库-砼配合比）
                    res = await getBasePriceList({
                        itemTypeCode: 'P0004',
                        quotaCatalogId: route.query.quotaCatalogId,
                        quotaName: '',
                        quotaCode: '',
                        platformType:2
                    });
                }
                console.log(res.data, '请求到的数据------------');
                replacePriceList.value.push({
                    label: ele.unitPriceName,
                    oldUnitPriceCode: ele.unitPriceCode,
                    // data: uniqueObjects(res.data) || [],
                    data: res.data || [],
                    selectedRowKeys: [],
                    selectedRowData: [],
                    unitPriceFirstCategory: ele.unitPriceFirstCategory,
                    rowKey: res.data.length && !res.data[0]['unitPriceCode'] ? 'quotaCode' : 'unitPriceCode',
                    isNeedAddQuota: ele.unitPriceFirstCategory == 'P0005',
                });
            }
        }
        if (props.resourceData.priceMap && Object.keys(props.resourceData.priceMap).length) {
            for (const key in props.resourceData.priceMap) {
                if (Object.hasOwnProperty.call(props.resourceData.priceMap, key)) {
                    console.log(uniqueObjects(props.resourceData.priceMap[key]), '-------------啥啊这是')
                    replacePriceList.value.push({
                        label: key,
                        // data: uniqueObjects(props.resourceData.priceMap[key]),
                        data: props.resourceData.priceMap[key],
                        oldUnitPriceCode: null,
                        selectedRowKeys: [],
                        selectedRowData: [],
                        unitPriceFirstCategory:
                            props.resourceData.priceMap[key][0]['unitPriceFirstCategory'],
                        rowKey: !props.resourceData.priceMap[key][0]['unitPriceCode']
                            ? 'quotaCode'
                            : 'unitPriceCode',
                        isNeedDelete: true,
                    });
                }
            }
        }

        console.log('所有处理完的数据：', replacePriceList.value);
    };
    const getSelectionData = () => {
        // 先验证数据是否选择替换
        console.log('替换处理完的数据', replacePriceList.value);
        let key = true;
        let keyLabel = '';
        replacePriceList.value.length &&
            replacePriceList.value.forEach((item, index) => {
                if (!item.selectedRowData.length) {
                    key = false;
                    keyLabel = item.label;
                }
            });
        if (!key) {
            message.error(`请选择${keyLabel}的替换数据！`);
            return null;
        } else {
            return replacePriceList.value;
        }
    };
    watch(
        () => props.resourceData,
        () => {
            activeIndex.value = 0;
            replacePriceList.value = [];
            delPriceList.value = [];
            addQuotaList.value = [];
            props.resourceData && formatResourceData();
        },
        {
            deep: true,
            immediate: true,
        },
    );
    defineExpose({
        replacePriceList,
        getSelectionData,
    });
</script>
