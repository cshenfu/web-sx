<template>
  <div class="drop-down-list">
    <a-dropdown :trigger="['hover']" placement="bottomRight">
      <iconpark-icon name="gengduo" size="14"></iconpark-icon>
      <template #overlay>
          <slot name="dropDownContent"></slot>
      </template>
    </a-dropdown>
  </div>
</template>

<script setup>
import { ref, reactive, toRefs, onBeforeMount, onMounted, watchEffect, computed } from 'vue';
</script>
<style scoped lang='scss'>
.drop-down-list{
  display: flex;
  align-items: center;
}
</style>