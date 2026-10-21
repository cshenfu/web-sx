<template>
    <div class="generator-meter-template">
        <ul>
            <li>
                <span v-for="th in dataIndexThArr" v-html="th.name"></span>
            </li>
        </ul>
        <ul class="generator-meter-ul">
            <li v-for="(data, dataIndex) in props.powerData" @click="activeIndex = activeIndex == dataIndex ? null : dataIndex, emitFanInfo(activeIndex)" :class="activeIndex == dataIndex ? 'activeLi' : ''">
                <span v-for="th in dataIndexThArr">
                    {{ data[th.dataIndex] }}
                </span>
            </li>
        </ul>
    </div>
</template>
<style scoped lang="scss">
    .generator-meter-template {
        padding: 16px;
        ul {
            color: #363B4D;
            font-size: 12px;
            font-weight: 500;
            &:first-child {
                background: #F2F7F7;
            }
            &:last-child {
                max-height: calc(100% - 60px);
                overflow: auto;
            }
            li {
                display: flex;
                border-top: 1px solid #e4e6ee;
                cursor: pointer;
                &.activeLi{
                    background: #E4EFEF;
                    color: #036B64;
                    font-weight: 500;
                }
                span {
                    flex: none;
                    width: 60px;
                    border-left: 1px solid #e4e6ee;
                    padding: 10px 0 10px 12px;
                    display: flex;
                    align-items: center;
                    &:last-child {
                        border-right: 1px solid #e4e6ee;
                    }
                    &:nth-child(2) {
                        width: 80px;
                    }
                    &:nth-child(3) {
                        width: 75px;
                    }
                    &:nth-child(5) {
                        width: 90px;
                    }
                    &:nth-child(6) {
                        width: 90px;
                    }
                    &:nth-child(7) {
                        width: 80px;
                    }
                }
            }
            &:last-child {
                border-bottom: 1px solid #e4e6ee;
            }
        }
    }
</style>
<script setup>
    import { ref, onMounted, onBeforeUnmount } from 'vue';
    import eventBus from '@/utils/eventBus';
    const props = defineProps({
        powerData: {
            type: Array,
            default: () => [],
        },
    });
    const activeIndex = ref();
    const dataIndexThArr = ref([
        {
            name: '标签',
            dataIndex: 'label',
        },
        {
            name: 'X',
            dataIndex: 'x',
        },
        {
            name: 'Y',
            dataIndex: 'y',
        },
        {
            name: 'Z',
            dataIndex: 'z',
        },
        {
            name: '年上网电量<br/>(万kwh)',
            dataIndex: 'yearPower',
        },
        {
            name: '满发小时数<br/>(h)',
            dataIndex: 'fullPowerHours',
        },
        {
            name: '平均风速<br/>(m/s)',
            dataIndex: 'avgWindSpeed',
        },
    ]);
    const updateActiveIndex = (value) => {
        const index = props.powerData.findIndex(ele => ele.label == value);
        if (index > -1) {
            activeIndex.value = index;
            document.getElementsByClassName('generator-meter-ul')[0].scrollTop = index * 40;
        }
    }
    const emitFanInfo = (index) => {
        eventBus.emit('setFanInfo', props.powerData[index]['label']);
    }
    onMounted(() => {
        eventBus.on('setWinInfo', updateActiveIndex)
    })
    onBeforeUnmount(() => {
        eventBus.off('setWinInfo', updateActiveIndex)
    })
</script>
