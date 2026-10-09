<template>
    <div class="electrical-search-template">
        <div class="user-tabs">
            <ul class="user-tabs-ul">
                <li
                    class="user-tabs-li"
                    @click="chooseTabs(1)"
                    :class="searchInfo.source == 1 ? 'active' : ''"
                >
                    箱式变压器
                </li>
                <li
                    class="user-tabs-li"
                    @click="chooseTabs(2)"
                    :class="searchInfo.source == 2 ? 'active' : ''"
                >
                    主变压器
                </li>
            </ul>
        </div>
        <SearchBar
            class="search-group-component"
            @handleSearch="handleSearchEvent"
            @resetSearch="resetSearchEvent"
        >
            <select-search
                :allowClear="false"
                class="search-item-box"
                v-model:selectValue="searchInfo.type"
                :options="typeData"
                placeholder="类型"
            ></select-search>
            <a-input
                class="search-item-box"
                style="width: 240px"
                v-model="searchInfo.deviceCode"
                placeholder="设备编号"
                allowClear
            >
            </a-input>
            <a-input
                class="search-item-box"
                style="width: 240px"
                v-model="searchInfo.deviceModel"
                placeholder="设备型号"
                allowClear
            >
            </a-input>
        </SearchBar>
        <div class="fixed-group">
            <a-button type="primary" @click="add">
                <iconpark-icon name="xinzeng"></iconpark-icon>
                新增设备
            </a-button>
        </div>
    </div>
</template>
<script setup>
    import { ref } from 'vue';
    import { useRouter } from 'vue-router';
    import SearchBar from '@/components/searchBar/SearchBar.vue';
    import SelectSearch from '@/components/selectSearch/SelectSearch.vue';
    const emits = defineEmits(['addDevice'])
    const searchInfo = ref({
        source: 1,
        type: null,
    });
    const typeData = ref([
        {
            label: '华式箱变',
            value: 1,
        },
        {
            label: '各种箱变',
            value: 2,
        },
    ]);
    const chooseTabs = (index) => {
        searchInfo.value.source = index;
        // 直接触发搜索功能
        handleSearchEvent();
    };
    const handleSearchEvent = (val) => {
        console.log('搜索---', val);
    }
    const resetSearchEvent = (val) => {
        console.log('重置---', val)
    }
    // 新增电气设备
    const add = () => {
        emits('addDevice');
    }
    defineExpose({
        searchInfo
    })
</script>
<style scoped lang="scss">
  @import '@/assets/css/tabs.scss';
  @import '@/assets/css/fixedGroup.scss';
    .electrical-search-template {
        .user-tabs {
            margin-bottom: 16px;
        }
        .search-item-box {
            float: left;
            margin-right: 12px;
            margin-bottom: 16px;
        }
    }
</style>
