<template>
    <ul class="climate-tip">
        <li v-html="rawHtml"></li>
    </ul>
</template>
<script setup>
    const rawHtml = `中尺度数据主要用于测风塔数据插补订正，目前支持ERA5数据，至少满足30年数据，风速层高度需满足100m =< height <= 200m。请使用数据模板格式上传数据。如果暂无，系统会自动使用平台ERA5数据`
</script>
<style scoped lang='scss'>
.climate-tip  {
    width: 320px;
    height: auto;
    overflow-x: auto;
    padding: 0 14px 0 5px;
    text-align: justify;
&::-webkit-scrollbar {
    width: 6px; /* 设置滚动条宽度 */
}
&::-webkit-scrollbar-button {
    display: none; /* 隐藏滚动条两侧按钮 */
}
/* 滑道部分 */
&::-webkit-scrollbar-track {
    background: transparent;
}
/* 滑块部分 */
&::-webkit-scrollbar-thumb {
    background-color: #DEE1EA; /* 设置滑块背景色 */
    border-radius: 4px; /* 设置滑块边角半径 */
}
 
/* 当悬停时显示的效果 */
&::-webkit-scrollbar-thumb:hover {
    background-color: #DEE1EA; /* 设置滑块悬停时的背景色 */
}
}
</style>