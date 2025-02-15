import { defineStore, storeToRefs } from 'pinia'
import { ref, computed } from 'vue'

const useMessage = defineStore('Message', () => {
    const alert = ref<string>('') //注意メッセージ
    const success = ref<string>('') //処理成功メッセージ
    const checkAlert = computed((): boolean => {
        if (alert.value !== '') {
            return true
        } else {
            return false
        }
    })
    const checkSuccess = computed((): boolean => {
        if (success.value !== '') {
            return true
        } else {
            return false
        }
    })

    //messageをtimeout秒だけstateに代入するメソッド(デフォルトは3秒)
    function setAlert(message: string, timeout = 3000) {
        alert.value = message
        setTimeout(() => (alert.value = ''), timeout)
    }
    function setSuccess(message: string, timeout = 3000) {
        success.value = message
        setTimeout(() => (success.value = ''), timeout)
    }
    const messageCheck = computed((): string => {
        if (alert.value) {
            return alert.value
        } else if (success.value) {
            return success.value
        } else {
            return ''
        }
    })
    return {
        alert,
        success,
        checkAlert,
        checkSuccess,
        setAlert,
        setSuccess,
        messageCheck
    }
})
export default () => {
    const messageState = useMessage()
    return { ...messageState, ...storeToRefs(messageState) }
}
