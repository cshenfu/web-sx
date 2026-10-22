<template>
    <div class="tdMap-template">
        <div id="tianditu" style="width: 100%; height: 100%"></div>
        <slot></slot>
    </div>
</template>
<script setup>
    import { ref, onMounted, nextTick, watch, onBeforeUnmount } from 'vue';
    import eventBus from '../../utils/eventBus';
    import iconImg from '@/assets/img/mapIcon/fengji.png';
    import iconImg1 from '@/assets/img/mapIcon/shengyazhan.png';
    import iconImg2 from '@/assets/img/mapIcon/cefengta.png';
    import iconImg3 from '@/assets/img/mapIcon/jieruzhan.png';
    import iconImg4 from '@/assets/img/customer-icon.png';
    import iconImg5 from '@/assets/img/mapIcon/fan.png';
    import iconImg6 from '@/assets/img/mapIcon/zhongchidu.png';
    import { tdKey } from '@/assets/js/static';
    import { useGeoJsonData } from './useGeoJsonData';
    import usePublicDataStore from '@/pinia/modules/public';
    const publicDataStore = usePublicDataStore();
    const {
        geoJsonMapFormat,
        customGetGeoJsonData,
        geoJsonToMapAdaptiveAlgorithm,
        resetGeoJsonData,
    } = useGeoJsonData();
    // import geoJsonData from './aaa.json';
    // import geoJsonData from './STHX.json';
    const areaPolygon = ref(0);
    let map = null;
    let points;
    let marker;
    const zoom = ref(4);
    let T = window.T;
    const props = defineProps({
        height: {
            type: Number,
            default: 400,
        },
        sourceData: {
            type: Array,
            default: () => [],
        },
        markerData: {
            type: Array,
            default: () => [],
        },
        showWinInfo: {
            type: Boolean,
            default: false,
        },
    });
    const currentInfo = ref(null);
    // 标点类型
    const markTypeOptions = {
        fan: {
            icon: iconImg,
            iconSize: new T.Point(20, 22),
        },
        fan1: {
            icon: iconImg5,
            iconSize: new T.Point(20, 22),
        },
        booster: {
            icon: iconImg1,
            iconSize: new T.Point(20, 22),
        },
        tower: {
            icon: iconImg2,
            iconSize: new T.Point(20, 22),
        },
        tower1: {
            icon: iconImg6,
            iconSize: new T.Point(20, 22),
        },
        subStation: {
            icon: iconImg3,
            iconSize: new T.Point(20, 22),
        },
        other: {
            icon: iconImg4,
            iconSize: new T.Point(20, 22),
        },
        point: {
            color: '#FF3E3E',
            fillColor: '#FF3E3E',
        },
    };
    // 渲染geoJsonData数据
    const addGeoJsonData = (geoData, type) => {
        let countries = geoData.features ? geoData.features : [];
        // console.log(geoJsonData, '数据');
        const init = (sel, transform) => {
            console.log(countries, '数据');
            var upd = sel.selectAll('path.geojson').data(countries);
            upd.enter()
                .append('path')
                .attr('class', 'geojson')
                .attr('stroke', 'yellow')
                .attr('opacity', '0.8')
                .attr('fill', 'yellow')
                .attr('fill-opacity', '0.2')
                .attr('type', type);
        };
        const redraw = (sel, transform) => {
            // console.log(transform);
            sel.selectAll('path.geojson').each(function (d, i) {
                d3.select(this).attr('d', transform.pathFromGeojson);
            });
        };

        let countriesOverlay = new T.D3Overlay(init, redraw);
        map.addOverLay(countriesOverlay);
        countriesOverlay.bringToFront();
    };
    // 渲染geoJsonData数据
    const addGeoJsonData1 = (geoData, type) => {
        customGetGeoJsonData(geoData).then((res) => {
            if (res) {
                geoJsonMapFormat.point?.forEach((point) => {});
            }
        });
    };
    // 添加多边形拐点
    const addPolygon = async (pointData, type, key) => {
        console.log(key);
        areaPolygon.value = 0;
        points = formatPolygonData(pointData);
        if (!map) {
            await onInitMap();
        }
        const allMarkers = map.getOverlays();
        allMarkers.length &&
            allMarkers.forEach((item) => {
                if (key) {
                    if (item.options.customKey === key) {
                        map.removeOverLay(item);
                    }
                } else {
                    if (item.options && item.options.type === type) {
                        map.removeOverLay(item);
                    }
                }
            });
        if (points[0]) {
            if (points[0].length > 1) {
                points.map((ele) => {
                    const styleObj = {
                        color: publicDataStore.headActiveKey == 'light' ? '#FF8411' : '#24D28F',
                        weight: 2,
                        opacity: 1,
                        fillColor: publicDataStore.headActiveKey == 'light' ? '#FF8411' : '#24D28F',
                        fillOpacity: 0.1,
                        type: 'point',
                    };
                    if (type == 'fanPolygon') {
                        // 如果是风机的封闭区域，需要把多边形处理成其他颜色
                        styleObj.color = '#fcba5f';
                        styleObj.fillColor = '#fcba5f';
                        styleObj.type = 'fanPolygon';
                    } else if (type == 'boosterPolygon') {
                        styleObj.color = '#7df9ff';
                        styleObj.fillColor = '#7df9ff';
                        styleObj.type = 'boosterPolygon';
                        styleObj.customKey = key;
                    }
                    const polygon = new T.Polygon([ele], styleObj);
                    const handler = new T.PolygonTool(map, {});
                    areaPolygon.value += handler.getArea(polygon.getLngLats()[0]);
                    map.addOverLay(polygon);
                });
                // 多维数组情况下需要转换成一维数组
                map.setViewport(points.flat(Infinity));
                zoom.value = map['KW'][Object.keys(map['KW'])[0]]['Ce']['zoom'];
            } else if (points[0].length == 1) {
                // (50MW以内 半径5K，50~100MW 半径10K，100~200MW 半径15K)
                let radius = 5 * 1000;
                if (sessionStorage.getItem('currentProjectCapacity')) {
                    if (
                        sessionStorage.getItem('currentProjectCapacity') > 50 &&
                        sessionStorage.getItem('currentProjectCapacity') <= 100
                    ) {
                        radius = 10 * 1000;
                    } else if (
                        sessionStorage.getItem('currentProjectCapacity') > 100 &&
                        sessionStorage.getItem('currentProjectCapacity') <= 200
                    ) {
                        radius = 15 * 1000;
                    }
                }
                const circle = new T.Circle(
                    new T.LngLat(pointData[0][0][1], pointData[0][0][0]),
                    radius,
                    {
                        color: '#24D28F',
                        weight: 2,
                        opacity: 1,
                        fillColor: '#24D28F',
                        fillOpacity: 0.1,
                        type: 'point',
                    },
                );
                map.addOverLay(circle);
                const handler = new T.PolygonTool(map, {});
                areaPolygon.value += radius * radius * Math.PI;
                // console.log(handler.getArea(polygon.getLngLats()[0]), '场区拐点面积');
                zoom.value = 10.5;
                map.centerAndZoom(new T.LngLat(pointData[0][0][1], pointData[0][0][0]), zoom.value);
            }

            console.log('总面积(平方千米)，', areaPolygon.value / 1000000);
            sessionStorage.setItem('areaPolygon', areaPolygon.value / 1000000);
        } else {
            sessionStorage.setItem('areaPolygon', 0);
        }
        console.log('坐标点', points);
        try {
            //根据坐标点天地图接口返回的地址信息
            // if (points[0]) {
            //     const url = (`http://api.tianditu.gov.cn/geocoder?postStr={'lon':`+ points[0][0]['lng'] + ',lat:' + points[0][0]['lat'] + ',ver:1}&type=geocode&tk=' + tdKey);
            //     const reopt = {
            //         method : 'GET',
            //         url : url,
            //         withCredentials: false,
            //         headers : {},
            //         validateStatus: function(status){
            //                 return status >= 200;
            //         },
            //         maxRedirects : 0,
            //         responseType : 'file',
            //     };
            //     axios.request(reopt).then(response => {
            //         console.log('接口请求结果',response);
            //         if (response.status == 200) {
            //             const result = JSON.parse(response.data);
            //             const addressComponent = result.result.addressComponent;
            //             console.log(addressComponent);
            //             const {province, city, county} = addressComponent;
            //             const address = province + city + county;
            //             console.log('根据坐标点天地图接口返回的地址信息：',address)
            //         }
            //     }).catch(error => {
            //         console.log(error);
            //     })
            // }
        } catch (error) {}

        // console.log(zoom.value);
    };
    const setWinInfo = (target, marker) => {
        let htmls = `<p>${target.options.info}</p>
        `;
        const infoWin = new T.InfoWindow('<div class="info-win-template"></div>', {
            closeButton: false,
        });
        infoWin.setLngLat(new T.LngLat([target.or.lng, target.or.lat]));
        infoWin.setContent(htmls);
        marker.openInfoWindow(infoWin);
        map.centerAndZoom(new T.LngLat(target.or.lng, target.or.lat));
        eventBus.emit('setWinInfo', target.options.info);
    };
    // 发电量表传过来的信息，对应的风机显示label
    const getSelectFanToWinInfo = (label) => {
        const allMarkers = map.getOverlays();
        allMarkers.length &&
            allMarkers.map((ele) => {
                if (ele.options) {
                    if (ele.options.info === label) {
                        setWinInfo(ele, ele);
                    }
                }
            });
    };
    // 添加风机标注点
    const addMarkerFan = async (fanData, type, key) => {
        if (!map) {
            await onInitMap();
        }
        // console.log(fanData, '数据经纬度');
        const icon = new T.Icon({
            iconUrl: markTypeOptions[type]['icon'],
            iconSize: markTypeOptions[type]['iconSize'],
        });
        const allMarkers = map.getOverlays();
        console.log(allMarkers, '获取所有的风机', key);
        allMarkers.length &&
            allMarkers.forEach((item) => {
                if (key) {
                    if (item.options && item.options.customKey === key) {
                        map.removeOverLay(item);
                    }
                } else {
                    if (item.options && item.options.type === type) {
                        map.removeOverLay(item);
                    }
                }
                // if (item.options && item.options.type === type) {
                //     if (key && item.options.customKey === key) {
                //         map.removeOverLay(item);
                //     } else {
                //         map.removeOverLay(item);
                //     }
                // }
            });
        // if (props.showWinInfo) {
        //     console.log('没进来吗', fanData)
        //     fanData.forEach((ele, eleIndex) => {
        //         const point = new T.LngLat(ele.longitude, ele.latitude);
        //         marker = new T.Marker(point, {
        //             type: type,
        //             icon: icon,
        //             // zIndexOffset: 100,
        //             info: ele.info ? ele.info : '',
        //         });
        //         marker.on('click', function ({ type, target, lnglat, containerPoint }) {
        //             console.log(type, target, lnglat, containerPoint);
        //             console.log(target.options);
        //             if (target.options.info) {
        //                 // onShowWinInfo(target);
        //                 currentInfo.value = target.options.info;
        //                 setWinInfo(target, marker);
        //             }
        //         });
        //         map.addOverLay(marker);
        //     });
        // }

        for (let i = 0; i < fanData.length; i++) {
            const point = new T.LngLat(fanData[i].longitude, fanData[i].latitude);
            marker = new T.Marker(point, {
                type: type,
                icon: icon,
                // zIndexOffset: 100,
                info: fanData[i].info ? fanData[i].info : '',
                customKey: key,
            });
            marker.on('click', function ({ type, target, lnglat, containerPoint }) {
                console.log(
                    type,
                    target,
                    lnglat,
                    containerPoint,
                    currentInfo.value,
                    target.options.info,
                );
                // console.log(target.options);
                if (target.options.info) {
                    // currentInfo.value = target.options.info;
                    // onShowWinInfo(target);
                    setWinInfo(target, this);
                }
            });
            map.addOverLay(marker);
            zoom.value = 10.5;
            map.centerAndZoom(new T.LngLat(fanData[i].longitude, fanData[i].latitude), zoom.value);
        }
    };

    // 添加线(要求二维数据)
    const addLine = async (lineData, key, name) => {
        const allMarkers = map.getOverlays();
        allMarkers.length &&
            allMarkers.forEach((item) => {
                if (key) {
                    if (item.options && item.options.customKey === name) {
                        map.removeOverLay(item);
                    }
                } else {
                    if (item.options && item.options.type === 'line') {
                        map.removeOverLay(item);
                    }
                }
            });
        for (let i = 0; i < lineData.length; i++) {
            const subLinePoints = [];
            const element = lineData[i];
            for (let j = 0; j < element.length; j++) {
                const element2 = element[j];
                let sublnglat = new T.LngLat(element2[0], element2[1]);
                subLinePoints.push(sublnglat);
            }
            let line = new T.Polyline(subLinePoints, {
                color: '#FF8411',
                weight: 2,
                opacity: 1,
                fillColor: '#FF8411',
                fillOpacity: 0.1,
                type: 'line',
                customKey: name
            });
            map.addOverLay(line);
        }
        console.log(lineData);
        zoom.value = 14;
        lineData.length &&
            map.centerAndZoom(new T.LngLat(lineData[0][0][0], lineData[0][0][1]), zoom.value);
    };

    const onInitMap = async () => {
        map = new T.Map('tianditu', {
            maxZoom: 18,
            minZoom: 1,
        });
        map.centerAndZoom(new T.LngLat(104.40769, 37.19945), zoom.value);
        map.enableScrollWheelZoom();
        // 矢量地形底图
        let imageURL1 =
            'https://t0.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=' +
            tdKey;
        let lay1 = new T.TileLayer(imageURL1, { minZoom: 1, maxZoom: 30 });
        // 矢量标注图
        let imageURL2 =
            'https://t0.tianditu.gov.cn/cia_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=' +
            tdKey;
        let lay2 = new T.TileLayer.TDT(imageURL2, { minZoom: 1, maxZoom: 30 });
        map.addLayer(lay1);
        map.addLayer(lay2);
        // console.log('map', map);
        if (map) {
            zoom.value = map['KW'][Object.keys(map['KW'])[0]]['Ce']['zoom'];
        }
    };
    const formatPolygonData = (data) => {
        // console.log(data);
        const result = [];
        data &&
            data.length &&
            data.map((ele, eleIndex) => {
                result[eleIndex] = [];
                ele.map((p) => {
                    result[eleIndex].push(new T.LngLat(p[1], p[0]));
                });
            });
        return result;
    };

    // 地图可视范围变化需要检测渲染
    const resizeMapView = () => {
        // console.log('resizeMapView');
        setTimeout(() => {
            map.checkResize();
        }, 100);
    };
    // 手动地图缩放
    const zoomMap = (zoomType) => {
        if (zoomType) {
            if (zoomType > 0) {
                map.zoomIn();
            } else if (zoomType < 0) {
                map.zoomOut();
            }
        } else {
            map.setZoom(zoom.value);
        }
    };
    // 显示隐藏坐标点
    const controlShowHidden = ({ type, isShow }) => {
        const allMarkers = map.getOverlays();
        const formatMarkers = [];
        allMarkers.length &&
            allMarkers.forEach((item) => {
                if (item.options && item.options.type === type) {
                    formatMarkers.push(item);
                    isShow ? item.show() : item.hide();
                }
            });
    };
    onMounted(() => {
        nextTick(() => {
            onInitMap();
            document.getElementsByClassName('tdt-control-container')[0].style.display = 'none';
            // uploadPoint 更新场区  uploadFan 更新风机 uploadTower 更新测风塔 uploadAvoid 更新避让点 uploadBooster 更新升压站 uploadMeteorological 更新气象站 uploadSubStation 更新变电站
            eventBus.on('uploadPoint', (data) => {
                console.log(data, '事件传过来的场区data');
                data && addPolygon(data, 'point');
            });
            eventBus.on('uploadFan', (data) => {
                console.log(data, '事件传过来的风机data');
                data && addMarkerFan(data, 'fan');
            });
            eventBus.on('uploadFan1', (data) => {
                console.log(data, '事件传过来的备选风机data');
                data && addMarkerFan(data, 'fan1');
            });
            eventBus.on('uploadTower', (data) => {
                console.log(data, '事件传过来的测风塔data');
                data && addMarkerFan(data, 'tower');
            });
            eventBus.on('uploadTower1', (data) => {
                console.log(data, '事件传过来的中尺度data');
                data && addMarkerFan(data, 'tower1');
            });
            eventBus.on('uploadSubStation', (data) => {
                console.log(data, '事件传过来的变电站data');
                data && addMarkerFan(data, 'subStation');
            });
            eventBus.on('uploadAvoid', ({ data, type, name }) => {
                console.log(data, '事件传过来的避让data', type, name);
                // data && addGeoJsonData(data, type);
            });
            eventBus.on('setFanInfo', (label) => {
                label && getSelectFanToWinInfo(label);
            });
            eventBus.on('updateShowHidden', ({ type, isShow }) => {
                console.log('事件传过来更新显示隐藏装填type', type);
                type && controlShowHidden({ type, isShow });
            });
            eventBus.on('uploadLine', ({data, name}) => {
                console.log('事件传过来的line数据');
                data && addLine(data, 'line', name);
            });
            eventBus.on('uploadFanPolygon', (data) => {
                console.log(data, '事件传过来的风机多边形data');
                data && addPolygon(data, 'fanPolygon');
            });
            eventBus.on('uploadBooster', (data) => {
                console.log(data, '事件传过来的升压站data');
                data && addMarkerFan(data.data, 'booster', data.key);
            });
            eventBus.on('uploadBoosterPolygon', (data) => {
                console.log(data, '事件传过来的升压站多边形data', data.key);
                data && addPolygon(data.data, 'boosterPolygon', data.key);
            });
        });
    });
    onBeforeUnmount(() => {
        if (map) {
            console.log('地图销毁');
            map = null;
            const parentEle = document.getElementsByClassName('tdMap-template')[0];
            const childEle = document.getElementById('tianditu');
            if (parentEle && childEle) {
                parentEle.removeChild(childEle);
            }
            // 手动添加子节点进来
            const childEleAdd = document.createElement('div');
            childEleAdd.id = 'tianditu';
            childEleAdd.style.width = '100%';
            childEleAdd.style.height = `100%`;
            parentEle.appendChild(childEleAdd);
        }
        eventBus.off('uploadPoint');
        eventBus.off('uploadFan');
        eventBus.off('uploadFan1');
        eventBus.off('uploadBooster');
        eventBus.off('uploadTower');
        eventBus.off('uploadTower1');
        eventBus.off('uploadSubStation');
        eventBus.off('uploadAvoid');
        eventBus.off('setFanInfo');
        eventBus.off('updateShowHidden');
        eventBus.off('uploadLine');
        eventBus.off('uploadFanPolygon');
        eventBus.off('uploadBoosterPolygon');
    });
    defineExpose({
        resizeMapView,
        zoomMap,
    });
</script>
<style scoped lang="scss">
    .tdMap-template {
        position: relative;
    }
</style>
