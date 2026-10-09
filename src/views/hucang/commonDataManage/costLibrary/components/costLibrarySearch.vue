<template>
    <SearchBar
        class="search-group-component"
        @handleSearch="handleSearchEvent"
        @resetSearch="resetSearchEvent"
    >
        <a-flex :vertical="false" wrap="wrap" class="my-project-list-search">
            <select-search
                class="search-item-box"
                placeholder="类型"
                v-model:selectValue="searchKey.type"
                @updateSearch="handleSearchEvent"
                :options="TYPE_OPTIONS"
            ></select-search>
            <a-input
                class="search-item-box"
                style="width: 240px"
                v-model:value="searchKey.name"
                placeholder="名称"
                allowClear
            >
            </a-input>
            <a-input
                class="search-item-box"
                style="width: 240px"
                v-model:value="searchKey.code"
                placeholder="编码"
                allowClear
            >
            </a-input>
        </a-flex>
    </SearchBar>
</template>
<script setup>
    import { reactive, ref, onMounted } from 'vue';
    import SearchBar from '@/components/searchBar/SearchBar.vue';
    import SelectSearch from '@/components/selectSearch/SelectSearch.vue';
    import{ TYPE_OPTIONS} from '../costLibrary'
    const emits = defineEmits(['handleSearchCommon','resetSearchCommon']);
    const props = defineProps({
        activeKey: {
            type: Number,
            default: 0,
        },
    });
    const areaCodeData = ref([]);
    const areaCodeOptions = ref([]);
    onMounted(() => {});
    const isSelectOpen = ref({
        first: false,
    });
    const searchKey = ref({
        type: null,
        name: '',
        code:''
    });
    // 搜索
    const handleSearchEvent = () => {
        emits('handleSearchCommon', searchKey.value);
    };
    // 重置
    const resetSearchEvent = () => {
        for (const key in searchKey.value) {
            if (Object.hasOwnProperty.call(searchKey.value, key)) {
                searchKey.value[key] = null;
            }
        }
        emits('resetSearchCommon', searchKey.value);
    };
    defineExpose({
        searchKey,
        resetSearchEvent
    });
</script>
<style scoped lang="scss">
    .search-item-box {
        margin-bottom: 16px;
        margin-right: 12px;
    }
    .align-center {
        iconpark-icon {
            margin-right: 5px;
        }
    }
    .search-group-component {
        :deep(.ant-select) {
            width: 140px;
            // margin-right: 12px;
        }
    }
</style>
