<template>
  <div class="current-power">
    <current-power-list-search-bar @getModeType="getModeType" ref="currentPowerRef"/>
    <current-power-map  v-if="modeType =='a'"></current-power-map>
    <all-power-list  v-if="modeType =='b'"></all-power-list>
  </div>
</template>

<script setup>
import { ref, reactive,shallowReactive, onMounted, computed, watch, onActivated}  from 'vue';
import AllPowerList from './components/AllPowerList.vue';
import CurrentPowerListSearchBar from './components/CurrentPowerListSearchBar.vue';
import CurrentPowerMap from './components/CurrentPowerMap.vue';
import {useRouter} from 'vue-router';
const showComponents = shallowReactive({
  'a': CurrentPowerMap,
  'b': AllPowerList
})
const modeType = ref('a')
const currentPowerRef = ref(null)
onMounted(()=> {
  modeType.value= currentPowerRef.value.searchKey.modeType
})
const getModeType = (val) => {
  modeType.value = val;
};
onActivated(() => {
 console.log('currentPower')
})

</script>
<style scoped lang='scss'>
@import './currentPower.scss';
.current-power-content {
  // margin-top: 16px;
}
</style>