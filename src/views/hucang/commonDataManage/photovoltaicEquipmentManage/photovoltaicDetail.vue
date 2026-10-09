<template>
    <div class="equipment-detail">
        <h4 class="content-title">
            <img src="@/assets/img/user/detail-title.png" alt="" />
            基本信息
        </h4>
        <div class="content-body">
            <a-row>
                <a-col :span="8">
                    <span>组件编号</span>
                    <p>{{devicePowerInfo?.moduleCode}}</p>
                </a-col>
                <a-col :span="8">
                    <span>组件型号</span>
                    <p>{{devicePowerInfo?.moduleModel}}</p>
                </a-col>
                <a-col :span="8">
                    <span>制造商</span>
                    <p>{{devicePowerInfo?.manufacturer}}</p>
                </a-col>
            </a-row>
            <a-row>
                <a-col :span="8">
                    <span>价格</span>
                    <p>{{devicePowerInfo?.price}}</p>
                </a-col>
                <a-col :span="8">
                    <span>组件类型</span>
                    <p>
                        {{ devicePowerInfo.componentTypeStr}}
                    </p>
                </a-col>
                <a-col :span="8">
                    <span>组件容量</span>
                    <p>
                        {{devicePowerInfo.capacity}}
                    </p>
                </a-col>
            </a-row>
        </div>
        <div class="impeller-content">
            <h4 class="content-title">
                <img src="@/assets/img/user/detail-title.png" alt="" />
                组件结构图
            </h4>
            <a-image
                v-if="devicePowerInfo?.structuralDiagramComponents"
                :width="50"
                :height="50"
                :src="getImgUrl(devicePowerInfo.structuralDiagramComponents)"
            />
            <p v-else>&nbsp;&nbsp;未上传数据</p>
        </div>
        <div class="impeller-content">
            <h4 class="content-title">
                <img src="@/assets/img/user/detail-title.png" alt="" />
                特性曲线图
            </h4>
            <a-image
                v-if="devicePowerInfo?.componentCharacteristicCurveDiagram"
                :width="50"
                :height="50"
                 :src="getImgUrl(devicePowerInfo.componentCharacteristicCurveDiagram)"
            />
            <p v-else>&nbsp;&nbsp;未上传数据</p>
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
        <div class="impeller-content">
            <h4 class="content-title">
                <img src="@/assets/img/user/detail-title.png" alt="" />
                性能参数
            </h4>
            <table-list
                :isShowPage="false"
                bordered
                class="user-table"
                :loading="loading"
                :tableData="allDataArray"
                :tableColumn="PERFORMANCE_PARAMETER_TABLE_LIST_CLOUMN"
            >
            </table-list>
        </div>
        <div class="impeller-content">
            <h4 class="content-title">
                <img src="@/assets/img/user/detail-title.png" alt="" />
                温度系数
            </h4>
            <table-list
                :isShowPage="false"
                bordered
                class="user-table"
                :loading="loading"
                :tableData="allDataArray"
                :tableColumn="TEMPERATURE_COEFFICIENT_TABLE_LIST_CLOUMN"
            >
            </table-list>
        </div>
        <div class="impeller-content">
            <h4 class="content-title">
                <img src="@/assets/img/user/detail-title.png" alt="" />
                工作参数
            </h4>
            <table-list
                :isShowPage="false"
                bordered
                class="user-table"
                :loading="loading"
                :tableData="allDataArray"
                :tableColumn="WORKING_CONDITION_TABLE_LIST_CLOUMN"
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
        GENERAL_TABLE_LIST_CLOUMN,
        PERFORMANCE_PARAMETER_TABLE_LIST_CLOUMN,
        TEMPERATURE_COEFFICIENT_TABLE_LIST_CLOUMN,
        WORKING_CONDITION_TABLE_LIST_CLOUMN
    } from './photovoltaicEquipment';
    import {getPvComponentDetail} from '@/api/modules/commonDataManage';
    import {ossClientInfo} from '@/assets/js/static.js';
    const route = useRoute();
    const loading = ref(false);
    const devicePowerInfo = ref({
        moduleCode:'',
        moduleModel: '',
        manufacturer:'',
        price:'',
        componentTypeStr: '',
        capacity:'',
        structuralDiagramComponents:'',
        componentCharacteristicCurveDiagram:''
    });

    // 组件信息
    const allDataArray = ref([]);
    onBeforeMount(() => {
    });
    onMounted(() => {
        if (route.query.id) {
            getDetailInfo();     
        }
    });
    // 图片路径拼接
    const getImgUrl= (val)=>{
        let cCompeleteUrl= val?`https://${ossClientInfo.bucketname}.${ossClientInfo.endPointShort}${val}` :''
        return cCompeleteUrl
    }
    // 获取详情
    const getDetailInfo = () => {
        getPvComponentDetail(route.query.id).then(res => {
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
