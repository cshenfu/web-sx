<template>
  <div class="photovoltaic-equipment">
    <div class="user-tabs">
      <div class="add-btn" @click="goPath">
        <el-icon class="add-icon" :size="12">
          <Plus />
        </el-icon>
        导入数据
      </div>
    </div>

    <photovoltaic-list-search-bar
      ref="photovoltaicSearchRef"
      @handleSearch="handleSearch"
    />

    <table-list
      id="photovoltaicListTable"
      class="user-table"
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
          <span class="operation-btn-item" @click.stop="deleteFile(record)">
            删除
          </span>
          <span class="operation-btn-item" @click.stop="uploadImg(record)">
            上传图片
          </span>
        </div>
      </template>
    </table-list>

    <!-- 导入数据 -->
    <import-file-modal
      v-if="importFileFlg"
      v-model:importFileFlg="importFileFlg"
      @updateList="handleSearch"
    />

    <!-- 删除确认：TipsModal 是项目自定义组件，继续保留 -->
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
import ImportFileModal from './components/ImportFileModalElementPlus.vue';
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

// 查看详情。
const getRowData = (row) => {
  router.push({
    path: '/photovoltaic/detail',
    query: {
      id: row.id,
    },
  });
};

// 搜索。
const handleSearch = (value) => {
  const searchValue =
    value ?? photovoltaicSearchRef.value?.searchKey ?? {};

  page.value.pageNo = 1;
  getTableData(searchValue);
};

// 获取分页。
const changePage = (value) => {
  page.value.pageNo = value.page;
  page.value.pageSize = value.pageSize;
  getTableData(photovoltaicSearchRef.value?.searchKey ?? {});
};

// 获取列表数据。
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

// 打开删除确认弹窗。
const deleteFile = (row) => {
  chooseSelectData.value = row;
  openTipsClimateModal.value = true;
};

// 确认删除。
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

// 上传图片。
const uploadImg = (row) => {
  chooseDataId.value = row.id;
  upLoadImgFlg.value = true;
};

// 打开导入数据弹窗。
const goPath = () => {
  importFileFlg.value = true;
};
</script>

<style scoped lang="scss">
.photovoltaic-equipment {
  position: relative;
  min-height: calc(100vh - 120px);
  padding: 16px 24px;
  background-color: #fff;

  .user-tabs {
    margin-bottom: 12px;
  }
}

.add-btn {
  display: inline-flex;
  align-items: center;
  color: #036b64;
  cursor: pointer;
  font-size: 14px;
}

.add-icon {
  margin-right: 4px;
}

.table-preview-image {
  display: block;
  border-radius: 4px;
  cursor: zoom-in;
}

.operation-btn {
  display: flex;
  align-items: center;
  gap: 12px;
}

.operation-btn-item {
  color: #036b64;
  cursor: pointer;
  white-space: nowrap;
}

.dialog-title {
  color: #21263f;
  font-size: 18px;
  font-weight: 500;
}

.modalTip {
  color: #363b4d;
  font-size: 14px;
}
</style>