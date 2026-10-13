<template>
    <div class="project-progress-components">
        <div class="progress-title-template">
                <div class="progress-title">
                    <div class="progress-title-left">
                        <iconpark-icon size="24" name="jindu"></iconpark-icon>
                        关键节点计算情况
                    </div>
                    <div class="progress-title-right">
                        <span>
                            <iconpark-icon name="shijian"></iconpark-icon>
                            累计用时：2h28m
                        </span>
                        <span>排队用时：2h28m</span>
                        <span>计算用时：2h28m</span>
                    </div>
                </div>
                <ul class="progress-content">
                    <li v-for="(item,itemIndex) in progressData" :key="itemIndex">
                        <div class="progress-content-title">
                            {{item.title}}
                        </div>
                        <div class="progress-content-list">
                            <div :class="getClassName[subItem['state']]" v-for="(subItem,subItemIndex) in item.list || []" :key="subItemIndex">
                                <header>
                                    {{ subItem.title }}
                                </header>
                                <p>
                                    <span>预：{{ subItem.total }}</span>
                                    <span>用：{{ subItem.current }}</span>
                                </p>
                            </div>
                        </div>
                    </li>
                </ul>
        </div>
    </div>
</template>
<style scoped lang="scss">
    .project-progress-components {
        background: #ffffff;
        padding: 24px;
        height: calc(100vh - 120px);
    }

    .progress-title-template{
        .progress-title{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            .progress-title-left{
                display: flex;
                align-items: center;
                font-size: 16px;
                font-weight: 600;
                iconpark-icon{
                        margin-right: 12px;
                    }
            }
            .progress-title-right{
                display: flex;

                >span{
                    margin-left: 24px;
                    display: flex;
                    align-items: center;
                    iconpark-icon{
                        margin-right: 4px;
                    }
                }
            }
        }
        .progress-content{
            height: calc(100vh - 210px);
            overflow: auto;
            li {
                display: flex;
                justify-content: flex-start;
                margin-bottom: 24px;
                align-items: center;
                div{
                    flex: 1;
                    background-color: #F7F7F8;
                    &.progress-content-title{
                        flex: none;
                        width: 100px;
                        text-align: left;
                        background-color: transparent;
                        font-weight: bold;
                    }
                    &.progress-content-list{
                        display: flex;
                        flex-wrap: wrap;
                        padding: 10px;
                        >div{
                            font-size: 12px;
                            flex: none;
                            width: 120px;
                            background: linear-gradient(90deg, #3fafa8 0%, #036b64 100%);
                            border-radius: 4px;
                            margin: 10px;
                            padding: 4px 0px;
                            height: 65px;
                            border: 1px solid #6CB5B0;
                            font-weight: 500; 
                            >header{
                                height: 32px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                text-align: center;
                                padding: 0 8px;
                            }
                            p{
                                height: 24px;
                                line-height: 26px;
                                border-top: 1px solid #fff;
                                display: flex;
                                justify-content: center;
                                >span{
                                    margin: 0 6px;
                                }
                            }
                            &.finished {
                                color: #036B64;
                                border-color: #6CB5B0;
                                background: #CCEDEB;
                                p{
                                    border-color: #BDDEDC;
                                }
                            }
                            &.progress {
                                color: #FF8411;
                                border-color: #fac18a;
                                background: #F4E8D6;
                                p{
                                    border-color: #E8D5BA;
                                }
                            }
                            &.pending {
                                background: #ffffff;
                                color: #363b4d;
                                border-color: #ffffff;
                                p{
                                    border-color: #EFEFEF;
                                }
                            }
                            &.noallow {
                                background: #eeeff2;
                                color: #7c8294;
                            }
                        }
                    }
                }
                
            }
        }
    }
</style>
<script setup>
    import { reactive } from 'vue';

    const data = reactive([
        [
            {
                title: '中尺度数据<br/>爬取',
                state: 1, // 1已完成步骤 2进行中步骤 3未开始步骤 4不执行步骤
                planTime: 150,
                currentTime: 50,
                finishTime: 3,
            },
            {
                title: '百度百科数据<br/>爬取',
                state: 2, // 1已完成步骤 2进行中步骤 3未开始步骤 4不执行步骤
                planTime: 150,
                currentTime: 50,
                finishTime: 3,
            },
            {
                title: '环评数据 解析',
                state: 3, // 1已完成步骤 2进行中步骤 3未开始步骤 4不执行步骤
                planTime: 150,
                currentTime: 50,
                finishTime: 3,
            },
            {
                title: '水保数据 解析',
                state: 4, // 1已完成步骤 2进行中步骤 3未开始步骤 4不执行步骤
                planTime: 150,
                currentTime: 50,
                finishTime: 3,
            },
            {
                title: '电网现状数据 解析',
                state: 4, // 1已完成步骤 2进行中步骤 3未开始步骤 4不执行步骤
                planTime: 150,
                currentTime: 50,
                finishTime: 3,
            },
            {
                title: '气象数据<br/>解析',
                state: 1, // 1已完成步骤 2进行中步骤 3未开始步骤 4不执行步骤
                planTime: 150,
                currentTime: 50,
                finishTime: 3,
            },
        ],
        [
            {
                title: '中尺度数据<br/>解析',
                state: 1, // 1已完成步骤 2进行中步骤 3未开始步骤 4不执行步骤
                planTime: 150,
                currentTime: 50,
                finishTime: 3,
            },
            {
                title: '测风塔数据<br/>解析',
                state: 1, // 1已完成步骤 2进行中步骤 3未开始步骤 4不执行步骤
                planTime: 150,
                currentTime: 50,
                finishTime: 3,
            },
            {
                title: '地形图数据<br/>处理',
                state: 1, // 1已完成步骤 2进行中步骤 3未开始步骤 4不执行步骤
                planTime: 150,
                currentTime: 50,
                finishTime: 3,
            },
            {
                title: '接入系统<br/>数据解析',
                state: 1, // 1已完成步骤 2进行中步骤 3未开始步骤 4不执行步骤
                planTime: 150,
                currentTime: 50,
                finishTime: 3,
            },
            {
                title: '地勘报告<br/>数据解析',
                state: 1, // 1已完成步骤 2进行中步骤 3未开始步骤 4不执行步骤
                planTime: 150,
                currentTime: 50,
                finishTime: 3,
            },
        ],
        [
            {
                title: '资源评价<br/>计算',
                state: 1, // 1已完成步骤 2进行中步骤 3未开始步骤 4不执行步骤
                planTime: 150,
                currentTime: 50,
                finishTime: 3,
            },
            {
                title: '流场计算',
                state: 1, // 1已完成步骤 2进行中步骤 3未开始步骤 4不执行步骤
                planTime: 150,
                currentTime: 50,
                finishTime: 3,
            },
            {
                title: '发电量计算',
                state: 1, // 1已完成步骤 2进行中步骤 3未开始步骤 4不执行步骤
                planTime: 150,
                currentTime: 50,
                finishTime: 3,
            },
            {
                title: '土建基础',
                state: 1, // 1已完成步骤 2进行中步骤 3未开始步骤 4不执行步骤
                planTime: 150,
                currentTime: 50,
                finishTime: 3,
            },
        ],
        [
            {
                title: '道路线路<br/>规划计算api',
                state: 1, // 1已完成步骤 2进行中步骤 3未开始步骤 4不执行步骤
                planTime: 150,
                currentTime: 50,
                finishTime: 3,
            },
            {
                title: '电气设计 计算',
                state: 1, // 1已完成步骤 2进行中步骤 3未开始步骤 4不执行步骤
                planTime: 150,
                currentTime: 50,
                finishTime: 3,
            },
            {
                title: '土建计算',
                state: 1, // 1已完成步骤 2进行中步骤 3未开始步骤 4不执行步骤
                planTime: 150,
                currentTime: 50,
                finishTime: 3,
            },
        ],
        [
            {
                title: '经济概算',
                state: 1, // 1已完成步骤 2进行中步骤 3未开始步骤 4不执行步骤
                planTime: 150,
                currentTime: 50,
                finishTime: 3,
            },
            {
                title: '财务评价',
                state: 1, // 1已完成步骤 2进行中步骤 3未开始步骤 4不执行步骤
                planTime: 150,
                currentTime: 50,
                finishTime: 3,
            },
        ],
        [
            {
                title: '文档生成',
                state: 1, // 1已完成步骤 2进行中步骤 3未开始步骤 4不执行步骤
                planTime: 150,
                currentTime: 50,
                finishTime: 3,
            },
        ],
    ]);
    const getClassName = reactive({
        1: 'finished',
        2: 'progress',
        3: 'pending',
        4: 'noallow',
    });
    const progressData = reactive([{
        title: '基础数据',
        list: [{
            title: '百科数据生成',
            total: 12,
            current: 6,
            state: 1
        }]
    },{
        title: '风资源评价',
        list: [{
            title: '中尺度数据获取',
            total: 12,
            current: 6,
            state: 1
        },{
            title: '中尺度数据解析',
            total: 12,
            current: 6,
            state: 1
        },{
            title: '测风塔数据插补订正',
            total: 12,
            current: 6,
            state: 1
        },{
            title: '测风塔数据插补订正',
            total: 12,
            current: 6,
            state: 1
        },{
            title: '测风塔数据插补订正',
            total: 12,
            current: 6,
            state: 1
        },{
            title: '测风塔数据插补都快放假订正',
            total: 12,
            current: 6,
            state: 1
        },{
            title: '测风塔数据插补订正',
            total: 12,
            current: 6,
            state: 1
        },{
            title: '测风塔数据插补订正',
            total: 12,
            current: 6,
            state: 1
        },{
            title: '测风塔数据插补订正',
            total: 12,
            current: 6,
            state: 3
        },{
            title: '测风塔数据插补订正',
            total: 12,
            current: 6,
            state: 1
        },{
            title: '测风塔数据插补订正',
            total: 12,
            current: 6,
            state: 2
        },{
            title: '测风塔数据插补订正',
            total: 12,
            current: '-',
            state: 3
        }]
    },{
        title: '风机基础',
        list: [{
            title: '地勘报告数据解析',
            total: 12,
            current: 6,
            state: 1
        }]
    },{
        title: '道路线路',
        list: [{
            title: '地勘报告数据解析',
            total: 12,
            current: 6,
            state: 1
        }]
    },{
        title: '技经概算',
        list: [{
            title: '地勘报告数据解析',
            total: 12,
            current: 6,
            state: 1
        }]
    },{
        title: '财务评价',
        list: [{
            title: '地勘报告数据解析',
            total: 12,
            current: 6,
            state: 1
        },{
            title: '地勘报告数据解析',
            total: 12,
            current: 6,
            state: 1
        },{
            title: '地勘报告数据解析',
            total: 12,
            current: 6,
            state: 1
        },{
            title: '地勘报告数据解析',
            total: 12,
            current: 6,
            state: 1
        }]
    },{
        title: '文档生成',
        list: [{
            title: '地勘报告数据解析',
            total: 12,
            current: 6,
            state: 1
        }]
    },])
</script>
