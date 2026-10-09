<template>
    <div class="linkage-component">
        <div class="tab-address">
            <a-radio-group @change="getRadioValue" v-model:value="radioValue" button-style="solid">
                <a-radio-button :value="0">省</a-radio-button>
                <a-radio-button :value="1" :disabled="!currentData[0]['areaCode']"
                    >市</a-radio-button
                >
                <a-radio-button :disabled="!currentData[1]['areaCode']" :value="2"
                    >区</a-radio-button
                >
            </a-radio-group>
        </div>
        <a-select
            class="select-address"
            ref="select"
            v-model:value="selectValue"
            @change="getSelectValue"
        >
            <a-select-option :value="0">全部状态</a-select-option>
            <a-select-option :value="1">已配置</a-select-option>
            <a-select-option :value="2">未配置</a-select-option>
        </a-select>
        <ul class="provice-list address-list">
            <li
                :class="item['areaCode'] == currentData[radioValue]['areaCode'] ? 'active' : ''"
                v-for="item in filterStatusData(filterFormatData)"
                :key="item['areaCode']"
                @click="getCurrent(item)"
            >
                <i :class="item['isHave'] ? 'active' : ''"></i>
                {{ item['areaName'] }}
            </li>
        </ul>
    </div>
</template>
<script setup>
    import { reactive, ref, onMounted,onBeforeMount } from 'vue';
    import { getProvince } from '@/api/modules/public';
    import { isHaveDataByAreaBizStatus } from '@/api/modules/climate.js';
    const emits = defineEmits(['selectAddress']);
    const props = defineProps({
        interfaceType: {
            type: Number,
            default: 1, // 1-地质 2-电网 3-雷暴 4-酸雨 5-温度 6-风压
        },
    });
    const radioValue = ref(0);
    const selectValue = ref(0);
    let areaData = reactive([]);
    const filterFormatData = ref([]);
    // 用户点选数据
    const currentData = reactive({
        0: {
            state: 0,
            areaCode: null,
            areaName: null,
        },
        1: {
            state: 0,
            areaCode: null,
            areaName: null,
        },
        2: {
            state: 0,
            areaCode: null,
            areaName: null,
        },
    });
    onBeforeMount(() => {
        getAllProvinceData(props.interfaceType,0)
    });
    const getAllProvinceData = async(bizType,parentAreaCode) => {
        try {
            let params = {
                bizType,
                parentAreaCode,
            }
            let res = await isHaveDataByAreaBizStatus(params);
            if(res.data && res.data.length) {
                // console.log('radioValue.value',radioValue.value);
                filterFormatData.value = res.data;
                getCurrent(res.data[0])
            }else {
                filterFormatData.value = [];
            }
        } catch (error) {
            console.log('---',error);
        }
    }
    // 切换省市区radio
    const getRadioValue = (val) => {
        selectValue.value = currentData[radioValue.value]['state'];
        switch (radioValue.value) {
            case 0:
                getAllProvinceData(props.interfaceType,0)
                break;
            case 1:
                getAllProvinceData(props.interfaceType,currentData[0]['areaCode'])
                break;
            case 2:
                getAllProvinceData(props.interfaceType,currentData[1]['areaCode'])
                break;
            default:
                break;
        }
        emits('selectAddress', { type: radioValue.value, data: currentData });
    };
    // 切换数据状态
    const getSelectValue = () => {
        currentData[radioValue.value]['state'] = selectValue.value;
        currentData[radioValue.value]['areaCode'] = null;
        currentData[radioValue.value]['areaName'] = null;
        currentData[radioValue.value]['id'] = null;
        switch (radioValue.value) {
            case 0:
                resetCity();
                resetCounty();
                break;
            case 1:
                resetCounty();
                break;
            default:
                break;
        }
    };
    // 数据根据状态过滤
    const filterStatusData = (datas) => {
        if (selectValue.value && datas.length > 0) {
            return datas.filter((item) => (selectValue.value == 1 ? item.isHave : !item.isHave));
        } else {
            return datas;
        }
    }
    // 重置市级数据状态
    const resetCity = () => {
        currentData[1]['state'] = 0;
        currentData[1]['areaCode'] = null;
        currentData[1]['areaName'] = null;
    };
    // 重置区级数据状态
    const resetCounty = () => {
        currentData[2]['state'] = 0;
        currentData[2]['areaCode'] = null;
        currentData[2]['areaName'] = null;
    };
    // 点击省、市、县
    const getCurrent = (item) => {
        currentData[radioValue.value]['areaCode'] = item['areaCode'];
        switch (radioValue.value) {
            case 0:
                currentData[0]['areaName'] = item['areaName'];
                currentData[0]['areaCode'] = item['areaCode'];
                resetCity();
                resetCounty();
                break;
            case 1:
                currentData[1]['areaName'] = item['areaName'];
                currentData[1]['areaCode'] = item['areaCode'];
                resetCounty();
                break;
            default:
                currentData[2]['areaName'] = item['areaName'];
                currentData[2]['areaCode'] = item['areaCode'];
                break;
        }
        emits('selectAddress', { type: radioValue.value, data: currentData });
    };
    // 编辑回显
    const echo = (value) => {
        value.forEach((item, index) => {
            radioValue.value = index
            getCurrent(item);
        })
        console.log(currentData);
        // 手动触发点击
        // getCurrent(value[0]);
    };
    defineExpose({
        echo,
    });
</script>
<style scoped lang="scss">
    @import './linkage.scss';
</style>
