import { defineStore, storeToRefs } from 'pinia'
import { ref } from 'vue'

const useErrorStore = defineStore('error', () => {
    const code = ref<number | null>()
    function setCode(httpStatus: number | null) {
        code.value = httpStatus
    }
    return { code, setCode }
})
export default () => {
    const ErrorStore = useErrorStore()
    return { ...ErrorStore, ...storeToRefs(ErrorStore) }
}
