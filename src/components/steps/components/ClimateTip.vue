<template>
   <ul class="climate-tip">
        <li>1、距离风电场现场最近气象站的基本描述，包括建站时间、仪器情况、测风仪器变更及安装高度变更记录、站址变迁记录、气象站所在地的经纬度及海拔高度。</li>
        <li> 2、气象站基本气象参数，包括累年平均气温，月平均最高、最低气温，极端最高、最低气温及持续小时数，累年平均气压、相对湿度、水汽压，累年平均降水量、蒸发量、日照小时数，累年平均冰雹、雷电次数、结冰期、积雪、沙尘、温度低于-20℃、-25℃、-30℃的天数统计等，气象站累年的各个风向百分比统计。</li>
        <li> 3、气象站近30年各年及各月平均风速资料。</li>
        <li> 4、气象站测风仪器变更后对比观测年份人工站和自动站的月平均风速各为多少；</li>
        <li> 5、气象站建站至今历年最低气温和大风（最大风速与风向）统计。</li>
        <li> 6、气象站关于该地区灾害性天气记录。</li>
    </ul>
</template>

<style scoped lang='scss'>
.climate-tip  {
    width: 402px;
    height: 232px;
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