<template>
    <div class="detail-origin-components">
        <!-- 测风塔基础数据列表 -->
        <TableList
            :bordered="true"
            :isShowPage="false"
            :pagination="false"
            class="table-common table-account"
            :tableData="tableBaseData"
            :tableColumn="BASICS_DETAIL"
        >
            <template #lngAndlat="{record}">
                {{ record.lng }}，{{ record.lat }}
            </template>
            <template #startTimeAndEndTime="{record}">
                <template v-if="record.rawFirstTime">
                    {{ dayjs(record.rawFirstTime).format('YYYY-MM-DD HH:mm:ss') }}~{{ dayjs(record.rawLastTime).format('YYYY-MM-DD HH:mm:ss') }}
                </template>
                <template v-else>
                    --
                </template>
            </template>
            <template #windTypeList="{record}">
                <div class="custom-cell" v-for="item in record['windTypeList']"> 
                    <span>{{ item['tierHeight'] }}</span>
                    <span>{{ item['windType'] }}</span>
                </div>
            </template>
        </TableList>
        <h4 class="table-title"> 数据实际情况</h4>
        <!-- 测风塔数据实际情况 -->
        <a-table :pagination="false" :columns="ACTUAL_DETAIL" :data-source="tableActualData" bordered>
            <template #bodyCell="{ column, text, record }">
                <div class="custom-cell-center">{{ text }}</div>
            </template>
        </a-table>
    </div>
</template>
<script setup>
    import { BASICS_DETAIL } from './detailOrigin';
    import TableList from '@/components/tableList/TableList.vue';
    import { reactive,onMounted,ref } from 'vue';
    import {getWindTowerDetail} from '@/api/modules/commonDataManage'
    import { useRoute,useRouter } from 'vue-router';
    import dayjs from 'dayjs';
    const route = useRoute()
    const tableBaseData =ref([])
    const tableActualData = ref([])
    const ACTUAL_DETAIL = [
        {
            title: '测风塔',
            dataIndex: 'windTowerCode',
            align: 'center',
            colSpan: 1,
            customCell: (_, index) => {
                // console.log(index);
                // console.log(_);
                if (index === 0) {
                    return {
                        rowSpan: _.customCellSelf,
                    };
                } else {
                    return {
                        rowSpan: 0,
                    };
                }
            },
        },
        {
            title: '数据通道',
            dataIndex: 'channel',
            align: 'center',
        },
        {
            title: '理论个数',
            dataIndex: 'rawIdealRow',
            align: 'center',
        },
        {
            title: '实测个数',
            dataIndex: 'rawRealRow',
            align: 'center',
        },
        {
            title: '缺测数据',
            dataIndex: 'rawLackRow',
            align: 'center',
        },
        {
            title: '不合理个数',
            dataIndex: 'rawBadRow',
            align: 'center',
        },
        {
            title: '有效数据完整率（%）',
            dataIndex: 'rawCompleteRate',
            align: 'center',
        },
    ];
    onMounted(() => {
        initData()
    })
    const initData = async()=> {
        try {
            const res = await getWindTowerDetail(route.query.id);
            if(res.code === 200) {
                tableBaseData.value =[res.data.rawData];
                tableActualData.value = res.data.channelList.map((m)=> {
                    return {
                        ...m,
                        "customCellSelf": res.data.channelList.length
                    }
                });
            }
        }catch(err) {
            console.log('err',err);
        }
    }

</script>
<style scoped lang="scss">
    $primary-color: #036b64;
    .detail-origin-components {
        :deep(.ant-table-tbody > tr > td) {
            padding: 0;
        }
        .custom-cell {
            display: flex;
            > span {
                flex: 1;
                padding: 10px;
                border-right: 1px solid #e4e6ee;
                border-bottom: 1px solid #e4e6ee;
                &:last-child {
                    border-right: none;
                    padding-left: 16px;
                }
            }
            &:last-child {
                >span {
                    border-bottom: none;
                }
            }
        }
        .custom-cell-center {
            text-align: center;
            padding: 8px;
        }
        .table-title {
            color: #3d435d;
            position: relative;
            padding-left: 10px;
            padding: 16px 10px;
            &::after {
                content: '';
                width: 4px;
                height: 4px;
                background: $primary-color;
                border-radius: 100%;
                float: left;
                position: absolute;
                left: 0;
                top: 50%;
                margin-top: -2px;
            }
        }
    }
</style>
