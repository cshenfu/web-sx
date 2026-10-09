<template>
    <div class="climate-detail-components">
        <h4 class="content-title">
            <!-- <img src="../../../assets/img/user/detail-title.png" alt="" /> -->
            基本信息
        </h4>
        <div class="content-body">
            <a-row>
                <a-col :span="8" v-for="item in detailInfoFields['infoList']">
                    <span>{{ item['title'] }}</span>
                    <p>{{ detailInfo[item['fields']]?detailInfo[item['fields']]:'--' }} <span v-if="item.fieldsSecond">~{{ detailInfo[item['fieldsSecond']] }}</span></p>
                </a-col>
            </a-row>
            <a-row v-for="item in detailInfoFields['fileList']">
                <a-col>
                    <span>{{ item['title'] }}</span>
                    <template v-if="item['type'] == 'file'">
                        <!-- v-for="fileItem in item['data']" -->
                        <p v-if="detailInfo[item.fields]">
                            {{detailInfo[item.fields] }}
                            <!-- Todo 需要回显一下路径 -->
                            <!-- <a style="margin-left: 12px" href=""
                                >{{ fileItem['url']
                                }}<iconpark-icon name="fujian"></iconpark-icon>附件下载</a
                            > -->
                        </p>
                        <p v-else>--</p>
                    </template>
                    <template v-else>
                        <p v-if="detailInfo[item.fields]">
                            <!-- v-for="fileItem in item['data']" -->
                            <span class="fileItemImage">
                                <a-image
                                    :src="detailInfo[item.fields]['filePath']"
                                    style="margin-right: 12px"
                                />
                            </span>
                            <!-- <img
                                style="margin-right: 12px"
                                :src="fileItem['url']"
                                v-for="fileItem in item['data']"
                            /> -->
                        </p>
                        <p v-else>--</p>
                    </template>
                </a-col>
            </a-row>
        </div>
        <!-- <h4 class="content-title">
            <img src="../../../assets/img/user/detail-title.png" alt="" />
            主要日志
        </h4> -->
        <!-- <logEle></logEle> -->
    </div>
</template>
<style scoped lang="scss">
  @import '@/assets/css/detail.scss';
    .climate-detail-components {
        padding: 24px;
        background: #ffffff;
    }
</style>
<script setup>
    import { reactive, watch, ref,onBeforeMount } from 'vue';
    import logEle from './components/Log/Log.vue';
    import { useRoute } from 'vue-router';
    import {
        thunderDetail,
        acidRainDetail,
        temperatureDetail,
        windPressureDetail,
        snowPressureDetail,
        rainFallDetail,
        sandStormDetail,
        windSpeedDetail,
        hailDetail
    } from './climateDataBase'
    import {
        getThunderstormDetail,
        getDryRainDetail,
        getTemperatureDetail,
        getWindPressureDetail,
        getSnowDetail,
        getRainFallDetail,
        getDustDetail,
        getWindSpeedDetail,
        getHailDetail,
    } from "@/api/modules/climate"
    const route = useRoute();
    const type = ref(route.query.type);
    const baseStatic = {
        1:thunderDetail,
        2:acidRainDetail,
        3:temperatureDetail,
        4:windPressureDetail,
        5:snowPressureDetail,
        6:rainFallDetail,
        7:sandStormDetail,
        8:windSpeedDetail,
        9:hailDetail,
    }
    const detailInfo =ref({})

    // 汇总所有的数据
     const allDetailFn =async(type)=> {
        let res 
        try {
            switch (Number(type)) {
                case 1:
                    res = await getThunderstormDetail(route.query.id)
                    break;
                case 2:
                    res = await getDryRainDetail(route.query.id)
                    break;
                case 3:
                    res = await getTemperatureDetail(route.query.id)
                    break;
                case 4:
                    res = await getWindPressureDetail(route.query.id)
                    break;
                case 5:
                    res = await getSnowDetail(route.query.id)
                    break;
                case 6:
                    res = await getRainFallDetail(route.query.id)
                    break;
                case 7:
                    res = await getDustDetail(route.query.id)
                    break;
                case 8:
                    res = await getWindSpeedDetail(route.query.id)
                    break;
                case 9:
                    res = await getHailDetail(route.query.id)
                    break;
            }
            if(res.data) {
                detailInfo.value = res.data
            }
        } catch (error) {
            console.log('-error--',error);
            
        }
    }
    const detailInfoFields =ref({})
    onBeforeMount(()=>{
            type.value = route.query.type;
            detailInfoFields.value = baseStatic[type.value]
            allDetailFn(type.value)
    })
    // watch(
    //     () => route.path,
    //     (newVal) => {
    //         type.value = route.query.type;
    //         detailInfoFields.value = baseStatic[type.value]
    //         console.log('+++++++++++');
    //         console.log(detailInfoFields.value);
    //         allDetailFn(type.value)
    //     },
    //     { deep: true, immediate: true },
    // )
</script>
 