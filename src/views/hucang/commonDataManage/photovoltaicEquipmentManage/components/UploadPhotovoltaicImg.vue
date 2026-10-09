<template>
    <div class="import-file-modal">
      <!-- TipsModal 是项目自定义组件，继续保留 -->
      <tips-modal
        :width="'490px'"
        :showCancel="false"
        title="上传文件"
        :tipType="'success'"
        class="tip-content-modal"
        v-model:openTipsModal="openTipsImportFileModal"
        @handleChangeFileModal="handleChangeClose"
      >
        <template #customTitle>{{ tipTitle }}</template>
  
        <template #contentBody>
          <div class="tuning-tip">
            <el-icon class="success" :size="18">
              <WarningFilled />
            </el-icon>
            <span class="tuning-tip-title">
              支持上传图片格式 jpg、png，不超过5M
            </span>
          </div>
  
          <el-form
            ref="imgFormRef"
            :model="formState"
            :rules="rules"
            class="image-form"
            autocomplete="off"
          >
            <el-form-item label="光伏件结构图" prop="inverterImg">
              <div class="flex-horizontal">
                <upload-img
                  ref="uploadInverterImg"
                  :maxFileLength="1"
                />
              </div>
            </el-form-item>
  
            <el-form-item label="组件特性曲线图" prop="photovoltaicImg">
              <div class="flex-horizontal">
                <upload-img
                  ref="uploadPhotovoltaicImg"
                  :maxFileLength="1"
                />
              </div>
            </el-form-item>
          </el-form>
        </template>
  
        <template #footerSlot>
          <div class="footer-content">
            <div class="footer-btn-ok" @click="handleChangeClose(true)">
              上传
            </div>
          </div>
        </template>
      </tips-modal>
    </div>
  </template>
  
  <script setup>
  import { computed, onBeforeMount, onMounted, ref, watch } from 'vue';
  import { WarningFilled } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';
  
  import TipsModal from '@/components/tipsDialog/TipsModal.vue';
  import UploadImg from '@/components/uploadImg/uploadImg.vue';
  import {
    getPvComponentDetail,
    uploadPvComponentImg,
  } from '@/api/modules/commonDataManage';
  import { regexObsPath } from '@/utils/regular';
  import { ossClientInfo } from '@/assets/js/static.js';
  
  const props = defineProps({
    upLoadImgFlg: {
      type: Boolean,
      default: false,
    },
    chooseDataId: {
      type: Number,
    },
  });
  
  const emits = defineEmits(['update:upLoadImgFlg', 'updateList']);
  
  const openTipsImportFileModal = ref(props.upLoadImgFlg);
  const tipTitle = '上传图片';
  const imgFormRef = ref(null);
  const uploadPhotovoltaicImg = ref(null);
  const uploadInverterImg = ref(null);
  const formState = ref({
    photovoltaicImg: [],
    inverterImg: [],
  });
  
  const validateLogo = async (rule) => {
    const isPhotovoltaic = rule?._selfType === 'photovoltaicImg';
    const uploadRef = isPhotovoltaic
      ? uploadPhotovoltaicImg.value
      : uploadInverterImg.value;
    const message = isPhotovoltaic ? '光伏组件结构图' : '组件特性曲线图';
    const data = uploadRef?.getData?.() || [];
  
    if (data.length) {
      return Promise.resolve();
    }
  
    return Promise.reject(`请选择要上传的${message}`);
  };
  
  const isDisabled = computed(() => {
    const photovoltaicData = uploadPhotovoltaicImg.value?.getData?.() || [];
    const inverterData = uploadInverterImg.value?.getData?.() || [];
    return photovoltaicData.length || inverterData.length;
  });
  
  watch(
    () => props.upLoadImgFlg,
    (value) => {
      openTipsImportFileModal.value = value;
    },
  );
  
  const rules = {
    photovoltaicImg: [
      {
        required: false,
        trigger: 'change',
        _selfType: 'photovoltaicImg',
        validator: validateLogo,
      },
    ],
    inverterImg: [
      {
        required: false,
        trigger: 'change',
        _selfType: 'inverterImg',
        validator: validateLogo,
      },
    ],
  };
  
  const getObjectPath = (filePath) => {
    const matchResult = filePath?.match(regexObsPath);
    return matchResult?.[1] || '';
  };
  
  const handleChangeClose = async (value) => {
    if (!value) {
      emits('update:upLoadImgFlg', false);
      return;
    }
  
    const componentCharacteristicCurveDiagram =
      uploadPhotovoltaicImg.value?.getData?.() || [];
    const structuralDiagramComponents =
      uploadInverterImg.value?.getData?.() || [];
  
    const data = {
      id: props.chooseDataId,
      componentCharacteristicCurveDiagram: getObjectPath(
        componentCharacteristicCurveDiagram[0]?.filePath,
      ),
      structuralDiagramComponents: getObjectPath(
        structuralDiagramComponents[0]?.filePath,
      ),
    };
  
    try {
      const res = await uploadPvComponentImg(data);
  
      if (res.code === 200 && res.data) {
        ElMessage.success('上传成功！');
        imgFormRef.value?.clearValidate();
        emits('update:upLoadImgFlg', false);
        emits('updateList');
      }
    } catch (error) {
      console.error('上传图片失败', error);
    }
  };
  
  const getDetailInfo = async () => {
    try {
      const res = await getPvComponentDetail(props.chooseDataId);
  
      if (res.code !== 200 || !res.data) {
        return;
      }
  
      const cCompeleteUrl = res.data.componentCharacteristicCurveDiagram
        ? `https://${ossClientInfo.bucketname}.${ossClientInfo.endPointShort}${res.data.componentCharacteristicCurveDiagram}`
        : '';
      const sCompeleteUrl = res.data.structuralDiagramComponents
        ? `https://${ossClientInfo.bucketname}.${ossClientInfo.endPointShort}${res.data.structuralDiagramComponents}`
        : '';
  
      if (cCompeleteUrl) {
        uploadPhotovoltaicImg.value?.updateFileData?.([cCompeleteUrl]);
      }
  
      if (sCompeleteUrl) {
        uploadInverterImg.value?.updateFileData?.([sCompeleteUrl]);
      }
    } catch (error) {
      console.error('获取光伏组件图片详情失败', error);
    }
  };
  
  onBeforeMount(() => {
    sessionStorage.setItem('obsPath', 'pv-moduleDevice/');
  });
  
  onMounted(async () => {
    await getDetailInfo();
  });
  
  defineExpose({
    isDisabled,
    rules,
  });
  </script>
  
  <style scoped lang="scss">
  .image-form {
    :deep(.el-form-item__content) {
      width: 100%;
    }
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
  
  .flex-horizontal {
    display: flex;
    align-items: center;
  }
  
  .footer-content {
    display: flex;
    justify-content: flex-end;
    color: #fff;
    font-size: 14px;
    line-height: 32px;
    text-align: center;
  }
  
  .footer-btn-ok {
    min-width: 88px;
    height: 32px;
    padding: 0 10px;
    background: #036b64;
    border-radius: 4px;
    cursor: pointer;
  }
  </style>