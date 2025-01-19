//各form/Dialogの状態を保存
export default {
    namespaced: true,
    state: {
        showPhotoForm: false,
        showContactForm: false,
        mailSituation: 'edit', //contactフォームのメール送信状況
        welcomeFlg: false
    },
    mutations: {
        setShowPhotoForm(state) {
            state.showPhotoForm = !state.showPhotoForm
        },
        setShowContactForm(state) {
            state.showContactForm = !state.showContactForm
        },
        setMailSituation(state, situation) {
            state.mailSituation = situation
        },
        setWelcomeFlg(state) {
            state.welcomeFlg = !state.welcomeFlg
        }
    }
}
