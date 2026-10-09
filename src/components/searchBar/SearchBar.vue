<template>
    <div
        class="search-bar"
        :class="showMore ? 'search-bar-more' : ''"
        @keyup.enter="emits('handleSearch', props.searchKey)"
    >
        <div class="search-content" ref="searchCont">
            <slot></slot>
        </div>
        <div class="search-handle-group" >
            <span v-if="showMoreKey" @click="showMore = !showMore" class="icon-up">
                <iconpark-icon
                    size="8"
                    class="aaa"
                    :style="{ transform: 'rotate(' + (showMore ? 180 : 0) + 'deg)' }"
                    :size="10"
                    name="baisexiala"
                ></iconpark-icon>
            </span>
            <a-button type="primary" @click="emits('handleSearch')">搜索</a-button>
            <i @click="emits('resetSearch', {})">重置</i>
        </div>
    </div>
</template>
<style scoped lang="scss">
    .search-bar {
        display: flex;
        align-items: flex-start;
        height: 48px;
        // overflow: hidden;
        div {
            &.search-content {
                flex: 1;
            }
            &.search-handle-group {
                flex: none;
                display: flex;
                align-items: center;
                justify-content: flex-end;
                .icon-up {
                    margin-right: 8px;
                }
                button {
                    margin: 0 16px;
                }
                i {
                    letter-spacing: 2px;
                    cursor: pointer;
                    font-style: normal;
                }
                :deep(.ant-btn-primary) {
                    box-shadow: none;
                }
            }
            > span {
                width: 14px;
                height: 14px;
                border-radius: 100%;
                background: #036b64;
                color: #ffffff;
                font-size: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                .aaa {
                    color: #fff;
                }
            }
        }
    }
    .search-bar-more {
        height: auto;
    }
    :deep(.ant-input) {
        // width: 140px !important;
        // margin: 0 10px 10px 0 !important;
    }
</style>
<script setup>
    import { ref, onMounted } from 'vue';
    const emits = defineEmits(['handleSearch', 'resetSearch']);
    const props = defineProps({
        searchKey: {
            type: Object,
            default: () => {
                return {};
            },
        },
    });
    const searchCont = ref();
    let showMore = ref(false);
    let showMoreKey = ref();
    onMounted(() => {
        showMoreKey.value = searchCont.value.offsetHeight > 50;
        const screenWidth = ref(
            window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
        );
        window.onresize = () => {
            showMoreKey.value = searchCont.value.offsetHeight > 50;
        };
    });
</script>
