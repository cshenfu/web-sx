<template>
    <a-modal
      :open="visible"
      :width="1000"
      :maskClosable="false"
      :footer="null"
      :closable="!loading"
      :body-style="{ padding: '16px 24px' }"
      @update:open="(val) => emit('update:visible', val)"
      @cancel="handleCancel"
    >
      <!-- 加载遮罩层 -->
      <div v-if="loading" class="modal-loading-mask">
        <a-spin
          size="large"
          :tip="adjustType === 'finance'
            ? '正在调整财务评价项目，请稍候...'
            : '正在调整概算，请稍候...'"
        />
      </div>
  
      <div class="adjust-budget-modal">
        <!-- 搜索栏 -->
        <div class="search-bar">
          <a-row :gutter="16" align="middle">
            <a-col :span="5">
              <a-form-item label="所属区域" :label-col="{ style: { width: '70px' } }" :wrapper-col="{ style: { width: 'calc(100% - 70px)' } }">
                <a-cascader
                  v-model:value="searchForm.region"
                  :options="regionOptions"
                  placeholder="请选择区域"
                  allow-clear
                  :field-names="{ label: 'label', value: 'value', children: 'children' }"
                  change-on-select
                />
              </a-form-item>
            </a-col>
            <a-col :span="5">
              <a-form-item label="项目编号" :label-col="{ style: { width: '70px' } }" :wrapper-col="{ style: { width: 'calc(100% - 70px)' } }">
                <a-input v-model:value="searchForm.projectCode" placeholder="请输入项目编号" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :span="5">
              <a-form-item label="项目名称" :label-col="{ style: { width: '70px' } }" :wrapper-col="{ style: { width: 'calc(100% - 70px)' } }">
                <a-input v-model:value="searchForm.projectName" placeholder="请输入项目名称" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :span="9" style="text-align: right">
              <a-button type="primary" @click="handleSearch" :disabled="loading">搜索</a-button>
              <a-button style="margin-left: 8px" @click="handleReset" :disabled="loading">重置</a-button>
              <!-- <a-button type="primary" style="margin-left: 8px" @click="handleCreate" :disabled="loading">创建</a-button> -->
            </a-col>
          </a-row>
        </div>
  
        <!-- 表格区域 -->
        <div class="table-wrapper">
          <a-table
            :columns="columns"
            :data-source="dataList"
            :loading="tableLoading"
            :pagination="pagination"
            row-key="id"
            :scroll="{ x: 800, y: 400 }"
            @change="handleTableChange"
          >
            <template #bodyCell="{ column, record }">
              <!-- 单选按钮 -->
              <template v-if="column.key === 'radio'">
                <a-radio :checked="selectedId === record.id" @change="() => onRadioChange(record)" :disabled="loading" />
              </template>
              <!-- 所属区域 -->
              <template v-if="column.key === 'region'">
                {{ getRegionText(record) }}
              </template>
              <!-- 装机容量 -->
              <template v-if="column.key === 'capacity'">
                {{ record.currentProjectCapacity ?? '-' }}
              </template>
              <!-- 创建时间 -->
              <template v-if="column.key === 'createTime'">
                {{ formatTime(record.createTime) }}
              </template>
            </template>
          </a-table>
        </div>
  
        <!-- 底部 -->
        <div class="modal-footer">
          <div class="selected-info">
            <span class="label">当前选择项目：</span>
            <span v-if="selectedRecord" class="value">
              {{ selectedRecord.projectCode }} | {{ selectedRecord.projectName }}
            </span>
            <span v-else class="value placeholder">请选择项目</span>
          </div>
          <div class="footer-actions">
            <a-button @click="handleCancel" :disabled="loading">取消</a-button>
            <a-button
              type="primary"
              :disabled="!selectedRecord || loading"
              @click="handleConfirm"
            >
              确定
            </a-button>
          </div>
        </div>
      </div>
    </a-modal>
  </template>
  
  <script setup>
  import { ref, reactive, watch, toRefs, computed } from 'vue';
  import { message } from 'ant-design-vue';
  import { getDoneProject, reportEstAdjust } from '@/api/modules/sourceData/budgetManagement.js';
  import { createProjectByProjectId } from '@/api/modules/pric.js';  
  // ─── Props ──────────────────────────────────────────────
  const props = defineProps({
    visible: {
      type: Boolean,
      default: false,
    },

    // 概算：budget
    // 财务：finance
    adjustType: {
      type: String,
      default: 'budget',
      validator: (value) => ['budget', 'finance'].includes(value),
    },

    // 概算项目类型，例如 1 表示风电
    projectType: {
      type: [Number, String],
      default: undefined,
    },

    // 入口类型
    portalType: {
      type: String,
      default: 'customer',
    },
  });
  
  const { visible,adjustType,projectType,portalType,} = toRefs(props);
  const emit = defineEmits(['update:visible', 'confirm', 'create']);
  
  // ─── 表格列定义 ──────────────────────────────────────────
  const columns = [
    { title: '', key: 'radio', width: 40, fixed: 'left' },
    { title: '项目编号', dataIndex: 'projectCode', key: 'projectCode', width: 140 },
    { title: '项目名称', dataIndex: 'projectName', key: 'projectName', ellipsis: true },
    { title: '所属区域', key: 'region', width: 200 },
    { title: '装机容量MW', key: 'capacity', width: 120, align: 'center' },
    { title: '创建时间', key: 'createTime', width: 170 },
  ];
  
  // ─── 状态 ──────────────────────────────────────────────
  const loading = ref(false); // 全弹窗 loading（调用 reportEstAdjust 时）
  const tableLoading = ref(false); // 表格独立 loading（获取列表时）
  const dataList = ref([]);
  const selectedId = ref(null);
  const selectedRecord = ref(null);
  
  const searchForm = reactive({
    region: [],
    projectCode: '',
    projectName: '',
  });
  
  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `共 ${total} 条`,
    pageSizeOptions: ['10', '20', '50', '100'],
  });
  
  // ─── 区域级联选项 ──────────────────────────────────────
  const regionOptions = computed(() => {
    const map = new Map();
    dataList.value.forEach((item) => {
      if (item.provinceCode) {
        if (!map.has(item.provinceCode)) {
          map.set(item.provinceCode, {
            label: item.provinceName,
            value: item.provinceCode,
            children: [],
          });
        }
        const province = map.get(item.provinceCode);
        if (item.cityCode) {
          let city = province.children.find((c) => c.value === item.cityCode);
          if (!city) {
            city = { label: item.cityName, value: item.cityCode, children: [] };
            province.children.push(city);
          }
          if (item.districtCode) {
            let district = city.children.find((d) => d.value === item.districtCode);
            if (!district) {
              district = { label: item.districtName, value: item.districtCode };
              city.children.push(district);
            }
          }
        }
      }
    });
    return Array.from(map.values());
  });
  
  // ─── 工具函数 ──────────────────────────────────────────
  const getRegionText = (record) => {
    const parts = [record.provinceName, record.cityName, record.districtName].filter(Boolean);
    return parts.length ? parts.join('/') : '-';
  };
  
  const formatTime = (ts) => {
    if (!ts) return '-';
    try {
      const d = new Date(ts);
      if (isNaN(d.getTime())) return '-';
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return '-';
    }
  };
  
  // ─── 获取数据 ──────────────────────────────────────────
  const fetchData = async (page = pagination.current) => {
    if (!visible.value) return;
    tableLoading.value = true;
    try {
      const params = {
        pageNo: page,
        pageSize: pagination.pageSize,
        projectName: searchForm.projectName || undefined,
        projectCode: searchForm.projectCode || undefined,
        provinceCode: searchForm.region?.[0] || undefined,
        cityCode: searchForm.region?.[1] || undefined,
        countyCode: searchForm.region?.[2] || undefined,
      };
      if (projectType.value !== undefined && projectType.value !== null && projectType.value !== '') {
        params.itemType = String(projectType.value);
      }
      const res = await getDoneProject(params);
      if (res.code === 200) {
        dataList.value = res.data?.list || [];
        pagination.total = res.data?.total || 0;
        pagination.current = page;
        // 保留选中状态
        if (selectedRecord.value) {
          const exists = dataList.value.some((item) => item.id === selectedRecord.value.id);
          if (!exists) {
            selectedId.value = null;
            selectedRecord.value = null;
          }
        }
      } else {
        message.error(res.msg || '获取项目列表失败');
      }
    } catch (err) {
      console.error('获取已完成可研项目列表失败：', err);
      message.error('请求异常，请稍后重试');
    } finally {
      tableLoading.value = false;
    }
  };
  
  // ─── 搜索 / 重置 ──────────────────────────────────────
  const handleSearch = () => {
    pagination.current = 1;
    fetchData(1);
  };
  
  const handleReset = () => {
    searchForm.region = [];
    searchForm.projectCode = '';
    searchForm.projectName = '';
    pagination.current = 1;
    fetchData(1);
  };
  
  const handleCreate = () => {
    emit('create');
  };
  
  // ─── 分页 ──────────────────────────────────────────────
  const handleTableChange = (pag) => {
    pagination.pageSize = pag.pageSize;
    fetchData(pag.current);
  };
  
  // ─── 单选 ──────────────────────────────────────────────
  const onRadioChange = (record) => {
    if (loading.value) return;
    if (selectedId.value === record.id) {
      selectedId.value = null;
      selectedRecord.value = null;
    } else {
      selectedId.value = record.id;
      selectedRecord.value = { ...record };
    }
  };
  
  // ─── 确定（调用接口） ──────────────────────────────────
  // 确定：根据业务类型调用不同接口
const handleConfirm = async () => {
  if (!selectedRecord.value) {
    message.warning('请先选择一个项目');
    return;
  }

  loading.value = true;

  try {
    let res;

    if (adjustType.value === 'finance') {
      // 财务评价接口
      res = await createProjectByProjectId({
        portalType: portalType.value,
        projectId: selectedRecord.value.id,
        projectName: selectedRecord.value.projectName,
      });
    } else {
      // 技经概算接口
      res = await reportEstAdjust({
        portalType: portalType.value,
        projectId: selectedRecord.value.id,
      });
    }

    if (res.code === 200) {
      /*
       * 兼容不同接口返回格式：
       * 1. data 直接返回项目 ID
       * 2. data 返回 { id }
       * 3. data 返回 { projectId }
       */
      const newProjectId = res.data
      emit('confirm', {
        project: selectedRecord.value,
        newProjectId,
        adjustData: res.data,
        adjustType: adjustType.value,
      });

      emit('update:visible', false);
    } else {
      message.error(
        res.msg ||
        (adjustType.value === 'finance'
          ? '调整财务评价项目失败，请稍后重试'
          : '调整概算失败，请稍后重试')
      );
    }
  } catch (err) {
    console.error(
      adjustType.value === 'finance'
        ? '调整财务评价项目失败：'
        : '调整概算失败：',
      err
    );

    message.error(
      adjustType.value === 'finance'
        ? '调整财务评价项目异常，请稍后重试'
        : '调整概算异常，请稍后重试'
    );
  } finally {
    loading.value = false;
  }
};
  
  // ─── 取消 ──────────────────────────────────────────────
  const handleCancel = () => {
    if (loading.value) return;
    emit('update:visible', false);
  };
  
  // ─── 监听 visible ──────────────────────────────────────
  watch(visible, (newVal) => {
    if (newVal) {
      selectedId.value = null;
      selectedRecord.value = null;
      pagination.current = 1;
      fetchData(1);
    }
  });
  
  defineExpose({ refresh: fetchData });
  </script>
  
  <style scoped lang="scss">
  .adjust-budget-modal {
    position: relative;
  
    .search-bar {
      margin-bottom: 16px;
      :deep(.ant-form-item) {
        margin-bottom: 0;
      }
    }
  
    .table-wrapper {
      :deep(.ant-table) {
        font-size: 13px;
      }
      :deep(.ant-table-thead > tr > th) {
        background: #fafafa;
        font-weight: 600;
        color: #363b4d;
      }
      :deep(.ant-table-tbody > tr:hover > td) {
        background: #f5f9ff;
      }
    }
  
    .modal-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #f0f0f0;
  
      .selected-info {
        font-size: 14px;
        .label {
          color: #666;
        }
        .value {
          color: #1890ff;
          font-weight: 500;
        }
        .placeholder {
          color: #bbb;
          font-weight: 400;
        }
      }
  
      .footer-actions {
        display: flex;
        gap: 8px;
      }
    }
  }
  
  // 全弹窗加载遮罩
  .modal-loading-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
    border-radius: 8px;
  }
  </style>