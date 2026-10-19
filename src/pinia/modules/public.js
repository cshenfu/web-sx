import { defineStore } from 'pinia'
import piniaPersistConfig from "@/utils/persist"
const usePublicDataStore = defineStore('publicData', {
    state: () => ({
        headActiveKey: -1,
        createProjectMode: 1, // 1集中式 2分散式
    }),
  
    // persist: piniaPersistConfig('publicData', ['headActiveKey'])
    persist: piniaPersistConfig('publicData', ['createProjectMode'])
})
export default usePublicDataStore