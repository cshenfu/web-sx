<template>
  <div class="common-add-data-header">
    <div class="header-left">
      <div class="header-left-bg"><iconpark-icon name="gongsi" class="header-icon" size="20"></iconpark-icon> </div>
     
      {{ selectData.provice }}</div>
    <!-- <ul class="header-right">
      <li>省 ({{selectData.num}}/{{selectData.noNum}})</li>
      <li>市 ({{selectData.num}}/{{selectData.noNum}})</li>
      <li>县 ({{selectData.num}}/{{selectData.noNum}})</li>
    </ul> -->
  </div>
</template>

<script setup>
import { ref, reactive, toRefs, onBeforeMount, onMounted, watchEffect, computed } from 'vue';
const props = defineProps({
  selectData: {
    type: Object,
    default: () => {}
  }
});

</script>
<style scoped lang='scss'>
.common-add-data-header {
  flex: 1;
  height: 40px;
  background: #F2F7F7;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding:0 24px 0 16px;
  .header-left {
    font-size: 14px;
    font-weight: 500;
    color: #363B4D;
    line-height: 14px;
    display: flex;
    align-items: center;
    .header-left-bg {
      width: 28px;
      height: 28px;
      background: #CDE1E0;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right:8px ;
    }
    .header-icon {

      font-size: 14px;
    }
  }
  .header-right {
    display: flex;
    align-items: center;
    li {
      font-size: 12px;
      color: #363B4D;
      line-height: 12px;
      margin-right: 10px;
      &:last-child{
        margin-right: 0;
      }
    }
  }
}
</style>