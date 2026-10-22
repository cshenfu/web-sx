<template>
    <div class="weather-home-content">
        <div class="weather-map-template">
            <maplibreMap
                ref="maplibreMapRef"
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
                            :class="activeIndex == 0 ? 'search-type search-type-active' : 'search-type'"
                        >
                            <!-- 如果你没有 iconpark，请换成 el-icon -->
                            <iconpark-icon size="11" name="zifubai" v-if="activeIndex == 0"></iconpark-icon>
                            <iconpark-icon size="11" name="zifulan" v-else></iconpark-icon>
                        </span>
                        
                        <span class="search-input" v-if="activeIndex == 0">
                            <el-input
                                v-model="mapSearchValue"
                                placeholder="请输入地名或经纬度，如: 113.29965,38.00376"
                                clearable
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
                    <div class="weather-map-resultBox" v-if="weatherPointLngLat.length && weatherResultKey">
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
                                    <i v-else>{{ weatherPointLngLat[0] }},{{ weatherPointLngLat[1] }}</i>
                                </p>
                                <p>
                                    <span>轮毂高度</span>
                                    <el-input-number
                                        :controls="false"
                                        v-model="hubHeight"
                                        :min="50"
                                        :max="200"
                                        @blur="hubHeightChangeEvent"
                                        style="width: 174px; margin-right: 8px"
                                    >
                                        <template #suffix> m </template>
                                    </el-input-number>
                                    <span>50~200</span>
                                </p>
                            </div>
                        </div>
                        <div class="result-box-download">
                            <span>数据下载</span>
                            <i :class="downLoadDisabled ? 'disabled' : ''" @click="!downLoadDisabled && downloadFileData()">ERA5数据</i>
                            <i :class="downLoadDisabled ? 'disabled' : ''" @click="!downLoadDisabled && downloadFileData(PACKAGE_TYPE_TT['weatherDownload'])">气象精灵数据</i>
                        </div>
                        <div class="result-box-detail">
                            <ul>
                                <li v-for="item in weatherResultData" :key="item.code">
                                    <span>{{ item.name }}</span>
                                    <span>{{ item.value }} {{ item['code'] == 'winds' && item.value ? '± 0.75' : '' }}</span>
                                </li>
                            </ul>
                            <div class="loading-template" v-if="weatherResultLoading">
                                <el-icon class="is-loading"><Loading /></el-icon>
                            </div> 
                        </div>
                    </div>
                    
                    <!-- 操作地图面板 -->
                    <div class="weather-map-handle">
                        <span
                            @click="resourceMapKey = !resourceMapKey, roadKey = false, terrainMapKey = false"
                            :class="resourceMapKey ? 'active' : ''"
                        >
                            <iconpark-icon size="14" :name="resourceMapKey ? 'ziyuantupuxuanzhong' : 'ziyuantupumoren'"></iconpark-icon>
                            <i>资源图谱</i>
                        </span>
                        <span @click="roadKey = !roadKey, terrainMapKey = false, resourceMapKey = false" :class="roadKey ? 'active' : ''">
                            <iconpark-icon size="14" :name="roadKey ? 'luwangxuanzhong' : 'luwangmoren'"></iconpark-icon>
                            <i>路网</i>
                        </span>
                        <span @click="terrainMapKey = !terrainMapKey, roadKey = false, resourceMapKey = false" :class="terrainMapKey ? 'active' : ''">
                            <iconpark-icon size="14" :name="terrainMapKey ? '3Dxuanzhong' : '3Dmoren'"></iconpark-icon>
                            <i>3D地形</i>
                        </span>
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
                            <i v-for="i in 10" :key="i">{{ i }}</i>
                        </div>
                        <div class="measuringScale">
                            <span>{{ mapScale }}</span>
                            <i v-if="!mouseMovePointLngLat.length">--</i>
                            <i v-else>{{ mouseMovePointLngLat[0] }},{{ mouseMovePointLngLat[1] }}</i>
                        </div>
                    </div>
                </div>
            </maplibreMap>
        </div>
    </div>
    
    <!-- 套餐提示弹窗 -->
    <projectPackage
        :TipsDialogVisible="TipsDialogVisible"
        :messageType="messageType"
        @changeShowKey="TipsDialogVisible = false"
    ></projectPackage>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import JSZip from 'jszip';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Loading } from '@element-plus/icons-vue';

// 引入 MapLibre 组件（请确认刚才写的 maplibreMap.vue 的路径）
import maplibreMap from '@/components/polyMap/maplibreMap.vue'; 

// 引入业务组件和 API
import { checkPackageEffective } from '@/api/modules/reportIndex.js';
import { tdKeyList, PACKAGE_TYPE_TT } from '@/assets/js/static.js';
import Upload from '@/components/steps/components/upload/Upload.vue';
import projectPackage from '@/components/projectPackage/projectPackage.vue';

// 引入工具函数和 Stores
import usePublicDataStore from '@/pinia/modules/public';
import usefieldFanDataStore from '@/pinia/modules/fieldFanData';
import { formatKMLFileEvent } from '@/utils/formatKMLFile';
import { getPolygonCenterPoint } from '@/utils/getPolygonCenterPoint';
import { isPolygonSelfIntersecting } from '@/utils/isPolygonSelfIntersecting';
import { useOssUpload } from '@/components/ossClient/modifytUpload';
import isInChinaMainlandPrecise from '@/utils/checkPointInChinaMainland';
import { isWithinDateRange } from '@/utils/isWithinDateRange.js';
import { getHasDownloadHistory, postCreateDownloadTask, getHeightAndDetail } from '@/api/modules/weather';
import chinaCounty from '@/assets/js/chinaCounty.json';

// 定义事件，用于通知父组件打开下载列表
const emit = defineEmits(['open-download']);

const router = useRouter();
const publicDataStore = usePublicDataStore();
const fieldFanDataStore = usefieldFanDataStore();
const ossUpload = useOssUpload('fd/');

// 状态变量
const downLoadDisabled = ref(false);
const weatherResultLoading = ref(false);
const roadKey = ref(false);
const resourceMapKey = ref(false);
const terrainMapKey = ref(false);
const hubHeight = ref(100);
const activeIndex = ref(0);
const messageType = ref(4);
const customInfos = ref();
const TipsDialogVisible = ref(false);
const isShowAddressResult = ref(false);
const addressResult = ref([]);
const maplibreMapRef = ref(null);
const mapSearchValue = ref('');
const weatherResultKey = ref(false);

const weatherFileRef = ref(null);
const weatherFile = ref([]);
const weatherFileInfo = ref([]);
const weatherFileData = ref([]);
const weatherPolygonData = ref([]);

const mouseMovePointLngLat = ref([]);
const weatherPointLngLat = ref([]);
const weatherPointAddress = ref();
const mapScale = ref('--km');

const weatherResultData = ref([
    { name: '海拔高度（m）', code: 'altitude', value: '' },
    { name: '平均风速（m/s）', code: 'winds', value: '' },
    { name: '空气密度（kg/m³）', code: 'density', value: '' },
    { name: '平均风功率密度（W/m²）', code: 'powerDensity', value: '' },
    { name: 'Weibull A（m/s）', code: 'weibullA', value: '' },
    { name: 'Weibull K', code: 'weibullK', value: '' },
]);

// 根据经纬度获取地址信息 (天地图逆地理编码)
const getAddress = async (lng, lat) => {
    axios.get(`https://api.tianditu.gov.cn/geocoder?postStr={'lon':${lng},'lat':${lat},'ver':1}&type=geocod&tk=` + tdKeyList[Math.floor(Math.random() * tdKeyList.length)])
        .then((res) => {
            if (res.data.status == 0) {
                const addressData = res.data.result.addressComponent;
                const addressStr = `${addressData.province}${addressData.city}${addressData.county}${addressData.town}${addressData.poi}${addressData.poi_distance ? addressData.poi_position : ''}${addressData.poi_distance ? addressData.poi_distance + '米' : ''}`;
                weatherPointAddress.value = addressStr;
                
                // 绘制行政区边界
                const features = chinaCounty.features;
                const county_code = addressData.county_code;
                const currentData = features.find(item => item.properties.gb === county_code);
                if (currentData && maplibreMapRef.value) {
                    const currentGeoJson = currentData.geometry.coordinates;
                    maplibreMapRef.value.addPolygonData(currentGeoJson);
                }
            }
        });
};

// 拿到文件数据后进行相应的处理
const getFileDataToHandle = async (file, data, isPoint) => {
    const centerPointArr = [];
    if (!isPoint) {
        const polygonData = JSON.parse(JSON.stringify(data));
        for (let index = 0; index < polygonData.length; index++) {
            centerPointArr.push(getPolygonCenterPoint(polygonData[index]));
        }
    }
    
    function reverseAndMergeArrays(arrays) {
        const reversedArrays = arrays[0].map((subArray) => subArray.reverse());
        return reversedArrays.flat().map((item) => Number(item));
    }

    if (isPoint) {
        maplibreMapRef.value.flyToCenter({ x: data[0]['longitude'], y: data[0]['latitude'], z: 5000 });
        getWeatherData({ lng: data[0]['longitude'], lat: data[0]['latitude'] });
        getAddress(data[0]['longitude'], data[0]['latitude']);
    } else {
        weatherPolygonData.value = data;
        const isTureOrFalse = isPolygonSelfIntersecting(data);
        if (isTureOrFalse) {
            ElMessage.error('请勿选择自相交的多边形');
            clearWeatherData();
            return false;
        }
        const resultData = reverseAndMergeArrays(data);
        maplibreMapRef.value.addPolygonData(resultData);
        maplibreMapRef.value.flyToCenter({ x: centerPointArr[0]['longitude'], y: centerPointArr[0]['latitude'], z: 5000 });
        getWeatherData({ lng: centerPointArr[0]['longitude'], lat: centerPointArr[0]['latitude'] });
        getAddress(centerPointArr[0]['longitude'], centerPointArr[0]['latitude']);
    }
    
    weatherFile.value = [file];
    let uploadResult = await ossUpload.uploadFile(file, sessionStorage.getItem('obsFilePath'));
    weatherFileInfo.value.push({
        fileName: file.name,
        filePath: uploadResult.obsPath,
        suffix: '.' + file.name.split('.')[file.name.split('.').length - 1],
    });
    weatherFileData.value = isPoint ? data : centerPointArr;
    getWeatherData({ lng: weatherFileData.value[0]['longitude'], lat: weatherFileData.value[0]['latitude'] });
};

const clearWeatherData = () => {
    weatherFileData.value = [];
    weatherFile.value = [];
    weatherFileInfo.value = [];
    weatherPolygonData.value = [];
    mapSearchValue.value = '';
    if (weatherFileRef.value) weatherFileRef.value.deleteItem();
};

// kml/kmz 文件预处理
const proFormatKMLFile = async (file) => {
    let kmlResultData = null;
    const handleKmlFileData = (kmlResultData) => {
        const isPoint = kmlResultData.pointData.length;
        let originData = isPoint ? kmlResultData.pointData : kmlResultData.polygonData;
        if (kmlResultData.pointData.length > 1 || kmlResultData.polygonData.length > 1) {
            ElMessage.error(`导入数据需为单个点或封闭区域数据，请重新上传！`);
            clearWeatherData();
            return false;
        }
        if (originData.length) {
            let datas = [];
            for (let index = 0; index < originData.length; index++) {
                const ele = originData[index];
                if (isPoint) {
                    datas.push({ longitude: ele.longitude, latitude: ele.latitude });
                } else {
                    datas = originData;
                }
            }
            getFileDataToHandle(file, datas, isPoint);
        }
    };
    
    const kmzFileEvent = async (fileParams) => {
        const jszip = new JSZip();
        const jszipResult = await jszip.loadAsync(fileParams);
        const kmlFileIndex = Object.keys(jszipResult.files).findIndex((ele) => ele.indexOf('.kml') > -1);
        if (kmlFileIndex == -1) {
            ElMessage.error(`导入数据需为单个点或封闭区域数据，请重新上传！`);
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
                ElMessage.error(`导入数据需为单个点或封闭区域数据，请重新上传！`);
                weatherFileRef.value.deleteItem();
            }
        }
    };

    if (file.name.toLocaleLowerCase().indexOf('.kmz') > -1) {
        await kmzFileEvent(file);
    } else if (file.name.toLocaleLowerCase().indexOf('.kml') > -1 || file.name.toLocaleLowerCase().indexOf('.ovkml') > -1) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const kmlText = e.target.result;
            kmlResultData = formatKMLFileEvent(kmlText);
            if (
                (kmlResultData.pointData && kmlResultData.pointData.length == 1) ||
                (kmlResultData.polygonData && kmlResultData.polygonData.length == 1)
            ) {
                handleKmlFileData(kmlResultData);
            } else {
                ElMessage.error(`导入数据需为单个点或封闭区域数据，请重新上传！`);
                clearWeatherData();
            }
        };
        reader.readAsText(file);
    }
};

const upFileList = async (file) => {
    weatherFile.value = [file];
    weatherFileInfo.value = [];
    await proFormatKMLFile(file);
};

const hubHeightChangeEvent = () => {
    if (weatherPointLngLat.value.length) {
        getWeatherData({ lng: weatherPointLngLat.value[0], lat: weatherPointLngLat.value[1] });
    }
};

// 创建下载任务（注意这里替换成了 ElMessageBox）
const createDownloadTask = async (params) => {
    const isDownload = await getHasDownloadHistory(params);
    if (isDownload.code === 200) {
        if (isDownload.data) {
            ElMessageBox.alert('系统检测到您之前已下载过该点位气象数据，可前去下载列表页面查看下载进度！', '操作提示', {
                confirmButtonText: '前去查看',
                callback: (action) => {
                    if (action === 'confirm') {
                        // 👇 核心修改：通知父组件打开下载覆盖层
                        emit('open-download');
                    }
                }
            });
        } else {
            const res = await postCreateDownloadTask(params);
            if (res.code === 200) {
                ElMessageBox.alert('数据下载任务创建成功，您可去下载列表页面查看下载进度！', '操作提示', {
                    confirmButtonText: '前去查看',
                    callback: (action) => {
                        if (action === 'confirm') {
                            // 👇 核心修改：通知父组件打开下载覆盖层
                            emit('open-download');
                        }
                    }
                });
            }
        }
    }
    downLoadDisabled.value = false;
};

// 下载数据前处理工作
const downloadFileData = async (itemType) => {
    if (!(weatherPointLngLat.value[0] && weatherPointLngLat.value[1] && hubHeight.value)) {
        ElMessage.error('请完整填写要查询的经纬度坐标和轮毂高度信息！');
        return false;
    }
    if (await isWithinDateRange()) return false;
    
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
        const params = { companyId: sessionStorage.getItem('userId'), itemType: itemType };
        const data = await checkPackageEffective(params, itemType);
        if (data && data.code == 200) {
            sessionStorage.setItem('isInitiate', data.data.isInitiate);
            if (data.data.isInitiate) {
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
        downLoadDisabled.value = true;
        await createDownloadTask(obj);
    }
};

// 校验经纬度格式
function isLonLat(str) {
    const lonReg = /^-?((180(\.0{1,6})?)|((1[0-7]\d|[\d]{1,2})(\.\d{1,16})?))$/;
    const latReg = /^-?((90(\.0{1,6})?)|([1-8]\d|\d)(\.\d{1,16})?)$/;
    const parts = str.trim().split(/[ ，,]/);
    if (parts.length !== 2) return false;
    const [lon, lat] = parts.map((s) => s.trim());
    const isLonValid = lonReg.test(lon) && Math.abs(parseFloat(lon)) <= 180;
    const isLatValid = latReg.test(lat) && Math.abs(parseFloat(lat)) <= 90;
    return isLonValid && isLatValid;
}

const formatStr = (str) => {
    let newStr = str.trim();
    newStr = str.replace(/[\s\n\r]/g, '');
    newStr = str.replace(/[,，]/g, ',');
    return newStr;
};

// 搜索并飞入
const searchFlyTo = () => {
    isShowAddressResult.value = false;
    if (!mapSearchValue.value) return false;
    
    mapSearchValue.value = formatStr(mapSearchValue.value);
    if (isLonLat(mapSearchValue.value) && !/[\u4E00-\u9FA5\uF900-\uFA2D]/.test(mapSearchValue.value)) {
        const [lon, lat] = mapSearchValue.value.split(',');
        const isInChinaland = isInChinaMainlandPrecise(lon, lat);
        if (!isInChinaland) {
            ElMessage.error(`目前暂不支持当前区域数据查询！`);
            mapSearchValue.value = '';
            return false;
        }
        maplibreMapRef.value.flyToCenter({ x: lon, y: lat, z: 6000 });
        weatherPointLngLat.value = [lon, lat];
        getWeatherData({ lng: lon, lat: lat });
        getDataFromClick({ lng: lon, lat: lat });
    } else {
        axios.get(`https://api.tianditu.gov.cn/v2/search?postStr={"keyWord":"${mapSearchValue.value}","level":1,"mapBound":"-180,-90,180,90","queryType":7,"start":0,"count":20,"show": 1}&type=query&tk=73d12bf9ba3a754d082c3187012ae118`)
            .then((res) => {
                if (res.data?.resultType == 1 || res.data?.resultType == 5) {
                    addressResult.value = res.data?.pois || res.data?.lineData;
                    weatherResultKey.value = false;
                    isShowAddressResult.value = true;
                }
                addressResult.value = res.data?.pois || res.data?.lineData;
            });
    }
};

// 点击地址列表飞入
const flyTo = (address) => {
    isShowAddressResult.value = false;
    mapSearchValue.value = address.name;
    const lngLat = { x: address.lonlat.split(',')[0], y: address.lonlat.split(',')[1] };
    maplibreMapRef.value.flyToCenter({ x: lngLat.x, y: lngLat.y, z: 5000 });
    getWeatherData({ lng: lngLat.x, lat: lngLat.y });
    getAddress(lngLat.x, lngLat.y);
};

// 获取气象数据
const getWeatherData = async (lngLat) => {
    if (!hubHeight.value) return false;
    weatherResultLoading.value = true;
    weatherPointLngLat.value = [(lngLat.lng * 1).toFixed(6), (lngLat.lat * 1).toFixed(6)];
    
    const res = await getHeightAndDetail({
        lng: weatherPointLngLat.value[0],
        lat: weatherPointLngLat.value[1],
        height: hubHeight.value,
    });
    
    if (res.code == 200 && res.data) {
        for (let i = 0; i < weatherResultData.value.length; i++) {
            const ele = weatherResultData.value[i];
            ele['value'] = res.data[ele['code']] || '--';
        }
        weatherResultKey.value = true;
    }
    weatherResultLoading.value = false;
};

// 接收地图点击事件
const getDataFromClick = (lngLat) => {
    if (lngLat.isMove) {
        mouseMovePointLngLat.value = [(lngLat.lng * 1).toFixed(6), (lngLat.lat * 1).toFixed(6)];
    } else {
        clearWeatherData();
        activeIndex.value = 0;
        weatherPointLngLat.value = [(lngLat.lng * 1).toFixed(6), (lngLat.lat * 1).toFixed(6)];
        mapSearchValue.value = `${weatherPointLngLat.value[0]},${weatherPointLngLat.value[1]}`;
        getWeatherData(lngLat);
        getAddress(lngLat.lng, lngLat.lat);
    }
};

// 获取比例尺
const getCesiumMapScale = (value) => {
    mapScale.value = value;
};

onMounted(() => {
    if (sessionStorage.getItem('customerInfo')) {
        customInfos.value = JSON.parse(sessionStorage.getItem('customerInfo'));
    }
});
</script>

<style scoped lang="scss">
    /* 你的原有样式 */
    @import './home.scss';
    
    /* 补充 Element Plus loading icon 颜色兼容 */
    .loading-template {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100px;
        .is-loading {
            font-size: 24px;
            color: #409eff;
        }
    }
</style>