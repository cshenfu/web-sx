<template>
    <div>
        <router-view v-slot="{ Component }">
            <!-- <keep-alive :include="['CadDrawingManagement']"> -->
            <keep-alive>
                <component :is="Component" />
            </keep-alive>
        </router-view>
    </div>
</template>