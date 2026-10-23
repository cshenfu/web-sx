<template>
    <div class="user-list">
        <table-list
            v-if="clomun.length > 0"
            class="user-table"
            fit
            :loading="loading"
            :tableData="tableData"
            :tableColumn="clomun"
            :page="page"
            @getRowData="getRowData"
            @changePage="changePage"
        >
            <template #ph56SamplesNum="{record}">
                {{ record.minAcidRainValue }}~{{ record.maxAcidRainValue }}
            </template>
            <template #updateTime="{record}">
                {{getTimeFormat(record.updateTime) }}
            </template>

            <template #operation="{record}">
                <div class="operation-btn">
                    <span class="operation-btn-item" @click.stop="editFile(record)"> 编辑 </span>
                    <span class="operation-btn-item" @click.stop="deleteFile(record)"> 删除 </span>
                </div>
            </template>
        </table-list>
        <tips-modal
            :width="'490px'"
            title="删除提示"
            :tipType="'danger'"
            class="tip-content-modal"
            :okText="'确定删除'"
            v-model:openTipsModal="openTipsClimateModal"
            @handleChangeFileModal="handleChangeClose"
        >
            <template #contentBody>
                <span class="modalTip">确定删除该数据么？</span>
            </template>
        </tips-modal>
    </div>
</template>

<script setup>
    import { ref, reactive, onBeforeMount, onMounted, watch, onUnmounted, onActivated,onDeactivated } from 'vue';
    import TableList from '@/components/tableList/TableList2.vue';
    import TipsModal from '@/components/tipsDialog/TipsModal.vue';
    import { 
        THUNDER_TABLE_LIST_CLOUMN, 
        CING_TABLE_LIST_CLOUMN,
        ACID_RAIN_TABLE_LIST_CLOUMN,
        TEMPERATURE_RAIN_TABLE_LIST_CLOUMN,
        WIND_PRESSURE_TABLE_LIST_CLOUMN,
        SNOW_PRESSURE_TABLE_LIST_CLOUMN,
        RAIN_FALL_TABLE_LIST_CLOUMN,
        DUST_STORM_TABLE_LIST_CLOUMN,
        WIND_SPEED_TABLE_LIST_CLOUMN,
        HAIL_TABLE_LIST_CLOUMN
    } from './allList';
    import { ElMessage } from 'element-plus'
    import { useRouter } from 'vue-router';
    import mitt from '@/utils/eventBus';
    import _ from 'lodash';
    import {
        getThunderstormList,
        getDryRainList,
        getTemperatureList,
        getWindPressureList,
        deleteThunderstorm,
        deleteWindPressure,
        deleteDryRain,
        deleteTemperature,
        getSnowPressureList,
        deleteSnowPressure,
        getRainFallList,
        deleteRainFall,
        getDustStormList,
        deleteDustStorm,
        getWindSpeedList,
        deleteWindSpeed,
        getHailList,
        deleteHail,
    } from "@/api/modules/climate";
    import dayjs from 'dayjs';
    const props = defineProps({
    });
    const TABLE_COLUMNS = {
        1: THUNDER_TABLE_LIST_CLOUMN,
        // 2: CING_TABLE_LIST_CLOUMN,
        2: ACID_RAIN_TABLE_LIST_CLOUMN,
        3: TEMPERATURE_RAIN_TABLE_LIST_CLOUMN,
        4: WIND_PRESSURE_TABLE_LIST_CLOUMN,
        5:  SNOW_PRESSURE_TABLE_LIST_CLOUMN,
        6:  RAIN_FALL_TABLE_LIST_CLOUMN,
        7:  DUST_STORM_TABLE_LIST_CLOUMN,
        8:  WIND_SPEED_TABLE_LIST_CLOUMN,
        9:  HAIL_TABLE_LIST_CLOUMN,
    };
    const router = useRouter();
    const tableData = ref([])
    const clomun = ref([]);
    const searchKey = ref({})
    const page = ref({
        pageNo: 1,
        pageSize: 10,
        total: 0,
    });
    // 根据activeKey获取改变column值
    const initColumn = (val) => {
        clomun.value = _.cloneDeep(TABLE_COLUMNS[val]);
        page.value.total = 0;
        page.value.pageNo = 1;    
    }
    const loading = ref(false);
    // 搜索
    const handleSearch = (val) => {
        page.value.pageNo = 1;
        searchKey.value = val
        getTableData(val);
    };
    // 重置
    const resetSearch = (val) => {
        page.value.pageNo = 1;
        page.value.pageSize = 10;
        handleSearch(val);
    };
    // 获取表格数据
    const getTableData = (val) => {
        tableData.value = []
        let params = {
            pageNo: page.value.pageNo,
            pageSize: page.value.pageSize,
            ...val,
            affiliationCode: val.affiliationCode ? val.affiliationCode[val.affiliationCode?.length - 1] : '',
        }
        if(!params.areaLevel) {
            delete params.areaLevel
        }
        delete params.activeKey
        delete params.modeType
        allListFn(params,val.activeKey)
    };
    // 表格
    const getRowData = (row) => {
        router.push({
            path: '/hucang/climate/detail', // 已改为新路由前缀
            query: { 
                id: row.id,
                type: searchKey.value.activeKey,
            }
        })
    };
    // 获取页面分页
    const changePage = (val) => {
        console.log(val);
        page.value.pageNo = val.page;
        page.value.pageSize = val.pageSize;
        getTableData(searchKey.value);
    };
    // 汇总所有的数据
    const allListFn =async(params,type)=> {
        let res 
        try {
            switch (type) {
                case 1:
                    res = await getThunderstormList(params)
                    break;
                case 2:
                    res = await getDryRainList(params)
                    break;
                case 3:
                    res = await getTemperatureList(params)
                    break;
                case 4:
                    res = await getWindPressureList(params)
                    break;
                case 5:
                    res = await getSnowPressureList(params)
                    break;
                case 6:
                    res = await getRainFallList(params)
                    break;
                case 7:
                    res = await getDustStormList(params)
                    break;
                case 8:
                    res = await getWindSpeedList(params)
                    break;
                case 9:
                    res = await getHailList(params)
                    break;
            }
            if(res.data?.list?.length  > 0) {
                tableData.value = res.data.list
                page.value.total = res.data.total
            }else {
                tableData.value = []
                page.value.total = 0
            }
        } catch (error) {
            console.log('错误',error);
            
            tableData.value = []
            page.value.total = 0
        }
    }
    // 更改日期格式
    const getTimeFormat= (val)=> {
        return  dayjs(val).format('YYYY-MM-DD HH:mm:ss')
    }
    // 编辑文件
    const editFile = (file) => {
        router.push({
            path: '/hucang/climate/edit', // 已改为新路由前缀
            query: {
                type: searchKey.value.activeKey,
                id: file.id,

            },
        });
    };
    // 删除文件
    const openTipsClimateModal = ref(false);
    const tipTitle = ref('');
    const chooseSelectData = ref({})
    const deleteFile = (val) => {
        chooseSelectData.value = val
        openTipsClimateModal.value = !openTipsClimateModal.value;
        tipTitle.value = '删除提示';
    };
    // 关闭弹窗
    const handleChangeClose = (val) => {
        if (val) {
            confirmDelete();
        } else {
            openTipsClimateModal.value = !openTipsClimateModal.value;
        }
    };
    // 确认删除
    const confirmDelete = async() => {
        let res 
        try {
            switch (searchKey.value.activeKey) {
                case 1:
                    res = await deleteThunderstorm(chooseSelectData.value.id)
                    break;
                case 2:
                    res = await deleteDryRain(chooseSelectData.value.id)
                    break;
                case 3:
                    res = await deleteTemperature(chooseSelectData.value.id)
                    break;
                case 4:
                    res =  await deleteWindPressure(chooseSelectData.value.id)
                    break;
                case 5:
                    res = await deleteSnowPressure(chooseSelectData.value.id)
                    break;
                case 6:
                    res = await deleteRainFall(chooseSelectData.value.id)
                    break;     
                case 7:
                    res = await deleteDustStorm(chooseSelectData.value.id)
                    break;     
                case 8:
                    res = await deleteWindSpeed(chooseSelectData.value.id)
                    break;     
                case 9:
                    res = await deleteHail(chooseSelectData.value.id)
                    break;     
            }
            if(res.data) {
                ElMessage.success('删除成功')
                openTipsClimateModal.value = !openTipsClimateModal.value;
                getTableData(searchKey.value);
            }else {
                ElMessage.error(res.msg)
            }
        }catch(error){
            console.log('删除报错',error);
        }
    };
    // 初始化兄弟组件通讯
    const initMitt =()=> {
        mitt.on('handleSearch',(val)=>{
            searchKey.value = val
            initColumn(val.activeKey)
            handleSearch(val);
        });
        mitt.on('resetSearch', (val) => {
            searchKey.value = val
            initColumn(val.activeKey)
            resetSearch(val);
        });
        mitt.on('updateListData', (val) => {
            initColumn(val)
            console.log('导入更新',searchKey.value);
            
            getTableData(searchKey.value);
        });
    }
    const deletMitt =()=> {
        mitt.off('handleSearch');
        mitt.off('resetSearch');
        mitt.off('updateListData');
    }
    onMounted(() => {
        initMitt()
    });
    onActivated(()=>{
        console.log('==osssn==', searchKey.value);
        initMitt()
    })
    onDeactivated(()=> {
        deletMitt()
    })
    onUnmounted(() => {
        deletMitt()
    });
</script>

<style scoped lang="scss">
  @import '@/assets/css/fixedGroup.scss';

    /* 表格、分页的新版样式在 TableList.vue 的 fit 模式里（Element Plus） */
    .user-list {
        height: 100%;
        min-height: 0;
    }

    /* 操作列：编辑为灰色，删除为红色 */
    .user-list .operation-btn {
        display: inline-flex;
        align-items: center;
        gap: 12px;
    }
    .user-list .operation-btn-item {
        font-size: 13px;
        color: #667383;
        cursor: pointer;

        &:hover {
            color: #0278E7;
        }
        &:last-child {
            color: #F2555A;

            &:hover {
                color: #D9363E;
            }
        }
    }

    /* ========== 以下为原有样式（未改动） ========== */
    .user-list {
        .status-tag {
            width: 52px;
            height: 22px;
            background: #fef1df;
            border-radius: 2px;
            text-align: center;
            line-height: 22px;
            font-size: 12px;
        }

        .pending-icon {
            background: #e8f7e3;
            color: #50b72a;
        }

        .long-time {
            font-size: 12px;
            line-height: 12px;
            color: #7c8294;
            margin-top: 5px;
        }

        .finish-icon {
            background: #fee9e9;
            color: #ff3e3e;
        }

        .stop-icon {
            background: #eeeff2;
            color: #7c8294;
        }

        .bind-icon {
            background: #fef1df;
            color: #ff8411;
        }

        .has-bind-icon {
            background: #dfecff;
            color: #4b74fe;
        }

        .tuning-tip {
            display: flex;
            align-items: flex-start;
            padding: 8px 0 5px 0;
            background: #fef1df;
            border-radius: 4px;
            padding-right: 26px;

            .success {
                color: #fe830f;
                margin: 0 9px 0 12px;
            }

            .tuning-tip-title {
                font-size: 14px;
                color: #21263f;
                line-height: 20px;
            }
        }

        .history-num {
            display: flex;
            align-items: center;
            cursor: pointer;
            color: #036b64;

            .num-icon {
                margin-left: 5px;
            }
        }

        .name-detail {
            width: 358px;
            background: #ffffff;
            border-radius: 4px;
            padding: 5px 12px;
            border: 1px solid #d2d5e1;

            p {
                font-size: 12px;
                color: #363b4d;
                line-height: 20px;
            }
        }

        .name-tip {
            font-size: 12px;
            color: #7c8294;
            line-height: 12px;
            margin-top: 8px;
        }

        .has-bind-clor {
            color: #036b64;
        }

        .operation-type {
            font-size: 12px;
            color: #363b4d;
            line-height: 12px;
        }

        .manage-detail {
            border: none;
        }
    }

    .handle-group-button {
        margin: 18px 0 8px 0;
        text-align: right;

        button {
            &:first-child {
                margin-right: 16px;
            }
        }
    }
</style>