import { defineStore } from 'pinia'
const usefieldFanDataStore = defineStore('fieldFan', {
    state: () => ({
        pointData: [], // 场区拐点数据，（文件解析或手动录入）
        pointFile: [], // 拐点文件数据
        fanFile: [], // 风机文件数据
        boosterFile: [], // 升压站文件数据
        uniqueIdentificationUUID: '', // 场区和风机建立联系的唯一标识
        fanDisabled: true, // 风机文件上传是否禁用
    }),
})
export default usefieldFanDataStore




// "40.367533"

// "118.617985"