<template>
    <div v-loading="[boosterPointLoading, true]">
        <Upload
            ref="boosterLocationRef"
            :fileTypes="'xlsx,kmz,kml,ovkml'"
            v-model:defaultFiles="boosterFile"
            :fileTypeMessage="'请上传模板数据文件'"
            :isImmediatelyUpload="false"
            @upFileList="upFileList"
            :disabled="fanDisabled"
        >
            <template v-slot:tip>
                <span class="illustrate" v-if="illustrate">{{ illustrate }}</span>
                <p class="line-download illustrate" v-else>
                    <span>说明：支持xlsx/kmz/kml/ovkml格式数据，xlsx数据需</span>
                    <a
                        href="javascript:;"
                        @click.stop="downLoadFile(templatePath['boosterStation'])"
                        >下载数据模板.xlsx
                    </a>
                </p>
            </template>
        </Upload>
        <template v-if="boosterLocationErrorInfos.length">
            <p class="error-info-title">
                <InfoCircleOutlined style="color: #fe830f" />
                导入数据存在以下异常，请修正后重新上传
            </p>
            <ul class="error-info-list">
                <template v-for="item in boosterLocationErrorInfos" :key="index">
                    <li v-if="item">
                        {{ item }}
                    </li>
                </template>
            </ul>
        </template>
    </div>
</template>
<script setup>
    import { ref, watch, onBeforeMount, onBeforeUnmount } from 'vue';
    import { templatePath } from '@/assets/js/static.js';
    import Upload from '@/components/steps/components/upload/Upload.vue';
    import eventBus from '@/utils/eventBus';
    import { useOssUpload } from '@/components/ossClient/modifytUpload';
    import { InfoCircleOutlined } from '@ant-design/icons-vue';
    import {
        checkPointInArea, // 检测升压站/开关站点位文件
    } from '@/api/modules/wind/firstStep';
    import usefieldFanDataStore from '@/pinia/modules/fieldFanData';
    import JSZip from 'jszip';
    import { message } from 'ant-design-vue';
    import { formatKMLFileEvent } from '@/utils/formatKMLFile';
    import { getPolygonCenterPoint } from '@/utils/getPolygonCenterPoint'; // 获取多边形中心点
    import { checkPointInAreaUtils } from '@/utils/checkPointInAreaUtils'; // 验证升压站/开关站点位是否在场区范围内
    import { isPolygonSelfIntersecting } from '@/utils/isPolygonSelfIntersecting'; // 验证封闭区域是否存在自相交
    import { pointDistance } from '@/utils/pointDistance';
    import { findPolygonCenter } from '@/utils/findPolygonCenter.js';
    import * as XLSX from 'xlsx';
    let fieldFanDataStore = usefieldFanDataStore();
    const props = defineProps({
        pointType: {
            type: Number,
            default: 1,
        },
        handleDisabled: {
            type: Boolean,
            default: false,
        },
        boosterLocationHandleForm: {
            type: Number,
            default: 0, // 0是中心点，1是封闭区域, 2是中心点或者封闭区域
        },
        mapKey: {
            type: Number,
            default: 0, // 用户渲染多个地图时候，数据之间不会相互影响
        },
        noNeedPointData: {
            type: Boolean,
            default: false, // 是否需要场区点位验证
        },
        illustrate: {
            type: String,
            default: '上传已填写的模板数据',
        },
    });
    const emits = defineEmits(['checkFormValidateFields']);
    const fanDisabled = ref(true);
    const boosterLocationRef = ref(null);
    const ossUpload = useOssUpload('fd/');
    const boosterPointLoading = ref(false);
    const boosterLocationErrorInfos = ref([]);
    const boosterFile = ref([]);
    const boosterPointFileList = ref([]);
    const boosterPointFileInfo = ref([]);
    const boosterPointFileData = ref([]); // 升压站/开关站点位（中心点）数据
    const boosterPointPolygonFileData = ref([]); // 升压站封闭区域多边形数据
    // 拿到文件数据后进行相应的处理
    const getFileDataToHandle = async (file, data, isPoint) => {
        console.log(fieldFanDataStore.pointData, data, '场区数据', isPoint);
        const polygonPointData = []; // 场区数据
        for (let index = 0; index < fieldFanDataStore.pointData.length; index++) {
            const polygonPointDataItem = [
                fieldFanDataStore.pointData[index]['longitude'] * 1,
                fieldFanDataStore.pointData[index]['latitude'] * 1,
            ];
            polygonPointData.push(polygonPointDataItem);
        }
        // console.log(polygonPointData, '场区数据');
        // 封闭区域中心点数据集
        const centerPointArr = [];
        if (!isPoint) {
            // 找到封闭区域的中心点
            const polygonData = JSON.parse(JSON.stringify(data));
            for (let index = 0; index < polygonData.length; index++) {
                polygonData[index]['longitude'] = polygonData[index]['longitude'] * 1;
                polygonData[index]['latitude'] = polygonData[index]['latitude'] * 1;
                const ele = polygonData[index];
                centerPointArr.push(getPolygonCenterPoint(ele));
            }
        }
        // 验证升压站/开关站点位是否在场区范围内
        let isAllInArea = true;
        let distanceLimit = 20; // 升压站距离限制20公里
        let distance = 0;
        if (isPoint) {
            for (let index = 0; index < data.length; index++) {
                data[index]['longitude'] = data[index]['longitude'] * 1;
                data[index]['latitude'] = data[index]['latitude'] * 1;
                const pointEle = data[index];
                // 有场区数据情况下
                if (!props.noNeedPointData) {
                    const centerPoint = findPolygonCenter(fieldFanDataStore.pointData);
                    distance = pointDistance(
                        {
                            longitude: pointEle['longitude'],
                            latitude: pointEle['latitude'],
                        },
                        centerPoint,
                    );
                    console.log('distance', distance);
                    isAllInArea = distance < distanceLimit;
                } else {
                    isAllInArea = true;
                }
            }
        } else {
            // console.log(centerPointArr, '----中心点');
            for (let index = 0; index < centerPointArr.length; index++) {
                centerPointArr[index]['longitude'] = centerPointArr[index]['longitude'] * 1;
                centerPointArr[index]['latitude'] = centerPointArr[index]['latitude'] * 1;
                const pointEle = centerPointArr[index];
                if (!props.noNeedPointData) {
                    const centerPoint = findPolygonCenter(fieldFanDataStore.pointData);
                    distance = pointDistance(
                        {
                            longitude: pointEle['longitude'],
                            latitude: pointEle['latitude'],
                        },
                        centerPoint,
                    );
                    console.log('distance', distance);
                    isAllInArea = distance < distanceLimit;
                } else {
                    isAllInArea = true;
                }
            }
        }
        if (!props.noNeedPointData && !isAllInArea) {
            // 如果存在不在场区的点，需要拦截后续操作，并且给出提示信息
            // message.error('升压站/开关站点位不在场区范围内，请重新上传');
            message.error('升压站/开关站点位超过场区中心点20公里，请重新上传');
            boosterPointLoading.value = false;
            return false;
        }
        if (isPoint) {
            // 如果有文件数据了，出现了替换的情况
            // if (boosterFile.value.length) {
            //     eventBus.emit('uploadBoosterPolygon', {data: [], key: props.mapKey});
            // }
            eventBus.emit('uploadBooster', { data: data, key: 'boosterMap' + props.mapKey });
        } else {
            boosterPointPolygonFileData.value = data;
            console.log(data, '风机多边形区域数据', centerPointArr);
            const isTureOrFalse = isPolygonSelfIntersecting(data);
            console.log('是否自相交', isTureOrFalse);
            eventBus.emit('uploadBoosterPolygon', { data: data, key: 'boosterMapPolygon' + props.mapKey });
            eventBus.emit('uploadBooster', {data: centerPointArr, key: 'boosterMap' + props.mapKey});
            // eventBus.emit('uploadBooster', {data: [], key: props.mapKey});
        }
        boosterFile.value = [];
        boosterFile.value.push(file);
        // boosterFile.value = [file];
        fieldFanDataStore.boosterFile[props.mapKey] = file;
        // 上传至华为云获取文件线上路径
        let uploadResult = await ossUpload.uploadFile(file, sessionStorage.getItem('obsFilePath'));
        console.log('+++++++++++++++++');
        boosterPointFileInfo.value.push({
            fileName: file.name,
            filePath: uploadResult.obsPath,
            suffix: '.' + file.name.split('.')[file.name.split('.').length - 1],
        });
        boosterPointFileData.value = isPoint ? data : centerPointArr;
        console.log('最后的升压站数据', boosterPointFileData.value);
        boosterPointLoading.value = false;
        emits('checkFormValidateFields');
    };
    // kml文件预处理
    const proFormatKMLFile = async (file) => {
        let kmlResultData = null;
        const handleKmlFileData = (kmlResultData) => {
            // 文件存在有效数据，进行下面特殊格式处理
            const isPoint = props.boosterLocationHandleForm == 0;
            let originData = [];
            let datas = [];
            originData = isPoint ? kmlResultData.pointData : kmlResultData.polygonData;
            console.log(isPoint, kmlResultData, originData);

            if (props.boosterLocationHandleForm !== 2) {
                // 如果不是2的情况下，需要严格判断是点数据还是封闭区域数据
                if (
                    (isPoint && kmlResultData.polygonData.length) ||
                    (!isPoint && kmlResultData.pointData.length) ||
                    (isPoint && kmlResultData.pointData.length > 1) ||
                    (!isPoint && kmlResultData.polygonData.length > 1)
                ) {
                    message.error(
                        `导入数据需为单个${
                            props.boosterLocationHandleForm == 0 ? '点' : '封闭区域'
                        }数据，请重新上传！`,
                    );
                    boosterPointLoading.value = false;
                    clearBoosterDataEvent();
                    console.log(fieldFanDataStore);
                    return false;
                }
            } else {
                // 如果是2的情况下，则允许单个点数据或者单个封闭区域数据
                if (kmlResultData.pointData.length > 1 || kmlResultData.polygonData.length > 1) {
                    message.error(`导入数据需为单个点或封闭区域数据，请重新上传！`);
                    boosterPointLoading.value = false;
                    clearBoosterDataEvent();
                    return false;
                }
                originData = kmlResultData.pointData.length ? kmlResultData.pointData : kmlResultData.polygonData;
            }
            
            if (originData.length) {
                for (let index = 0; index < originData.length; index++) {
                    const ele = originData[index];
                    if (kmlResultData.pointData.length) {
                        // 如果是点文件数据
                        datas.push({
                            longitude: ele.longitude,
                            latitude: ele.latitude,
                        });
                    } else {
                        datas = originData;
                    }
                }
                // console.log(datas);
                getFileDataToHandle(file, datas, !!kmlResultData.pointData.length);
            } else {
            }
        };
        // kmz格式文件处理，解压出kml文件
        const kmzFileEvent = async (fileParams) => {
            const jszip = new JSZip();
            const jszipResult = await jszip.loadAsync(fileParams);
            // 找到kmz中kml文件索引值
            const kmlFileIndex = Object.keys(jszipResult.files).findIndex(
                (ele) => ele.indexOf('.kml') > -1,
            );
            if (kmlFileIndex == -1) {
                message.error(
                    `导入数据需为单个${
                        props.boosterLocationHandleForm == 0 ? '点' : '封闭区域'
                    }数据，请重新上传！`,
                );
                boosterLocationRef.value.deleteItem();
                return false;
            }
            const kmlFile = Object.values(jszipResult.files)[kmlFileIndex];
            if (kmlFile) {
                const kmlText = await kmlFile.async('text');
                kmlResultData = formatKMLFileEvent(kmlText);
                if (kmlResultData.polygonData.length || kmlResultData.pointData.length) {
                    handleKmlFileData(kmlResultData);
                } else {
                    message.error(
                        `导入数据需为单个${
                            props.boosterLocationHandleForm == 0 ? '点' : '封闭区域'
                        }数据，请重新上传！`,
                    );
                    boosterLocationRef.value.deleteItem();
                    return false;
                }
            }
        };

        if (file.name.toLocaleLowerCase().indexOf('.kmz') > -1) {
            await kmzFileEvent(file);
            return false;
        } else if (
            file.name.toLocaleLowerCase().indexOf('.kml') > -1 ||
            file.name.toLocaleLowerCase().indexOf('.ovkml') > -1
        ) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const kmlText = e.target.result;
                kmlResultData = formatKMLFileEvent(kmlText);
                // console.log(kmlResultData);
                if (props.boosterLocationHandleForm == 0) {
                    // 代表应该传中心点文件
                    if (kmlResultData.pointData && kmlResultData.pointData.length == 1) {
                        handleKmlFileData(kmlResultData);
                    } else {
                        message.error(
                            `导入数据需为单个${
                                props.boosterLocationHandleForm == 0 ? '点' : '封闭区域'
                            }数据，请重新上传！`,
                        );
                        boosterPointLoading.value = false;
                        boosterLocationRef.value.deleteItem();
                        // handleKmlFileData(kmlResultData);
                    }
                } else {
                    // 代表应该传封闭区域文件
                    if (kmlResultData.polygonData && kmlResultData.polygonData.length == 1) {
                        handleKmlFileData(kmlResultData);
                    } else {
                        message.error(
                            `导入数据需为单个${
                                props.boosterLocationHandleForm == 0 ? '点' : '封闭区域'
                            }数据，请重新上传！`,
                        );
                        boosterPointLoading.value = false;
                        boosterLocationRef.value.deleteItem();
                    }
                }
                // if (
                //     (kmlResultData.polygonData && kmlResultData.polygonData.length) ||
                //     (kmlResultData.pointData && kmlResultData.pointData.length)
                // ) {
                //     handleKmlFileData(kmlResultData);
                // } else {
                //     message.error('导入数据需为单个或多个封闭区域(点)数据，请重新上传！');
                //     boosterLocationRef.value.deleteItem();
                // }
            };
            reader.readAsText(file);
        }
    };
    // xlsx文件预处理
    const proFormatExcelFile = async (file) => {
        const formData = new FormData();
        // console.log(fieldFanDataStore.pointData, '存储信息情况');
        formData.append('file', file);
        formData.append('coordinates', JSON.stringify(fieldFanDataStore.pointData));
        formData.append('uniqueIdentification', fieldFanDataStore.uniqueIdentificationUUID);
        // 数据重置
        const clearFileAndData = () => {
            boosterPointLoading.value = false;
            boosterPointFileList.value = [];
            boosterPointFileData.value = [];
            boosterPointPolygonFileData.value = [];
            boosterLocationRef.value.deleteItem();
        };

        try {
            const data = await checkPointInArea(formData);
            boosterPointFileData.value = '[]';
            boosterPointPolygonFileData.value = '[]';
            boosterLocationErrorInfos.value = [];
            boosterFile.value = [];
            fieldFanDataStore.boosterFile[props.mapKey] = null;
            if (data && data.code === 200) {
                // 校验成功！
                if (data.data) {
                    console.log(data.data);
                    let resultData =
                        typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
                    let resultPolygonData = [];
                    if (props.boosterLocationHandleForm == 0) {
                        // 代表中心点形式，文件内数据只能有一个点位
                        if (resultData.length !== 1) {
                            // 需要拦截后续操作，并且给用户提示
                            message.error('导入数据需为单个点数据，请重新上传！');
                            clearFileAndData();
                            return false;
                        }
                    } else {
                        // 代表封闭区域形式，文件内数据至少有三个点位
                        if (resultData.length < 3) {
                            // 需要拦截后续操作，并且给用户提示
                            message.error('导入数据需至少为三个点数据，请重新上传！');
                            clearFileAndData();
                            return false;
                        } else {
                            // resultData数据需要改造
                            console.log(resultData);
                            for (let index = 0; index < resultData.length; index++) {
                                const element = resultData[index];
                                resultPolygonData.push([
                                    element.latitude * 1,
                                    element.longitude * 1,
                                ]);
                            }
                        }
                    }
                    boosterPointFileData.value = resultPolygonData.length
                        ? [resultPolygonData]
                        : resultData;
                    console.log(boosterPointFileData.value);
                    getFileDataToHandle(file, boosterPointFileData.value, resultData.length == 1);
                }
            } else {
                clearFileAndData();
                fieldFanDataStore.boosterFile[props.mapKey] = null;
                if (data.data) {
                    boosterLocationErrorInfos.value = data.data.split('/n');
                }
            }
        } catch (error) {
            clearFileAndData();
        }
    };
    const proFormatExcelFileNew = async (file) => {
        // 数据重置
        const clearFileAndData = () => {
            boosterPointLoading.value = false;
            boosterPointFileList.value = [];
            boosterPointFileData.value = [];
            boosterPointPolygonFileData.value = [];
            boosterLocationRef.value.deleteItem();
        };
        boosterPointFileData.value = '[]';
        boosterPointPolygonFileData.value = '[]';
        boosterLocationErrorInfos.value = [];
        boosterFile.value = [];
        fieldFanDataStore.boosterFile[props.mapKey] = null;
        const reader = new FileReader();
        reader.onload = async function (e) {
            const data = e.target.result;
            const workbook = XLSX.read(data, { type: 'array' });
            const fristSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(fristSheet);
            console.log(jsonData, 'jsonData');
            const resultData = [];
            if (jsonData && jsonData.length) {
                for (let index = 0; index < jsonData.length; index++) {
                    resultData.push({
                        longitude: jsonData[index]['经度/X'],
                        latitude: jsonData[index]['纬度/Y'],
                    });
                }
                let resultPolygonData = [];
                if (props.boosterLocationHandleForm == 0) {
                    // 代表中心点形式，文件内数据只能有一个点位
                    if (resultData.length !== 1) {
                        // 需要拦截后续操作，并且给用户提示
                        message.error('导入数据需为单个点数据，请重新上传！');
                        clearFileAndData();
                        return false;
                    }
                } else {
                    // 代表封闭区域形式，文件内数据至少有三个点位
                    if (resultData.length < 3) {
                        // 需要拦截后续操作，并且给用户提示
                        message.error('导入数据需至少为三个点数据，请重新上传！');
                        clearFileAndData();
                        return false;
                    } else {
                        // resultData数据需要改造
                        console.log(resultData);
                        for (let index = 0; index < resultData.length; index++) {
                            const element = resultData[index];
                            resultPolygonData.push([element.latitude * 1, element.longitude * 1]);
                        }
                    }
                }
                boosterPointFileData.value = resultPolygonData.length
                    ? [resultPolygonData]
                    : resultData;
                console.log(boosterPointFileData.value);
                getFileDataToHandle(file, boosterPointFileData.value, resultData.length == 1);
            } else {
                clearFileAndData();
                fieldFanDataStore.boosterFile[props.mapKey] = null;
                message.error('请上传正确的文件！');
            }
        };
        reader.readAsArrayBuffer(file);
    };
    // 升压站/开关站点位文件上传
    const upFileList = async (file) => {
        console.log('删除时候是否请求这个');
        boosterPointFileList.value = [file];
        boosterPointFileInfo.value = [];
        if (!props.noNeedPointData && !fieldFanDataStore.pointData.length) {
            message.error('请先上传场区坐标文件');
            return false;
        }
        // boosterPointLoading.value = true;
        if (file.name.toLocaleLowerCase().indexOf('.xlsx') > -1) {
            // proFormatExcelFile(file);
            proFormatExcelFileNew(file);
        } else {
            const result = await proFormatKMLFile(file);
            // console.log(result, '除excel文件外的数据情况');
        }

        // (通知校验表单风机)
    };
    const getFanDisabled = (value) => {
        // console.log(value);
        // 场区组件删除文件，需要关闭风机上传按钮功能
        clearBoosterDataEvent();
        fanDisabled.value = value;
    };
    // 下载模板文件
    const downLoadFile = (path) => {
        window.open(path);
    };
    // 风机数据清空
    const clearBoosterDataEvent = () => {
        console.log('进来了吗？通知清除升压站数据信息');
        boosterFile.value = [];
        boosterPointFileList.value = [];
        boosterPointFileInfo.value = [];
        boosterPointFileData.value = [];
        boosterPointPolygonFileData.value = [];
        boosterLocationErrorInfos.value = [];
        // fieldFanDataStore.boosterFile = [];
        fieldFanDataStore.boosterFile[props.mapKey] = null;
        console.log(fieldFanDataStore.boosterFile);
        emits('clearBooster');
        try {
            boosterLocationRef.value.deleteItem(0);
        } catch (error) {}
        eventBus.emit('uploadBooster', { data: [], key: 'boosterMap' + props.mapKey });
        eventBus.emit('uploadBoosterPolygon', { data: [], key: 'boosterMap' + props.mapKey });
        emits('clearValidateFan');
    };
    watch(
        () => boosterFile.value.length,
        () => {
            if (!boosterFile.value.length) {
                // 用户删除风机文件，对应的风机坐标数据也要删除
                boosterPointFileData.value = [];
                boosterPointPolygonFileData.value = [];
                // fieldFanDataStore.boosterFile = [];
                fieldFanDataStore.boosterFile[props.mapKey] = null;
                console.log(fieldFanDataStore.boosterFile);
                emits('checkFormValidateFields');
                // fanDisabled.value = false;
                eventBus.emit('uploadBooster', { data: [], key: 'boosterMap' + props.mapKey });
                eventBus.emit('uploadBoosterPolygon', {
                    data: [],
                    key: 'boosterMapPolygon' + props.mapKey,
                });
            }
        },
    );
    watch(
        () => fieldFanDataStore.pointData,
        () => {
            if (props.noNeedPointData) {
                fanDisabled.value = false;
            } else {
                fanDisabled.value = !fieldFanDataStore.pointData.length;
            }
        },
        {
            deep: true,
            immediate: true,
        },
    );
    onBeforeMount(() => {
        // 场区为文件传入，并且有拐点数据，开放上传按钮
        eventBus.on('fanDisabled', getFanDisabled);
        // 监听场区文件删除，需要清除升压站数据
        eventBus.on('clearBoosterData', clearBoosterDataEvent);
    });
    onBeforeUnmount(() => {
        eventBus.off('fanDisabled', getFanDisabled);
    });
    defineExpose({
        boosterPointFileData,
        boosterPointPolygonFileData,
        boosterPointFileInfo,
        boosterFile,
        boosterLocationRef,
    });
</script>
<style scoped lang="scss">
    .illustrate {
        font-size: 12px;
        color: #7c8294;
        font-family:
            PingFangSC,
            PingFang SC;
        line-height: 20px;
    }
</style>

<!-- <style scoped lang="scss">
    @import '../fieldPoint/fieldPoint.scss';
</style> -->
