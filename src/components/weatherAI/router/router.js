import { createRouter, createWebHistory } from 'vue-router';
import { routes } from '@/router/config';

const routers = createRouter({
    history: createWebHistory('/'),
    routes: routes,
});
routers.beforeEach((to, from, next) => {
    next();
});
export default routers;
