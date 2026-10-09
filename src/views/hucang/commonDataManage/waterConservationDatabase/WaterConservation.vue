<template>
  <div class="water-conservation">
    <water-conservation-search-bar  @getModeType="getModeType" ref="waterConservationRef"></water-conservation-search-bar>
    <water-conservation-map v-if="modeType =='a'"></water-conservation-map>
    <water-conservation-list v-if="modeType =='b'"></water-conservation-list>
  </div>
</template>

<script setup>
import { ref, reactive, toRefs, onBeforeMount, onMounted, watchEffect, onActivated } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import WaterConservationSearchBar from './components/WaterConservationSearchBar.vue';
import WaterConservationMap from './components/WaterConservationMap.vue';
import WaterConservationList from './components/WaterConservationList.vue';

const route = useRoute();
const router = useRouter();
const waterConservationRef = ref(null)
const modeType = ref('a')
onMounted(()=> {
  modeType.value= waterConservationRef.value.searchKey.modeType
})
const getModeType = (val) => {
  modeType.value = val;
};
onActivated(() => {
 console.log('currentPower')
})
onBeforeMount(() => {
})
onMounted(() => {
})
watchEffect(()=>{
})

</script>
<style scoped lang='scss'>
.water-conservation{
  background-color: #fff;
    padding: 32px 24px  16px 24px;
    position: relative;
    min-height: calc(100vh - 120px);
}
</style>