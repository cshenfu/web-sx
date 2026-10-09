<template>
  <div class="import-file-modal">
    <tips-modal
      :width="'490px'"
      :showCancel="false"
      title="导入文件"
      :tipType="'success'"
      class="tip-content-modal"
      :okText="'确定上传数据'"
      v-model:openTipsModal="openTipsImportFileModal"
      @handleChangeFileModal="handleChangeClose"
    >
      <template #customTitle>{{ tipTitle }}</template>
      <template #contentBody>
        <div class="tuning-tip">
          <el-icon class="success" :size="18">
            <WarningFilled />
          </el-icon>
          <span class="tuning-tip-title">{{ contentTip }}</span>
        </div>

        <div>
          <div class="tuning-example">
            导入前请先下载数据模版，<span @click="downloadFile">下载模版</span>
          </div>

          <el-upload
            ref="uploadRef"
            v-model:file-list="fileList"
            class="content-add-upload"
            name="file"
            action="#"
            :limit="1"
            :show-file-list="false"
            :http-request="customRequest"
            :before-upload="beforeUpload"
            :on-change="handleChange"
            :on-exceed="handleExceed"
            list-type="picture-card"
          >
            <div class="upload-content">
              <el-icon :size="30">
                <UploadFilled />
              </el-icon>
              <div class="upload-description">
                目前支持 xlsx、xls 格式，最多上传1个文件，文件最大500M
              </div>
            </div>
          </el-upload>

          <span v-show="isShowRequire" class="content-add-tip">
            请上传导入文件
          </span>

          <ul v-if="fileList.length" class="selected-file-list">
            <li
              v-for="(file, fileIndex) in fileList"
              :key="file.uid || fileIndex"
              class="file-list"
            >
              <el-icon class="file-type-icon">
                <Document />
              </el-icon>
              <span>{{ file.name }}</span>
              <el-icon
                class="file-del-icon"
                @click="delFile(fileIndex)"
              >
                <Delete />
              </el-icon>
            </li>
          </ul>
        </div>

        <ul v-if="problemList.length" class="problem-list">
          <li v-for="(item, index) in problemList" :key="index">
            <el-popover
              placement="top-start"
              trigger="hover"
              popper-class="name-popover-self"
              :content="item.lines.join('、')"
            >
              <template #reference>
                <div class="ellipsis-text-name">{{ item.problem }}</div>
              </template>
            </el-popover>
          </li>
        </ul>
      </template>
    </tips-modal>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import {
  Delete,
  Document,
  UploadFilled,
  WarningFilled,
} from '@element-plus/icons-vue';
import { ElMessage, genFileId } from 'element-plus';

import TipsModal from '@/components/tipsDialog/TipsModal.vue';
import { ossClientInfo } from '@/assets/js/static';
import { importInverter } from '@/api/modules/commonDataManage.js';

const props = defineProps({
  importFileFlg: {
    type: Boolean,
    default: false,
  },
});

const emits = defineEmits(['updateList', 'update:importFileFlg']);

const openTipsImportFileModal = ref(props.importFileFlg);
const fileList = ref([]);
const uploadRef = ref();
const isShowRequire = ref(false);
const problemList = ref([]);

const tipTitle = '导入数据';
const contentTip = ref('导入基于设备型号，相同设备型号会进行数据覆盖');

watch(
  () => props.importFileFlg,
  (val) => {
    openTipsImportFileModal.value = val;
  },
);

/**
 * 上传前拦截，只允许 xlsx / xls 文件。
 *
 * Element Plus 的 UploadRawFile 同时继承 File，因此这里可以直接读取
 * name 和 size；返回 false / Upload.LIST_IGNORE 都会阻止无效文件进入列表。
 */
const beforeUpload = (file) => {
  const type = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();

  if (type !== 'xlsx' && type !== 'xls') {
    ElMessage.error('请上传xlsx、xls格式文件');
    return false;
  }

  // 与上传区域提示保持一致，单个文件最大 500M。
  if (file.size / 1024 / 1024 > 500) {
    ElMessage.error('文件最大限制为500M');
    return false;
  }

  isShowRequire.value = false;
  return true;
};

// 超过 1 个文件时，保留最新选择的文件。
const handleExceed = (files) => {
  const file = files[0];
  if (!beforeUpload(file)) {
    return;
  }
  uploadRef.value?.clearFiles();
  file.uid = genFileId();
  uploadRef.value?.handleStart(file);
};

// 删除文件。
const delFile = (index) => {
  fileList.value.splice(index, 1);
  uploadRef.value?.clearFiles();
};

// 文件选择变化时，清除“请上传文件”的提示。
const handleChange = (uploadFile) => {
  if (uploadFile?.status !== 'ready' && uploadFile?.status !== 'uploading') {
    return;
  }
  if (fileList.value.length > 0) {
    isShowRequire.value = false;
  }
};

// 自定义上传逻辑：真正的导入在点击“确定上传数据”时执行。
const customRequest = (options) => {
  // 保留 Upload 的自定义上传入口，避免组件自行向 action 发起请求。
  options?.onSuccess?.({});
};

/**
 * 关闭弹窗或确认导入。
 *
 * val === true：提交当前文件；
 * val === false：清空当前状态并通知父组件关闭。
 */
const handleChangeClose = async (val) => {
  if (!val) {
    fileList.value = [];
    problemList.value = [];
    isShowRequire.value = false;
    openTipsImportFileModal.value = false;
    uploadRef.value?.clearFiles();
    emits('updateList');
    emits('update:importFileFlg', false);
    return;
  }

  if (fileList.value.length === 0) {
    isShowRequire.value = true;
    return;
  }

  const selectedFile = fileList.value[0];
  const rawFile = selectedFile.raw || selectedFile.originFileObj;

  if (!rawFile) {
    ElMessage.error('无法读取导入文件，请重新选择');
    return;
  }

  const formData = new FormData();
  formData.append('file', rawFile);

  isShowRequire.value = false;

  try {
    const res = await importInverter(formData);

    if (res.code !== 200) {
      return;
    }

    const failureNames = res.data?.failureNames || {};
    const failureKeys = Object.keys(failureNames);
    const isSuccess =
      failureKeys.length === 0 &&
      failureNames.constructor === Object;

    if (isSuccess) {
      problemList.value = [];
      fileList.value = [];
      uploadRef.value?.clearFiles();
      ElMessage.success('操作成功！');
      openTipsImportFileModal.value = false;
      emits('updateList');
      emits('update:importFileFlg', false);
    } else {
      problemList.value = showFileErrorInfo(failureNames);
    }
  } catch (error) {
    console.error(error);
  }
};

// 将相同错误信息合并，并记录对应的行号。
const showFileErrorInfo = (obj) => {
  const countMap = {};

  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) {
      continue;
    }

    const value = obj[key];
    if (countMap[value]) {
      countMap[value].count += 1;
      countMap[value].lines.push(key);
    } else {
      countMap[value] = {
        problem: value,
        count: 1,
        lines: [key],
      };
    }
  }

  return Object.values(countMap);
};

const downloadFile = (path) => {
  const url =
    path ||
    `https://whln-prod-public.${ossClientInfo.endPointShort}/template/%E9%80%86%E5%8F%98%E5%99%A8%E8%AE%BE%E5%A4%87%E5%BA%93%E6%A8%A1%E7%89%88.xlsx`;

  if (url) {
    window.open(url);
  }
};

defineExpose({});
</script>

<style scoped lang="scss">
.dialog-content {
  width: 100%;
}

.dialog-title {
  color: #21263f;
  font-size: 18px;
  font-weight: 500;
}

.content-add-upload {
  width: 100%;
  margin-top: 20px;

  :deep(.el-upload--picture-card) {
    width: 100%;
    height: 120px;
    margin: 0;
    border: 1px dashed #d9d9d9;
    border-radius: 4px;
  }
}

.upload-content {
  color: #606266;
}

.upload-description {
  margin-top: 8px;
  font-size: 14px;
}

.tuning-tip {
  display: flex;
  padding: 8px 0 5px;
  background: #fef1df;
  border-radius: 4px;
  margin-bottom: 20px;

  .success {
    color: #fe830f;
    flex: 0 0 auto;
    margin: 0 9px 0 12px;
  }

  .tuning-tip-title {
    color: #21263f;
    font-size: 14px;
    line-height: 22px;
  }
}

.tuning-example {
  color: #363b4d;
  font-size: 14px;
  line-height: 12px;
  margin-top: 20px;

  span {
    color: #036b64;
    cursor: pointer;
  }
}

.selected-file-list {
  margin: 8px 0 0;
  padding: 0;
}

.file-list {
  display: flex;
  align-items: center;
  min-height: 24px;
  list-style: none;

  span {
    overflow: hidden;
    margin: 0 5px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .file-type-icon {
    color: #3b82f6;
    flex: 0 0 auto;
  }

  .file-del-icon {
    color: #909399;
    cursor: pointer;
    flex: 0 0 auto;
    visibility: hidden;
  }

  &:hover {
    .file-del-icon {
      visibility: visible;
    }
  }
}

.content-add-tip {
  display: block;
  color: #ff3e3e;
  font-size: 12px;
  margin-top: 4px;
}

.problem-list {
  margin: 20px 0 0;
  padding: 0;

  li {
    width: 100%;
    box-sizing: border-box;
    padding: 10px 16px;
    background: #ffffff;
    border: 1px solid #e5e5e5;
    border-radius: 4px;
    color: #363b4d;
    font-size: 12px;
    line-height: 14px;
    list-style: none;
  }

  li + li {
    margin-top: 8px;
  }
}

.ellipsis-text-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>