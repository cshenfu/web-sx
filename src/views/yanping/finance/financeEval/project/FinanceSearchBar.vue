<template>
    <SearchBar
        :searchKey="searchKey"
        @handleSearch="handleSearch"
        @resetSearch="resetSearch"
    >
        <a-flex :vertical="false" wrap="wrap" class="my-project-list-search">
            <!-- 项目类型 -->
            <a-select
                v-model:value="searchKey.projectType"
                style="width: 140px; margin-right: 10px; margin-bottom: 12px"
                placeholder="项目类型"
                allowClear
                @dropdownVisibleChange="(e) => openDropDown(e, 'type')"
            >
                <template #suffixIcon>
                    <iconpark-icon name="xiala" v-if="!isSelectOpen.type"></iconpark-icon>
                    <iconpark-icon name="shouqi" v-else class="green"></iconpark-icon>
                </template>
                <a-select-option
                    v-for="item in FINANCE_PROJECT_TYPE"
                    :key="item.value"
                    :value="item.value"
                >{{ item.label }}</a-select-option>
            </a-select>

            <!-- 所属区域 -->
            <a-cascader
                v-model:value="searchKey.areaCode"
                style="width: 140px; margin-right: 10px; margin-bottom: 12px"
                placeholder="所属区域"
                allowClear
                :fieldNames="{ label: 'regionName', value: 'regionCode', children: 'subList' }"
                :options="areaCodeOptions"
                @dropdownVisibleChange="(e) => openDropDown(e, 'area')"
            >
                <template #suffixIcon>
                    <iconpark-icon name="xiala" v-if="!isSelectOpen.area"></iconpark-icon>
                    <iconpark-icon name="shouqi" v-else class="green"></iconpark-icon>
                </template>
            </a-cascader>

            <!-- 项目状态 -->
            <a-select
                v-model:value="searchKey.status"
                style="width: 140px; margin-right: 10px; margin-bottom: 12px"
                placeholder="项目状态"
                allowClear
                @dropdownVisibleChange="(e) => openDropDown(e, 'status')"
            >
                <template #suffixIcon>
                    <iconpark-icon name="xiala" v-if="!isSelectOpen.status"></iconpark-icon>
                    <iconpark-icon name="shouqi" v-else class="green"></iconpark-icon>
                </template>
                <a-select-option
                    v-for="item in FINANCE_PROJECT_STATUS"
                    :key="item.value"
                    :value="item.value"
                >{{ item.label }}</a-select-option>
            </a-select>

            <!-- 创建时间 -->
            <div class="search-item">
                <span class="search-label-self">创建时间</span>
                <a-range-picker
                    inputReadOnly
                    class="custom-time-picker"
                    v-model:value="searchKey.dataTime"
                    :format="dateFormat"
                    :valueFormat="dateFormat"
                    allowClear
                >
                    <template #suffixIcon>
                        <iconpark-icon name="riqi"></iconpark-icon>
                    </template>
                </a-range-picker>
            </div>

            <!-- 项目名称 -->
            <div class="search-item">
                <a-input
                    v-model:value="searchKey.projectName"
                    placeholder="项目名称"
                    style="width: 220px; text-align: center"
                    allowClear
                >
                    <template #suffix>
                        <iconpark-icon name="sousuo" size="12"></iconpark-icon>
                    </template>
                </a-input>
            </div>
        </a-flex>
    </SearchBar>
</template>

<script setup>
import { ref, computed } from 'vue';
import SearchBar from '@/components/searchBar/SearchBar.vue';
import useAreaDataStore from '@/pinia/modules/areaData';

// 项目类型枚举：1-风电 2-光伏 3-天同
const FINANCE_PROJECT_TYPE = [
    { label: '风电', value: 1 },
    { label: '光伏', value: 2 },
    { label: '天同', value: 3 },
];

// 项目状态枚举：0-草稿 1-计算中 2-完成
const FINANCE_PROJECT_STATUS = [
    { label: '草稿',  value: 0 },
    { label: '计算中', value: 1 },
    { label: '完成',  value: 2 },
];

const dateFormat = 'YYYY-MM-DD HH:mm:ss';

const emits = defineEmits(['search']);

// 下拉框展开状态
const isSelectOpen = ref({ type: false, area: false, status: false });
const openDropDown = (open, type) => { isSelectOpen.value[type] = open; };

// 区域数据
const areaDataStore = useAreaDataStore();
const areaCodeOptions = computed(() => areaDataStore.areaArr);

// 搜索条件
const searchKey = ref({
    projectType: null,
    areaCode: [],
    status: null,
    dataTime: [],
    projectName: '',
});

const handleSearch = () => {
    emits('search', { searchKey: searchKey.value, page: 1 });
};

const resetSearch = () => {
    searchKey.value = {
        projectType: null,
        areaCode: [],
        status: null,
        dataTime: [],
        projectName: '',
    };
    emits('search', { searchKey: searchKey.value, page: 1 });
};

defineExpose({ resetSearch });
</script>

<style scoped lang="scss">
$primary-color: var(--theme);

.my-project-list-search {
    display: flex;
    align-items: flex-start;
}

.green {
    color: $primary-color;
}

// ── 与 project.scss 保持一致的搜索栏公共样式 ─────────────────
.search-item {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin-right: 12px;
    margin-bottom: 14px;

    &:last-child {
        margin-right: 0;
    }

    .custom-time-picker {
        height: 30px;
    }

    .search-label-self {
        flex: 0 0 auto;
        margin-right: 12px;
        font-size: 12px;
        color: #363b4d;
    }
}
</style>
