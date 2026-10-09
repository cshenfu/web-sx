<template>
  <div class="loading-wrapper">
    <a-spin tip="加载中，请稍等..." spinning  >
        <div style="height: 150px"></div>
    </a-spin>
  </div>
</template>

<script setup>
import { ref, reactive, toRefs, onBeforeMount, onMounted, watchEffect, computed } from 'vue';

const data = reactive({})
onBeforeMount(() => {
})
onMounted(() => {
    console.log('加载',);
    
})

</script>
<style scoped lang='scss'>
.loading-wrapper {
//   min-height: 200px; /* 防止加载组件太小被忽略 */
//   display: flex;
//   justify-content: center;
//   align-items: center;
}
</style>