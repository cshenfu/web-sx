<template>
  <div  class="queue-managment project-control-list">
    <div class="user-tabs">
        <ul class="user-tabs-ul">
            <li
                class="user-tabs-li"
                @click="chooseTabs(0)"
                :class="activeKey == 0 ? 'active' : ''"
                >中尺度
            </li>
            <li
                class="user-tabs-li"
                @click="chooseTabs(1)"
                :class="activeKey == 1 ? 'active' : ''"
                >流场发电量A1.0
            </li>
            <li
                class="user-tabs-li"
                @click="chooseTabs(5)"
                :class="activeKey == 5 ? 'active' : ''"
                >流场发电量H1.0
            </li>
            <li
                class="user-tabs-li"
                @click="chooseTabs(2)"
                :class="activeKey == 2 ? 'active' : ''"
                >土建基础
            </li>
            <li
                class="user-tabs-li"
                @click="chooseTabs(3)"
                :class="activeKey == 3 ? 'active' : ''"
                >技经概算
            </li>
            <li
                class="user-tabs-li"
                @click="chooseTabs(4)"
                :class="activeKey == 4 ? 'active' : ''"
                >财务评价
            </li>
        </ul>
    </div>
    <all-queue-management-list :activeKey="activeKey"></all-queue-management-list>
  </div>
</template>

<script setup>
import { ref, reactive, toRefs, onBeforeMount, onMounted, watchEffect, computed } from 'vue';
import AllQueueManagementList from '../components/AllQueueManagementList.vue';
import { useRoute, useRouter } from 'vue-router';
const emits = defineEmits(['changeActiveKey']);
const activeKey = ref(1);
const chooseTabs = (index) => {
    activeKey.value = index;
    emits('changeActiveKey', index);
};
onBeforeMount(() => {
})
onMounted(() => {
})

</script>
<style scoped lang='scss'>
    @import '@/assets/css/tabs.scss';
    @import '../projectControl.scss';
</style>