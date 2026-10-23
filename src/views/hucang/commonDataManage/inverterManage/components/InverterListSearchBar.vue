<template>
    <!-- 唯一根节点 -->
    <div class="inverter-search-bar">
        <div class="filter-row">
            <!-- 制造商 -->
            <select-search
                placeholder="制造商"
                v-model:selectValue="searchKey.manufacturer"
                :options="manufacturerOptions"
                @updateSearch="handleSearch"
            ></select-search>
            
            <!-- 设备类型 -->
            <select-search
                placeholder="设备类型"
                v-model:selectValue="searchKey.inverterType"
                :options="inverterTypeOptions"
                @updateSearch="handleSearch"
            ></select-search>
            
            <!-- 设备容量 -->
            <select-search
                placeholder="设备容量"
                v-model:selectValue="searchKey.capacity"
                :options="equipmentCapacityOptions"
                @updateSearch="handleSearch"
            ></select-search>
            
            <!-- 设备型号 -->
            <a-input
                v-model:value="searchKey.model"
                placeholder="设备型号"
                class="filter-input"
                allowClear
                @pressEnter="handleSearch"
            >
                <template #suffix>
                    <iconpark-icon name="sousuo" size="12"></iconpark-icon>
                </template>
            </a-input>
            
            <!-- 设备编号 -->
            <a-input
                v-model:value="searchKey.inverterCode"
                placeholder="设备编号"
                class="filter-input"
                allowClear
                @pressEnter="handleSearch"
            >
                <template #suffix>
                    <iconpark-icon name="sousuo" size="12"></iconpark-icon>
                </template>
            </a-input>

            <!-- 操作按钮 -->
            <div class="filter-buttons">
                <a-button class="btn-reset" @click="resetSearch">重置</a-button>
                <a-button type="primary" class="btn-search" @click="handleSearch">搜索</a-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import SelectSearch from '@/components/selectSearch/SelectSearch.vue';
import { ref, onMounted, onBeforeMount } from 'vue';
import { getDictionaryList } from '@/api/modules/commonDataManage';

const emit = defineEmits(['handleSearch']);

const searchKey = ref({
    manufacturer: null,
    inverterType: null,
    capacity: null,
    model: '',
    inverterCode: '',
});

// 类型
const inverterTypeOptions = ref([]);
// 制造商
const manufacturerOptions = ref([]);
// 设备容量
const equipmentCapacityOptions = ref([]);

// 搜索
const handleSearch = () => {
    emit('handleSearch', searchKey.value);
};

// 重置
const resetSearch = async () => {
    for (const key in searchKey.value) {
        if (Object.hasOwnProperty.call(searchKey.value, key)) {
            searchKey.value[key] = null;
        }
    }
    emit('handleSearch', searchKey.value);
};

// 获取所有的查询条件
const getAllSearchData = async () => {
    try {
        const res = await getDictionaryList();
        if (res.code == 200 && res.data) {
            for (const key in res.data.pvInverterDeviceEnum) {
                inverterTypeOptions.value.push({
                    value: key,
                    label: res.data.pvInverterDeviceEnum[key],
                });
            }
            manufacturerOptions.value = res.data.manufacturer.map((item) => {
                return {
                    label: item,
                    value: item,
                };
            });
            equipmentCapacityOptions.value = res.data.capacity.map((item) => {
                return {
                    label: item,
                    value: item,
                };
            });
        }
    } catch (error) {
        console.log('error', error);
    }
};

onBeforeMount(async () => {
    await getAllSearchData();
});

onMounted(() => {
    handleSearch();
});

defineExpose({
    searchKey,
});
</script>

<style lang="scss" scoped>
.inverter-search-bar {
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

/* 下拉框统一样式 */
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

/* 输入框统一样式 */
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

/* 按钮统一样式 */
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