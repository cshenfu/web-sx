import { defineStore } from 'pinia'
import piniaPersistConfig from "@/utils/persist"
const useAreaDataStore = defineStore('area', {
    state: () => ({
        areaArr:[],
        allDataCount:{
            
        }
    }),
})
export default useAreaDataStore