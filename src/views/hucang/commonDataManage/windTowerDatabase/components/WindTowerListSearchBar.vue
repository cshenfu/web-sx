<template>
    <!-- 唯一根节点 -->
    <div class="wind-tower-search-bar">
        <!-- 筛选行：筛选项之后紧跟 重置 / 搜索，窄屏自动换行 -->
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
                v-model:selectValue="searchKey.analysisStatus"
                :options="analysisStatusOptons"
                @updateSearch="handleSearch"
            ></select-search>
            <a-input
                allowClear
                v-model:value="searchKey.windTowerCode"
                placeholder="数据编号"
                class="filter-input"
                @pressEnter="handleSearch"
            >
                <template #suffix>
                    <iconpark-icon name="sousuo" size="12"></iconpark-icon>
                </template>
            </a-input>
            <a-input
                allowClear
                v-model:value="searchKey.projectCode"
                placeholder="关联项目编号"
                class="filter-input"
                @pressEnter="handleSearch"
            >
                <template #suffix>
                    <iconpark-icon name="sousuo" size="12"></iconpark-icon>
                </template>
            </a-input>
            <a-input
                allowClear
                v-model:value="searchKey.windTowerSeq"
                placeholder="测风塔号"
                class="filter-input"
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
        </div>
    </div>
</template>

<script setup>
    import SelectSearch from '@/components/selectSearch/SelectSearch.vue';
    import { reactive, ref, onBeforeMount } from 'vue';
    import mitt from '@/utils/eventBus';
    import { getProvince } from '@/api/modules/public';
    import { PUBLIC_COMMON_STATUS, filterAreaInfo } from '../../commonData';

    // 陕西省区域编码（接口返回为字符串）
    const SHANXI_REGION_CODE = '610000';

    const emit = defineEmits(['getModeType']);
    const props = defineProps({});

    const areaCodeData = ref([]);
    const areaCodeOptions = ref([]);

    // source 固定为 1（公共数据），UI 不再提供切换
    const searchKey = ref({
        source: 1,
        modeType: 'b',
        areaCode: [],          // UI 保持空，不回显陕西
        status: null,
        projectCode: '',
        windTowerCode: '',
        windTowerSeq: '',
    });

    const rangeTypeOptions = reactive([
        {
            label: '省数据',
            value: 1,
        },
        {
            label: '市数据',
            value: 2,
        },
        {
            label: '区数据',
            value: 3,
        },
    ]);

    // source 固定为 1，状态选项直接使用公共库常量（顺带去掉原 computed 的副作用）
    const analysisStatusOptons = PUBLIC_COMMON_STATUS;

    // 与 searchKey.modeType 的初始值保持一致
    const defaultModeType = ref('b');

    // 构造发请求的 payload：areaCode 为空时兜底陕西，保证请求永远带 610000
    const buildSearchPayload = () => {
        const codes = searchKey.value.areaCode;
        return {
            ...searchKey.value,
            source: 1,
            areaCode: (codes && codes.length > 0) ? [...codes] : [SHANXI_REGION_CODE],
        };
    };

    // 搜索
    const handleSearch = () => {
        mitt.emit('handleSearch', buildSearchPayload());
    };

    // 重置：清空所有筛选项（areaCode 在 UI 上保持空，请求时由 helper 兜底陕西）
    const resetSearch = () => {
        Object.assign(searchKey.value, {
            rangeType: undefined,
            areaCode: [],
            status: null,
            analysisStatus: null,
            projectCode: '',
            windTowerCode: '',
            windTowerSeq: '',
            modeType: defaultModeType.value,
        });
        areaCodeOptions.value = filterAreaInfo(1, areaCodeData.value);
        mitt.emit('resetSearch', buildSearchPayload());
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
        await mitt.all.clear();
        resetSearch();
    };
    const changeAreaData = (val) => {
        areaCodeOptions.value = filterAreaInfo(val, areaCodeData.value);
        searchKey.value.areaCode = [];
    };

    onBeforeMount(async () => {
        try {
            const res = await getProvince();
            if (res.code === 200) {
                const all = res.data?.subList || [];
                const shanxi = all.filter(
                    (item) => item.regionCode === SHANXI_REGION_CODE
                );
                areaCodeData.value = shanxi;
                areaCodeOptions.value = filterAreaInfo(1, shanxi);
                // 注意：不设置 searchKey.areaCode，保持 UI 空
            }
        } catch (e) {
            console.log(e);
        }
        handleSearch(); // 首次请求：areaCode 走兜底 = ['610000']
    });

    defineExpose({
        searchKey,
    });
</script>

<style lang="scss" scoped>
@import '@/assets/css/tabs.scss';

.wind-tower-search-bar {
    background: #FFFFFF;
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
    width: 160px;
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
.filter-row .btn-search {
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
.filter-row .btn-search {
    background: #0278E7 !important;
    border-color: #0278E7 !important;
    color: #FFFFFF !important;

    &:hover {
        background: #0267C7 !important;
        border-color: #0267C7 !important;
    }
}
</style>