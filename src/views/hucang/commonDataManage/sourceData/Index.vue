<template>
    <div>
        <router-view v-slot="{ Component }">
            <keep-alive :include="[]">
                <component :is="Component" />
            </keep-alive>
        </router-view>
    </div>
</template>