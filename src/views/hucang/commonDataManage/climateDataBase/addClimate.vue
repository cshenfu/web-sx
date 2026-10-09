<template>
    <div class="add-current-power">
        <linkage v-if="!route.query.id" :interfaceType="interfaceType" @selectAddress="getSelectAddress" class="linkage" ref="currentPowerLink"></linkage>
        <component class="component-content" :selectData="selectData" :is="addComponents[addType]"></component>
    </div>
</template>

<script setup>
    import { ref, reactive, toRefs, onBeforeMount, onMounted,shallowRef , watchEffect, computed } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import linkage from '@/components/linkage/linkage.vue';
    import CommonAddDataHeader from '@/components/linkage/CommonAddDataHeader';
    import AddThunder from './components/add/AddThunderData.vue';
    import AddCing from './components/add/AddCingData.vue';
    import AddAcidRain from './components/add/AddAcidRain.vue';
    import AddTemperature from './components/add/AddTemperature.vue';
    import AddWindPressure from './components/add/AddWindPressure.vue';
    import AddSnowPressure from './components/add/AddSnowPressure.vue';
    import AddRainFall from './components/add/AddRainFall.vue';
    import AddDustDay from './components/add/AddDustDay.vue';
    import AddWindSpeed from './components/add/AddWindSpeed.vue';
    import AddHailDay from './components/add/AddHailDay.vue';

    const route = useRoute();
    const router = useRouter();
    const addType= ref(1);
    const addComponents= reactive({
        '1':shallowRef(AddThunder),
        // '2':shallowRef(AddCing),
        '2':shallowRef(AddAcidRain),
        '3':shallowRef(AddTemperature),
        '4':shallowRef(AddWindPressure),
        '5':shallowRef(AddSnowPressure),
        '6':shallowRef(AddRainFall),
        '7':shallowRef(AddDustDay),
        '8':shallowRef(AddWindSpeed),
        '9':shallowRef(AddHailDay),
    });
    const interfaceType = Number(route.query.type) + 2;
    onBeforeMount(()=> {
        addType.value = route.query.type;
    })

    const selectData = ref({
        provice: '',
        code: [],
        num: 12,
        noNum: 0,
    });
    // 获取左侧省市区选中数据
    const getSelectAddress = (value) => {
        const data = value.data;
        let str = '';
        selectData.value.code = [];
        for (let index = 0; index <= value.type; index++) {
            str +=
                (index == 0 || !data[index]['areaName'] ? '' : '/') +
                (data[index]['areaName'] ? data[index]['areaName'] : '');
            selectData.value.code.push(data[index]['areaCode']);
        }
        selectData.value.provice = str;
    };
    onMounted(() => {

    });

</script>
<style scoped lang="scss">
    .add-current-power {
        background-color: #fff;
        padding: 24px 0 24px 24px;
        display: flex;
        .linkage{
            margin-right: 26px;
        }
        .component-content {
            flex: 1;
            .add-power-right-content {
                height: calc(100vh - 190px);
                overflow: auto;
                .content-title {
                    color: #3d435d;
                    display: flex;
                    align-items: center;
                    margin: 24px 0 20px 0;

                    img {
                        height: 14px;
                        margin-right: 8px;
                    }
                    button {
                        margin-left: auto;
                        display: flex;
                        align-items: center;

                        iconpark-icon {
                            margin-right: 5px;
                        }
                    }
                }
                .require-item {
                    span {
                        &::before {
                            display: inline-block;
                            margin-inline-end: 4px;
                            color: #ff4d4f;
                            font-size: 14px;
                            font-family: SimSun, sans-serif;
                            line-height: 1;
                            content: '*';
                        }
                    }
                }
                .self-label {
                    font-size: 14px;
                    color: #5c6170;
                    line-height: 12px;
                    &::before {
                        display: inline-block;
                        margin-inline-end: 4px;
                        color: #ff4d4f;
                        font-size: 14px;
                        font-family: SimSun, sans-serif;
                        line-height: 1;
                        content: '*';
                    }
                }
            }
            .handle-button {
                margin: 0 16px;
                width: 80px;
            }
        }
    }
</style>
