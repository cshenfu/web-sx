<template>
  <div class="search-group-component">
    <div class="search-toolbar">
      <el-select
        v-model="searchInfo.rangeType"
        class="range-select"
        placeholder="省市区"
        :clearable="false"
        @change="changeAreaData"
      >
        <el-option
          v-for="item in provideData"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>

      <el-cascader
        v-model="searchInfo.geo"
        class="area-cascader"
        :options="areaCodeOptions"
        :props="areaProps"
        clearable
        filterable
        placeholder="省市区"
        @change="handleSearchEvent"
      />

      <el-select
        v-model="searchInfo.status"
        class="status-select"
        clearable
        placeholder="数据状态"
      >
        <el-option
          v-for="item in statusOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>

      <el-input
        v-model="searchInfo.geologyCode"
        class="code-input"
        clearable
        placeholder="数据编号"
        @keyup.enter="handleSearchEvent"
      />

      <el-input
        v-model="searchInfo.projectCode"
        class="code-input"
        clearable
        placeholder="关联项目编号"
        @keyup.enter="handleSearchEvent"
      />

      <!-- 重置在前、搜索在后，紧跟筛选项 -->
      <div class="search-actions">
        <el-button class="btn-reset" @click="resetSearchEvent">
          重置
        </el-button>
        <el-button type="primary" class="btn-search" @click="handleSearchEvent">
          搜索
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { getProvince } from '@/api/modules/public';
import { filterAreaInfo } from '../../commonData';

const emit = defineEmits([
  'viewType',
  'handleSearchCommon',
  'resetSearchCommon',
]);

const props = defineProps({
  activeKey: {
    type: Number,
    default: 0,
  },
});

const viewType = ref(2);
const areaCodeData = ref([]);
const areaCodeOptions = ref([]);

const areaProps = {
  label: 'regionName',
  value: 'regionCode',
  children: 'subList',
  checkStrictly: true,
  emitPath: true,
};

const provideData = [
  { label: '全部维度', value: '0' },
  { label: '省维度', value: '1' },
  { label: '市维度', value: '2' },
  { label: '区维度', value: '3' },
];

const dataState = {
  0: [
    { label: '系统解析', value: 1 },
    { label: '已核对', value: 2 },
    { label: '解析错误', value: 3 },
  ],
  1: [
    { label: '已开放', value: 0 },
    { label: '已禁用', value: 1 },
  ],
};

const statusOptions = computed(() =>
  dataState[props.activeKey] || dataState[0],
);

const createEmptySearchInfo = () => ({
  rangeType: '0',
  geo: [],
  status: undefined,
  geologyCode: '',
  projectCode: '',
});

const searchInfo = reactive(createEmptySearchInfo());

onMounted(() => {
  getProvince().then((res) => {
    if (res?.code === 200) {
      areaCodeData.value = res.data?.subList || [];
      areaCodeOptions.value = filterAreaInfo(0, areaCodeData.value);
    }
  });
});

const changeAreaData = (value) => {
  areaCodeOptions.value = filterAreaInfo(
    Number(value),
    areaCodeData.value,
  );
  searchInfo.geo = [];
  emit('handleSearchCommon', { ...searchInfo });
};

const handleSearchEvent = () => {
  emit('handleSearchCommon', {
    ...searchInfo,
    geo: [...(searchInfo.geo || [])],
  });
};

const resetSearchEvent = () => {
  Object.assign(searchInfo, createEmptySearchInfo());
  areaCodeOptions.value = filterAreaInfo(0, areaCodeData.value);
  emit('resetSearchCommon');
};

const onChangeViewType = () => {
  emit('viewType', viewType.value);
};

defineExpose({
  viewType,
  onChangeViewType,
});
</script>

<style scoped lang="scss">
.search-group-component {
  width: 100%;
  padding: 16px 20px;
  box-sizing: border-box;
}

.search-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.range-select,
.status-select {
  width: 140px;
}

.area-cascader {
  width: 220px;
}

.code-input {
  width: 200px;
}

.search-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 输入框 / 下拉框 / 级联：白底、10px 圆角、36px 高、#E2E9F0 边框 */
.search-toolbar :deep(.el-select__wrapper),
.search-toolbar :deep(.el-input__wrapper) {
  min-height: 36px;
  border-radius: 10px;
  background: #FFFFFF;
  box-shadow: 0 0 0 1px #E2E9F0 inset;
  font-size: 13px;

  &:hover {
    box-shadow: 0 0 0 1px #C9D3DE inset;
  }
  &.is-focused,
  &.is-focus {
    box-shadow: 0 0 0 1px #0278E7 inset;
  }
}
.search-toolbar :deep(.el-input__inner),
.search-toolbar :deep(.el-select__placeholder),
.search-toolbar :deep(.el-select__selected-item) {
  font-size: 13px;
}
.search-toolbar :deep(.el-input__inner),
.search-toolbar :deep(.el-select__selected-item) {
  color: #0B1C2C;
}
.search-toolbar :deep(.el-input__inner::placeholder),
.search-toolbar :deep(.el-select__placeholder) {
  color: #667383;
}

/* 按钮：36px 高、8px 圆角 */
.search-actions .btn-reset,
.search-actions .btn-search {
  height: 36px;
  margin: 0;
  padding: 0 16px;
  border-radius: 8px;
  font-size: 13px;
}
.search-actions .btn-reset {
  color: #667383;
  background: #FFFFFF;
  border: 1px solid #E2E9F0;

  &:hover {
    color: #0278E7;
    border-color: #0278E7;
    background: #FFFFFF;
  }
}
.search-actions .btn-search {
  --el-button-bg-color: #0278E7;
  --el-button-border-color: #0278E7;
  --el-button-hover-bg-color: #0267C7;
  --el-button-hover-border-color: #0267C7;
  --el-button-active-bg-color: #0267C7;
  --el-button-active-border-color: #0267C7;
}
</style>