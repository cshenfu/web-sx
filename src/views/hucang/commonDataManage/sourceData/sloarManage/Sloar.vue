<template>
  <div class="current-power">
    <sloar-list-search-bar @getModeType="getModeType" ref="sloarRef"/>
    <sloar-map  v-if="modeType =='a'"></sloar-map>
    <all-sloar-list  v-if="modeType =='b'"></all-sloar-list>
  </div>
</template>

<script setup>
import { ref, reactive,shallowReactive, onMounted, computed, watch, onActivated}  from 'vue';
import AllSloarList from './components/AllSloarList.vue';
import SloarListSearchBar from './components/SloarListSearchBar.vue';
import SloarMap from './components/SloarMap.vue';
import {useRouter} from 'vue-router';
const modeType = ref('a')
const sloarRef = ref(null)
onMounted(()=> {
  modeType.value= sloarRef.value.searchKey.modeType
})
const getModeType = (val) => {
  modeType.value = val;
};
onActivated(() => {
 console.log('currentPower')
})

</script>
<style scoped lang='scss'>
.current-power {
  background-color: #fff;
    padding: 24px 24px  16px 24px;
    position: relative;
    min-height: calc(100vh - 120px);
}
</style>