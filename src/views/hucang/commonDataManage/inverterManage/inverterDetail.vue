<template>
    <div class="equipment-detail">
        <h4 class="content-title">
            <img src="@/assets/img/user/detail-title.png" alt="" />
            基本信息
        </h4>
        <div class="content-body">
            <a-row>
                <a-col :span="8">
                    <span>逆变器设备编号</span>
                    <p>{{devicePowerInfo?.inverterCode}}</p>
                </a-col>
                <a-col :span="8">
                    <span>逆变器型号</span>
                    <p>{{devicePowerInfo?.model}}</p>
                </a-col>
                <a-col :span="8">
                    <span>制造商</span>
                    <p>{{devicePowerInfo?.manufacturer}}</p>
                </a-col>
            </a-row>
            <a-row>
                <a-col :span="8">
                    <span>价格（元/kW）</span>
                    <p>{{devicePowerInfo?.unitPrice}}</p>
                </a-col>
                <a-col :span="8">
                    <span>设备类型</span>
                    <p>
                        {{devicePowerInfo?.inverterTypeStr }}
                    </p>
                </a-col>
                <a-col :span="8">
                    <span>设备容量（kW）</span>
                    <p>
                        {{devicePowerInfo?.capacity}}
                    </p>
                </a-col>
            </a-row>
        </div>
        <div class="impeller-content">
            <h4 class="content-title">
                <img src="@/assets/img/user/detail-title.png" alt="" />
                功率
            </h4>
            <table-list
                :isShowPage="false"
                bordered
                class="user-table"
                :loading="loading"
                :tableData="allDataArray"
                :tableColumn="POWER_DETAIL_TABLE_LIST_CLOUMN"
            >
            </table-list>
        </div>
        <div class="impeller-content">
            <h4 class="content-title">
                <img src="@/assets/img/user/detail-title.png" alt="" />
                输入参数
            </h4>
            <table-list
                :isShowPage="false"
                bordered
                class="user-table"
                :loading="loading"
                :tableData="allDataArray"
                :tableColumn="INPUT_PARAMETER_TABLE_LIST_CLOUMN"
            >
            </table-list>
        </div>
        <div class="impeller-content">
            <h4 class="content-title">
                <img src="@/assets/img/user/detail-title.png" alt="" />
                输出参数
            </h4>
            <table-list
                :isShowPage="false"
                bordered
                class="user-table"
                :loading="loading"
                :tableData="allDataArray"
                :tableColumn="OUTPUT_PARAMETER_TABLE_LIST_CLOUMN"
            >
            </table-list>
        </div>
        <div class="impeller-content">
            <h4 class="content-title">
                <img src="@/assets/img/user/detail-title.png" alt="" />
                常规参数
            </h4>
            <table-list
                :isShowPage="false"
                bordered
                class="user-table"
                :loading="loading"
                :tableData="allDataArray"
                :tableColumn="GENERAL_TABLE_LIST_CLOUMN"
            >
            </table-list>
        </div>
        <!-- <div class="impeller-content">
            <h4 class="content-title">
                <img src="@/assets/img/user/detail-title.png" alt="" />
                主要日志
            </h4>
            <LogEle></LogEle>
        </div> -->
    </div>
</template>

<script setup>
    import { ref, reactive, toRefs, onBeforeMount, onMounted, watchEffect, computed } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import TableList from '@/components/tableList/TableList.vue';
    import LogEle from './components/Log.vue';
    import {
        POWER_DETAIL_TABLE_LIST_CLOUMN,
        INPUT_PARAMETER_TABLE_LIST_CLOUMN,
        OUTPUT_PARAMETER_TABLE_LIST_CLOUMN,
        GENERAL_TABLE_LIST_CLOUMN,
    } from './inverter';
    import {getInverterDetail} from '@/api/modules/commonDataManage'
    const route = useRoute();
    //所有参数数组
    const allDataArray = ref([]) 
    const loading = ref(false);
    const devicePowerInfo = ref(null);

    onBeforeMount(() => {
    });
    onMounted(() => {
        if (route.query.id) {
            getDetailInfo();     
        }
    });
    const getDetailInfo = () => {
        getInverterDetail(route.query.id).then(res => {
            if (res.code == 200) {
                devicePowerInfo.value = res.data;
                allDataArray.value= [{...res.data}];

            }
        })
    }

    // 使用toRefs解构
    defineExpose({});
</script>
<style scoped lang="scss">
  @import '@/assets/css/detail.scss';
  @import '@/assets/css/tabs.scss';

    .equipment-detail {
        height: calc(100vh - 105px);
        overflow-y: auto;
        background: #fff;
        padding: 24px;

        .self-table-list {
            margin-bottom: 20px;

            .self-table-column {
                // width: 109px;
                height: 40px;
                text-align: center;
                line-height: 40px;
                border: 1px solid #e4e6ee;
                font-size: 12px;
                // font-weight: bold;
                color: #363b4d;

                &:nth-child(2n) {
                    border-top: none;
                    border-bottom: none;
                }
            }

            .list-item-content {
                .self-table-column {
                    // border-left:none ;
                    border-right: none;

                    &:first-child,
                    &:nth-child(n) {
                        border-left: none;
                        border-right: 1px solid #e4e6ee;
                    }

                    &:first-child {
                        background: #fafafa;
                        font-weight: bold;
                    }
                }
            }
        }
        .toer-info{
            margin-bottom: 12px;
        }

        .impeller-content {
            margin-top: 24px;
        }

        .has-bg {
            background: #fafafa;
            font-weight: bold;
        }
    }
</style>
