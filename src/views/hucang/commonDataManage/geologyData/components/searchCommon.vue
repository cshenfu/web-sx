<template>
    <div class="search-group-component">
      <div class="search-toolbar">
        <el-select
          v-model="searchInfo.rangeType"
          class="search-item-box range-select"
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
          class="search-item-box area-cascader"
          :options="areaCodeOptions"
          :props="areaProps"
          clearable
          filterable
          placeholder="省市区"
          @change="handleSearchEvent"
        />
  
        <el-select
          v-model="searchInfo.status"
          class="search-item-box status-select"
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
          class="search-item-box code-input"
          clearable
          placeholder="数据编号"
        />
  
        <el-input
          v-model="searchInfo.projectCode"
          class="search-item-box code-input"
          clearable
          placeholder="关联项目编号"
        />
  
        <div class="search-actions">
          <el-button type="primary" @click="handleSearchEvent">
            搜索
          </el-button>
          <el-button @click="resetSearchEvent">
            重置
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
    margin-top: 12px;
  }
  
  .search-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
  }
  
  .search-item-box {
    margin-right: 12px;
    margin-bottom: 16px;
  }
  
  .range-select,
  .status-select {
    width: 140px;
  }
  
  .area-cascader {
    width: 220px;
  }
  
  .code-input {
    width: 240px;
  }
  
  .search-actions {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
  }
  </style>