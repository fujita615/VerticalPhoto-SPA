//各form/Dialogの状態を保存
import { defineStore, storeToRefs } from 'pinia'
import { ref } from 'vue'
import type { MailSituation } from '../types'

const useFormTabStore = defineStore('FormTab', () => {
    const welcomeFlg = ref<boolean>(false)
    const showContactFormFlg = ref<boolean>(false)
    const showPhotoFormFlg = ref<boolean>(false)
    const mailSituationFlg = ref<MailSituation>('edit') //メール送信状況
    const navFlg = ref<boolean>(true)

    function setWelcomeFlg() {
        welcomeFlg.value = !welcomeFlg.value
    }

    function setShowPhotoForm() {
        showPhotoFormFlg.value = !showPhotoFormFlg.value
    }
    // お問い合わせフォームを初期化して閉じるメソッド
    function setShowContactForm() {
        showContactFormFlg.value = !showContactFormFlg.value
        setMailSituation('edit')
    }

    function setMailSituation(situation: MailSituation) {
        mailSituationFlg.value = situation
    }

    function showNavFlg() {
        navFlg.value = true
    }
    function hideNavFlg() {
        navFlg.value = false
    }

    return {
        navFlg,
        showNavFlg,
        hideNavFlg,
        setShowContactForm,
        setShowPhotoForm,
        setWelcomeFlg,
        welcomeFlg,
        mailSituationFlg,
        setMailSituation,
        showContactFormFlg,
        showPhotoFormFlg
    }
})
export default () => {
    const FormTabStore = useFormTabStore()
    return { ...FormTabStore, ...storeToRefs(FormTabStore) }
}
