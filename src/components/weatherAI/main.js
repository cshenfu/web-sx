import {createApp} from 'vue'
import App from './App.vue'
import pinia from '@/pinia'

import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import '@/assets/css/rest.scss';
import '@/assets/css/global.scss';
import router from '@/router/router.js';

const app = createApp(App);
import loadings from '@/directive/loading.js'
import softDog from '@/directive/softDog.js'
// loading自定义指令
app.directive('loading', loadings)
app.directive('softDog', softDog)
// 路由拦截功能
router.beforeEach((to, from, next) => {
    next();
})
app.use(Antd).use(pinia).use(router).mount('#app');