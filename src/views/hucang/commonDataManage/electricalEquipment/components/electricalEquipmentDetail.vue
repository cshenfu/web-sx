<template>
    <div class="geology-detail-component">
        <h4 class="content-title">
            <img src="@/assets/img/user/detail-title.png" alt="" />
            基本信息
        </h4>
        <div class="content-body">
            <a-row>
                <a-col :span="8">
                    <span>设备编号</span>
                    <p>{{ params.geologyCode }}</p>
                </a-col>
                <a-col :span="8">
                    <span>设备型号</span>
                    <p>
                        型号
                    </p>
                </a-col>
                <a-col :span="8" v-if="route.query.source == 1">
                    <span>设备类型</span>
                    <p>{{
                        params.suitRange == 1
                            ? '全域通用'
                            : params.suitRange == 2
                              ? '拐点坐标'
                              : '--'
                    }}</p>
                </a-col>
                <a-col :span="8" v-else>
                    <span>额定电压</span>
                    <p>
                        额定电压
                    </p>
                </a-col>
            </a-row>
            <a-row>
                <a-col :span="8" v-if="route.query.source == 1">
                    <span>箱变容量</span>
                    <p> dkdkdkd </p>
                </a-col>
                <a-col :span="8" v-else>
                    <span>额定容量</span>
                    <p> dkdkdkd </p>
                </a-col>
                <a-col :span="8">
                    <span>高压侧额定电压</span>
                    <p> 束带结发 </p>
                </a-col>
                <a-col :span="8">
                    <span>低压侧额定电压</span>
                    <p>
                        220v
                    </p>
                </a-col>
            </a-row>
            <a-row>
                <a-col :span="8">
                    <span>短路抗阻</span>
                    <p> dkdkdkd </p>
                </a-col>
                <a-col :span="8"  v-if="route.query.source == 1">
                    <span>连接组标号</span>
                    <p> 束带结发 </p>
                </a-col>
                <template v-else>
                    <a-col :span="8">
                        <span>接线组别</span>
                        <p> 组别 </p>
                    </a-col>
                    <a-col :span="8">
                        <span>冷却方式</span>
                        <p> 束带结发 </p>
                    </a-col>
                </template>
            </a-row>
        </div>
        <h4 class="content-title">
            <img src="@/assets/img/user/detail-title.png" alt="" />
            其他信息
        </h4>
        <div class="content-body">
            <a-row>
                <a-col :span="24">
                    <span>高低压侧配置</span>
                    <p>{{ params.bearingStratumInfo }}</p>
                </a-col>
            </a-row>
        </div>
        <h4 class="content-title">
            <img src="@/assets/img/user/detail-title.png" alt="" />
            主要日志
        </h4>
        <LogEle></LogEle>
    </div>
</template>
<script setup>
    import LogEle from './Log/Log.vue';
    import { onMounted, ref } from 'vue';
    import { useRoute } from 'vue-router';
    import { getGeologyDetail } from '@/api/modules/geology.js';
    const route = useRoute();
    const params = ref({
        affiliationCodeName: '', // 所属区域name
        affiliationCode: '', // 所属区域code
        geologyCode: '', // 地质数据编号
        suitRange: '', // 数据范围， 1全域通用， 2拐点坐标
        locations: '', // 拐点坐标
        geologyRockSoilRespList: [
            {
                name: '', // 岩土名称
                thickness: '', // 厚度
                // 重力密度
                dynamicCompression: '', // 压缩模量
                cohesion: '', // 凝聚力（内聚力）
                internalFrictionAngle: '', // 摩擦角
                poisson: '', //泊松比
                bearingCapacity: '', // 承载力特征值
            },
        ],
        epa: '', // 场址地震动峰值加速度
        ld: '', // 场址地震基本烈度
        tg: '', // 地震动反应谱特征周期
        siteClassification: '', // 场地类别
        earthquakeGroup: '', // 设计地震分组
        waterSoilErosion: '', // 水土腐蚀性
        handleKeyword: '', // 地基处理关键字 1 岩溶 2 湿陷性黄土
        groundwaterDepth: '', // 地下水埋深
        bearingStratumInfo: '', // 持力层描述
        regionalGeologyInfo: '', // 区域地质信息
        regionalGeologyConditionEvaluation: '', // 场区地质条件与评价
        regionalHydrologyInfo: '', // 区域水文情况
        conclusionEvaluation: '', // 结论评价
        geologyFileRespList: [], // 文件对象
    });
    onMounted(() => {
        onInitGeologyDetail();
    });
    // 初始化地质详情数据
    const onInitGeologyDetail = () => {
        if (route.query.id) {
            getGeologyDetail(route.query.id).then((res) => {
                if (res.code == 200) {
                    params.value = Object.assign(params.value, res.data);
                }
            });
        }
    };
    // 过滤文件
    const filterFile = (fileType, fileData) => {
        // fileType // 1 地形图  2 粗糙度  3 地勘报告  4 拐点坐标
        return fileData.filter((ele) => ele.fileType == fileType);
    };
    // 跳转链接
    const goJump = (path) => {
        console.log(path);
        path && window.open(path, '_blank');
    };
</script>
<style scoped lang="scss">
    $primary-color: #036b64;
  @import '@/assets/css/detail.scss';
    .geology-detail-component {
        background: #ffffff;
        padding: 24px;
        .text-field {
            margin-bottom: 20px;
        }
    }
</style>
