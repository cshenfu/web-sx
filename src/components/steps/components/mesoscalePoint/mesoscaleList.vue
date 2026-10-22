<template>
    <div class="mesoscale-list-container">
        <header>降尺度风速数据</header>
        <ul>
            <li v-for="(item,itemIndex) in mesoscaleListData" :key="itemIndex">
                <a-input-group compact>
                <a-select placeholder="请选择" v-model:value="item.height" style="width: 50%" :options="heightOptions" @change="changHeight" />
                <a-input placeholder="请输入" v-model:value="item.speed" @blur="sessionSaveWindSpeed(itemIndex)" style="width: 50%" suffix="m/s"/>
                </a-input-group>
                <div class="item-handle">
                    <iconpark-icon v-if="mesoscaleListData.length > 3" class="handle-icon" @click.stop="deleteItem(itemIndex)" :size="16" name="shanjian"></iconpark-icon>
                    <iconpark-icon style="color: #0389EA;" v-if="itemIndex === mesoscaleListData.length - 1" class="handle-icon" @click="addItem" :size="16" name="tianjia"></iconpark-icon>
                </div>
            </li>
        </ul>
    </div>
</template>
<script setup>
import { ref, onBeforeMount } from 'vue';
const mesoscaleListData = ref([{
    height: null,
    speed: null
}, {
    height: null,
    speed: null
}, {
    height: null,
    speed: null
}]);
const heightOptions = ref([]);
const sessionSaveWindSpeed = (index) => {
    const data = parseFloat(mesoscaleListData.value[index].speed)
    if (isNaN(data)) {
        mesoscaleListData.value[index].speed = null;
    } else {
        mesoscaleListData.value[index].speed = data;
    }
}
const changHeight = () => {
    const selectedHeights = new Set(mesoscaleListData.value.map((item) => item.height));
        heightOptions.value = heightOptions.value.map((opt) => ({
            ...opt,
            disabled: selectedHeights.has(opt.value),
        }));
}
const addItem = () => {
    mesoscaleListData.value.push({
        height: null,
        speed: null
    })
}
const deleteItem = (index) => {
    mesoscaleListData.value.splice(index, 1)
}
const initHeightOptions = () => {
    heightOptions.value = [];
    for (let i = 80; i <= 200; i += 5) {
        heightOptions.value.push({
            label: `${i}m`,
            value: i,
            disabled: false,
        });
    }
}
const getData = () => {
    console.log('进入获取数据事件', mesoscaleListData.value);
    const emptyData = mesoscaleListData.value.filter((item) => 
        !item.height || !item.speed
    )
    const hasValueData = mesoscaleListData.value.filter((item) => 
        item.height && item.speed
    )
    console.log(emptyData, 'emptyData');
    // return !emptyData.length ? mesoscaleListData.value : null;
    return !hasValueData.length ? [] : hasValueData;
}
const setData = (data) => {
    if (data && data.length) {
        mesoscaleListData.value = data;
    } else {
        mesoscaleListData.value = [{
            height: null,
            speed: null
        }, {
            height: null,
            speed: null
        }, {
            height: null,
            speed: null
        }]
    }
}
onBeforeMount(() => {
    initHeightOptions()
})
defineExpose({
    getData,
    setData,
    mesoscaleListData
})
</script>
<style scoped>
.mesoscale-list-container {
    li {
        margin: 8px 0;
        display: flex;
        align-items: center;
    }
    header {
        font-weight: 500;
        font-size: 12px;
        margin: 16px 0;
    }
    footer {
        color: #999;
    }
    .handle-icon {
        margin-left: 8px;
    }
    .item-handle {
        flex: none;
        width: 40px;
        display: flex;
        align-items: center;
    }
}
</style>