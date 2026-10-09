<template>
  <div class="design-specification rigth-space-content">
    <design-specification-list-search-bar ref="designSpecificationList"></design-specification-list-search-bar>
    <all-design-specification-list></all-design-specification-list>
  </div>
</template>

<script setup>
import { ref, reactive, toRefs, onBeforeMount, onMounted, watchEffect, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DesignSpecificationListSearchBar from './components/DesignSpecificationListSearchBar.vue';
import AllDesignSpecificationList from './components/AllDesignSpecificationList.vue';
/**
* 路由对象
*/
const route = useRoute();
/**
* 路由实例
*/
const router = useRouter();
const data = reactive({})
onBeforeMount(() => {
})
onMounted(() => {
})
watchEffect(()=>{
})
// 使用toRefs解构
// let { } = { ...toRefs(data) } 
defineExpose({
  ...toRefs(data)
})

</script>
<style scoped lang='scss'>
.design-specification{

}
</style>