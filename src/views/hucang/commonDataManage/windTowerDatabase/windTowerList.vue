<template>
  <div class="wind-tower-content">
    <!-- <div class="add-btn" @click="addData"><iconpark-icon name="xinzeng" size="12" class="add-icon"></iconpark-icon> 新增数据</div> -->
    <wind-tower-list-search-bar ref="windTowerListSearch" @getModeType="getModeType" />
    <WindTowerMaps    v-if="modeType =='a'" ></WindTowerMaps>
    <AllWindTowerList  v-if="modeType =='b'"  ></AllWindTowerList>
    <!-- 新增数据 -->
    <add-wind-towe-data v-model:openModal="openAddModal"></add-wind-towe-data>
  </div>
</template>

<script setup>
import { ref,onMounted, onActivated, onDeactivated}  from 'vue';
import AllWindTowerList from './components/AllWindTowerList.vue';
import WindTowerMaps from './components/WindTowerMaps.vue';
import WindTowerListSearchBar from './components/WindTowerListSearchBar.vue';
import AddWindToweData from './components/AddWindToweData.vue';
import {useRouter} from 'vue-router';
const allWindTowerListRef = ref(null);
const modeType = ref('')
const windTowerListSearch = ref(null)
onMounted(() => {
  modeType.value = windTowerListSearch.value.searchKey.modeType
})
onActivated(()=> {
  modeType.value = windTowerListSearch.value.searchKey.modeType
})
onDeactivated(()=> {
  modeType.value = ''
})
// 地图还是公共数据

const getModeType = (val) => {
  modeType.value = val
};
const router = useRouter()
// 新增数据
const openAddModal = ref(false);
const addData = () => {
    openAddModal.value = true;
    // window.open('http://172.16.12.240:3201/testAuth','_blank')
}

</script>
<style scoped lang='scss'>
@import './windTower.scss';

</style>