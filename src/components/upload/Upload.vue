<template>
    <div class="upload-content">
        <div class="upload-item">
            <el-upload
                ref="uploadRef"
                action=""
                :accept="accept"
                :show-file-list="false"
                v-model:file-list="fileList"
                :name="name"
                :list-type="listType"
                :multiple="multiple"
                :limit="maxCount"
                :disabled="props.disabled"
                class="avatar-uploader"
                :http-request="customRequest"
                :before-upload="beforeUpload"
                :on-exceed="handleExceed"
                :on-change="handleChange"
            >
                <slot name="customBtn"></slot>
                <div class="up-load-file" v-if="!$slots.customBtn">
                    <iconpark-icon
                        name="shangchuanwenjian"
                        v-if="name === 'file'"
                        size="20"
                        class="up-load-file-icon"
                    ></iconpark-icon>
                    <iconpark-icon
                        name="shangchuantupian"
                        v-else
                        size="20"
                        class="up-load-file-icon"
                    ></iconpark-icon>
                </div>
            </el-upload>
            <div class="tip-content">
                <slot name="tip" />
            </div>
        </div>
        <div class="up-list" v-if="showUploadList">
            <ul v-if="fileList.length > 0">
                <template v-for="(item, index) in fileList" :key="item.name">
                    <li v-if="name !== 'pic'" class="file-list">
                        <div class="name-icon">
                            <iconpark-icon
                                :name="fileIconList[fileType] || fileIconList[item.fileSuffix] || fileIconList[item.suffix] || 'txt'"
                                size="18"
                                class="file-icon"
                            ></iconpark-icon>
                            <template v-if="item.processSelf !== '100'">
                                <div class="loading-mark" v-if="item.processSelf">{{ item.processSelf ? Math.floor(item.processSelf) : 0 }}</div>
                            </template>
                            <div
                                @mouseover="showDelteBtn(index)"
                                @mouseleave="hideDelteBtn()"
                                @click="downLoadFile(item)"
                                class="up-load-file-title"
                            >
                                {{ item.fileName || item.name }}
                                <iconpark-icon
                                    v-show="showDelteBtnIndex == index"
                                    name="shanchu"
                                    size="14"
                                    class="upload-shanchu"
                                    @click="deleteItem(index)"
                                ></iconpark-icon>
                            </div>
                        </div>
                    </li>
                    <li v-else class="img-list"
                        @mouseover="showDelteBtn(index)"
                        @mouseleave="hideDelteBtn()">
                        <template v-if="item.filePath">
                            <el-image style="width: 50px; font-size: 12px" :src="item.filePath"></el-image>
                            <iconpark-icon
                                v-show="showDelteBtnIndex == index"
                                name="guanbi"
                                size="14"
                                class="img-icon-delete"
                                @click="deleteItem(index)"
                            ></iconpark-icon>
                        </template>
                    </li>
                </template>
            </ul>
        </div>
    </div>
</template>

<script setup>
    import {
        ref,
        reactive,
        toRefs,
        onBeforeMount,
        onMounted,
        watch,
        watchEffect,
        computed,
        nextTick,
    } from 'vue';
    import { ElMessage, genFileId } from 'element-plus';
    import { fileIconList } from '@/assets/js/static.js';
    import { useOssUpload } from '../ossClient/index'

    const props = defineProps({
        multiple: {
            type: Boolean,
            default: false,
        },
        // 上传参数
        dataObj: {
            type: Object,
            default: () => {},
        },
        // 类型
        name: {
            type: String,
            default: 'file',
        },
        listType: {
            type: String,
            default: 'text',
        },
        fileTypes: String,
        defaultFiles: {
            type: Array,
            default: () => [],
        },
        maxCount: {
            type: Number,
            default: 1,
        },
        fileSize: Number,
        fileTypeMessage: String,
        fileSizeMessage: String,
        isNeedCheckFileNames: {
            type: Boolean,
            default: false,
        },
        showUploadList: {
            type: Boolean,
            default: true,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        isImmediatelyUpload: {
            type: Boolean,
            default: true,
        },
    });
    const emit = defineEmits(['upFileList', 'update:defaultFiles']);

    const uploadRef = ref(null);
    const fileList = ref([]);
    const uploadedFiles = new Set(); // 已上传文件集合
    const loading = ref(false);
    // 文件名称
    const fileName = ref('');
    // 文件类型
    const fileType = ref('');
    const showDelteBtnIndex = ref(null);
    let processSelf = ref(0);

    watch(
        () => props.defaultFiles.length,
        () => {
            fileList.value = props.defaultFiles;
        },
        { deep: true, immediate: true },
    );
    const accept = computed(() => {
        let arr = props.fileTypes.split(',');
        let str = '';
        arr.forEach((item) => {
            str += `.${item},`;
        });
        str = str.slice(0, -1);
        return str;
    });

    // 文件校验
    // 注意：el-upload 的 before-upload 只接收 rawFile 一个参数（antd 的第二个 fileList 参数没有对应物）
    // 返回 false 时，el-upload 会自动把这个文件从 file-list 里移除，效果等同于 antd 的 Upload.LIST_IGNORE
    const beforeUpload = (rawFile) => {
        const isFileUploaded = uploadedFiles.has(rawFile.name);
        let flag = true;
        fileName.value = rawFile.name;
        const type = rawFile.name.substring(rawFile.name.lastIndexOf('.') + 1).toLowerCase();
        const fileTypeResult = props.fileTypes.split(',');
        const isFileType = fileTypeResult.includes(type);

        if (isFileUploaded && props.isNeedCheckFileNames) {
            ElMessage.error('文件已上传');
            return false;
        }
        if (!isFileType) {
            ElMessage.error(props.fileTypeMessage);
            return false;
        }
        fileType.value = type;
        if (props.fileSize) {
            const isFileSize = (rawFile.size / 1024 / 1024).toFixed(2) < props.fileSize;
            if (!isFileSize) {
                ElMessage.error(props.fileSizeMessage);
                return false;
            }
        }
        uploadedFiles.add(rawFile.name);
        return flag;
    };

    // 上传文件
    // el-upload 的 http-request 接收一个 options 对象，options.file 即原始文件，和 antd customRequest 的用法一致
    const customRequest = async (options) => {
        const rawFile = options.file;
        if (props.isImmediatelyUpload) {
            let obsUpload = useOssUpload();
            processSelf.value = obsUpload.processSize;
            fileList.value.forEach((item) => {
                if (item.uid === rawFile.uid) {
                    item.processSelf = processSelf.value;
                }
            });
            let uploadResult = await obsUpload.uploadFile(rawFile);
            emit('upFileList', {
                filePath: uploadResult.obsPath,
                fileName: fileName.value,
                suffix: fileType.value,
            });
        } else {
            emit('upFileList', rawFile);
        }
    };

    // 超出 limit 数量时触发（antd 的 max-count 会静默替换，el-upload 需要手动处理）
    // 这里按“替换为最新选择的文件”处理，适用于 maxCount = 1 的常见场景
    const handleExceed = (files) => {
        uploadRef.value?.clearFiles();
        const file = files[0];
        file.uid = genFileId();
        uploadRef.value?.handleStart(file);
    };

    const handleChange = (file) => {
        if (file.status === 'success') {
            ElMessage.success(`${file.name} file uploaded successfully`);
        } else if (file.status === 'fail') {
            ElMessage.error(`${file.name} file upload failed.`);
        }
    };
    // 显示隐藏文件删除按钮
    const showDelteBtn = (val) => {
        showDelteBtnIndex.value = val;
    };
    const hideDelteBtn = () => {
        showDelteBtnIndex.value = null;
    };
    // 删除文件
    const deleteItem = (index) => {
        if (index == null) {
            fileList.value = [];
        } else {
            fileList.value.splice(index, 1);
        }
        emit('update:defaultFiles', fileList.value);
    };
    // 回显文件
    const updateFileData = (data) => {
        fileList.value = [];
        data && data.length && data.map(ele => {
            fileList.value.push({
                name: ele.fileName,
            })
            fileName.value = ele.fileName;
            fileType.value = ele.fileSuffix.split('.')[1];
        })
    };

    // 将华为云替换成阿里云
    const downLoadFile = (item) => {
        if (item.filePath && item.filePath.includes('https')) {
            const oldDomains = [
                'https://whln-public.obs.cn-north-4.myhuaweicloud.com',
                'https://whln.obs.cn-north-4.myhuaweicloud.com:443'
            ];
            const newDomain = 'https://whln-prod-public.oss-cn-beijing.aliyuncs.com';

            let newFilePath = item.filePath;
            oldDomains.forEach(oldDomain => {
                if (newFilePath.startsWith(oldDomain)) {
                    newFilePath = newFilePath.replace(oldDomain, newDomain);
                }
            });

            window.open(newFilePath);
        }
    }
    defineExpose({
        deleteItem,
        updateFileData,
    });
</script>
<style scoped lang="scss">
    .upload-content {
        margin-top: 20px;
        :deep(.el-upload.is-disabled) {
            .up-load-file {
                cursor: not-allowed !important;
            }
        }
    }
    .upload-item {
        display: flex;
        align-items: center;
        .avatar-uploader {
            .up-load-file {
                width: 52px;
                height: 52px;
                background: #f5f6f9;
                border-radius: 4px;
                border: 1px dashed #d2d5e1;
                margin-right: 16px;
                display: flex;
                justify-content: center;
                align-items: center;
                cursor: pointer;
                transition: border-color linear 0.2s;
                &:hover {
                    border-color: #036b64;
                }
            }
        }
    }
    .up-list {
        ul {
            .file-list {
                height: 18px;
                font-size: 12px;
                color: #363b4d;
                line-height: 12px;
                margin: 10px 0 0 0;
                position: relative;
                cursor: pointer;
                .name-icon{
                    display: flex;
                    align-items: center;
                    margin-bottom: 5px;
                }
                .upload-shanchu {
                    margin-left: 14px;
                    cursor: pointer;
                }
                .up-load-file-title {
                    display: flex;
                    line-height: 18px;
                }
                .file-icon {
                    margin-right: 8px;
                }
                .loading-mark {
                    width: 18px;
                    height:18px;
                    background-color: rgba(#000,0.2);
                    position: absolute;
                    text-align: center;
                    line-height: 18px;
                    color: #fff;
                    font-size: 10px;
                }
            }
            .img-list  {
                width: 50px;
                margin-top: 10px;
                position: relative;
                cursor: pointer;
                .img-icon-delete {
                    position: absolute;
                    top: -8px;
                    right: -12px;
                }
            }
        }
    }
</style>