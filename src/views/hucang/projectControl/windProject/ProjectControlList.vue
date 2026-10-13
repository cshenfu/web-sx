<template>
    <div class="project-control-list">
        <tab-status @changeActiveKey="chooseTabs"></tab-status>
        <AllProjectList :activeKey="activeKey"></AllProjectList>
    </div>
</template>

<script setup>
    import { ref, reactive, onMounted, computed, watch, nextTick } from 'vue';
    import TabStatus from '../components/TabStatus.vue';
    import AllProjectList from '../components/AllProjectList.vue';
    const activeKey = ref(null);
    const chooseTabs = (index) => {
        console.log(index,"index")
        activeKey.value = index;
    };
</script>
<style scoped lang="scss">
    @import '../projectControl.scss';
</style>
