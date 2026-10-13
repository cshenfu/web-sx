<template>
    <div class="project-control-list">
        <tab-status @changeActiveKey="chooseTabs"></tab-status>
        <all-light-project-list :activeKey="activeKey"></all-light-project-list>
    </div>
</template>

<script setup>
    import { ref, reactive, onMounted, computed, watch, nextTick } from 'vue';
    import TabStatus from '../components/TabStatus.vue';
    import AllLightProjectList from '../components/AllLightProjectList.vue';
    const activeKey = ref(null);
    const chooseTabs = (index) => {
        activeKey.value = index;
    };
</script>
<style scoped lang="scss">
    @import '../projectControl.scss';
</style>
