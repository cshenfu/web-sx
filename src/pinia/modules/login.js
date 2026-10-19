import { defineStore } from 'pinia'
import piniaPersistConfig from "@/utils/persist"
const useUserStore = defineStore('user', {
    state: () => ({
        firstName: 'Liu',
        lastName: 'Dehua',
        accessToken: '',
        refreshToken: ''
    }),
    getters: {
        fullName() {
            return this.firstName + ' ' + this.lastName
        }
    },
    persist: piniaPersistConfig('user', ['lastName'])
})
export default useUserStore