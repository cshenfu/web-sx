<template>
    <div class="cost-library-list-template">
        <div class="add-btn" @click="goPath"><iconpark-icon name="xinzeng" size="12" class="add-icon"></iconpark-icon> 新增数据</div>
        <div class="library-list-left">
            <!-- <div class="span-group">
                <span :class="itemType == 1 ? 'active' : ''" @click="onChangeItemType(1)"
                    >风机</span
                >
                <span :class="itemType == 2 ? 'active' : ''" @click="onChangeItemType(2)"
                    >光伏</span
                >
            </div> -->
            <ul class="library-list-content" v-show="itemType == 1">
                <li
                    @click="changeType(itemIndex,item.title)"
                    :class="itemTypeActive == itemIndex ? 'active' : ''"
                    v-for="(item, itemIndex) in itemTypeList"
                >
                    {{ item.title }}
                </li>
            </ul>
            <ul class="library-list-content" v-show="itemType == 2"></ul>
        </div>
        <div class="library-list-right">
            <costLibrarySearch
                ref="costLibraryRef"
                @handleSearchCommon="handleSearchEvent"
                @resetSearchCommon="resetSearchEvent">
            </costLibrarySearch>
            <table-list
                :loading="loading"
                :tableData="dataList"
                :tableColumn="itemTypeList[itemTypeActive]['thArr']"
                :page="page"
                @changePage="changePage"
            >
                <template #areaData="{ record }">
                    <span
                        >{{ record.provinceName }}{{ record.cityName ? `/${record.cityName}` : ''
                        }}{{ record.districtName ? `/${record.districtName}` : '' }}</span
                    >
                </template>
                <template #value2="{ record }">
                    <a-popover overlay-class-name="name-popover-self">
                        <template #content>
                            {{ record.value2 }}
                        </template>
                        <div class="ellipsis-text-name">{{ record.value2 }}</div>
                    </a-popover>
                </template>
                <template #operation="{ record }">
                    <div class="operation-btn">
                        <span class="operation-btn-item" @click.stop="edit(record)">更新</span>
                    </div>
                </template>
            </table-list>
        </div>
        <add-cost-modal
            :itemTypeActiveName="itemTypeActiveName"
            :selectData="selectData"
            @updateCostList="handleSearchEvent"
            v-if="openTipsManageModal"
            v-model:openTipsManageModal='openTipsManageModal'>
        </add-cost-modal>
    </div>
</template>
<script setup>
    import { ref,onMounted } from 'vue';
    import {
        COST_TABLE_LIST_CLOUMN_PRICE,
        COST_TABLE_LIST_CLOUMN_COMMON_DATA,
        COST_TABLE_LIST_CLOUMN_COMMON_PRICE,
        COST_TABLE_LIST_CLOUMN_AUXILIARY_UNIT,
        COST_TABLE_LIST_CLOUMN_OTHER_UNIT,
        COST_TABLE_LIST_CLOUMN_DEVICE_UNIT,
        COST_TABLE_LIST_CLOUMN_PRO_UNIT,
    } from '../costLibrary';
    import tableList from '@/components/tableList/TableList.vue';
    import costLibrarySearch from './costLibrarySearch.vue';
    import AddCostModal from './AddCostModal.vue';
    import {getProjectCost} from '@/api/modules/sourceData/costLibraryManage';
    import dayjs from 'dayjs';
    const costLibraryRef = ref(null)
    const itemType = ref(1);
    // const itemTypeList = ref([
    //     {
    //         title: '建筑工程单价',
    //         thArr: COST_TABLE_LIST_CLOUMN_PRO_UNIT,
    //     },
    //     {
    //         title: '设备及安装工程单价',
    //         thArr: COST_TABLE_LIST_CLOUMN_DEVICE_UNIT,
    //     },
    //     {
    //         title: '其他费用单价',
    //         thArr: COST_TABLE_LIST_CLOUMN_OTHER_UNIT,
    //     },
    //     {
    //         title: '施工辅助工程单价',
    //         thArr: COST_TABLE_LIST_CLOUMN_AUXILIARY_UNIT,
    //     },
    //     {
    //         title: '通用价格字典',
    //         thArr: COST_TABLE_LIST_CLOUMN_COMMON_PRICE,
    //     },
    //     {
    //         title: '通用数据字典',
    //         thArr: COST_TABLE_LIST_CLOUMN_COMMON_DATA,
    //     },
    //     {
    //         title: '一键优化费用项',
    //         thArr: COST_TABLE_LIST_CLOUMN_PRICE,
    //     },
    // ]);
    const itemTypeList = ref([
        {
            title: '资金及费率',
            thArr: COST_TABLE_LIST_CLOUMN_COMMON_PRICE,
        },
        {
            title: '设备费用',
            thArr: COST_TABLE_LIST_CLOUMN_COMMON_PRICE,
        },
        {
            title: '其他费用单价',
            thArr: COST_TABLE_LIST_CLOUMN_COMMON_PRICE,
        },
    ]);
    // 选中的数据
    const selectData = ref(null)
    // 弹窗是否展示
    const openTipsManageModal = ref(false); 
    const itemTypeActive = ref(0);
    const itemTypeActiveName = ref(itemTypeList.value[0]['title']);
    const loading = ref(false);
    const dataList = ref([
    ]);
    const page = ref({
        pageNo: 1,
        pageSize: 10,
        total: 0,
    });
    // 搜索
    const handleSearchEvent = (val)=> {
        let data = val? val: costLibraryRef.value.searchKey
        page.value.pageNo = 1;
        selectData.value = null
        getTableData(data)
        
    }
    // 重置
    const resetSearchEvent = (val) => {
        handleSearchEvent(val)
    } 
    // 获取页面分页
    const changePage = (val) => {
        page.value.pageNo = val.page;
        page.value.pageSize = val.pageSize;
        getTableData(costLibraryRef.value.searchKey)
    };
    // 选中项目类型
    const changeType = (index,item) => {
        itemTypeActive.value= index
        itemTypeActiveName.value= item
        page.value.pageNo = 1;
        selectData.value = null;
        costLibraryRef.value.resetSearchEvent()
    }
    // 更改类型
    const onChangeItemType = (value) => {
        itemType.value = value;
        itemTypeActive.value = 0;
        page.value.pageNo = 1;
    };
    // 编辑
    const edit = (row) => {
        selectData.value = row;
        openTipsManageModal.value= true;
    }
    // 新增数据
    const goPath = ()=> {
        selectData.value = null;
        openTipsManageModal.value= true;
    }
    // 加载数据表格
    const getTableData = async(val) => {
        let data = {
            ...val,
            parentType: itemTypeActiveName.value,
            pageNo: page.value.pageNo,
            pageSize: page.value.pageSize,
        }
        let res = await getProjectCost(data)
        if(res.code == 200) {
            dataList.value = res.data?.list.map((item,index)=> {
               return {
                    ...item,
                    'updateTimeStr':dayjs(item.updateTime).format('YYYY-MM-DD HH:mm:ss'),
               }
            })
            page.value.total = res.data?.total;
            // console.log('获取数据',res.data);
        }else {
            dataList.value = []
            page.value.total = 0

        }
        loading.value = false
}
onMounted(() => {
    handleSearchEvent(costLibraryRef.value.searchKey)
})
</script>
<style scoped lang="scss">
    .cost-library-list-template {
        display: flex;
        align-items: stretch;
        position: relative;
        .library-list-left {
            flex: none;
            width: 250px;
            padding: 20px;
            margin-right: 24px;
            background-color: #fff;
            .span-group {
                display: flex;
                border: 1px solid #006962;
                box-sizing: border-box;
                border-radius: 4px;
                margin-bottom: 12px;
                overflow: hidden;
                span {
                    flex: 1;
                    text-align: center;
                    line-height: 35px;
                    cursor: pointer;
                    color: #006962;
                    font-weight: 500;
                    &.active {
                        background-color: #006962;
                        color: #fff;
                    }
                }
            }
            .library-list-content {
                height: calc(100vh - 200px);
                li {
                    padding: 12px 12px;
                    margin: 8px 0;
                    border-radius: 4px;
                    cursor: pointer;
                    &.active {
                        font-weight: bolder;
                        background: url(@/assets/img/user/detail-title.png) no-repeat;
                        color: #006962;
                        background-position: left center;
                        background-size: 4px 16px;
                    }
                }
            }
        }
        .library-list-right {
            flex: 1;
            background-color: #fff;
            padding: 24px;
            overflow: auto;
        }
        // background-color: #fff;
    }
</style>
