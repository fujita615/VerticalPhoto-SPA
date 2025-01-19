import { useStore } from 'vuex'
import { useForm } from './UseForm'
import { computed } from 'vue'

//form操作用のcompositionメソッド
export const useAuth = () => {
    const store = useStore()
    const { reset } = useForm()
    //ログイン中か(true)否(false)かを表す
    const isLogin = computed(() => {
        return store.getters['auth/check']
    })
    //APIサーバーから返却された通信の成功(true)/失敗(false)を表すflg
    const apiStatusFlg = computed(() => {
        return store.state.auth.apiStatus
    })

    //APIサーバーから返却されたエラーメッセージを表示
    const Errors = computed(() => {
        if (store.getters['auth/getloginErrorMessage']) {
            return store.getters['auth/getloginErrorMessage']
        } else if (store.getters['auth/getRegisterErrorMessage']) {
            return store.getters['auth/getRegisterErrorMessage']
        } else {
            return {}
        }
    })

    //ログインエラーメッセージ/バリデーションメッセージを空にしてフォームを初期化するメソッド
    const authReset = (...items) => {
        reset(...items)
        if (store.getters['auth/getloginErrorMessage']) {
            store.dispatch('auth/loginErrorMessageClear')
        } else if (store.getters['auth/getRegisterErrorMessage']) {
            store.dispatch('auth/registerErrorMessageClear')
        }
    }

    return {
        authReset,
        isLogin,
        apiStatusFlg,
        Errors
    }
}
