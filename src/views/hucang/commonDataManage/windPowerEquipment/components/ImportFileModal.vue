<template>
    <div class="import-file-modal">
      <el-dialog
        v-model="open"
        :width="width"
        title="导入文件"
        class="tip-content-modal"
        :close-on-click-modal="false"
        append-to-body
      >
        <slot name="contentBodyHead" />
  
        <slot name="contentBody">
          <template v-if="!computedProblemList.length">
            <el-upload
              ref="uploadRef"
              v-model:file-list="fileList"
              class="content-add-upload"
              name="file"
              action="#"
              :accept="acceptValue"
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
                <div class="upload-description">{{ importFileMemo }}</div>
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
          </template>
  
          <ul v-if="computedProblemList.length" class="problem-list">
            <li v-for="(item, index) in computedProblemList" :key="index">
              <el-popover
                placement="top-start"
                trigger="hover"
                popper-class="name-popover-self name-popover-self-large"
                :content="item.lines.join('、')"
              >
                <template #reference>
                  <div class="ellipsis-text-name">{{ item.problem }}</div>
                </template>
              </el-popover>
            </li>
          </ul>
        </slot>
  
        <template #footer>
          <el-button @click="handleChangeClose(false)">取消</el-button>
          <el-button type="primary" @click="handleChangeClose(true)">
            确定上传
          </el-button>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script setup>
  import { computed, ref } from 'vue';
  import {
    Delete,
    Document,
    UploadFilled,
  } from '@element-plus/icons-vue';
  import { ElMessage, genFileId } from 'element-plus';
  
  const props = defineProps({
    importFileFlg: {
      type: Boolean,
      default: false,
    },
    width: {
      type: String,
      default: '500px',
    },
    importFileMemo: {
      type: String,
      default: '',
    },
    fileTypes: {
      type: Array,
      default: () => [],
    },
    problemList: {
      type: [Array, Object],
      default: () => [],
    },
  });
  
  const emit = defineEmits([
    'update:importFileFlg',
    'updateFIleData',
    'update:problemList',
  ]);
  
  const uploadRef = ref();
  const fileType = ref('');
  const fileList = ref([]);
  const isShowRequire = ref(false);
  
  const acceptValue = computed(() =>
    props.fileTypes
      .map((type) => (String(type).startsWith('.') ? type : `.${type}`))
      .join(','),
  );
  
  const open = computed({
    get: () => props.importFileFlg,
    set: (value) => {
      emit('update:importFileFlg', value);
  
      if (!value) {
        resetFileState();
      }
    },
  });
  
  const computedProblemList = computed(() => {
    if (Array.isArray(props.problemList) && props.problemList.length > 0) {
      return props.problemList;
    }
  
    if (
      props.problemList &&
      typeof props.problemList === 'object' &&
      Object.keys(props.problemList).length > 0
    ) {
      return showFileErrorInfo(props.problemList);
    }
  
    return [];
  });
  
  const beforeUpload = (file) => {
    fileType.value = file.name
      .substring(file.name.lastIndexOf('.') + 1)
      .toLowerCase();
  
    const normalizedFileTypes = props.fileTypes.map((type) =>
      String(type).replace(/^\./, '').toLowerCase(),
    );
    const isHasFileFlag = normalizedFileTypes.includes(fileType.value);
  
    if (!isHasFileFlag) {
      const types = props.fileTypes.join('、');
      ElMessage.error(`请上传${types}格式文件`);
      return false;
    }
  
    if (file.size / 1024 / 1024 > 100) {
      ElMessage.error('文件最大限制为100M');
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
  };
  
  const handleChange = (uploadFile) => {
    if (
      (uploadFile?.status === 'ready' || uploadFile?.status === 'uploading') &&
      fileList.value.length
    ) {
      isShowRequire.value = false;
    }
  };
  
  const customRequest = (options) => {
    options?.onSuccess?.({});
  };
  
  const resetFileState = () => {
    fileList.value = [];
    fileType.value = '';
    isShowRequire.value = false;
    uploadRef.value?.clearFiles();
    emit('update:problemList', []);
  };
  
  const handleChangeClose = (value) => {
    if (value) {
      if (!fileList.value.length) {
        isShowRequire.value = true;
        return;
      }
  
      emit('updateFIleData', {
        fileList: fileList.value,
        fileType: fileType.value,
      });
      isShowRequire.value = false;
      emit('update:problemList', []);
      return;
    }
  
    open.value = false;
  };
  
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
  
  defineExpose({});
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
    margin-top: 8px;
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
    color: #ff3e3e;
    font-size: 12px;
  }
  
  .problem-list {
    max-height: 50vh;
    overflow-y: auto;
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