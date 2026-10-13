<template>
    <div>
        <p class="desc-message">说明：系统会使用已替换文件重新生成报告</p>
        <!-- <a-modal ref="modalRef" v-model:open="open" width="950px" :footer="null">
            <template #title>
                <div ref="modalTitleRef" style="width: 100%">资源下载</div>
            </template> -->
            <div class="down-content" :style="{'--width':isWidth}">
                <ul class="flex-ul flex-ul-title">
                    <li>文件类型</li>
                    <li class="flex-ul-li">
                        <p>文件名称</p>
                        <p class="opertion-p">操作</p>
                    </li>
                </ul>
                <div class="flex-ul-content" id="flex-ul-content">
                    <ul class="flex-ul" v-for="list in dataList">
                        <li>{{ list.fileClassifyDesc }}</li>
                        <li>
                            <div class="flex-ul-li" v-for="listItem in list.list">
                                <p>{{ listItem.fileName }}</p>
                                <p class="flex-link" >
                                    <span @click="downLoadFile(listItem.filePath)">下载</span>
                                    <a-upload
                                        class="content-add-upload export-data"
                                        name="file"
                                        :maxCount="1"
                                        :showUploadList="false"
                                        v-model:file-list="fileList"
                                        :customRequest="(e) => customRequest(e, listItem)"
                                        :before-upload="(a, b) => beforeUpload(a, b, listItem)"
                                    >
                                        <span class="repalce-btn">替换</span>
                                    </a-upload>
                                    <span class="replace-status repalce-btn" v-if="!listItem.isDoneReplace && listItem.fileClassify !==0">已替换</span>
                                </p>
                            </div>
                        </li>
                    </ul>
                </div>
                <div class="loading-spin" v-if="computedIsReplaceFinally">
                    <a-spin tip="文件替换中，请稍等..." />
                </div>
            </div>
            <div class="footer-content">
                     
            </div>
           
        <!-- </a-modal> -->
    </div>
</template>

<script setup>
    import { ref, reactive, toRefs, onBeforeMount, onMounted, watchEffect, computed } from 'vue';
    import { message, Result, Upload } from 'ant-design-vue';
    import {
        checkPdfEncryption,
        checkDocxEncryption,
        isExcelEncrypted,
    } from '@/utils/checkFileIsEncryption';
    const props = defineProps({
        visibleDownloadModal: {
            type: Boolean,
            default: false,
        },
        downloadModalList: {
            type: Object,
            default: () => {},
        },
        isReplaceFinally: {
            type: Boolean,
            default: false,
        },
    });

    const emits = defineEmits([, 'update:visibleDownloadModal', 'customRequest','replaceAllFileFn']);
    const computedIsReplaceFinally = computed(() => props.isReplaceFinally);
    const open = computed({
        get() {
            return props.visibleDownloadModal;
        },
        set(value) {
            fileList.value = [];
            emits('update:visibleDownloadModal', value);
        },
    });
    const dataList = computed(() => props.downloadModalList);
    const customRequest = (e, listItem) => {
        emits('customRequest', e, listItem);
    };
    const fileList = ref([]);
    //
    // 上传前拦截
    const beforeUpload = async (file, fileList, val) => {
        console.log('我就是看看', val);
        let isRegister;
        const type = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();

        if (val.fileSuffix.indexOf(type) !== -1) {
            if (file.size / 1024 / 1024 > 1000000) {
                message.error('文件最大限制为1000M');
                return false || Upload.LIST_IGNORE;
            } else {
                if (type == 'pdf') {
                    isRegister = await checkPdfEncryption(file);
                } else if (type == 'doc' || type == 'docx') {
                    isRegister = await checkDocxEncryption(file);
                } else {
                    isRegister = await isExcelEncrypted(file);
                }
                if (isRegister) {
                    message.error('当前文件是加密文件，请上传非加密文件！');
                    return false || Upload.LIST_IGNORE;
                }
            }
        } else {
            const msg = val.fileSuffix.map((str) => str).join('、');
            message.error(`请上传${msg}格式文件`);
            return false || Upload.LIST_IGNORE;
        }
    };
    // 下载文件
    const downLoadFile = async (path) => {
        window.open(path);
    };
    // 替换所有报告
    const replaceAllFile= ()=> {
        emits('replaceAllFileFn')
    }
    //判断是否出现滚动条
    const hasScrollbar = (element) => element.scrollHeight > element.clientHeight;
    let isWidth = ref('180px')
    onMounted(() => {
        const myElement = document.getElementById('flex-ul-content');
        hasScrollbar(myElement)? isWidth.value = "186px" : isWidth.value = "180px"
    });
</script>
<style scoped lang="scss">
@import './resourceManageComponents/ResourceManage.scss';
    .flex-ul {
        box-sizing: border-box;
        display: flex;
        padding-left: 10px;
        border: 1px solid #ddd;
        font-size: 12px;
        li {
            flex: 1;
            &:nth-child(1) {
                flex: none;
                padding-top: 10px;
                width: 180px;
                border-right: 1px solid #ddd;
            }
            &:last-child {
                border: none;
            }
        }
    }
    .loading-spin {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        background-color: rgba(0, 0, 0, 0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
    }
    .flex-ul-title {
        background-color: #f2f7f7;
        font-weight: bold;
    }
    .down-content{
        width: 100%;
        padding-right: 10px;
        box-sizing: border-box;

    }
    .flex-ul-content {
        width: 100%;
        overflow: auto;
        max-height: calc(100vh - 400px);
        .flex-ul {
            display: flex;
            padding-left: 10px;
            border: 1px solid #ddd;
            border-top: none;
            li {
                border-right: 1px solid #ddd;

                flex: 1;
                &:nth-child(1) {
                    flex: none;
                    padding-top: 10px;
                    width: 180px;
                }
                &:last-child {
                    border: none;
                }
            }
        }
    }

    .flex-ul-li {
        display: flex;
        p {
            flex: 1;
            border-bottom: 1px solid #ddd;
            padding: 10px 10px;
            &:nth-child(1) {
                border-right: 1px solid #ddd;
            }
            &:last-child {
                flex: none;
                width: 180px;
            }
            &.flex-link,
            span {
                color: #036b64;
                cursor: pointer;

                .repalce-btn {
                    margin-left: 10px;
                    font-size: 12px;
                }
                .replace-status{
                    color: #ccc;
                    cursor: default;
                }
            }
        }
        &:last-child {
            p {
                border-bottom: none;
            }
        }
    }
    .opertion-p {
        width: var(--width) !important;
    }
    .footer-content {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        .memo-tip {
            font-size: 12px;
            font-family: PingFangSC, PingFang SC;
            font-weight: 400;
            color: #7C8294;
            line-height: 12px;
            margin-top: 16px;
        }
    }
        
</style>
