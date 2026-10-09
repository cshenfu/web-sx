<template>
    <div>
        <router-view v-slot="{ Component }">
            <keep-alive :include="['climateList']">
                <component :is="Component" />
            </keep-alive>
        </router-view>
    </div>
</template>
