<template>
 <div class="user-tabs">
    <ul class="user-tabs-ul">
        <li
            class="user-tabs-li"
            @click="chooseTabs(null)"
            :class="activeKey == null ? 'active' : ''"
            >全部</li
        >
        <li
            class="user-tabs-li"
            @click="chooseTabs(8)"
            :class="activeKey == 8 ? 'active' : ''"
            >文件待解析</li
        >
        <li
            class="user-tabs-li"
            @click="chooseTabs(3)"
            :class="activeKey == 3 ? 'active' : ''"
            >排队中</li
        >
        <li
            class="user-tabs-li"
            @click="chooseTabs(4)"
            :class="activeKey == 4 ? 'active' : ''"
            >计算中</li
        >
        <li
            class="user-tabs-li"
            @click="chooseTabs(5)"
            :class="activeKey == 5 ? 'active' : ''"
            >异常暂停</li
        >
        <li
            class="user-tabs-li"
            @click="chooseTabs(6)"
            :class="activeKey == 6 ? 'active' : ''"
            >已终止</li
        >
        <li
            class="user-tabs-li"
            @click="chooseTabs(7)"
            :class="activeKey == 7 ? 'active' : ''"
            >完成待审核</li
        >
        <li
            class="user-tabs-li"
            @click="chooseTabs(9)"
            :class="activeKey == 9 ? 'active' : ''"
            >计算完成</li
        >
    </ul>
</div>
</template>

<script setup>
import { ref, reactive, toRefs, onBeforeMount, onMounted, watchEffect, computed } from 'vue';
const emits = defineEmits(['changeActiveKey']);
const activeKey = ref(null);
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
</style>
