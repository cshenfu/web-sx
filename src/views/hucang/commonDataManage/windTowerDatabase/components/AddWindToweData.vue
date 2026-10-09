<template>
    <div class="content-add">
      <!-- TipsModal 是项目自定义组件，继续保留 -->
      <tips-modal
        :width="'490px'"
        :tipType="'success'"
        class="tip-content-modal"
        :okText="'保存'"
        v-model:openTipsModal="openTipsGeologyModal"
        @handleChangeFileModal="handleChangeSortModal"
      >
        <template #customTitle>{{ tipTitle }}</template>
  
        <template #contentBody>
          <p class="content-add-title">
            <span>*</span>
            测风塔数据上传
          </p>
  
          <el-upload
            ref="uploadRef"
            v-model:file-list="fileList"
            class="content-add-upload"
            accept=".txt"
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
              <div class="upload-itp">上传数据</div>
              <div class="upload-description">
                目前支持 txt 格式，最多上传1个文件，文件最大500M
              </div>
            </div>
          </el-upload>
  
          <span v-show="isShowRequire" class="content-add-tip">
            请上传测风塔数据文件
          </span>
  
          <ul v-if="fileList.length" class="file-list-wrapper">
            <li
              v-for="(file, fileIndex) in fileList"
              :key="file.uid || fileIndex"
              class="file-list-li"
            >
              <div class="file-list">
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
              </div>
              <el-progress
                :percentage="Number(file.processTotal || 0)"
                :show-text="false"
                :stroke-width="4"
                :color="progressColor"
              />
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
  } from '@element-plus/icons-vue';
  import { ElMessage, genFileId } from 'element-plus';
  import mitt from '@/utils/eventBus';
  
  import TipsModal from '@/components/tipsDialog/TipsModal.vue';
  import { addWindTower } from '@/api/modules/commonDataManage';
  import { useOssUpload } from '@/components/ossClient/index';
  
  const props = defineProps({
    openModal: {
      type: Boolean,
      default: false,
    },
  });
  
  const emit = defineEmits(['update:openModal', 'uploadList']);
  
  const openTipsGeologyModal = ref(props.openModal);
  const uploadRef = ref();
  const obsUpload = useOssUpload();
  const fileUploadResult = ref([]);
  const fileList = ref([]);
  const tipTitle = ref('新增数据');
  const isShowRequire = ref(false);
  
  const progressColor = (percentage) => {
    return percentage >= 100 ? '#036b64' : '#9AC4C1';
  };
  
  watch(
    () => props.openModal,
    (value) => {
      openTipsGeologyModal.value = value;
    },
  );
  
  const beforeUpload = (file) => {
    const type = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();
  
    if (type !== 'txt') {
      ElMessage.error('请上传txt格式文件');
      return false;
    }
  
    if (file.size / 1024 / 1024 > 500) {
      ElMessage.error('文件最大限制为500M');
      return false;
    }
  
    isShowRequire.value = false;
    return true;
  };
  
  const handleExceed = (files) => {
    const file = files[0];
  
    if (!beforeUpload(file)) {
      return;
    }
  
    uploadRef.value?.clearFiles();
    file.uid = genFileId();
    uploadRef.value?.handleStart(file);
  };
  
  const delFile = (index) => {
    fileList.value.splice(index, 1);
    fileUploadResult.value = [];
    uploadRef.value?.clearFiles();
  };
  
  const handleChange = (uploadFile) => {
    if (
      (uploadFile?.status === 'ready' || uploadFile?.status === 'uploading') &&
      fileList.value.length
    ) {
      isShowRequire.value = false;
    }
  };
  
  const customRequest = async (options) => {
    const currentFile = fileList.value.find(
      (item) => item.uid === options.file.uid,
    );
  
    const stopProgressWatch = watch(
      obsUpload.processSize,
      (value) => {
        if (currentFile) {
          currentFile.processTotal = value;
        }
      },
      { immediate: true },
    );
  
    try {
      const fileResult = await obsUpload.uploadFile(options.file);
  
      if (currentFile) {
        currentFile.processTotal = obsUpload.processSize.value;
      }
  
      fileUploadResult.value = [
        ...fileUploadResult.value,
        {
          ...fileResult,
          name: options.file.name,
        },
      ];
      options.onSuccess?.(fileResult);
    } catch (error) {
      options.onError?.(error);
      ElMessage.error('文件上传失败');
    } finally {
      stopProgressWatch();
    }
  };
  
  // 获取上传后的文件路径并保存测风塔数据。
  const handleChangeSortModal = async (value) => {
    if (!value) {
      fileList.value = [];
      fileUploadResult.value = [];
      isShowRequire.value = false;
      emit('update:openModal', false);
      return;
    }
  
    if (!fileList.value.length || !fileUploadResult.value.length) {
      isShowRequire.value = true;
      return;
    }
  
    const data = {
      filePath: fileUploadResult.value[0].obsPath,
    };
  
    try {
      const res = await addWindTower(data);
  
      if (res.code === 200) {
        ElMessage.success('上传成功');
        fileList.value = [];
        fileUploadResult.value = [];
        isShowRequire.value = false;
        emit('update:openModal', false);
        mitt.emit('uploadList');
      } else {
        ElMessage.error('上传失败');
      }
    } catch (error) {
      console.error('保存测风塔数据失败', error);
      ElMessage.error('上传失败');
    }
  };
  </script>
  
  <style scoped lang="scss">
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
    text-align: center;
  }
  
  .upload-description {
    margin-top: 4px;
    font-size: 14px;
  }
  
  .file-list-wrapper {
    margin: 8px 0 0;
    padding: 0;
  }
  
  .file-list-li {
    list-style: none;
  
    :deep(.el-progress) {
      margin-top: 4px;
    }
  
    .file-list {
      display: flex;
      align-items: center;
  
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
        margin-left: 5px;
        visibility: hidden;
      }
  
      &:hover {
        .file-del-icon {
          visibility: visible;
        }
      }
    }
  }
  
  .content-add-title {
    color: #363b4d;
    font-size: 14px;
    line-height: 12px;
  
    span {
      margin-right: 5px;
      color: #ff3e3e;
    }
  }
  
  .content-add-tip {
    color: #ff3e3e;
    font-size: 12px;
  }
  
  .upload-itp {
    color: #7c8294;
    font-size: 14px;
    font-weight: 500;
    line-height: 14px;
  }
  </style>