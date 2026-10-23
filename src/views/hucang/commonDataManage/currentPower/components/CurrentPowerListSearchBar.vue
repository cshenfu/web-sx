<template>
    <div class="current-power-search-bar">
        <!-- 头部：Tab + 新增数据按钮（完美解决和表格同行的问题） -->
        <div class="search-bar-header">
            <div class="climate-tabs">
                <ul class="climate-tabs-list">
                    <li class="climate-tab" @click="chooseTabs(2)" :class="{ active: searchKey.source == 2 }">用户数据</li>
                    <li class="climate-tab" @click="chooseTabs(1)" :class="{ active: searchKey.source == 1 }">公共数据</li>
                </ul>
            </div>
            <div class="filter-actions">
                <a-button type="primary" class="btn-add" @click="goPath">
                    <iconpark-icon name="xinzeng" size="12"></iconpark-icon>
                    新增数据
                </a-button>
            </div>
        </div>

        <!-- 筛选行：筛选项 + 重置/搜索 -->
        <div class="filter-row">
            <div class="filter-inputs">
                <select-search
                    :allowClear="false"
                    placeholder="省市区"
                    v-model:selectValue="searchKey.rangeType"
                    :options="rangeTypeOptions"
                    @changeAreaData="changeAreaData"
                ></select-search>
                <a-cascader
                    @dropdownVisibleChange="(e) => openDropDown(e, 'first')"
                    v-model:value="searchKey.areaCode"
                    style="width: 160px"
                    placeholder="所属区域"
                    change-on-select
                    allowClear
                    :fieldNames="{
                        label: 'regionName',
                        value: 'regionCode',
                        children: 'subList',
                    }"
                    :options="areaCodeOptions"
                    @change="handleSearch"
                >
                    <template #suffixIcon>
                        <iconpark-icon name="xiala" v-if="!isSelectOpen.first"></iconpark-icon>
                        <iconpark-icon name="shouqi" v-if="isSelectOpen.first"
                            :class="isSelectOpen.first ? 'green' : ''"></iconpark-icon>
                    </template>
                </a-cascader>
                <select-search
                    placeholder="数据状态"
                    v-model:selectValue="searchKey.status"
                    :options="statusData"
                    @updateSearch="handleSearch"
                ></select-search>
                <a-input
                    v-model:value="searchKey.gridCode"
                    placeholder="数据编号"
                    class="filter-input"
                    allowClear
                    @pressEnter="handleSearch"
                >
                    <template #suffix>
                        <iconpark-icon name="sousuo" size="12"></iconpark-icon>
                    </template>
                </a-input>
                <a-input
                    v-model:value="searchKey.projectCode"
                    placeholder="关联项目编号"
                    class="filter-input"
                    allowClear
                    @pressEnter="handleSearch"
                >
                    <template #suffix>
                        <iconpark-icon name="sousuo" size="12"></iconpark-icon>
                    </template>
                </a-input>
            </div>

            <div class="filter-buttons">
                <a-button class="btn-reset" @click="resetSearch">重置</a-button>
                <a-button type="primary" class="btn-search" @click="handleSearch">搜索</a-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import SelectSearch from '@/components/selectSearch/SelectSearch.vue';
import { computed, reactive, ref, onMounted } from 'vue';
import mitt from '@/utils/eventBus';
import { useRouter } from 'vue-router';
import { USER_COMMON_DATA_STATUS, PUBLIC_COMMON_STATUS, filterAreaInfo, RANGE_TYPE_PROVINCE } from '../../commonData';
import { getProvince } from '@/api/modules/public';

const emit = defineEmits(['getModeType']);
const router = useRouter();
const rangeTypeOptions = RANGE_TYPE_PROVINCE;
const areaCodeData = ref([]);
const areaCodeOptions = ref([]);

const searchKey = reactive({
    source: 1,
    modeType: 'b',
    rangeType: 0,
    areaCode: [],
    status: null,
    projectCode: '',
    gridCode: '',
});

const goPath = () => {
    router.push({ path: '/currentPower/add' });
};

const statusData = computed(() => {
    searchKey.status = null;
    return searchKey.source == 2 ? USER_COMMON_DATA_STATUS : PUBLIC_COMMON_STATUS;
});

const chooseTabs = (index) => {
    searchKey.source = index;
    resetSearch();
};

const defaultModeType = ref('b');

const handleSearch = () => {
    mitt.emit('handleSearch', searchKey);
};

const resetSearch = async () => {
    const source = searchKey.source;
    for (const key in searchKey) {
        if (Object.hasOwnProperty.call(searchKey, key)) {
            searchKey[key] = null;
        }
    }
    searchKey.modeType = defaultModeType.value;
    searchKey.rangeType = 0;
    searchKey.source = source;
    searchKey.status = null;
    searchKey.areaCode = [];
    areaCodeOptions.value = filterAreaInfo(0, areaCodeData.value);
    mitt.emit('resetSearch', searchKey);
};

const isSelectOpen = ref({ first: false });
const openDropDown = (open, type) => {
    isSelectOpen.value[type] = open;
};

const changeMode = async (e) => {
    defaultModeType.value = e.target.value;
    emit('getModeType', e.target.value);
    await mitt.all.clear();
    mitt.emit('handleSearch', searchKey);
};

const changeAreaData = (val) => {
    areaCodeOptions.value = filterAreaInfo(val, areaCodeData.value);
    searchKey.areaCode = [];
    mitt.emit('handleSearch', searchKey);
};

onMounted(async () => {
    try {
        const res = await getProvince();
        if (res.code === 200) {
            areaCodeData.value = res.data?.subList;
            areaCodeOptions.value = filterAreaInfo(0, areaCodeData.value);
        }
    } catch (e) {
        console.log(e);
    }
    handleSearch();
});

defineExpose({ searchKey });
</script>

<style lang="scss" scoped>
@import '@/assets/css/fixedGroup.scss';
@import '@/assets/css/tabs.scss';

.current-power-search-bar {
    background: #FFFFFF;
}

/* ========== 头部 Tab 与 按钮 ========== */
.search-bar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    border-bottom: 1px solid #E2E9F0;
}
.climate-tabs-list {
    display: flex;
    align-items: center;
    gap: 32px;
    margin: 0;
    padding: 0;
    list-style: none;
    overflow-x: auto;
    &::-webkit-scrollbar { display: none; }
}
.climate-tab {
    position: relative;
    flex-shrink: 0;
    height: 48px;
    line-height: 48px;
    font-size: 14px;
    color: #667383;
    cursor: pointer;
    white-space: nowrap;
    transition: color 0.15s ease;

    &:hover { color: #0B1C2C; }
    &.active {
        color: #0278E7;
        font-weight: 500;
        &::after {
            content: '';
            position: absolute;
            left: 0;
            right: 0;
            bottom: -1px;
            height: 2px;
            border-radius: 2px;
            background: #0278E7;
        }
    }
}

/* ========== 筛选行 ========== */
.filter-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    padding: 16px 20px;
}
.filter-inputs {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
}
.filter-buttons {
    display: flex;
    align-items: center;
    gap: 8px;
}

/* 下拉框 */
.filter-inputs :deep(.ant-select-selector) {
    height: 36px !important;
    border: 1px solid #E2E9F0 !important;
    border-radius: 10px !important;
    background: #FFFFFF !important;
    box-shadow: none !important;
    font-size: 13px;
}
.filter-inputs :deep(.ant-select-selection-item),
.filter-inputs :deep(.ant-select-selection-placeholder) {
    line-height: 34px !important;
    color: #667383;
}

/* 输入框 */
.filter-row .filter-input {
    width: 200px;
    height: 36px;
    border: 1px solid #E2E9F0;
    border-radius: 10px;
    background: #FFFFFF;
    box-shadow: none;
    font-size: 13px;
}
.filter-row .filter-input :deep(input) { font-size: 13px; }

/* 按钮 */
.filter-row .btn-reset,
.filter-row .btn-search,
.filter-actions .btn-add {
    height: 36px;
    padding: 0 16px;
    border-radius: 8px;
    font-size: 13px;
}
.filter-row .btn-reset {
    color: #667383;
    background: #FFFFFF;
    border: 1px solid #E2E9F0;
}
.filter-row .btn-search,
.filter-actions .btn-add {
    background: #0278E7 !important;
    border-color: #0278E7 !important;
    color: #FFFFFF !important;
    &:hover {
        background: #0267C7 !important;
        border-color: #0267C7 !important;
    }
}
.filter-actions .btn-add {
    display: inline-flex;
    align-items: center;
    gap: 6px;
}
</style>