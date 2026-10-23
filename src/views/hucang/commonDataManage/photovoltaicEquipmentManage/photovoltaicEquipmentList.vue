<template>
  <!-- 唯一根节点 -->
  <div class="photovoltaic-root">
    <div class="photovoltaic-page-bg">
      <!-- 背景光晕层 -->
      <div class="bg-glow-top-left"></div>
      <div class="bg-glow-bottom-right"></div>
      <div class="bg-glow-top-right"></div>

      <!-- 顶部 Header -->
      <div class="page-header">
        <span class="page-title">光伏组件库</span>
      </div>

      <!-- 主卡片 -->
      <div class="main-card">
        <!-- 顶部操作栏：导入数据 -->
        <div class="card-header">
          <div class="header-left"></div>
          <div class="header-actions">
            <a-button type="primary" class="btn-add" @click="goPath">
              <el-icon class="add-icon" :size="12"><Plus /></el-icon>
              导入数据
            </a-button>
          </div>
        </div>

        <!-- 搜索栏 -->
        <div class="filter-bar">
          <photovoltaic-list-search-bar
            ref="photovoltaicSearchRef"
            @handleSearch="handleSearch"
          />
        </div>

        <!-- 表格区域 -->
        <div class="table-wrapper">
          <table-list
            id="photovoltaicListTable"
            class="user-table"
            fit
            :loading="loading"
            :tableData="dataList"
            :tableColumn="PHOTOVOLTAIC_TABLE_LIST_CLOUMN"
            :page="page"
            @changePage="changePage"
          >
            <template #structuralDiagramComponents="{ record }">
              <el-image
                v-if="record.sCompeleteUrl"
                class="table-preview-image"
                :width="50"
                :height="50"
                :src="record.sCompeleteUrl"
                :preview-src-list="[record.sCompeleteUrl]"
                fit="cover"
                preview-teleported
              />
              <span v-else>--</span>
            </template>

            <template #componentCharacteristicCurveDiagram="{ record }">
              <el-image
                v-if="record.cCompeleteUrl"
                class="table-preview-image"
                :width="50"
                :height="50"
                :src="record.cCompeleteUrl"
                :preview-src-list="[record.cCompeleteUrl]"
                fit="cover"
                preview-teleported
              />
              <span v-else>--</span>
            </template>

            <template #operation="{ record }">
              <div class="operation-btn">
                <span class="operation-btn-item" @click.stop="getRowData(record)">
                  查看详情
                </span>
                <span class="operation-btn-item is-danger" @click.stop="deleteFile(record)">
                  删除
                </span>
                <span class="operation-btn-item" @click.stop="uploadImg(record)">
                  上传图片
                </span>
              </div>
            </template>
          </table-list>
        </div>
      </div>
    </div>

    <!-- 导入数据弹窗 -->
    <import-file-modal
      v-if="importFileFlg"
      v-model:importFileFlg="importFileFlg"
      @updateList="handleSearch"
    />

    <!-- 删除确认 -->
    <tips-modal
      :width="'490px'"
      title="删除提示"
      :tipType="'danger'"
      class="tip-content-modal"
      :okText="'确定删除'"
      v-model:openTipsModal="openTipsClimateModal"
      @handleChangeFileModal="handleChangeClose"
    >
      <template #contentBody>
        <span class="modalTip">确定删除该数据么？</span>
      </template>
    </tips-modal>

    <!-- 上传图片 -->
    <upload-photovoltaic-img
      v-if="upLoadImgFlg"
      v-model:upLoadImgFlg="upLoadImgFlg"
      :chooseDataId="chooseDataId"
      @updateList="handleSearch"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import dayjs from 'dayjs';

import PhotovoltaicListSearchBar from './components/PhotovoltaicListSearchBar.vue';
import TableList from '@/components/tableList/TableList.vue';
import { PHOTOVOLTAIC_TABLE_LIST_CLOUMN } from './photovoltaicEquipment';
import ImportFileModal from './components/ImportFileModal.vue';
import TipsModal from '@/components/tipsDialog/TipsModal.vue';
import UploadPhotovoltaicImg from './components/UploadPhotovoltaicImg.vue';
import {
  getPvComponentList,
  deletePvComponent,
} from '@/api/modules/commonDataManage';
import { ossClientInfo } from '@/assets/js/static.js';

const router = useRouter();

const importFileFlg = ref(false);
const upLoadImgFlg = ref(false);
const chooseDataId = ref(0);
const chooseSelectData = ref(null);
const photovoltaicSearchRef = ref(null);
const dataList = ref([]);
const loading = ref(false);
const openTipsClimateModal = ref(false);

const page = ref({
  pageNo: 1,
  pageSize: 10,
  total: 0,
});

// 查看详情
const getRowData = (row) => {
  router.push({
    path: '/photovoltaic/detail',
    query: {
      id: row.id,
    },
  });
};

// 搜索
const handleSearch = (value) => {
  const searchValue =
    value ?? photovoltaicSearchRef.value?.searchKey ?? {};

  page.value.pageNo = 1;
  getTableData(searchValue);
};

// 获取分页
const changePage = (value) => {
  page.value.pageNo = value.page;
  page.value.pageSize = value.pageSize;
  getTableData(photovoltaicSearchRef.value?.searchKey ?? {});
};

// 获取列表数据
const getTableData = async (value = {}) => {
  loading.value = true;

  const params = {
    ...value,
    pageNo: page.value.pageNo,
    pageSize: page.value.pageSize,
  };

  try {
    const res = await getPvComponentList(params);

    if (res.code === 200 && res.data?.list?.length) {
      dataList.value = res.data.list.map((item) => {
        const cCompeleteUrl = item.componentCharacteristicCurveDiagram
          ? `https://${ossClientInfo.bucketname}.${ossClientInfo.endPointShort}${item.componentCharacteristicCurveDiagram}`
          : '';
        const sCompeleteUrl = item.structuralDiagramComponents
          ? `https://${ossClientInfo.bucketname}.${ossClientInfo.endPointShort}${item.structuralDiagramComponents}`
          : '';

        return {
          ...item,
          createTime: item.createTime
            ? dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss')
            : '--',
          updateTime: item.updateTime
            ? dayjs(item.updateTime).format('YYYY-MM-DD HH:mm:ss')
            : '--',
          cCompeleteUrl,
          sCompeleteUrl,
        };
      });
      page.value.total = res.data.total || 0;
    } else {
      dataList.value = [];
      page.value.total = 0;
    }
  } catch (error) {
    console.error('获取光伏组件列表失败', error);
    dataList.value = [];
    page.value.total = 0;
  } finally {
    loading.value = false;
  }
};

// 打开删除确认弹窗
const deleteFile = (row) => {
  chooseSelectData.value = row;
  openTipsClimateModal.value = true;
};

// 确认删除
const handleChangeClose = async (value) => {
  if (!value || !chooseSelectData.value) {
    openTipsClimateModal.value = false;
    chooseSelectData.value = null;
    return;
  }

  try {
    const res = await deletePvComponent(chooseSelectData.value.id);

    if (res.code === 200 && res.data) {
      ElMessage.success('删除成功！');
      page.value.pageNo = 1;
      openTipsClimateModal.value = false;
      await getTableData(photovoltaicSearchRef.value?.searchKey ?? {});
    }
  } catch (error) {
    console.error('删除光伏组件失败', error);
  }
};

// 上传图片
const uploadImg = (row) => {
  chooseDataId.value = row.id;
  upLoadImgFlg.value = true;
};

// 打开导入数据弹窗
const goPath = () => {
  importFileFlg.value = true;
};
</script>

<style scoped lang="scss">
.photovoltaic-root {
  width: 100%;
  height: 100%;
}

/* 外层容器：纵向 flex，撑满父级 */
.photovoltaic-page-bg {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(122.01deg, #E6EEF8 0%, #D2E0F4 100%), #FFFFFF;
  overflow: hidden;
}

/* ========== 背景光晕层 ========== */
.bg-glow-top-left {
  position: absolute;
  left: -1.61%;
  top: -18.52%;
  width: 350px;
  height: 350px;
  background: linear-gradient(135deg, #FFCCD5 0%, #FECFEF 100%);
  opacity: 0.49;
  filter: blur(129.5px);
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
}
.bg-glow-bottom-right {
  position: absolute;
  right: 4.64%;
  bottom: -18.13%;
  width: 450px;
  height: 450px;
  background: linear-gradient(120deg, #A1C4FD 0%, #C2E9FB 100%);
  opacity: 0.7;
  filter: blur(123px);
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
}
.bg-glow-top-right {
  position: absolute;
  right: 19.01%;
  top: -37.04%;
  width: 300px;
  height: 300px;
  background: linear-gradient(120deg, #A1C4FD 0%, #C2E9FB 100%);
  opacity: 0.7;
  filter: blur(123px);
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
}

/* ========== 顶部 Header ========== */
.page-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  height: 67px;
  padding: 15px 20px;
  box-sizing: border-box;
  flex-shrink: 0;
  border-bottom: 1px solid #E2E9F0;
}
.page-title {
  font-family: 'PingFang SC';
  font-weight: 500;
  font-size: 16px;
  color: #0B1C2C;
}

/* ========== 主卡片 ========== */
.main-card {
  position: relative;
  z-index: 2;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  margin: 0 12px 30px;
  background: #FFFFFF;
  border: 1px solid #DFE5EC;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(11, 28, 44, 0.04);
  overflow: hidden;
}

/* ========== 头部操作栏 ========== */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 48px;
  border-bottom: 1px solid #E2E9F0;
  flex-shrink: 0;
}

/* 导入按钮标准化 */
.btn-add {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 16px;
  border-radius: 8px;
  font-size: 13px;
  background: #0278E7 !important;
  border-color: #0278E7 !important;
  color: #FFFFFF !important;

  &:hover {
    background: #0267C7 !important;
    border-color: #0267C7 !important;
  }
}
.add-icon {
  margin-right: 2px;
}

/* ========== 搜索栏与表格 ========== */
.filter-bar {
  flex-shrink: 0;
  background: #FFFFFF;
}

.table-wrapper {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 0 20px 16px;
  box-sizing: border-box;
  overflow: hidden;

  > .user-table {
    flex: 1;
    min-height: 0;
    width: 100%;

    /* 强制撑满表格 */
    :deep(.ant-table-wrapper),
    :deep(.ant-table),
    :deep(.ant-table-container),
    :deep(.ant-table-content),
    :deep(.ant-table table) {
      width: 100% !important;
    }
  }
}

/* ========== 表格内元素 ========== */
.table-preview-image {
  display: block;
  border-radius: 4px;
  cursor: zoom-in;
}

.operation-btn {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 4px 12px;
}

.operation-btn-item {
  color: #667383;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    color: #0278E7;
  }
  &.is-danger {
    color: #F2555A;

    &:hover {
      color: #D9363E;
    }
  }
}

/* ========== 弹窗辅助样式 ========== */
.modalTip {
  color: #363b4d;
  font-size: 14px;
}
</style>