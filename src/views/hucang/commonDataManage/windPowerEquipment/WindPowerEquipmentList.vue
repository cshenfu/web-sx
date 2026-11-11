<template>
  <!-- 唯一根节点 -->
  <div class="wind-power-root">
    <div class="wind-power-page-bg">
      <!-- 背景光晕层（保留） -->
      <div class="bg-glow-top-left"></div>
      <div class="bg-glow-bottom-right"></div>
      <div class="bg-glow-top-right"></div>

      <!-- 顶部 Header：左标题，右操作按钮，同一行 -->
      <div class="page-header">
        <span class="page-title">风机设备库</span>
        <div class="action-buttons">
          <a-button class="btn-reset" @click="importFile">
            <iconpark-icon name="daoru" size="14"></iconpark-icon>
            导入数据
          </a-button>
          <a-button type="primary" class="btn-add" @click="goPath">
            <iconpark-icon name="xinzeng" size="14"></iconpark-icon>
            新增数据
          </a-button>
        </div>
      </div>

      <!-- 主卡片：搜索栏 + 列表 -->
      <div class="main-card">
        <div class="filter-bar">
          <wind-power-equipment-list-search-bar
            ref="equipmentListRef"
            @handleSearch="handleSearch"
            @resetSearch="resetSearch"
          ></wind-power-equipment-list-search-bar>
        </div>

        <div class="table-wrapper">
          <table-list
            class="user-table"
            fit
            :loading="loading"
            :tableData="data"
            :tableColumn="computedColumn"
            :page="page"
            @getRowData="getRowData"
            @changePage="changePage"
          >
            <template #value10="{ record }">
              <iconpark-icon :name="record.value10 == 1 ? 'you' : 'wu'"></iconpark-icon>
            </template>
            <template #deviceType="{ record }">
              {{ record.deviceType ? getDeviceType[record.deviceType] : '--' }}
            </template>
            <template #devicePowerThrustCurveId="{ record }">
              <span class="check-name" v-if="!record.devicePowerThrustCurveId" @click.stop="goDetail(record.id, 1)">查看</span>
              <span class="check-name" v-if="record.devicePowerThrustCurveId">引用<br />{{ record.devicePowerThrustCurveId }}</span>
            </template>
            <template #deviceTowerBarrelId="{ record }">
              <span class="check-name" v-if="!record.deviceTowerBarrelId" @click.stop="goDetail(record.id, 2)">查看</span>
              <span class="check-name" v-if="record.deviceTowerBarrelId">引用<br />{{ record.deviceTowerBarrelId }}</span>
            </template>
            <template #deviceTowerBottomLoadId="{ record }">
              <span class="check-name" v-if="!record.deviceTowerBottomLoadId" @click.stop="goDetail(record.id, 3)">查看</span>
              <span class="check-name" v-if="record.deviceTowerBottomLoadId">引用<br />{{ record.deviceTowerBottomLoadId }}</span>
            </template>
            <template #maxLiveEnvTemperature="{ record }">
              {{ record.minLiveEnvTemperature }} ~ {{ record.maxLiveEnvTemperature }}
            </template>
            <template #maxOperateTemperature="{ record }">
              {{ record.minOperateTemperature }} ~ {{ record.maxOperateTemperature }}
            </template>
            <template #createTime="{ record }">
              {{ record.createTime ? dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') : '--' }}
            </template>
            <template #operation="{ record }">
              <div class="operation-btn">
                <span class="operation-btn-item" @click.stop="editFile(record)">编辑</span>
                <span class="operation-btn-item is-danger" @click.stop="deleteFile(record)">删除</span>
                <span class="operation-btn-item" @click.stop="exportWtgFileFn(record)">导出wtg</span>
              </div>
            </template>
          </table-list>
        </div>
      </div>
    </div>

    <!-- 删除弹窗 -->
    <tips-modal
      :width="'490px'"
      title="删除提示"
      :tipType="'danger'"
      class="tip-content-modal"
      :okText="'确定删除'"
      v-model:openTipsModal="openTipsPowerModal"
      @handleChangeFileModal="handleChangeClose"
    >
      <template #contentBody>
        <div v-if="!isDeleteSucessMemo">
          <p class="modalTip">确定删除该设备信息么？</p>
          <span class="modalTip-memo">设备编号：{{ currentData?.deviceCode }}</span>
          <span class="modalTip-memo">设备型号：{{ currentData?.deviceModel }}</span>
        </div>
        <div v-else>
          <p class="modalTip">存在项目草稿或计算中项目引用该机型，暂时无法删除</p>
          <span class="modalTip-memo">{{ isDeleteSucessMemo }}</span>
        </div>
      </template>
      <template #footerSlot v-if="isDeleteSucessMemo">
        <a-button type="primary" @click="() => handleChangeClose(false)">知道了</a-button>
      </template>
    </tips-modal>

    <!-- 导入数据弹窗 -->
    <import-file-modal
      importFileMemo="目前支持excel、wtg格式导入"
      :fileTypes="['xlsx', 'xls', 'wtg']"
      v-model:importFileFlg="importFileFlg"
      v-model:problemList="problemList"
      v-if="importFileFlg"
      @updateFIleData="updateFIleData"
    >
      <template #contentBodyHead>
        <div class="tuning-tip">
          <iconpark-icon name="jinggao" size="18" class="success"></iconpark-icon>
          <span class="tuning-tip-title">说明：导入相同名称的数据，会进行数据覆盖</span>
        </div>
        <div class="tuning-example">
          导入前请先下载excel导入模板，
          <span
            @click="downloadFile(`https://whln-prod-public.${ossClientInfo.endPointShort}/template/%E9%A3%8E%E6%9C%BA%E8%AE%BE%E5%A4%87%E5%BD%95%E5%85%A5%E6%A8%A1%E6%9D%BF-2025-05-26.xlsx`)"
          >
            下载模板
          </span>
        </div>
      </template>
    </import-file-modal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import ImportFileModal from './components/ImportFileModal.vue';
import WindPowerEquipmentListSearchBar from './components/WindPowerEquipmentListSearchBar.vue';
import TableList from '@/components/tableList/TableList.vue';
import TipsModal from '@/components/tipsDialog/TipsModal.vue';
import { ossClientInfo } from '@/assets/js/static';
import {
  EQUIPMENT_TABLE_LIST_CLOUMN,
  POWER_REGULATION,
} from './windPowerEquipment';
import {
  getwindPowerList,
  delwindPower,
  importwindPower,
  exportWtgFile,
} from '@/api/modules/windPower.js';
import dayjs from 'dayjs';
import { ElMessage } from 'element-plus';
import { removeEmptyValues } from '@/utils/removeEmptyValues.js';
import { parseWTGXML, readFileAsText } from '@/utils/readWtgFile';

const router = useRouter();
const importFileFlg = ref(false);
const isDeleteSucessMemo = ref('');
const problemList = ref([]);

const getDeviceType = {
  1: '直驱',
  2: '双馈',
  3: '中速永磁',
  4: '半直驱',
};

// 因为固定查公共库，不需要动态的 computed，直接用公共列即可
const computedColumn = computed(() => [...EQUIPMENT_TABLE_LIST_CLOUMN]);

const currentData = ref(null);
const equipmentListRef = ref();
const loading = ref(false);
const page = ref({
  current: 1,
  size: 10,
  total: 0,
});
const data = ref([]);

const exportWtgFileFn = async (val) => {
  try {
    let res = await exportWtgFile(val.id);
    const url = window.URL.createObjectURL(new Blob([res]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${val.deviceModel}.wtg`);
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  } catch (err) {}
};

const importFile = () => {
  importFileFlg.value = true;
};

const handleFileUpload = async (file) => {
  if (!file) return;
  try {
    const text = await readFileAsText(file);
    const result = parseWTGXML(text);
    sessionStorage.setItem('wtgFileResult', JSON.stringify(result));
  } catch (error) {
    ElMessage.error('文件解析失败');
  }
};

const updateFIleData = async (file) => {
  if (file.fileType === 'wtg') {
    await handleFileUpload(file.fileList[0].originFileObj);
    router.push({
      path: '/windEquipment/add',
      query: {
        type: 'wtg',
      },
    });
  } else {
    updateFile(file.fileList[0].originFileObj);
  }
};

const updateFile = async (val) => {
  try {
    let formData = new FormData();
    formData.append('file', val);
    let res = await importwindPower(formData);
    if (res.code == 200) {
      const failureNames = Object.keys(res.data.failureNames);
      let flag = failureNames.length === 0 && res.data.failureNames.constructor === Object;
      if (flag) {
        getTableData(equipmentListRef.value.searchKey);
        problemList.value = [];
        ElMessage.success('操作成功！');
        importFileFlg.value = false;
      } else {
        problemList.value = res.data.failureNames;
      }
    }
  } catch (error) {}
};

const goPath = () => {
  router.push({
    path: '/hucang/windEquipment/add',
  });
};

const handleSearch = (val) => {
  page.value.current = 1;
  getTableData(val);
};

const resetSearch = (val) => {
  page.value.current = 1;
  page.value.size = 10;
  handleSearch(val);
};

const getTableData = (val) => {
  const params = removeEmptyValues({ ...val });
  getwindPowerList({
    source: 1, // 固定为 1（公共数据）
    pageNo: page.value.current,
    pageSize: page.value.size,
    ...params,
  }).then((res) => {
    if (res.code == 200) {
      data.value = res.data?.list.map((m) => {
        let str = POWER_REGULATION.filter((n) => n.value == m.powerType);
        return {
          ...m,
          powerType: str.length ? str[0]['label'] : m.powerType,
        };
      });
      page.value.total = res.data.total;
    } else {
      data.value = [];
      page.value.total = 0;
    }
  });
};

const getRowData = (row) => {
  router.push({
    path: '/windEquipment/detail',
    query: { id: row.id },
  });
};

const goDetail = (id, type) => {
  sessionStorage.setItem('detailType', type);
  router.push({
    path: '/windEquipment/detail',
    query: { id: id },
  });
};

const changePage = (val) => {
  page.value.current = val.page;
  page.value.size = val.pageSize;
  getTableData(equipmentListRef.value.searchKey);
};

const openTipsPowerModal = ref(false);

const handleChangeClose = (val) => {
  if (val) {
    confirmDelete();
  }
  openTipsPowerModal.value = !openTipsPowerModal.value;
  isDeleteSucessMemo.value = '';
};

const editFile = (val) => {
  router.push({
    path: '/windEquipment/add',
    query: { id: val.id, type: 'edit' },
  });
};

const deleteFile = (val) => {
  currentData.value = val;
  openTipsPowerModal.value = !openTipsPowerModal.value;
};

const confirmDelete = () => {
  delwindPower(currentData.value.id).then((res) => {
    if (res.code == 200 && res.data) {
      ElMessage.success('操作成功！');
      handleSearch(equipmentListRef.value.searchKey);
      isDeleteSucessMemo.value = '';
    } else {
      isDeleteSucessMemo.value = res.data;
    }
  });
};

const downloadFile = (path) => {
  path && window.open(path);
};

onMounted(() => {
  handleSearch(equipmentListRef.value?.searchKey || {});
});
</script>
<style scoped lang="scss">
@import '@/assets/css/tabs.scss';

.wind-power-root {
  width: 100%;
  height: 100%;
}

/* 外层容器：恢复原来的渐变背景 */
.wind-power-page-bg {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(122.01deg, #E6EEF8 0%, #D2E0F4 100%), #FFFFFF;
  overflow: hidden;
}

/* ========== 背景光晕层（原样保留） ========== */
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
  justify-content: space-between; /* 让标题和按钮左右分开 */
  height: 67px;
  padding: 15px 20px;
  box-sizing: border-box;
  flex-shrink: 0;
  border-bottom: 1px solid #E2E9F0; /* 保留原来的分割线 */
}
.page-title {
  font-family: 'PingFang SC';
  font-weight: 500;
  font-size: 16px;
  color: #0B1C2C;
}

/* 按钮组样式：直接放在 Header 中，不需要外层包裹 */
.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;

  .btn-reset {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 36px;
    padding: 0 16px;
    border-radius: 8px;
    font-size: 13px;
    color: #667383;
    background: #FFFFFF;
    border: 1px solid #E2E9F0;

    &:hover {
      color: #0278E7;
      border-color: #0278E7;
    }
  }

  .btn-add {
    display: inline-flex;
    align-items: center;
    gap: 4px;
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
}

/* ========== 主卡片（保留原有的白底卡片样式） ========== */
.main-card {
  position: relative;
  z-index: 2;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  margin: 0 12px 30px;        /* 保留原来的间距 */
  background: #FFFFFF;
  border: 1px solid #DFE5EC;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(11, 28, 44, 0.04);
  overflow: hidden;
}

/* ========== 搜索栏占位 ========== */
.filter-bar {
  flex-shrink: 0;
  background: #FFFFFF;
}

/* ========== 表格容器 ========== */
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
  }
}

/* 表格内部和弹窗样式（保留原样） */
.check-name {
  font-size: 13px;
  color: #0278E7;
  cursor: pointer;

  &:hover {
    color: #0267C7;
  }
}
.operation-btn {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 4px 12px;
}
.operation-btn-item {
  font-size: 13px;
  color: #667383;
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
/* ... 其他弹窗样式保持不变 ... */
</style>