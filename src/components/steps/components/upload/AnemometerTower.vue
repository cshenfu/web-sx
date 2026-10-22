<template>
    <a-form-item label="" name="anemometerTowerFile" class="input-margin">
        <div class="upload-tower-content">
            <Upload
                :disabled="disabled"
                :isImmediatelyUpload="false"
                :showUploadList="false"
                :fileTypes="'txt,csv'"
                :fileSize="100"
                :maxCount="1"
                :fileTypeMessage="'请选择正确的文件类型'"
                fileSizeMessage="请选择大小限制范围内的文件进行操作"
                @upFileList="getTowerUploadFileList"
            >
                <template #tip>
                    <div class="tip"
                        >目前支持NRG导出
                        txt格式、平台模板csv格式的测风塔数据。1个文件仅包含1个测风塔数据，单个文件最大支持100M。
                        下载 <span class="link-span" @click="downTemplate">测风塔导入模板.csv</span>
                    </div>
                </template>
            </Upload>
            <!-- <anemometer-tower-upload
               ref="anemometerTowerFileRef"
               :filesList="formState.anemometerTowerFile"
               @upImgLists="uploadTowerImgList"
               @deleteTowerUploadFileItem="deleteTowerUploadFileItem"
               @deleteTowerImgItem="deleteTowerImgItem"
           ></anemometer-tower-upload> -->
            <!-- :ref="el =>setDynamicRef(el,index)" -->
            <ul class="up-list">
                <li
                    class="up-load-list"
                    v-for="(item, index) in formState.anemometerTowerFile"
                    :key="item.name"
                    :id="index"
                    :ref="(el) => setDynamicRef(el, index)"
                >
                    <iconpark-icon
                        name="guanbi"
                        size="14"
                        class="upload-shanchu"
                        @click="deleteTowerUploadFileItem(index)"
                    ></iconpark-icon>
                    <div class="upload-name">
                        <iconpark-icon
                            :name="getFileIcon(item)"
                            size="18"
                            class="file-icon"
                        ></iconpark-icon>
                        <div class="file-progress">
                            <span class="file-name" :class="item.msg ? 'err-msg' : ''">{{
                                item.fileName || item.name
                            }}</span>
                            <div class="loader-check">
                                <template v-if="item.isCheckData && !item.processSelf">
                                    <div class="loader"></div>
                                    <span class="is-check-data">文件校验中…</span>
                                </template>
                                <a-progress
                                    v-if="item.processSelf && item.processSelf !== '100'"
                                    :showInfo="false"
                                    size="small"
                                    class="loading-progress"
                                    :stroke-color="{
                                        '0%': '#108ee9',
                                        '100%': '#87d068',
                                    }"
                                    :strokeWidth="2"
                                    :percent="item.processSelf"
                                />
                            </div>
                        </div>
                    </div>
                    <div class="upload-success" v-if="item.filePath">
                        <div class="upload-success-tip">
                            如有该测风塔照片可上传上限2个(照片格式为jpg、png)，单文件最大5M</div
                        >
                        <a-form-item-rest>
                            <div class="upload-img-content">
                                <Upload
                                    ref="anemometerTowerImg"
                                    name="pic"
                                    class="input-margin-top"
                                    :showUploadList="false"
                                    :fileTypes="fileType"
                                    :fileSize="fileSize"
                                    :maxCount="2"
                                    :fileTypeMessage="'照片格式为jpg、png（仅能选择该格式）'"
                                    fileSizeMessage="照片大小不能超过5M"
                                    @upFileList="(e) => uploadTowerImgList(e, index)"
                                >
                                </Upload>
                                <ul class="img-list">
                                    <li
                                        v-for="(item, childrenIndex) in item.children"
                                        :key="childrenIndex"
                                    >
                                        <img :src="item" alt="" v-if="item" />
                                        <iconpark-icon
                                            name="guanbi"
                                            size="14"
                                            class="upload-img-shanchu"
                                            @click="deleteTowerImgItem(index, childrenIndex)"
                                        ></iconpark-icon>
                                    </li>
                                </ul>
                            </div>
                        </a-form-item-rest>
                    </div>
                    <div class="upload-error" v-if="item.msg">
                        <iconpark-icon
                            name="jinggao"
                            size="14px"
                            class="upload-error-icon"
                        ></iconpark-icon
                        >{{ item.msg }}
                    </div>
                </li>
            </ul>
        </div>
    </a-form-item>
</template>

<script setup>
    import { ref, nextTick } from 'vue';
    import Upload from './Upload.vue';
    import {
        checkWindTowerFileData,
        checkWindTowerFileCsvData,
    } from '@/api/modules/wind/secondStep';
    import { useOssUpload } from '@/components/ossClient/modifytUpload';
    import { fileIconList } from '@/assets/js/static.js';
    import { cloneDeep } from 'lodash-es';
    import { message, Modal } from 'ant-design-vue';
    import { templatePath } from '@/assets/js/static.js';

    const emit = defineEmits(['upAnemomentTowerFiles']);
    const fileType = 'jpeg,png,jpg';
    const fileSize = 5;
    const ossUpload = useOssUpload();
    const processSelf = ref(0);
    const formState = ref({
        anemometerTowerFile: [],
    });
    const anemometerTowerImg = ref(null);
    const disabled = ref(false);
    const itemRefs = ref([]);
    const pointList = ref([]); // 校验测风塔文件之后返回的坐标
    // 回显数据
    const recordData = (val) => {
        formState.value.anemometerTowerFile = val;
    };
    // 回显数据的pointList
    const recordPointList = (val) => {
        pointList.value = val;
    };
    // 获取测风塔数据文件
    const getTowerUploadFileList = async (val) => {
        let { name } = val;
        const suffix = name.substring(name.lastIndexOf('.') + 1);
        console.log('suffix', suffix);
        const formData = new FormData();
        formData.append('file', val);
        // 判断测风塔中是否存在数据
        let isExist = formState.value.anemometerTowerFile.some((item) => item.fileName === name);
        if (isExist) {
            message.warn('文件已存在');
            return;
        }
        disabled.value = true;
        formState.value.anemometerTowerFile.push({
            uid: val.uid,
            fileName: name,
            processSelf: processSelf.value,
            isCheckData: true,
            isPassed: 'false',
        });
        let obj = {};
        if (suffix === 'csv') {
            await checkWindTowerFileCsvData(formData)
                .then(async (res) => {
                    console.log('res', res);
                    if (res.data) {
                        pointList.value.push({
                            latitude: res.data.latitude,
                            longitude: res.data.longitude,
                            alt: res.data.elevation,
                        });
                        processSelf.value = 100;
                        formState.value.anemometerTowerFile.forEach((item, index) => {
                            if (item.uid === val.uid) {
                                item.processSelf = '100';
                                console.log(item, 'item');
                            }
                        });
                        disabled.value = false;
                        obj = Object.assign(
                            {},
                            {
                                fileName: name,
                                msg: res.msg,
                                filePath: res.data.objectKey,
                                isCheckData: false,
                                isPassed: 'true',
                            },
                        );
                    } else {
                        obj = Object.assign(
                            {},
                            {
                                fileName: name,
                                msg: res.msg || '文件校验失败',
                                filePath: '',
                                isCheckData: false,
                                isPassed: 'false',
                            },
                        );
                    }
                })
                .catch(async (err) => {
                    obj = {
                        msg: err.msg,
                        filePath: '',
                        fileName: val.name,
                        isCheckData: false,
                        isPassed: '',
                    };
                });
        } else {
            await checkWindTowerFileData(formData)
                .then(async (res) => {
                    if (res.data) {
                        pointList.value.push({
                            latitude: res.data.latitude,
                            longitude: res.data.longitude,
                            alt: res.data.elevation,
                        });
                        processSelf.value = Math.floor(ossUpload.processSize);
                        formState.value.anemometerTowerFile.forEach((item, index) => {
                            if (item.uid === val.uid) {
                                item.processSelf = ossUpload.processSize;
                            }
                        });
                        let uploadResult = await ossUpload.uploadFile(
                            val,
                            sessionStorage.getItem('obsFilePath') || '',
                        );
                        disabled.value = false;
                        obj = Object.assign(
                            {},
                            {
                                fileName: name,
                                msg: res.msg || uploadResult.msg,
                                filePath: uploadResult?.obsPath,
                                isCheckData: false,
                                isPassed: 'true',
                            },
                        );
                    } else {
                        obj = Object.assign(
                            {},
                            {
                                fileName: name,
                                msg: res.msg || '文件校验失败',
                                filePath: '',
                                isCheckData: false,
                                isPassed: 'false',
                            },
                        );
                    }
                })
                .catch(async (err) => {
                    obj = {
                        msg: err.msg,
                        filePath: '',
                        fileName: val.name,
                        isCheckData: false,
                        isPassed: '',
                    };
                });
        }

        formState.value.anemometerTowerFile.forEach((item, index) => {
            obj.children = item.children ? item.children : [];
            if (item.uid === val.uid) {
                formState.value.anemometerTowerFile.splice(index, 1, obj);
            }
        });
        emit('upAnemomentTowerFiles', {
            file: formState.value.anemometerTowerFile,
            pointList: pointList.value,
        });
    };
    // 删除测风塔数据文件
    const deleteTowerUploadFileItem = (index) => {
        formState.value.anemometerTowerFile.splice(index, 1);
        if (pointList.value.length > 0) {
            pointList.value.splice(index, 1);
        }
        disabled.value = false;
        console.log({ file: formState.value.anemometerTowerFile, pointList: pointList.value });
        emit('upAnemomentTowerFiles', {
            file: formState.value.anemometerTowerFile,
            pointList: pointList.value,
        });
    };
    // 获取测风塔图片数据
    const uploadTowerImgList = (result, index) => {
        console.log('图片数据', result);
        // 需要拼接数据
        // if (formState.value.anemometerTowerFile[index]['children'].length < 2) {
        //     console.log('测风塔图片数据sssss',result.filePath);
        //     formState.value.anemometerTowerFile[index]['children'].push(result.filePath);
        // } else {
        //     message.warning('最多上传两张图片,请删除后再上传');
        // }
        formState.value.anemometerTowerFile[index]['children'].push(result.filePath);
        let result2 = cloneDeep(formState.value.anemometerTowerFile);
        console.log('测风塔图片数据', result2);
        result2.forEach((item, index) => {
            if (item.children.length > 0) {
                item.children.forEach((child, childIndex) => {
                    getObsImgPath2(child, index, childIndex);
                });
            }
        });
    };
    // 删除测风塔图片数据
    const deleteTowerImgItem = (index, childrenIndex) => {
        formState.value.anemometerTowerFile[index]['children'].splice(childrenIndex, 1);
        nextTick(() => {
            anemometerTowerImg.value[index].updateImgData(childrenIndex);
        });
    };
    
    // 根据文件类型显示图标
    const getFileIcon = (val) => {
        let name = val.fileName || val.name;
        let fileIcon = name?.substring(name?.lastIndexOf('.') + 1).toLowerCase();
        return fileIconList[fileIcon] || 'txt';
    };
    // 滚动到指定的位置
    const setDynamicRef = (el, index) => {
        if (el) {
            itemRefs.value[index] = el;
        }
    };
    const scrollToSpecificItem = (index) => {
        if (itemRefs.value[index] && itemRefs.value[index].scrollIntoView) {
            itemRefs.value[index].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        }
    };
    // 处理上上传完wenjian之后的图片路径
    const getObsImgPath2 = (path, index, childIndex) => {
        if (path.includes('http')) {
            formState.value.anemometerTowerFile[index].children[childIndex] = path;
            return;
        }
        ossUpload
            .getFileUrl(decodeURIComponent(path), sessionStorage.getItem('obsFilePath') || '')
            .then((res) => {
                formState.value.anemometerTowerFile[index].children[childIndex] = res;
            });
    };
    // 下载模板
    const downTemplate = () => {
        window.open(templatePath['anemometerTower'], '_blank');
    };
    defineExpose({
        recordData,
        recordPointList,
        scrollToSpecificItem,
    });
</script>
<style scoped lang="scss">
    $primary-color: var(--theme);
    .tip {
        font-size: 12px;
        font-family:
            PingFangSC,
            PingFang SC;
        color: #7c8294;
        line-height: 20px;
    }
    .up-list {
        .up-load-list {
            max-width: 532px;
            padding: 14px 16px 11px 16px;
            background: #fafafa;
            border-radius: 4px;
            font-size: 12px;
            font-family:
                PingFangSC,
                PingFang SC;
            color: #363b4d;
            line-height: 12px;
            margin: 0 0 12px 0;
            &:hover {
                .upload-shanchu {
                    display: block;
                }
            }
            &:first-child {
                margin-top: 12px;
            }
            cursor: pointer;
            position: relative;
            // display: flex;
            // align-items: center;
            .upload-name {
                height: 20px;
                display: flex;
                align-items: center;
                margin-bottom: 13px;
                position: relative;
                .file-icon {
                    margin-right: 8px;
                }
                .file-name {
                    font-size: 12px;
                    color: #363b4d;
                    line-height: 12px;
                }
                .err-msg {
                    color: #ff3e3e;
                }
                .file-progress {
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                }
                .loader-check {
                    width: 60%;
                    display: flex;
                    align-items: center;
                    .loading-progress {
                        margin-bottom: 0;
                    }
                }
                .loading-mark {
                    width: 100%;
                    line-height: 18px;
                    color: #fff;
                }
            }

            .upload-shanchu {
                display: none;
                position: absolute;
                top: -10px;
                right: -3px;
                cursor: pointer;
                color: #bbb;
            }
            .upload-error {
                display: flex;
                .upload-error-icon {
                    margin-right: 6px;
                    color: #fe830f;
                }
            }
            .upload-success {
                .upload-success-tip {
                    font-size: 12px;
                    font-family:
                        PingFangSC,
                        PingFang SC;
                    color: #7c8294;
                    line-height: 12px;
                    margin-bottom: 15px;
                }
            }
            .error-font-color {
                color: red;
            }
            .upload-img {
                font-size: 12px;
                span {
                    color: #036b64;
                }
            }
        }
    }
    .upload-img-content {
        display: flex;
        margin-bottom: 10px;
        .img-list {
            display: flex;
            li {
                position: relative;
                margin-right: 12px;
                .upload-img-shanchu {
                    display: none;
                    position: absolute;
                    top: -10px;
                    right: -10px;
                    color: #bbb;
                }
                &:hover {
                    .upload-img-shanchu {
                        display: block;
                    }
                }
            }
            img {
                width: 52px;
                height: 52px;
                border-radius: 4px;
                border: 1px solid #036b64;
            }
        }
    }
    .input-margin-top {
        margin-top: 0;
    }
    .link-span {
        color: $primary-color;
        cursor: pointer;
    }
</style>
