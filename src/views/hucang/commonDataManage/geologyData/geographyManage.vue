<template>
    <div class="geography-manage-template">
        <h4 class="content-title">
            <!-- <img src="../../../assets/img/user/detail-title.png" alt="" /> -->
            地形数据管理
        </h4>
        <div class="flex-box">
            <p>原始数据</p>
            <div class="box-content">
                <div class="file-handle-list">
                    <a-row :gutter="16">
                        <a-col :span="8">
                            <div
                                class="handle-list-item handle-list-item-simple"
                                v-if="geologyFile"
                            >
                                <p
                                    style="cursor: pointer"
                                    @click="downloadFileEvent(geologyFile.filePath)"
                                >
                                    <iconpark-icon size="18" name="qitawenjian"></iconpark-icon>
                                    {{ geologyFile.fileName }}
                                </p>
                            </div>
                            <div class="handle-list-item handle-list-item-simple" v-else>
                                <p style="color: #999">暂无</p>
                            </div>
                        </a-col>
                    </a-row>
                </div>
            </div>
        </div>
        <div class="flex-box">
            <p>高程数据</p>
            <fileGroup
                ref="elevationFileGroupRef"
                :simple="true"
                :maxFileSize="1024 * 5"
                :file-up-desc="'支持zip格式，最多上传1个文件，文件最大5G'"
                :maxNum="1"
                :acceptFileType="'.zip'"
                :essentialFileType="['.zip']"
            ></fileGroup>
        </div>
        <div class="flex-box">
            <p>瓦片数据</p>
            <fileGroup
                ref="tileDataFileGroupRef"
                :simple="true"
                :maxFileSize="1024 * 5"
                :file-up-desc="'支持zip格式，最多上传1个文件，文件最大5G'"
                :maxNum="1"
                :acceptFileType="'.zip'"
                :essentialFileType="['.zip']"
            ></fileGroup>
        </div>
        <div class="flex-box">
            <p>避让数据</p>
            <fileGroup
                ref="avoidFileGroupRef"
                :maxGroupNum="5"
                :maxFileSize="50"
                :acceptFileType="acceptFileTypes"
                :essentialFileType="['.shp', '.shx', '.prj', '.dbf']"
                :showAvoidanceType="true"
            ></fileGroup>
        </div>
        <div class="flex-box">
            <p>已有道路</p>
            <fileGroup
                ref="roadFileGroupRef"
                :maxGroupNum="5"
                :maxFileSize="50"
                :acceptFileType="acceptFileTypes"
                :file-up-desc="'支持shp文件，一个shp通常有.shp/.shx/.prj/.dbf（这4个格式必须有）.xml/.sbx/.cpg/.sbn文件格式组成。最多上传5个shp文件，文件最大50M。场区范围不能包含避让区域内'"
                :essentialFileType="['.shp', '.shx', '.prj', '.dbf']"
                :showRoadType="true"
            ></fileGroup>
        </div>
        <div class="flex-box">
            <p>可布机区域</p>
            <fileGroup
                ref="deployFileGroupRef"
                :maxGroupNum="1"
                :maxFileSize="50"
                :acceptFileType="acceptFileTypes"
                :file-up-desc="'支持shp文件，一个shp通常有.shp/.shx/.prj/.dbf（这4个格式必须有）.xml/.sbx/.cpg/.sbn文件格式组成。最多上传1个shp文件，文件最大50M'"
                :essentialFileType="['.shp', '.shx', '.prj', '.dbf']"
            ></fileGroup>
        </div>
        <div class="flex-box">
            <p>粗糙度</p>
            <fileGroup
                ref="coarseFileGroupRef"
                :simple="true"
                :file-up-desc="'支持tif格式，最多上传1个文件，文件最大500M'"
                :maxFileSize="500"
                :maxNum="1"
                :acceptFileType="'.tif'"
                :essentialFileType="['.tif']"
            ></fileGroup>
        </div>
        <div class="flex-box">
            <p>彩云地形图</p>
            <fileGroup
                ref="lightFileGroupRef"
                :simple="true"
                :file-up-desc="'支持DWG格式，最多上传1个文件，文件最大500M'"
                :maxFileSize="500"
                :maxNum="1"
                :acceptFileType="'.dwg'"
                :essentialFileType="['.dwg']"
            ></fileGroup>
        </div>
        <div align="center">
            <a-button style="margin-right: 32px" @click="goBack">取消</a-button>
            <a-button type="primary" @click="submitBefore">保存</a-button>
        </div>
    </div>
    <div class="loading-template" v-if="loading">
        <a-spin size="large" />
        <span>
            正在上传 第
            {{
                finishUploadFilesLength + 1 <= waitingUploadFilesLength
                    ? finishUploadFilesLength + 1
                    : waitingUploadFilesLength
            }}
            个文件，共 {{ waitingUploadFilesLength }} 个文件
        </span>
    </div>
</template>
<script setup>
    import { ElMessage } from 'element-plus'
    import { ref, onMounted, nextTick } from 'vue';
    import { useRouter, useRoute } from 'vue-router';
    import { useOssUpload } from '@/components/ossClient/index';
    import fileGroup from './components/geographyComponents/fileGroup.vue';
    import mitt from '@/utils/eventBus';
    import {
        submitFileGeology,
        getGeologyDetail,
        deleteGeology,
        updateGeologyStatus,
        calculateGeologyStatus,
    } from '@/api/modules/geology.js';
    import { downLoadFile } from '../commonData';
    const geologyFile = ref(null);
    const obsUpload = useOssUpload();
    const acceptFileTypes = ref('.shp,.shx,.prj,.dbf,.xml,.sbx,.cpg,.sbn');
    // 高程ref
    const elevationFileGroupRef = ref(null);
    // 瓦片ref
    const tileDataFileGroupRef = ref(null);
    // 避让ref
    const avoidFileGroupRef = ref(null);
    // 道路ref
    const roadFileGroupRef = ref(null);
    // 粗糙度ref
    const coarseFileGroupRef = ref(null);
    // 可布机区域ref
    const deployFileGroupRef = ref(null);
    // 彩云地形图ref
    const lightFileGroupRef = ref(null);
    // 记载中
    const loading = ref(false);
    const router = useRouter();
    const route = useRoute();
    const goBack = () => {
        router.go(-1);
    };
    const formatUploadFileData = ref({});
    // 等待上传数量
    const waitingUploadFilesLength = ref(0);
    // 已完成上传数量
    const finishUploadFilesLength = ref(0);
    // 数据整理好后提交至后台
    const postData = async (data, currentCount) => {
        console.log('最后给后台的数据结构', data, currentCount);
        // debugger;
        const res = await submitFileGeology(data);
        if (res.code == 200) {
            // 用户数据待核对状态的数据，需要更改地质数据的状态为已核对待计算
            if (route.query.sourceType == 2 && route.query.status == 4) {
                const rew = await updateGeologyStatus({
                    geologyId: route.query.id
                        ? route.query.id
                        : sessionStorage.getItem('geologyId'),
                    status: 5,
                });
                if (rew.code == 200) {
                    mitt.emit('reGetListData');
                    sessionStorage.setItem('reGetListData', true);
                    currentCount == 0 && ElMessage.success('操作成功');
                    // goBack();
                    router.push({
                        path: '/geology/list',
                    });
                }
            } else {
                currentCount == 0 && ElMessage.success('操作成功');
                // goBack();
                router.push({
                    path: '/geology/list',
                });
            }
        }
    };
    const submit = async () => {
        let dataGroupLength = Object.values(formatUploadFileData.value).filter(
            (item) => !!item,
        ).length;
        for (const key in formatUploadFileData.value) {
            if (Object.hasOwnProperty.call(formatUploadFileData.value, key)) {
                const element = formatUploadFileData.value[key];
                if (element) {
                    const formatsSubFiles = [];
                    let fileType = '';
                    switch (key) {
                        case 'ExistingRoad':
                            fileType = 7;
                            break;
                        case 'AreaOfAvoidance':
                            fileType = 5;
                            break;
                        case 'MachineArea':
                            fileType = 8;
                            break;
                        case 'Roughness':
                            fileType = 2;
                            break;
                        case 'ElevationData':
                            fileType = 4;
                            break;
                        case 'TileData':
                            fileType = 9;
                            break;
                        case 'LightData':
                            fileType = 100;
                            break;
                        default:
                            break;
                    }
                    for (const subKey in element) {
                        if (Object.hasOwnProperty.call(element, subKey)) {
                            const subElement = element[subKey];
                            const formatData = [];
                            subElement.fileList.map((e, eIndex) => {
                                const path = subElement['filePath'][eIndex]['filePath']
                                    ? subElement['filePath'][eIndex]['filePath']
                                    : subElement['filePath'][eIndex];
                                path &&
                                    formatData.push({
                                        fileName: e.name,
                                        // 如果filePath是个对象就给对象，如果是数组就给数组项
                                        filePath: path,
                                        fileSuffix: '.' + e.name.split('.')[e.name.split('.').length - 1],
                                    });
                            });
                            const obj = {
                                fileName: subKey,
                                files: formatData,
                            };
                            if (key == 'ExistingRoad' || key == 'AreaOfAvoidance') {
                                console.log('key', key);
                                console.log('避让选取的type类型', element[subKey]);
                                obj['type'] = element[subKey]['type'] || 1;
                                if (key == 'AreaOfAvoidance') {
                                    obj['isCalculate'] = element[subKey]['isCalculate'] || 0;
                                }
                            }
                            console.log('处理完的obj', obj);
                            formatsSubFiles.push(obj);
                        }
                    }
                    dataGroupLength--;
                    // const paramsFormat = {
                    //     filePath: JSON.stringify(formatsSubFiles),
                    //     fileType: fileType,
                    //     geologyId: route.query.id
                    //         ? route.query.id
                    //         : sessionStorage.getItem('geologyId'),
                    // };
                    // console.log('整理好的数据结构', paramsFormat);
                    await postData(
                        {
                            filePath: JSON.stringify(formatsSubFiles),
                            fileType: fileType,
                            geologyId: route.query.id
                                ? route.query.id
                                : sessionStorage.getItem('geologyId'),
                        },
                        dataGroupLength,
                    );
                }
            }
        }
    };
    const uploadFileToOBS = async (itemTypeData, originKey) => {
        if (!itemTypeData) {
            return false;
        }
        for (const key in itemTypeData) {
            if (Object.hasOwnProperty.call(itemTypeData, key)) {
                const element = itemTypeData[key];
                if (element.fileList.length) {
                    // element.fileList.map(async (ele, eleIndex) => {
                    //     await uploadItemToOBS(
                    //         ele,
                    //         eleIndex,
                    //         key,
                    //         originKey,
                    //         element.fileList.length,
                    //     );
                    //     console.log('刷卡缴费',eleIndex);
                    //     // debugger
                    //     // uploadFileToOBS( itemTypeData, originKey);
                    // });
                    for (let index = 0; index < element.fileList.length; index++) {
                        const ele = element.fileList[index];
                        await uploadItemToOBS(ele, index, key, originKey, element.fileList.length);
                    }
                }
            }
        }
    };
    const uploadItemToOBS = async (file, subIndex, subKey, originKey) => {
        try {
            sessionStorage.setItem('obsPath', 'dz/dx/' + route.query.id + '/' + originKey + '/');
            if (formatUploadFileData.value[originKey][subKey]['filePath'][subIndex]) {
                // 存在路径情况下不去上传文件到OBS
            } else {
                // 原本数据没有路径情况下再去上传OBS
                let uploadResult = await obsUpload.uploadFile(file);
                const result = {
                    filePath: uploadResult.obsPath,
                    fileName: file.name,
                    suffix: file.name.split('.')[1],
                };
                formatUploadFileData.value[originKey][subKey]['filePath'][subIndex] = result;
            }
            finishUploadFilesLength.value++;
            if (
                finishUploadFilesLength.value !== 0 &&
                waitingUploadFilesLength.value === finishUploadFilesLength.value
            ) {
                // 代表文件全部上传完毕
                loading.value = false;
                submit();
            }
        } catch (error) {
            loading.value = false;
        }
    };
    // 判断用户提交的文件格式是否有误
    const submitIsRight = () => {
        let isRight = true;
        const arrs = [
            elevationFileGroupRef.value,
            tileDataFileGroupRef.value,
            avoidFileGroupRef.value,
            roadFileGroupRef.value,
            coarseFileGroupRef.value,
            deployFileGroupRef.value,
            lightFileGroupRef.value,
        ];
        arrs.map((ele) => {
            if (!ele.fileAllCheckKey) {
                isRight = false;
            }
        });
        return isRight;
    };
    const submitBefore = async () => {
        if (!submitIsRight()) {
            ElMessage.error('请先完善文件信息');
            return false;
        }
        waitingUploadFilesLength.value = 0;
        finishUploadFilesLength.value = 0;
        const arrsDesc = [
            'ElevationData',
            'TileData',
            'AreaOfAvoidance',
            'ExistingRoad',
            'Roughness',
            'MachineArea',
            'LightData',
        ];
        const arrs = [
            elevationFileGroupRef.value,
            tileDataFileGroupRef.value,
            avoidFileGroupRef.value,
            roadFileGroupRef.value,
            coarseFileGroupRef.value,
            deployFileGroupRef.value,
            lightFileGroupRef.value,
        ];
        const length = arrs.length;
        formatUploadFileData.value = {};
        for (let i = 0; i < length; i++) {
            const item = arrs[i].formatFileData;
            formatUploadFileData.value[arrsDesc[i]] = item;
            for (const key in item) {
                if (!item[key]['filePath']) {
                    item[key]['filePath'] = [];
                }
                waitingUploadFilesLength.value += item[key]['fileList'].length;
            }
        }
        if (waitingUploadFilesLength.value == 0) {
            // ElMessage.error('当前未上传任何文件！');
            // 未上传任何文件也允许提交
            submit();
            return false;
        }
        loading.value = true;
        for (const key in formatUploadFileData.value) {
            if (Object.hasOwnProperty.call(formatUploadFileData.value, key)) {
                const element = formatUploadFileData.value[key];
                await uploadFileToOBS(element, key);
            }
        }
    };
    const filterDetailFiles = (fileItem, fileType, filesData) => {
        const formatData = filesData.filter((ele) => ele.fileType == fileType);
        if (fileType == 1) {
            // 地形图数据
            geologyFile.value = formatData[0];
            return false;
        }
        // 为了解决用户端传的避让区域文件返回数据格式与运营端不一致问题
        const concatFiles = (files) => {
            // 相同type需要files放到一起
            const obj = {};
            files.map((ele) => {
                if (!obj[ele.type]) {
                    obj[ele.type] = ele;
                } else {
                    obj[ele.type]['files'] = [...obj[ele.type]['files'], ...ele['files']];
                }
            });
            return Object.values(obj);
        }
        formatUploadFileData.value[fileItem] = {};
        formatData.map((ele) => {
            let originFiles = ele.filePath ? JSON.parse(ele.filePath) : [];      
            originFiles = concatFiles(originFiles);
            originFiles.length &&
                originFiles.map((item) => {
                    const files = [];
                    const fileTypes = [];
                    const lackfileTypes = [];
                    const filePath = [];
                    if (item.files && item.files.length) {
                        item.files.map((subFile) => {
                            files.push({
                                name: subFile.fileName.indexOf('.') > -1 ? subFile.fileName : (subFile.fileName + (subFile.fileSuffix[0] == '.' ? '' : '.') + subFile.fileSuffix),
                                filePath: subFile.filePath,
                                fileSuffix: subFile.fileSuffix ? ((subFile.fileSuffix[0] == '.' ? '' : '.') + subFile.fileSuffix ) : ('.' + subFile.fileName.split('.')[subFile.fileName.split('.').length - 1])
                            });
                            fileTypes.push(subFile.fileType);
                            filePath.push(subFile.filePath);
                        });
                        formatUploadFileData.value[fileItem][item.fileName] = {
                            name: item.fileName,
                            fileList: files,
                            fileTypes: fileTypes,
                            lackfileTypes: lackfileTypes,
                            filePath: filePath,
                            geologyId: ele.geologyId,
                            id: ele.id || '',
                            fileType: ele.fileType,
                            isCalculate: item.isCalculate || 0,
                        };
                        if (item.type) {
                            // 道路数据类型回填
                            formatUploadFileData.value[fileItem][item.fileName]['type'] = item.type;
                        }
                    }
                });
            // if (fileType == 7) {
            //     // 代表已有道路数据，需要补充进去道路类型
            //     formatUploadFileData.value[fileItem][ele.fileName]['roadType'] = ele.roadType;
            // }
            console.log('originFiles++++++++', originFiles);
        });
        nextTick(() => {
            elevationFileGroupRef.value.echoFileListData(
                formatUploadFileData.value['ElevationData'],
                route.query.id,
                4,
            );

            tileDataFileGroupRef.value.echoFileListData(
                formatUploadFileData.value['TileData'],
                route.query.id,
                9,
            );

            avoidFileGroupRef.value.echoFileListData(
                formatUploadFileData.value['AreaOfAvoidance'],
                route.query.id,
                5,
            );
            console.log('507行-----', formatUploadFileData.value['AreaOfAvoidance'])

            roadFileGroupRef.value.echoFileListData(
                formatUploadFileData.value['ExistingRoad'],
                route.query.id,
                7,
            );

            coarseFileGroupRef.value.echoFileListData(
                formatUploadFileData.value['Roughness'],
                route.query.id,
                2,
            );
            deployFileGroupRef.value.echoFileListData(
                formatUploadFileData.value['MachineArea'],
                route.query.id,
                8,
            );
            lightFileGroupRef.value.echoFileListData(
                formatUploadFileData.value['LightData'],
                route.query.id,
                100,
            );
        });
    };
    const downloadFileEvent = (path) => {
        if (path) {
            downLoadFile(path);
        }
    };
    const echoFileDataEvent = () => {
        getGeologyDetail(route.query.id).then((res) => {
            // 请求详情回显地形图数据
            // 文件类型 1地形图 2粗糙度 3 地勘报告 4 高程数据 5 避让区域shp文件 6 避让区域坐标文件 7已有道路 8 可布机区域 10 彩云地形图
            if (res.code == 200) {
                const filesData = res.data.geologyFileRespList || [];
                filesData.length &&
                    filesData.map((ele) => {
                        switch (ele.fileType) {
                            case 100:
                                filterDetailFiles('LightData', 100, filesData);
                                break;
                            case 4:
                                filterDetailFiles('ElevationData', 4, filesData);
                                break;
                            case 9:
                                filterDetailFiles('TileData', 9, filesData);
                                break;
                            case 5:
                                filterDetailFiles('AreaOfAvoidance', 5, filesData);
                                break;
                            case 7:
                                filterDetailFiles('ExistingRoad', 7, filesData);
                                break;
                            case 8:
                                filterDetailFiles('MachineArea', 8, filesData);
                                break;
                            case 2:
                                filterDetailFiles('Roughness', 2, filesData);
                                break;
                            case 1:
                                filterDetailFiles('地形图', 1, filesData);
                                break;
                        }
                        // }
                    });
                console.log(formatUploadFileData.value, '-----回显处理完的数据格式');
            }
        });
    };
    onMounted(() => {
        formatUploadFileData.value = {};
        if (route.query.id) {
            sessionStorage.setItem('geologyId', route.query.id);
            echoFileDataEvent();
        }
    });
</script>
<style scoped lang="scss">
    .geography-manage-template {
        background: #fff;
        padding: 20px 24px;
        h4 {
            display: flex;
            align-items: center;
            margin-bottom: 24px;
            img {
                margin-right: 8px;
                height: 14px;
            }
        }
        .flex-box {
            > p {
                margin-right: 16px;
                color: #363b4d;
                margin-bottom: 12px;
            }
        }
        .file-handle {
            // width: 52px;
            // height: 52px;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            :deep(.ant-upload.ant-upload-select) {
                flex: none;
                width: 52px;
                height: 52px;
            }
            :deep(.ant-upload-wrapper.ant-upload-picture-card-wrapper) {
                height: 52px;
                flex: none;
                width: 52px;
            }
            .file-handle-desc {
                font-size: 12px;
                display: flex;
                flex-direction: column;
                justify-content: center;
            }
        }
        .file-limit-desc {
            font-size: 12px;
            color: #999;
            margin-left: 16px;
        }
        .file-handle-list {
            margin-top: 12px;
            .handle-list-item {
                background-color: #fafafa;
                padding: 10px 16px;
                font-size: 12px;
                position: relative;
                border-radius: 4px;
                margin-bottom: 24px;
                p {
                    margin-bottom: 12px;
                    display: flex;
                    align-items: center;
                    font-size: 12px;
                    color: #21263f;
                    iconpark-icon {
                        margin-right: 8px;
                    }
                }
                .close {
                    position: absolute;
                    width: 14px;
                    height: 14px;
                    right: -7px;
                    top: -6px;
                    opacity: 0.5;
                    cursor: pointer;
                }
            }
            .list-item-select {
                position: absolute;
                top: 14px;
                right: 16px;
                iconpark-icon {
                    margin-left: 5px;
                }
                a {
                    color: #7c8294;
                }
            }
            .handle-list-item-simple {
                background-color: transparent;
                padding: 10px 0;
                margin-top: -4px;
                p {
                    position: absolute;
                    margin: 0;
                    .close {
                        width: 14px;
                        height: 14px;
                        position: absolute;
                        width: 14px;
                        height: 14px;
                        right: -20px;
                        top: -6px;
                        opacity: 0.5;
                        cursor: pointer;
                        // display: none;
                    }
                    &:hover {
                        .close {
                            display: block;
                        }
                    }
                }
            }
        }
    }
    .loading-template {
        position: fixed;
        top: 0;
        right: 0;
        left: 0;
        bottom: 0;
        background-color: rgba($color: #fff, $alpha: 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9;
        transition: all 0.4s;
        flex-direction: column;
        span {
            font-size: 14px;
            margin-top: 16px;
        }
    }
</style>
