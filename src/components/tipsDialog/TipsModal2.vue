<template>
    <div class="tips-modal-content">
        <a-modal
            v-model:open="open"
            class="tips-modal"
            :width="width"
            :getContainer="getContainer"
            @ok="handleOk(true)"
        >
            <template #title>
                <template v-if="$slots.customTitle">
                    <slot name="customTitle"></slot>
                </template>

                <div class="modal-title-content" v-else>
                    <iconpark-icon
                        name="jinggao"
                        size="22"
                        :class="tipTypes[tipType]"
                    ></iconpark-icon>

                    <span class="modal-title">
                        {{ title }}
                    </span>
                </div>
            </template>

            <slot
                v-if="$slots.contentBody"
                name="contentBody"
            ></slot>

            <template #footer>
                <template v-if="$slots.footerSlot">
                    <slot name="footerSlot"></slot>
                </template>

                <div
                    v-else
                    class="footer-content"
                >
                    <div
                        v-if="showCancel"
                        class="footer-btn-cancel"
                        @click="handleCancel"
                    >
                        {{ cancelText }}
                    </div>

                    <div
                        class="footer-btn-ok"
                        :class="btnClassName"
                        @click="handleOk(true)"
                    >
                        {{ okText }}
                    </div>
                </div>
            </template>
        </a-modal>
    </div>
</template>

<script setup>
import { computed } from 'vue';

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
});

const emit = defineEmits([
    'update:openTipsModal',
    'handleChangeFileModal',
]);

const tipTypes = {
    success: 'success',
    danger: 'danger',
    normal: 'normal',
};

const btnClassName = computed(() => {
    if (props.tipType === 'success') {
        return 'footer-btn-success';
    }

    if (props.tipType === 'danger') {
        return 'footer-btn-danger';
    }

    return 'footer-btn-normal';
});

/**
 * 处理右上角 × 和遮罩层关闭
 *
 * 这里的 value 会是 false。
 * 直接同步父组件，不使用 ! 状态反转。
 */
const open = computed({
    get() {
        return props.openTipsModal;
    },

    set(value) {
        emit('update:openTipsModal', value);

        if (!value) {
            emit('handleChangeFileModal', false);
        }
    },
});

/**
 * 点击底部取消按钮
 */
const handleCancel = () => {
    emit('update:openTipsModal', false);
    emit('handleChangeFileModal', false);
};

/**
 * 点击确定按钮
 *
 * true 只代表业务上的“确定”操作，
 * 不在这里 emit update，避免把弹窗重新设置为 true。
 */
const handleOk = (value) => {
    emit('handleChangeFileModal', value);
};

const getContainer = () => {
    return document.querySelector('.tips-modal-content');
};
</script>

<style scoped lang="scss">
.tips-modal-content {
    :deep(.ant-modal-body) {
        .modalTip {
            font-size: 14px;
            color: #363b4d;
            line-height: 26px;
            margin: 16px 0 0 16px;
        }

        .modalTip-memo {
            margin: 5px 16px;
            font-size: 12px;
            display: block;
            color: #7c8294;
        }
    }
}

.tips-modal {
    .modal-title-content {
        display: flex;
        align-items: center;

        .modal-title {
            font-size: 16px;
            font-weight: bold;
            color: #070d2f;
            line-height: 16px;
            margin-left: 8px;
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

    .footer-content {
        display: flex;
        justify-content: flex-end;
        line-height: 32px;
        font-size: 14px;
        text-align: center;
    }

    .footer-btn-cancel,
    .footer-btn-ok {
        min-width: 88px;
        padding: 0 10px;
        height: 32px;
        border-radius: 4px;
        cursor: pointer;
    }

    .footer-btn-cancel {
        background: #ffffff;
        border: 1px solid #d2d5e1;
        color: #363b4d;
    }

    .footer-btn-ok {
        margin-left: 16px;
    }

    .footer-btn-success {
        background: #036b64;
        color: #fff;
    }

    .footer-btn-danger {
        background: #fc5f55;
        color: #fff;
    }

    .footer-btn-normal {
        background: #ff8411;
        color: #fff;
    }
}
</style>