<template>
    <!-- 唯一根节点 -->
    <div class="climate-search-bar">
        <!-- 分类 Tab（使用新的类名，不再依赖 tabs.scss 里的旧样式） -->
        <div class="climate-tabs">
            <ul class="climate-tabs-list">
                <li
                    class="climate-tab"
                    v-for="item in PLAIN_OPTIONS"
                    :key="item.value"
                    @click="chooseTabs(item.value)"
                    :class="{ active: searchKey.activeKey == item.value }"
                >{{ item.label }}</li>
            </ul>
        </div>

        <!-- 筛选行：筛选项 + 重置/搜索 紧挨在左，新增数据靠右 -->
        <div class="filter-row">
            <div class="filter-inputs">
                <!-- 地图 / 列表模式切换（需要时放开）
                <a-radio-group v-model:value="searchKey.modeType" button-style="solid" @change="changeMode"
                    class="type-active search-item-box">
                    <a-radio-button value="a">
                        <div class="mode-list">
                            <iconpark-icon :name="searchKey.modeType == 'a' ? 'dituxuanzhong' : 'ditumoren'" size="13"
                                class="mode-icon"></iconpark-icon><span>地图模式</span>
                        </div>
                    </a-radio-button>
                    <a-radio-button value="b">
                        <div class="mode-list">
                            <iconpark-icon :name="searchKey.modeType == 'b' ? 'liebiaoxuanzhong' : 'liebiaomoren'" size="13"
                                class="mode-icon"></iconpark-icon><span>列表模式</span>
                        </div>
                    </a-radio-button>
                </a-radio-group>
                -->
                <select-search
                    :allowClear="true"
                    placeholder="省市区"
                    v-model:selectValue="searchKey.areaLevel"
                    :options="rangeTypeOptions"
                    @changeAreaData="changeAreaData"
                ></select-search>
                <a-cascader
                    @dropdownVisibleChange="(e) => openDropDown(e, 'first')"
                    change-on-select
                    v-model:value="searchKey.affiliationCode"
                    style="width: 160px"
                    placeholder="所属区域"
                    allowClear
                    :fieldNames="{
                        label: 'regionName',
                        value: 'regionCode',
                        children: 'subList',
                    }"
                    :options="areaCodeOptions"
                    @change="handleSearch()"
                >
                    <template #suffixIcon>
                        <iconpark-icon name="xiala" v-if="!isSelectOpen.first"></iconpark-icon>
                        <iconpark-icon name="shouqi" v-if="isSelectOpen.first"
                            :class="isSelectOpen.first ? 'green' : ''"></iconpark-icon>
                    </template>
                </a-cascader>
            </div>

            <div class="filter-buttons">
                <a-button class="btn-reset" @click="resetSearch">重置</a-button>
                <a-button type="primary" class="btn-search" @click="handleSearch()">搜索</a-button>
            </div>

            <div class="filter-actions">
                <!-- 导入数据（需要时放开）
                <a-button class="btn-import" @click="importFile">
                    <iconpark-icon name="daoru"></iconpark-icon>
                    导入数据
                </a-button>
                -->
                <a-button type="primary" class="btn-add" @click="add">
                    <iconpark-icon name="xinzeng"></iconpark-icon>
                    新增数据
                </a-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import SelectSearch from '@/components/selectSearch/SelectSearch.vue';
import { ref, onActivated, onMounted, computed } from 'vue';
import { getProvince } from '@/api/modules/public';
import { USER_COMMON_DATA_STATUS, PUBLIC_COMMON_STATUS, filterAreaInfo, RANGE_TYPE_PROVINCE } from '../../commonData'
import { PLAIN_OPTIONS } from '../climateDataBase'
import mitt from '@/utils/eventBus';

const props = defineProps({
    modeType: {
        type: String,
        default: 'b',
    }
})
// 注意：父组件监听的是 @useFileEvent，这里的事件名必须与之一致
const emit = defineEmits(['getModeType', 'addEvent', 'useFileEvent', 'update:modeType']);

const searchKey = ref({
    activeKey: 1,
    modeType: 'b',
    areaLevel: 0,
    affiliationCode: [],
    codeNo: '',
});
const rangeTypeOptions = RANGE_TYPE_PROVINCE;
const areaCodeData = ref([]);
const areaCodeOptions = ref([]);
const defaultModeType = ref('b')
const statusData = computed(() => {
    searchKey.value.status = null;
    return searchKey.value.source == 2 ? USER_COMMON_DATA_STATUS : PUBLIC_COMMON_STATUS;
});

// 标签切换
const chooseTabs = (index) => {
    searchKey.value.activeKey = index;
    handleSearch()
};
// 导入数据
const importFile = () => {
    emit('useFileEvent');
}
// 新增数据弹窗
const add = () => {
    emit('addEvent', '新增数据');
};
// 搜索
const handleSearch = () => {
    mitt.emit('handleSearch', searchKey.value);
};
// 重置
const resetSearch = () => {
    searchKey.value.affiliationCode = [];
    searchKey.value.areaLevel = 0;
    searchKey.value.codeNo = '';
    searchKey.value.modeType = defaultModeType.value;
    areaCodeOptions.value = areaCodeData.value;
    mitt.emit('resetSearch', searchKey.value);
};
const changeMode = async (e) => {
    defaultModeType.value = e.target.value;
    emit('update:modeType', e.target.value);
    await mitt.all.clear()
    mitt.emit('handleSearch', searchKey.value)
};
const isSelectOpen = ref({
    first: false,
});
const openDropDown = (open, type) => {
    isSelectOpen.value[type] = open;
};
const changeAreaData = (val) => {
    areaCodeOptions.value = filterAreaInfo(val * 1, areaCodeData.value);
    searchKey.value.affiliationCode = []
    mitt.emit('handleSearch', searchKey.value)
};

onMounted(async () => {
    try {
        const res = await getProvince();
        if (res.code === 200) {
            areaCodeData.value = res.data?.subList;
            areaCodeOptions.value = res.data?.subList;
        }
    } catch (e) {
        console.log(e);
    }
    handleSearch()
})
onActivated(() => {
    mitt.emit('handleSearch', searchKey.value)
})
defineExpose({
    searchKey,
});
</script>

<style lang="scss" scoped>
  @import '@/assets/css/fixedGroup.scss';
  @import '@/assets/css/tabs.scss';

.climate-search-bar {
    background: #FFFFFF;
}

/* ========== 分类 Tab ========== */
.climate-tabs {
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
    &::-webkit-scrollbar {
        display: none;
    }
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
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
}
.filter-inputs {
    display: flex;
    align-items: center;
    gap: 12px;
}
.filter-buttons {
    display: flex;
    align-items: center;
    gap: 8px;
}
.filter-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-left: auto;   /* 新增按钮推到最右 */
}

/* 下拉框：白底、10px 圆角、36px 高 */
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