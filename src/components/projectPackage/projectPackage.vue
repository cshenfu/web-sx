<template>
    <a-modal :width="418" v-model:open="props.TipsDialogVisible" :footer="null" @cancel="cancelEvent">
        <slot name="title">
            <span class="model-title-info">
                <iconpark-icon
                    :class="messageInfoData[props.messageType]['type']"
                    size="22"
                    name="jinggao"
                ></iconpark-icon>
                {{ messageInfoData[props.messageType]['title'] }}
            </span>
        </slot>

        <p class="model-content">{{ messageInfoData[props.messageType]['describe'] }}</p>
        <p class="model-content model-content-desc">
            <!-- <div class="manage-user">
                <iconpark-icon name="kehujingli" ></iconpark-icon>
                <i>您的客户经理：</i> {{ customInfos?.name }} {{ customInfos?.phone }}
            </div> -->
            <div class="manage-user">
                <iconpark-icon name="pingtaikefu"></iconpark-icon>
                <i>平台客服： 155-6259-8617</i>
            </div>
        </p>
        <slot name="footer">
            <p align="right">
                <a-button type="primary" warning
                    :style="{
                        background:
                            messageInfoData[messageType]['type'] == 'success'
                                ? '#0389EA'
                                : '#FE830F',
                        color: '#ffffff',
                        boxShadow: 'none'
                    }"
                    @click.stop="emits('changeShowKey')"
                    >我知道了</a-button
                >
            </p>
        </slot>
    </a-modal>
</template>
<script setup>
    import { ref, onMounted, watch } from 'vue';
    const props = defineProps({
        TipsDialogVisible: {
            type: Boolean,
            default: false,
        },
        messageType: {
            type: Number,
            default: 1,
        },
    });
    const emits = defineEmits(['changeShowKey'])
    const customInfos = ref();
    const cancelEvent = () => {
        emits('changeShowKey');
    }
    // const messageInfoData = {
    //     1: {
    //         type: 'warning',
    //         title: '服务续费提醒',
    //         describe:
    //             '您的服务已到期，需重新购买后才能使用，请联系您的客户经理或平台客服进行服务购买',
    //     },
    //     2: {
    //         type: 'success',
    //         title: '服务购买提示',
    //         describe: '您未购买此功能的服务，请联系您的客户经理或平台客服进行服务购买',
    //     },
    //     3: {
    //         type: 'success',
    //         title: '提示',
    //         describe: '当前功能受限访问，请联系您的客户经理或平台客服解除功能限制',
    //     },
    //     4: {
    //         type: 'warning',
    //         title: '服务续费提示',
    //         describe:
    //             '您的服务次数已消耗完，需重新购买才能使用，请联系您的客户客服或平台客户进行服务购买',
    //     },
    //     5: {
    //         type: 'warning',
    //         title: '试用期到期提示',
    //         describe: '您的试用期会员服务已到期，请联系您的客户经理或平台客服进行服务购买',
    //     },
    // };
    const messageInfoData = {
        1: {
            type: 'warning',
            title: '服务续费提醒',
            describe:
                '您的服务已到期，需重新购买后才能使用，请联系平台客服进行服务购买',
        },
        2: {
            type: 'success',
            title: '服务购买提示',
            describe: '您未购买此功能的服务，请联系平台客服进行服务购买',
        },
        3: {
            type: 'success',
            title: '提示',
            describe: '当前功能受限访问，请联系平台客服解除功能限制',
        },
        4: {
            type: 'warning',
            title: '服务续费提示',
            describe:
                '您的服务次数已消耗完，需重新购买才能使用，请联系平台客服进行服务购买',
        },
        5: {
            type: 'warning',
            title: '试用期到期提示',
            describe: '您的试用期会员服务已到期，请联系平台客服进行服务购买',
        },
    };
    onMounted(() => {
        if (sessionStorage.getItem('customerInfo')) {
            customInfos.value = JSON.parse(sessionStorage.getItem('customerInfo'));
        }
    });
    watch(
        [()=>props.messageType],
        ([oldOpen, newOpen], [oldType, newType]) => {
            // TipsDialogVisible.value = newOpen;
        },
        {
            deep: true,
            immediate: true,
        },
    );
</script>
<style scoped lang="scss">
    $primary-color: #0389EA;

    .align-center {
        text-align: center;
        color: #363b4d;
        height: calc(100vh - 94px);
        background: url(../../assets/img/index/index-bg.png) no-repeat;
        background-position: center;
        // background-size: 100%;
        background-size: cover;
        overflow: hidden;
        > h2 {
            font-size: 24px;
            font-weight: 600;
            color: #363b4d;
            margin: 40px auto 34px auto;
            display: flex;
            justify-content: center;
            align-items: center;
            span {
                margin: 0 8px;
            }
            img {
                height: 20px;
            }
        }
        > h4 {
            display: flex;
            align-items: center;
            justify-content: center;
            span {
                flex: none;
                width: 62px;
                height: 28px;
                background: #cde1e0;
                border-radius: 2px;
                line-height: 28px;
                text-align: center;
                color: $primary-color;
                font-size: 14px;
                font-weight: 500;
                margin: 0 12px;
            }
        }
        .flex-horizontal {
            display: flex;
            justify-content: center;
            margin-top: 60px;
            > div {
                margin: 0 20px;
                flex: none;
                width: 330px;
                height: 310px;
                border: 2px solid #ffffff;
                border-radius: 6px;
                transition: all linear 0.3s;
                // background: url(../../assets/img/index/item-bg.png) no-repeat;
                background: rgba($color: #ffffff, $alpha: 0.7);
                background-size: 390px 368px;
                background-position: -32px -30px;
                box-shadow: 0px 2px 25px 0px rgba(27, 51, 112, 0.1);
                @media screen and (max-width: 1280px) {
                    width: 292px;
                }
                &:hover {
                    border-color: $primary-color;
                }

                h4 {
                    font-size: 20px;
                    font-weight: 600;
                    margin-top: 40px;
                }

                h6 {
                    display: inline-block;
                    height: 22px;
                    line-height: 22px;
                    background: #cde1e0;
                    font-weight: normal;
                    border-radius: 2px;
                    font-size: 14px;
                    margin: 26px auto;
                    padding: 0 12px;
                }

                p {
                    font-size: 14px;
                    color: #7c8294;
                }
                button {
                    margin: 40px auto 30px auto;
                    width: 200px;
                    height: 44px;
                    border: none;
                    background: linear-gradient(90deg, #3fafa8 0%, #0389EA 100%);
                    box-shadow: 0px 5px 18px 0px #9ac4c1;
                    border-radius: 22px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    &.close-button {
                        cursor: not-allowed;
                    }
                    img {
                        height: 16px;
                        margin-left: 5px;
                    }
                }
            }
        }
    }
    .model-title-info {
        display: flex;
        align-items: center;
        font-size: 16px;
        font-weight: 500;
        color: #070d2f;
        iconpark-icon {
            margin-right: 8px;
            &.warning {
                color:  var(--theme);
            }
            &.success {
                color:  var(--theme);
            }
        }
    }
    .model-content {
        margin-top: 16px;
        margin: 16px 30px 0 30px;
        color: #363b4d;
        line-height: 26px;
        font-size: 14px;
        // margin: 16px 0 32px 8px;
    }
    .model-content-desc {
        margin-top: 8px;
        font-size: 12px;
        .manage-user {
            i {
                font-style: normal;
                color: #7c8294;
                margin-left:6px 
            }

        }
    }
</style>
