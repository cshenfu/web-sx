<template>
    <div class="price-template">
        <div class="price-left">
            <template v-for="item in dataList">
                <header class="price-left-title">{{ item.quotaCatalog }}</header>
                <tree-list
                    :height="'auto'"
                    :customResize="false"
                    :dataSource="item.detail || []"
                    :refName="item.ref"
                    :ref="
                        (el) => {
                            if (el) refs[item.ref] = el;
                        }
                    "
                    @getChooseSelectKey="getChooseSelectKey"
                    :customFieldNames="{
                        children: 'children',
                        title: 'categoryName',
                        key: 'id',
                    }"
                >
                </tree-list>
            </template>
        </div>
        <div class="price-right">
            <div class="loading-template" v-if="tableLoading">
                <a-spin />
            </div>
            <add-budget-list-search-bar
                ref="budgetSearchRef"
                @handleSearch="handleSearch"
                @resetSearch="resetSearch"
            >
            </add-budget-list-search-bar>
            <a-table
                :rowKey="'id'"
                :customRow="customRow"
                :scroll="{ y: 550 }"
                :row-selection="{
                    selectedRowKeys: selectedRowKeys,
                    onSelect: onSelectChange,
                    onSelectAll: onSelectAllChange,
                    type: 'radio'
                }"
                
                :pagination="false"
                :columns="QUOTA_DETAIL_CLOUMN"
                :data-source="tableData"
            >
            </a-table>
        </div>
    </div>
</template>
<script setup>
    import { onMounted, ref, computed } from 'vue';
    import {
        getQuotaCatalogList,
        getQuotaCategoryTree,
        getQuotaList,
        getQuotaDetail,
        getQuotaPriceByCode,
        importQuota,
        createQuotaCategory,
        editQuotaCategory,
        deleteQuotaCategory,
        deleteQuota,
        createQuota,
        getQuotaInfo,
        updateQuota,
        getQuotaCoefficient,
    } from '@/api/modules/sourceData/budgetManagement';
    import AddBudgetListSearchBar from '../components/AddBudgetListSearchBar.vue';
    import TreeList from '../components/TreeList.vue';
    import { message } from 'ant-design-vue';
    import { useRoute } from 'vue-router';
    const route = useRoute();
    const refs = ref({});
    const budgetSearchRef = ref(null);
    // 定额详细列表
    const QUOTA_DETAIL_CLOUMN = [
        {
            title: '定额编码',
            dataIndex: 'quotaCode',
            width: 50,
        },
        {
            title: '定额名称',
            dataIndex: 'quotaName',
            width: 120,
        },
        {
            title: '计量单位',
            dataIndex: 'unit',
            width: 40,
        },
        {
            title: '计量数量',
            dataIndex: 'quantity',
            width: 40,
        },
    ];
    // 左侧数据集合
    const dataList = ref([]);
    const leftSelect = ref(null);
    // 右侧表格数据
    const tableData = ref([]);
    // 选中数据ID集合
    const selectedRowKeys = ref([]);
    const selectedRowDatas = ref([]);
    const onePageSelectRowKeys = ref([]);
    const tableLoading = ref(false);
    const getDetail = async () => {
        for (let index = 0; index < dataList.value.length; index++) {
            const element = dataList.value[index];
            const res = await getQuotaCategoryTree(element.id);
            if (res.code == 200 && res.data?.length > 0) {
                element.ref = 'treeListRef' + index;
                element.detail = res.data;
            } else {
                element.detail = [];
            }
        }
        console.log('定额查询列表', dataList.value);
    };
    // 定额查询列表
    const getData = async () => {
        let data = {
            pageNo: 1,
            pageSize: 1000,
            quotaProjectType: 1,
        };
        try {
            const res = await getQuotaCatalogList(data);
            if (res.code == 200 && res.data?.list) {
                dataList.value = route.query.quotaCatalogId ? res.data.list.filter(item => item.id == route.query.quotaCatalogId) : res.data.list;
                getDetail();
            } else {
                dataList.value = [];
            }
        } catch (err) {
            console.log('报错', err);
        }
    };
    const handleSearch = (val) => {
        getTableData(val);
    };
    const resetSearch = (val) => {
        console.log(val);
        handleSearch(val);
    };

    // 获取表格数据
    const getTableData = (val) => {
        onePageSelectRowKeys.value = [];
        getQuotaList({
            quotaCatalogId: Number(
                leftSelect.value?.node
                    ? leftSelect.value.node.quotaCatalogId
                    : leftSelect.value.quotaCatalogId,
            ),
            itemTypeCode: leftSelect.value?.node
                ? leftSelect.value.node.itemTypeCode
                : leftSelect.value.itemTypeCode,
            quotaCode: val?.code,
            quotaName: val?.name,
            platformType:2
        })
            .then((res) => {
                if (res.code == 200) {
                    tableData.value = res.data || [];
                } else {
                    tableData.value = [];
                }
            })
            .finally(() => {
                tableLoading.value = false;
            });
    };
    const onSelectAllChange = (selected) => {
        console.log('全选', selected);
        for (let index = 0; index < tableData.value.length; index++) {
            const element = tableData.value[index];
            // 全选
            if (selected && !selectedRowKeys.value.includes(element.id)) {
                selectedRowKeys.value.push(element.id);
                selectedRowDatas.value.push(element);
            }
            // 取消全选
            if (!selected && selectedRowKeys.value.includes(element.id)) {
                const i = selectedRowKeys.value.indexOf(element.id);
                selectedRowKeys.value.splice(i, 1);
                selectedRowDatas.value.splice(i, 1);
            }
        }
    };
    const onSelectChange = (record) => {
        
        if (selectedRowKeys.value.includes(record.id)) {
            selectedRowKeys.value = [];
            selectedRowDatas.value = [];
            // const i = selectedRowKeys.value.indexOf(record.id);
            // selectedRowKeys.value.splice(i, 1);
            // selectedRowDatas.value.splice(i, 1);
        } else {
            // selectedRowKeys.value.push(record.id);
            // selectedRowDatas.value.push(record);
            selectedRowKeys.value = [record.id];
            selectedRowDatas.value = [record];
        }
    };
    const customRow = (record) => {
        return {
            onClick: () => {
                onSelectChange(record)
            },
        };
    };
    const getChooseSelectKey = (val) => {
        console.log('获取选中的值', val);
        leftSelect.value = { ...val.e };
        if (val.isRefresh) {
            tableLoading.value = true;
            getTableData(budgetSearchRef.value.searchKey);
        }
        const keys = Object.keys(refs.value);
        for (let index = 0; index < keys.length; index++) {
            const element = keys[index];
            if (element !== val.refName && element !== 'undefined') {
                refs.value[element].selectedKeys = [];
            }
        }
    };
    const getSelectionData = () => {
        console.log('获取选中数据', selectedRowKeys.value);
        if (selectedRowKeys.value.length) {
            return selectedRowDatas.value;
        } else {
            message.warning('请选择一条要添加的定额数据');
            return false;
        }
    };
    const resetEvent = () => {
        if (Object.keys(refs.value).length) {
            for (const key in refs.value) {
                refs.value[key].selectedKeys = [];
            }
        }
        budgetSearchRef.value.searchKey.name = null;
        budgetSearchRef.value.searchKey.code = null;
        leftSelect.value = null;
        selectedRowKeys.value = [];
        selectedRowDatas.value = [];
        tableData.value = [];
    };
    onMounted(() => {
        getData();
    });
    defineExpose({
        getSelectionData,
        resetEvent,
    });
</script>

<style lang="scss" scoped>
    .price-template {
        display: flex;
        align-items: stretch;
        overflow: hidden;
        user-select: none;
        .price-left {
            // flex: none;
            // width: 340px;
            height: 600px;
            overflow-y: auto;
            margin-right: 24px;
            .price-left-title {
                font-weight: 500;
                margin-top: 8px;
            }
        }

        .price-right {
            flex: none;
            width: calc(100% - 340px);
            position: relative;
            .loading-template {
                position: absolute;
                left: 0;
                bottom: 0;
                right: 0;
                top: 0;
                background: rgba(255, 255, 255, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 99;
            }
        }
        :deep(.ant-table-row-selected > td) {
            background-color: #e5f0ef !important;
            color: #036b64;
        }
        :deep(.ant-table-selection-column) {
            width: 0;
        }
        :deep(.ant-table-cell) {
            padding: 10px 8px !important;
        }
    }
</style>
