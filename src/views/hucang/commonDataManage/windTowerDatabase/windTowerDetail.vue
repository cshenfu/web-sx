<template>
    <div class="windTower-detail-components">
        <h4 class="content-title">
            <!-- <img src="../../../assets/img/user/detail-title.png" alt="" /> -->
            基本信息
        </h4>
        <div class="content-body">
            <a-row>
                <a-col :span="8">
                    <span>测风塔编号</span>
                    <p>{{ baseData.windTowerCode }}</p>
                </a-col>
                <a-col :span="8">
                    <span>测风塔号</span>
                    <p>{{ baseData.windTowerSeq }}</p>
                </a-col>
                <a-col :span="8">
                    <span>所属区域</span>
                    <p>{{ baseData.provinceName }}/{{baseData.cityName }}/{{ baseData.districtName }}</p>
                </a-col>
            </a-row>
            <a-row>
                <a-col :span="8">
                    <span>数据来源</span>
                    <p>{{ baseData.source}}</p>
                </a-col>
                <a-col :span="8">
                    <span>数据状态</span>
                    <p>{{ dataStatus }}</p>
                </a-col>
                <a-col :span="8">
                    <span>层数/最高层</span>
                    <p>{{ baseData.tier }}/{{ baseData.topHeight }}</p>
                </a-col>
            </a-row>
            <a-row>
                <a-col :span="24">
                    <span>原始文件</span>
                    <p class="active-item">
                        <template v-if="baseData.rawFile">
                            <a href="">{{baseData.rawFile}}</a>
                        </template>
                        <template v-else>
                            暂无
                        </template>
                    </p>
                </a-col>
                <a-col :span="24">
                    <span>插补后文件</span>
                    <p class="active-item">
                        <template v-if="baseData.repairFile">
                            <a href="">{{ baseData.repairFile }}</a>
                        </template>
                        <template v-else>
                            暂无
                        </template>
                    </p>
                </a-col>
            </a-row>
        </div>
        <div class="custom-tab">
            <div class="custom-tab-bg" :style="{ left: detailTypeIndex == 0 ? 0 : '50%' }"></div>
            <span :class="detailTypeIndex == 0 ? 'active' : ''" @click="detailTypeIndex = 0"
                >原始数据情况</span
            >
            <span :class="detailTypeIndex == 1 ? 'active' : ''" @click="detailTypeIndex = 1"
                >计算后数据情况</span
            >
        </div>
        <detailOrigin v-if="detailTypeIndex == 0" style="margin-bottom: 16px"></detailOrigin>
        <!-- <detailComputed v-else style="margin-bottom: 16px"></detailComputed> -->
        <h4 class="content-title">
            <!-- <img src="../../../assets/img/user/detail-title.png" alt="" /> -->
            主要操作日志
        </h4>
        <LogEle></LogEle>
    </div>
</template>
<style scoped lang="scss">
  @import '@/assets/css/detail.scss';
  @import './css/windTowerDetail.scss';
</style>
<script setup>
    import { ref,onBeforeMount,computed } from 'vue';
    import detailOrigin from './components/detail/detailOrigin.vue';
    import detailComputed from './components/detail/detailComputed.vue';
    import LogEle from './components/Log/Log.vue';
    import {getWindTowerDetail} from '@/api/modules/commonDataManage'
    import { useRoute,useRouter } from 'vue-router';
    import { USER_COMMON_DATA_STATUS,PUBLIC_COMMON_STATUS} from '../commonData'
    const route = useRoute()
    let detailTypeIndex = ref(0);
    const baseData = ref({})
    onBeforeMount(() => {
        initData()
    })
    const dataStatus = computed(()=>{
        // Todo需要更改 需要判断是用户的还是公共的
        let str='',result,data
        // if(baseData.value.source === '用户上传'){
        //     data = USER_COMMON_DATA_STATUS
        // }else {
        //     data = PUBLIC_COMMON_STATUS
        // }
        data = PUBLIC_COMMON_STATUS
        result = data.filter((m)=>m.value == baseData.value.analysisStatus)
        console.log(baseData.value.source,'---',result);
        return str = result && result.length > 0 ? result[0].label : ''
    })
    const initData = async()=> {
        try {
            const res = await getWindTowerDetail(route.query.id);
            if(res.code === 200) {
                baseData.value = res.data.baseInfo
            }

        }catch(err) {

        }
    }
</script>
