<template>
    <!-- 唯一根节点 -->
    <div class="cost-library-search-bar">
        <div class="filter-row">
            <!-- 类型 -->
            <select-search
                placeholder="类型"
                v-model:selectValue="searchKey.type"
                @updateSearch="handleSearchEvent"
                :options="TYPE_OPTIONS"
            ></select-search>
            
            <!-- 名称 -->
            <a-input
                v-model:value="searchKey.name"
                placeholder="名称"
                class="filter-input"
                allowClear
                @pressEnter="handleSearchEvent"
            ></a-input>
            
            <!-- 编码 -->
            <a-input
                v-model:value="searchKey.code"
                placeholder="编码"
                class="filter-input"
                allowClear
                @pressEnter="handleSearchEvent"
            ></a-input>

            <!-- 操作按钮 -->
            <div class="filter-buttons">
                <a-button class="btn-reset" @click="resetSearchEvent">重置</a-button>
                <a-button type="primary" class="btn-search" @click="handleSearchEvent">搜索</a-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import SelectSearch from '@/components/selectSearch/SelectSearch.vue';
import { TYPE_OPTIONS } from '../costLibrary';

const emits = defineEmits(['handleSearchCommon', 'resetSearchCommon']);

const props = defineProps({
    activeKey: {
        type: Number,
        default: 0,
    },
});

const searchKey = ref({
    type: null,
    name: '',
    code: '',
});

// 搜索
const handleSearchEvent = () => {
    emits('handleSearchCommon', searchKey.value);
};

// 重置
const resetSearchEvent = () => {
    for (const key in searchKey.value) {
        if (Object.hasOwnProperty.call(searchKey.value, key)) {
            // 为了保持数据类型的一致性，避免后端报错，非第一个字段重置为空字符串
            searchKey.value[key] = key === 'type' ? null : '';
        }
    }
    emits('resetSearchCommon', searchKey.value);
};

defineExpose({
    searchKey,
    resetSearchEvent,
});
</script>

<style lang="scss" scoped>
.cost-library-search-bar {
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