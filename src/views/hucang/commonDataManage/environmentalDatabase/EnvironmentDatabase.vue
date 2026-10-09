<template>
  <div  class="environment-data">
    <environmental-search-bar @getModeType="getModeType" ref="environmentalRef"></environmental-search-bar>
    <environmental-map   v-if="modeType =='a'"></environmental-map>
    <environmental-list  v-if="modeType =='b'"></environmental-list>
  </div>
</template>

<script setup>
import { ref, reactive, toRefs, onBeforeMount, onMounted, watchEffect, onActivated  } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import EnvironmentalSearchBar from './component/EnvironmentalSearchBar.vue';
import EnvironmentalList from './component/EnvironmentalList.vue';
import EnvironmentalMap from './component/EnvironmentalMap.vue';

const route = useRoute();
const router = useRouter();
const environmentalRef = ref(null)
const modeType = ref('a')
onMounted(()=> {
  modeType.value= environmentalRef.value.searchKey.modeType
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
.environment-data{
  background-color: #fff;
    padding: 32px 24px  16px 24px;
    position: relative;
    min-height: calc(100vh - 120px);
}
</style>