export default {
    namespaced: true,
    state: {
        loaderFlg: false, //loader表示・非表示flg
        loaderMessage: '' //メッセージ
    },
    mutations: {
        //loaderの表示非表示を切り替えるメソッド
        setShowLoader(state, flg) {
            state.loaderFlg = flg
        },
        //loader表示中のメッセージを指定するメソッド
        setLoaderMessage(state, message = '') {
            state.loaderMessage = message
        }
    },
    actions: {
        showLoader(context, message) {
            context.commit('setShowLoader', true)
            context.commit('setLoaderMessage', message)
        },
        closeLoader(context) {
            context.commit('setShowLoader', false)
            context.commit('setLoaderMessage', '')
        }
    }
}
