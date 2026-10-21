<template>
    <div class="weather-home-content">
        <div class="weather-map-template">
            <cesiumMap
                ref="cesiumMapRef"
                @toPostLngLat="getDataFromClick"
                @updateCesiumMapScale="getCesiumMapScale"
                :roadKey="roadKey"
                :resourceMapKey="resourceMapKey"
                :terrainMapKey="terrainMapKey"
            >
                <div class="weather-map-tools">
                    <div class="weather-map-search">
                        <span
                            @click="(activeIndex = 0), clearWeatherData()"
                            :class="
                                activeIndex == 0 ? 'search-type search-type-active' : 'search-type'
                            "
                        >
                            <iconpark-icon
                                size="11"
                                name="zifubai"
                                v-if="activeIndex == 0"
                            ></iconpark-icon>
                            <iconpark-icon size="11" name="zifulan" v-else></iconpark-icon>
                        </span>
                        <!-- <span
                            @click="(activeIndex = 1), clearWeatherData()"
                            :class="
                                activeIndex == 1 ? 'search-type search-type-active' : 'search-type'
                            "
                        >
                            <iconpark-icon
                                name="shangchuanbai"
                                v-if="activeIndex == 1"
                            ></iconpark-icon>
                            <iconpark-icon name="shangchuanlan" v-else></iconpark-icon>
                        </span> -->
                        <span class="search-input" v-if="activeIndex == 0">
                            <a-input
                                v-model:value="mapSearchValue"
                                placeholder="请输入地名或经纬度，如: 113.29965,38.00376"
                            />
                        </span>
                        <span class="search-fileInfo" v-else>
                            <span class="search-file-info" v-if="weatherFileInfo.length">
                                <iconpark-icon name="fujian"></iconpark-icon>
                                <i>{{ weatherFileInfo[0]['fileName'] }} </i>
                            </span>
                            <span
                                class="search-file-delete"
                                v-if="weatherFileInfo.length"
                                @click.stop="clearWeatherData()"
                            >
                                <iconpark-icon name="shanchu"></iconpark-icon>
                            </span>
                        </span>
                        <span class="search-handle" @click="searchFlyTo">
                            <iconpark-icon size="18" color="#a8adbe" name="feiji"></iconpark-icon>
                        </span>
                    </div>
                    <!-- 文件操作模块 -->
                    <div v-if="activeIndex == 1 && !weatherResultKey" class="weather-map-fileBox">
                        <header>场区范围上传</header>
                        <Upload
                            ref="weatherFileRef"
                            :fileTypes="'kmz,kml,ovkml'"
                            v-model:defaultFiles="weatherFile"
                            :fileTypeMessage="'上传附件'"
                            :isImmediatelyUpload="false"
                            @upFileList="upFileList"
                            :showUploadList="false"
                        >
                            <template v-slot:tip>
                                <p style="font-size: 14px">上传附件</p>
                                <p class="illustrate">支持 kml/kmz/ovkml 格式</p>
                            </template>
                        </Upload>
                    </div>
                    <!-- 点位搜索结果面板 -->
                    <div
                        class="weather-map-resultBox"
                        v-if="weatherPointLngLat.length && weatherResultKey"
                    >
                        <div class="result-box-header">
                            <iconpark-icon name="dingwei" style="color: #0389ea"></iconpark-icon>
                            <div>
                                <span style="position: absolute;right: 0px;cursor: pointer;" @click="weatherResultKey = false">
                                    <iconpark-icon :size="10" name="cha"></iconpark-icon>
                                </span>
                                <p>{{ weatherPointAddress }}</p>
                                <p>
                                    <span>经纬度</span>
                                    <i v-if="!weatherPointLngLat.length">--</i>
                                    <i v-else
                                        >{{ weatherPointLngLat[0] }},{{ weatherPointLngLat[1] }}</i
                                    >
                                </p>
                                <p>
                                    <span>轮毂高度</span>
                                    <a-input-number
                                        :controls="false"
                                        v-model:value="hubHeight"
                                        :min="50"
                                        :max="200"
                                        @blur="hubHeightChangeEvent"
                                        style="width: 174px; margin-right: 8px"
                                    >
                                        <template #addonAfter> m </template>
                                    </a-input-number>
                                    <span>50~200</span>
                                </p>
                            </div>
                        </div>
                        <div class="result-box-download">
                            <span>数据下载</span>
                            <!-- <i @click="downloadFileData(PACKAGE_TYPE_TT['ERA5Download'])"
                                >ERA5数据</i
                            > -->
                            <i :class="downLoadDisabled ? 'disabled' : ''" @click="!downLoadDisabled && downloadFileData()">ERA5数据</i>
                            <i :class="downLoadDisabled ? 'disabled' : ''" @click="!downLoadDisabled && downloadFileData(PACKAGE_TYPE_TT['weatherDownload'])"
                                >气象精灵数据</i
                            >
                        </div>
                        <div class="result-box-detail">
                            <ul>
                                <li v-for="item in weatherResultData" :key="item.code">
                                    <span>{{ item.name }}</span>
                                    <span>{{ item.value }} {{ item['code'] == 'winds' && item.value ? '± 0.75' : '' }}</span>
                                </li>
                            </ul>
                            <div class="loading-template" v-if="weatherResultLoading">
                                <a-spin />
                            </div> 
                            <!-- <header>风向玫瑰图</header>
                            <echartsRadar class="echartsRadar"></echartsRadar> -->
                        </div>
                    </div>
                    <!-- 操作地图面板 -->
                    <div class="weather-map-handle">
                        <!-- <span
                            v-for="(item, itemIndex) in weahterHandleData"
                            :key="item.name"
                            :class="weatherHandleIndex == itemIndex ? 'active' : ''"
                            @click="selectMapMode(itemIndex)"
                        >
                            <iconpark-icon
                                size="14"
                                :name="
                                    weatherHandleIndex == itemIndex
                                        ? item.iconNameActive
                                        : item.iconName
                                "
                            ></iconpark-icon>
                            <i>{{ item.name }}</i>
                        </span> -->

                        <span
                            @click="resourceMapKey = !resourceMapKey, roadKey = false, terrainMapKey = false"
                            :class="resourceMapKey ? 'active' : ''"
                        >
                            <iconpark-icon
                                size="14"
                                :name="resourceMapKey ? 'ziyuantupuxuanzhong' : 'ziyuantupumoren'"
                            ></iconpark-icon>
                            <i>资源图谱</i>
                        </span>
                        <span @click="roadKey = !roadKey, terrainMapKey = false, resourceMapKey = false" :class="roadKey ? 'active' : ''">
                            <iconpark-icon
                                size="14"
                                :name="roadKey ? 'luwangxuanzhong' : 'luwangmoren'"
                            ></iconpark-icon>
                            <i>路网</i>
                        </span>
                        <span
                            @click="terrainMapKey = !terrainMapKey, roadKey = false, resourceMapKey = false"
                            :class="terrainMapKey ? 'active' : ''"
                        >
                            <iconpark-icon
                                size="14"
                                :name="terrainMapKey ? '3Dxuanzhong' : '3Dmoren'"
                            ></iconpark-icon>
                            <i>3D地形</i>
                        </span>
                        <!-- <button @click="drawLine">绘制路线测量距离</button> -->
                    </div>
                    <div class="weather-address-search" v-if="isShowAddressResult">
                        <ul>
                            <li
                                v-for="address in addressResult"
                                :key="address.poiType"
                                @click.stop="flyTo(address)"
                            >
                                <img src="@/assets/img/address.png" alt="" />
                                <span>{{ address.name }}--{{ address.address }}</span>
                            </li>
                        </ul>
                    </div>
                    <!-- 地图比例尺面板 -->
                    <div class="weather-map-info">
                        <div class="thermalMapPro">
                            <i v-for="i in 10">
                                {{ i }}
                            </i>
                        </div>
                        <div class="measuringScale">
                            <span>{{ cesiumMapScale }}</span>
                            <i v-if="!mouseMovePointLngLat.length">--</i>
                            <i v-else
                                >{{ mouseMovePointLngLat[0] }},{{ mouseMovePointLngLat[1] }}</i
                            >
                        </div>
                    </div>
                </div>
            </cesiumMap>
        </div>
    </div>
    <projectPackage
        :TipsDialogVisible="TipsDialogVisible"
        :messageType="messageType"
        @changeShowKey="TipsDialogVisible = false"
    ></projectPackage>
</template>

<script setup>
    // 生成报告
    import { useDebounceFn } from '@vueuse/core';
    import { onMounted, ref, h } from 'vue';
    import { useRouter } from 'vue-router';
    import { checkPackageEffective } from '@/api/modules/reportIndex.js';
    import { tdKeyList, PACKAGE_TYPE_TT } from '@/assets/js/static.js';
    import Upload from '@/components/steps/components/upload/Upload.vue';
    import usePublicDataStore from '@/pinia/modules/public';
    import echartsRadar from './echartsRadar.vue';
    import cesiumMap from '@/components/polyMap/cesiumMap.vue';
    import cesiumMap1 from '@/components/polyMap/cesiumMap1.vue';
    import axios from 'axios';
    import JSZip from 'jszip';
    import { formatKMLFileEvent } from '@/utils/formatKMLFile';
    import usefieldFanDataStore from '@/pinia/modules/fieldFanData';
    import { getPolygonCenterPoint } from '@/utils/getPolygonCenterPoint'; // 获取多边形中心点
    import { isPolygonSelfIntersecting } from '@/utils/isPolygonSelfIntersecting'; // 验证封闭区域是否存在自相交
    import { useOssUpload } from '@/components/ossClient/modifytUpload';
    import { message, Modal } from 'ant-design-vue';
    import projectPackage from '@/components/projectPackage/projectPackage.vue';
    import isInChinaMainlandPrecise from '@/utils/checkPointInChinaMainland';
    import { isWithinDateRange } from '@/utils/isWithinDateRange.js';
    import {
        getHasDownloadHistory,
        postCreateDownloadTask,
        getHeightAndDetail,
    } from '@/api/modules/weather';
    import chinaCounty from '@/assets/js/chinaCounty.json';

    const downLoadDisabled = ref(false);
    const weatherResultLoading = ref(false);
    const roadKey = ref(false);
    const resourceMapKey = ref(false);
    const terrainMapKey = ref(false);
    const hubHeight = ref(100); // 轮毂高度变量
    const activeIndex = ref(0);
    const publicDataStore = usePublicDataStore();
    const ossUpload = useOssUpload('fd/');
    console.log('---数据---', publicDataStore);
    const router = useRouter();
    const messageType = ref(4);
    const customInfos = ref();
    const TipsDialogVisible = ref(false);
    const isShowAddressResult = ref(false);
    const addressResult = ref([]);
    const cesiumMapRef = ref(null);
    const mapSearchValue = ref('');
    const weatherResultKey = ref(false);
    // 文件上传常量start
    const weatherFileRef = ref(null);
    const weatherFile = ref([]);
    const weatherFileInfo = ref([]);
    const weatherFileData = ref([]);
    const weatherPolygonData = ref([]);
    // end
    const weatherHandleIndex = ref(3);
    const weahterHandleData = ref([
        {
            iconName: 'ziyuantupumoren',
            iconNameActive: 'ziyuantupuxuanzhong',
            name: '资源图谱',
        },
        {
            iconName: 'weixingmoren',
            iconNameActive: 'weixingxuanzhong',
            name: '卫星',
        },
        {
            iconName: 'luwangmoren',
            iconNameActive: 'luwangxuanzhong',
            name: '路网',
        },
        {
            iconName: '3Dmoren',
            iconNameActive: '3Dxuanzhong',
            name: '3D地形',
        },
    ]);
    // 鼠标移动实时坐标
    const mouseMovePointLngLat = ref([]);
    // 点击点位坐标
    const weatherPointLngLat = ref([]);
    const weatherPointAddress = ref();
    const weatherResultData = ref([
        {
            name: '海拔高度（m）',
            code: 'altitude',
            value: '',
        },
        {
            name: '平均风速（m/s）',
            code: 'winds',
            value: '',
        },
        {
            name: '空气密度（kg/m³）',
            code: 'density',
            value: '',
        },
        {
            name: '平均风功率密度（W/m²）',
            code: 'powerDensity',
            value: '',
        },
        {
            name: 'Weibull A（m/s）',
            code: 'weibullA',
            value: '',
        },
        {
            name: 'Weibull K',
            code: 'weibullK',
            value: '',
        },
    ]);
    const cesiumMapScale = ref('--km');
    // 根据经纬度获取地址信息
    const getAddress = async (lng, lat) => {
        console.log('经纬度', lng, lat);
        axios
            .get(
                `https://api.tianditu.gov.cn/geocoder?postStr={'lon':${lng},'lat':${lat},'ver':1}&type=geocod&tk=` +
                    tdKeyList[Math.floor(Math.random() * tdKeyList.length)],
            )
            .then((res) => {
                console.log(res);
                if (res.data.status == 0) {
                    const addressData = res.data.result.addressComponent;
                    const addressStr = `${addressData.province}${addressData.city}${addressData.county}${addressData.town}${addressData.poi}${addressData.poi_distance ? addressData.poi_position : ''}${addressData.poi_distance ? addressData.poi_distance + '米' : ''}`;
                    console.log(addressStr);
                    // weatherPointAddress.value = res.data.result.formatted_address;
                    weatherPointAddress.value = addressStr;
                    // 绘制行政区边界
                    const features = chinaCounty.features;
                    const county_code = addressData.county_code;
                    console.log('当前区域代码', county_code);
                    const currentData = features.find(item => item.properties.gb === county_code);
                    console.log('当前区域数据', currentData);
                    currentData.geometry.coordinates.forEach(item => {
                        item = item.flat(Infinity);
                    });
                    const currentGeoJson = currentData.geometry.coordinates;
                    cesiumMapRef.value.addPolygonData(currentGeoJson);
                }
            });
    };
    // 拿到文件数据后进行相应的处理
    const getFileDataToHandle = async (file, data, isPoint) => {
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
        function reverseAndMergeArrays(arrays) {
            console.log(arrays);
            // 使用 map 方法遍历每个二维数组
            // 对每个二维数组进行反转操作
            const reversedArrays = arrays[0].map((subArray) => subArray.reverse());
            console.log(reversedArrays);
            const mergedArray = reversedArrays.flat();
            // 使用 flat 方法将反转后的二维数组展开并合并成一个一维数组
            return mergedArray.map((item) => Number(item));
        }

        if (isPoint) {
            console.log('点的数据', centerPointArr, data);
            cesiumMapRef.value.flyToCenter({
                x: data[0]['longitude'],
                y: data[0]['latitude'],
                z: 5000,
            });
            getWeatherData({
                lng: data[0]['longitude'],
                lat: data[0]['latitude'],
            });
            getAddress(data[0]['longitude'], data[0]['latitude']);
        } else {
            weatherPolygonData.value = data;
            console.log(data, '风机多边形区域数据', centerPointArr);
            const isTureOrFalse = isPolygonSelfIntersecting(data);
            console.log('是否自相交', isTureOrFalse);
            if (isTureOrFalse) {
                message.error('请勿选择自相交的多边形');
                // 清除气象文件数据
                clearWeatherData();
                return false;
            }
            const resultData = reverseAndMergeArrays(data);
            console.log(resultData, '反转结果合成一维数组');
            cesiumMapRef.value.addPolygonData(resultData);
            cesiumMapRef.value.flyToCenter({
                x: centerPointArr[0]['longitude'],
                y: centerPointArr[0]['latitude'],
                z: 5000,
            });
            getWeatherData({
                lng: centerPointArr[0]['longitude'],
                lat: centerPointArr[0]['latitude'],
            });
            getAddress(centerPointArr[0]['longitude'], centerPointArr[0]['latitude']);
        }
        weatherFile.value = [];
        weatherFile.value.push(file);
        // fieldFanDataStore.weatherFile[0] = file;
        // 上传至华为云获取文件线上路径
        let uploadResult = await ossUpload.uploadFile(file, sessionStorage.getItem('obsFilePath'));
        console.log('+++++++++++++++++');
        weatherFileInfo.value.push({
            fileName: file.name,
            filePath: uploadResult.obsPath,
            suffix: '.' + file.name.split('.')[file.name.split('.').length - 1],
        });
        weatherFileData.value = isPoint ? data : centerPointArr;
        console.log('最后的气象数据', weatherFileData.value, weatherFileInfo.value);
        // 调用经纬度获取气象数据
        getWeatherData({
            lng: weatherFileData.value[0]['longitude'],
            lat: weatherFileData.value[0]['latitude'],
        });
    };
    const clearWeatherData = () => {
        // weatherResultKey.value = false;
        weatherFileData.value = [];
        weatherFile.value = [];
        weatherFileInfo.value = [];
        weatherPolygonData.value = [];
        mapSearchValue.value = '';
        weatherFileRef.value && weatherFileRef.value.deleteItem();
    };
    // kml文件预处理
    const proFormatKMLFile = async (file) => {
        let kmlResultData = null;
        const handleKmlFileData = (kmlResultData) => {
            // 文件存在有效数据，进行下面特殊格式处理
            const isPoint = kmlResultData.pointData.length;
            let originData = [];
            let datas = [];
            originData = isPoint ? kmlResultData.pointData : kmlResultData.polygonData;
            console.log(isPoint, kmlResultData, originData);
            if (kmlResultData.pointData.length > 1 || kmlResultData.polygonData.length > 1) {
                message.error(`导入数据需为单个点或封闭区域数据，请重新上传！`);
                // 清除气象数据及文件
                clearWeatherData();
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
                // console.log(datas);
                getFileDataToHandle(file, datas, isPoint);
            } else {
            }
        };
        // kmz格式文件处理，解压出kml文件
        const kmzFileEvent = async (fileParams) => {
            const jszip = new JSZip();
            const jszipResult = await jszip.loadAsync(fileParams);
            // console.log(jszipResult);
            // 找到kmz中kml文件索引值
            const kmlFileIndex = Object.keys(jszipResult.files).findIndex(
                (ele) => ele.indexOf('.kml') > -1,
            );
            // console.log(kmlFileIndex);
            if (kmlFileIndex == -1) {
                message.error(`导入数据需为单个${'点或封闭区域'}数据，请重新上传！`);
                weatherFileRef.value.deleteItem();
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
                    weatherFileRef.value.deleteItem();
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
                if (
                    (kmlResultData.pointData && kmlResultData.pointData.length == 1) ||
                    (kmlResultData.polygonData && kmlResultData.polygonData.length == 1)
                ) {
                    handleKmlFileData(kmlResultData);
                } else {
                    message.error(`导入数据需为单个点或封闭区域数据，请重新上传！`);
                    clearWeatherData();
                    return false;
                }
            };
            reader.readAsText(file);
        }
    };
    const upFileList = async (file) => {
        console.log('删除时候是否请求这个');
        weatherFile.value = [file];
        weatherFileInfo.value = [];
        const result = await proFormatKMLFile(file);
        console.log(result);
    };
    // 更改轮毂高度需要重新请求后台获取气象数据
    const hubHeightChangeEvent = () => {
        weatherPointLngLat.value.length &&
            getWeatherData({
                lng: weatherPointLngLat.value[0],
                lat: weatherPointLngLat.value[1],
            });
    };
    // 创建下载任务
    const createDownloadTask = async (params) => {
        // 判断用户之前是否下载过这个点位气象数据
        // getHasDownloadHistory,
        // postCreateDownloadTask,
        const isDownload = await getHasDownloadHistory(params)
        if (isDownload.code === 200) {
            if (isDownload.data) {
                // 代表用户之前下载过这个点位气象数据，需要引导用户去下载列表页面查看下载进度
                // 当前版本ERA5数据用户免费下载
                Modal.warning({
                    closable: true,
                    title: '操作提示',
                    content: '系统检测到您之前已下载过该点位气象数据，可前去下载列表页面查看下载进度！',
                    okText: '前去查看',
                    autoFocusButton: null,
                    onOk: () => {
                        router.push({
                            path: '/platform/weatherDownload',
                            query: { fromType: 'weatherDownload' },
                        });
                    },
                });
            } else {
                // 没有下载过，创建下载任务
                const res = await postCreateDownloadTask(params);
                if (res.code === 200) {
                    Modal.info({
                        closable: true,
                        title: '操作提示',
                        content: '数据下载任务创建成功，您可去下载列表页面查看下载进度！',
                        okText: '前去查看',
                        autoFocusButton: null,
                        onOk: () => {
                            router.push({
                                path: '/platform/weatherDownload',
                                query: { fromType: 'weatherDownload' },
                            });
                        },
                    });
                }
            }
        }
        downLoadDisabled.value = false;
    };
    // 下载数据前处理工作（需要验证套餐）
    const downloadFileData = async (itemType) => {
        if (
            !(
                weatherPointLngLat.value[0] &&
                weatherPointLngLat.value[1] &&
                hubHeight.value
            )
        ) {
            message.error('请完整填写要查询的经纬度坐标和轮毂高度信息！');
            return false;
        }
        if (await isWithinDateRange()) {
            return false;
        }
        const index = weatherResultData.value.findIndex((ele) => ele.code == ['winds']);
        let eachHeightSpeed = weatherResultData.value[index]['value'];
        if (!eachHeightSpeed || eachHeightSpeed == '--') {
            eachHeightSpeed = null;
        }
        const obj = {
            companyId: sessionStorage.getItem('userId'),
            dataType: itemType ? 2 : 1,
            longitude: weatherPointLngLat.value[0],
            latitude: weatherPointLngLat.value[1],
            address: weatherPointAddress.value,
            eachHeightSpeed: eachHeightSpeed,
            height: hubHeight.value,
        };
        if (itemType) {
            // 下载气象精灵进入前验证用户服务是否失效，失效给出相应提示
            const params = {
                companyId: sessionStorage.getItem('userId'),
                itemType: itemType,
            };
            const data = await checkPackageEffective(params, itemType);
            if (data && data.code == 200) {
                sessionStorage.setItem('isInitiate', data.data.isInitiate);
                if (data.data.isInitiate) {
                    // 气象精灵数据下载
                    downLoadDisabled.value = true;
                    await createDownloadTask(obj);
                } else {
                    if (data.data.notInitiateType) {
                        messageType.value = data.data.notInitiateType;
                        TipsDialogVisible.value = true;
                    }
                }
            }
        } else {
            // ERA5数据下载
            downLoadDisabled.value = true;
            await createDownloadTask(obj);
        }
    };
    function isLonLat(str) {
        const lonReg = /^-?((180(\.0{1,6})?)|((1[0-7]\d|[\d]{1,2})(\.\d{1,16})?))$/;
        const latReg = /^-?((90(\.0{1,6})?)|([1-8]\d|\d)(\.\d{1,16})?)$/;
        // 分割字符串（兼容中英文逗号）
        const parts = str.trim().split(/[ ，,]/);
        if (parts.length !== 2) return false;

        // 提取经度、纬度
        const [lon, lat] = parts.map((s) => s.trim());

        // 格式验证
        const isLonValid = lonReg.test(lon) && Math.abs(parseFloat(lon)) <= 180;
        const isLatValid = latReg.test(lat) && Math.abs(parseFloat(lat)) <= 90;

        return isLonValid && isLatValid;
    }
    const formatStr = (str) => {
        let newStr = str.trim();
        newStr = str.replace(/[\s\n\r]/g, '');
        newStr = str.replace(/[,，]/g, ',');
        return newStr;
    }
    // 经纬度或者地址关键字获取经纬度进行定位
    const searchFlyTo = () => {
        isShowAddressResult.value = false;
        // weatherResultKey.value = false;
        console.log(mapSearchValue.value)
        if (!mapSearchValue.value) {
            return false;
        } else {
            mapSearchValue.value = formatStr(mapSearchValue.value);
            console.log(/[\u4E00-\u9FA5\uF900-\uFA2D]/.test(mapSearchValue.value));
            if (
                isLonLat(mapSearchValue.value) &&
                !/[\u4E00-\u9FA5\uF900-\uFA2D]/.test(mapSearchValue.value)
            ) {
                isShowAddressResult.value = false;
                const [lon, lat] = mapSearchValue.value.split(',');
                console.log(lon, lat);
                const isInChinaland = isInChinaMainlandPrecise(lon, lat);
                if (!isInChinaland) {
                    message.error(`目前暂不支持当前区域数据查询！`);
                    mapSearchValue.value = '';
                    return false;
                }
                cesiumMapRef.value.flyToCenter({ x: lon, y: lat, z: 6000 });
                // 调用经纬度获取点位风数据
                weatherPointLngLat.value = [lon, lat];
                // 调用经纬度获取点位风数据
                getWeatherData({
                    lng: lon,
                    lat: lat,
                });
                getDataFromClick({
                    lng: lon,
                    lat: lat,
                });
            } else {
                axios
                    .get(
                        `https://api.tianditu.gov.cn/v2/search?postStr={"keyWord":"${mapSearchValue.value}","level":1,"mapBound":"-180,-90,180,90","queryType":7,"start":0,"count":20,"show": 1}&type=query&tk=` +
                            '73d12bf9ba3a754d082c3187012ae118',
                    )
                    .then((res) => {
                        console.log(res);
                        if (res.data?.resultType == 1 || res.data?.resultType == 5) {
                            addressResult.value = res.data?.pois || res.data?.lineData;
                            weatherResultKey.value = false;
                            isShowAddressResult.value = true;

                        } else if (res.data?.resultType == 2) {
                        }
                        addressResult.value = res.data?.pois || res.data?.lineData;
                    });
            }
        }
    };
    const flyTo = (address) => {
        console.log(address);
        isShowAddressResult.value = false;
        mapSearchValue.value = address.name;
        const lngLat = {
            x: address.lonlat.split(',')[0],
            y: address.lonlat.split(',')[1],
        };
        cesiumMapRef.value.flyToCenter({
            x: lngLat.x,
            y: lngLat.y,
            z: 5000,
        });
        // 调用经纬度获取点位风数据
        getWeatherData({
            lng: lngLat.x,
            lat: lngLat.y,
        });
        getAddress(lngLat.x, lngLat.y);
    };
    // 拿到经纬度坐标请求气候数据
    const getWeatherData = async (lngLat) => {
        if (!hubHeight.value) {
            return false;
        }
        weatherResultLoading.value = true;
        console.log(lngLat, '经纬度坐标');
        weatherPointLngLat.value = [(lngLat.lng * 1).toFixed(6), (lngLat.lat * 1).toFixed(6)];
        const res = await getHeightAndDetail({
            lng: weatherPointLngLat.value[0],
            lat: weatherPointLngLat.value[1],
            height: hubHeight.value,
        });
        console.log(res,"dddddddddddddddddddddd")
        if (res.code == 200 && res.data) {
            console.log(res);
            for (let i = 0; i < weatherResultData.value.length; i++) {
                const ele = weatherResultData.value[i];
                ele['value'] = res.data[ele['code']] || '--';
            }
            weatherResultLoading.value = false;
            weatherResultKey.value = true;
        } else {
            weatherResultLoading.value = false;
        }
    };
    // 来自地图点击事件
    const getDataFromClick = (lngLat) => {
        if (lngLat.isMove) {
            // 鼠标滑动获取地理经纬度
            mouseMovePointLngLat.value = [(lngLat.lng * 1).toFixed(6), (lngLat.lat * 1).toFixed(6)];
        } else {
            // 鼠标点击获取地理经纬度
            clearWeatherData();
            activeIndex.value = 0;
            weatherPointLngLat.value = [(lngLat.lng * 1).toFixed(6), (lngLat.lat * 1).toFixed(6)];
            mapSearchValue.value = `${weatherPointLngLat.value[0]},${weatherPointLngLat.value[1]}`;
            getWeatherData(lngLat);
            getAddress(lngLat.lng, lngLat.lat);
        }
    };
    // 获取地图比例尺
    const getCesiumMapScale = (value) => {
        // console.log('比例尺变化', value);
        cesiumMapScale.value = value;
    };

    // 视图定位到指定位置
    const flyToPosition = (position) => {};

    const drawLine = () => {
        cesiumMapRef.value.drawLineMeasureGraphics('Polyline');
    };
    onMounted(() => {
        // cesiumMapShow.value = true;
        if (sessionStorage.getItem('customerInfo')) {
            customInfos.value = JSON.parse(sessionStorage.getItem('customerInfo'));
        }
        cesiumMapRef.value.changeMapMode(weatherHandleIndex.value);
    });
</script>
<style scoped lang="scss">
    @import './home.scss';
</style>
