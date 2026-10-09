<template>
    <div class="geology-data-import">
      <div class="import-card">
        <h2 class="page-title">{{ pageTitle }}</h2>
  
        <Upload
          v-model:defaultFiles="fileList"
          :fileTypes="uploadConfig.fileTypes"
          :fileSize="uploadConfig.fileSize"
          :maxCount="1"
          :isImmediatelyUpload="true"
          :disabled="isSubmitting"
          :fileTypeMessage="uploadConfig.fileTypeMessage"
          :fileSizeMessage="uploadConfig.fileSizeMessage"
          @upFileList="handleUpload"
        >
          <template #customBtn>
            <el-button type="primary" :loading="isSubmitting">
              点击上传
            </el-button>
          </template>
  
          <template #tip>
            <span>{{ uploadConfig.tip }}</span>
          </template>
        </Upload>
  
        <div v-if="uploadedFile" class="upload-success">
          已上传：{{ uploadedFile.fileName || uploadedFile.name }}
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import Upload from '@/components/upload/Upload.vue';
  import { addItem } from '@/api/modules/newAPI';
  
  const route = useRoute();
  const fileList = ref([]);
  const uploadedFile = ref(null);
  const isSubmitting = ref(false);
  
  const dataType = computed(() =>
    String(route.query.dataType || 'geology'),
  );
  
  const pageTitle = computed(() =>
    dataType.value === 'topographic' ? '添加地形数据' : '添加地勘数据',
  );
  
  const uploadConfig = computed(() => {
    if (dataType.value === 'topographic') {
      return {
        fileTypes: 'xlsx',
        fileSize: 200,
        fileTypeMessage: '目前仅支持 xlsx 格式',
        fileSizeMessage: '文件最大 200M',
        tip: '支持 xlsx 格式，文件最大 200M',
        dataCategory: 'TERRAIN',
        fileTypeTag: '场区地形图',
      };
    }
  
    return {
      fileTypes: 'pdf,doc,docx',
      fileSize: 200,
      fileTypeMessage: '目前仅支持 doc、docx、pdf 格式',
      fileSizeMessage: '文件最大 200M',
      tip: '支持 doc、docx、pdf 格式，文件最大 200M',
      dataCategory: 'TERRAIN',
      fileTypeTag: '地勘报告',
    };
  });
  
  const handleUpload = async (fileInfo) => {
    const aiProjectId = Number(route.query.aiProjectId);
    // if (!Number.isInteger(aiProjectId) || aiProjectId <= 0) {
    //   ElMessage.error('缺少关联 AI 项目 ID，无法保存文件');
    //   return;
    // }
  
    if (!fileInfo?.filePath) {
      ElMessage.error('文件上传成功，但未获取到存储路径');
      return;
    }
    console.log(fileInfo)
    return
    uploadedFile.value = fileInfo;
    fileList.value = [
      {
        ...fileInfo,
        name: fileInfo.fileName,
      },
    ];
  
    const fileSuffix = String(
      fileInfo.fileSuffix || fileInfo.suffix || '',
    )
      .replace('.', '')
      .toLowerCase();
  
    const reqDTO = {
      aiProjectId:1,
      dataCategory: uploadConfig.value.dataCategory,
      fileName: fileInfo.fileName || fileInfo.name || '',
      filePath: fileInfo.filePath,
      fileSuffix,
      fileTypeTag: uploadConfig.value.fileTypeTag,
      needParse: true,
    };
  
    isSubmitting.value = true;
    try {
      const res = await addItem(reqDTO);
      if (res?.code === 200) {
        ElMessage.success('文件上传并保存成功');
      } else {
        ElMessage.error(res?.msg || '文件信息保存失败');
      }
    } catch (error) {
      console.error('addItem failed:', error);
      ElMessage.error('文件已上传，但业务数据保存失败');
    } finally {
      isSubmitting.value = false;
    }
  };
  </script>
  
  <style scoped lang="scss">
  .geology-data-import {
    min-height: 100%;
    padding: 24px;
    background: #f5f7fa;
  }
  
  .import-card {
    min-height: 240px;
    padding: 28px 32px;
    background: #fff;
    border-radius: 6px;
  }
  
  .page-title {
    margin: 0;
    color: #303133;
    font-size: 20px;
    font-weight: 600;
  }
  
  .upload-success {
    margin-top: 16px;
    color: #67c23a;
    font-size: 14px;
  }
  </style>