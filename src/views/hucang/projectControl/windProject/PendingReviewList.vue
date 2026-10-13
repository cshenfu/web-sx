<template>
  <div class="pending-review-list project-control-list">
    <div class="user-tabs">
        <ul class="user-tabs-ul">
            <li
                class="user-tabs-li"
                @click="chooseTabs(1)"
                :class="activeKey == 1 ? 'active' : ''"
                >发电量待审核
            </li>
            <li
                class="user-tabs-li"
                @click="chooseTabs(7)"
                :class="activeKey == 7 ? 'active' : ''"
                >完成待审核
            </li>
        </ul>
    </div>
    <!-- 列表 -->
    <all-pending-review-project-list :activeKey="activeKey"></all-pending-review-project-list>
  </div>
</template>

<script setup>
import { ref, reactive, toRefs, onBeforeMount, onMounted,} from 'vue';
import AllPendingReviewProjectList from '../components/AllPendingReviewProjectList'
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