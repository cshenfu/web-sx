<template>
  <div class="cad-list">
    <cad-drawing-list-search-bar  ref="cadDrawingManagementRef"/>
    <all-cad-drawing-list />
  </div>
</template>

<script setup>
import { ref, reactive, shallowReactive, onBeforeMount, onMounted,onActivated, watchEffect, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CadDrawingListSearchBar from './components/CadDrawingListSearchBar.vue';
import AllCadDrawingList from './components/AllCadDrawingList.vue'

const cadDrawingManagementRef = ref(null)
onMounted(()=> {
})
onActivated(() => {
 console.log('currentPower')
})
onBeforeMount(() => {

})
onMounted(() => {
  //console.log('3.-组件挂载到页面之后执行-------onMounted')
})
watchEffect(()=>{
})


</script>
<style scoped lang='scss'>
.cad-list {
    background-color: #fff;
    padding: 32px 24px  16px 24px;
    position: relative;
    min-height: calc(100vh - 120px);
}
</style>