<template>
    <div class="search-bar" :class="showMore ? 'search-bar-more' : ''" @keyup.enter="emits('searchResult', props.searchKey)">
        <div class="search-content" ref="searchCont">
            <slot></slot>
        </div>
        <div class="search-handle-group">
            <span v-if="showMoreKey" @click="showMore = !showMore" class="icon-up">
                <iconpark-icon
                    size="8"
                    class="aaa"
                    :style="{ transform: 'rotate(' + (showMore ? 180 : 0) + 'deg)'}"
                    :size="10"
                    name="xiala"
                ></iconpark-icon>
            </span>
            <a-button type="primary" @click="emits('handleSearch', props.searchKey)">搜索</a-button>
            <a-button class="rest-btn"  @click="emits('resetSearch')">重置</a-button>
            <!-- <p @click="emits('resetSearch', {})">重置</p> -->
        </div>
    </div>
</template>
<style scoped lang="scss">
$primary-color: var(--theme);
    .search-bar {
        display: flex;
        align-items: flex-start;
        height: 44px;
        overflow: hidden;
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
                    margin-right: 24px;
                }
                .rest-btn {
                    margin-left: 16px;
                }
                p {
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
                background: $primary-color;
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
            // :deep(.search-item) {
            //     margin-bottom: 12px;
            // }
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
    import { ref, onMounted, onBeforeMount } from 'vue';
    const emits = defineEmits(['handleSearch', 'resetSearch'])
    const props = defineProps({
        searchKey: {
            type: Object,
            default: () => {
                return {}
            }
        }
    })
    const searchCont = ref();
    let showMore = ref(false);
    let showMoreKey = ref();
    // 检测1280，小于默认展开
    const checkWindowInnerWidth = () => {
      window.innerWidth < 1280 ? showMore.value = true : showMore.value = false;
      showMoreKey.value = true;
    }
    onBeforeMount(() => {
        checkWindowInnerWidth();
    })
    onMounted(() => {
        if (searchCont.value) {
            showMoreKey.value = searchCont.value.offsetHeight > 50;
        }
        // const screenWidth = ref(
        //     window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
        // );
        window.onresize = () => {
            searchCont.value && (showMoreKey.value = searchCont.value.offsetHeight > 50);
            checkWindowInnerWidth();
        };
    });
</script>
