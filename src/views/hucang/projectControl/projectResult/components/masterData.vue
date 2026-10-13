<template>
    <div class="master-data-template">
        <ul class="flex-column" v-if="props.masterData.length">
            <li v-for="(item, index) in props.masterData">
                <span>{{ item.data }}</span>
                <p v-html="item.name"></p>
            </li>
        </ul>
    </div>
</template>
<script setup>
import {ref} from 'vue';
const props = defineProps({
    masterData: {
        type: Array,
        default: () => []
    }
});
</script>
<style scoped lang="scss">
.master-data-template{
    width: 284px;
    overflow: auto;
    background: rgba(0,0,0,0.24);
    box-shadow: 0px 0px 14px 0px rgba(255,255,255,0.16);
    border-radius: 0px 0px 4px 4px;
    border-top: 2px solid #24D28F;
    ul{
        margin: 16px 0;
        overflow: auto;
        li{
            width: 50%;
            float: left;
            text-align: center;
            padding: 16px 0;
            &:nth-child(2n + 1) {
                border-right: 1px solid rgba(255,255,255,0.3);
            }
            p{
                font-size: 12px;
                color: #fff;
                line-height: 16px;
            }
            span{
                color: #24D28F;
                line-height: 16px;
                font-size: 20px;
            }
        }
    }
}
</style>