<template>
    <div class="tips-modal-content">
        <a-modal
            v-bind="$attrs"
            v-model:open="open"
            @ok="handleOk(true)"
            class="tips-modal" 
            :width="width"  
            :getContainer="getContainer">
                <template #title>
                    <template v-if="$slots.customTitle">
                    <slot name="customTitle"></slot>
                    </template>
                    <div class="modal-title-content" v-else>
                        <iconpark-icon name="jinggao" size="22" :class="tipTypes[tipType]"></iconpark-icon>
                        <span class="modal-title">{{ title }}</span>
                    </div>
                </template>
                <slot></slot>
                <template #footer>
                    <div class="footer-content">
                        <div class="footer-btn-cancel"  @click="handleOk(false)">{{ cancelText }}</div>
                        <div class="footer-btn-ok" :class="btnClassName" @click="handleOk(true)">{{ okText }}</div>
                    </div>
            </template>
        </a-modal>
    </div>
</template>

<script setup>
import { ref, reactive, toRefs, onBeforeMount, onMounted, watchEffect, computed } from 'vue';
const props = defineProps({
    width:{
        type:String,
        default:'418px'
    },
    title:{
        type:String,
    },
    openTipsModal: {
        type: Boolean,
        default: false,
    },
    tipType:{
        type: String,
        default: 'danger'
    },
    cancelText: {
        type: String,
        default: '取消'
    },
    okText: {
        type: String,
        default: '确定'
    }
})
const open = computed({
  get() {
    return props.openTipsModal
  },
  set(value) {
    emit('handleChangeFileModal',value)
  }
})
const  tipTypes = {
    'success':'success',
    'danger':'danger',
    'normal':'normal'
}
const btnClassName = computed(()=>{
    let result = tipTypes[props.tipType] ==='success' ? 
    'footer-btn-success' : tipTypes[props.tipType] ==='danger'?
    'footer-btn-danger':'footer-btn-normal'
    return result
})
const emit = defineEmits(['handleChangeFileModal'])

// 关闭
const handleOk = (val) => {
    emit('handleChangeFileModal',val)
}
const  getContainer = ()=> {
    return document.querySelector('body');
  }
</script>
<style scoped lang='scss'>
.tips-modal-content {
    :deep(.ant-modal-body){

        .modalTip {
            font-size: 14px;
            color: #363B4D;
            line-height: 26px;
            margin: 16px 0 0 16px;
        }
    }
}
.tips-modal {

    .modal-title-content{
        display: flex;
        align-items: center;
        .modal-title {
            font-size: 16px;
            font-weight: 500;
            color: #070D2F;
            line-height: 16px;
            margin-left: 8px;
        }
        .success {
            color: #0389EA;
        }
        .danger{
            color: #FC5F55;
        }
        .normal {
            color: #FF8411;
        }

    }
    .footer-content {
        display: flex;
        justify-content: flex-end;
        line-height: 32px;
        font-size: 14px;
        text-align: center;
    }
    .footer-btn-cancel {
        width: 60px;
        height: 32px;
        background: #FFFFFF;
        border-radius: 2px;
        border: 1px solid #D2D5E1;
        color: #363B4D;
        cursor: pointer;

    }
    .footer-btn-ok{
        width: 88px;
        height: 32px;
        border-radius: 2px;
        font-size: 14px;
        margin-left: 16px;
        cursor: pointer;
    }
    .footer-btn-success {
        background: #0389EA;
        color: #fff;
    }
    .footer-btn-danger {
        background: #FF3E3E;
        color: #fff;
    }
    .footer-btn-normal {
        background: #FF8411;
        color: #fff;
    }
    

}

</style>