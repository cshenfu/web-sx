<template>
  <div>
    <router-view v-slot="{ Component }">
      <keep-alive :include="['ProjectControlList','LightProjectControlList']">
        <component :is="Component" />
      </keep-alive>
    </router-view>

  </div>
</template>

<script>
import { reactive,toRefs,onBeforeMount,onMounted} from 'vue'
export default {}

</script>
<style scoped>
</style>