<template>
    <!-- 唯一根节点 -->
    <div class="environmental-search-bar">
        <!-- 数据来源 Tab -->
        <div class="env-tabs">
            <ul class="env-tabs-list">
                <li class="env-tab" :class="{ active: searchKey.source == 2 }" @click="chooseTabs(2)">用户数据</li>
                <li class="env-tab" :class="{ active: searchKey.source == 1 }" @click="chooseTabs(1)">公共数据</li>
            </ul>
        </div>

        <!-- 筛选行：筛选项 + 重置 / 搜索 紧挨在左，新增数据靠右 -->
        <div class="filter-row">
            <!-- 地图 / 列表模式切换（需要时放开）
            <a-radio-group
                v-model:value="searchKey.modeType"
                button-style="solid"
                @change="changeMode"
                class="type-active search-item-box"
            >
                <a-radio-button value="a">
                    <div class="mode-list">
                        <iconpark-icon
                            :name="searchKey.modeType == 'a' ? 'dituxuanzhong' : 'ditumoren'"
                            size="13"
                            class="mode-icon"
                        ></iconpark-icon
                        ><span>地图模式</span>
                    </div>
                </a-radio-button>
                <a-radio-button value="b">
                    <div class="mode-list">
                        <iconpark-icon
                            :name="searchKey.modeType == 'b' ? 'liebiaoxuanzhong' : 'liebiaomoren'"
                            size="13"
                            class="mode-icon"
                        ></iconpark-icon
                        ><span>列表模式</span>
                    </div>
                </a-radio-button>
            </a-radio-group>
            -->
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
                    <iconpark-icon
                        name="shouqi"
                        v-if="isSelectOpen.first"
                        :class="isSelectOpen.first ? 'green' : ''"
                    ></iconpark-icon>
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

            <div class="filter-buttons">
                <a-button class="btn-reset" @click="resetSearch">重置</a-button>
                <a-button type="primary" class="btn-search" @click="handleSearch">搜索</a-button>
            </div>

            <div class="filter-actions">
                <a-button type="primary" class="btn-add" @click="goPath">
                    <iconpark-icon name="xinzeng" size="12"></iconpark-icon>
                    新增数据
                </a-button>
            </div>
        </div>
    </div>
</template>
<script setup>
    import SelectSearch from '@/components/selectSearch/SelectSearch.vue';
    import { computed, reactive, ref, onMounted } from 'vue';
    import mitt from '@/utils/eventBus';
    import { useRouter } from 'vue-router';
    import { USER_COMMON_DATA_STATUS, PUBLIC_COMMON_STATUS, filterAreaInfo, RANGE_TYPE_PROVINCE } from '../../commonData'
    import { getProvince } from '@/api/modules/public';
    const emit = defineEmits(['getModeType']);
    const router = useRouter()
    const rangeTypeOptions = RANGE_TYPE_PROVINCE;
    const areaCodeData = ref([]);
    const areaCodeOptions = ref([]);
    const searchKey = reactive({
        source: 1,
        modeType: 'b',
        rangeType: 1,
        areaCode: [],
        status: null,
        projectCode: '',
        gridCode: ''
    });
    const goPath = () => {
        router.push({
            path: '/hucang/environment/add', // 已改为新路由前缀
        })
    }
    const statusData = computed(() => {
        searchKey.status = null;
        return searchKey.source == 2 ? USER_COMMON_DATA_STATUS : PUBLIC_COMMON_STATUS;
    });
    const chooseTabs = (index) => {
        searchKey.source = index
        resetSearch()
    }
    // 与 searchKey.modeType 的初始值保持一致（原来是 'a'，重置后会被改成地图模式）
    const defaultModeType = ref('b');
    // 搜索
    const handleSearch = () => {
        mitt.emit('handleSearch', searchKey)
    };
    // 重置
    const resetSearch = async () => {
        let source = searchKey.source
        for (const key in searchKey) {
            if (Object.hasOwnProperty.call(searchKey, key)) {
                searchKey[key] = null;
            }
        }
        searchKey.modeType = defaultModeType.value;
        searchKey.rangeType = 1;
        searchKey.source = source;
        searchKey.areaCode = [];
        areaCodeOptions.value = filterAreaInfo(1, areaCodeData.value);
        mitt.emit('resetSearch', searchKey);
    };
    const isSelectOpen = ref({
        first: false,
    });
    const openDropDown = (open, type) => {
        isSelectOpen.value[type] = open;
    };
    const changeMode = async (e) => {
        defaultModeType.value = e.target.value;
        emit('getModeType', e.target.value);
        await mitt.all.clear()
        mitt.emit('handleSearch', searchKey)
    };
    const changeAreaData = (val) => {
        areaCodeOptions.value = filterAreaInfo(val, areaCodeData.value);
        searchKey.areaCode = []
        mitt.emit('handleSearch', searchKey)
    };
    onMounted(async () => {
        try {
            const res = await getProvince();
            if (res.code === 200) {
                areaCodeData.value = res.data?.subList;
                areaCodeOptions.value = filterAreaInfo(1, areaCodeData.value);
            }
        } catch (e) {
            console.log(e);
        }
        handleSearch()
    });
    defineExpose({
        searchKey,
    });
</script>
<style lang="scss" scoped>
@import '@/assets/css/tabs.scss';

.environmental-search-bar {
    background: #FFFFFF;
}

/* ========== 数据来源 Tab ========== */
.env-tabs {
    padding: 0 20px;
    border-bottom: 1px solid #E2E9F0;
}
.env-tabs-list {
    display: flex;
    align-items: center;
    gap: 32px;
    margin: 0;
    padding: 0;
    list-style: none;
}
.env-tab {
    position: relative;
    height: 48px;
    line-height: 48px;
    font-size: 14px;
    color: #667383;
    cursor: pointer;
    white-space: nowrap;
    transition: color 0.15s ease;

    &:hover {
        color: #0B1C2C;
    }
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
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
}
.filter-buttons {
    display: flex;
    align-items: center;
    gap: 8px;
}
.filter-actions {
    display: flex;
    align-items: center;
    margin-left: auto;   /* 新增按钮推到最右 */
}

/* 输入框、下拉框：白底、10px 圆角、36px 高 */
.filter-row :deep(.ant-select-selector) {
    height: 36px !important;
    border: 1px solid #E2E9F0 !important;
    border-radius: 10px !important;
    background: #FFFFFF !important;
    box-shadow: none !important;
    font-size: 13px;
}
.filter-row :deep(.ant-select-selection-item),
.filter-row :deep(.ant-select-selection-placeholder) {
    line-height: 34px !important;
    color: #667383;
}
.filter-row .filter-input {
    width: 200px;
    height: 36px;
    border: 1px solid #E2E9F0;
    border-radius: 10px;
    background: #FFFFFF;
    box-shadow: none;
    font-size: 13px;
}
.filter-row .filter-input :deep(input) {
    font-size: 13px;
}

/* 按钮：统一 36px 高、8px 圆角 */
.filter-row .btn-reset,
.filter-row .btn-search,
.filter-row .btn-add {
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
.filter-row .btn-add {
    background: #0278E7 !important;
    border-color: #0278E7 !important;
    color: #FFFFFF !important;

    &:hover {
        background: #0267C7 !important;
        border-color: #0267C7 !important;
    }
}
.filter-row .btn-add {
    display: inline-flex;
    align-items: center;
    gap: 6px;
}
</style>