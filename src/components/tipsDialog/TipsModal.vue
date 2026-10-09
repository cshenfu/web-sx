<template>
    <div class="tips-modal-content">
      <el-dialog
        class="tips-modal"
        :model-value="props.openTipsModal"
        :width="props.width"
        :close-on-click-modal="false"
        @update:model-value="handleVisibleChange"
      >
        <template #header>
          <template v-if="$slots.customTitle">
            <slot name="customTitle" />
          </template>
  
          <div v-else class="modal-title-content">
            <iconpark-icon
              name="jinggao"
              size="22"
              :class="tipTypes[props.tipType]"
            />
            <span class="modal-title">{{ props.title }}</span>
          </div>
        </template>
  
        <slot v-if="$slots.contentBody" name="contentBody" />
  
        <template #footer>
          <template v-if="$slots.footerSlot">
            <slot name="footerSlot" />
          </template>
  
          <div v-else class="footer-content">
            <div
              v-if="props.showCancel"
              class="footer-btn-cancel"
              @click="handleOk(false)"
            >
              {{ props.cancelText }}
            </div>
            <div
              class="footer-btn-ok"
              :class="btnClassName"
              @click="handleOk(true)"
            >
              {{ props.okText }}
            </div>
          </div>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  
  const props = defineProps({
    width: {
      type: String,
      default: '418px',
    },
    title: {
      type: String,
      default: '',
    },
    openTipsModal: {
      type: Boolean,
      default: false,
    },
    tipType: {
      type: String,
      default: 'danger',
    },
    cancelText: {
      type: String,
      default: '取消',
    },
    okText: {
      type: String,
      default: '确定',
    },
    showCancel: {
      type: Boolean,
      default: true,
    },
  })
  
  const emit = defineEmits([
    'handleChangeFileModal',
    'update:openTipsModal',
  ])
  
  const tipTypes = {
    success: 'success',
    danger: 'danger',
    normal: 'normal',
  }
  
  const btnClassName = computed(() => {
    if (tipTypes[props.tipType] === 'success') {
      return 'footer-btn-success'
    }
  
    if (tipTypes[props.tipType] === 'danger') {
      return 'footer-btn-danger'
    }
  
    return 'footer-btn-normal'
  })
  
  function handleVisibleChange(value) {
    emit('update:openTipsModal', value)
  
    if (!value) {
      emit('handleChangeFileModal', false)
    }
  }
  
  function handleOk(value) {
    emit('handleChangeFileModal', value)
  
    if (!value) {
      emit('update:openTipsModal', false)
    }
  }
  </script>
  
  <style scoped lang="scss">
  .tips-modal-content {
    :deep(.el-dialog__body) {
      .modalTip {
        margin: 16px 0 0 16px;
        color: #363b4d;
        font-size: 14px;
        line-height: 26px;
      }
  
      .modalTip-memo {
        display: block;
        margin: 5px 16px;
        color: #7c8294;
        font-size: 12px;
      }
    }
  }
  
  .tips-modal {
    :deep(.el-dialog__header) {
      margin-right: 0;
      padding-bottom: 8px;
    }
  
    :deep(.el-dialog__title) {
      display: none;
    }
  
    .modal-title-content {
      display: flex;
      align-items: center;
  
      .modal-title {
        margin-left: 8px;
        color: #070d2f;
        font-size: 16px;
        font-weight: bold;
        line-height: 16px;
      }
  
      .success {
        color: #036b64;
      }
  
      .danger {
        color: #fc5f55;
      }
  
      .normal {
        color: #ff8411;
      }
    }
  
    .tuning-form {
      margin-top: 20px;
    }
  
    .tip-form-item {
      margin-left: 10px;
    }
  
    .footer-content {
      display: flex;
      justify-content: flex-end;
      font-size: 14px;
      line-height: 32px;
      text-align: center;
    }
  
    .footer-btn-cancel,
    .footer-btn-ok {
      min-width: 88px;
      height: 32px;
      padding: 0 10px;
      border-radius: 4px;
      cursor: pointer;
    }
  
    .footer-btn-cancel {
      color: #363b4d;
      background: #fff;
      border: 1px solid #d2d5e1;
    }
  
    .footer-btn-ok {
      margin-left: 16px;
      font-size: 14px;
    }
  
    .footer-btn-success {
      color: #fff;
      background: #036b64;
    }
  
    .footer-btn-danger {
      color: #fff;
      background: #fc5f55;
    }
  
    .footer-btn-normal {
      color: #fff;
      background: #ff8411;
    }
  }
  </style>