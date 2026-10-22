<template>
    <div class="left-indent" v-loading="[fanPointLoading, true]">
        <Upload
            ref="fanLocationRef"
            :fileTypes="'xlsx,kmz,kml,ovkml'"
            v-model:defaultFiles="fanFile"
            :fileTypeMessage="'请上传模板数据文件'"
            :isImmediatelyUpload="false"
            @upFileList="upFileList"
            :disabled="fanDisabled"
        >
            <template v-slot:tip>
                <span class="illustrate" v-if="illustrate">{{ illustrate }}</span>
                <p class="line-download illustrate" v-else>
                    <span>说明：支持xlsx/kmz/kml/ovkml格式数据，xlsx数据需</span>
                    <a href="javascript:;" @click.stop="downLoadFile(templatePath['fan'])"
                        >下载数据模板.xlsx
                    </a>
                </p>
            </template>
        </Upload>
        <template v-if="fanLocationErrorInfos.length">
            <p class="error-info-title">
                <InfoCircleOutlined style="color: #fe830f" />
                导入数据存在以下异常，请修正后重新上传
            </p>
            <ul class="error-info-list">
                <template v-for="item in fanLocationErrorInfos" :key="index">
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
        checkPointInArea, // 检测风机点位文件
    } from '@/api/modules/wind/firstStep';
    import usefieldFanDataStore from '@/pinia/modules/fieldFanData';
    import JSZip from 'jszip';
    import { formatKMLFileEvent } from '@/utils/formatKMLFile';
    import { getPolygonCenterPoint } from '@/utils/getPolygonCenterPoint';
    import { checkPointInAreaUtils } from '@/utils/checkPointInAreaUtils';
    import { isPolygonSelfIntersecting } from '@/utils/isPolygonSelfIntersecting'; // 验证封闭区域是否存在自相交
    import { message } from 'ant-design-vue';
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
        noNeedPointData: {
            type: Boolean,
            default: false,
        },
        illustrate: {
            type: String,
            default: '上传已填写的模板数据',
        },
    });
    const emits = defineEmits(['checkFormValidateFields']);
    const fanDisabled = ref(true);
    const fanLocationRef = ref(null);
    const ossUpload = useOssUpload('fd/');
    const fanPointLoading = ref(false);
    const fanLocationErrorInfos = ref([]);
    const fanFile = ref([]);
    const fanPointFileList = ref([]);
    const fanPointFileInfo = ref([]);
    const fanPointFileData = ref([]); // 风机点位（中心点）数据
    const fanPointPolygonFileData = ref([]); // 风机封闭区域多边形数据
    // 拿到文件数据后进行相应的处理
    const getFileDataToHandle = async (file, data, isPoint) => {
        console.log(data, '场区数据', fieldFanDataStore.pointData);
        const polygonPointData = []; // 场区数据
        for (let index = 0; index < fieldFanDataStore.pointData.length; index++) {
            const polygonPointDataItem = [
                fieldFanDataStore.pointData[index]['longitude'] * 1,
                fieldFanDataStore.pointData[index]['latitude'] * 1,
            ];
            polygonPointData.push(polygonPointDataItem);
        }
        console.log(polygonPointData, '场区数据');
        // 封闭区域中心点数据集
        const centerPointArr = [];
        if (!isPoint) {
            // 找到封闭区域的中心点
            const polygonData = JSON.parse(JSON.stringify(data));
            for (let index = 0; index < polygonData.length; index++) {
                const ele = polygonData[index];
                centerPointArr.push(getPolygonCenterPoint(ele));
            }
        }
        // 验证风机点位是否在场区范围内
        let isAllInArea = true;
        if (isPoint) {
            for (let index = 0; index < data.length; index++) {
                data[index]['longitude'] = data[index]['longitude'] * 1;
                data[index]['latitude'] = data[index]['latitude'] * 1;
                const pointEle = data[index];
                console.log(pointEle, '------');
                const result = checkPointInAreaUtils(
                    [pointEle['longitude'] * 1, pointEle['latitude'] * 1],
                    polygonPointData,
                );
                console.log(pointEle, '------', result);
                if (!result) {
                    isAllInArea = false;
                    break;
                }
            }
        } else {
            console.log(centerPointArr, '----中心点');
            for (let index = 0; index < centerPointArr.length; index++) {
                centerPointArr[index]['longitude'] = centerPointArr[index]['longitude'] * 1;
                centerPointArr[index]['latitude'] = centerPointArr[index]['latitude'] * 1;
                const pointEle = centerPointArr[index];
                const result = checkPointInAreaUtils(
                    [pointEle['longitude'] * 1, pointEle['latitude'] * 1],
                    polygonPointData,
                );
                console.log(pointEle, '------', result);
                if (!result) {
                    isAllInArea = false;
                    break;
                }
            }
        }
        if (!props.noNeedPointData && !isAllInArea) {
            // 如果存在不在场区的点，需要拦截后续操作，并且给出提示信息
            message.error('风机点位不在场区范围内，请重新上传');
            fanPointLoading.value = false;
            return false;
        }
        if (isPoint) {
            eventBus.emit('uploadFanPolygon', []);
            eventBus.emit('uploadFan', data);
        } else {
            fanPointPolygonFileData.value = data;
            console.log(data, '风机多边形区域数据');
            eventBus.emit('uploadFanPolygon', data);
            eventBus.emit('uploadFan', centerPointArr);
        }
        fanLocationErrorInfos.value = [];
        fanPointLoading.value = false;
        console.log(data, polygonPointData, centerPointArr, '给后台的数据格式');
        // 封闭区域给中心点数据，反之给点数据
        fanPointFileData.value = centerPointArr.length ? centerPointArr : data;

        // fanFile.value.push(file);
        fieldFanDataStore.fanFile.push(file);
        // 上传至华为云获取文件线上路径
        let uploadResult = await ossUpload.uploadFile(file, sessionStorage.getItem('obsFilePath'));
        console.log('+++++++++++++++++');
        fanPointFileInfo.value.push({
            fileName: file.name,
            filePath: uploadResult.obsPath,
            suffix: '.' + file.name.split('.')[file.name.split('.').length - 1],
        });
        console.log(fanPointFileInfo.value, '文件信息');
        
        emits('checkFormValidateFields');
    };
    // kml文件预处理
    const proFormatKMLFile = async (file) => {
        let kmlResultData = null;
        const handleKmlFileData = (kmlResultData) => {
            // 文件存在有效数据，进行下面特殊格式处理
            const isPoint = kmlResultData.pointData.length > 0;
            let originData = [];
            let datas = [];
            originData = isPoint ? kmlResultData.pointData : kmlResultData.polygonData;
            if (!originData.length) {
                fanPointLoading.value = false;
                message.error('导入数据需为单个或多个封闭区域(点)数据，请重新上传！');
                return false;
            }
            if (originData.length) {
                for (let index = 0; index < originData.length; index++) {
                    const ele = originData[index];
                    if (isPoint) {
                        // 如果是点文件数据
                        datas.push({
                            longitude: ele.longitude,
                            latitude: ele.latitude,
                        });
                    } else {
                        datas = originData;
                    }
                }
                console.log(datas);
                getFileDataToHandle(file, datas, isPoint);
            }
        };
        // kmz格式文件处理，解压出kml文件
        const kmzFileEvent = async (fileParams) => {
            const jszip = new JSZip();
            const jszipResult = await jszip.loadAsync(fileParams);
            console.log(jszipResult);
            // 找到kmz中kml文件索引值
            const kmlFileIndex = Object.keys(jszipResult.files).findIndex(
                (ele) => ele.indexOf('.kml') > -1,
            );
            console.log(kmlFileIndex);
            if (kmlFileIndex == -1) {
                fanPointLoading.value = false;
                message.error('导入数据需为单个或多个封闭区域数据，请重新上传！');
                fanLocationRef.value.deleteItem();
                return false;
            }
            const kmlFile = Object.values(jszipResult.files)[kmlFileIndex];
            if (kmlFile) {
                const kmlText = await kmlFile.async('text');
                kmlResultData = formatKMLFileEvent(kmlText);
                if (kmlResultData.polygonData.length || kmlResultData.pointData.length) {
                    handleKmlFileData(kmlResultData);
                } else {
                    fanPointLoading.value = false;
                    message.error('导入数据需为单个或多个封闭区域数据，请重新上传！');
                    fanLocationRef.value.deleteItem();
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
                console.log(kmlResultData);
                if (
                    (kmlResultData.polygonData && kmlResultData.polygonData.length) ||
                    (kmlResultData.pointData && kmlResultData.pointData.length)
                ) {
                    handleKmlFileData(kmlResultData);
                } else {
                    fanPointLoading.value = false;
                    message.error('导入数据需为单个或多个封闭区域(点)数据，请重新上传！');
                    fanLocationRef.value.deleteItem();
                }
            };
            reader.readAsText(file);
        }
    };
    // xlsx文件预处理
    const proFormatExcelFile = async (file) => {
        const formData = new FormData();
        console.log(fieldFanDataStore.pointData, '存储信息情况');
        formData.append('file', file);
        formData.append('coordinates', JSON.stringify(fieldFanDataStore.pointData));
        formData.append('uniqueIdentification', fieldFanDataStore.uniqueIdentificationUUID);
        try {
            const data = await checkPointInArea(formData);
            fanPointFileData.value = '[]';
            fanPointPolygonFileData.value = '[]';
            fanLocationErrorInfos.value = [];
            fanFile.value = [];
            fieldFanDataStore.fanFile = [];
            if (data && data.code === 200) {
                fanPointLoading.value = false;
                // 校验成功！
                if (data.data) {
                    fanPointFileData.value =
                        typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
                    getFileDataToHandle(
                        file,
                        fanPointFileData.value,
                        fanPointFileData.value.length,
                    );
                }
            } else {
                fanPointLoading.value = false;
                // 接口失败情况，存在校验信息情况下
                fanPointFileList.value = [];
                fanPointFileData.value = [];
                fanPointPolygonFileData.value = [];
                fanLocationRef.value.deleteItem();
                fieldFanDataStore.fanFile = [];
                if (data.data) {
                    fanLocationErrorInfos.value = data.data.split('/n');
                } else if (data.msg) {
                    fanLocationErrorInfos.value = [data.msg];
                }
                if (data.code !== 500) {
                    message.error(data.msg);
                }
            }
        } catch (error) {
            fanPointLoading.value = false;
            fanPointFileList.value = [];
            fanPointFileData.value = [];
            fanPointPolygonFileData.value = [];
            fanLocationRef.value.deleteItem();
        }
    };
    // 风机点位文件上传
    const upFileList = async (file) => {
        fanPointFileList.value = [file];
        fanPointFileInfo.value = [];
        if (!props.noNeedPointData && !fieldFanDataStore.pointData.length) {
            message.error('请先上传场区坐标文件');
            return false;
        }
        // fanPointLoading.value = true;
        if (file.name.toLocaleLowerCase().indexOf('.xlsx') > -1) {
            proFormatExcelFile(file);
        } else {
            const result = await proFormatKMLFile(file);
            console.log(result, '除excel文件外的数据情况');
        }

        // (通知校验表单风机)
    };
    const getFanDisabled = (value) => {
        console.log(value);
        // 场区组件删除文件，需要关闭风机上传按钮功能
        clearFanDataEvent();
        fanDisabled.value = value;
    };
    // 下载模板文件
    const downLoadFile = (path) => {
        window.open(path);
    };
    // 风机数据清空
    const clearFanDataEvent = () => {
        fanFile.value = [];
        fanPointFileList.value = [];
        fanPointFileInfo.value = [];
        fanPointFileData.value = [];
        fanPointPolygonFileData.value = [];
        fanLocationErrorInfos.value = [];
        fieldFanDataStore.fanFile = [];
        try {
            fanLocationRef.value.deleteItem(0);
        } catch (error) {}
        eventBus.emit('uploadFan', []);
        emits('clearValidateFan');
    };
    watch(
        () => fanFile.value.length,
        () => {
            if (!fanFile.value.length) {
                console.log('没进来？');
                // 用户删除风机文件，对应的风机坐标数据也要删除
                fanPointFileData.value = [];
                fanPointPolygonFileData.value = [];
                fieldFanDataStore.fanFile = [];
                // fanDisabled.value = false;
                eventBus.emit('uploadFan', []);
                eventBus.emit('uploadFanPolygon', []);
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
        // 监听场区文件删除，需要清除风机数据
        eventBus.on('clearFanData', clearFanDataEvent);
    });
    onBeforeUnmount(() => {
        eventBus.off('fanDisabled', getFanDisabled);
    });
    defineExpose({
        fanPointFileData,
        fanPointPolygonFileData,
        fanPointFileInfo,
        fanFile,
        fanLocationRef,
    });
</script>
<style scoped lang="scss">
.illustrate {
    font-size: 12px;
    color: #7c8294;
    font-family: PingFangSC, PingFang SC;
    line-height: 20px;
}
.error-info-title {
    font-size: 12px;
    margin-top: 12px;
    color: #7c8294;
}
.error-info-list {
    font-size: 12px;
    color: #f5222d;
}
</style>
<!-- <style scoped lang="scss">
    @import '../fieldPoint/fieldPoint.scss';
</style> -->
