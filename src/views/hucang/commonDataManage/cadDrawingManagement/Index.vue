<template>
    <div>
        <router-view v-slot="{ Component }">
            <keep-alive :include="['CadDrawingManagement']">
                <component :is="Component" />
            </keep-alive>
        </router-view>
        <!-- <router-view></router-view> -->
    </div>
</template>