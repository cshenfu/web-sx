<script setup>
    import { message } from 'ant-design-vue';
    import zhCN from 'ant-design-vue/es/locale/zh_CN';
    // import copyRight from './components/copyRight/CopyRight.vue';
    import { onBeforeUpdate, onMounted } from 'vue';
    import customerService from '@/components/customerService/customerService.vue';
    import { checkLogIsOpen } from '@/utils/utils.js';
    import dayjs from 'dayjs';
    import 'dayjs/locale/zh-cn';
    dayjs.locale('zh-cn');
    import { setThemeVariables, themes } from '@/utils/theme.js';
    onMounted(() => {
        setThemeVariables(themes.dark);
        // checkLogIsOpen();
        // document.addEventListener('keydown', function(event){
        //   return 123 != event.keyCode || (event.returnValue = false)
        // });
        // document.addEventListener('contextmenu', function(event){
        //   return event.returnValue = false
        // })
    });
    // onBeforeUpdate(()=> {
    //   //
    //   checkLogIsOpen()
    // })
    // checkLogIsOpen()
</script>

<template>
    <router-view></router-view>
    <!-- <copyRight></copyRight> -->
    <customerService></customerService>
</template>

<style scoped>
    .logo {
        height: 6em;
        padding: 1.5em;
        will-change: filter;
        transition: filter 300ms;
    }
    .logo:hover {
        filter: drop-shadow(0 0 2em #646cffaa);
    }
    .logo.vue:hover {
        filter: drop-shadow(0 0 2em #42b883aa);
    }
</style>
